const Person = require('../models/personSchema');
const Validator = require('validator');
const jwt = require('jsonwebtoken');
const express = require("express");

const ALLOWED_ROLES = ["tourist", "admin"];

const signToken = (person) => {
    return jwt.sign(
        { id: person._id, role: person.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
};

const createSendToken = (person, statusCode, res) => {
    const token = signToken(person);
    return res.status(statusCode).json({
        success: true,
        token,
        data: {
            id: person._id,
            email: person.email,
            roles: [person.role],
            profile: {
                fullName: `${person.firstName} ${person.lastName}`.trim(),
                phone: person.phone,
                location: person.location?.city || ""
            },
            createdAt: person.createdAt,
            updatedAt: person.updatedAt
        }
    });
};

exports.signup = async (req, res) => {
    try {
        const { email, password, confirmPassword, roles, profile } = req.body;

        if (
            !email ||
            !password ||
            !roles ||
            !Array.isArray(roles) ||
            roles.length !== 1 ||
            !profile ||
            !profile.fullName ||
            !profile.phone
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

        if (!Validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (!ALLOWED_ROLES.includes(roles[0])) {
            return res.status(400).json({
                success: false,
                message: "Registration is only allowed for tourist and admin roles."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await Person.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already in use."
            });
        }

        const [firstName, ...rest] = profile.fullName.trim().split(" ");
        const lastName = rest.join(" ") || "";

        const newUser = await Person.create({
            email: normalizedEmail,
            passwordHash: password,
            role: roles[0],
            firstName,
            lastName,
            phone: profile.phone,
            location: { city: profile.location || "" }
        });

        return createSendToken(newUser, 201, res);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await Person.findOne({ email: normalizedEmail });
        if (!user || !(await user.checkPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        return createSendToken(user, 200, res);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "You are not logged in. Please login to access this resource."
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: err.name === "TokenExpiredError"
                    ? "Token expired, please login again."
                    : "Invalid token, please login again."
            });
        }

        const currentUser = await Person.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "The user belonging to this token no longer exists."
            });
        }

        if (
            currentUser.passwordChangedAt &&
            currentUser.passwordChangedAt.getTime() > decoded.iat * 1000
        ) {
            return res.status(401).json({
                success: false,
                message: "User changed password after token was issued. Please login again."
            });
        }

        req.person = currentUser;
        next();

    } catch (err) {
        console.error("Protect middleware error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updatePerson = async (req, res) => {
  try {
    const { personId } = req.params;
    const updates = req.body;
    const user = req.user;

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: "Person not found" });

    if (user.role === "tourist") {
      if (user._id.toString() !== personId.toString()) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      Object.assign(person, updates);
      await person.save();
      return res.status(200).json({ message: "Profile updated", personId, updates });

    } else if (user.role === "businessOwner") {
      person.pendingUpdates = person.pendingUpdates || [];
      for (let key in updates) {
        person.pendingUpdates.push({
          field: key,
          oldValue: person[key],
          newValue: updates[key],
          submittedAt: new Date(),
          status: "pending"
        });
      }
      await person.save();
      return res.status(202).json({ message: "Updates pending admin approval", updates });

    } else if (user.role === "admin") {
      Object.assign(person, updates);
      await person.save();
      return res.status(200).json({ message: "Profile updated by admin", personId, updates });
    }

    res.status(403).json({ message: "Unauthorized role" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updatePassword = async (req, res) => {
  try {
    const { personId } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;

    // Only self or admin can update
    if (user._id.toString() !== personId && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: "Person not found" });

    // Check current password if not admin
    if (user.role !== "admin") {
      const match = await bcrypt.compare(currentPassword, person.passwordHash);
      if (!match) return res.status(401).json({ message: "Invalid current password" });
    }

    person.passwordHash = await bcrypt.hash(newPassword, 12);
    person.passwordChangedAt = new Date();
    await person.save();

    res.status(200).json({ message: "Password updated successfully.", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

