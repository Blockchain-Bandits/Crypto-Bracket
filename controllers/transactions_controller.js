var express = require("express");
var bittrex = require('node-bittrex-api');

var router = express.Router();

var transactions = require("../models/transactions.js");

var user = 1;

var price;
bittrex.getticker( { market : 'USDT-BTC' }, function( data, err ) {
    price = data.result.Last;
});

router.get("/api/transactions/:coin/:method", function(req, res) {
    var coin = req.params.coin;
    var coinPrice;

    bittrex.getticker( { market : `BTC-${coin}` }, function( data, err ) {
        if (coin === 'BTC') {
            coinPrice = price;
        } else {
            coinPrice = data.result.Last * price;
        }
        if (req.params.method === 'fifo') {
            transactions.selectAllFIFO(user, coin, function(data) {
                data.push({currentPrice: coinPrice});
                res.json(data);
            });
        } else if (req.params.method === 'lifo') {
            transactions.selectAllLIFO(user, coin, function(data) {
                data.push({currentPrice: coinPrice});
                res.json(data);
            });
        } else if (req.params.method === 'avg') {
            transactions.selectAllAvg(user, coin, function(data) {
                data.push({currentPrice: coinPrice});
                res.json(data);
            });
        }
    });
});
router.get("/api/transactions", function(req, res) {
    transactions.getCoins(function(data) {
        res.json(data);
    });
    // var date = moment("2017-11-08T18:30:30.05").format("MMM DD, YYYY");
    // transactions.getPrice(date, function(result) {
    //     console.log(result[0].price);
    // });
});

module.exports = router;
