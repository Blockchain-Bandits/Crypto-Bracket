// var bittrex = require('node-bittrex-api');
var moment = require('moment');
var csv = require('fast-csv');
var fs = require('fs');
var Transaction = require("../models/transaction-sequelize.js");
// var connection = require("../config/connection.js");
// var transactions = require("../models/transactions.js");
// var apiKey = 'e44801d861364fd987f1b980b65c199f';
// var apiSecret = '055d6e9715fd463aa4f3c12aff6daabd';
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "project_two"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

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
            // transactions.getPrice(data.date, function(res) {
            //     var price = res[0].price;
            //     resolve(price);
            // });
            connection.query(
                "SELECT price FROM btc_price WHERE ?", 
                {
                    date: data.date
                },
                function(err, res) {
                    var price = res[0].price;
                    resolve(price);                
                }
            );
        });
        BTCPrice.then(function(price) {
            var coinPrice = price * data.rate;
            if (data.targetCoin === 'BTC') {
                coinPrice = price;
            }
            Transaction.create({
                user_id: user,
                coin: data.targetCoin,
                cost: coinPrice,
                date: data.date,
                price: data.rate,
                units: data.units,
                total_cost: coinPrice * data.units,
            });
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
        "INSERT INTO transactions SET ?",
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

