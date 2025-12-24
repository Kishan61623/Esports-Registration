const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middleware ---
// CORS is essential for allowing your GitHub Pages frontend to reach this backend
app.use(cors()); 
app.use(express.json()); 

// --- MongoDB Connection ---
// Explicitly adding 'esportsDB' to the URI helps ensure data goes to the right collection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://k94909517_db_user:hrujyQHLisTF7H6x@cluster0.o6sviix.mongodb.net/esportsDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Data Schema ---
const RegistrationSchema = new mongoose.Schema({
    teamName: { 
        type: String, 
        required: true, 
        unique: true, // Prevents duplicate team names in the database
        trim: true 
    },
    teamCaptain: { 
        type: String, 
        required: true,
        trim: true 
    },
    mobileNumber: { 
        type: String, 
        required: true, 
        unique: true, // Prevents duplicate mobile numbers in the database
        trim: true 
    },
    registeredAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Registration = mongoose.model('Registration', RegistrationSchema);

// --- Routes ---

// Root route for health checks
app.get('/', (req, res) => {
    res.send('Esports Registration Server is Running!');
});

// Registration route with improved duplicate detection
app.post('/register', async (req, res) => {
    try {
        const newTeam = new Registration(req.body);
        await newTeam.save();
        res.status(200).json({ message: "Registration saved successfully!" });
    } catch (error) {
        // Specifically catch the MongoDB Duplicate Key Error
        if (error.code === 11000) {
            // Identify which field is duplicated (teamName or mobileNumber)
            const field = Object.keys(error.keyValue)[0];
            const displayField = field === 'teamName' ? 'Team Name' : 'Mobile Number';
            
            return res.status(400).json({ 
                error: `This ${displayField} is already registered. Please use a different one.` 
            });
        }
        
        console.error("Save error:", error);
        res.status(500).json({ error: "Failed to save to database. Please try again." });
    }
});

// --- Start Server ---
// Uses the port provided by Render (process.env.PORT) or 3000 for local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}`);
});
