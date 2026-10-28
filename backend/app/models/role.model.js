module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("roles", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        permissions: {
            type: Sequelize.JSON
        },
        organization_id: {
            type: Sequelize.INTEGER
        }
    });

    return Role;
};
