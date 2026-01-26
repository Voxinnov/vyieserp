const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        operatorsAliases: false,

        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.client = require("../models/client.model.js")(sequelize, Sequelize);
db.matter = require("../models/matter.model.js")(sequelize, Sequelize);
db.task = require("../models/task.model.js")(sequelize, Sequelize);

// Associations
// User has many Matters
db.user.hasMany(db.matter, { as: "matters", foreignKey: "assigned_to" });
db.matter.belongsTo(db.user, { foreignKey: "assigned_to", as: "lawyer" });

// Client has many Matters
db.client.hasMany(db.matter, { as: "matters" });
db.matter.belongsTo(db.client, { foreignKey: "client_id", as: "client" });

// Client has many Tasks
db.client.hasMany(db.task, { as: "tasks" });
db.task.belongsTo(db.client, { foreignKey: "client_id", as: "client" });


module.exports = db;
