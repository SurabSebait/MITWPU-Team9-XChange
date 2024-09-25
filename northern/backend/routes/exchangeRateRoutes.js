const express = require('express');
const { getExchangeRates, getMinMaxRates } = require('../controllers/exchangeRateController');
const router = express.Router();

// Route to fetch exchange rates based on currency and duration
router.get('/:currency/:period', getExchangeRates);

// Route to get the highest and lowest exchange rates
router.get('/:currency', getMinMaxRates);

module.exports = router;
