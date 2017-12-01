var db = require('./../models');

module.exports = function(app) {
    app.get('/api/authentication', function(req, res) {
        db.Auth.findAll({
            attrtributes:['auth',[username,password]] 
        }).then(function(result) {
            if(result === [username,password]) {
                
            }
        });
    });
    
}