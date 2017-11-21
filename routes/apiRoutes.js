var connection = require("../config/connection.js");
var user = 1;

// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function(app) {
  // API GET Requests
  // Below code handles when users "visit" a page.
  // In each of the below cases when a user visits a link
  // (ex: localhost:PORT/api/admin... they are shown a JSON of the data in the table)
  // ---------------------------------------------------------------------------

    app.get("/api/transactions/:coin", function(req, res) {
        connection.query(
            "SELECT * FROM transactionsLIFO WHERE user_id = ? AND coin = ?", 
            [user, req.params.coin],
            function(err, data) {
                if (err) throw err;
                res.json(data);
            }
        );
    });

};
