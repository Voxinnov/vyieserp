module.exports = (sequelize, Sequelize) => {
    const Attendance = sequelize.define("attendance", {
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        check_in: {
            type: Sequelize.TIME
        },
        check_out: {
            type: Sequelize.TIME
        },
        status: {
            type: Sequelize.ENUM('Present', 'Absent', 'Half Day', 'Leave', 'Paid Leave', 'Holiday', 'Weekend'),
            defaultValue: 'Absent'
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        updated_by: {
            type: Sequelize.INTEGER
        }
    });

    return Attendance;
};
