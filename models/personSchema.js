const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const personSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true, 
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [50, 'First name cannot be more than 50 characters long']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [50, 'Last name cannot be more than 50 characters long']
    },
    userName: {
        type: String,
        unique: [true, 'This username already exists'],
        required: [true, 'Username is required'],
        trim: true,
        minlength: [5, 'Username must be at least 5 characters long'],
        maxlength: [20, 'Username cannot be more than 20 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'This email is already in use'],
        trim: true,
        maxlength: [150, 'Email cannot be more than 150 characters long'],
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: [true, 'This phone number is already in use'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v); // Example for 10-digit phone numbers
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [120, 'Age seems unrealistic']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    confirmPassword: {
        type: String,
        required: [true, 'Confirm password is required'],
minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function (v) {
                return v === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: {
        type: Date
    }
}, {
    timestamps: true
});
personSchema.pre('save', async function (next) {
    try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
} catch (error) {
        console.error(error);
    }
});
personSchema.methods.checkPassword = async function (candidatePassword, personPassword) {
    return await bcrypt.compare(candidatePassword, personPassword);
};
module.exports = mongoose.model('Person', personSchema);
