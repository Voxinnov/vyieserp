module.exports = (sequelize, Sequelize) => {
    const Organization = sequelize.define("organizations", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        logo: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        mobile: {
            type: Sequelize.STRING
        },
        number_of_users: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        is_verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        address: {
            type: Sequelize.TEXT
        },
        city: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.STRING
        },
        country: {
            type: Sequelize.STRING
        },
        pincode: {
            type: Sequelize.STRING
        }
    });

    return Organization;
};
