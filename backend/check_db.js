const dotenv = require("dotenv");
dotenv.config();

const db = require("./app/models");
const User = db.user;

async function checkDb() {
    try {
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Check if CaseStatusHistory table exists
        const [results, metadata] = await db.sequelize.query("SHOW TABLES LIKE 'case_status_histories'");
        console.log("CaseStatusHistory table check:", results);

        // Check user role
        const users = await User.findAll({ attributes: ['id', 'username', 'role'] });
        console.log("Users:", JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        process.exit();
    }
}

checkDb();
