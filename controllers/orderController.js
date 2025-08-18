
const Order = require("../models/order");

// ---------- Helper: Check if user has permission ----------
function canAccessOrder(order, user) {
  if (user.role === "admin") return true;

  if (user.role === "tourist") {
    return order.personId.toString() === user._id.toString();
  }

  if (user.role === "businessOwner") {
    // Assume order.items have an ownerId field
    return order.items.some(item => item.ownerId?.toString() 
    === user._id.toString());
  }

  return false;
}

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccessOrder(order, user))
        { return res.status(403)
        .json({ message: "Forbidden" });
        }
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid order ID" }); // catches invalid ObjectId format
  }
};


exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAddress, status, payment } = req.body;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccessOrder(order, user)) {
        return res.status(403)
        .json({ message: "Forbidden" });
    }
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;
    if (status) order.status = status;
    if (payment) order.payment = payment;
    order.updatedAt = new Date();

    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      orderId: order._id,
      updatedFields: { deliveryAddress, status, payment },
      updatedAt: order.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid order ID" }); // catches invalid ObjectId format
  }
};

//cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!canAccessOrder(order, user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (order.status !== "pending") {
      return res.status(403).json({ message: "Only pending orders can be cancelled" });
    }
    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully.",
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//update status
exports.updateOrderStatus = async (req, res) => {
  try{
    const { orderId } = req.params;
    const { status } = req.body;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!canAccessOrder(order, user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    if (user.role !== "admin" && user.role !== "businessOwner") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const transitions = {
      pending: "shipped",
      shipped: "delivered",
      delivered: null
    };

    if (transitions[order.status] !== status) {
      return res.status(400).json({
        message: `Invalid status transition from '${order.status}' to '${status}'`
      });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      orderId: order._id,
      newStatus: order.status,
      updatedAt: order.updatedAt
    });

    
  }catch(error){
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Get Order Items
exports.getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!canAccessOrder(order, user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.status(200).json({
      orderId: order._id,
      items: order.items.map(item => ({
        offeringId: item.offeringId,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

