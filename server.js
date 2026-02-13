const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// ========== SECURITY MIDDLEWARE ==========
// Helmet for security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
};
app.use(cors(corsOptions));

// Compression for faster responses
app.use(compression());

// Body parser with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// ========== RATE LIMITING ==========
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/register', limiter);

// Stricter rate limit for registration endpoint
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Max 5 registrations per hour per IP
    message: {
        error: 'Too many registration attempts. Please try again after an hour.'
    }
});

// ========== MONGODB CONNECTION ==========
const mongoURI = process.env.MONGO_URI ||
    "mongodb+srv://kk4538_db_user:AXU6azrmQBIZsfb1@esports.jadn4w5.mongodb.net/?appName=Esports";

mongoose.connect(mongoURI, {
    // Removed deprecated options
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// ========== DATA SCHEMA WITH INDEXING ==========
const RegistrationSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Team name must be at least 3 characters'],
        maxlength: [50, 'Team name must not exceed 50 characters']
    },
    teamCaptain: {
        type: String,
        required: [true, 'Team captain name is required'],
        trim: true,
        minlength: [3, 'Captain name must be at least 3 characters'],
        maxlength: [50, 'Captain name must not exceed 50 characters']
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    registeredAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    ipAddress: {
        type: String,
        default: 'unknown'
    }
}, {
    timestamps: true
});

// Create indexes for faster queries
RegistrationSchema.index({ teamName: 1 });
RegistrationSchema.index({ mobileNumber: 1 });
RegistrationSchema.index({ registeredAt: -1 });

const Registration = mongoose.model('Registration', RegistrationSchema);

// ========== REQUEST LOGGER MIDDLEWARE ==========
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// ========== VALIDATION MIDDLEWARE ==========
const registrationValidation = [
    body('teamName')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Team name must be between 3-50 characters')
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage('Team name can only contain letters, numbers, and spaces'),

    body('teamCaptain')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Captain name must be between 3-50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Captain name can only contain letters and spaces'),

    body('mobileNumber')
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit mobile number')
];

// ========== ROUTES ==========

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Esports Registration Server is Running!',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Get registration count (for frontend display)
app.get('/stats', async (req, res) => {
    try {
        const count = await Registration.countDocuments();
        res.status(200).json({
            registeredTeams: count,
            totalSlots: 64,
            availableSlots: Math.max(0, 64 - count)
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Registration route with validation
app.post('/register',
    registerLimiter,
    registrationValidation,
    async (req, res) => {
        try {
            // Check validation results
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg
                });
            }

            // Get client IP
            const ipAddress = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                'unknown';

            // Create new registration
            const newTeam = new Registration({
                ...req.body,
                ipAddress: ipAddress
            });

            // Save to database
            await newTeam.save();

            console.log(`✅ New team registered: ${newTeam.teamName}`);

            res.status(200).json({
                success: true,
                message: "Registration saved successfully!",
                teamName: newTeam.teamName
            });

        } catch (error) {
            console.error("Registration error:", error);

            // Handle duplicate key error (11000)
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                const displayField = field === 'teamName' ? 'Team Name' : 'Mobile Number';
                return res.status(400).json({
                    error: `This ${displayField} is already registered. Please use a different one.`
                });
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    error: messages[0]
                });
            }

            // Generic error
            res.status(500).json({
                error: "Server error. Please try again later."
            });
        }
    });

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('🔌 MongoDB connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('🔌 MongoDB connection closed.');
        process.exit(0);
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live at: http://localhost:${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
