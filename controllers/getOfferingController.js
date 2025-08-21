//imports the schemas
const Offering = require('../models/offeringSchema');
const Person = require('../models/personSchema');

//get all offerings
exports.getOffering = async (req, res) => {
    try {
        //check if user is authenticated
        const person = req.person;
        if (!person) {
            return res.status(401).json({ message: "Authentication required" });
        }

        //Access control
        const allowedRole = ["businessOwner", "tourist"];
        if (!allowedRole.includes(person.roleDetails.role)) {
            return res.status(403).json({ message: "Access required" });
        }

        //Type Validation
        const type = req.body.type || "product";
        if (type !== "product") {
            return res.status(400).json({ message: "Invalid type" });
        }

        //Pagination
        let page = parseInt(req.query.page) || 1;
        let limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        let skip = (page - 1) * limit;

        //Query offerings
        const offerings = await Offering.find({ type: "product" })
            .skip(skip)
            .limit(limit);

        //Format offerings
        const formatted = offerings.map(offering => ({
            offeringId: offering._id,
            personId: offering.personId,
            version: offering.version,
            previousVersionId: offering.previousVersionId,
            type: offering.type,
            title: offering.title,
            description: offering.description,
            price: offering.details?.product?.price,
            currency: offering.details?.product?.currency || "USD",
            stock: offering.details?.product?.stockQuantity,
            images: offering.images,
            category: offering.categoryId?.toString(),
            tags: offering.tags,
            rating: offering.ratings?.averageRating,
            createdAt: offering.createdAt,
            updatedAt: offering.updatedAt
        }));

        //send response
        res.status(200).json({
            page,
            limit,
            count: formatted.length,
            offerings: formatted
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
