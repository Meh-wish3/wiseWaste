const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['CITIZEN', 'COLLECTOR', 'ADMIN'],
        required: true,
    },

    // Citizen-specific fields
    houseNumber: {
        type: String,
        // Required for CITIZEN role - e.g., "H001", "A-123"
    },
    area: {
        type: String,
        // Specific area within ward - e.g., "Bhetapara - Lane 1"
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },

    // Ward number - used by both CITIZEN and COLLECTOR
    wardNumber: {
        type: String,
        // Required for both CITIZEN and COLLECTOR roles
        index: true,
    },

    // Legacy fields (kept for backward compatibility)
    householdId: {
        type: String,
        // Optional - legacy field
    },
    assignedWard: {
        type: String,
        // Legacy field for COLLECTOR role
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
