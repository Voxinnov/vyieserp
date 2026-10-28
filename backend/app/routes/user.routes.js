const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {


    app.get("/api/test/all", controller.allAccess);

    app.get(
        "/api/test/user",
        [authJwt.verifyToken],
        controller.userBoard
    );

    app.get(
        "/api/test/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminBoard
    );

    app.get(
        "/api/users",
        [authJwt.verifyToken],
        controller.findAll
    );
};
