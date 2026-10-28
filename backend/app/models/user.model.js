module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        username: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING // admin, lawyer, staff
        },
        mobile: {
            type: Sequelize.STRING
        },
        bar_registration_number: {
            type: Sequelize.STRING
        },
        office_name: {
            type: Sequelize.STRING
        },
        number_of_users: {
            type: Sequelize.STRING
        },
        logo: {
            type: Sequelize.STRING
        },
        country: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.STRING
        },
        city: {
            type: Sequelize.STRING
        },
        pincode: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.TEXT
        },
        organization_id: {
            type: Sequelize.INTEGER
        },
        role_id: {
            type: Sequelize.INTEGER
        }
    });

    return User;
};
