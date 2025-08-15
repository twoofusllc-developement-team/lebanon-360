const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const personSchema = new Schema({
    role: {
        type: String,
        enum: ["businessOwner", "tourist", "admin"],
        default: "tourist",
        required: true
    },
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
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{8,15}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
     passwordChangedAt: {
        type: Date
    },
    profilePicture: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    preferences: {
        categories: [{ type: String }],
        languages: [{ type: String }]
    },
    location: {
        district: { type: String },
        city: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "active"
    },
    roleDetails: {
        admin: {
            permissions: [{ type: String }],
            lastLogin: { type: Date }
        },
        businessOwner: {
            businessesOwned: [{ type: Schema.Types.ObjectId, ref: "Business" }],
            verified: { type: Boolean, default: false },
            subscriptionPlan: { type: String },
            joinedDate: { type: Date }
        },
        tourist: {
            visitedPlaces: [{ type: Schema.Types.ObjectId, ref: "Place" }],
            bookingsHistory: [{ type: Schema.Types. ObjectId, ref: "Booking" }],
            wishlist: [{ type: Schema.Types.ObjectId, ref: "Place" }]
        }
    },
    storiesPublished: [{ type: Schema.Types.ObjectId, ref: "Story" }]
}, {
    timestamps: true
});

personSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('passwordHash')) return next();
        this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
        next();
    } catch (error) {
        next(error);
    }
});

personSchema.methods.checkPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('Person', personSchema);
