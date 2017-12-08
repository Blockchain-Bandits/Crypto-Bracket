var TransactionsAvg = require("../models/transactionsAvg.js");
var bittrex = require('node-bittrex-api');

var user = 1;

module.exports = function(app) {

    // Get all transactions
    app.get("/api/coins", function(req, res) {

        TransactionsAvg.findAll({
            where: {
                user_id: user
            },
            attributes: ["coin"],
            group: "coin"
        }).then(function(results) {
            // console.log(results);
            var coinInfo = [];
            var allPromises = [];
            var BTCPrice = new Promise((resolve, reject) => {
                bittrex.getticker( { market : 'USDT-BTC' }, function( data, err ) {
                    var price = data.result.Last;
                    resolve(price);
                });
            });
            BTCPrice.then(function(price) {
                results.forEach(function(coin) {
                    var ticker = coin.dataValues.coin;
                    console.log(ticker);
                    allPromises.push(new Promise((resolve, reject) => {
                        var getCoinPrice = new Promise((resolve, reject) => {
                            if (ticker === 'BTC') {
                                var coinPrice = price;
                                resolve(coinPrice);
                            } else {
                                bittrex.getticker( { market : `BTC-${ticker}` }, function( data, err ) {
                                    var coinPrice = data.result.Last * price;
                                    resolve(coinPrice);
                                });
                            }
                        });
                        getCoinPrice.then(function(coinPrice) {
                            var getUnits = new Promise((resolve, reject) => {
                                TransactionsAvg.sum("units", {
                                    where: {
                                        user_id: user,
                                        coin: ticker
                                    }
                                }).then(function(results) {
                                    console.log("units: " + results);
                                    var totalUnits = results;
                                    resolve(totalUnits);
                                });
                            });
                            getUnits.then(function(totalUnits) {
                                var getCost = new Promise((resolve, reject) => {
                                    TransactionsAvg.sum("total_cost", {
                                        where: {
                                            user_id: user,
                                            coin: ticker
                                        }
                                    }).then(function(results) {
                                        console.log("total cost: " + results);
                                        var totalCost = results;
                                        resolve(totalCost);
                                    });
                                });
                                getCost.then(function(totalCost) {
                                    coinInfo.push({
                                        coin: ticker,
                                        price: coinPrice,
                                        totalUnits: totalUnits,
                                        totalCost: totalCost
                                    });
                                    resolve();
                                    // return {
                                    //     coin: ticker,
                                    //     price: coinPrice,
                                    //     totalUnits: totalUnits,
                                    //     totalCost: totalCost
                                    // };
                                });
                            });
                        });
                    }));
                });
                Promise.all(allPromises).then(function() {
                    console.log(coinInfo);
                    // results.push(coinInfo);
                    res.json(coinInfo);
                }).catch((err) => {
                    throw err;
                });
            });
        });

    });


};