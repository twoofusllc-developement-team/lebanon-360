const mongoose = require('mongoose');
require('dotenv').config(); 

exports.connectDB = async () => {
    try{
        await mongoose.connect(process.env.MongoDB_URI)
        console.log("MongoDB connected successfully");

    }catch(err){
        console.error(err);
        process.exit(1); // Exit process with failure
    }
};
