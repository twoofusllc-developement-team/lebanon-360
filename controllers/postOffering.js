//imports
const offeringschema = require('../models/offeringSchema');
const person = require('../models/personSchema');
//function for validating roduct offerring fields
function validateProductofferingfileds(req, res, next) {
    const { title, description, price, currency, stockQuantity, categoryId } = req.body;
    if (!title || !description || !price || currency || !stockQuantity || !categoryId) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
    }

    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
        return res.status(400).json({ message: "Stock quantity must be a non-negative number" });
    }
    if (description && typeof description !== "string") {
        return res.status(400).json({ message: "Description must be a string" });
    } const validCurrencies = ["USD", "EUR", "GBP", "INR"];
    if (!validCurrencies.includes(req.body.currency)) {
        return res.status(400).json({ message: "Invalid currency" });
    }
    if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
        return res.status(400).json({ message: "Images must be a non-empty array" });
    }

    next();
}
//create an Offering 
exports.createOffering = async (req, res) => {
    try {
        // Validate user role
        const person = req.Person;
        if(!person){
            return res.status(401).json({ message: "Authentication required" });
        }
        // allowedrole can only create product offerings
        if(req.body.type !== "product"){
            return res.status(400).json({ message: "Only product offerings can be created" });
        }
        // Access control
        const allowedRole = ["businessOwner"];
        if(!allowedRole.includes(person.roleDetails.role)){
            return res.status(403).json({ message: "Acess required" });
        }
       //validate required fileds
       if(!validateProductofferingfileds (req, res)){
           return res.status(400).json({ message: "Mising required fields" });
       }
       // create new offfering
       const newOffering = new offeringschema({
        personId: person._id,
        type :"product",
        title: req.body.title,
        description: req.body.description,
        images: req.body.images,
        details: {
            product:{
                price: req.body.price,
                currency: req.body.currency,
                stockQuantity: req.body.stockQuantity
            }
        }
    });
    // pivate method       
    const offeringData = newOffering.private();
    //save the new offering
    newOffering.save().then(offeringData => {
        res.status(201).json({
            message: "Offering created successfully",
            offeringId: offering._id,
        })

    })
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}