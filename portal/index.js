
window.onkeydown = function(e) {
  if( e.keyCode == "9" ) return false;
}

$(document).ready(function () {
  
  var swiperFrontLength = $(".swiper-front .swiper-inner").length;
  
  var swiperBgBox = new Swiper('.swiper-bg-box', {
    effect: 'cube',
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
  
  var swiperFront = new Swiper('.swiper-front', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 0,
    effect: 'coverflow',
    speed: 300,
    coverflowEffect: {slideShadows:false},
    pagination: {
      el: '.swiper-front>.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-front>.swiper-button-next',
      prevEl: '.swiper-front>.swiper-button-prev',
    },
    controller: {
      control: [swiperBgBox],
      by: 'container',
    },
    on: {
      slideChangeTransitionEnd: function() {
        if(swiperFront && (this.activeIndex == swiperFrontLength + 2)) {
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
  
  var swiperBgBoxInner = [];
  var swiperInner = [];
  
  for(var i = 1; i <= 6; i++) {
    swiperBgBoxInner.push(
      new Swiper('.swiper-bg-box .swiper-inner-' + i, {
        touchEventsTarget: 'wrapper',
        effect: 'cube',
        cubeEffect: {
          shadow: false,
          slideShadows: true,
        },
        loop: true,
        loopAdditionalSlides: 1,
        direction: 'vertical',
        allowTouchMove: false
      })
    );
    
    swiperInner.push(
      new Swiper('.swiper-front .swiper-inner-' + i, {
        touchEventsTarget: 'wrapper',
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 0,
        effect: 'coverflow',
        direction: 'vertical',
        speed: 300,
        coverflowEffect: {slideShadows:false},
        pagination: {
          el: '.swiper-front .swiper-inner-' + i + '>.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-front .swiper-inner-' + i + '>.swiper-button-next',
          prevEl: '.swiper-front .swiper-inner-' + i + '>.swiper-button-prev',
        },
        controller: {
          control: swiperBgBoxInner[i - 1],
          by: 'container',
        },
        on: {
          slideChangeTransitionEnd: function() {
            var target = this;
            var index = $(this.$el[0]).parent().data("swiper-slide-index");
            $('.swiper-front .swiper-slide-duplicate[data-swiper-slide-index=' + index + '] .swiper-container').each(function(index, element) {
              if( this.swiper ) {
                this.swiper.slideTo(target.activeIndex, 0);
              }
            });
            $('.swiper-slide-shadow-top, .swiper-slide-shadow-bottom').css({opacity: '0'});
          }
        },
        slidesPerView: 1.2,
        keyboard: true,
        threshold: 10,
        loopAdditionalSlides: 1,
        loop: true
      })
    );
  }
  
  swiperFront.on('resize', function() {
    $('.swiper-container').each(function(index, element) {
      this.swiper.update();
    });
  });
  
  $('body').css({opacity: '1'});
});
