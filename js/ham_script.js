// ham 出現消失
$(document).ready(function(){
  $(".hamburger-menu").click(function(){
    $(".ham_ul").animate({ width: "show" });
    $("#blackbg00").fadeIn(300);
  });
});
$(document).ready(function(){
  $(".ham_close").click(function(){
    $(".ham_ul").animate({ width: "hide" });
    $("#blackbg00").fadeOut(300);
  });
});
// ham hover 換icom
// 01
$(document).ready(function(){
  $(".ham_but_01").mouseenter(function(){
    $(".icom_mous_in01").hide(0);
    $(".icom_mous_out01").show(0);
  });
});
$(document).ready(function(){
  $(".ham_but_01").mouseleave(function(){
    $(".icom_mous_out01").hide(0);
    $(".icom_mous_in01").show(0);
  });
});
// 02
$(document).ready(function(){
  $(".ham_but_02").mouseenter(function(){
    $(".icom_mous_in02").hide(0);
    $(".icom_mous_out02").show(0);
  });
});
$(document).ready(function(){
  $(".ham_but_02").mouseleave(function(){
    $(".icom_mous_out02").hide(0);
    $(".icom_mous_in02").show(0);
  });
});
// 03
$(document).ready(function(){
  $(".ham_but_03").mouseenter(function(){
    $(".icom_mous_in03").hide(0);
    $(".icom_mous_out03").show(0);
  });
});
$(document).ready(function(){
  $(".ham_but_03").mouseleave(function(){
    $(".icom_mous_out03").hide(0);
    $(".icom_mous_in03").show(0);
  });
});
// 04
$(document).ready(function(){
  $(".ham_but_04").mouseenter(function(){
    $(".icom_mous_in04").hide(0);
    $(".icom_mous_out04").show(0);
  });
});
$(document).ready(function(){
  $(".ham_but_04").mouseleave(function(){
    $(".icom_mous_out04").hide(0);
    $(".icom_mous_in04").show(0);
  });
});
// 05
$(document).ready(function(){
  $(".ham_but_05").mouseenter(function(){
    $(".icom_mous_in05").hide(0);
    $(".icom_mous_out05").show(0);
  });
});
$(document).ready(function(){
  $(".ham_but_05").mouseleave(function(){
    $(".icom_mous_out05").hide(0);
    $(".icom_mous_in05").show(0);
  });
});
