const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  currencyPair: String,
  rates: [
    {
      date: Date,
      rate: Number,
    },
  ],
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
