
const db = require("../models");
const Draft = db.draft;
const DraftType = db.draft_type;
const DraftCategory = db.draft_category;
const User = db.user;
const { generatePetition } = require("../utils/draftGenerators/aiPetitionGenerator");
const { generateVakkalath } = require("../utils/draftGenerators/vakkalathGenerator");
const { generatePdfFromHtml } = require("../utils/draftGenerators/pdfGenerator");
const path = require("path");
const fs = require("fs");

// Create and Save a new Draft
exports.createDraft = async (req, res) => {
    try {
        const {
            clientIds,
            accusedDetails,
            courtId,
            draftTypeId,
            draftCategoryId,
            advocateIds,
            primaryAdvocateId,
            relevantActsAndSections,
            party1Label,
            party2Label,
            keyPoints,
            petitionType,
            clientParty,
            caseNumberDetails,
            fee,
            witnesses,
            executionDate,
            representedBy,
            case_id
        } = req.body;

        const userId = req.userId;

        // Fetch draft type name
        const draftType = await DraftType.findByPk(draftTypeId);
        if (!draftType) return res.status(404).send({ message: "Draft Type not found." });

        const draftCategory = draftCategoryId ? await DraftCategory.findByPk(draftCategoryId) : null;

        // Fetch full objects needed by generators
        const clients = await db.client.findAll({
            where: { id: clientIds || [] }
        });

        const court = await db.court.findByPk(courtId);
        if (!court) return res.status(404).send({ message: "Court not found." });

        const advocate = await User.findByPk(primaryAdvocateId || userId);
        if (!advocate) return res.status(404).send({ message: "Primary Advocate not found." });

        // Ensure mandatory arrays/objects exist for generators
        const safeCaseNumberDetails = Array.isArray(caseNumberDetails) ? caseNumberDetails : [];
        const safeAccusedDetails = Array.isArray(accusedDetails) ? accusedDetails : [];
        const safeWitnesses = Array.isArray(witnesses) ? witnesses : [];
        const safeKeyPoints = Array.isArray(keyPoints) ? keyPoints : [];
        const safeRelevantActsAndSections = Array.isArray(relevantActsAndSections) ? relevantActsAndSections : [];

        let generatedContent;
        if (draftType.name.toLowerCase().includes("petition")) {
            generatedContent = await generatePetition({
                client: clients || [],
                accusedDetails: safeAccusedDetails,
                court: court || {},
                relevantActsAndSections: safeRelevantActsAndSections,
                party1Label: party1Label || "Party 1",
                party2Label: party2Label || "Party 2",
                keyPoints: safeKeyPoints,
                advocateDetails: advocate || {},
                draftTypeName: draftType.name || "Petition",
                draftCategoryName: draftCategory ? draftCategory.name : "Legal",
                petitionType: petitionType || "Petition",
                clientParty: clientParty || "party1Label",
                caseNumberDetails: safeCaseNumberDetails,
                fee: fee || 0
            });
        } else if (draftType.name.toLowerCase().includes("vakalath") || draftType.name.toLowerCase().includes("vakkalath")) {
            generatedContent = await generateVakkalath({
                clients: clients || [],
                accusedDetails: safeAccusedDetails,
                court: court || {},
                caseNumberDetails: safeCaseNumberDetails,
                fee: fee || 0,
                clientParty: clientParty || "party1Label",
                executionDate: executionDate || new Date().toISOString(),
                witnesses: safeWitnesses,
                advocateDetails: advocate || {},
                party1Label: party1Label || "Petitioner",
                party2Label: party2Label || "Respondent",
                representedBy: representedBy || ""
            });
        } else {
            // Default empty or generic
            generatedContent = { htmlTemplate: "<h1>Draft Generated</h1>", firstPageTemplate: "" };
        }

        const draft = await Draft.create({
            clientIds: clientIds || [],
            accusedDetails: safeAccusedDetails,
            courtId: courtId,
            caseNumberDetails: safeCaseNumberDetails,
            party1Label: party1Label || "Party 1",
            party2Label: party2Label || "Party 2",
            keyPoints: safeKeyPoints,
            draftTypeId: draftTypeId,
            draftCategoryId: draftCategoryId || null,
            advocateIds: advocateIds || [],
            primaryAdvocateId: primaryAdvocateId || userId,
            generatedHtml: generatedContent.htmlTemplate || "",
            firstPageTemplate: generatedContent.firstPageTemplate || "",
            generatedBy: userId,
            relevantActsAndSections: safeRelevantActsAndSections,
            vakkalathFor: req.body.vakkalathFor,
            executionDate: executionDate || new Date().toISOString(),
            witnesses: safeWitnesses,
            petitionType: petitionType || "",
            representedBy: representedBy || "",
            case_id: case_id || null
        });

        res.status(201).send(draft);
    } catch (err) {
        console.error("Error creating draft:", err);
        console.error("Request Body:", JSON.stringify(req.body, null, 2));
        res.status(500).send({ message: err.message || "Some error occurred while creating the Draft." });
    }
};

// Retrieve all Drafts from the database.
exports.findAll = async (req, res) => {
    try {
        const userId = req.userId;
        const isAdmin = req.role === 'admin'; // Simplified role check

        let condition = {};
        if (!isAdmin) {
            condition = { generatedBy: userId };
        }

        const data = await Draft.findAll({
            where: condition,
            include: [
                { model: DraftType, as: "type" },
                { model: DraftCategory, as: "category" },
                { model: User, as: "creator", attributes: ['id', 'username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while retrieving drafts." });
    }
};

// Find a single Draft with an id
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Draft.findByPk(id, {
            include: [
                { model: DraftType, as: "type" },
                { model: DraftCategory, as: "category" },
                { model: User, as: "creator", attributes: ['id', 'username'] }
            ]
        });

        if (!data) return res.status(404).send({ message: "Draft not found with id " + id });

        res.send(data);
    } catch (err) {
        res.status(500).send({ message: "Error retrieving Draft with id=" + id });
    }
};

// Update a Draft by the id in the request
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Draft.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            res.send({ message: "Draft was updated successfully." });
        } else {
            res.send({ message: `Cannot update Draft with id=${id}. Maybe Draft was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating Draft with id=" + id });
    }
};

// Delete a Draft with the specified id in the request
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Draft.destroy({
            where: { id: id }
        });

        if (deleted) {
            res.send({ message: "Draft was deleted successfully!" });
        } else {
            res.send({ message: `Cannot delete Draft with id=${id}. Maybe Draft was not found!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Could not delete Draft with id=" + id });
    }
};

// Generate and Download PDF
exports.generatePdf = async (req, res) => {
    try {
        const id = req.params.id;
        const draft = await Draft.findByPk(id);
        if (!draft) return res.status(404).send({ message: "Draft not found." });

        const filename = `draft_${id}_${Date.now()}.pdf`;
        const pdfPath = await generatePdfFromHtml(draft.generatedHtml, filename);

        // Update draft with PDF path if needed
        await draft.update({ pdfPath: filename });

        res.download(pdfPath, filename, (err) => {
            if (err) {
                console.error("Download error:", err);
            }
        });
    } catch (err) {
        console.error("PDF generation failed:", err);
        res.status(500).send({ message: "Could not generate PDF" });
    }
};

// Helper to get types and categories
exports.getDraftTypes = async (req, res) => {
    try {
        const types = await DraftType.findAll({
            include: [{ model: DraftCategory, as: "categories" }]
        });
        res.send(types);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Seed initial data
exports.seedDraftData = async (req, res) => {
    try {
        const count = await DraftType.count();
        if (count > 0) return res.send({ message: "Draft data already seeded." });

        const vakkalath = await DraftType.create({ name: "Vakkalath" });
        const petition = await DraftType.create({ name: "Petition" });
        const agreement = await DraftType.create({ name: "Agreement" });

        await DraftCategory.bulkCreate([
            { name: "Criminal", draft_type_id: petition.id },
            { name: "Civil", draft_type_id: petition.id },
            { name: "Family", draft_type_id: petition.id },
            { name: "Property", draft_type_id: agreement.id },
            { name: "Employment", draft_type_id: agreement.id }
        ]);

        res.send({ message: "Draft data seeded successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
