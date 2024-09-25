const fs = require('fs');
const csv = require('csv-parser');

const calculateBasketValue = (req, res) => {
  let match = null;
  const { basket, baseCurrency } = req.body; // Expecting basket to be an array of objects with currency and weight

  // Validate input
  if (!Array.isArray(basket) || basket.length === 0) {
    return res.status(400).json({ error: 'Invalid basket data' });
  }

  // Check if base currency is provided
  if (!baseCurrency) {
    return res.status(400).json({ error: 'Base currency is required.' });
  }

  const results = {};
  let totalWeight = 0;
  let hasError = false; // Flag to handle errors properly
  let matchedColumns = {}; // To store matched columns for each currency

  // Read the exchange rates from the CSV file
  fs.createReadStream('../backend/data/exchangeFinal.csv')
    .pipe(csv())
    .on('headers', (headers) => {
      // Step 1: Extract currency codes from headers using regex for the baseCurrency and each basket currency
      basket.forEach(item => {
        const regex = new RegExp(`\\(${item.currency}\\)`, 'i'); // Regex to match basket currency headers
        const matchedColumn = headers.find(header => regex.test(header));

        if (matchedColumn) {
          matchedColumns[item.currency] = matchedColumn; // Map currency to matched column
          results[item.currency] = []; // Initialize results array for this currency
        } else {
          hasError = true; // Mark an error if currency column is not found
        }
      });
    })
    .on('data', (data) => {
      // Step 2: Populate the results object with date and rate for each currency in the basket
      for (const currency of Object.keys(results)) {
        const matchedColumn = matchedColumns[currency];
        if (data[matchedColumn]) {
          results[currency].push({
            date: data['Date'], // Assuming 'Date' is the correct date column in CSV
            rate: parseFloat(data[matchedColumn]),
          });
        }
      }
    })
    .on('end', () => {
      if (hasError) {
        return res.status(400).json({ error: 'One or more currencies in the basket were not found in the CSV file.' });
      }

      let basketValue = 0;

      // Step 3: Calculate the basket value based on the user's weights
      for (const item of basket) {
        const { currency, weight } = item;
        const rates = results[currency];

        if (rates && rates.length > 0) {
          // Get the latest rate (assuming latest is the last entry in the array)
          const latestRate = rates[rates.length - 1]?.rate;
          console.log(latestRate)
          if (latestRate) {
            //basketValue += latestRate * (weight / 100); // Adjust for weight as percentage
            basketValue += weight/latestRate;
            totalWeight += weight;
          }
        } else {
          // If any currency data is missing, raise an error
          return res.status(400).json({ error: `No exchange rate data found for currency: ${currency}` });
        }
      }

      console.log('Total Weight:', totalWeight); // Debugging log for total weight
      console.log('Basket Value:', basketValue); // Debugging log for the basket value

      // Handle floating-point precision issues by rounding the total weight
      const roundedTotalWeight = Math.round(totalWeight * 100) / 100;

      // Ensure total weight is 100% (with rounding to avoid floating-point errors)
      if (roundedTotalWeight !== 100) {
        return res.status(400).json({ error: 'Total weight must equal 100%' });
      }

      // Return the aggregate value if everything is okay
      res.json({ aggregateValue: basketValue });
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ error: 'Error reading CSV file' });
    });
};

module.exports = {
  calculateBasketValue,
};
