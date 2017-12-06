module.exports = function(app){
    
            var users_controller = require('./controllers/users_controller');
    
            app.use('/users', users_controller);
        //other routes..
    }