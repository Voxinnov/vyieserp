module.exports = (sequelize, Sequelize) => {
    const Court = sequelize.define("courts", {
        courtId: {
            type: Sequelize.STRING,
            unique: true
        },
        courtType: {
            type: Sequelize.STRING,
            defaultValue: "Unknown"
        },
        courtName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.TEXT
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        state: {
            type: Sequelize.STRING,
            allowNull: false
        },
        pincode: {
            type: Sequelize.STRING
        },
        jurisdiction: {
            type: Sequelize.STRING
        },
        contact: {
            type: Sequelize.STRING
        },
        createdBy: {
            type: Sequelize.INTEGER
        },
        organizationId: {
            type: Sequelize.INTEGER
        },
        isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        hooks: {
            beforeCreate: (court) => {
                if (!court.courtId) {
                    const now = new Date();
                    const timestamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
                    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
                    court.courtId = `${timestamp}-${randomSixDigits}`;
                }
            }
        }
    });

    return Court;
};
