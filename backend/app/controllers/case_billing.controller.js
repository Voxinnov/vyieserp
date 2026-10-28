const db = require("../models");
const CaseBilling = db.case_billing;
const CaseIntake = db.case_intake;
const User = db.user;

// Create or Update Billing for a Case
exports.upsertBilling = async (req, res) => {
    try {
        const { case_id, vakalath_fee, sitting_fee, representation_fee, documentation_fee, payment_status, remarks } = req.body;
        const userId = req.userId;

        if (!case_id) {
            return res.status(400).send({ message: "Case ID is required." });
        }

        // Calculate total
        const total = parseFloat(vakalath_fee || 0) +
            parseFloat(sitting_fee || 0) +
            parseFloat(representation_fee || 0) +
            parseFloat(documentation_fee || 0);

        let billing = await CaseBilling.findOne({ where: { case_id: case_id } });

        if (billing) {
            // Update
            billing.vakalath_fee = vakalath_fee;
            billing.sitting_fee = sitting_fee;
            billing.representation_fee = representation_fee;
            billing.documentation_fee = documentation_fee;
            billing.total_amount = total;
            billing.payment_status = payment_status;
            billing.remarks = remarks;
            await billing.save();
        } else {
            // Create
            billing = await CaseBilling.create({
                case_id,
                vakalath_fee,
                sitting_fee,
                representation_fee,
                documentation_fee,
                total_amount: total,
                payment_status,
                remarks,
                created_by: userId
            });
        }

        res.status(200).send(billing);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error saving billing information." });
    }
};

// Get Billing for a Case
exports.getBillingByCase = async (req, res) => {
    try {
        const case_id = req.params.caseId;
        const billing = await CaseBilling.findOne({ where: { case_id: case_id } });

        if (!billing) {
            // Return empty billing object if not found to avoid 404 in frontend logic if preferred
            return res.status(200).send({
                case_id,
                vakalath_fee: 0,
                sitting_fee: 0,
                representation_fee: 0,
                documentation_fee: 0,
                total_amount: 0,
                payment_status: 'Pending',
                remarks: ''
            });
        }

        res.status(200).send(billing);
    } catch (err) {
        res.status(500).send({ message: "Error retrieving billing information." });
    }
};
