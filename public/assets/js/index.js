// makes the parallax elements
function parallaxIt() {

  // create variables
  var $fwindow = $(window);
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // on window scroll event
  $fwindow.on('scroll resize', function () {
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  });

  // for each of content parallax element
  $('[data-type="content"]').each(function (index, e) {
    var $contentObj = $(this);
    var fgOffset = parseInt($contentObj.offset().top);
    var yPos;
    var speed = ($contentObj.data('speed') || 1);

    $fwindow.on('scroll resize', function () {
      yPos = fgOffset - scrollTop / speed;

      $contentObj.css('top', yPos);
    });
  });

  // for each of background parallax element
  $('[data-type="background"]').each(function () {
    var $backgroundObj = $(this);
    var bgOffset = parseInt($backgroundObj.offset().top);
    var yPos;
    var coords;
    var speed = ($backgroundObj.data('speed') || 0);

    $fwindow.on('scroll resize', function () {
      yPos = -((scrollTop - bgOffset) / speed);
      coords = '40% ' + yPos + 'px';

      $backgroundObj.css({
        backgroundPosition: coords
      });
    });
  });

  // triggers winodw scroll for refresh
  $fwindow.trigger('scroll');
};

parallaxIt();

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
  });

});

// $(document).ready(function(){       
//             var scroll_pos = 0;
//             $(document).scroll(function() { 
//                 scroll_pos = $(this).scrollTop();
//                 if(scroll_pos > 50) {
//                     $("nav").css('background-color', 'white');
//                     $("nav a").css('color', 'black');
//                 } else {
//                     $("nav").css('background-color', 'transparent');
//                     $("nav a").css('color', 'white');
//                 }
//             });
//         });


// $(document).ready(function(){       
//             var scroll_pos = 0;
//             $(document).scroll(function() { 
//                 scroll_pos = $(this).scrollTop();
//                 if(scroll_pos > 50) {
//                     $("nav").css('background-color', 'transparent');
//                     $("nav a").css('color', 'black');
//                 } else {
//                     $("nav").css('background-color', 'black');
//                     $("nav a").css('color', 'white');
//                 }
//             });
//         });