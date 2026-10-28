const { authJwt } = require("../middleware");
const controller = require("../controllers/case_billing.controller.js");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Save or Update billing (Admin or Senior Advocate)
    app.post(
        "/api/billing/case",
        [authJwt.verifyToken],
        controller.upsertBilling
    );

    // Get billing by Case ID
    app.get(
        "/api/billing/case/:caseId",
        [authJwt.verifyToken],
        controller.getBillingByCase
    );
};
