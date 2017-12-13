var Sequelize = require("sequelize");
// sequelize (lowercase) references our connection to the DB.
var sequelize = require("../config/connection.js");

// Creates a "Chirp" model that matches up with DB
var TransactionsFIFO = sequelize.define("transactionsFIFO", {
  user_id: {
    type: Sequelize.INTEGER
  },
  coin: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATE
  },
  cost: {
    type: Sequelize.DECIMAL(20, 6)
  },
  price: {
    type: Sequelize.DECIMAL(20, 6)
  },
  rate: {
    type: Sequelize.DECIMAL(20, 6)
  },
  units: {
    type: Sequelize.DECIMAL(20, 6)
  },
  total_cost: {
    type: Sequelize.DECIMAL(20, 6)
  },
});

// Syncs with DB
TransactionsFIFO.sync();

// Makes the Transaction Model available for other files (will also create a table)
module.exports = TransactionsFIFO;
