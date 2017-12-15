$(document).ready(function () {

  $.get('/users/name', function (res) {
    if (!res.firstname && !res.username) {
      $("#nameDisp").text('Welcome!');
    } else {
      if (res.firstname) {
        if (res.lastname) {
          $("#nameDisp").text(res.firstname + " " + res.lastname);
        } else {
          $("#nameDisp").text(res.firstname);
        }
      } else {
        $('#nameDisp').text(res.username);
      }
    }

    if (!res.firstname && !res.username) {
      $('.logout').attr('href','/login');
      $('.logout').text('Login');
    } else {
      $('.logout').attr('href','/users/sign-out');
      $('.logout').text('Logout');
    }
  });

});