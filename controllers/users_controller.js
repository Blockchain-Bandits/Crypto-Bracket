var DataTypes = require("sequelize");
// sequelize (lowercase) references our connection to the DB.
var sequelize = require("../config/connection.js");
var db = require('../models/user.js')(sequelize, DataTypes);

//this is the users_controller.js file
exports.nameUser = function (req, res) {
  res.json({
    firstname:req.user.firstname,
    lastname:req.user.lastname,
    username:req.user.username
  });
};

exports.signOutUser = function (req, res) {
  req.logout();
  res.redirect("/");
};

// login
exports.loginUser = function (req, res) {
  // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
  // So we're sending the user back the route to the members page because the redirect will happen on the front end
  // They won't get this or even be able to access this page if they aren't authed
  res.json("/home");
};

// register a user
exports.signUpUser = function (req, res) {

  db.findAll({
    where: {username: req.body.username}
  }).then(function(users) {
    if (users.length > 0) {
      res.json({
        duplicateUser: true
      });
    //At some point, make sure that only one user can be associated with an email.
    } else {
      db.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      }).then(function() {
        res.send({redirect: '/'});
      }).catch(function(err) {
        console.log(err);
        res.json(err);
      });
    }
  });
};