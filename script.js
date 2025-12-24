const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

// --- MongoDB Connection ---
const mongoURI = process.env.MONGO_URI || "mongodb+srv://k94909517_db_user:hrujyQHLisTF7H6x@cluster0.o6sviix.mongodb.net/esportsDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Data Schema ---
const RegistrationSchema = new mongoose.Schema({
    teamName: { 
        type: String, 
        required: true, 
        unique: true, // Stops duplicate names
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
        unique: true, // Stops duplicate numbers
        trim: true 
    },
    registeredAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Registration = mongoose.model('Registration', RegistrationSchema);

// --- Routes ---

app.get('/', (req, res) => {
    res.send('Esports Registration Server is Running!');
});

app.post('/register', async (req, res) => {
    try {
        const newTeam = new Registration(req.body);
        await newTeam.save();
        res.status(200).json({ message: "Registration successful!" });
    } catch (error) {
        // --- 11000: The "Duplicate Entry" Error ---
        if (error.code === 11000) {
            // Find which field caused the issue
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            
            // Turn "teamName" into "Team Name" for the user
            const fieldDisplay = field === 'teamName' ? 'Team Name' : 'Mobile Number';
            
            return res.status(400).json({ 
                error: `The ${fieldDisplay} "${value}" is already registered. Please change it.` 
            });
        }
        
        console.error("Save error:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}`);
});
