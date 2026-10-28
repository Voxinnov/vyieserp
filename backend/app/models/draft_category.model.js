
module.exports = (sequelize, Sequelize) => {
    const DraftCategory = sequelize.define("draft_categories", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        draft_type_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return DraftCategory;
};
