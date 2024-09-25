const fs = require('fs');
const csv = require('csv-parser');

const getExchangeRates = (req, res) => {
  const { currency, period } = req.params; // e.g., currency = 'USD', period = '2022-01-01:2022-01-31'
  const results = [];
  let start, end;
  let latestDate = null; // To store the latest date in the CSV file

  // Step 1: Find the latest date in the CSV file
  fs.createReadStream('../backend/data/exchangeFinal.csv')
    .pipe(csv())
    .on('data', (data) => {
      const temp = new Date(data['Date']); // Assuming your date column is labeled 'Date'
      if (!latestDate || temp > latestDate) {
        latestDate = temp; // Update the latest date
      }
    })
    .on('end', () => {
      // After we have found the latest date, set the start and end dates based on the period
      if (!latestDate) {
        return res.status(500).json({ error: 'Could not determine the latest date from the CSV file' });
      }

      // Now set the start and end dates based on the period
      end = latestDate;

      if (period === 'daily') {
        start = end; // Both start and end are the latest date
      } else if (period === 'weekly') {
        start = new Date(end);
        start.setDate(start.getDate() - 7); // 7 days ago
      } else if (period === 'monthly') {
        start = new Date(end);
        start.setMonth(end.getMonth() - 1); // 1 month ago
      } else if (period === 'yearly') {
        start = new Date(end);
        start.setFullYear(end.getFullYear() - 1); // 1 year ago
      } else if (period.includes(':')) {
        // Custom start and end date provided in 'YYYY-MM-DD:YYYY-MM-DD' format
        const [startDate, endDate] = period.split(':');
        start = new Date(startDate);
        end = new Date(endDate);
      }

      // Now that we have the start and end dates, re-read the CSV to filter the results
      fs.createReadStream('../backend/data/exchangeFinal.csv')
        .pipe(csv())
        .on('headers', (headers) => {
          // Step 2: Use regex to search for the column that matches the currency symbol
          const regex = new RegExp(`\\(${currency}\\)`, 'i'); // Matches anything like (RUB), (USD), etc.
          matchedColumn = headers.find((header) => regex.test(header));
        })
        .on('data', (data) => {
          const rowDate = new Date(data['Date']); // Assuming your date column is labeled 'Date'
          if (rowDate >= start && rowDate <= end && data[matchedColumn]) {
            results.push({
              date: rowDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
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
      const regex = new RegExp(`\\(${currency}\\)`, 'i'); // Matches anything like (RUB), (USD), etc.
      matchedColumn = headers.find((header) => regex.test(header));
    })
    .on('data', (row) => {
      if (matchedColumn && row[matchedColumn]) {
        data.push({
          date: row['Date'], // Assuming the date column is named 'Date'
          rate: parseFloat(row[matchedColumn]), // Ensure the rate is treated as a float
        });
      }
    })
    .on('end', () => {
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
