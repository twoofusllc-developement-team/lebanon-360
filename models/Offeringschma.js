const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//OfferSchema
const offerSchema = new Schema({
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Person'
    },
    version: {
        type: Number,
        default: 1
    },
    previousVersionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'offer'
    },
    type: {
        type: String,
        enum: ["product", "socialmedia", "delivery"],
        default: "product",
        required: true
    },
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tags:  [String],
    images:[String],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    details: {
        product: {
            price: {
                type: Number,
                min: 0
            },
            currency: {
                type: String,
                enum: ["USD", "EUR", "GBP", "INR", "JPY"],
                default: "USD"
            },
            available: {
                type: Boolean,
                default: true
            },
            stockQuantity: {
                type: Number,
                min: 0,
                default: 0
            },
            weight: {
                type: Number,
                min: 0
            },
            dimensions: {
                length: {
                    type: Number,
                    min: 0
                },
                width: {
                    type: Number,
                    min: 0
                },
                height: {
                    type: Number,
                    min: 0
                }
            },

            deliveryOptions: [{
                method: {
                    type: String,
                },
                price: {
                    type: Number,
                    min: 0
                },
                estimatedTime: {
                    type: String,
                }
            }]
        },
        socialmedia: {
            serviceType: {
                type: String,
                //enum: ["post", "story", "reel", "ad"],
                //required: true
            },
            platforms:[String],

            packageDetails: {
                type: String,
            },
            price: {
                type: Number,
                min: 0
            },
            currency: {
                type: String,
                enum: ["USD", "EUR", "GBP", "INR", "JPY"],
                default: "USD"
            },
            duration: {
                type: String,
            },
            revisions: {
                type: Number,
                min: 0,
                default: 0
            }
        },
        delivery: {
            coverageAreas: [String],
            deliverySpeed: {
                standard: {
                    type: String,
                },
                express: {
                    type: String,
                }
            },
            basePrice: {
                type: Number,
                min: 0
            },
            pricePerKm: {
                type: Number,
                min: 0
            },
            vehicleType: {
                type: String,
                enum: ["bicycle", "motorcycle", "car", "truck"],
                default: "bicycle"
            },
        },
    },
    ratings: {
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        numberOfReviews: {
            type: Number,
            min: 0,
            default: 0
        },
    }




}, { timestamps: true });
// Adding a private method to the schema
offerSchema.methods.private = function () {
    return {
        offeringId: this._id,
        personId: this.personId,
        version: this.version,
        previousVersionId: this.previousVersionId,
        type: this.type,
        title: this.title,
        description: this.description,
        price: this.details?.product?.price,
        currency: this.details?.product?.currency || "USD",
        stock: this.details?.product?.stockQuantity,
        images: this.images,
        category: this.categoryId ? this.categoryId.toString() : null,
        tags: this.tags,
        rating: this.ratings?.averageRating,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};
//exporting the model
module.exports = mongoose.model('offer', offerSchema);