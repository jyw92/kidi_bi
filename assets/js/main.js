// Initialize Lenis for smooth scrolling
// const lenis = new Lenis({
//   duration: 1.5,
//   easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing function
//   smoothWheel: true,
//   smoothTouch: true,
// });

// // Update Lenis on each animation frame
// function raf(time) {
//   lenis.raf(time);
//   requestAnimationFrame(raf);
// }
// requestAnimationFrame(raf);
// JavaScript로 폰트 로딩 상태 확인 및 최적화
// JavaScript로 폰트 로딩 상태 확인 및 최적화
document.addEventListener("DOMContentLoaded", () => {
  // 폰트 로딩 완료 확인
  if ("fonts" in document) {
    document.fonts.ready.then(() => {
      console.log("폰트 로딩 완료")
      document.body.classList.add("fonts-loaded")
    })
  }

  // 폰트 로딩 타임아웃 설정 (3초 후 fallback)
  setTimeout(() => {
    if (!document.body.classList.contains("fonts-loaded")) {
      document.body.classList.add("fonts-timeout")
      console.log("폰트 로딩 타임아웃 - fallback 폰트 사용")
    }
  }, 3000)
})

$(document).ready(function () {
  $("#header").addClass("main_header");

  Main.init();
});

var Main = {
  init: function (e) {
    // Main.mainVisual();
    Main.insuranceNewsF();
    Main.myBannerF();
    Main.mainTopinformationF();
    Main.indicatorsF();
    Main.usefulF();
  },
  mainVisual: function () {
    const $recommendList = $(".recommended_list");
    const $recommendMoreBtn = $(".recommended_list .recommend_more_btn");
    const $moreContent = $(".recommended_list .mobile_more_wrap");

    $recommendMoreBtn.on("click", function () {
      $recommendList.toggleClass("active");
    });

    // 작업된부분
    mainVisualSlider = new Swiper(".mainVisualSlider", {
      slidesPerView: 1,
      centeredSlides: false,
      spaceBetween: 20,
      grabCursor: true,
      keyboard: {
        enabled: true,
      },
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
      },
      roundLengths: true,
      speed: 700,

      breakpoints: {
        769: {
          slidesPerView: 2,
          slidesPerGroup: 2,
        },
      },
      a11y: {
        enabled: true,
        prevSlideMessage: "이전 슬라이드",
        nextSlideMessage: "다음 슬라이드",
        slideLabelMessage:
          "총 {{slideLength}}장의 슬라이드 중 {{index}}번 슬라이드 입니다.",
      },
      watchOverflow: true,
      // loop true,
      // loopAdditionalSlides:1,
      navigation: {
        nextEl: ".mainVisualSlider .swiper-button-next",
        prevEl: ".mainVisualSlider .swiper-button-prev",
      },
      pagination: {
        el: ".mainVisualSlider .swiper-pagination",
        clickable: true,
      },
      observer: true,
      observerParents: true,
    });

    // $('.mainVisualSlider .swiper-slide-duplicate a').attr('tabindex','-1');

    $(".mainVisualSlider a.card").keyup(function (event) {
      const thisIndex = $(this).parent(".swiper-slide").index();
      if (event.keyCode == "9") {
        mainVisualSlider.slideTo(thisIndex);
      }
    });
    // 작업된부분
    $(".swiper-nav-wrap .pause-btn").on("click", function () {
      $(".swiper-nav-wrap .play-btn").show();
      $(this).removeClass("active");
      mainVisualSlider.autoplay.stop();
      $(".swiper-nav-wrap .play-btn").addClass("active").focus();
      $(".swiper-nav-wrap .pause-btn").hide();
    });
    $(".swiper-nav-wrap .play-btn").on("click", function () {
      $(".swiper-nav-wrap .pause-btn").show();
      $(this).removeClass("active");
      mainVisualSlider.autoplay.start();
      $(".swiper-nav-wrap .pause-btn").addClass("active").focus();
      $(".swiper-nav-wrap .play-btn").hide();
    });
  },
  mainTopinformationF: function () {
    mainTopInforSwiper = new Swiper(".supplementary_information_slider", {
      slidesPerView: 3,
      spaceBetween: 15,
      //  loop: true,
      roundLengths: true,
      //  loopAdditionalSlides: 1,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: $(`.supplementary_information_box .swiper-button-next`),
        prevEl: $(`.supplementary_information_box .swiper-button-prev`),
      },
      a11y: {
        // 웹접근성
        enabled: true,
        prevSlideMessage: "이전 슬라이드",
        nextSlideMessage: "다음 슬라이드",
        slideLabelMessage:
          "총 {{slidesLength}}장의 슬라이드 중 {{index}}번 슬라이드 입니다.",
      },
      watchOverflow: true,
      breakpoints: {
        768: {
          spaceBetween: 20,
        },
      },
    });
    // loop 사용시 슬라이드 맨 앞부터 포커스
    $(".supplementary_information_slider a").keyup(function (event) {
      if (event.keyCode == "9") {
        const thisIndex = $(this).parent(".swiper-slide").index();
        mainTopInforSwiper.slideTo(thisIndex);
      }
    });
  },
  myBannerF: function () {
    $(".my_banner_sect .swiper-slide-btn").each(function (index, element) {
      var $this = $(this);
      $this.addClass(`slider-btn-${index}`);
    });

    $(".my_key_services_slider").each(function (index) {
      let $this = $(this);
      let myKeySwiper = undefined;
      let slideNum = $this.find(".swiper-slide").length; //슬라이드 총 개수
      let slideInx = 0; //현재 슬라이드 index

      //디바이스 체크
      let oldWChk = window.innerWidth > 768 ? "pc" : "mo";
      sliderAct();
      $(window).on("resize", function () {
        let newWChk = window.innerWidth > 768 ? "pc" : "mo";
        if (newWChk != oldWChk) {
          oldWChk = newWChk;
          sliderAct();
        }
      });

      function sliderAct() {
        //슬라이드 인덱스 클래스 추가
        $this.addClass(`my_key_services_slider${index}`);

        //슬라이드 초기화
        if (myKeySwiper != undefined) {
          myKeySwiper.destroy();
          myKeySwiper = undefined;
        }

        //slidesPerView 옵션 설정

        myKeySwiper = new Swiper(`.my_key_services_slider${index}`, {
          // loop: true,
          // loopAdditionalSlides: 1,
          observer: true,
          roundLengths: true,
          observeParents: true,
          navigation: {
            nextEl: $(`.slider-btn-${index} .swiper-button-next`),
            prevEl: $(`.slider-btn-${index} .swiper-button-prev`),
          },
          watchOverflow: true,
          breakpoints: {
            1024: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
          },
          slidesPerView: 2,
          spaceBetween: 15,
        });
      }
      $(`.my_key_services_slider${index}` + " a").keyup(function (event) {
        if (event.keyCode == "9") {
          const thisIndex = $(this).parent(".swiper-slide").index();
          myKeySwiper.slideTo(thisIndex);
        }
      });
    });
  },
  insuranceNewsF: function () {
    $(".insurance_news_sect .swiper-slide-btn").each(function (index, element) {
      var $this = $(this);
      $this.addClass(`insurance_news_slider-btn-${index}`);
    });

    $(".insurance_news_slider").each(function (index) {
      let $this = $(this);
      let insuranceSwiper = undefined;
      let slideNum = $this.find(".swiper-slide").length;
      let slideInx = 0;
      let oldWChk = window.innerWidth > 768 ? "pc" : "mo";
      sliderAct2();
      $(window).on("resize", function () {
        let newWChk = window.innerWidth > 768 ? "pc" : "mo";
        if (newWChk != oldWChk) {
          oldWChk = newWChk;
          sliderAct2();
        }
      });

      function sliderAct2() {
        $this.addClass(`insurance_news_slider-${index}`);
        if (insuranceSwiper != undefined) {
          insuranceSwiper.destroy();
          insuranceSwiper = undefined;
        }

        insuranceSwiper = new Swiper(`.insurance_news_slider-${index}`, {
          slidesPerView: "auto",
          spaceBetween: 15,
          roundLengths: true,
          slidesOffsetAfter: 2,
          observer: true,
          observeParents: true,
          navigation: {
            nextEl: $(
              `.insurance_news_slider-btn-${index} .swiper-button-next`
            ),
            prevEl: $(
              `.insurance_news_slider-btn-${index} .swiper-button-prev`
            ),
          },
          watchOverflow: true,

          breakpoints: {
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2.5,
              spaceBetween: 15,
            },
          },
        });

        $this.addClass(`insurance_news_slider-${index}`);
        $(`.insurance_news_slider-${index}` + "a").keyup(function (event) {
          if (event.keyCode == "9") {
            const thisIndex = $(this).parent(".swiper-slide").index();
            insuranceSwiper.slideTo(thisIndex);
          }
        });
      }
     
      $(".insurance_news_sect .insurance_news_tab button").on(
        "mouseenter focus",
        function () {
          let $this = $(this);
          let target = $this.val();
          insuranceSwiper.destroy();
          sliderAct2();
          // initializeinsuranceSwiper();

          $(".insurance_news_sect .insurance_news_slider")
            .removeClass("active")
            .attr("aria-hidden", true);
          $(".insurance_news_sect .swiper-slide-btn").removeClass("active");

          $(".insurance_news_sect .insurance_news_tab button").attr(
            "aria-selected",
            false
          );
          $this.attr("aria-selected", true);

          $("." + target)
            .addClass("active")
            .attr("aria-hidden", false);
          addRemove(this);
        }
      );
    });
  },
  indicatorsF: function (){
    indicatorsSwiper = new Swiper(".indicators-swiper", {
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: {
        nextEl: ".indicators-swiper .swiper-button-next",
        prevEl: ".indicators-swiper .swiper-button-prev",
      },
      breakpoints: {
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
      },
    });

    $(".indicators_slider a").keyup(function (event) {
      if (event.keyCode == "9") {
      const thisIndex = $(this).parent(".swiper-slide").index();
      indicatorsSwiper.slideTo(thisIndex);
      }
    });
  },
  usefulF: function (){
    usefulSwiper = new Swiper('.useful-swiper',{
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: {
        nextEl: ".useful-swiper .swiper-button-next",
        prevEl: ".useful-swiper .swiper-button-prev",
      },
      breakpoints: {
        768: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
      },
    })
  }
};
