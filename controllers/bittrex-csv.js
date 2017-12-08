var moment = require('moment');
var csv = require('fast-csv');
var fs = require('fs');
var TransactionsAvg = require("../models/transactionsAvg.js");
var TransactionsFIFO = require("../models/transactionsFIFO.js");
var TransactionsLIFO = require("../models/transactionsLIFO.js");
var btcPrice = require("../models/btc-price.js");
var mysql = require("mysql");

var user = 1;

var stream = fs.createReadStream("../public/assets/fullOrders.csv");

// var allPromises = [];

stream.pipe(csv.parse({ headers: true })).transform(row => {
    var buy;
    var sell;
    var date = moment(row['Closed']).format("MMM DD, YYYY");
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
        units: row['Quantity']
    };
    
})
.on('data', function(data) {
    console.log(data);

    // allPromises.push(new Promise((resolve, reject) => {
        var BTCPrice = new Promise((resolve, reject) => {

            btcPrice.findOne({
                where: {
                    date: data.date
                },
                attributes: ['price']
            }).then(function(results) {
                var price = results.dataValues.price;
                var coinPrice = price * data.rate;
                if (data.targetCoin === 'BTC') {
                    coinPrice = price;
                }
                resolve(coinPrice);
            });
        });
        BTCPrice.then(function(coinPrice) {
            var buyData = {
                user_id: user,
                coin: data.targetCoin,
                cost: coinPrice,
                date: data.date,
                price: coinPrice,
                rate: data.rate,
                units: data.units,
                total_cost: coinPrice * data.units,
            };
            var sellData = {
                user_id: user,
                coin: data.heldCoin,
                date: data.date,
                price: coinPrice,
                rate: data.rate,
                units: data.units,
            };
            createBuy(buyData);
            createSale(sellData);
        });
    // }));
})
.on('end', () => {
    console.log("Import Complete");    
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
    // var getUnits = new Promise((resolve, reject) => {
    //     TransactionsAvg.sum("units", {
    //         where: {
    //             user_id: user,
    //             coin: data.coin
    //         }
    //     }).then(function(results) {
    //         var totalUnits = results;
    //         resolve(totalUnits);
    //     });
    // });
    // getUnits.then(function(totalUnits) {
    //     var getCost = new Promise((resolve, reject) => {
    //         TransactionsAvg.sum("total_cost", {
    //             where: {
    //                 user_id: user,
    //                 coin: data.coin
    //             }
    //         }).then(function(results) {
    //             var totalCost = results;
    //             resolve(totalCost);
    //         });
    //     });
    //     getCost.then(function(totalCost) {
    //         var cost = totalCost / totalUnits;
    //         var sellData = {
    //             user_id: user,
    //             coin: data.coin,
    //             cost: -cost,
    //             date: data.date,
    //             price: data.price,
    //             rate: data.rate,
    //             units: -data.units,
    //             total_cost: -cost * data.units
    //         };
    //         TransactionsAvg.create(sellData);
    //     });
    // });
    var totalCost = 0;
    var totalUnits = 0;
    TransactionsAvg.findAll({
        where: {
            user_id: user,
            coin: data.coin
        }
    }).then(function(res) {
        for (var i in res) {
            if (moment(res[i].date) < data.date) {
                totalCost += res[i].total_cost;
                totalUnits += res[i].units;
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
        }
    }).then(function(res) {
        var totalCost = 0;
        var totalUnits = 0;
        var remainingUnits = data.units;
        var saleUnits = 0;
        var unitCount = 0;
        for (var i = 0; i < res.length; i++) {
            if (moment(res[i].date) < data.date) {
                if (res[i].units < 0) {
                    saleUnits += res[i].units;
                }
            }
        }
        for (var i = 0; i < res.length; i++) {
            if (moment(res[i].date) < data.date) {
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
        }
    }).then(function(res) {
        var totalCost = 0;
        var totalUnits = 0;

        var entries = res.length - 1;
        var remainingUnits = data.units;
        var saleUnits = 0;
        var unitCount = 0;
        for (var i = entries; i >= 0; i--) {
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
