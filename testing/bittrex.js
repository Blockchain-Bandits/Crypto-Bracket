var bittrex = require('node-bittrex-api');
var moment = require('moment');
var connection = require("./config/connection.js");
var transactions = require("../models/transactions.js");
var apiKey = 'e44801d861364fd987f1b980b65c199f';
var apiSecret = '055d6e9715fd463aa4f3c12aff6daabd';
var user = 1;

bittrex.options({
  'apikey' : apiKey,
  'apisecret' : apiSecret
});

// var price;
// bittrex.getticker( { market : 'USDT-BTC' }, function( data, err ) {
//     price = data.result.Last;
// });
bittrex.getorderhistory({}, function( data, err ) {
    if (err) throw err;
    
    data.result.forEach(function(transaction) {
        var buy;
        var sell;
        var price;
        var date = moment(transaction.Closed).format("MMM DD, YYYY");
        transactions.getPrice(date, function(result) {
            price = result[0].price;
        });
        var exchange = transaction.Exchange.split("-");
        if (transaction.OrderType === 'LIMIT_BUY') {
            buy = exchange[1];
            sell = exchange[0];
        } else if (transaction.OrderType === 'LIMIT_SELL') {
            buy = exchange[0];
            sell = exchange[1];
        }
        var transactionData = {
            heldCoin: sell,
            targetCoin: buy,
            BTCPrice: price,
            date: date,
            rate: transaction.PricePerUnit,
            units: transaction.Quantity
        }
        console.log(transactionData);
        //createTrade(transactionData.heldCoin, transactionData.targetCoin, transactionData.BTCPrice, transactionData.date, transactionData.rate, transactionData.units);
    });
});

function createBuy(coin, cost, date, units) {
    console.log("Inserting a new purchase...\n");
    var objColVals = {
        user_id: user,
        coin: coin,
        date: date,
        cost: cost,
        price: cost,
        units: units,
        total_cost: cost * units,
    };
    transactions.insertOneFIFO(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    transactions.insertOneLIFO(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    transactions.insertOneAvg(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    
}

function calculateAvgCost(coin, date, price, units) {
    var totalCost = 0;
    var totalUnits = 0;
    var cost = 0;
    transactions.selectAllAvg(user, coin, function(res) {
        for (var i in res) {
            totalCost += res[i].total_cost;
            totalUnits += res[i].units;
        }
        cost = -totalCost / totalUnits;
        console.log(cost);
        createSaleAvgCost(coin, cost, date, price, units);
    });
    // connection.query(
    //     "SELECT * FROM transactionsAvg WHERE ? AND ?", 
    //     [{
    //         user_id: user
    //     },
    //     {
    //         coin: coin
    //     }],
    //     function(err, res) {
    //         if (err) throw err;
    //         for (var i in res) {
    //             totalCost += res[i].total_cost;
    //             totalUnits += res[i].units;
    //         }
    //         cost = -totalCost / totalUnits;
    //         console.log(cost);
    //         createSaleAvgCost(coin, cost, price, units);
    //     }
    // );
}

function createSaleAvgCost(coin, cost, date, price, units) {
    console.log("Inserting a new sale...\n");
    var objColVals = {
        user_id: user,
        coin: coin,
        cost: cost,
        date: date,
        price: price,
        units: -units,
        total_cost: cost * units,
    };
    transactions.insertOneAvg(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    // connection.query(
    //     "INSERT INTO transactionsAvg SET ?",
    //     {
    //         user_id: user,
    //         coin: coin,
    //         cost: cost,
    //         price: price,
    //         units: -units,
    //         total_cost: cost * units,
    //     },
    //     function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " sale inserted (avg-cost)!\n");
    //     }
    // );
    calculateFIFO(coin, date, price, units);
}

function calculateFIFO(coin, date, price, units) {
    var totalCost = 0;
    var totalUnits = 0;
    var cost = 0;
    transactions.selectAllFIFO(user, coin, function(res) {
        if (err) throw err;
        var entries = res.length - 1;
        var remainingUnits = units;
        var saleUnits = 0;
        var unitCount = 0;
        for (var i = 0; i < res.length; i++) {
            if (res[i].units < 0) {
                saleUnits += res[i].units;
            }
        }
        for (var i = 0; i < res.length; i++) {
            if (remainingUnits > 0 && res[i].units > 0) {
                if (saleUnits < 0) {
                    if (res[i].units <= saleUnits) {
                        saleUnits += res[i].units;
                    } else if (res[i].units > saleUnits) {
                        unitCount = res[i].units + saleUnits;
                        totalUnits = unitCount > remainingUnits ? remainingUnits : unitCount;
                        totalCost += (res[i].cost * totalUnits);
                        remainingUnits -= unitCount;
                        saleUnits = 0;
                    }
                } else {
                    totalUnits = res[i].units > remainingUnits ? remainingUnits : res[i].units;
                    totalCost += (res[i].cost * totalUnits);
                    remainingUnits -= res[i].units;
                }
            }
        }
        cost = -totalCost / units;
        console.log(cost);
        createSaleFIFO(coin, cost, date, price, units);
    });
    // connection.query(
    //     "SELECT * FROM transactionsFIFO WHERE ? AND ?", 
    //     [{
    //         user_id: user
    //     },
    //     {
    //         coin: coin
    //     }],
    //     function(err, res) {
    //         if (err) throw err;
    //         var entries = res.length - 1;
    //         var remainingUnits = units;
    //         var saleUnits = 0;
    //         var unitCount = 0;
    //         for (var i = 0; i < res.length; i++) {
    //             if (res[i].units < 0) {
    //                 saleUnits += res[i].units;
    //             }
    //         }
    //         for (var i = 0; i < res.length; i++) {
    //             if (remainingUnits > 0 && res[i].units > 0) {
    //                 if (saleUnits < 0) {
    //                     if (res[i].units <= saleUnits) {
    //                         saleUnits += res[i].units;
    //                     } else if (res[i].units > saleUnits) {
    //                         unitCount = res[i].units + saleUnits;
    //                         totalUnits = unitCount > remainingUnits ? remainingUnits : unitCount;
    //                         totalCost += (res[i].cost * totalUnits);
    //                         remainingUnits -= unitCount;
    //                         saleUnits = 0;
    //                     }
    //                 } else {
    //                     totalUnits = res[i].units > remainingUnits ? remainingUnits : res[i].units;
    //                     totalCost += (res[i].cost * totalUnits);
    //                     remainingUnits -= res[i].units;
    //                 }
    //             }
    //         }
    //         cost = -totalCost / units;
    //         console.log(cost);
    //         createSaleFIFO(coin, cost, price, units);
    //     }
    // );
}

function createSaleFIFO(coin, cost, date, price, units) {
    console.log("Inserting a new sale...\n");
    var objColVals = {
        user_id: user,
        coin: coin,
        cost: cost,
        date: date,
        price: price,
        units: -units,
        total_cost: cost * units,
    };
    transactions.insertOneFIFO(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    // connection.query(
    //     "INSERT INTO transactionsFIFO SET ?",
    //     {
    //         user_id: user,
    //         coin: coin,
    //         cost: cost,
    //         price: price,
    //         units: -units,
    //         total_cost: cost * units,
    //     },
    //     function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " sale inserted (FIFO)!\n");
    //     }
    // );
    calculateLIFO(coin, date, price, units);
}

function calculateLIFO(coin, date, price, units) {
    var totalCost = 0;
    var totalUnits = 0;
    var cost = 0;
    transactions.selectAllLIFO(user, coin, function(res) {
        if (err) throw err;
        var entries = res.length - 1;
        var remainingUnits = units;
        // if (res[entries].units > units) {
        //     cost = res[entries].cost;
        // }
        var saleUnits = 0;
        var unitCount = 0;
        for (var i = entries; i >= 0; i--) {
            if (remainingUnits > 0) {
                if (res[i].units < 0) {
                    saleUnits += res[i].units;
                } else if (res[i].units > 0) {
                    if (saleUnits < 0) {
                        saleUnits += res[i].units;
                        if (saleUnits > 0) {
                            unitCount = res[i].units - saleUnits;
                            totalUnits = unitCount > remainingUnits ? remainingUnits : unitCount;
                            totalCost += (res[i].cost * totalUnits);
                            remainingUnits -= unitCount;
                            saleUnits = 0;
                        }
                    } else {
                        totalUnits = res[i].units > remainingUnits ? remainingUnits : res[i].units;
                        totalCost += (res[i].cost * totalUnits);
                        remainingUnits -= res[i].units;
                    }
                }
            }
        }
        cost = -totalCost / units;
        console.log(cost);
        createSaleLIFO(coin, cost, date, price, units);
    });
    // connection.query(
    //     "SELECT * FROM transactionsLIFO WHERE ? AND ?", 
    //     [{
    //         user_id: user
    //     },
    //     {
    //         coin: coin
    //     }],
    //     function(err, res) {
    //         if (err) throw err;
    //         var entries = res.length - 1;
    //         var remainingUnits = units;
    //         // if (res[entries].units > units) {
    //         //     cost = res[entries].cost;
    //         // }
    //         var saleUnits = 0;
    //         var unitCount = 0;
    //         for (var i = entries; i >= 0; i--) {
    //             if (remainingUnits > 0) {
    //                 if (res[i].units < 0) {
    //                     saleUnits += res[i].units;
    //                 } else if (res[i].units > 0) {
    //                     if (saleUnits < 0) {
    //                         saleUnits += res[i].units;
    //                         if (saleUnits > 0) {
    //                             unitCount = res[i].units - saleUnits;
    //                             totalUnits = unitCount > remainingUnits ? remainingUnits : unitCount;
    //                             totalCost += (res[i].cost * totalUnits);
    //                             remainingUnits -= unitCount;
    //                             saleUnits = 0;
    //                         }
    //                     } else {
    //                         totalUnits = res[i].units > remainingUnits ? remainingUnits : res[i].units;
    //                         totalCost += (res[i].cost * totalUnits);
    //                         remainingUnits -= res[i].units;
    //                     }
    //                 }
    //             }
    //         }
    //         // while (remainingUnits > 0) {
    //         //     totalUnits = res[entries].units > remainingUnits ? remainingUnits : res[entries].units;
    //         //     totalCost += (res[entries].cost * totalUnits);
    //         //     remainingUnits -= res[entries].units;
    //         //     entries--;
    //         // }
    //         cost = -totalCost / units;
    //         console.log(cost);
    //         createSaleLIFO(coin, cost, price, units);
    //     }
    // );
}

function createSaleLIFO(coin, cost, date, price, units) {
    console.log("Inserting a new sale...\n");
    var objColVals = {
        user_id: user,
        coin: coin,
        cost: cost,
        date: date,
        price: price,
        units: -units,
        total_cost: cost * units,
    };
    transactions.insertOneLIFO(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    // connection.query(
    //     "INSERT INTO transactionsLIFO SET ?",
    //     {
    //         user_id: user,
    //         coin: coin,
    //         cost: cost,
    //         price: price,
    //         units: -units,
    //         total_cost: cost * units,
    //     },
    //     function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " sale inserted (LIFO)!\n");
    //     }
    // );
    // connection.end();
}

function createTrade(heldCoin, targetCoin, BTCPrice, date, rate, units) {
    console.log("Inserting a new purchase...\n");
    var price;
    if (targetCoin === "BTC") {
        price = BTCPrice;
    } else {
        price = BTCPrice * rate;
    }
    var receiveUnits = units * rate;
    var totalCost = price * receiveUnits;
    var objColVals = {
        user_id: user,
        coin: targetCoin,
        cost: price,
        date: date,
        price: price,
        units: receiveUnits,
        total_cost: totalCost,
    };
    transactions.insertOneFIFO(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    transactions.insertOneLIFO(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    transactions.insertOneAvg(objColVals, function(result) {
        // Send back the ID of the new quote
        result.json({ id: result.insertId });
    });
    // connection.query(
    //     "INSERT INTO transactionsAvg SET ?",
    //     {
    //         user_id: user,
    //         coin: targetCoin,
    //         cost: targetCoinPrice,
    //         price: targetCoinPrice,
    //         units: receiveUnits,
    //         total_cost: totalCost,
    //     },
    //     function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " purchase inserted (avg-cost)!\n");
    //     }
    // );
    // connection.query(
    //     "INSERT INTO transactionsFIFO SET ?",
    //     {
    //         user_id: user,
    //         coin: targetCoin,
    //         cost: targetCoinPrice,
    //         price: targetCoinPrice,
    //         units: receiveUnits,
    //         total_cost: totalCost,
    //     },
    //     function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " purchase inserted (FIFO)!\n");
    //     }
    // );
    // connection.query(
    //     "INSERT INTO transactionsLIFO SET ?",
    //     {
    //         user_id: user,
    //         coin: targetCoin,
    //         cost: targetCoinPrice,
    //         price: targetCoinPrice,
    //         units: receiveUnits,
    //         total_cost: totalCost,
    //     },
    //     function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " purchase inserted (LIFO)!\n");
    //     }
    // );
    calculateAvgCost(heldCoin, date, price, units);
}