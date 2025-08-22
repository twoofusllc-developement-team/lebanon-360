// imports
const express = require('express');
const router = express.Router();
const { getOffering } = require('../controllers/getOfferingController');
const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, person) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.person = person; // attach decoded JWT payload
        next();
    });
}
// GET offerings API (no auth middleware)
router.get('/offerings',authenticateToken, getOffering);

// export router
module.exports = router;
