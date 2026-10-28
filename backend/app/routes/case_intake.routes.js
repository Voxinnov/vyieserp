const { authJwt } = require("../middleware");
const controller = require("../controllers/case_intake.controller.js");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Create a new case (Junior Advocate)
    const upload = require("../middleware/upload");
    app.post(
        "/api/cases",
        [authJwt.verifyToken, upload.single('noc_file')],
        controller.createCase
    );

    // List cases (Context aware)
    app.get(
        "/api/cases",
        [authJwt.verifyToken],
        controller.listCases
    );

    // Get single case details
    app.get(
        "/api/cases/:id",
        [authJwt.verifyToken],
        controller.getCase
    );

    // Update narration (Junior Advocate - only if Clarification Requested)
    app.put(
        "/api/cases/:id/narration",
        [authJwt.verifyToken],
        controller.updateNarration
    );

    // Review case (Senior Advocate)
    app.post(
        "/api/cases/:id/review",
        [authJwt.verifyToken],
        controller.reviewCase
    );

    // Update facts and documents
    const caseDocUpload = require("../middleware/case_doc_upload");
    app.post(
        "/api/cases/:id/facts",
        [authJwt.verifyToken, caseDocUpload.array('files')],
        controller.updateFacts
    );
};
