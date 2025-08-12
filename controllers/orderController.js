const Order = require("../models/order");
const Person = require("../models/person"); // Assuming Person model is here

// Helper functions
const successResponse = (data, statusCode, message, res) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const failedResponse = (statusCode, message, res) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      buyerId,
      sellerId,
      items,
      appliedDiscountId,
      discountAmount,
      subtotal,
      totalPrice,
      status,
      shippingAddress,
      paymentId,
      tenantId,
    } = req.body;

    // Check if buyer exists
    const buyerExists = await Person.findById(buyerId);
    if (!buyerExists) {
      return failedResponse(404, "Buyer not found", res);
    }

    // Create order
    const order = await Order.create({
      buyerId,
      sellerId,
      items,
      appliedDiscountId,
      discountAmount,
      subtotal,
      totalPrice,
      status,
      shippingAddress,
      paymentId,
      tenantId,
    });

    return successResponse(order, 201, "Order created successfully", res);
  } catch (error) {
    console.error(error);
    return failedResponse(500, "Failed to create order", res);
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: false });
    return successResponse(orders, 200, "Orders retrieved successfully", res);
  } catch (error) {
    console.error(error);
    return failedResponse(500, "Failed to fetch orders", res);
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.isDeleted) {
      return failedResponse(404, "Order not found", res);
    }
    return successResponse(order, 200, "Order retrieved successfully", res);
  } catch (error) {
    console.error(error);
    return failedResponse(500, "Failed to fetch order", res);
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return failedResponse(404, "Order not found", res);
    }
    return successResponse(order, 200, "Order updated successfully", res);
  } catch (error) {
    console.error(error);
    return failedResponse(500, "Failed to update order", res);
  }
};

// Soft delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    if (!order) {
      return failedResponse(404, "Order not found", res);
    }
    return successResponse(null, 200, "Order deleted successfully", res);
  } catch (error) {
    console.error(error);
    return failedResponse(500, "Failed to delete order", res);
  }
};
