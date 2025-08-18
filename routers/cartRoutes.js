const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

// Route to create a new cart
router.post("/create", cartController.createCart);

// Route to add item(s) to an existing cart
router.post("/add", cartController.addToCart);

module.exports = router;
