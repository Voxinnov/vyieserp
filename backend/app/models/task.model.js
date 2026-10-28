module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define("tasks", {
        case_number: {
            type: Sequelize.STRING
        },
        court: {
            type: Sequelize.STRING
        },
        cnr_number: {
            type: Sequelize.STRING
        },
        last_hearing_date: {
            type: Sequelize.DATEONLY
        },
        next_hearing_date: {
            type: Sequelize.DATEONLY
        },
        advocates: {
            type: Sequelize.TEXT // Storing as simple text or JSON string
        },
        tags: {
            type: Sequelize.STRING
        },
        doc_collection_request: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        doc_collection_message: {
            type: Sequelize.TEXT
        },
        description: {
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'new'
        },
        assigned_to: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    });

    return Task;
};
