const fs = require('fs');

$('#user-form').on('submit', function() {
    let username = $('#username').val().trim();
    let password = $('#password').val();

    fs.readFile('userauth.json','utf8',(err,data)=> {
        if (err) throw err;
        if(data.includes({'username': username,'password': password})) {
            userAuth = true;
        }
    });
});