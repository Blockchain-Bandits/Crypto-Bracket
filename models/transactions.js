var orm = require("../config/orm.js");

var transactions = {
  getCoins: function(cb) {
    orm.getCoins(function(res) {
      cb(res);
    });
  },
  selectAllFIFO: function(user, coin, cb) {
    orm.selectAll("transactionsFIFO", user, coin, function(res) {
      cb(res);
    });
  },
  selectAllLIFO: function(user, coin, cb) {
    orm.selectAll("transactionsLIFO", user, coin, function(res) {
      cb(res);
    });
  },
  selectAllAvg: function(user, coin, cb) {
    orm.selectAll("transactionsAvg", user, coin, function(res) {
      cb(res);
    });
  },

  insertOneFIFO: function(objColVals, cb) {
    orm.insertOne("transactionsFIFO", objColVals, function(res) {
      cb(res);
    });
  },
  insertOneLIFO: function(objColVals, cb) {
    orm.insertOne("transactionsLIFO", objColVals, function(res) {
      cb(res);
    });
  },
  insertOneAvg: function(objColVals, cb) {
    orm.insertOne("transactionsAvg", objColVals, function(res) {
      cb(res);
    });
  }
};

module.exports = transactions;
