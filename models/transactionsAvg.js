var Sequelize = require("sequelize");
// sequelize (lowercase) references our connection to the DB.
var sequelize = require("../config/connection.js");

// Creates a "Chirp" model that matches up with DB
var TransactionsAvg = sequelize.define("transactionsAvg", {
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
    type: Sequelize.DECIMAL(10, 6)
  },
  price: {
    type: Sequelize.DECIMAL(10, 6)
  },
  rate: {
    type: Sequelize.DECIMAL(10, 6)
  },
  units: {
    type: Sequelize.DECIMAL(10, 6)
  },
  total_cost: {
    type: Sequelize.DECIMAL(10, 6)
  },
});

// Syncs with DB
TransactionsAvg.sync();

// Makes the Transaction Model available for other files (will also create a table)
module.exports = TransactionsAvg;
