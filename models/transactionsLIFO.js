var Sequelize = require("sequelize");
// sequelize (lowercase) references our connection to the DB.
var sequelize = require("../config/connection.js");

// Creates a "Chirp" model that matches up with DB
var TransactionsLIFO = sequelize.define("transactionsLIFO", {
  user_id: {
    type: Sequelize.INTEGER
  },
  coin: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.STRING
  },
  cost: {
    type: Sequelize.DECIMAL(10, 2)
  },
  price: {
    type: Sequelize.DECIMAL(10, 2)
  },
  rate: {
    type: Sequelize.DECIMAL(10, 6)
  },
  units: {
    type: Sequelize.DECIMAL(10, 2)
  },
  total_cost: {
    type: Sequelize.DECIMAL(10, 2)
  },
});

// Syncs with DB
TransactionsLIFO.sync();

// Makes the Transaction Model available for other files (will also create a table)
module.exports = TransactionsLIFO;
