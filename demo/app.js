const express = require('express');
const http = require('http').Server(express());
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');


const Currency = require('./models/exchangeRate');


mongoose.connect("mongodb+srv://Xchange:Xchange123@cluster.ex1p8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));


function readCSVAndInsert() {
    fs.createReadStream('./data/exchangeFinal.csv')
        .pipe(csv())
        .on('data', (row) => {
           
            const newCurrency = new Currency({
                Date: new Date(row.Date),
                Algerian_dinar: parseFloat(row['Algerian dinar   (DZD)']),
                Australian_dollar: parseFloat(row['Australian dollar   (AUD)']),
                Bahrain_dinar: parseFloat(row['Bahrain dinar   (BHD)']),
                Bolivar_Fuerte: parseFloat(row['Bolivar Fuerte   (VEF)']),
                Botswana_pula: parseFloat(row['Botswana pula   (BWP)']),
                Brazilian_real: parseFloat(row['Brazilian real   (BRL)']),
                Brunei_dollar: parseFloat(row['Brunei dollar   (BND)']),
                Canadian_dollar: parseFloat(row['Canadian dollar   (CAD)']),
                Chilean_peso: parseFloat(row['Chilean peso   (CLP)']),
                Chinese_yuan: parseFloat(row['Chinese yuan   (CNY)']),
                Colombian_peso: parseFloat(row['Colombian peso   (COP)']),
                Czech_koruna: parseFloat(row['Czech koruna   (CZK)']),
                Danish_krone: parseFloat(row['Danish krone   (DKK)']),
                Euro: parseFloat(row['Euro   (EUR)']),
                Hungarian_forint: parseFloat(row['Hungarian forint   (HUF)']),
                Icelandic_krona: parseFloat(row['Icelandic krona   (ISK)']),
                Indian_rupee: parseFloat(row['Indian rupee   (INR)']),
                Indonesian_rupiah: parseFloat(row['Indonesian rupiah   (IDR)']),
                Iranian_rial: parseFloat(row['Iranian rial   (IRR)']),
                Israeli_New_Shekel: parseFloat(row['Israeli New Shekel   (ILS)']),
                Japanese_yen: parseFloat(row['Japanese yen   (JPY)']),
                Kazakhstani_tenge: parseFloat(row['Kazakhstani tenge   (KZT)']),
                Korean_won: parseFloat(row['Korean won   (KRW)']),
                Kuwaiti_dinar: parseFloat(row['Kuwaiti dinar   (KWD)']),
                Libyan_dinar: parseFloat(row['Libyan dinar   (LYD)']),
                Malaysian_ringgit: parseFloat(row['Malaysian ringgit   (MYR)']),
                Mauritian_rupee: parseFloat(row['Mauritian rupee   (MUR)']),
                Mexican_peso: parseFloat(row['Mexican peso   (MXN)']),
                Nepalese_rupee: parseFloat(row['Nepalese rupee   (NPR)']),
                New_Zealand_dollar: parseFloat(row['New Zealand dollar   (NZD)']),
                Norwegian_krone: parseFloat(row['Norwegian krone   (NOK)']),
                Omani_rial: parseFloat(row['Omani rial   (OMR)']),
                Pakistani_rupee: parseFloat(row['Pakistani rupee   (PKR)']),
                Peruvian_sol: parseFloat(row['Peruvian sol   (PEN)']),
                Philippine_peso: parseFloat(row['Philippine peso   (PHP)']),
                Polish_zloty: parseFloat(row['Polish zloty   (PLN)']),
                Qatari_riyal: parseFloat(row['Qatari riyal   (QAR)']),
                Russian_ruble: parseFloat(row['Russian ruble   (RUB)']),
                Saudi_Arabian_riyal: parseFloat(row['Saudi Arabian riyal   (SAR)']),
                Singapore_dollar: parseFloat(row['Singapore dollar   (SGD)']),
                South_African_rand: parseFloat(row['South African rand   (ZAR)']),
                Sri_Lankan_rupee: parseFloat(row['Sri Lankan rupee   (LKR)']),
                Swedish_krona: parseFloat(row['Swedish krona   (SEK)']),
                Swiss_franc: parseFloat(row['Swiss franc   (CHF)']),
                Thai_baht: parseFloat(row['Thai baht   (THB)']),
                Trinidadian_dollar: parseFloat(row['Trinidadian dollar   (TTD)']),
                Tunisian_dinar: parseFloat(row['Tunisian dinar   (TND)']),
                UAE_dirham: parseFloat(row['U.A.E. dirham   (AED)']),
                UK_pound: parseFloat(row['U.K. pound   (GBP)']),
                US_dollar: parseFloat(row['U.S. dollar   (USD)']),
                Uruguayan_peso: parseFloat(row['Uruguayan peso   (UYU)']),
                Bolivar_Soberano: parseFloat(row['Bolivar Soberano   (VES)'])
            });

            
            newCurrency.save()
                .then(() => console.log('Data inserted:', newCurrency))
                .catch(err => console.log('Error inserting data:', err));
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
}


http.listen(3000, function () {
    console.log("Server is running on port 3000");
    readCSVAndInsert();
});
