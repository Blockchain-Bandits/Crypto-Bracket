'use strict';
const ccxt = require('ccxt')

var node_ccxt = {
    getExchangeData: async function(exchange, symbol, timeframe, since, limit, params) {
        let selectedExchange = new ccxt[exchange]();
        var selectedDate = new Date(parseInt(since, 10));
        let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        if (selectedExchange.hasFetchOHLCV) {

            await selectedExchange.loadMarkets();

            await sleep(exchange.rateLimit) // milliseconds

            return await selectedExchange.fetchOHLCV(symbol, timeframe, selectedDate, limit); // one minute
        }else{
            return null;
        }
    },
    getExchanges: async function() {
        return ccxt.exchanges;
    },
    getExchangeInfo: async function(exchange) {
        let selectedExchange = new ccxt[exchange]();
        let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
       
        let markets = await selectedExchange.load_markets();

        if (selectedExchange.hasFetchOHLCV) {
            await sleep(exchange.rateLimit) // milliseconds
            var availableTimeframes = Object.keys(selectedExchange.timeframes);
            return { symbols: selectedExchange.symbols, timeframes: availableTimeframes };
        }else{
            return null;
        }


    }
};


module.exports = node_ccxt;