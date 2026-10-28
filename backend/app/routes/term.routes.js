const { authJwt } = require("../middleware");
const terms = require("../controllers/term.controller.js");

module.exports = function (app) {
    app.post("/api/terms", [authJwt.verifyToken], terms.create);
    app.get("/api/terms", [authJwt.verifyToken], terms.findAll);
    app.put("/api/terms/:id", [authJwt.verifyToken], terms.update);
    app.delete("/api/terms/:id", [authJwt.verifyToken], terms.delete);
};
