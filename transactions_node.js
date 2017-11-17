var mysql = require("mysql");
var inquirer = require("inquirer");
var user = 1;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "project_two"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    inquirer.prompt([
        {
            name: "create",
            type: "list",
            message: "What would you like to do?",
            choices: ["buy","sell","trade","history"]
        }
    ]).then(function(answers) {
        if (answers.create === "buy") {
            inquirer.prompt([
                {
                    name: "coin",
                    message: "Which coin?"
                },
                {
                    name: "cost",
                    message: "What is the cost?"
                },
                {
                    name: "units",
                    message: "How many units?"
                }
            ]).then(function(answers) {
                createBuy(answers.coin, answers.cost, answers.units);
            });
        } else if (answers.create === "sell") {
            inquirer.prompt([
                {
                    name: "coin",
                    message: "Which coin?"
                },
                {
                    name: "price",
                    message: "What is the price?"
                },
                {
                    name: "units",
                    message: "How many units?"
                }
            ]).then(function(answers) {
                calculateAvgCost(answers.coin, answers.price, answers.units);
                // calculateFIFO(answers.price, answers.units);
                // calculateLIFO(answers.price, answers.units);
            });
        } else if (answers.create === "trade") {
            inquirer.prompt([
                {
                    name: "heldCoin",
                    message: "What coin do you have?"
                },
                {
                    name: "targetCoin",
                    message: "What coin do you want?"
                },
                {
                    name: "targetCoinPrice",
                    message: "What is the price of that coin?"
                },
                {
                    name: "rate",
                    message: "What is the exchange rate?"
                },
                {
                    name: "units",
                    message: "How many units are you giving up?"
                }
            ]).then(function(answers) {
                createTrade(answers.heldCoin, answers.targetCoin, answers.targetCoinPrice, answers.rate, answers.units);
            });
        } else if (answers.create === "history") {
            inquirer.prompt([
                {
                    name: "coin",
                    message: "Which coin?"
                },
                {
                    name: "method",
                    type: "list",
                    message: "Which method?",
                    choices: ["avg-cost","FIFO","LIFO"]
                }
            ]).then(function(answers) {
                listTransactions(answers.coin, answers.method);
            });
        }
    });
});

function createBuy(coin, cost, units) {
    console.log("Inserting a new purchase...\n");

    connection.query(
        "INSERT INTO transactionsAvg SET ?",
        {
            user_id: user,
            coin: coin,
            cost: cost,
            price: cost,
            units: units,
            total_cost: cost * units,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " purchase inserted (avg-cost)!\n");
        }
    );
    connection.query(
        "INSERT INTO transactionsFIFO SET ?",
        {
            user_id: user,
            coin: coin,
            cost: cost,
            price: cost,
            units: units,
            total_cost: cost * units,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " purchase inserted (FIFO)!\n");
        }
    );
    connection.query(
        "INSERT INTO transactionsLIFO SET ?",
        {
            user_id: user,
            coin: coin,
            cost: cost,
            price: cost,
            units: units,
            total_cost: cost * units,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " purchase inserted (LIFO)!\n");
        }
    );
    connection.end();
}

function calculateAvgCost(coin, price, units) {
    var totalCost = 0;
    var totalUnits = 0;
    var cost = 0;
    connection.query(
        "SELECT * FROM transactionsAvg WHERE ? AND ?", 
        [{
            user_id: user
        },
        {
            coin: coin
        }],
        function(err, res) {
            if (err) throw err;
            for (var i in res) {
                totalCost += res[i].total_cost;
                totalUnits += res[i].units;
            }
            cost = -totalCost / totalUnits;
            console.log(cost);
            createSaleAvgCost(coin, cost, price, units);
        }
    );
}

function createSaleAvgCost(coin, cost, price, units) {
    console.log("Inserting a new sale...\n");
    connection.query(
        "INSERT INTO transactionsAvg SET ?",
        {
            user_id: user,
            coin: coin,
            cost: cost,
            price: price,
            units: -units,
            total_cost: cost * units,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " sale inserted (avg-cost)!\n");
        }
    );
    calculateFIFO(coin, price, units);
}

function calculateFIFO(coin, price, units) {
    var totalCost = 0;
    var totalUnits = 0;
    var cost = 0;
    connection.query(
        "SELECT * FROM transactionsFIFO WHERE ? AND ?", 
        [{
            user_id: user
        },
        {
            coin: coin
        }],
        function(err, res) {
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
            createSaleFIFO(coin, cost, price, units);
        }
    );
}

function createSaleFIFO(coin, cost, price, units) {
    console.log("Inserting a new sale...\n");
    connection.query(
        "INSERT INTO transactionsFIFO SET ?",
        {
            user_id: user,
            coin: coin,
            cost: cost,
            price: price,
            units: -units,
            total_cost: cost * units,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " sale inserted (FIFO)!\n");
        }
    );
    calculateLIFO(coin, price, units);
}

function calculateLIFO(coin, price, units) {
    var totalCost = 0;
    var totalUnits = 0;
    var cost = 0;
    connection.query(
        "SELECT * FROM transactionsLIFO WHERE ? AND ?", 
        [{
            user_id: user
        },
        {
            coin: coin
        }],
        function(err, res) {
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
            // while (remainingUnits > 0) {
            //     totalUnits = res[entries].units > remainingUnits ? remainingUnits : res[entries].units;
            //     totalCost += (res[entries].cost * totalUnits);
            //     remainingUnits -= res[entries].units;
            //     entries--;
            // }
            cost = -totalCost / units;
            console.log(cost);
            createSaleLIFO(coin, cost, price, units);
        }
    );
}

function createSaleLIFO(coin, cost, price, units) {
    console.log("Inserting a new sale...\n");
    connection.query(
        "INSERT INTO transactionsLIFO SET ?",
        {
            user_id: user,
            coin: coin,
            cost: cost,
            price: price,
            units: -units,
            total_cost: cost * units,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " sale inserted (LIFO)!\n");
        }
    );
    connection.end();
}

function createTrade(heldCoin, targetCoin, targetCoinPrice, rate, units) {
    console.log("Inserting a new purchase...\n");
    var price = targetCoinPrice * rate;
    var receiveUnits = units * rate;
    var totalCost = price * receiveUnits;
    connection.query(
        "INSERT INTO transactionsAvg SET ?",
        {
            user_id: user,
            coin: targetCoin,
            cost: targetCoinPrice,
            price: targetCoinPrice,
            units: receiveUnits,
            total_cost: totalCost,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " purchase inserted (avg-cost)!\n");
        }
    );
    connection.query(
        "INSERT INTO transactionsFIFO SET ?",
        {
            user_id: user,
            coin: targetCoin,
            cost: targetCoinPrice,
            price: targetCoinPrice,
            units: receiveUnits,
            total_cost: totalCost,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " purchase inserted (FIFO)!\n");
        }
    );
    connection.query(
        "INSERT INTO transactionsLIFO SET ?",
        {
            user_id: user,
            coin: targetCoin,
            cost: targetCoinPrice,
            price: targetCoinPrice,
            units: receiveUnits,
            total_cost: totalCost,
        },
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " purchase inserted (LIFO)!\n");
        }
    );
    calculateAvgCost(heldCoin, price, units);
}

function listTransactions(coin, method) {
    if (method === "avg-cost") {
        console.log("Selecting all transactions (avg-cost)\n");
        connection.query(
            "SELECT * FROM transactionsAvg WHERE ?", 
            {
                user_id: user,
                coin: coin
            },
            function(err, res) {
                if (err) throw err;
                // Log all results of the SELECT statement
                console.log(res);
            }
        );
    } else if (method === "FIFO") {
        console.log("Selecting all transactions (FIFO)\n");
        connection.query(
            "SELECT * FROM transactionsFIFO WHERE ?", 
            {
                user_id: user,
                coin: coin
            },
            function(err, res) {
                if (err) throw err;
                // Log all results of the SELECT statement
                console.log(res);
            }
        );
    } else if (method === "LIFO") {
        console.log("Selecting all transactions (FIFO)\n");
        connection.query(
            "SELECT * FROM transactionsLIFO WHERE ?", 
            {
                user_id: user,
                coin: coin
            },
            function(err, res) {
                if (err) throw err;
                // Log all results of the SELECT statement
                console.log(res);
            }
        );
    }
    connection.end();
}