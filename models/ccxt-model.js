'use strict';
const ccxt = require('ccxt')
//let exchange = new ccxt.kraken () // default id
// let kraken1 = new ccxt.kraken({ id: 'kraken1' })
// let kraken2 = new ccxt.kraken({ id: 'kraken2' })
// let id = 'gdax'
// let gdax = new ccxt[id]();


var node_ccxt = {
    getExchangeData: async function(exchange, symbol, timeframe, since, limit, params) {
        let selectedExchange = new ccxt[exchange]();
        var selectedDate = new Date(parseInt(since, 10));
        let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        // console.log(selectedExchange.hasFetchOHLCV)
        // console.log(selectedExchange.timeframes);
        if (selectedExchange.hasFetchOHLCV) {

            await selectedExchange.loadMarkets();
            //console.log(exchange.markets);
            console.log(selectedExchange.rateLimit);
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