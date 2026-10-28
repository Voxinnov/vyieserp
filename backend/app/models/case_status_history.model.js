module.exports = (sequelize, Sequelize) => {
    const CaseStatusHistory = sequelize.define("case_status_history", {
        previous_status: {
            type: Sequelize.STRING
        },
        new_status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        remarks: {
            type: Sequelize.TEXT
        }
    });

    return CaseStatusHistory;
};
