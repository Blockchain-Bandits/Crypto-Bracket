'use strict';
const ccxt = require('ccxt');

async function getExchangeData() {
    let selectedExchange = new ccxt.bittrex();
    var selectedDate = new Date('2017-12-09 02:29:00');

    if (selectedExchange.hasFetchOHLCV) {
        
        await selectedExchange.loadMarkets();
        var price = await selectedExchange.fetchOHLCV('BTC/USDT', "1d", selectedDate)
        console.log(price[0][1]);
    }
}

getExchangeData();