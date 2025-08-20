const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');


router.post('/', personController.signup);

        
router.post('/login', personController.login);

module.exports = router;
