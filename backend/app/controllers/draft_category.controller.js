
const db = require("../models");
const DraftCategory = db.draft_category;

// Create and Save a new Draft Category
exports.create = async (req, res) => {
    try {
        if (!req.body.name || !req.body.draft_type_id) {
            return res.status(400).send({ message: "Name and Draft Type ID are required!" });
        }

        const data = await DraftCategory.create({
            name: req.body.name,
            draft_type_id: req.body.draft_type_id
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Draft Category."
        });
    }
};

// Retrieve all Draft Categories for a specific Draft Type
exports.findAllByType = async (req, res) => {
    try {
        const typeId = req.params.typeId;
        const data = await DraftCategory.findAll({
            where: { draft_type_id: typeId }
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving draft categories."
        });
    }
};

// Update a Draft Category
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await DraftCategory.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            res.send({ message: "Draft Category was updated successfully." });
        } else {
            res.send({ message: `Cannot update Draft Category with id=${id}.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating Draft Category with id=" + id });
    }
};

// Delete a Draft Category
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await DraftCategory.destroy({
            where: { id: id }
        });

        if (deleted) {
            res.send({ message: "Draft Category was deleted successfully!" });
        } else {
            res.send({ message: `Cannot delete Draft Category with id=${id}.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Could not delete Draft Category with id=" + id });
    }
};
