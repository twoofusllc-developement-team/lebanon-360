//imports
const express = require('express');
const router = express.Router();
const {getProductOfferings} = require('../controllers/getOfferingController');
const offferingSchema = require('../models/offeringSchema');
const personSchema = require('../models/personSchema');
const jwt =  require('jsonwebtoken');
//JWT authentication middleware
function authenticateToken (req, res, next) {
    // headrr token
    const authHeader = req.headers['authorization'];
    const token  = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({ message: "Authentication required" });
    }
    //verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        if (!decoded.role) {
            return res.status(400).json({ message: 'Token missing role property' });
        }
        req.person = decoded;
        next();
    });


}
//get api
router.get('/api/getofferings/', authenticateToken, getProductOfferings);
//export router
module.exports = router;