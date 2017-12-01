var db = require('./../models');

module.exports = function (app) {
    app.get('/api/authentication', function (req, res) {
        var cred = {
            username: req.body.username,
            password: req.body.password
        };
        db.Auth.findAll({
            where: {
                username: cred.username,
                password: cred.password
            }
        }).then(function (result) {
            console.log(result);
        });
    });

}