$(document).ready(function() {



    
    // --- 전역 변수 ---
    var previousfocusElement; // 검색창 열기 이전 포커스 요소 저장

    // --- 유틸리티 함수 ---

    /**
     * 로고 스타일을 설정하는 함수
     * @param {boolean} isDark - true면 어두운 로고(logo.png, #333), false면 밝은 로고(logo_fff.png, #fff)
     */
    function setLogoStyle(isDark) {
        const $logoImg = $('.logo > a > img');
        const $logoSpan = $('.logo span');
        if (isDark) {
            $logoImg.attr("src", '../assets/img/common/logo.png');
            $logoSpan.css({ color: "#333" });
        } else {
            $logoImg.attr("src", '../assets/img/common/logo_fff.png');
            $logoSpan.css({ color: "#fff" });
        }
    }

    /**
     * HTML 태그의 GNB 관련 클래스를 설정하는 함수
     * @param {Object} states - { gnbIn: boolean, fixed: boolean, gnbOpen: boolean, showSearch: boolean }
     */
    function setHtmlGlobalState(states) {
        const $html = $('html');
        if (typeof states.gnbIn !== 'undefined') $html.toggleClass('gnb_in', states.gnbIn);
        if (typeof states.fixed !== 'undefined') $html.toggleClass('fixed', states.fixed);
        if (typeof states.gnbOpen !== 'undefined') $html.toggleClass('gnbOpen', states.gnbOpen);
        if (typeof states.showSearch !== 'undefined') { // 검색창 표시 관련 클래스
             $html.toggleClass('show_search', states.showSearch); // 'show_search'는 예시, 실제 사용하는 클래스로 대체
             $('.h_search').toggleClass('on', states.showSearch); // .h_search의 on 클래스로 직접 제어
             if(states.showSearch) {
                $('.h_search').slideDown(); // 필요시 애니메이션
             } else {
                $('.h_search').slideUp(); // 필요시 애니메이션
             }
        }
    }


    // --- GNB (메인 네비게이션) 관련 ---

    function openSubMenu($menuItem) {
        $menuItem.parent('li').addClass('on').siblings().removeClass('on');
    }

    // GNB 1뎁스 메뉴 포커스 또는 마우스 오버
    $('#gnb .dep1').on('focusin mouseenter', function() {
        if ($('html').hasClass('gnbOpen')) return; // 햄버거 메뉴 열려있으면 GNB 호버 무시

        setHtmlGlobalState({ showSearch: false }); // 검색창 닫기 및 관련 상태 초기화
        // $('.h_search').removeClass('on'); // 위 함수에서 처리

        $(this).siblings().find('.dep2 li').removeClass('on');
        openSubMenu($(this).siblings('.gnb_hover')); // 여기서 '.gnb_hover'가 실제 2뎁스 컨테이너인지 확인 필요

        setHtmlGlobalState({ gnbIn: true, fixed: false }); // fixed는 햄버거 메뉴용
        // setLogoStyle(true);
    });

    // GNB 2뎁스 아이템 포커스 또는 마우스 오버
    $('#gnb .dep2 li a').on('focusin mouseenter', function() {
        if ($('html').hasClass('gnbOpen')) return;
        $(this).parent('li').addClass('on').siblings().removeClass('on');
    });

    // 헤더 영역 포커스 아웃 또는 마우스 아웃
    $('#header').on('focusout mouseleave', function(event) {
        // 햄버거 메뉴가 열려있으면 이 로직을 실행하지 않음
        if ($('html').hasClass('gnbOpen')) {
            return;
        }

        // 포커스/마우스가 GNB 메뉴 영역(.gnb_hover)이나 검색 입력 필드(#in_text_searchKwrd)로 이동하지 않았을 경우
        const $relatedTarget = $(event.relatedTarget);
        const isFocusStillInHeaderNav = $relatedTarget.closest('#gnb .dep1, #gnb .dep2, .gnb_hover').length > 0;
        const isFocusInSearchInput = $relatedTarget.closest('#in_text_searchKwrd').length > 0;
        const isSearchBoxActive = $('.h_search').hasClass('on');

        if (!isFocusStillInHeaderNav && !isFocusInSearchInput) {
            $('#gnb .dep1').parent().removeClass('on'); // 모든 GNB 1뎁스 'on' 클래스 제거
            
            if (!isSearchBoxActive) { // 검색창도 활성화되어 있지 않다면
                setHtmlGlobalState({ gnbIn: false });
                // setLogoStyle(false);
            }
        }
    });

    // --- 검색창 관련 ---
    function viewSearch() {
        $('.head_search_btn').on('click', function() {
            const $html = $('html');
            const $searchBox = $('.h_search');
            const isActive = $searchBox.hasClass('on');
            $(this).toggleClass('on');
            if (!isActive) { // 검색창을 열 때
                previousfocusElement = document.activeElement; // 현재 포커스 저장
                setHtmlGlobalState({ gnbIn: true, gnbOpen: false, showSearch: true });
                $('#gnb >ul >li').removeClass('on'); // GNB 메뉴 활성화 해제
                // setLogoStyle(true);
                $searchBox.find('input[type="text"]').first().focus(); // 검색창 열리면 입력 필드에 포커스
            } else { // 검색창을 닫을 때
                setHtmlGlobalState({ showSearch: false });
                // GNB가 활성화되어있지 않으면 gnbIn도 false로, 로고도 원래대로
                if (!$('#gnb li.on').length) { // GNB 메뉴 항목에 'on' 클래스가 없다면
                     setHtmlGlobalState({ gnbIn: false });
                    //  setLogoStyle(false);
                }
                if (previousfocusElement) {
                    $(previousfocusElement).focus(); // 이전 포커스 요소로 복귀
                }
            }
        });
    }

    // --- 햄버거 메뉴 및 전체 메뉴 관련 ---
    function gnbCommonText() { // 전체 메뉴 영역에 GNB HTML 복사
        let gnbList = $('#gnb').html();
        $('.all_menu_wrap > .inner > div').html(gnbList); // 대상 선택자 확인 필요
    }

    function hamOn() {
        $('.ham_btn').on('click', function () {
            if ($('html').hasClass('gnbOpen')) return; // 이미 열려있으면 중복 실행 방지
            
            setHtmlGlobalState({ fixed: true, gnbOpen: true, gnbIn: true, showSearch: false });
            //setLogoStyle(true); // 햄버거 메뉴 시 로고 스타일 (보통 어둡게)

            const activeEl = $('.all_menu_wrap');
            setTimeout(() => { // 메뉴가 표시된 후 포커스 로직 실행
                let activeElTabbable = activeEl.find("*[tabindex]:not([tabindex='-1']), button, input:not([type='hidden']), select, iframe, textarea, [href]");
                let activeElTabbableFirst = activeElTabbable.first();
                let activeElTabbableLast = activeElTabbable.last();

                if (activeElTabbable.length) {
                    activeElTabbableFirst.focus();
                    activeElTabbableFirst.on("keydown.hamFocusTrap", function(event) {
                        if (event.shiftKey && (event.keyCode || event.which) === 9) { // Shift + Tab
                            event.preventDefault();
                            activeElTabbableLast.focus();
                        }
                    });
                    activeElTabbableLast.on("keydown.hamFocusTrap", function(event) {
                        if (!event.shiftKey && (event.keyCode || event.which) === 9) { // Tab
                            event.preventDefault();
                            activeElTabbableFirst.focus();
                        }
                    });
                } else {
                    activeEl.attr("tabindex", "0").focus().on("keydown.hamFocusTrap", function(event){
                        if ((event.keyCode || event.which) === 9) event.preventDefault(); // Tab키 막기
                    });
                }
            }, 100); // 애니메이션 시간 고려
        });
    }

    function hamClose() {
        $('.ham_close').on('click', function () {
            setHtmlGlobalState({ fixed: false, gnbOpen: false });
            // gnbIn 상태는 검색창이나 GNB 호버 상태에 따라 다를 수 있으므로 여기서 바로 false로 하지 않음
            // 검색창이 꺼져있고 GNB 호버도 아니면 로고 원래대로
            if (!$('.h_search').hasClass('on') && !$('#gnb li.on').length) {
                 setHtmlGlobalState({ gnbIn: false });
                 //setLogoStyle(false);
            } else if ($('.h_search').hasClass('on') || $('#gnb li.on').length) {
                // 검색창이나 GNB가 여전히 활성 상태이면 로고는 어둡게 유지
                //setLogoStyle(true);
            }

            // 포커스 트랩 이벤트 제거
            $('.all_menu_wrap').find("*[tabindex]:not([tabindex='-1']), button, input:not([type='hidden']), select, iframe, textarea, [href]")
                .off("keydown.hamFocusTrap");
            $('.all_menu_wrap').off("keydown.hamFocusTrap");

            $('.ham_btn').focus(); // 햄버거 버튼으로 포커스 이동
        });
    }

    function hamCloseFocusOut() { // 햄버거 닫기 버튼에서 포커스 아웃 시 (Tab으로 나갈 때)
        $('.ham_close').on('keydown', function(event) {
            // Shift+Tab이 아니고 Tab 키를 눌렀을 때 (즉, 다음 요소로 이동 시도 시)
            if (!event.shiftKey && (event.keyCode || event.which) === 9) {
                // hamClose 함수 호출과 유사하게 처리, 단 포커스는 자연스럽게 다음 요소로
                setHtmlGlobalState({ fixed: false, gnbOpen: false });
                if (!$('.h_search').hasClass('on') && !$('#gnb li.on').length) {
                     setHtmlGlobalState({ gnbIn: false });
                     //setLogoStyle(false);
                } else if ($('.h_search').hasClass('on') || $('#gnb li.on').length) {
                    //setLogoStyle(true);
                }
                // 포커스 트랩 이벤트 제거
                 $('.all_menu_wrap').find("*[tabindex]:not([tabindex='-1']), button, input:not([type='hidden']), select, iframe, textarea, [href]")
                    .off("keydown.hamFocusTrap");
                 $('.all_menu_wrap').off("keydown.hamFocusTrap");
                // 여기서 $('.ham_btn').focus()를 호출하면 닫기 버튼에서 Tab을 눌러도 다시 햄버거 버튼으로 감.
                // 자연스러운 다음 포커스로 이동을 원하면 이 라인은 주석 처리.
            }
        });
    }

    // --- 모바일 환경 메뉴 아코디언 ---
    function handleMobileAccordion() {
        const isMobile = $(window).innerWidth() < 768;
        const $allMenuWrap = $('.all_menu_wrap');

        // 기존 이벤트 핸들러 제거 (중복 바인딩 방지용 네임스페이스 사용)
        $allMenuWrap.find('.menu-01 > li').eq(0).removeClass('open'); // 초기화 시 첫번째 열림 제거
        $allMenuWrap.find('.dep1').off('click.mobileAccordion');
        $allMenuWrap.find('.dep2 > li .dep3_ttl').off('click.mobileAccordion');
        $allMenuWrap.find('.dep3').hide(); // 모든 3뎁스 숨김
        $allMenuWrap.find('.dep2 > li, .menu-01 > li').removeClass('open'); // 모든 open 클래스 제거

        if (isMobile) {
            $allMenuWrap.find('.menu-01 > li').eq(0).addClass('open'); // 모바일에서 첫번째 1뎁스 기본으로 열기

            $allMenuWrap.find('.dep1').on('click.mobileAccordion', function(e) {
                e.preventDefault();
                const $parentLi = $(this).parent('li');
                $parentLi.toggleClass('open').siblings().removeClass('open');
                // 다른 메뉴의 하위 뎁스도 닫아줄 수 있음 (선택사항)
                // $parentLi.siblings().find('.dep2 > li, .menu-01 > li').removeClass('open');
                // $parentLi.siblings().find('.dep3').slideUp();
            });

            $allMenuWrap.find('.dep2 > li .dep3_ttl').on('click.mobileAccordion', function(e) {
                e.preventDefault();
                const $parentLi = $(this).parent('li'); // .dep2 > li
                const $targetDep3 = $(this).next('.dep3');

                if ($parentLi.hasClass('open')) {
                    $parentLi.removeClass('open');
                    $targetDep3.slideUp();
                } else {
                    // 다른 열려있는 2뎁스 메뉴의 3뎁스는 닫기
                    $parentLi.siblings('.open').removeClass('open').find('.dep3').slideUp();
                    $parentLi.addClass('open');
                    $targetDep3.slideDown();
                }
            });
        } else {
            // PC 환경에서는 아코디언 기능 제거 또는 PC용 메뉴 표시 로직
            $allMenuWrap.find('.menu-01 > li, .all_menu_wrap .dep2 > li').removeClass('open');
            $allMenuWrap.find('.dep3').removeAttr('style'); // slideUp/Down으로 인한 style 제거
        }
    }


    // --- 초기화 호출 ---
    gnbCommonText();
    hamOn();
    hamClose();
    viewSearch();
    hamCloseFocusOut();

    handleMobileAccordion(); // 페이지 로드 시 실행
    $(window).on('resize', function() { // 화면 크기 변경 시 실행
        handleMobileAccordion();
    });

    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 0) {
            $('html').addClass('scrolling');
        } else {
            $('html').removeClass('scrolling');
        }
    });



});