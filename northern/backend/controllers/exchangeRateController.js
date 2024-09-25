const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment'); // Import moment for date manipulation
const ExchangeRate = require('../models/ExchangeRate');

const ratesData = {}; // Store rates by currency

// Function to load exchange rates from the CSV file
const loadExchangeRates = (filePath, currencySymbols) => {
    return new Promise((resolve, reject) => {
        const matchedColumnIndices = []; // Initialize the array here
        let headers = []; // Declare headers at a higher scope

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (headerList) => {
                headers = headerList; // Assign the headers to the higher scoped variable

                // Step 2: Create a regex pattern to match currency symbols
                const regex = new RegExp(`\\(${currencySymbols.join('\\)|\\(')}\\)`, 'i'); // Correct regex pattern

                // Find the index of the matched column
                matchedColumnIndices.push(...headers.map((header, index) => {
                    return regex.test(header) ? index : -1;
                }).filter(index => index !== -1)); // Only keep valid indices

                // Check if any matched column indices were found
                if (matchedColumnIndices.length === 0) {
                    reject(new Error('No currency columns found'));
                }
            })
            .on('data', (row) => {
                // Assuming the 'date' and 'rate' columns are always present
                const { date } = row;

                // Check if matchedColumnIndices is defined and has values
                matchedColumnIndices.forEach(index => {
                    const currency = headers[index]; // Get currency symbol from headers
                    const rate = parseFloat(row[currency]);

                    if (!ratesData[currency]) {
                        ratesData[currency] = [];
                    }

                    // Add date and rate to ratesData
                    ratesData[currency].push({
                        date: moment(date).format('YYYY-MM-DD'),
                        rate: rate
                    });
                });
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Fetch exchange rates based on the currency pair and period
const getExchangeRates = (req, res) => {
    const { currency, period } = req.params;
    const data = ratesData[currency] || [];

    let filteredData = filterDataByPeriod(data, period);

    if (filteredData.length === 0) {
        return res.status(404).json({
            error: 'No data available for the specified period'
        });
    }

    res.json(filteredData);
};

// Get the date with the highest and lowest rates for a currency pair
const getMinMaxRates = (req, res) => {
    const { currency, period } = req.params;
    const data = ratesData[currency] || [];

    let filteredData = filterDataByPeriod(data, period);

    if (filteredData.length === 0) {
        return res.status(404).json({
            error: 'No data available for the specified period'
        });
    }

    const { maxRate, maxDate, minRate, minDate } = filteredData.reduce((acc, d) => {
        if (d.rate > acc.maxRate) {
            acc.maxRate = d.rate;
            acc.maxDate = d.date;
        }
        if (d.rate < acc.minRate) {
            acc.minRate = d.rate;
            acc.minDate = d.date;
        }
        return acc;
    }, {
        maxRate: -Infinity,
        minRate: Infinity,
        maxDate: null,
        minDate: null
    });

    // Check if filteredData is empty and handle accordingly
    if (maxDate === null || minDate === null) {
        return res.status(404).json({
            error: 'No data available for the specified period'
        });
    }

    res.json({
        maxRate,
        maxDate,
        minRate,
        minDate
    });
};

// Function to filter data by period
const filterDataByPeriod = (data, period) => {
    const currentDate = moment();

    switch (period) {
        case 'daily':
            return data.filter(d => moment(d.date).isSame(currentDate, 'day'));
        case 'weekly':
            return data.filter(d => moment(d.date).isSame(currentDate, 'week'));
        case 'monthly':
            return data.filter(d => moment(d.date).isSame(currentDate, 'month'));
        default:
            throw new Error('Invalid period specified');
    }
};

// Load exchange rates when the application starts
loadExchangeRates('../backend/data/Final_dataset.csv', ['USD', 'EUR', 'GBP', 'RUB']) // Replace with the actual path to your CSV file and currency symbols
    .then(() => {
        console.log('Exchange rates loaded');
    })
    .catch(error => {
        console.error('Error loading exchange rates:', error);
    });

module.exports = {
    getExchangeRates,
    getMinMaxRates,
};