const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

var corsOptions = {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-access-token", "Authorization", "Origin", "Accept", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Enable pre-flight for all routes

// app.use(helmet()); // Temporarily disabled to rule out conflict
app.use(morgan('dev'));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
// db.sequelize.sync(); 
// In development, you might want to drop and re-sync:
db.sequelize.sync({ force: false }).then(() => {
    console.log("Drop and Resync Db");
});

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Legal ERP Backend application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/task.routes')(app);
// require('./app/routes/matter.routes')(app); // To be implemented

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
