const dotenv = require("dotenv");
dotenv.config();
const db = require("./app/models");
const User = db.user;
const bcrypt = require("bcryptjs");

async function resetPassword() {
    try {
        const password = "password123";
        const hashedPassword = bcrypt.hashSync(password, 8);

        console.log("Generated Hash:", hashedPassword);

        const user = await User.findOne({ where: { username: "admin" } });

        if (!user) {
            console.log("Admin user not found!");
            return;
        }

        user.password = hashedPassword;
        await user.save();

        console.log("Password updated successfully for user 'admin' to 'password123'");
    } catch (error) {
        console.error("Error updating password:", error);
    } finally {
        process.exit(); // Ensure script exits
    }
}

// Initialize DB and run
resetPassword();
