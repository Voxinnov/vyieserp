const { authJwt } = require("../middleware");
const tasks = require("../controllers/task.controller.js");

module.exports = function (app) {


    var router = require("express").Router();

    // Create a new Task
    router.post("/", [authJwt.verifyToken], tasks.create);

    // Retrieve all Tasks
    router.get("/", [authJwt.verifyToken], tasks.findAll);

    // Retrieve a single Task with id
    router.get("/:id", [authJwt.verifyToken], tasks.findOne);

    // Update a Task with id
    router.put("/:id", [authJwt.verifyToken], tasks.update);

    // Delete a Task with id
    router.delete("/:id", [authJwt.verifyToken], tasks.delete);

    app.use('/api/tasks', router);
};
