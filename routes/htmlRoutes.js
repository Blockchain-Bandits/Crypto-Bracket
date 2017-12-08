// ===============================================================================
// DEPENDENCIES
// We need to include the path package to get the correct file path for our html
// ===============================================================================
var path = require("path");


// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function(app) {
  // HTML GET Requests
  // Below code handles when users "visit" a page.
  // In each of the below cases the user is shown an HTML page of content
  // ---------------------------------------------------------------------------

  app.get("/transactions", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/transaction-details.html"));
  });

  // If no matching route is found default to
  app.get("/coins", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/coin-details.html"));
  });
};