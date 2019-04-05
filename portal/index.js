
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
    slidesPerView: 1.2,
    keyboard: true,
    nested: true,
    threshold: 10,
    loop: true,
    loopAdditionalSlides: 1,
    a11y: true
  });
  
  for(var i = 1; i <= 6; i++) {
    var swiperBgBoxInner = new Swiper('.swiper-bg-box .swiper-inner-' + i, {
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
    });
    
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
        control: swiperBgBoxInner,
        by: 'container',
      },
      slidesPerView: 1.2,
      keyboard: true,
      threshold: 10,
      loopAdditionalSlides: 1,
      loop: true
    });
  }
  
  $('body').css({opacity: '1'});
});

