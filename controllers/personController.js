const person = require('../models/personSchema');
const Validator = require('validator');
const jwt = require('jsonwebtoken');
const signToken = (person) => {
    return jwt.sign
    (
        { id: person._id , userName: person.userName}, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
};
//utility function to create and send token
const createSendToken = (person, statusCode, res) => {
    const token = signToken(person);
    const sanitizedUser = {
        _id: person._id,
        firstName: person.firstName,
    };
    res.status(statusCode).json({
        status: "success",
        token,
        data: sanitizedUser,
    });
};


exports.signup = async (req, res) => {
  try {
    if (!Validator.isEmail(req.body.email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }
    const checkUserExistance = await Person.findOne({
      $or: {
          email: req.body.email,
        
          userName: req.body.userName
        }

    });
    if (checkUserExistance) {
      return res.status(409).json({
        message: "Email already in use"
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }
        const { firstName, lastName, email, password } = req.body;

    const newUser = await Person.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      age: req.body.age,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt: Date.now()
    });
    person.createSendToken(newUser, 200, res);
        
    return res.status(201).json({
      data: newUser,
      message: "User created successfully"
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
exports.login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
            if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
    const person = await Person.findOne({
      email: email
    });
    if (!person || !await person.checkPassword(password, person.password)) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
    return res.status(200).json({
      data: person,
      message: "Login successful"
    });
         } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}
exports.protect = async (req, res, next) => {
    try {
        //Extract token 
        let token;
        const authHeader = req.headers.authorization;
        if(authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: "You are not logged in, please login to access this resource" });
        }
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //check user existence
        const currentUser = await user.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ message: "User no longer exists" });
        }
        req.person = person;
        next();
        if (currentUser.passwordChangedAt && currentUser.passwordChangedAt > decoded.iat * 1000) {
            return res.status(401).json({ message: "User changed password after token was issued, please login again" });
        }
        //token is valid, user is authenticated
        req.person = currentPerson;
        next();
    } catch (err) {
        if (err.name = 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token, please login again"});
        }
        if (err.name = 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired, please login again" });
        }   
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}