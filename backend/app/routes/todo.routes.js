const { authJwt } = require("../middleware");
const todos = require("../controllers/todo.controller.js");

module.exports = function (app) {
    var router = require("express").Router();

    // Create a new Todo
    router.post("/", [authJwt.verifyToken], todos.create);

    // Retrieve all Todos
    router.get("/", [authJwt.verifyToken], todos.findAll);

    // Retrieve a single Todo with id
    router.get("/:id", [authJwt.verifyToken], todos.findOne);

    // Update a Todo with id
    router.put("/:id", [authJwt.verifyToken], todos.update);

    // Delete a Todo with id
    router.delete("/:id", [authJwt.verifyToken], todos.delete);

    app.use('/api/todos', router);
};
