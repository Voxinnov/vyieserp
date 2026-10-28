module.exports = (sequelize, Sequelize) => {
    const CaseBilling = sequelize.define("case_billings", {
        case_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'case_intakes',
                key: 'id'
            }
        },
        vakalath_fee: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        sitting_fee: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        representation_fee: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        documentation_fee: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        total_amount: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        payment_status: {
            type: Sequelize.ENUM('Pending', 'Paid', 'Partial'),
            defaultValue: 'Pending'
        },
        remarks: {
            type: Sequelize.TEXT
        },
        created_by: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    });

    return CaseBilling;
};
