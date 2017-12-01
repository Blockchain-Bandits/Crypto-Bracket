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

module.exports = function (sequelize, DataTypes) {
    var Auth = sequelize.define('Auth', {
        username: {
            type:DataTypes.STRING,
            allowNull: false,
            validation: {
                len: [2,18]
            }
        },
        password: {
            type:DataTypes.STRING,
            allowNull: false,
            validation: {
                len: [8]
            }
        }
    });
    return Auth;
}