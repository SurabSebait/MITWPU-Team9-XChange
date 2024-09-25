const ExchangeRate = require('../models/ExchangeRate');
const fs = require('fs');
const csv = require('csv-parser');


const getExchangeRates = (req, res) => {
  const { currency, period } = req.params; // e.g., currency = 'USD', period = '2022-01-01:2022-01-31'
  const results = [];
  const [startDate, endDate] = period.split(':'); // assuming period is passed in 'YYYY-MM-DD:YYYY-MM-DD' format
  const start = new Date(startDate);
  const end = new Date(endDate);
  console.log(start,end,"herererer 222");
  fs.createReadStream('../backend/data/exchangeFinal.csv')
    .pipe(csv())
    .on('headers', (headers) => {
      // Step 2: Use regex to search for the column that matches the currency symbol
      const regex = new RegExp(`\\(${currency}\\)`, 'i'); // Matches anything like (RUB), (USD), etc.
      matchedColumn = headers.find((header) => regex.test(header));
      
    })
    .on('data', (data) => {
      const rowDate = new Date(data['Date']); // Assuming your date column is labeled 'Date'
      const formattedDate = rowDate;
      if (formattedDate >= start && formattedDate <= end && data[matchedColumn]) {
        results.push({
          date: rowDate,
          rate: data[matchedColumn],
        });
      }
    })
    .on('end', () => {
      if (results.length === 0) {
        res.status(404).json({ error: 'No data found for the specified period or currency' });
      } else {
        res.json(results);
      }
    })
    .on('error', (err) => {
      res.status(500).json({ error: 'Error reading CSV file' });
    });
};
// Get the date with the highest and lowest rates for a currency pair
const getMinMaxRates = (req, res) => {
  const { currency } = req.params;
  const data = [];
  let matchedColumn = null;

  fs.createReadStream('../backend/data/exchangeFinal.csv')
  .pipe(csv())
  .on('headers', (headers) => {
    // Step 2: Use regex to search for the column that matches the currency symbol
    const regex = new RegExp(`\\(${currency}\\)`, 'i'); // Matches anything like (RUB), (USD), etc.
    matchedColumn = headers.find((header) => regex.test(header));
    console.log(matchedColumn,"here22")
  })
  .on('data', (row) => {
    // Step 3: If we have a matched column, process the data
    if (matchedColumn && row[matchedColumn]) {
      data.push({
        date: row['Date'], // Assuming the date column is named 'Date'
        rate: parseFloat(row[matchedColumn]), // Ensure the rate is treated as a float
      });
    }
  })
  .on('end', () => {
    // Step 4: Handle the response based on the data
    if (!matchedColumn) {
      res.status(404).json({ error: `Currency symbol (${currency}) not found in the data.` });
    } else if (data.length === 0) {
      res.status(404).json({ error: `No data found for currency ${currency}` });
    } else {
      const maxRate = Math.max(...data.map(d => d.rate));
      const minRate = Math.min(...data.map(d => d.rate));
      const maxDate = data.find(d => d.rate === maxRate)?.date;
      const minDate = data.find(d => d.rate === minRate)?.date;

      res.json({ maxRate, maxDate, minRate, minDate });
    }
  })
  .on('error', (err) => {
    res.status(500).json({ error: 'Error reading CSV file' });
  });
};


module.exports = {
  getExchangeRates,
  getMinMaxRates,
};
