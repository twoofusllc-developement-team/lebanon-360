const mongoose = require('mongoose');

const offeringSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['product', 'service', 'event'], required: true },

    // who owns this offering
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // availability (enum)
    availabilityStatus: {
      type: String,
      enum: ['available', 'not available'],
      default: 'available',
      required: true,
    },

    // quantity for products
    qtyInStock: { type: Number, default: 0 },

  },
  { timestamps: true }
);

module.exports = mongoose.model('Offering', offeringSchema);

