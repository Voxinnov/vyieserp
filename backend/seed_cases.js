const dotenv = require("dotenv");
dotenv.config();

const db = require("./app/models");
const CaseIntake = db.case_intake;
const User = db.user;

async function seedCases() {
    try {
        await db.sequelize.sync();

        // Get users to associate
        const junior = await User.findOne({ where: { username: "junior" } });
        const senior = await User.findOne({ where: { username: "senior" } });

        if (!junior) {
            console.log("Junior user not found, cannot link creator.");
            return;
        }

        const cases = [
            {
                client_name: "Amit Kumar",
                client_phone: "9876543210",
                case_type: "Civil",
                narration: "Property dispute regarding ancestral land in Dwarka. Needs urgent hearing.",
                status: "Narration Submitted",
                created_by: junior.id
            },
            {
                client_name: "Priya Singh",
                client_phone: "9123456780",
                case_type: "Criminal",
                narration: "Bail application for Section 304.",
                status: "Approved by Senior",
                created_by: junior.id
            },
            {
                client_name: "Tech Solutions Pvt Ltd",
                client_phone: "8888888888",
                case_type: "Corporate",
                narration: "Insolvency petition filing.",
                status: "Clarification Requested",
                created_by: junior.id
            }
        ];

        for (const c of cases) {
            await CaseIntake.create(c);
            console.log(`Created case for client: ${c.client_name}`);
        }

        console.log("Seeding completed successfully.");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        process.exit();
    }
}

seedCases();
