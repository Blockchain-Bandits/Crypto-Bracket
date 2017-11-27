const userauth = require('./userauth.js');
const connection = require('./connection.js')

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