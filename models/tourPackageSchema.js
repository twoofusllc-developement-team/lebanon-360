const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//tourPackageSchema
const tourPackageSchema = new Schema({
    packageId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true  
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    durationDays:{
        type: Number,
        required: true,
        min: 1
    },
    locations:[String],
    includes:[String],
    relatedActivityIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    }],
    relatedEventIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Person'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
});
// Export the model
module.exports = mongoose.model('TourPackage', tourPackageSchema);