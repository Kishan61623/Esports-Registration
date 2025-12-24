const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// --- Middleware ---
app.use(cors()); // Allows your GitHub Pages site to talk to this server
app.use(express.json()); // Allows the server to understand the data sent from your form

// --- MongoDB Connection ---
// In production (Render), we use process.env.MONGO_URI for security
const mongoURI = process.env.MONGO_URI || "mongodb+srv://k94909517_db_user:hrujyQHLisTF7H6x@cluster0.o6sviix.mongodb.net/?appName=cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Data Schema ---
const RegistrationSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    teamCaptain: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', RegistrationSchema);

// --- Routes ---

// 1. Health check (to see if server is live)
app.get('/', (req, res) => {
    res.send('Esports Registration Server is Running!');
});

// 2. Registration POST Route
app.post('/register', async (req, res) => {
    try {
        console.log("Received data:", req.body);
        const newTeam = new Registration(req.body);
        await newTeam.save();
        res.status(200).json({ message: "Registration saved successfully!" });
    } catch (error) {
        console.error("Save error:", error);
        res.status(500).json({ error: "Failed to save to database" });
    }
});

// --- Start Server ---
// Render will provide a port via process.env.PORT, otherwise use 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}`);

});
