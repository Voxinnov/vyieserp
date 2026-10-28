module.exports = (sequelize, Sequelize) => {
    const Term = sequelize.define("terms", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.ENUM('legal-abbreviation', 'parties-terminology', 'legal-terminology', 'administrative-terminology'),
            allowNull: false
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    });

    return Term;
};
