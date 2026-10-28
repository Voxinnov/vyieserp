const db = require("../models");
const Todo = db.todo;
const User = db.user;
const Op = db.Sequelize.Op;

// Create and Save a new Todo
exports.create = (req, res) => {
    // Validate request
    if (!req.body.what_to_do) {
        res.status(400).send({
            message: "Content ('What to do') can not be empty!"
        });
        return;
    }

    // Create a Todo
    const todo = {
        what_to_do: req.body.what_to_do,
        case_number: req.body.case_number,
        details: req.body.details,
        due_date: req.body.due_date || null,
        is_repeat: req.body.is_repeat ? req.body.is_repeat : false,
        repeat_interval: req.body.repeat_interval || 'none',
        assigned_to: (req.body.assigned_to && req.body.assigned_to !== "") ? req.body.assigned_to : null
    };
    console.log("Creating Todo with data:", todo);

    // Save Todo in the database
    Todo.create(todo)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.error("Error creating Todo:", err);
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Todo."
            });
        });
};

// Retrieve all Todos from the database.
exports.findAll = (req, res) => {
    const what_to_do = req.query.what_to_do;
    var condition = what_to_do ? { what_to_do: { [Op.like]: `%${what_to_do}%` } } : null;

    Todo.findAll({
        where: condition,
        include: [{ model: User, as: "assignee", attributes: ['id', 'username', 'email'] }]
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving todos."
            });
        });
};

// Find a single Todo with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Todo.findByPk(id, { include: [{ model: User, as: "assignee", attributes: ['id', 'username', 'email'] }] })
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Todo with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Todo with id=" + id
            });
        });
};

// Update a Todo by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Todo.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Todo was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Todo with id=${id}. Maybe Todo was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Todo with id=" + id
            });
        });
};

// Delete a Todo with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Todo.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Todo was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Todo with id=${id}. Maybe Todo was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Todo with id=" + id
            });
        });
};
