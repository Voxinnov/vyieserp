
const { authJwt } = require("../middleware");
const drafts = require("../controllers/draft.controller.js");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/drafts/types", [authJwt.verifyToken], drafts.getDraftTypes);
    app.post("/api/drafts/seed", [authJwt.verifyToken, authJwt.isAdmin], drafts.seedDraftData);

    app.post("/api/drafts", [authJwt.verifyToken], drafts.createDraft);
    app.get("/api/drafts", [authJwt.verifyToken], drafts.findAll);
    app.get("/api/drafts/:id", [authJwt.verifyToken], drafts.findOne);
    app.get("/api/drafts/:id/pdf", [authJwt.verifyToken], drafts.generatePdf);
    app.put("/api/drafts/:id", [authJwt.verifyToken], drafts.update);
    app.delete("/api/drafts/:id", [authJwt.verifyToken], drafts.delete);
};
