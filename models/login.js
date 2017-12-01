// var orm = require("../config/orm.js");

// var login = {
//     confirm: function (cb) {
//         orm.confirm('authentication', function (res) {
//             cb(res);
//         });
//     },
//     create: function (cols, vals, cb) {
//         orm.create("authentication", cols, vals, function (res) {
//             cb(res);
//         });
//     }
// }

module.exports = {
    function(sequelize, DataTypes) {
        var Auth = sequelize.define('Authentication', {
            username: DataTypes.STRING,
            password: DataTypes.STRING
        });
        return Auth;
    }
};