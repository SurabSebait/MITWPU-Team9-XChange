const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
    baseCurrency: { type: String, required: true },
    targetCurrency: { type: String, required: true },
    date: { type: Date, required: true },
    rate: { type: Number, required: true }
});

const ExchangeRate = mongoose.model('ExchangeRate', exchangeSchema);
module.exports = ExchangeRate;
