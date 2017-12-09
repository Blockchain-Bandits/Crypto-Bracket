
var path = require("path");

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

 app.get("/charts", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/charts.html"));
  });

  app.get("/forms", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/forms.html"));
  });

 app.get("/home", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.get("/login", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

 app.get("/register", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/register.html"));
  });


};
