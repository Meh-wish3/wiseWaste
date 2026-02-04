const mongoose = require('mongoose');

const PickupRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    houseNumber: {
      type: String,
      required: true,
    },
    wardNumber: {
      type: String,
      required: true,
      index: true,
    },
    area: {
      type: String,
    },
    wasteType: {
      type: String,
      enum: ['wet', 'dry', 'e-waste'],
      required: true,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    overflow: {
      type: Boolean,
      default: false,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'completed', 'cancelled', 'missed'],
      default: 'pending',
      index: true,
    },
    segregationVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'false_alarm'],
      default: 'pending',
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Legacy field (kept for backward compatibility)
    householdId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupRequest', PickupRequestSchema);

