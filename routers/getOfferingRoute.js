//imports
const express = require('express');
const router = express.Router();
const { getOffering } = require('../controllers/getOfferingController');
const auth = require('../middleware/auth');

// GET offerings API
router.get('/api/getofferings', auth, getOffering);

//export router
module.exports = router;
