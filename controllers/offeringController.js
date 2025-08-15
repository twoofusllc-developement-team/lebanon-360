const Offering = require("../models/offeringSchema");

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
