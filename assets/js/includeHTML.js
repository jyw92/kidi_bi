
var commonSet = {};

/**
* getSkipNav  skipnav 생성
*/
commonSet.getSkipNav = function() {
	$skip = $('<div id="skip"></div>');
	$("body").prepend($skip);
	$("#skip").load("../inc/skip_nav.inc.html");
};


/**
* getHeader  Header 생성
*/
commonSet.getHeader = function() {
	$header = $('<header id="header"></header>');
	$("#wrap").prepend($header);
	$("header").load("../inc/header.inc.html");
};


/**
* getFooter  Footer 생성
*/
commonSet.getFooter = function() {
    $footer = $('<footer id="footer"></footer>');
    $("#wrap").append($footer);
    $("footer").load("../inc/footer.inc.html");
};


/**
* getModal  Modal 생성
*/
commonSet.getModal = function() {
	$modal = $('<div id="modal_wrap"></div>');
	// 수정된곳 여기부터
	if ($(".prediction_cont").length > 0) {
		$("#wrap").append($modal);
	}else{
		$("#wrap").append($modal);
	}
	// 수정된곳 여기까지
	$("#modal_wrap").load("../inc/modal.inc.html");
};

/**
* getModal  floting_quick 생성
*/
commonSet.getQuick = function() {
	$flotingQuick = $('<div id="floating_quick"></div>');

	if($(window).width() < 769){
		$('#main_visual_sect').append($flotingQuick);
	}else{
		$("#container").append($flotingQuick);

	}
	$("#floating_quick").load("../inc/floting_quick.html");	
	
};


/**
* getFooter  Footer 생성
*/
commonSet.getDep3 = function() {
	$(".tab_dep1").load("../inc/dep3_nav.html");
};
















