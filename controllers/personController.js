const Person = require('../models/personSchema');
const Validator = require('validator');
exports.signup = async (req, res) => {
    try {
        if (!Validator.isEmail(req.body.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
const checkUserExistance = await Person.findOne({
  $or: [
    { email: req.body.email },
    { userName: req.body.userName }
  ]
});
        if (checkUserExistance) {
            return res.status(409).json({ message: "Email already in use" });
        }
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
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
        return res.status(201).json({
            data: newUser,
            message: "User created successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Person.findOne({ email: email });
        if (!user || !await user.checkPassword(password, user.password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        return res.status(200).json({
            data: user,
            message: "Login successful"
        });
        //const isPasswordValid = await user.checkPassword(req.body.password, user.password);
        //if (!isPasswordValid) {
            //return res.status(401).json({ message: "Invalid email or password" });
        //}
        //return res.status(200).json({
            //data: user,
           // message: "Login successful"
        //});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};