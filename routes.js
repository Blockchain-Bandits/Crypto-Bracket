module.exports = function (app) {

    // Our model controllers (rather than routes)
    var users = require('./routes/users.js');

    app.use('/users', users);
    //other routes..
}