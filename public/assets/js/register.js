$(document).ready(function () {
    $(document).on('submit', '#register-form', newUserReq);

    function newUserReq() {
        var cred = {
            username: $('#username').val().trim(),
            password: $('#password').val().trim()
        }

        $.post("/api/login/new", function (data) {
            
        }).done(function() {

        });
    }
});