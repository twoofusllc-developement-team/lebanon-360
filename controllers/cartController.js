const Cart = require("../modules/cartSchema");
const Order = require("../modules/orderSchema");
const Person = require("../modules/personSchema"); // Add your user model here

// Helper function to send a success response
const successResponse = (res, data, statusCode = 200, message = "") => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Helper function to send an error response
const failedResponse = (res, statusCode = 500, message = "") => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

// Create a new cart
exports.createCart = async (req, res) => {
  try {
    const { personId, items, totalAmount, currency } = req.body;

    // Fetch user to check role
    const user = await Person.findById(personId);
    if (!user) {
      return failedResponse(res, 404, "User not found");
    }

    // Check if role is tourist
    if (user.role !== "tourist") {
      return failedResponse(res, 403, "Only tourists are allowed to create a cart");
    }

    // Check if person already has a cart
    const existingCart = await Cart.findOne({ personId });
    if (existingCart) {
      return failedResponse(res, 400, "Person already has a cart");
    }

    // Create a new cart object
    const newCart = new Cart({
      personId,
      items,
      totalAmount,
      currency,
      lastUpdated: Date.now(),
    });

    // Save to the database
    const savedCart = await newCart.save();

    // Return success
    return successResponse(res, savedCart, 201, "Cart created successfully");
  } catch (err) {
    console.error(err);
    return failedResponse(res, 500, "Unexpected server error");
  }
};

// Add item(s) to cart (merges quantities if item exists)
exports.addToCart = async (req, res) => {
  try {
    const { personId, items: newItems } = req.body;

    if (!Array.isArray(newItems) || newItems.length === 0) {
      return failedResponse(res, 400, "Items array is required and cannot be empty");
    }

    // Find the person's active cart
    const cart = await Cart.findOne({ personId });
    if (!cart) {
      return failedResponse(res, 404, "Cart not found");
    }

    // Merge or add items
    newItems.forEach(newItem => {
      const existingItem = cart.items.find(item =>
        item.offeringId.toString() === newItem.offeringId &&
        item.offeringType === (newItem.offeringType || 'product') &&
        item.price === newItem.price &&
        item.currency === newItem.currency &&
        item.title === newItem.title
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
        existingItem.addedAt = new Date(); // update addedAt if needed
      } else {
        cart.items.push({
          offeringId: newItem.offeringId,
          offeringType: newItem.offeringType || 'product',
          title: newItem.title,
          price: newItem.price,
          currency: newItem.currency,
          quantity: newItem.quantity,
          image: newItem.image || '',
          addedAt: new Date(),
        });
      }
    });

    // Recalculate totalAmount
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Make sure cart currency matches
    if (cart.items.length > 0) {
      cart.currency = cart.items[0].currency;
    }

    cart.lastUpdated = new Date();

    // Save cart
    const updatedCart = await cart.save();

    return successResponse(res, updatedCart, 200, "Items added to cart successfully");
  } catch (err) {
    console.error(err);
    return failedResponse(res, 500, "Unexpected server error");
  }
};
