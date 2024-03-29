
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
  showComp();
});

