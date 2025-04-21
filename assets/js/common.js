/*
ajax 호출
url : 경로
type : POST, GET
async : true(비동기), false(동기)
data : {"data" : "test"}
callback : ajax 호출 success 시 호출하는 함수
ex) cfnCallAjax(url, type, async, param, fnInsertCallBack);
/*/
function cfnCallAjax(url, type, async, data, callback) {
	$.ajax({
		url: url
		, type : type
		, contentType : "application/json"
		, dataType : "json"
		, async : async
		, data : JSON.stringify(data)
		, success : function(response) {
			//var result = response.result;
			callback(response);
		}
		, error : function(xhr, option, error) {
			if (cfnEmpty(location.href).indexOf("localhost") == -1) {
				alert("서버와 통신 중 장애가 발생 하였습니다.");
				cfnPageMvmn('/err/400');
			} else {
				alert("서버와 통신 중 장애가 발생 하였습니다.");
				cfnPageMvmn('/err/500');
			}
		}
		, beforeSend : function() {
			$(".loading").show();
			$(".loading").css("opacity", "20");
		}
		, complete : function() {
			$(".loading").hide();
		}
	});
}

function apiCallAjax(url, type, async, data, callback) {
	$.ajax({
		url: url
		, type : type
		, contentType : "application/json"
		, dataType : "json"
		, async : async
		, data : JSON.stringify(data)
		, success : function(response) {
			//var result = response.result;
			callback(response);
		}
		, error : function(xhr, option, error) {
			if (cfnEmpty(location.href).indexOf("localhost") == -1) {
				alert("서버와 통신 중 장애가 발생 하였습니다.");
				cfnPageMvmn('/err/400');
			} else {
				alert("서버와 통신 중 장애가 발생 하였습니다.");
				cfnPageMvmn('/err/500');
			}
		}
		, beforeSend : function() {
			$('#loading-overlay').fadeIn();
		}
		, complete : function() {
			$('#loading-overlay').fadeOut();
		}
	});
}

/*
null, undefined 처리
ex) cfnEmpty(null) -> ""
/*/
function cfnEmpty(str) {
	if ($.isEmpty(str)) {
	    str = "";
	} else if ("NULL" == str) {
	    str = "";
	} else if ("null" == str) {
	    str = "";
	}
	return str;
}

/*
페이지 이동
ex) cfnPageMvmn('/tmpl/tmpl001')
	cfnPageMvmn('/tmpl/tmpl001', {"data" : "data"})
/*/
function cfnPageMvmn(url, param) {
if ($.isEmpty(url)) {
    url = "/";
}

if ($.isEmpty(param)) {
    param = {};
}

var $form = $("<form/>");
$form.attr({
    "name": "pageMvmnForm",
    "action": url,
    "method": "POST"
});
$.each(param, function(key, value){
    var $input = $("<input/>", {type:"hidden", name: key, value: value});
    $form.append( $input );
});
$("body").append($form);
$form.submit();
$form.remove();
}

(function( $ ) {
	/*
		빈갑 여부 확인
		ex) $.isEmpty('') -> true
			$.isEmpty('test') -> false
    /*/
	$.isEmpty = function(obj){
        return (!obj || undefined === obj || null === obj);
    };
})( jQuery );    













