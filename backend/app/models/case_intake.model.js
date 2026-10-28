module.exports = (sequelize, Sequelize) => {
    const CaseIntake = sequelize.define("case_intakes", {
        client_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        client_phone: {
            type: Sequelize.STRING
        },
        client_email: {
            type: Sequelize.STRING
        },
        case_type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        narration: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        audio_url: {
            type: Sequelize.STRING
        },
        is_new_case: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        noc_form_url: {
            type: Sequelize.STRING
        },
        noc_remarks: {
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.ENUM(
                "Narration Submitted",
                "Approved by Senior",
                "Clarification Requested",
                "Rejected"
            ),
            defaultValue: "Narration Submitted"
        }
    });

    return CaseIntake;
};
