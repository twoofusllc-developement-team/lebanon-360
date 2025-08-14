const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
  personId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Person'
  },
  items: [
    {
      offeringId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Offering'
      },
      offeringType: {
        type: String,
        enum: ['product'],
        default: 'product',
        required: true
      },
      title: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      image: {
        type: String
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
