const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        User.findByPk(req.userId).then(user => {
            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }
            req.userRole = user.role;
            req.organizationId = user.organization_id;
            next();
        });
    });
};

isAdmin = (req, res, next) => {
    if (req.userRole === "admin") {
        next();
        return;
    }
    res.status(403).send({
        message: "Require Admin Role!"
    });
};

isOrganization = (req, res, next) => {
    if (req.userRole === "organization") {
        next();
        return;
    }
    res.status(403).send({
        message: "Require Organization Role!"
    });
};

const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isOrganization: isOrganization
};
module.exports = authJwt;
