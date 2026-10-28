const db = require("../models");
const Term = db.term;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    try {
        const term = await Term.create(req.body);
        res.status(201).send(term);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error creating term" });
    }
};

exports.findAll = async (req, res) => {
    try {
        const { type, searchTerm } = req.query;
        let where = {};
        if (type) where.type = type;
        if (searchTerm) {
            where.name = { [Op.like]: `%${searchTerm}%` };
        }
        const terms = await Term.findAll({ where });
        res.send(terms);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving terms" });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        await Term.update(req.body, { where: { id } });
        const updated = await Term.findByPk(id);
        res.send(updated);
    } catch (err) {
        res.status(500).send({ message: "Error updating term" });
    }
};

exports.delete = async (req, res) => {
    try {
        await Term.destroy({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (err) {
        res.status(500).send({ message: "Error deleting term" });
    }
};
