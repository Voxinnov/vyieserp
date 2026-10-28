const db = require("../models");
const Attendance = db.attendance;
const User = db.user;
const Op = db.Sequelize.Op;

// Check In
exports.checkIn = async (req, res) => {
    try {
        const userId = req.userId; // From authJwt middleware
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });

        // Check if already checked in
        const existing = await Attendance.findOne({
            where: { user_id: userId, date: today }
        });

        if (existing) {
            return res.status(400).send({ message: "Already checked in for today." });
        }

        const attendance = {
            user_id: userId,
            date: today,
            check_in: now,
            status: 'Present',
            created_by: userId
        };

        const data = await Attendance.create(attendance);
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error checking in." });
    }
};

// Check Out
exports.checkOut = async (req, res) => {
    try {
        const userId = req.userId;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });

        const record = await Attendance.findOne({
            where: { user_id: userId, date: today }
        });

        if (!record) {
            return res.status(404).send({ message: "No check-in record found for today." });
        }

        record.check_out = now;
        record.updated_by = userId;
        await record.save();

        res.send(record);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error checking out." });
    }
};

// Get Daily Attendance (Admin sees all, User sees self if requested specific, generally UI handles view)
exports.getDailyAttendance = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const userId = req.query.userId; // Optional filter

        let condition = { date: date };
        if (userId) {
            condition.user_id = userId;
        }

        const data = await Attendance.findAll({
            where: condition,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            }]
        });

        // If admin needs list of ALL users even those absent, we need to left join with Users table
        // This is simplified; usually you fetch all users and map attendance to them.

        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving attendance." });
    }
};

// Get All Users with Attendance for a Day (Admin View)
exports.getDailyAttendanceForAll = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'status', 'role'], // Added role
            include: [{
                model: Attendance,
                as: 'attendances',
                where: { date: date },
                required: false // Left join
            }]
        });

        const result = users.map(user => {
            const att = user.attendances.length > 0 ? user.attendances[0] : null;
            return {
                user_id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                date: date,
                check_in: att ? att.check_in : null,
                check_out: att ? att.check_out : null,
                status: att ? att.status : 'Absent', // Default to Absent if no record
                attendance_id: att ? att.id : null
            };
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

// Mark/Update Attendance (Admin)
exports.markAttendance = async (req, res) => {
    try {
        const { user_id, date, status, check_in, check_out } = req.body;
        const adminId = req.userId;

        let record = await Attendance.findOne({
            where: { user_id: user_id, date: date }
        });

        if (record) {
            if (status) record.status = status;
            if (check_in !== undefined) record.check_in = check_in;
            if (check_out !== undefined) record.check_out = check_out;
            record.updated_by = adminId;
            await record.save();
        } else {
            record = await Attendance.create({
                user_id,
                date,
                status: status || 'Present',
                check_in: check_in, // Can be null
                check_out: check_out,
                created_by: adminId
            });
        }

        res.send(record);

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Bulk Attendance
exports.bulkAttendance = async (req, res) => {
    try {
        const { user_ids, date, status } = req.body; // user_ids is array
        const adminId = req.userId;

        for (const uid of user_ids) {
            let record = await Attendance.findOne({ where: { user_id: uid, date: date } });
            if (record) {
                record.status = status;
                record.updated_by = adminId;
                await record.save();
            } else {
                await Attendance.create({
                    user_id: uid,
                    date: date,
                    status: status,
                    created_by: adminId
                });
            }
        }
        res.send({ message: "Bulk attendance updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Monthly Report
exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year, user_id } = req.query; // month 1-12

        let startDate = new Date(year, month - 1, 1);
        let endDate = new Date(year, month, 0); // Last day of month

        // Adjust for timezone string format if needed, simplistic approach:
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        let whereCondition = {
            date: { [Op.between]: [startStr, endStr] }
        };

        if (user_id) {
            whereCondition.user_id = user_id;
        }

        const attendances = await Attendance.findAll({
            where: whereCondition,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }]
        });

        res.send(attendances);

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
