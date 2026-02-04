const mongoose = require('mongoose');

const IncentiveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    // Legacy field (kept for backward compatibility)
    householdId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incentive', IncentiveSchema);

