const express = require('express');
const router = express.Router();
const { createOffering } = require('../controllers/postOffering');
const jwt = require('jsonwebtoken');

// JWT authentication middleware
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

// POST /api/postofferings
router.post("/postofferings", authenticateToken, createOffering);

module.exports = router;
