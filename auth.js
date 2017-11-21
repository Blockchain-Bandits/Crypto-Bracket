var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var port = 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	// Your username
	user: "root",

	// Your password
	password: "",
	database: "masterAuth"
});

connection.connect(function (err) {
	if (err) throw err;
});

app.post("/", function (req, res) {
	function verifyUsername() {
		connection.query(function (err, result) {

		});
	}

	function addCredentials() {
		connection.query("INSERT INTO masterAuth (username,password) VALUES (?,?)", [req.body.username, req.body.password], function (err, result) {
			if (err) throw err;

			res.redirect("/");
		});
	}
});

app.listen(port);