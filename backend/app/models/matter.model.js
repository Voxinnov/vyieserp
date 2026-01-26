module.exports = (sequelize, Sequelize) => {
    const Matter = sequelize.define("matters", {
        title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
        case_number: {
            type: Sequelize.STRING
        },
        court_name: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING, // open, closed, pending
            defaultValue: 'open'
        },
        priority: {
            type: Sequelize.STRING, // high, medium, low
            defaultValue: 'medium'
        }
    });

    return Matter;
};
