var path = require("path");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function (app) {
  // HTML GET Requests
  // Below code handles when users "visit" a page.
  // In each of the below cases the user is shown an HTML page of content
  // ---------------------------------------------------------------------------

  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.get("/transactions", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/transaction-details.html"));
  });

  // If no matching route is found default to
  app.get("/coins", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/coin-details.html"));
  });

  app.get("/charts", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

  app.get("/register", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/register.html"));
  });

  app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/about.html"));
  });

  app.get("/home", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/home.html"));
  });

  app.get("/explore", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/explore.html"));
  });


};