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
    const orders = await Order.find({
      isDeleted: false
    });
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
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
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

//get order item
exports.getOrderItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate('items.offeringId', 'title');

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    let isAuthorized = false;
    if (role === 'Admin') {
      isAuthorized = true;
    } else if (role === 'Tourist' && order.buyerId.toString() === userId) {
      isAuthorized = true;
    } else if (role === 'BusinessOwner' && order.sellerId.toString() === userId) {
      isAuthorized = true;
    }
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const items = order.items.map(item => ({
      offeringId: item.offeringId?._id?.toString() || null,
      title: item.offeringId?.title || 'N/A',
      quantity: item.quantity,
      price: item.unitPrice,
    }));

    return res.json({
      orderId: order._id.toString(),
      items,
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    return failedResponse(500, "Failed to delete order", res);
  }
};

//update order status 
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const user = req.user; 
    const allowedStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    const order = await Order.findById(orderId);
    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (user.role === "businessOwner") {
      if (order.sellerId.toString() !== user._id.toString()) {
          return failedResponse(403 ,"Forbidden: You do not own this order.");
      }
    } else if (user.role !== "admin") {
       return failedResponse(403,"Forbidden: You are not authorized to update this order.");
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    return res.json({
      message: "Order status updated successfully.",
      orderId: updatedOrder._id.toString(),
      newStatus: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return failedResponse(500, "Failed to delete order", res);
  }
};

//cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user; 
    const order = await Order.findById(orderId);
    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (user.role === "admin") {

    } else if (user.role === "businessOwner") {
      if (order.sellerId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Forbidden: You do not own this order." });
      }
    } else if (user.role === "tourist") {
      if (order.buyerId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Forbidden: You can only cancel your own orders." });
      }
      if (order.status !== "pending") {
        return res.status(403).json({ message: "Forbidden: You can cancel only pending orders." });
      }
    } else {
      return res.status(403).json({ message: "Forbidden: You are not authorized to cancel this order." });
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: "cancelled", updatedAt: new Date() },
      { new: true }
    );

    return res.json({
      message: "Order cancelled successfully.",
      orderId: updatedOrder._id.toString(),
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
    });
  } catch (error) {
    console.error( error);
    return failedResponse(500, "Failed to delete order", res);
  }
};
