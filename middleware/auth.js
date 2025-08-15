// middleware/auth.js
module.exports = (req, res, next) => {
  try {
    // Mock authentication
    req.user = {
      _id: "64f1b8c2f0a123456789abcd", // Example businessOwner ID for testing: This code is from my entered data on MongoDB compass 
      role: "businessOwner",
    };

    if (req.user.role !== "businessOwner") {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};