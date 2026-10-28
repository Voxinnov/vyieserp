const dotenv = require("dotenv");
dotenv.config();
const db = require("./app/models");
const User = db.user;
const Role = db.role;
const bcrypt = require("bcryptjs");

async function seedUsers() {
    try {
        // Sync DB first to ensure tables exist
        await db.sequelize.sync();

        const password = "password123";
        const hashedPassword = bcrypt.hashSync(password, 8);

        const usersToCreate = [
            {
                username: "admin",
                email: "admin@vyise.com",
                password: hashedPassword,
                role: "admin",
                mobile: "9999999999",
                status: "Active"
            },
            {
                username: "junior",
                email: "junior@vyise.com",
                password: hashedPassword,
                role: "Junior Advocate",
                mobile: "8888888888",
                status: "Active"
            },
            {
                username: "senior",
                email: "senior@vyise.com",
                password: hashedPassword,
                role: "Senior Advocate",
                mobile: "7777777777",
                status: "Active"
            }
        ];

        for (const userData of usersToCreate) {
            const [user, created] = await User.findOrCreate({
                where: { username: userData.username },
                defaults: userData
            });

            if (!created) {
                user.password = hashedPassword;
                user.role = userData.role; // Ensure role is correct
                await user.save();
                console.log(`Updated user: ${user.username}`);
            } else {
                console.log(`Created user: ${user.username}`);
            }
        }

        console.log("\n--- Credentials ---");
        usersToCreate.forEach(u => {
            console.log(`Username: ${u.username} | Password: ${password} | Role: ${u.role}`);
        });

    } catch (error) {
        console.error("Error seeding users:", error);
    } finally {
        // Close connection
        // db.sequelize.close(); // might hang if pool is active, but script should exit
        process.exit();
    }
}

seedUsers();
