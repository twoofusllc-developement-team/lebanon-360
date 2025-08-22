// imports
const Offerings = require("../models/Offeringschma");   // ✅ for GET + POST
const Offering = require("../models/offeringSchema");   // ✅ still used for updates
const person = require("../models/personSchema");

// allowed roles
const allowedRole = ["tourist", "admin"];

// valid currencies
const validCurrencies = ["USD", "EUR", "GBP", "INR"];

// required fields
const requiredFieldsMap = {
  product: ["title", "description", "price", "currency", "stockQuantity", "images"],
};

// create offering controller
exports.createOffering = async (req, res) => {
  try {
    const person = req.person; // authenticated user from middleware

    if (!person) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Role check
    if (!allowedRole.includes(person.role)) {
      return res.status(403).json({ error: "Only tourists or admins can create product offerings" });
    }

    const { personId, type, title, description, price, currency, stockQuantity, images, categoryId, tags } = req.body;

    if (!personId) {
      return res.status(400).json({ error: "personId is required" });
    }

    // Validate required fields
    const requiredFields = requiredFieldsMap[type] || [];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required for ${type}` });
      }
    }

    // Validate currency
    if (currency && !validCurrencies.includes(currency)) {
      return res.status(400).json({ error: "Invalid currency" });
    }

    // Create new offering
    const newOffering = new Offerings({
      personId, // coming from req.body
      type,
      title,
      description,
      details: {
        product: {
          price,
          currency: currency || "USD",
          stockQuantity,
        },
      },
      images,
      categoryId,
      tags,
      createdAt: new Date(),
    });

    await newOffering.save();

    res.status(201).json({
      message: "Offering created successfully",
      offering: newOffering,
    });

  } catch (error) {
    console.error("Error creating offering:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET OFFERINGS (uses Offerings schema)
exports.getOffering = async (req, res) => {
  try {
    const person = req.person;
    const allowedRoles = ["businessOwner", "tourist", "admin"];
    if (!person || !allowedRoles.includes(person.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const type = req.query.type || "product";
    if (type !== "product") {
      return res.status(400).json({ message: "Invalid type" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const offerings = await Offerings.find({ type: "product" })
      .skip(skip)
      .limit(limit);

    const formatted = offerings.map((o) => ({
      offeringId: o._id,
      personId: o.personId,
      version: o.version,
      previousVersionId: o.previousVersionId || null,
      type: o.type,
      title: o.title,
      description: o.description,
      price: o.details?.product?.price || 0,
      currency: o.details?.product?.currency || "USD",
      stock: o.details?.product?.stockQuantity || 0,
      images: o.images || [],
      category: o.categoryId ? o.categoryId.toString() : null,
      tags: o.tags || [],
      rating: o.ratings?.averageRating || 0,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    res.status(200).json({
      page,
      limit,
      count: formatted.length,
      offerings: formatted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
exports.updateOfferingAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    // Field validation
    if (!availabilityStatus) {
      return res.status(400).json({ error: "Availability field is required" });
    }

    const validStatuses = ["available", "not available"];
    if (!validStatuses.includes(availabilityStatus)) {
      return res.status(400).json({ error: "Invalid availability status" });
    }

    const offering = await Offering.findById(id);
    if (!offering) return res.status(404).json({ error: "Offering not found" });

    if (offering.ownerId.toString() !== req.user._id) {
      return res.status(403).json({ error: "Forbidden: You do not own this offering" });
    }
    // Check if offering is deleted
    if (offering.deletedAt) {
      return res.status(400).json({ error: "Cannot update a deleted offering" });
    }

  
    offering.availabilityStatus = availabilityStatus;
    await offering.save();

    return res.status(200).json({
      message: "Availability updated successfully",
      id: offering._id.toString(),
      availabilityStatus: offering.availabilityStatus,
      updatedAt: offering.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update quantity
exports.updateOfferingQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { qtyInStock } = req.body;

   
    if (qtyInStock === undefined) {
      return res.status(400).json({ error: "qtyInStock field is required" });
    }

    if (!Number.isInteger(qtyInStock) || qtyInStock < 0) {
      return res.status(400).json({ error: "qtyInStock must be a non-negative integer" });
    }

    const offering = await Offering.findById(id);
    if (!offering) return res.status(404).json({ error: "Offering not found" });

    // Ownership check
    if (offering.ownerId.toString() !== req.user._id) {
      return res.status(403).json({ error: "Forbidden: You do not own this product" });
    }

    // Type check: only products
    if (offering.type !== "product") {
      return res.status(400).json({ error: "Only products can have quantity updated" });
    }

    // Update quantity and availability
    offering.qtyInStock = qtyInStock;
    offering.availabilityStatus = qtyInStock === 0 ? "not available" : "available";
    await offering.save();

    return res.status(200).json({
      message: "Quantity updated successfully",
      id: offering._id.toString(),
      qtyInStock: offering.qtyInStock,
      availabilityStatus: offering.availabilityStatus,
      updatedAt: offering.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
