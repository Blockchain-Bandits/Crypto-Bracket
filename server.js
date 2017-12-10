var express = require("express");
var bodyParser = require("body-parser");
var fileUpload = require('express-fileupload');
var app = express();


// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
// ================================================================================
// ROUTER
// The below points our server to a series of "route" files.
// These routes give our server a "map" of how to respond when users visit or request data from various URLs.
// ================================================================================

require("./routes/htmlRoutes")(app);
require("./controllers/ccxt")(app);
require("./controllers/bittrex-csv.js")(app);
var routes = require("./controllers/transactions-controller.js");

app.use("/", routes);
// =============================================================================
// LISTENER
// The below code effectively "starts" our server
// =============================================================================

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
