module.exports = (sequelize, Sequelize) => {
    const Client = sequelize.define("clients", {
        name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.TEXT
        },
        tax_id: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        }
    });

    return Client;
};
