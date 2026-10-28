
module.exports = (sequelize, Sequelize) => {
    const DraftType = sequelize.define("draft_types", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    });

    return DraftType;
};
