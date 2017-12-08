'use strict';
const ccxt = require('ccxt')
//let exchange = new ccxt.kraken () // default id
// let kraken1 = new ccxt.kraken({ id: 'kraken1' })
// let kraken2 = new ccxt.kraken({ id: 'kraken2' })
// let id = 'gdax'
// let gdax = new ccxt[id]();


var node_ccxt = {
    getExchangeData: async function(exchange, symbol, timeframe, since, limit, params) {
        let selectedExchange = new ccxt[exchange]()
        var selectedDate = new Date(parseInt(since,10));

        console.log(selectedExchange.hasFetchOHLCV)
        if (selectedExchange.hasFetchOHLCV) {
            
                await selectedExchange.loadMarkets();
                //console.log(exchange.markets);
                console.log(selectedExchange.rateLimit);

                //await sleep (exchange.rateLimit); // milliseconds
                return await selectedExchange.fetchOHLCV(symbol, timeframe, selectedDate, limit); // one minute
        }
    }
};


module.exports = node_ccxt;
