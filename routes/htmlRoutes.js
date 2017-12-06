
var path = require("path");

module.exports = function(app) {
  // HTML GET Requests
  // Below code handles when users "visit" a page.
  // In each of the below cases the user is shown an HTML page of content
  // ---------------------------------------------------------------------------

  app.get("/transactions", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/transactions.html"));
  });

  // If no matching route is found default to
  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, ""));
  });
};
