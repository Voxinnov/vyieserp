module.exports = (sequelize, Sequelize) => {
    const Todo = sequelize.define("todos", {
        what_to_do: {
            type: Sequelize.STRING,
            allowNull: false
        },
        case_number: {
            type: Sequelize.STRING
        },
        details: {
            type: Sequelize.TEXT
        },
        due_date: {
            type: Sequelize.DATEONLY
        },
        is_repeat: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        repeat_interval: {
            type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'yearly', 'none'),
            defaultValue: 'none'
        },
        assigned_to: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    });

    return Todo;
};
