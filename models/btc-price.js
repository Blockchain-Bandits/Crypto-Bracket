var Sequelize = require("sequelize");
// sequelize (lowercase) references our connection to the DB.
var sequelize = require("../config/connection.js");

// Creates a "Chirp" model that matches up with DB
var BtcPrice = sequelize.define("btcPrice", {
  date: {
    type: Sequelize.STRING
  },
  price: {
    type: Sequelize.DECIMAL(10, 2)
  },
  open: {
    type: Sequelize.DECIMAL(10, 6)
  },
  high: {
    type: Sequelize.DECIMAL(10, 2)
  },
  low: {
    type: Sequelize.DECIMAL(10, 2)
  },
  percent_change: {
    type: Sequelize.DECIMAL(10, 2)
  },
});

// Syncs with DB
BtcPrice.sync();

// Makes the Transaction Model available for other files (will also create a table)
module.exports = BtcPrice;
