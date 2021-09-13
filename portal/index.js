
var currentUID;
var dbdata = {};
var NO_NAME = "匿名";
var DELETE_TEXT = "--削除済み--";

window.onkeydown = function(e) {
  if ( e.keyCode == "9" ) return false;
}

function formatDate(date) {
  var m = moment(date);
  if (m.isValid()) {
    return m.format("YYYY/MM/DD") + " " + m.format("HH:mm");
  } else {
    return "";
  }
}

function outStr(val) {
  //console.log(val);
}

function switchComp(compName) {
  var $target = $(".comp-" + compName);
  if ($target.hasClass("comp-show")) return;
  $(".comp").removeClass("comp-show");
  $target.addClass("comp-show");
}

function showComp() {
  if (location.hash.length == 0) {
    switchComp("main");
    return;
  }
  switchComp(decodeURIComponent(location.hash.substring(1)));
}

window.onhashchange = function() {
  showComp();
};

function addComment(commentId, comment, isAllowReply) {
  if (!currentUID) return;
  
  outStr("コメント追加");
  outStr(comment.text);
  var divTag = $(".comment-template .comment").clone();
  var user = dbdata.users[comment.uid];
  if (user) {
    divTag.children(".comment-nickname").text(user.name);
  }
  divTag.children(".comment-text").text(comment.text);
  divTag.children(".comment-time").text(formatDate(new Date(comment.time)));
  divTag.attr("data-comment-id", commentId);
  
  divTag.click(function(event) {
    $(this).children(".comment-text").toggleClass("comment-collapse").hide().fadeIn(300);
    event.stopPropagation();
  });
  
  if( isAllowReply ) {
    divTag.children(".comment-reply").click(function() {
      var $parent = $(this).parent();
      if ($parent.children(".reply").length == 0) {
        $(".reply").insertAfter($parent.children(".comment-time")).hide().fadeIn(300);
      } else {
        $(".reply").appendTo(".comment-template");
      }
      return false;
    });
  } else {
    divTag.children(".comment-reply").remove();
  }
  
  if (comment.uid == currentUID) {
    divTag.addClass("current-user");
    divTag.children(".comment-delete").click(function() {
      try {
        if (!currentUID) {
          $(".bbs-error").text("ERROR：投稿削除に失敗しました");
          return false;
        }
        
        var $this = $(this).parent();
        if (!$this.hasClass("current-user")) {
          $(".bbs-error").text("ERROR：投稿削除できません");
          return false;
        }
        
        if (!confirm("投稿を削除しますか？")) return false;
        
        var commentID = $this.data("comment-id");
        if (!!dbdata.comments && !!dbdata.comments[commentID] && dbdata.comments[commentID].uid == currentUID) {
          firebase.database().ref("comments/" + commentID).set(null);
        }
      } catch(error) {
        console.error(error);
      }
      return false;
    });
  } else {
    outStr("他人のコメント");
    divTag.children(".comment-delete").remove();
  }
  
  if (comment.resid) {
    if ($("[data-comment-id='" + comment.resid + "']").length == 0) {
      addComment(comment.resid, {
        uid: "",
        text: DELETE_TEXT,
        time: "",
      }, false);
    }
    divTag.appendTo("[data-comment-id='" + comment.resid + "']");
  } else {
    divTag.prependTo(".comment-timeline");
  }
}

function removeComment(commentId, comment) {
  if (!currentUID) return;
  
  outStr("コメント削除");
  
  $(".reply").appendTo(".comment-template");
  
  var $target = $("[data-comment-id='" + commentId + "']");
  if ($target.find(".comment").length > 0) {
      $target.children(".comment-text").text(DELETE_TEXT);
      $target.children(".comment-nickname").text("");
      $target.children(".comment-time").text("");
      $target.children(".comment-reply").remove();
      $target.children(".comment-delete").remove();
  } else {
    $("[data-comment-id='" + commentId + "']").remove();
  }
}


function loadData() {
  dbdata = {};
  
  var usersRef = firebase.database().ref("users");
  usersRef.off("value");
  usersRef.on("value", function(usersSnapshot) {
    outStr("ユーザ更新");
    dbdata.users = usersSnapshot.val();
    if (dbdata.users && dbdata.users[currentUID]) {
      $(".comment-form-nickname").val(dbdata.users[currentUID].name);
    }
    $(".bbs-info").text("");
    $(".bbs").removeClass("bbs-loading");
  });
  
  var commentsRef = firebase.database().ref("comments");
  commentsRef.off();
  commentsRef.on("value", function(commentsSnapshot) {
    outStr("コメント更新");
    dbdata.comments = commentsSnapshot.val();
  });
  commentsRef.on("child_added", function(childSnapshot, prevChildKey) {
    addComment(childSnapshot.key, childSnapshot.val(), true);
  });
  commentsRef.on("child_removed", function(childSnapshot, prevChildKey) {
    removeComment(childSnapshot.key, childSnapshot.val());
  });
}


function initBBS() {
  firebase.auth().onAuthStateChanged(function(user) {
    if ((user && currentUID === user.uid) || (!user && currentUID === null)) {
      return;
    }
    
    if (user) {
      outStr("ログインしました");
      currentUID = user.uid;
      loadData();
    } else {
      outStr("ログインしていません");
      currentUID = null;
      
      firebase.auth().signInAnonymously().catch(function(error) {
        console.error("ログインエラー", error);
        $(".bbs-error").text("ERROR：現在投稿できません");
        $(".bbs").addClass("bbs-loading");
      });
    }
    
  });
  
  $(".comment-form").focusout(function(event) {
    var $this = $(this);
    var nameVal = $this.find(".comment-form-nickname").val();
    var textVal = $this.find(".comment-form-text").val();
    $(".comment-form").each(function(index, element) {
      var $element = $(element);
      $element.find(".comment-form-nickname").val(nameVal);
      $element.find(".comment-form-text").val(textVal);
    });
  });
  
  $(".comment-form").submit(function() {
    try {
      if (!currentUID) {
        $(".bbs-error").text("ERROR：投稿に失敗しました");
        return false;
      }
      
      var $this = $(this);
      var comment = $this.find(".comment-form-text").val();
      if (comment === "") {
        $(".bbs-error").text("ERROR：コメントなしじゃ、投稿できんなぁ…");
        return false;
      }
      
      var nickname = $this.find(".comment-form-nickname").val();
      if (nickname === "") {
        nickname = NO_NAME;
      }
      
      if (!dbdata.users || !dbdata.users[currentUID]) {
        var currentUser = firebase.auth().currentUser;
        if (!!currentUser) {
          outStr("ユーザデータを作成");
          firebase.database().ref("users/" + currentUID).set({
            name: nickname,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
          });
        }
      } else {
        firebase.database().ref("users/" + currentUID).update({
          name: nickname,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      }
      $(".current-user .comment-nickname").text(nickname);
      
      var commentID = $this.parent().parent().data("comment-id");
      var commentData = {
        uid: currentUID,
        text: comment,
        time: firebase.database.ServerValue.TIMESTAMP,
      };
      if (commentID) commentData["resid"] = commentID;
      firebase.database().ref().child("comments").push(commentData);
      
      $(".comment-form-text").val("");
      $(".reply").appendTo(".comment-template");
    } catch(error) {
      console.error(error);
    }
    
    return false;
  });
}


function initSwiper() {
  var swiperFrontLength = $(".swiper-front .swiper-inner").length;
  
  var swiperBgBox = new Swiper(".swiper-bg-box", {
    effect: "cube",
    cubeEffect: {
      shadow: true,
      slideShadows: true,
      shadowOffset: 40,
      shadowScale: 0.5,
    },
    loop: true,
    loopAdditionalSlides: 1,
    nested: true,
    allowTouchMove: false
  });
  
  var swiperFront = new Swiper(".swiper-front", {
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: 0,
    speed: 300,
    pagination: {
      el: ".swiper-front>.swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-front>.swiper-button-next",
      prevEl: ".swiper-front>.swiper-button-prev",
    },
    controller: {
      control: [swiperBgBox],
      by: "container",
    },
    on: {
      slideChangeTransitionEnd: function() {
        if (swiperFront && (this.activeIndex == swiperFrontLength + 2)) {
          this.slideToLoop(0, 0);
        }
      }
    },
    slidesPerView: 1.2,
    keyboard: true,
    nested: true,
    threshold: 10,
    loop: true,
    loopAdditionalSlides: 1,
    a11y: true
  });
  
  for(var i = 1; i <= 7; i++) {
    var swiperBgBoxInner = new Swiper(".swiper-bg-box .swiper-inner-" + i, {
      touchEventsTarget: "wrapper",
      effect: "cube",
      cubeEffect: {
        shadow: false,
        slideShadows: true,
      },
      loop: true,
      loopAdditionalSlides: 1,
      direction: "vertical",
      allowTouchMove: false
    });
    
    new Swiper(".swiper-front .swiper-inner-" + i, {
      touchEventsTarget: "wrapper",
      slidesPerView: "auto",
      centeredSlides: true,
      spaceBetween: 0,
      direction: "vertical",
      speed: 300,
      pagination: {
        el: ".swiper-front .swiper-inner-" + i + ">.swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-front .swiper-inner-" + i + ">.swiper-button-next",
        prevEl: ".swiper-front .swiper-inner-" + i + ">.swiper-button-prev",
      },
      controller: {
        control: swiperBgBoxInner,
        by: "container",
      },
      on: {
        slideChangeTransitionEnd: function() {
          var target = this;
          var index = $(this.$el[0]).parent().data("swiper-slide-index");
          $(".swiper-front .swiper-slide-duplicate .swiper-inner-" + (index+1)).each(function(index, element) {
            if ( this.swiper && this.swiper.activeIndex != target.activeIndex ) {
              this.swiper.slideTo(target.activeIndex, 0);
            }
          });
          $(".swiper-slide-shadow-top, .swiper-slide-shadow-bottom").css({opacity: "0"});
        }
      },
      slidesPerView: 1.2,
      keyboard: true,
      threshold: 10,
      loopAdditionalSlides: 1,
      loop: true
    });
  }
}

$(document).ready(function () {
  initSwiper();
  initBBS();
  showComp();
});

