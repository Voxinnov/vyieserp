const dotenv = require("dotenv");
dotenv.config();

const db = require("./app/models");
const Client = db.client;
const Task = db.task;
const Todo = db.todo; // Assuming todo model is registered in index.js, need to verify
const User = db.user;

async function seedModules() {
    try {
        await db.sequelize.sync();

        const junior = await User.findOne({ where: { username: "junior" } });

        if (!junior) {
            console.log("Junior user not found.");
            return;
        }

        // Seed Clients
        const clients = [
            {
                name: "Ramesh Gupta",
                email: "ramesh@example.com",
                phone: "9812345678",
                address: "sector 15, Noida",
                status: "active"
            },
            {
                name: "Sita Verma",
                email: "sita@example.com",
                phone: "9988776655",
                address: "GK-1, Delhi",
                status: "active"
            }
        ];

        let createdClients = [];
        for (const c of clients) {
            const client = await Client.create(c);
            createdClients.push(client);
            console.log(`Created client: ${c.name}`);
        }

        // Seed Tasks
        if (createdClients.length > 0) {
            await Task.create({
                case_number: "CS/2023/101",
                court: "District Court Saket",
                description: "File replication for Ramesh Gupta's case",
                client_id: createdClients[0].id,
                next_hearing_date: "2024-12-15",
                status: "pending"
            });
            console.log("Created sample task.");
        }

        // Seed Todos
        // Check if Todo model exists on db object
        if (db.todo) {
            await db.todo.create({ // Accessing via db.todo specifically
                what_to_do: "Draft affidavit for bail",
                case_number: "BAIL/45/2024",
                due_date: "2024-11-20",
                priority: "high",
                assigned_to: junior.id
            });
            console.log("Created sample todo.");
        } else {
            console.log("Todo model not found in db object, skipping todos.");
        }

        console.log("Module seeding completed.");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        process.exit();
    }
}

seedModules();
