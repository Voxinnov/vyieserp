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
        }
    });

    return User;
};
