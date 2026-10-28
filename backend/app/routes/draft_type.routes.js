
const { authJwt } = require("../middleware");
const draftTypes = require("../controllers/draft_type.controller.js");
const draftCategories = require("../controllers/draft_category.controller.js");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/draft-types", [authJwt.verifyToken], draftTypes.findAll);
    app.post("/api/draft-types", [authJwt.verifyToken, authJwt.isAdmin], draftTypes.create);
    app.get("/api/draft-types/:id", [authJwt.verifyToken], draftTypes.findOne);
    app.put("/api/draft-types/:id", [authJwt.verifyToken, authJwt.isAdmin], draftTypes.update);
    app.delete("/api/draft-types/:id", [authJwt.verifyToken, authJwt.isAdmin], draftTypes.delete);

    // Draft Categories
    app.post("/api/draft-categories", [authJwt.verifyToken, authJwt.isAdmin], draftCategories.create);
    app.get("/api/draft-types/:typeId/categories", [authJwt.verifyToken], draftCategories.findAllByType);
    app.put("/api/draft-categories/:id", [authJwt.verifyToken, authJwt.isAdmin], draftCategories.update);
    app.delete("/api/draft-categories/:id", [authJwt.verifyToken, authJwt.isAdmin], draftCategories.delete);
};
