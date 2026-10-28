const db = require("../models");
const Court = db.court;
const Op = db.Sequelize.Op;

// Create and Save a new Court
exports.create = async (req, res) => {
    try {
        const userId = req.userId;
        const court = await Court.create({
            ...req.body,
            createdBy: userId,
            organizationId: req.organizationId || null
        });
        res.status(201).send(court);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Court."
        });
    }
};

// Retrieve all Courts from the database.
exports.findAll = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        let where = {};
        if (searchTerm) {
            where = {
                [Op.or]: [
                    { courtName: { [Op.like]: `%${searchTerm}%` } },
                    { city: { [Op.like]: `%${searchTerm}%` } },
                    { state: { [Op.like]: `%${searchTerm}%` } }
                ]
            };
        }

        const courts = await Court.findAll({ where });
        res.send(courts);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving courts."
        });
    }
};

// Find a single Court with an id
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const court = await Court.findByPk(id);
        if (!court) return res.status(404).send({ message: "Court not found" });
        res.send(court);
    } catch (err) {
        res.status(500).send({ message: "Error retrieving Court with id=" + id });
    }
};

// Update a Court by the id in the request
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Court.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedCourt = await Court.findByPk(id);
            return res.status(200).send(updatedCourt);
        }
        throw new Error('Court not found');
    } catch (err) {
        res.status(500).send({ message: "Error updating Court with id=" + id });
    }
};

// Delete a Court with the specified id in the request
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Court.destroy({ where: { id: id } });
        if (deleted) return res.status(204).send();
        throw new Error('Court not found');
    } catch (err) {
        res.status(500).send({ message: "Could not delete Court with id=" + id });
    }
};
