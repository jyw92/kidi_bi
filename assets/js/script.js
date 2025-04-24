// 스크롤 있는 탭 - 센터정렬
function scrollCenter(target) {
  var box = $('.horizonScroll');
  var boxItem = box.find('.horizonScroll__item');
  var boxHarf = box.width() / 2;
  var pos;
  var listWidth = 0;
  var targetLeft = 0;

  boxItem.each(function () {
    listWidth += $(this).outerWidth();
  });

  for (var i = 0; i < target.index(); i++) targetLeft += boxItem.eq(i).outerWidth(); // 선택요소 까지 길이

  var selectTargetPos = targetLeft + target.outerWidth() / 2;
  if (selectTargetPos <= boxHarf) {
    // left
    pos = 0;
  } else if (listWidth - selectTargetPos <= boxHarf) {
    //right : target 절반 이후 영역이 boxHarf 보다 작을경우 right 정렬
    pos = listWidth - box.width();
  } else {
    pos = selectTargetPos - boxHarf; // 중앙정렬
  }

  setTimeout(function () {
    box.animate({scrollLeft: pos}, 300);
  }, 200);
}

// 스크롤 있는 탭 - 사이즈가 바뀌면 체크 후 센터
function resizeScrollCenter() {
  var $scrItem = $('.horizonScroll__item');
  var scrIWidth = 0;

  $scrItem.each(function () {
    scrIWidth += $(this).outerWidth();
  });

  $('.horizonScroll__wrapper').css('width', scrIWidth);

  var $box = $('.horizonScroll');
  var $boxItem = $box.find('.horizonScroll__item');
  var boxHarf = $box.width() / 2;
  var pos;
  var listWidth = 0;
  var targetLeft = 0;

  $boxItem.each(function () {
    listWidth += $(this).outerWidth();
  });

  var $target = $boxItem.filter('.on');

  if ($target.length === 0) {
    return;
  }

  for (var i = 0; i < $target.index(); i++) {
    targetLeft += $boxItem.eq(i).outerWidth();
  }

  var selectTargetPos = targetLeft + $target.outerWidth() / 2;

  if (selectTargetPos <= boxHarf) {
    pos = 0;
  } else if (listWidth - selectTargetPos <= boxHarf) {
    pos = listWidth - $box.width();
  } else {
    pos = selectTargetPos - boxHarf;
  }

  $box.animate({scrollLeft: pos}, 300);
}

$(function () {
  const NowStepText = '<p class="text-hidden">현재 단계</p>';
  $('.step_wrap ul li.active').append(NowStepText);

  var nowOn = $('.tab_dep1 li.on a').text();
  $('.tab_dep1 .now_btn').text(nowOn);

  $('.tab_dep1 .now_btn').on('click', function () {
    $(this).toggleClass('on');
    $(this).siblings().slideToggle();

    if ($(this).hasClass('on')) {
      $(this).attr('title', '하위 메뉴 닫기 버튼');
    } else {
      $(this).attr('title', '하위 메뉴 열기 버튼');
    }

    $('.tab_dep1 li').on('click', function () {
      $(this).parent().slideUp();
    });
  });

  // qna 클릭시 슬라이드
  $('.faq_list li button').on('click', function () {
    if (!$(this).hasClass('active')) {
      $('.faq_list li button').removeClass('active');
      $(this).addClass('active');

      $('.faq_list .acc_a').slideUp();
      $(this).siblings('.acc_a').slideDown();
    } else {
      $(this).removeClass('active');
      $(this).siblings('.acc_a').slideUp();
    }
  });
});

// $(document).ready(function() {
//   var nav_group = $('.nav_group');
//   var nav_list = nav_group.find('li');
//   var nav_count = nav_list.length;
//   var nav_title = $('.sub_visual_ttl');

//   if (nav_count == 5) {
//       nav_title.html(nav_list.eq(3).text());
//   }
//   if (nav_count < 5) {
//       nav_title.html(nav_list.eq(2).text());
//   }
// });
