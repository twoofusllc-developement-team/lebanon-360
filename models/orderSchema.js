const mongoose = require("mongoose");

const Schema = mongoose.Schema();

const orderSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  },
  items: [{
    offeringId: {
      type: Schema.Types.ObjectId,
      ref: "offering",
    },
    quantity: {
      type: Number,
    },
    unitPrice: {
      type: Number,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "BookingSlot",
    }
  }],
  appliedDiscountId: {
    type: Schema.Types.ObjectId,
    ref: "Discount",
  },
  discountAmount: {
    type: Number,
  },
  subtotal: {
    type: Number,
  },
  totalPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "completed", "cancelled"],
  },
  shippingAddress: {
    type: String,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },

  tenantId: {
    type: Schema.Types.ObjectId,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },


  deletedAt: {
    type: Date,
    default: Date.now,

  },

}, {
  timestamps: true,
});
module.exports = mongoose.model("order", orderSchema);
