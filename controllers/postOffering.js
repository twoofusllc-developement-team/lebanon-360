//imports
const offeringschema = require('../models/offeringSchema');
const person = require('../models/personSchema');

//allowed roles
const allowedRole = ["businessOwner"];
//valid currencies
const validCurrencies = ["USD", "EUR", "GBP", "INR"];
//required fileds
const requiredFieldsMap = {
    product: ["title", "description", "price", "currency", "stock", "images"]
};
//function for resolvingproduct  details
function resolveProductDetails(input = {}) {
    return {
        price: typeof input.price === "number" ? input.price : 0,
        currency: validCurrencies.includes(input.currency) ? input.currency : "USD",
        stockQuantity: typeof input.stock === "number" ? input.stock : 0
    };
}
//function for validating roduct offerring fields
function validateProductofferingfileds(req, res, next) {

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
    }

    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
        return res.status(400).json({ message: "Stock quantity must be a non-negative number" });
    }
    if (description && typeof description !== "string") {
        return res.status(400).json({ message: "Description must be a string" });
    }
    if (!validCurrencies.includes(req.body.currency)) {
        return res.status(400).json({ message: "Invalid currency" });
    }
    if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
        return res.status(400).json({ message: "Images must be a non-empty array" });
    }

    return null;
}
//create an Offering 
exports.createOffering = async (req, res) => {
    try {
        const { title, description, price, currency, stockQuantity, categoryId } = req.body;
        if (!title || !description || !price || !currency || !stockQuantity || !categoryId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Validate user role
        const person = req.Person;
        if (!person) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!allowedRole.includes(person.role)) {
            return res.status(403).json({ error: "Only business owners can create product offerings" });
        }
        // allowedrole can only create product offerings
        if (req.body.type !== "product") {
            return res.status(400).json({ message: "Only product offerings can be created" });
        }
        // Access control
        const invaldRoles = person.role.filter(role => !allowedRole.includes(role));
        if (invaldRoles.length > 0) {
            return res.status(400).json(error, "Invalid roles: ${invalidRoles.join(', ')}");
        }
        const requiredFields = requiredFieldsMap[type] || [];
        for (let field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }
        //validate required fileds
        if (!validateProductofferingfileds(req, res)) {
            return res.status(400).json({ message: "Mising required fields" });
        }
        //payload
         const offeringPayload = {
            personId: req.body.personId,
            type: req.body,
            title: req.body.title,
            description: req.body.description,
            images: req.body.images,
            details: {
                product: resolveProductDetails(req.body)
            },
            createdAt: new Date()
        };
        // create new offfering
        const newoffering = new Offering(offeringPayload);
        await newoffering.save();
        // pivate method       
        const offeringData = newoffering.private();
            return res.status(201).json({
            message: "Offering created successfully",
            offeringId: offering._id
        });
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}