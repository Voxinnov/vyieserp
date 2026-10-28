const dotenv = require("dotenv");
dotenv.config();
const db = require("./app/models");
const User = db.user;
const bcrypt = require("bcryptjs");

async function checkUser() {
    try {
        await db.sequelize.sync();
        const user = await User.findOne({ where: { username: "admin" } });
        if (!user) {
            console.log("User admin not found");
        } else {
            console.log("User found:", user.username);
            console.log("Stored hash:", user.password);
            const valid = bcrypt.compareSync("password123", user.password);
            console.log("Password 'password123' valid:", valid);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkUser();
