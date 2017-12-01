$(document).ready(function () {
    $(document).on('submit', '#login-form', loginReq);

    function loginReq() {
        var cred = {
            username: $('#username').val().trim(),
            username: $('#password').val().trim()
        }

        $.get("/api/login", function (data) {
            
        });
    }
});