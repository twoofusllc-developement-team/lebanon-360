const express = require('express');
const router = express.Router();
const offeringController = require('../controllers/offeringController');
const auth = require('../middleware/auth');

// Update availability
router.put('/:id/availability', auth, offeringController.updateOfferingAvailability);

// Update quantity
router.put('/:id/quantity', auth, offeringController.updateOfferingQuantity);

module.exports = router;
