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
db.case_intake = require("../models/case_intake.model.js")(sequelize, Sequelize);
db.todo = require("../models/todo.model.js")(sequelize, Sequelize);
db.caseStatusHistory = require("../models/case_status_history.model.js")(sequelize, Sequelize);
db.case_document = require("../models/case_document.model.js")(sequelize, Sequelize);
db.draft_type = require("../models/draft_type.model.js")(sequelize, Sequelize);
db.draft_category = require("../models/draft_category.model.js")(sequelize, Sequelize);
db.draft = require("../models/draft.model.js")(sequelize, Sequelize);
db.court = require("../models/court.model.js")(sequelize, Sequelize);
db.term = require("../models/term.model.js")(sequelize, Sequelize);
db.organization = require("../models/organization.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);

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

// User has many Tasks
db.user.hasMany(db.task, { as: "tasks", foreignKey: "assigned_to" });
db.task.belongsTo(db.user, { foreignKey: "assigned_to", as: "assignee" });

// Case Intake Associations
db.user.hasMany(db.case_intake, { as: "created_cases", foreignKey: "created_by" });
db.case_intake.belongsTo(db.user, { foreignKey: "created_by", as: "creator" });

db.user.hasMany(db.case_intake, { as: "reviewed_cases", foreignKey: "reviewed_by" });
db.case_intake.belongsTo(db.user, { foreignKey: "reviewed_by", as: "reviewer" });

// Many-to-Many Assignment
db.case_intake.belongsToMany(db.user, {
    through: "case_assignments",
    as: "assignees",
    foreignKey: "case_id",
    otherKey: "user_id"
});
db.user.belongsToMany(db.case_intake, {
    through: "case_assignments",
    as: "assigned_cases",
    foreignKey: "user_id",
    otherKey: "case_id"
});

// Case History Associations
db.case_intake.hasMany(db.caseStatusHistory, { as: "history", foreignKey: "case_id" });
db.caseStatusHistory.belongsTo(db.case_intake, { foreignKey: "case_id", as: "case" });

db.user.hasMany(db.caseStatusHistory, { as: "status_changes", foreignKey: "changed_by" });
db.caseStatusHistory.belongsTo(db.user, { foreignKey: "changed_by", as: "changer" });

// Todo Associations
db.todo.belongsTo(db.user, { foreignKey: "assigned_to", as: "assignee" });
db.user.hasMany(db.todo, { foreignKey: "assigned_to", as: "todos" });

// Case Document Associations
db.case_intake.hasMany(db.case_document, { as: "documents", foreignKey: "case_id" });
db.case_document.belongsTo(db.case_intake, { foreignKey: "case_id", as: "case" });
db.case_document.belongsTo(db.user, { foreignKey: "uploaded_by", as: "uploader" });

// Drafting Associations
db.draft_type.hasMany(db.draft_category, { as: "categories", foreignKey: "draft_type_id" });
db.draft_category.belongsTo(db.draft_type, { foreignKey: "draft_type_id", as: "type" });

db.draft.belongsTo(db.draft_type, { foreignKey: "draftTypeId", as: "type" });
db.draft.belongsTo(db.draft_category, { foreignKey: "draftCategoryId", as: "category" });
db.draft.belongsTo(db.court, { foreignKey: "courtId", as: "court" });
db.draft.belongsTo(db.user, { foreignKey: "generatedBy", as: "creator" });
db.draft.belongsTo(db.case_intake, { foreignKey: "case_id", as: "case" });

db.user.hasMany(db.draft, { foreignKey: "generatedBy", as: "drafts" });
db.case_intake.hasMany(db.draft, { foreignKey: "case_id", as: "drafts" });

// Organization Associations
db.organization.hasMany(db.user, { foreignKey: "organization_id", as: "members" });
db.user.belongsTo(db.organization, { foreignKey: "organization_id", as: "organization" });

db.organization.hasMany(db.role, { foreignKey: "organization_id", as: "roles" });
db.role.belongsTo(db.organization, { foreignKey: "organization_id", as: "organization" });

db.role.hasMany(db.user, { foreignKey: "role_id", as: "users" });
db.user.belongsTo(db.role, { foreignKey: "role_id", as: "custom_role" });

db.case_billing = require("../models/case_billing.model.js")(sequelize, Sequelize);
db.case_intake.hasOne(db.case_billing, { as: "billing", foreignKey: "case_id" });
db.case_billing.belongsTo(db.case_intake, { foreignKey: "case_id", as: "case" });
db.case_billing.belongsTo(db.user, { foreignKey: "created_by", as: "creator" });

module.exports = db;
