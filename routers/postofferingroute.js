const express = require('express');
const router = express.Router();
const {createOffering} = require('../controllers/postOffering');
const jwt =  require('jsonwebtoken');

//  Jwt uthentication middleware
function authenticateToken(req, res, next) {
    const authheader = req.headers['authorization'];
    const token  = authheader && authheader.split(' ')[1];
    if(!token){
        return res.status(401).json({ message: "Authentication required" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err , personr) => {
        if(err){
            return res.status(403).json({ message: "Invalid token" });
        }
        req.Person = Person;
        next();
    });
}
//post api
router.post("/api/postofferings/", authenticateToken, createOffering);

//exort router
module.exports = router;