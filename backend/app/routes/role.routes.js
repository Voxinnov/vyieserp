const { authJwt } = require("../middleware");
const controller = require("../controllers/role.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/roles",
        // [authJwt.verifyToken, authJwt.isAdmin], // Temporarily disabled for testing/development if needed
        controller.create
    );

    app.get("/api/roles", [authJwt.verifyToken], controller.findAll);

    app.get("/api/roles/:id", [authJwt.verifyToken], controller.findOne);

    app.put(
        "/api/roles/:id",
        // [authJwt.verifyToken, authJwt.isAdmin],
        controller.update
    );

    app.delete(
        "/api/roles/:id",
        // [authJwt.verifyToken, authJwt.isAdmin],
        controller.delete
    );
};
