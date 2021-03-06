var moment = require('moment');
var csv = require('fast-csv');
var fs = require('fs');
var TransactionsAvg = require("../models/transactionsAvg.js");
var TransactionsFIFO = require("../models/transactionsFIFO.js");
var TransactionsLIFO = require("../models/transactionsLIFO.js");
var btcPrice = require("../models/btc-price.js");
var mysql = require("mysql");
const ccxt = require('ccxt');
var user = 1;

// module.exports = function(app) {
//     app.post('/upload', function(req, res) {
//         var file = req.files.orders;
//         console.log(file);
//         file.mv(__dirname + '/uploads/orders.csv', function(err) {
//             if (err) throw err;
//         });
        var stream = fs.createReadStream(__dirname + '/uploads/orders.csv');

        // var allPromises = [];

        stream.pipe(csv.parse({ headers: true })).transform(row => {
            var buy;
            var sell;
            var date = moment(row['Closed']);
            var exchange = row['Exchange'].split("-");
            if (row["Type"] === 'LIMIT_BUY') {
                buy = exchange[1];
                sell = exchange[0];
            } else if (row["Type"] === 'LIMIT_SELL') {
                buy = exchange[0];
                sell = exchange[1];
            }
            return {
                heldCoin: sell,
                targetCoin: buy,
                date: date,
                rate: row['Limit'],
                units: row['Quantity'],
                exchange: exchange
            };
            
        })
        .on('data', function(data) {
            // console.log(data);

            // allPromises.push(new Promise((resolve, reject) => {
                var buyUnits = data.units;
                var sellUnits = data.units;
                if (data.targetCoin === 'BTC' || data.targetCoin === 'ETH') {
                    buyUnits = buyUnits * data.rate;
                }
                if (data.heldCoin === 'BTC' || data.heldCoin === 'ETH') {
                    sellUnits = sellUnits * data.rate;
                }
                var getPrice = new Promise((resolve, reject) => {
                    if (data.exchange[0] === 'BTC' || data.exchange[1] === 'BTC') {
                        var price = getExchangeData('BTC/USDT', data.date);
                        resolve(price);
                    } else if (data.exchange[0] === 'ETH' || data.exchange[1] === 'ETH') {
                        var price = getExchangeData('ETH/USDT', data.date);
                        resolve(price);
                    }
                });
                getPrice.then(function(price) {
                    var buyPrice = price * data.rate;
                    var sellPrice = price * data.rate;
                    if (data.targetCoin === 'BTC' || data.targetCoin === 'ETH') {
                        buyPrice = price;
                    }
                    if (data.heldCoin === 'BTC' || data.heldCoin === 'ETH') {
                        sellPrice = price;
                    }
                    var buyData = {
                        user_id: user,
                        coin: data.targetCoin,
                        cost: buyPrice,
                        date: data.date,
                        price: buyPrice,
                        rate: data.rate,
                        units: buyUnits,
                        total_cost: buyPrice * buyUnits,
                    };
                    var sellData = {
                        user_id: user,
                        coin: data.heldCoin,
                        date: data.date,
                        price: sellPrice,
                        rate: data.rate,
                        units: sellUnits,
                    };
                    console.log(buyData);
                    // createBuy(buyData);
                    // createSale(sellData);
                });
            // }));
        })
        .on('end', () => {
            console.log("Import Complete");
            // res.send("Uploaded");    
            // Promise.all(allPromises).then(() => {
            //     console.log(`---------- Imported ${allPromises.length} transactions ----------`);
            //     process.exit();
            // }).catch((err) => {
            //     throw err;
            // });
        });

        function createBuy(data) {
            console.log("Inserting a new purchase...\n");
            TransactionsAvg.create(data);
            TransactionsFIFO.create(data);
            TransactionsLIFO.create(data);
        }

        function createSale(data) {
            calculateAvg(data);
            calculateFIFO(data);
            calculateLIFO(data);
        }

        function calculateAvg(data) {
            var totalCost = 0;
            var totalUnits = 0;
            TransactionsAvg.findAll({
                where: {
                    user_id: user,
                    coin: data.coin
                }
            }).then(function(res) {
                for (var i in res) {
                    if (moment(res[i].date).isBefore(data.date)) {
                        totalCost += parseFloat(res[i].total_cost);
                        totalUnits += parseFloat(res[i].units);
                    }
                }
                var cost = (res.length < 1 || totalUnits === 0) ? data.price : totalCost / totalUnits;
                var sellData = {
                    user_id: user,
                    coin: data.coin,
                    cost: -cost,
                    date: data.date,
                    price: data.price,
                    rate: data.rate,
                    units: -data.units,
                    total_cost: -cost * data.units
                };
                console.log("Inserting a new sale...\n");
                TransactionsAvg.create(sellData);

            });
            
        }

        function calculateFIFO(data) {
            TransactionsFIFO.findAll({
                where: {
                    user_id: user,
                    coin: data.coin
                },
                order: ["date"]
            }).then(function(res) {
                var totalCost = 0;
                var totalUnits = 0;
                var remainingUnits = data.units;
                var saleUnits = 0;
                var unitCount = 0;
                for (var i = 0; i < res.length; i++) {
                    if (moment(res[i].date).isBefore(data.date)) {
                        if (res[i].units < 0) {
                            saleUnits += res[i].units;
                        }
                    }
                }
                for (var i = 0; i < res.length; i++) {
                    if (moment(res[i].date).isBefore(data.date)) {
                        if (remainingUnits > 0 && res[i].units > 0) {
                            if (saleUnits < 0) {
                                if (res[i].units <= saleUnits) {
                                    saleUnits += res[i].units;
                                } else if (res[i].units > saleUnits) {
                                    unitCount = res[i].units + saleUnits;
                                    totalUnits = unitCount > remainingUnits ? remainingUnits : unitCount;
                                    totalCost += (res[i].cost * totalUnits);
                                    remainingUnits -= unitCount;
                                    saleUnits = 0;
                                }
                            } else {
                                totalUnits = res[i].units > remainingUnits ? remainingUnits : res[i].units;
                                totalCost += (res[i].cost * totalUnits);
                                remainingUnits -= res[i].units;
                            }
                        }
                    }
                }
                var cost = totalCost / data.units;
                var sellData = {
                    user_id: user,
                    coin: data.coin,
                    cost: -cost,
                    date: data.date,
                    price: data.price,
                    rate: data.rate,
                    units: -data.units,
                    total_cost: -cost * data.units
                };
                console.log("Inserting a new sale...\n");
                TransactionsFIFO.create(sellData);
            });

        }

        function calculateLIFO(data) {
            TransactionsLIFO.findAll({
                where: {
                    user_id: user,
                    coin: data.coin
                },
                order: ["date"]
            }).then(function(res) {
                var totalCost = 0;
                var totalUnits = 0;

                var entries = res.length - 1;
                var remainingUnits = data.units;
                var saleUnits = 0;
                var unitCount = 0;
                for (var i = entries; i >= 0; i--) {
                    if (moment(res[i].date).isBefore(data.date)) {
                        if (remainingUnits > 0) {
                            if (res[i].units < 0) {
                                saleUnits += res[i].units;
                            } else if (res[i].units > 0) {
                                if (saleUnits < 0) {
                                    saleUnits += res[i].units;
                                    if (saleUnits > 0) {
                                        unitCount = res[i].units - saleUnits;
                                        totalUnits = unitCount > remainingUnits ? remainingUnits : unitCount;
                                        totalCost += (res[i].cost * totalUnits);
                                        remainingUnits -= unitCount;
                                        saleUnits = 0;
                                    }
                                } else {
                                    totalUnits = res[i].units > remainingUnits ? remainingUnits : res[i].units;
                                    totalCost += (res[i].cost * totalUnits);
                                    remainingUnits -= res[i].units;
                                }
                            }
                        }
                    }
                }
                var cost = totalCost / data.units;
                var sellData = {
                    user_id: user,
                    coin: data.coin,
                    cost: -cost,
                    date: data.date,
                    price: data.price,
                    rate: data.rate,
                    units: -data.units,
                    total_cost: -cost * data.units
                };
                console.log("Inserting a new sale...\n");
                TransactionsLIFO.create(sellData);
            });

        }
        async function getExchangeData(symbol, date) {
            let selectedExchange = new ccxt.bittrex();
            var selectedDate = new Date(date);
        
            if (selectedExchange.hasFetchOHLCV) {
                
                await selectedExchange.loadMarkets();
                var price = await selectedExchange.fetchOHLCV(symbol, "1d", selectedDate)
                return price[0][1];
            }
        }
//     });
// };