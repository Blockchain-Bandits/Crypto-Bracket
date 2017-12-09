var bittrex = require('node-bittrex-api');
var connection = require("../config/connection.js");
var ccxt = require('ccxt');
var user = 1;

// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function(app) {
    // API GET Requests
    // Below code handles when users "visit" a page.
    // In each of the below cases when a user visits a link
    // (ex: localhost:PORT/api/admin... they are shown a JSON of the data in the table)
    // ---------------------------------------------------------------------------
    var price;
    bittrex.getticker( { market : 'USDT-BTC' }, function( data, err ) {
        price = data.result.Last;
    });
    
    app.get("/api/transactions/:coin/:method", function(req, res) {
        var coin = req.params.coin;
        var coinPrice;
        bittrex.getticker( { market : `BTC-${coin}` }, function( data, err ) {
            coinPrice = data.result.Last * price;

            if (req.params.method === 'fifo') {
                connection.query(
                    "SELECT * FROM transactionsFIFO WHERE user_id = ? AND coin = ?", 
                    [user, coin],
                    function(err, data) {
                        if (err) throw err;
                        data.push({currentPrice: coinPrice});
                        res.json(data);
                    }
                );
            } else if (req.params.method === 'lifo') {
                connection.query(
                    "SELECT * FROM transactionsLIFO WHERE user_id = ? AND coin = ?", 
                    [user, coin],
                    function(err, data) {
                        if (err) throw err;
                        data.push({currentPrice: coinPrice});
                        res.json(data);
                    }
                );
            } else if (req.params.method === 'avg') {
                connection.query(
                    "SELECT * FROM transactionsAvg WHERE user_id = ? AND coin = ?", 
                    [user, coin],
                    function(err, data) {
                        if (err) throw err;
                        data.push({currentPrice: coinPrice});
                        res.json(data);
                    }
                );
            }
        });
        
    });
    app.get("/api/transactions", function(req, res) {
        connection.query(
            "SELECT coin FROM transactionsFIFO WHERE user_id = 1 GROUP BY coin", 
            function(err, data) {
                if (err) throw err;
                res.json(data);
            }
        );
    });
    //**********************************
    //
    //
    //
    //
    //
    //**********************************
    app.get("/api/ccxt/:exchange/:symbol/:timeframe/:date/:limit", function(req, res) {
        console.log("CCXT");
        var info = ccxt.getExchangeData(req.params.exchange,req.params.symbol,req.params.timeframe,req.params.date,req.params.limit).then(function(info) {
            // We have access to the todos as an argument inside of the callback function
            var plotData1 = [];
            var plotData2 = [];
            var infoItem;
            for (var i = 0; i < info.length; i++) {
                infoItem = info[i];
                plotData1.push({x: infoItem[0], y: infoItem[1]});
            }
            for (var i = 0; i < info.length; i++) {
                infoItem = info[i];
                plotData2.push({x: infoItem[0], y: infoItem[4]});
            }
            //moment(new Date(infoItem[0])).format("ddd MMM DD YYYY, HH:mm:ss")
            res.json({ openPrice: plotData1, closingPrice: plotData2 });
        });
    });

};
