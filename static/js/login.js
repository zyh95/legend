var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程
var path7 = "http://119.29.200.238:8080/cg/";//耀友腾讯云

var path8 = "http://localhost:8080/cg/";//本地环境


var path = path8;

$(function() {
    $("#staffNum").blur(function() {
        var validNum = (/^\d{10}$/.test($(this).val()));
        if ($(this).val() === "") {
            showError($("input#staffNum"), "工号不能为空");
        } else if (!validNum) {
            showError($("input#staffNum"), "工号格式错误");
        }
    });


    $(".input-form input").focus(function() {
            resetError($(this));
        }).keydown(function() {
        resetError($(this));
    });


    $("#staffPassword").blur(function() {
        if ($(this).val() === "") {
            showError($(this), "密码不能为空");
        }
    });

    $("#login-submit").click(function() {
        validLogin();
    });
    
    $("#staffPassword").keydown(function(event){
        if(event.which === 13){
            validLogin();
        }
    });
    
});

function showError($input, errorMsg){
    $input.siblings("span.error-msg").text(errorMsg).removeClass("hide");
    $input.parents("div.input-form").addClass("invalid");
}

function resetError($input){
    $input.parents("div.input-form").removeClass("invalid");
    $input.siblings("span.error-msg").addClass("hide");
    $input.parents("div.input-form").addClass("focus");
    $("#login-error-msg").addClass("hide");
}

function validLogin(){
    var sn = $("#staffNum").val();
    var pw = $("#staffPassword").val();
    if ((sn !== "") && (pw !== "")) {
        var staffData = {
            "staffNum": sn,
            "staffPassword": pw
        };
        $.ajax({
            type: "POST",
            url: path + "/staff/login",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(staffData),
            dataType: "json",
            success: function(data) {
                if (data.code === 0) {
                    window.location.href = path + "staff/home";
                } else {
                    var $lem = $("#login-error-msg");
                    $lem.text(data.msg);
                    $lem.removeClass("hide");
                }
            }
        });
    }else if(sn === ""){
        showError($("#staffNum"), "工号不能为空");
    }else{
        showError($("#staffPassword"), "密码不能为空");
    }
}