const { authJwt } = require("../middleware");
const courts = require("../controllers/court.controller.js");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/courts", [authJwt.verifyToken], courts.create);
    app.get("/api/courts", [authJwt.verifyToken], courts.findAll);
    app.get("/api/courts/:id", [authJwt.verifyToken], courts.findOne);
    app.put("/api/courts/:id", [authJwt.verifyToken], courts.update);
    app.delete("/api/courts/:id", [authJwt.verifyToken], courts.delete);
};
