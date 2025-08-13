const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  //cartid is an objectid by default automatically
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  items: [{
    offeringId: {
      type: Schema.Types.ObjectId,
      ref: 'Offering',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'BookingSlot'
    }
  }],
  appliedDiscountId: {
    type: Schema.Types.ObjectId,
    ref: "Discount",
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  tenanId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
