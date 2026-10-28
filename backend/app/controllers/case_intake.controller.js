const db = require("../models");
const CaseIntake = db.case_intake;
const CaseStatusHistory = db.caseStatusHistory;
const CaseDocument = db.case_document;
const User = db.user;
const Task = db.task;
const Client = db.client;
const Op = db.Sequelize.Op;

// Constants for Roles
const ROLE_JUNIOR_ADVOCATE = "Junior Advocate";
const ROLE_SENIOR_ADVOCATE = "Senior Advocate";

// Constants for Status
const STATUS_NARRATION_SUBMITTED = "Narration Submitted";
const STATUS_APPROVED = "Approved by Senior";
const STATUS_CLARIFICATION_REQUESTED = "Clarification Requested";
const STATUS_REJECTED = "Rejected";

// Helper to check role
const checkRole = async (userId, requiredRole) => {
    const user = await User.findByPk(userId);
    if (!user) return false;
    // Check if role matches string directly or if we need to check via Role model (based on setup, user.role is string)
    // Assuming simple string check based on existing User model
    return user.role === requiredRole;
};

// 1. Create Case Intake (Junior Advocate)
exports.createCase = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("Create Case Request - User ID:", userId);

        // Check role
        const user = await User.findByPk(userId);
        console.log("User Found:", user ? user.username : "No user", "Role:", user ? user.role : "N/A");

        const isJunior = await checkRole(userId, ROLE_JUNIOR_ADVOCATE);
        const isAdmin = user && (user.role.toLowerCase().includes("admin") || user.username === 'admin');

        console.log("Is Junior:", isJunior, "Is Admin:", isAdmin);

        if (!isJunior && !isAdmin) {
            console.log("Access Denied for user:", userId);
            return res.status(403).send({ message: "Access Denied. Only Junior Advocates and Admins can create cases." });
        }

        console.log("Request Body:", req.body);
        const { client_name, client_phone, client_email, case_type, narration, audio_url, is_new_case, noc_remarks } = req.body;
        const assigned_to = req.body.assigned_to || req.body['assigned_to[]'];

        if (!client_name || !case_type) {
            console.log("Missing fields");
            return res.status(400).send({ message: "Missing required fields: client_name, case_type." });
        }

        let final_noc_form_url = req.body.noc_form_url;
        if (req.file) {
            final_noc_form_url = `/uploads/noc_forms/${req.file.filename}`;
        }

        const newCase = await CaseIntake.create({
            client_name,
            client_phone,
            client_email,
            case_type,
            narration,
            audio_url,
            is_new_case,
            noc_form_url: final_noc_form_url,
            noc_remarks,
            status: STATUS_NARRATION_SUBMITTED,
            created_by: userId
        });

        // Handle multi-select assignments
        if (assigned_to) {
            let userIds = [];
            if (Array.isArray(assigned_to)) {
                userIds = assigned_to;
            } else if (typeof assigned_to === 'string') {
                userIds = assigned_to.split(',').map(id => parseInt(id.trim()));
            }
            if (userIds.length > 0) {
                await newCase.setAssignees(userIds);

                // Create Tasks for each assigned user
                try {
                    const assignedUsers = await User.findAll({
                        where: { id: { [Op.in]: userIds } }
                    });

                    // Try to find client_id by name
                    let client_id = null;
                    const client = await Client.findOne({ where: { name: client_name } });
                    if (client) client_id = client.id;

                    // Create one task for each assignee
                    for (const assignedUser of assignedUsers) {
                        await Task.create({
                            case_number: `Intake: ${client_name}`,
                            court: "N/A (Intake)",
                            client_id: client_id,
                            assigned_to: assignedUser.id,
                            advocates: assignedUser.username,
                            description: `Assigned Litigation: ${case_type}.\nNarration: ${narration || 'No narration provided.'}`,
                            status: 'new'
                        });
                    }
                    console.log(`${assignedUsers.length} Task(s) created for assignees`);
                } catch (taskErr) {
                    console.error("Error creating tasks for assignment:", taskErr);
                }
            }
        }

        console.log("Case Created:", newCase.id);

        // Add history entry
        await CaseStatusHistory.create({
            case_id: newCase.id,
            previous_status: null,
            new_status: STATUS_NARRATION_SUBMITTED,
            changed_by: userId,
            remarks: "Initial narration submitted."
        });
        console.log("History Created");

        res.status(201).send(newCase);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error creating case." });
    }
};

// 2. Get Case Details (Read-Only for Junior after submit, Review for Senior)
exports.getCase = async (req, res) => {
    try {
        const id = req.params.id;
        const caseData = await CaseIntake.findByPk(id, {
            include: [
                { model: CaseStatusHistory, as: "history", include: [{ model: User, as: "changer", attributes: ['username', 'role'] }] },
                { model: User, as: "creator", attributes: ['username', 'role'] },
                { model: User, as: "reviewer", attributes: ['username', 'role'] },
                { model: User, as: "assignees", attributes: ['id', 'username', 'role'], through: { attributes: [] } },
                { model: CaseDocument, as: "documents", include: [{ model: User, as: "uploader", attributes: ['username'] }] }
            ]
        });

        if (!caseData) {
            return res.status(404).send({ message: "Case not found." });
        }

        // Access control
        const userId = req.userId;
        const user = await User.findByPk(userId);

        const isCreator = caseData.created_by === userId;
        const isSenior = user.role === ROLE_SENIOR_ADVOCATE;
        const isAdmin = user.role === 'admin' || user.role === 'Admin' || user.username === 'admin';
        const isAssignee = caseData.assignees && caseData.assignees.some(u => u.id === userId);

        if (!isCreator && !isSenior && !isAdmin && !isAssignee) {
            return res.status(403).send({ message: "Access Denied. You do not have permission to view this case." });
        }

        res.status(200).send(caseData);
    } catch (err) {
        res.status(500).send({ message: "Error retrieving case." });
    }
};

// 3. Update Narration (Junior Advocate - Only if Clarification Requested)
exports.updateNarration = async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
        const isJunior = await checkRole(userId, ROLE_JUNIOR_ADVOCATE);

        if (!isJunior) {
            return res.status(403).send({ message: "Only Junior Advocates can update narration." });
        }

        const caseData = await CaseIntake.findByPk(id);
        if (!caseData) {
            return res.status(404).send({ message: "Case not found." });
        }

        if (caseData.created_by !== userId) {
            return res.status(403).send({ message: "You can only edit your own cases." });
        }

        if (caseData.status !== STATUS_CLARIFICATION_REQUESTED) {
            return res.status(400).send({ message: "Case is not in 'Clarification Requested' status. Cannot edit." });
        }

        const { narration, audio_url } = req.body;
        const previousStatus = caseData.status;

        // Update case
        caseData.narration = narration;
        if (audio_url !== undefined) caseData.audio_url = audio_url;
        caseData.status = STATUS_NARRATION_SUBMITTED; // Resubmit
        await caseData.save();

        // Add history
        await CaseStatusHistory.create({
            case_id: caseData.id,
            previous_status: previousStatus,
            new_status: STATUS_NARRATION_SUBMITTED,
            changed_by: userId,
            remarks: "Narration updated and resubmitted."
        });

        res.status(200).send({ message: "Narration updated and resubmitted.", case: caseData });

    } catch (err) {
        res.status(500).send({ message: err.message || "Error updating case." });
    }
};

// 4. Senior Review (Approve, Reject, Request Clarification)
exports.reviewCase = async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
        const isSenior = await checkRole(userId, ROLE_SENIOR_ADVOCATE);

        if (!isSenior) {
            return res.status(403).send({ message: "Access Denied. Only Senior Advocates can review cases." });
        }

        const { action, remarks } = req.body;
        // action: 'APPROVE', 'REJECT', 'CLARIFY'

        const caseData = await CaseIntake.findByPk(id);
        if (!caseData) {
            return res.status(404).send({ message: "Case not found." });
        }

        let newStatus;
        if (action === 'APPROVE') newStatus = STATUS_APPROVED;
        else if (action === 'REJECT') newStatus = STATUS_REJECTED;
        else if (action === 'CLARIFY') newStatus = STATUS_CLARIFICATION_REQUESTED;
        else return res.status(400).send({ message: "Invalid action. Use APPROVE, REJECT, or CLARIFY." });

        const previousStatus = caseData.status;

        // Update Case
        caseData.status = newStatus;
        caseData.reviewed_by = userId;
        await caseData.save();

        // Add History
        await CaseStatusHistory.create({
            case_id: caseData.id,
            previous_status: previousStatus,
            new_status: newStatus,
            changed_by: userId,
            remarks: remarks || ""
        });

        res.status(200).send({ message: `Case status updated to ${newStatus}`, case: caseData });

    } catch (err) {
        res.status(500).send({ message: err.message || "Error reviewing case." });
    }
};

// 5. List Cases (Context Aware)
exports.listCases = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).send({ message: "User not found." });

        let whereClause = {};

        if (user.role === ROLE_JUNIOR_ADVOCATE) {
            // Junior sees only their own cases
            whereClause.created_by = userId;
        } else if (user.role === ROLE_SENIOR_ADVOCATE) {
            // Senior sees all cases or filtered by status? 
            // Prompt says "Senior Advocate can view: Client details, Full narration" -> implies access to list.
            // Usually Seniors see all pending reviews.
            // Let's return all for Senior for now, or maybe exclude Drafts if we had them (but we don't).
        } else if (user.role === 'admin') {
            // Admin sees all
        } else {
            // Other roles? Maybe restrict.
        }

        const cases = await CaseIntake.findAll({
            where: whereClause,
            include: [
                { model: User, as: "creator", attributes: ['username'] },
                { model: User, as: "reviewer", attributes: ['username'] },
                { model: User, as: "assignees", attributes: ['username'], through: { attributes: [] } }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send(cases);
    } catch (err) {
        res.status(500).send({ message: "Error listing cases." });
    }
};

// 6. Update Facts and Documents
exports.updateFacts = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { narration, links } = req.body;

        const caseData = await CaseIntake.findByPk(id, {
            include: [{ model: User, as: "assignees" }]
        });

        if (!caseData) {
            return res.status(404).send({ message: "Case not found." });
        }

        const user = await User.findByPk(userId);
        const isCreator = caseData.created_by === userId;
        const isAssignee = caseData.assignees.some(u => u.id === userId);
        const isAdmin = user && (user.role.toLowerCase().includes("admin") || user.username === 'admin');

        if (!isCreator && !isAssignee && !isAdmin) {
            return res.status(403).send({ message: "Access Denied. Only creator or assignees can update facts." });
        }

        // Update narration
        if (narration) {
            caseData.narration = narration;
            await caseData.save();
        }

        // Handle File Uploads
        if (req.files && req.files.length > 0) {
            const docs = req.files.map(file => ({
                case_id: id,
                file_name: file.originalname,
                file_url: `/uploads/case_docs/${file.filename}`,
                uploaded_by: userId
            }));
            await CaseDocument.bulkCreate(docs);
        }

        // Handle Links
        if (links) {
            let linksArray = [];
            if (Array.isArray(links)) {
                linksArray = links;
            } else if (typeof links === 'string') {
                try {
                    linksArray = JSON.parse(links);
                } catch (e) {
                    linksArray = [links];
                }
            }

            if (linksArray.length > 0) {
                const linkDocs = linksArray.filter(l => l && l.trim() !== "").map(link => ({
                    case_id: id,
                    link_url: link,
                    uploaded_by: userId
                }));
                if (linkDocs.length > 0) {
                    await CaseDocument.bulkCreate(linkDocs);
                }
            }
        }

        res.status(200).send({ message: "Case facts and documents updated successfully." });

    } catch (err) {
        console.error("Error in updateFacts:", err);
        res.status(500).send({ message: err.message || "Error updating case facts." });
    }
};
