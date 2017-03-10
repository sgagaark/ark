var globalnum = 0;
// send_window淡入淡出
$(document).ready(function(){
  $(".send_top").click(function(){
    $("#window"+globalnum).fadeIn(500);
    $("#blackbg01").fadeIn(500);
  });
});

function setNextShow(num) {
  globalnum = num;
}

$(document).ready(function () {
  $(".window_close").click(function () {
    $(".send_window").fadeOut(500);
    $("#blackbg01").fadeOut(500);
  });
});
// 刪除跳入視窗淡入淡出
$(document).ready(function () {
  $(".delete").click(function () {
    $(".delete_window").fadeIn(500);
    $("#blackbg02").fadeIn(500);
  });
});
$(document).ready(function () {
  $("#delete_no,#delete_yes").click(function () {
    $(".delete_window").fadeOut(500);
    $("#blackbg02").fadeOut(500);
  });
});
// 檢處跳入視窗淡入淡出
$(document).ready(function () {
  $(".report").click(function () {
    $(".report_window").fadeIn(500);
    $("#blackbg02").fadeIn(500);
  });
});
$(document).ready(function () {
  $("#report_no,#report_yes").click(function () {
    $(".report_window").fadeOut(500);
    $("#blackbg02").fadeOut(500);
  });
});
// 刪除按鈕
// $(document).ready(function(){
//   $(".send_bottom_features").hover(function(){
//     $(".delete_black").fadeIn(500);
//   });
