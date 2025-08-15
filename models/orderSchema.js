const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
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
        enum: ['product', 'socialmedia', 'delivery'],
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
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    district: { type: String },
    postalCode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  payment: {
    method: { type: String, required: true },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paidAt: { type: Date }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update updatedAt on save
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
