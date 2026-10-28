
const db = require("../models");
const DraftType = db.draft_type;

// Create and Save a new Draft Type
exports.create = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).send({ message: "Name can not be empty!" });
        }

        const draftType = {
            name: req.body.name,
            description: req.body.description
        };

        const data = await DraftType.create(draftType);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Draft Type."
        });
    }
};

// Retrieve all Draft Types from the database.
exports.findAll = async (req, res) => {
    try {
        const data = await DraftType.findAll({
            include: [{ model: db.draft_category, as: "categories" }]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving draft types."
        });
    }
};

// Find a single Draft Type with an id
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await DraftType.findByPk(id);

        if (!data) {
            return res.status(404).send({ message: "Not found Draft Type with id " + id });
        }
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: "Error retrieving Draft Type with id=" + id });
    }
};

// Update a Draft Type by the id in the request
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await DraftType.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            res.send({ message: "Draft Type was updated successfully." });
        } else {
            res.send({ message: `Cannot update Draft Type with id=${id}. Maybe Draft Type was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating Draft Type with id=" + id });
    }
};

// Delete a Draft Type with the specified id in the request
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await DraftType.destroy({
            where: { id: id }
        });

        if (deleted) {
            res.send({ message: "Draft Type was deleted successfully!" });
        } else {
            res.send({ message: `Cannot delete Draft Type with id=${id}. Maybe Draft Type was not found!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Could not delete Draft Type with id=" + id });
    }
};
