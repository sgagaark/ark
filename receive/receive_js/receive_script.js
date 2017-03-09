// receive_window淡入淡出
$(document).ready(function(){
  $(".receive_top").click(function(){
    $(".receive_window").fadeIn(500);
    $("#blackbg01").fadeIn(500);
  });
});
$(document).ready(function(){
  $(".window_close").click(function(){
    $(".receive_window").fadeOut(500);
    $("#blackbg01").fadeOut(500);
  });
});
// 刪除跳入視窗淡入淡出
$(document).ready(function(){
  $(".delete").click(function(){
    $(".delete_window").fadeIn(500);
    $("#blackbg02").fadeIn(500);
  });
});
$(document).ready(function(){
  $("#delete_no,#delete_yes").click(function(){
    $(".delete_window").fadeOut(500);
    $("#blackbg02").fadeOut(500);
  });
});
// 檢處跳入視窗淡入淡出
$(document).ready(function(){
  $(".report").click(function(){
    $(".report_window").fadeIn(500);
    $("#blackbg02").fadeIn(500);
  });
});
$(document).ready(function(){
  $("#report_no,#report_yes").click(function(){
    $(".report_window").fadeOut(500);
    $("#blackbg02").fadeOut(500);
  });
});
// 黃船點完變白船
$(document).ready(function(){
  $(".header_boat_link").click(function(){
    $(".header_boat_y").fadeOut(500);
  });
});
// 黃船的特效
// $(document).ready(function(){
//   $(".header_boat_link").mouseenter(function(){
//     $(".header_boat_y img").css('width','50px');
//   });
// });
//   $(document).ready(function(){
//     $(".header_boat_link").mouseleave(function(){
//       $(".header_boat_y img").css('width','auto');
//     });
// });
// 收新傳按鈕
$(document).ready(function(){
  $(".header_boat_link").click(function(){
    $(".new_boat").slideDown(500);
    $(".old_boat").fadeOut(0);
  });
});
