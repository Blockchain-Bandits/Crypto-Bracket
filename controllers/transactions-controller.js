var express = require("express");
var bittrex = require('node-bittrex-api');

var router = express.Router();

var TransactionsAvg = require("../models/transactionsAvg.js");
var TransactionsFIFO = require("../models/transactionsFIFO.js");
var TransactionsLIFO = require("../models/transactionsLIFO.js");

var isAuthenticated = require("../config/middleware/isAuthenticated");

var price;
bittrex.getticker( { market : 'USDT-BTC' }, function( data, err ) {
    price = data.result.Last;
});

router.get("/api/transactions/:coin/:method", isAuthenticated, function(req, res) {
    var coin = req.params.coin;
    var coinPrice;
    var user = req.user.id;

    bittrex.getticker( { market : `BTC-${coin}` }, function( data, err ) {
        if (coin === 'BTC') {
            coinPrice = price;
        } else {
            coinPrice = data.result.Last * price;
        }
        if (req.params.method === 'avg') {
            TransactionsAvg.findAll({
                where: {
                    user_id: user,
                    coin: coin
                },
                order: ["date"]
            }).then(function(data) {
                data.push({currentPrice: coinPrice});
                res.json(data);
            });
        } else if (req.params.method === 'fifo') {
            TransactionsFIFO.findAll({
                where: {
                    user_id: user,
                    coin: coin
                },
                order: ["date"]
            }).then(function(data) {
                data.push({currentPrice: coinPrice});
                res.json(data);
            });
        } else if (req.params.method === 'lifo') {
            TransactionsLIFO.findAll({
                where: {
                    user_id: user,
                    coin: coin
                },
                order: ["date"]
            }).then(function(data) {
                data.push({currentPrice: coinPrice});
                res.json(data);
            });
        }
    });
});
router.get("/api/index", isAuthenticated, function(req, res) {
    var btc = 0;
    var eth = 0;
    var ltc = 0;
    bittrex.getticker( { market : "USDT-BTC" }, function( data, err ) {
        btc = data.result.Last;
        bittrex.getticker( { market : "BTC-ETH" }, function( data, err ) {
            eth = data.result.Last * btc;
            bittrex.getticker( { market : "BTC-LTC" }, function( data, err ) {
                ltc = data.result.Last * btc;
                res.json({
                    btc: btc.toFixed(2),
                    eth: eth.toFixed(2),
                    ltc: ltc.toFixed(2)
                });
            });
        });
    });
});
router.get("/api/transactions", isAuthenticated, function(req, res) {
    var user = req.user.id;
    TransactionsAvg.findAll({
        where: {
            user_id: user
        },
        attributes: ["coin"],
        group: "coin"
    }).then(function(data) {
        res.json(data);
    });
});
router.get("/api/coins", isAuthenticated, function(req, res) {
    var user = req.user.id;
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
        // var BTCPrice = new Promise((resolve, reject) => {
        //     bittrex.getticker( { market : 'USDT-BTC' }, function( data, err ) {
        //         var price = data.result.Last;
        //         resolve(price);
        //     });
        // });
        // BTCPrice.then(function(price) {
            results.forEach(function(coin) {
                var ticker = coin.dataValues.coin;
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
                            });
                        });
                    });
                }));
            });
            Promise.all(allPromises).then(function() {
                res.json(coinInfo);
            }).catch((err) => {
                throw err;
            });
        // });
    });

});
module.exports = router;
