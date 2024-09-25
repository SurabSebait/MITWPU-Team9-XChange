const express = require('express');
const { getExchangeRates, getMinMaxRates } = require('../controllers/exchangeRateController');
const { calculateBasketValue } = require('../controllers/currencyBasketController');
const router = express.Router();

// Route to fetch exchange rates based on currency and duration
router.get('/:currency/:period', getExchangeRates);

// Route to get the highest and lowest exchange rates
router.get('/:currency', getMinMaxRates);

router.post('/basket', calculateBasketValue); // Add the new route

module.exports = router;


//
// exchange rate routes
//
// const express = require('express');
// const { getExchangeRates, getMinMaxRates } = require('../controllers/exchangeRateController');
// const { calculateBasketValue } = require('../controllers/currencyBasketController'); // Import the new controller
//
// const router = express.Router();
//
// // Define the route for getting exchange rates
// router.get('/:currency/:period', getExchangeRates);
//
// // Define the route for getting min/max rates
// router.get('/min-max/:currency', getMinMaxRates);
//
// // Define the route for calculating the custom currency basket
// router.post('/basket', calculateBasketValue); // Add the new route
//
// module.exports = router;