
var ccxt = require("../models/ccxt-model.js");


// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function(app) {
    //**********************************
    //
    //
    //
    //
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
