const db = require("../models");
const Task = db.task;
const Client = db.client;
const Op = db.Sequelize.Op;

// Create and Save a new Task
exports.create = (req, res) => {
    // Validate request
    if (!req.body.case_number) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Task
    const task = {
        client_id: req.body.client_id,
        case_number: req.body.case_number,
        court: req.body.court,
        cnr_number: req.body.cnr_number,
        last_hearing_date: req.body.last_hearing_date,
        next_hearing_date: req.body.next_hearing_date,
        advocates: req.body.advocates,
        tags: req.body.tags,
        doc_collection_request: req.body.doc_collection_request ? req.body.doc_collection_request : false,
        doc_collection_message: req.body.doc_collection_message,
        description: req.body.description
    };

    // Save Task in the database
    Task.create(task)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Task."
            });
        });
};

// Retrieve all Tasks from the database.
exports.findAll = (req, res) => {
    const case_number = req.query.case_number;
    var condition = case_number ? { case_number: { [Op.like]: `%${case_number}%` } } : null;

    Task.findAll({ where: condition, include: ["client"] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tasks."
            });
        });
};

// Find a single Task with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Task.findByPk(id, { include: ["client"] })
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Task with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Task with id=" + id
            });
        });
};

// Update a Task by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Task.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Task was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Task with id=${id}. Maybe Task was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Task with id=" + id
            });
        });
};

// Delete a Task with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Task.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Task was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Task with id=${id}. Maybe Task was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Task with id=" + id
            });
        });
};
