const { authJwt } = require("../middleware");
const controller = require("../controllers/organization.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Organization details
    app.get(
        "/api/org",
        [authJwt.verifyToken],
        controller.getOrganization
    );

    app.put(
        "/api/org",
        [authJwt.verifyToken, authJwt.isOrganization],
        controller.updateOrganization
    );

    // Team management
    app.get(
        "/api/org/team",
        [authJwt.verifyToken],
        controller.getTeam
    );

    app.post(
        "/api/org/team",
        [authJwt.verifyToken, authJwt.isOrganization],
        controller.addUserToTeam
    );

    // Role management
    app.get(
        "/api/org/roles",
        [authJwt.verifyToken],
        controller.getRoles
    );

    app.post(
        "/api/org/roles",
        [authJwt.verifyToken, authJwt.isOrganization],
        controller.createRole
    );

    app.put(
        "/api/org/roles/:id",
        [authJwt.verifyToken, authJwt.isOrganization],
        controller.updateRole
    );
};
