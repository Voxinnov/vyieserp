const { authJwt } = require("../middleware");
const controller = require("../controllers/client.controller.js");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/clients",
        [authJwt.verifyToken],
        controller.create
    );

    app.get(
        "/api/clients",
        [authJwt.verifyToken],
        controller.findAll
    );

    app.get(
        "/api/clients/:id",
        [authJwt.verifyToken],
        controller.findOne
    );

    app.put(
        "/api/clients/:id",
        [authJwt.verifyToken],
        controller.update
    );

    app.delete(
        "/api/clients/:id",
        [authJwt.verifyToken],
        controller.delete
    );
};
