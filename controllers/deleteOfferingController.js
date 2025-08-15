const offering = require('../models/offeringSchema'); // Import your offering model here
const order = require('../models/orderSchema'); // Import your order model here
const person = require('../models/personSchema'); // Import your person model here

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

exports.deleteOffering = async (req, res) => {
    try
    {
        const offeringId = req.params.id;

    // Check authentication
    if (!req.user) {
      return res.status(404).json({ success: false, message: "Authentication required" });
    }

    // Find the offering
    const offering = await Offering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({ success: false, message: "Offering not found" });
    }

    // Role check
    if (req.user.role !== "businessOwner") {
      return res.status(403).json({ success: false, message: "Only business owners can update offerings" });
    }

    // Type check
    if (offering.type !== "product") {
      return res.status(403).json({ success: false, message: "Only product offerings can be updated" });
    }

    // Ownership check
    if (offering.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You do not own this offering" });
    }

    if(offering.status === "active") {
      return res.status(409).json({ success: false, message: "Cannot delete an active offering" });
    }

    //Delete the offering
    await offering.deleteOne();    
    return res.status(200).json({ success: true, message: "Offering deleted successfully" });
    

}
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}