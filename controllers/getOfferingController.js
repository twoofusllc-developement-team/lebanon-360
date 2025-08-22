// imports
const Offering = require('../models/Offeringschma');

// get all offerings
exports.getOffering = async (req, res) => {
    try {
        // Simulate authenticated user (replace this with real auth in future)
        const person = req.person; // assume middleware sets req.person
        const allowedRoles = ["businessOwner", "tourist", "admin"];
        if (!person || !allowedRoles.includes(person.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Type validation
        const type = req.query.type || "product";
        if (type !== "product") {
            return res.status(400).json({ message: "Invalid type" });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const skip = (page - 1) * limit;

        // Query offerings
        const offerings = await Offering.find({ type: "product" })
            .skip(skip)
            .limit(limit);

        // Map to required response format
        const formatted = offerings.map(o => ({
            offeringId: o._id,
            personId: o.personId,
            version: o.version,
            previousVersionId: o.previousVersionId || null,
            type: o.type,
            title: o.title,
            description: o.description,
            price: o.details?.product?.price || 0,
            currency: o.details?.product?.currency || "USD",
            stock: o.details?.product?.stockQuantity || 0,
            images: o.images || [],
            category: o.categoryId ? o.categoryId.toString() : null,
            tags: o.tags || [],
            rating: o.ratings?.averageRating || 0,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt
        }));

        res.status(200).json({
            page,
            limit,
            count: formatted.length,
            offerings: formatted
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
