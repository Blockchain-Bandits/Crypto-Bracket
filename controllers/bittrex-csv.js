// var bittrex = require('node-bittrex-api');
var moment = require('moment');
var csv = require('fast-csv');
var fs = require('fs');
var connection = require("../config/connection.js");
var transactions = require("../models/transactions.js");
// var apiKey = 'e44801d861364fd987f1b980b65c199f';
// var apiSecret = '055d6e9715fd463aa4f3c12aff6daabd';
// var mysql = require("mysql");

// var connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "project_two"
// });

// connection.connect(function(err) {
//   if (err) {
//     console.error("error connecting: " + err.stack);
//     return;
//   }
//   console.log("connected as id " + connection.threadId);
// });

var user = 1;

var stream = fs.createReadStream("../public/assets/fullOrders.csv");

var allPromises = [];

stream.pipe(csv.parse({ headers: true })).transform(row => {
    var buy;
    var sell;
    var date = moment(row['Closed']).format("MMM DD, YYYY");
    // var BTCPrice = new Promise((resolve, reject) => {
    //     transactions.getPrice(date, function(result) {
    //         var price = result[0].price;
    //         resolve(price);
    //     });
    // });
    var exchange = row['Exchange'].split("-");
    if (row["Type"] === 'LIMIT_BUY') {
        buy = exchange[1];
        sell = exchange[0];
    } else if (row["Type"] === 'LIMIT_SELL') {
        buy = exchange[0];
        sell = exchange[1];
    }
    // BTCPrice.then(function(price) {
        return {
            heldCoin: sell,
            targetCoin: buy,
            date: date,
            // price: price,
            rate: row['Limit'],
            units: row['Quantity']
        };
    // })
    
})
.on('data', function(data) {
    console.log(data);
    // testEntry(data.heldCoin, data.targetCoin, data.price, data.date, data.rate, data.units);
    // var data;
    // while (null !== (data = stream.read())) {
    // allPromises.push(new Promise((resolve, reject) => {
        var BTCPrice = new Promise((resolve, reject) => {
            transactions.getPrice(data.date, function(res) {
                var price = res[0].price;
                resolve(price);
            });
            // var price;
            // connection.query(
            //     "SELECT price FROM btc_price WHERE ?", 
            //     {
            //         date: data.date
            //     },
            //     function(err, res) {
            //         if(res[0].price) {
            //             price = res[0].price;
            //         } else {
            //             price = 0;
            //         }
            //         resolve(price);                
            //     }
            // );
        });
        BTCPrice.then(function(price) {
            testEntry(data.heldCoin, data.targetCoin, price, data.date, data.rate, data.units);
        });
    // }));
})
.on('end', () => {
    console.log("Import Complete");    
    // Promise.all(allPromises).then(() => {
    //     console.log(`---------- Imported ${allPromises.length} transactions ----------`);
    //     process.exit();
    // }).catch((err) => {
    //     throw err;
    // });
});

function testEntry(heldCoin, targetCoin, price, date, rate, units) {
    console.log("Inserting a new buy...\n");
    connection.query(
        "INSERT INTO transactionsAvg SET ?",
        {
            user_id: user,
            coin: targetCoin,
            cost: price * rate,
            date: date,
            price: rate,
            units: units,
            total_cost: price * rate * units,
        },
        function(err, res) {
            if (err) throw err;
        }
    );
}

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