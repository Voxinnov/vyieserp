const { authJwt } = require("../middleware");
const controller = require("../controllers/attendance.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Employee Actions
    app.post("/api/attendance/checkin", [authJwt.verifyToken], controller.checkIn);
    app.post("/api/attendance/checkout", [authJwt.verifyToken], controller.checkOut);

    // View
    app.get("/api/attendance/daily", [authJwt.verifyToken], controller.getDailyAttendanceForAll); // For Admin mainly, but logic can adapt
    app.get("/api/attendance/monthly", [authJwt.verifyToken], controller.getMonthlyReport); // For report view

    // Admin Actions
    app.post("/api/attendance/mark", [authJwt.verifyToken], controller.markAttendance);
    app.post("/api/attendance/bulk", [authJwt.verifyToken], controller.bulkAttendance);
};
