
var ccxt = require("../models/ccxt-model.js");


// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function(app) {
    //**********************************
    // SEE MANUAL: https://github.com/ccxt/ccxt/wiki/Manual
    //'timeframes': {      // empty if the exchange !hasFetchOHLCV
    //     '1m': '1minute',
    //     '1h': '1hour',
    //     '1d': '1day',
    //     '1M': '1month',
    //     '1y': '1year',
    // },
    //
    //Exchange Data Structure
    //[
    //     [
    //         1504541580000, // UTC timestamp in milliseconds
    //         4235.4,        // (O)pen price
    //         4240.6,        // (H)ighest price
    //         4230.0,        // (L)owest price
    //         4230.7,        // (C)losing price
    //         37.72941911    // (V)olume
    //     ],
    //     ...
    // ]
    // 
    // Use Unix Date with 13 values when passing into request
    // Example: 1512701458000
    //
    //**********************************
    app.get("/api/ccxt/:exchange/:symbol/:timeframe/:date/:limit", function(req, res) {
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
