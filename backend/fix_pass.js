
const db = require("./app/models");
const bcrypt = require("bcryptjs");

async function updatePassword() {
    try {
        const password = "12345678";
        const hash = bcrypt.hashSync(password, 8);
        console.log("Generated hash:", hash);

        // Update directly
        await db.user.update(
            { password: hash },
            { where: { username: "admin" } }
        );

        console.log("Password updated successfully.");
    } catch (error) {
        console.error("Error updating password:", error);
    }
}

updatePassword();
