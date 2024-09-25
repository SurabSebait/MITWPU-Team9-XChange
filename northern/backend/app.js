const express = require('express');
const cors = require('cors');
const exchangeRateRoutes = require('./routes/exchangeRateRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/exchangeRates', exchangeRateRoutes);

module.exports = app;
