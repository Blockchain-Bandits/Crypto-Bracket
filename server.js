var flash = require('connect-flash');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser'); // for working with cookies
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override'); // for deletes in express
var passport = require("./config/passport");
var config = require("./config/extra-config");
var fileUpload = require('express-fileupload');

var app = express();

app.use(methodOverride('_method'));


// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

app.use(express.static("public"));

var isAuth = require("./config/middleware/isAuthenticated");
var authCheck = require('./config/middleware/attachAuthenticationStatus');

// Sets up the Express app to handle data parsing
app.use(logger('dev'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.sessionKey,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(authCheck);

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

require("./controllers/ccxt")(app);
require('./routes')(app);
require("./controllers/transactions-controller.js");


app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// =============================================================================
// LISTENER
// The below code effectively "starts" our server
// =============================================================================

app.listen(PORT, function () {
  console.log("App listening on PORT: " + PORT);
});