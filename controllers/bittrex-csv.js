var moment = require('moment');
var csv = require('fast-csv');
var fs = require('fs');
var _ = require('lodash');
var TransactionsAvg = require("../models/transactionsAvg.js");
var TransactionsFIFO = require("../models/transactionsFIFO.js");
var TransactionsLIFO = require("../models/transactionsLIFO.js");
var mysql = require("mysql");
var ccxt = require('ccxt');

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
    app.post('/upload', isAuthenticated, function(req, res) {
        var user = req.user.id;
        var file = req.files.orders;
        console.log(file);
        file.mv(__dirname + '/uploads/orders.csv', function(err) {
            if (err) throw err;
        });
        var stream = fs.createReadStream(__dirname + '/uploads/orders.csv');

        var allPromises = [];
        var allSellData = [];
        var sortedData = [];

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

            allPromises.push(new Promise((resolve, reject) => {
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
                    // btcPrice.findOne({
                    //     where: {
                    //         date: moment(data.date).format("MMM DD, YYYY")
                    //     },
                    //     attributes: ['price']
                    // }).then(function(results) {
                    //     var price = results.dataValues.price;
                    //     resolve(price);
                    // });
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
                    createBuy(buyData);
                    allSellData.push(sellData);
                    resolve();
                });
            }));
        })
        .on('end', () => {
            // console.log("Import Complete");
            // res.send("Uploaded");    
            Promise.all(allPromises).then(function() {
                sortedData = _.sortBy(allSellData, function(data) {
                    return new Date(data.date);
                });
                // sortedData.forEach(function(sellData) {
                    // console.log(sellData);
                    createSale(sortedData);
                // });
                console.log(`---------- Imported ${allPromises.length} transactions ----------`);
                // res.send("Uploaded"); 
            }).catch((err) => {
                throw err;
            });
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
        var avgCount = 0;
        function calculateAvg(data) {
            if (avgCount < data.length) {
                var totalCost = 0;
                var totalUnits = 0;
                TransactionsAvg.findAll({
                    where: {
                        user_id: user,
                        coin: data[avgCount].coin
                    }
                }).then(function(res) {
                    for (var i in res) {
                        if (moment(res[i].date).isBefore(data[avgCount].date)) {
                            totalCost += parseFloat(res[i].total_cost);
                            totalUnits += parseFloat(res[i].units);
                        }
                    }
                    // shouldn't need if/then when deposits/withdrawals are included
                    var cost = (res.length < 1 || totalUnits === 0) ? data[avgCount].price : totalCost / totalUnits;
                    var total_cost = -cost * data[avgCount].units;
                    var sellData = {
                        user_id: user,
                        coin: data[avgCount].coin,
                        cost: -cost,
                        date: data[avgCount].date,
                        price: data[avgCount].price,
                        rate: data[avgCount].rate,
                        units: -data[avgCount].units,
                        total_cost: total_cost
                    };
                    console.log("Inserting a new sale...\n");
                    TransactionsAvg.create(sellData).then(function() {
                        avgCount++;
                        calculateAvg(sortedData);
                    });

                });
            }
            
        }
        var FIFOCount = 0;
        function calculateFIFO(data) {
            var user = req.user.id;
            if (FIFOCount < data.length) {
                TransactionsFIFO.findAll({
                    where: {
                        user_id: user,
                        coin: data[FIFOCount].coin
                    },
                    order: ["date"]
                }).then(function(res) {
                    var totalCost = 0;
                    var totalUnits = 0;
                    var remainingUnits = data[FIFOCount].units;
                    var saleUnits = 0;
                    var unitCount = 0;
                    for (var i = 0; i < res.length; i++) {
                        if (moment(res[i].date).isBefore(data[FIFOCount].date)) {
                            if (res[i].units < 0) {
                                saleUnits += res[i].units;
                            }
                        }
                    }
                    for (var i = 0; i < res.length; i++) {
                        if (moment(res[i].date).isBefore(data[FIFOCount].date)) {
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
                    // shouldn't need if/then when deposits/withdrawals are included
                    var cost = (res.length < 1) ? data[FIFOCount].price : totalCost / data[FIFOCount].units;
                    var total_cost = -cost * data[FIFOCount].units;
                    var sellData = {
                        user_id: user,
                        coin: data[FIFOCount].coin,
                        cost: -cost,
                        date: data[FIFOCount].date,
                        price: data[FIFOCount].price,
                        rate: data[FIFOCount].rate,
                        units: -data[FIFOCount].units,
                        total_cost: total_cost
                    };
                    console.log("Inserting a new sale...\n");
                    TransactionsFIFO.create(sellData).then(function() {
                        FIFOCount++;
                        calculateFIFO(sortedData);
                    });
                });
            }
        }
        var LIFOCount = 0;
        function calculateLIFO(data) {
            var user = req.user.id;
            if (LIFOCount < data.length) {
                TransactionsLIFO.findAll({
                    where: {
                        user_id: user,
                        coin: data[LIFOCount].coin
                    },
                    order: ["date"]
                }).then(function(res) {
                    var totalCost = 0;
                    var totalUnits = 0;

                    var entries = res.length - 1;
                    var remainingUnits = data[LIFOCount].units;
                    var saleUnits = 0;
                    var unitCount = 0;
                    for (var i = entries; i >= 0; i--) {
                        if (moment(res[i].date).isBefore(data[LIFOCount].date)) {
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
                    // shouldn't need if/then when deposits/withdrawals are included
                    var cost = (res.length < 1) ? data[LIFOCount].price : totalCost / data[LIFOCount].units;
                    var total_cost = -cost * data[LIFOCount].units;
                    var sellData = {
                        user_id: user,
                        coin: data[LIFOCount].coin,
                        cost: -cost,
                        date: data[LIFOCount].date,
                        price: data[LIFOCount].price,
                        rate: data[LIFOCount].rate,
                        units: -data[LIFOCount].units,
                        total_cost: total_cost
                    };
                    console.log("Inserting a new sale...\n");
                    TransactionsLIFO.create(sellData).then(function() {
                        LIFOCount++;
                        calculateLIFO(sortedData);
                    });
                });
            }
        }
        async function getExchangeData(symbol, date) {
            let selectedExchange = new ccxt.bittrex();
            var selectedDate = new Date(date);
        
            if (selectedExchange.hasFetchOHLCV) {
                
                await selectedExchange.loadMarkets();
                // console.log(symbol);
                // setBreakpoint();
                var price = await selectedExchange.fetchOHLCV(symbol, "1d", selectedDate)
                return price[0][1];
            }
        }
    });
};