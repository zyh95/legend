var path1 = "http://110.64.72.46:8080/cg/"; //杭澍
var path2 = "http://110.64.72.43:8080/cg/"; //耀友
var path3 = "http://119.29.173.65:8080/cg/"; //锡龙
var path4 = "http://110.64.91.19:8080/cg/"; //耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/"; //杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/"; //耀友远程
var path7 = "http://119.29.200.238:8080/cg/"; //耀友腾讯云
var path8 = "http://localhost:8080/cg/"; //本地环境
var path9 = "http://120.77.39.33:8080/cg/"; //耀友远程无权限

var path = path9;


$(document).ready(function () {
    // 获取登录用户的名字
    $.getJSON(path + 'staff/userInfo', function (json) {
        $('#staff-name').html('<span class="glyphicon glyphicon-user"></span> ' + json.result);
    });

    // 响应头部导航栏的点击，显示对应的竖向标签页导航
    $('.role-navbar-nav').click(function () {
        $(this).siblings("li").removeClass("active");
        $(this).addClass("active");
        var idValue = this.id.split("-");
        var navtabsClassName = idValue[0] + '-navtabs';
        var $liTag = $("." + navtabsClassName);
        $liTag.siblings("li[class!=" + navtabsClassName + "]").hide();
        $liTag.show();
    });

    // 监听开炉的4个button
    blowonCheckButton();

    $('ul#nav-tabs a').click(function () {
        var $idValue = $(this).attr("href");
        var $divData = $("" + $idValue + " .table-data");

        for (let i = 0; i < $divData.length; i++) {
            var $dataUrl = $divData.eq(i).attr("data-url");
            var $dataDiv = $divData.eq(i).attr("data-div");
            var $dataAbbreviation = $divData.eq(i).attr("data-abbreviation");
            var $dataFunction = $divData.eq(i).attr("data-function");

            if ($dataFunction === "common") {
                commonTableFunction($dataUrl, $dataDiv, $dataAbbreviation);
            } else if ($dataFunction === "customer") {
                customerTableFunction($dataUrl, $dataDiv, $dataAbbreviation)
            } else if ($dataFunction === "materialInventory") {
                materialInventoryTableFunction($dataUrl, $dataDiv, $dataAbbreviation);
            } else if ($dataFunction === "productInventory") {
                productInventoryTableFunction($dataUrl, $dataDiv, $dataAbbreviation);
            } else if ($dataFunction === "order") {
                orderTableFunction($dataUrl, $dataDiv, $dataAbbreviation);
            } else {
                statisticsTableFunction($dataUrl, $dataDiv, $dataAbbreviation);
            }
        }
    });

    // 监听添加面板
    initAdd();

    // 监听模态框
    initModal();

    // 监听记录表格修改模态框中的提交按钮，发送修改后的数据
    $(".btn-commit-in-modal").click(function () {
        //language=JQuery-CSS
        var $inputModify = $(this).parent().siblings("div.modal-body").find(":input");
        var $modalBody = $(this).parent().siblings("div.modal-body");
        var $inputNum = $modalBody.find("input.input-num");
        var modalID = $(this).parents("div.modal-modify").attr("id");
        var requestMethod = "PUT";
        // 请求地址为：存在div.modal-body的data-url属性值/编号值
        var urlNum = $inputNum.val();
        if (urlNum === undefined) {
            urlNum = "";
            requestMethod = "POST";
        }
        var modifyUrl = $modalBody.attr("data-url") + urlNum;
        var sendData = convertToJson(getModalModifyData($inputModify));
        if (sendData === true) {
            showStatusModal("!!!", "请输入所有信息");
        } else {
            var finalData = JSON.stringify(sendData);
            addModifyAjax(modifyUrl, finalData, modalID, requestMethod);
        }
    });

    // 监听订单管理的添加订单按钮
    $("#btn-order-create").click(function () {
        $("#modal-order-create").modal("show").on("shown.bs.modal", function () {
        });
    });

    // 初始化加载订单记录
    orderTableFunction("WarehouseOrders", ".factory-order-record-table", "for");

    // 初始化表单元素监听函数
    smart();
});

// if((parseFloat(sendData.ratioAg)+parseFloat(sendData.ratioCd)+parseFloat(sendData.ratioCu)+parseFloat(sendData.ratioSn)+parseFloat(sendData.ratioZn)) === 1.00){
//
// }else{
//     showStatusModal("!!!","输入比例加起来不为1");
// }

// 在登记或修改成功之后清空数据，参数为模态框的ID，也可以传入父div的ID
function clearDataAfterSuccss(parentId) {
    $("#" + parentId).find(":input").val("");
}

// 获取要修改条目的各列信息
function getModifyItemData($th, $td) {
    var dataKey = [];
    var content = [];
    var preData = new Map();
    // 存储表头的data-key的值
    $th.each(function (index, element) {
        dataKey.push($(element).attr("data-key"));
    });
    // 修改行的值
    $td.each(function (index, element) {
        content.push($(element).text());
    });
    if (dataKey.length === content.length) {
        for (let i = 0; i < dataKey.length; i++) {
            preData[dataKey[i]] = content[i];
        }
    }
    return preData;
}

// 获取模态框修改的内容
function getModalModifyData($inputForm) {
    var modifyData = new Map();
    var nullNum = 0;
    $inputForm.each(function (index, element) {
        var dataType = $(element).attr("data-type");
        var dataKey = $(element).attr("data-key");
        var dataVal = $(element).val();
        if (dataVal === "") {
            nullNum++;
        }
        if (dataType === "string") {
            modifyData[dataKey] = dataVal;
        } else if (dataType === "float") {
            modifyData[dataKey] = parseFloat(dataVal);
        } else if (dataType === "int") {
            modifyData[dataKey] = parseInt(dataVal);
        } else {
            modifyData[dataKey] = Date.parse(dataVal);
        }
    });
    if (nullNum !== 0) {
        modifyData = true;
        return modifyData
    } else {
        return modifyData
    }
}


// 向表格对应的模态框填入数据
function writeDataToModal(modalID, writeData) {
    $("#" + modalID).modal("show")
        .on("shown.bs.modal", function () {
            $(this).find(".data-modify").each(function (index, element) {
                var key = $(element).attr("data-key");
                if (key === "product.productModelInfo.productModel" || key === "productModelInfo.productModel") {
                    getProductModel($(element), writeData[key]);
                } else {
                    $(element).val(writeData[key]);
                }
            });
        });

}

// 获取已添加的产品型号,并将修改前的值selectedModel所在的option的属性设为selected
// 若为空则不显示（对应添加功能）
function getProductModel($selectModify, selectedModel) {
    $.ajax({
        url: path + "ProductModelInfo/productModels",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        data: "",
        dataType: "json",
        success: function (data) {
            var optionHtml = '';
            var modelArr = data.result;
            if (!selectedModel) {
                optionHtml += '<option value="" class="blank-option" selected></option>';
                for (let i = 0; i < modelArr.length; i++) {
                    optionHtml += '<option value="' + modelArr[i] + '">' + modelArr[i] + '</option>';
                }
            } else {
                for (let i = 0; i < modelArr.length; i++) {
                    if (modelArr[i] !== selectedModel) {
                        optionHtml += '<option value="' + modelArr[i] + '">' + modelArr[i] + '</option>';
                    } else {
                        optionHtml += '<option value="' + modelArr[i] + '"selected>' + modelArr[i] + '</option>';
                    }
                }
            }
            $selectModify.html(optionHtml);
        }
    })
}

//获取所有仓库管理员姓名以及id
function getWarehouseManager() {
    var sellUnitPrice, sellQuantity, sellTotalPrice;
    var delivererNames = new Array();
    var delivererIDs = new Array();
    var delivererOptionHtml = '';

    $.ajax({
        url: path + "staffs/role/仓库管理员",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        data: "",
        dataType: "json",
        success: function (data) {
            if (data.code !== 0) {
                alert(data.msg);
            } else {
                $.each(data.result, function (index, content) {
                    delivererNames.push(content['staffName']);
                    delivererIDs.push(content['staffId']);

                    delivererOptionHtml += '<option value="' + content['staffName'] + '">' +
                        content['staffName'] + '</option>';
                });
                delivererOptionHtml += '<option value="" class="blank-option" selected></option>';
            }
            $("[id*=order-deliverer-name]").html(delivererOptionHtml);
        }
    });

    $("[id*=order-deliverer-name]").change(function () {
        var selectedIndex = $(this).prop("selectedIndex");
        $("[id*=order-deliverer-id]").val(delivererIDs[selectedIndex]);
    });
}

// 将需要发送的原始数据转化为符合json接口格式的数据
function convertToJson(obj) {
    var pre = {};
    for (var i in obj) {
        var attrs = i.indexOf('.');
        if (attrs !== -1) {
            var prefix = i.substring(0, attrs);
            var postfix = i.substring(attrs + 1);

            if (pre[prefix]) {
                var a = postfix;
                pre[prefix][a] = obj[i];
            } else {
                pre[prefix] = {};
                var a = postfix;
                pre[prefix][a] = obj[i];
            }
            delete obj[i];
        }
    }
    for (var i in pre) {
        pre[i] = convertToJson(pre[i]);
        obj[i] = pre[i];
    }
    return obj;
}

// 发送修改的数据
function addModifyAjax(pathUrl, sendData, modalID, requestMethod) {
    $.ajax({
        url: path + pathUrl,
        type: requestMethod,
        contentType: "application/json; charset=UTF-8",
        data: sendData,
        dataType: "json",
        success: function (data) {
            if (data.code !== 0) {
                showStatusModal(data.code, data.msg);
                console.log(data.msg);
                // $("#modal-fail").modal("show");
            } else {
                console.log(data.msg);
                var $md = $("#" + modalID);
                $md.modal("hide");
                clearDataAfterSuccss(modalID);
                // $("#modal-success").modal("show");
                showStatusModal(data.code, data.msg);
                // 更新数据
                var $recordTableDiv = $md.parents("div.panel");
                updataRecordTable($recordTableDiv);
            }
        },
        error: function (XMLResponse, textStatus) {
            // console.log("失败了？？？" + textStatus);
            // $("#modal-fail").modal("show");
            showStatusModal("失败", textStatus);
        }
    });
}

// 服务返回信息提示显示框
function showStatusModal(code, msg) {
    // var $ms = $("#modal-status");
    // var notification = msg + "(" + code + ")";
    // $ms.find(".modal-title").text(notification);
    // $ms.modal("show");
    var $ms = $("#server-status");
    var notification = msg + "(" + code + ")";
    $ms.find(".server-title").text(notification);
    $ms.animate({
        top: "5px"
    }, "fast");
    $ms.animate({
        top: "5px"
    }, 3000);
    $ms.animate({
        top: "-40px"
    }, "fast");
}

function todayTimeFormat(mydate) {
    var string = "";
    string = string + mydate.getFullYear();
    if ((mydate.getMonth() + 1) >= 10) {
        string = string + "-" + (mydate.getMonth() + 1);
    } else {
        string = string + "-0" + (mydate.getMonth() + 1);
    }
    if (mydate.getDate() >= 10) {
        string = string + "-" + mydate.getDate();
    } else {
        string = string + "-0" + mydate.getDate();
    }
    return string;
}

// 广源 通用创建记录表格
function commonTableFunction(_dataUrl, _dataDiv, _dataAbbreviation) {

    //初始页面
    var mydate = new Date();

    setDateToday(mydate, _dataAbbreviation);
    var todayTime = todayTimeFormat(mydate);
    var today = Date.parse(todayTime);
    initAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "all", today, today);

    //筛选事件
    $("#" + _dataAbbreviation + "-select").on('click', function () {
        var $selectStartTime = Date.parse($("#" + _dataAbbreviation + "-start-date").val());
        var $selectEndTime = Date.parse($("#" + _dataAbbreviation + "-end-date").val());
        if ($selectStartTime > $selectEndTime) {
            showStatusModal("请选择正确的时间");
        } else {
            initAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "selectPage", $selectStartTime, $selectEndTime);
        }
    });

    //近三天
    $("#" + _dataAbbreviation + "-threeDays").on('click', function () {
        var mydate = new Date();

        var todayTime = todayTimeFormat(mydate);
        var today = Date.parse(todayTime);
        var otherday = today - 172800000;
        initAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "threeDaysPage", otherday, today);
    });

    //近一周
    $("#" + _dataAbbreviation + "-aWeek").on('click', function () {
        var mydate = new Date();

        var todayTime = todayTimeFormat(mydate);
        var today = Date.parse(todayTime);
        var otherday = today - 518400000;
        initAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "aWeekPage", otherday, today);
    });

    //近两周
    $("#" + _dataAbbreviation + "-twoWeeks").on('click', function () {
        var mydate = new Date();

        var todayTime = todayTimeFormat(mydate);
        var today = Date.parse(todayTime);
        var otherday = today - 1108800000;
        initAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "twoWeeksPage", otherday, today);
    });

    //近一个月
    $("#" + _dataAbbreviation + "-aMonth").on('click', function () {
        var mydate = new Date();

        var todayTime = todayTimeFormat(mydate);
        var today = Date.parse(todayTime);
        var otherday = Date.parse("" + mydate.getFullYear() + "-" + mydate.getMonth() + "-" + mydate.getDate())
        initAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "aMonthPage", otherday, today);
    })
}

// 设置日期为今天的日期
function setDateToday(mydate, _dataAbbreviation) {
    var todayTime = todayTimeFormat(mydate);
    $("#" + _dataAbbreviation + "-start-date").val(todayTime);
    $("#" + _dataAbbreviation + "-end-date").val(todayTime);
    // $("input[id$=-start-date]").val(todayTime);
    // $("input[id$=-end-date]").val(todayTime);
}

//通用函数
function CreateTable(divName, targetId, _url, _startTime, _endTime) {
    var $thead = $(divName + " .table-content thead");
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");

    var thHiden = []; //隐藏的元素的name属性值所存放的数组
    $thead.find("th.hide").each(function (index, elment) {
        thHiden.push($(elment).attr("name"));
    });

    var tableName = [];
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });

    var targetObject = {};
    ajaxUseGet(_url, targetId, _startTime, _endTime);
    var map = $.parseJSON(targetJson);
    var length;
    if (JSON.stringify(json.result) == "null") {
        length = 0;
    } else {
        length = map.result.length;
    }

    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);

        if (thHiden.length > 0) {
            var $arr_index = [];
            for (let k = 0; k < thHiden.length; k++) {
                $arr_index.push(tableName.indexOf(thHiden[k]));
            }
        }

        for (let j = 0; j < tableName.length; j++) {
            let reg = /.{0,}Date.{0,}/;
            if (reg.test(tableName[j])) {
                var date = new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]] = date.split(" ")[0];
                var changeDate = targetObject[tableName[j]].split("-");
                for (let z = 1; z < changeDate.length; z++) {
                    var temp = parseInt(changeDate[z]);
                    if (temp < 10) {
                        changeDate[z] = "0" + changeDate[z];
                    }
                }
                targetObject[tableName[j]] = changeDate.join("-");
            }


            if ((divName === ".factory-order-record-table") && ($arr_index.indexOf(j) !== -1)) {
                $tbody.children("tr:last-child").append('<td class="data-hide">' + targetObject[tableName[j]] + '</td>');
            } else {
                $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
            }
        }
        if (divName === ".factory-order-record-table") {
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-detail" id="row-' + (i + 1) + '" data-toggle="modal" data-target="#myModal">详细信息</button>');
        }
        if (divName !== ".warehouse-product-inventory-statistics-table") {
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-modify" >修改</button>');
        }
    }

    //广源修改 订单详细信息按钮
    $(".table-content-detail").on('click', function () {
        var id = parseInt($(this).attr("id").match(/\d+/g)) - 1;
        var content = [];
        var target = {};
        target = iterationObject(map.result[id], target);
        $("#order-modal").modal("show")
            .on("shown.bs.modal", function () {
                $(".order-detail").html("");
                for (let j = 0; j < tableName.length; j++) {
                    var text = $("" + divName + " .table-content th[name=" + tableName[j] + "]").text();
                    $(".order-detail").append('<span>' + text + ':' + target[tableName[j]] + '</span><br />');
                }
            })
    });


    // 李昕修改 响应修改按钮弹出模态框
    $(".table-content-modify").click(function () {
        var $thModify = $(this).parents("table").find("th");
        // 同行的单元格
        var $tdModify = $(this).parent().find("td");
        // 对应表格存有对应模态框的ID
        var tableModalID = $(this).parents("table").attr("data-modal-id");
        // 获取要写入模态的数据
        var preData = getModifyItemData($thModify, $tdModify);
        writeDataToModal(tableModalID, preData);

    });
}

//创建分页 参数分别为表格类名，总共页数，页面类型
function CreatePage(divName, targetPage, pageType, _url) {
    $text1 = '<div class="pagination-box" style="margin:0 auto;width:400px;text-align: center;"><ul class="pagination ' + pageType + ' "></ul>';
    $(divName + " ").append($text1);
    var $ul = $(divName + " .pagination");
    $ul.append('<li class="last"><a href="#" id="bow-last">&laquo;</a></li>');
    $ul.append('<li class="next"><a href="#" id="bow-next">&raquo;</a></li>');
    for (let i = 0; i < targetPage; i++) {
        if (i == 0) {
            $('<li class="page active" id="bow-page' + (i + 1) + '"><a href="#" >' + (i + 1) + '</a></li>').insertBefore($ul.children('li:last-child'));
            continue;
        }
        $('<li class="page " id="bow-page' + (i + 1) + '"><a href="#" >' + (i + 1) + '</a></li>').insertBefore($ul.children('li:last-child'));
        if ((i + 1) > 5) {
            $ul.children('li:last-child').prev("li").addClass('hide');
        }
    }
}

//重新编写json数据 _map 需处理的数据 targetObject 处理后存入的对象容器  参数分别为处理后的对象数据，使用目标
function iterationObject(_map, targetObject) {
    for (var key in _map) {
        if (typeof _map[key] === 'object') {
            targetObject = iterationObject(_map[key], targetObject);
        } else {
            targetObject[key] = _map[key];
        }
    }
    return targetObject;
}

//点击上一页 参数分别为表格类名，当前页id，总页数和json格式数据
function clickLastPage(divName, $targetId, Page, _url, _startTime, _endTime) {
    if ($targetId > 1) {
        $targetId = $targetId - 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        CreateTable(divName, $targetId, _url, _startTime, _endTime);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据
//判断下一页是否为最后一页，来确定传给createTable记录长度
function clickNextPage(divName, $targetId, Page, _url, _startTime, _endTime) {
    if ($targetId < Page) {
        $targetId = $targetId + 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        CreateTable(divName, $targetId, _url, _startTime, _endTime);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击分页 参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度
//判断点击页是否为最后一页，来确定传给createTable的长度
function clickPage(divName, $targetId, Page, _this, _url, _startTime, _endTime) {
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    CreateTable(divName, $targetId, _url, _startTime, _endTime);

    if (($targetId >= 3) && ($targetId <= Page - 2)) {
        _this.siblings().addClass("hide");
        _this.prev().prev().removeClass("hide");
        _this.prev().removeClass("hide");
        _this.next().removeClass("hide");
        _this.next().next().removeClass("hide");
        _this.parent().children('li:last-child').removeClass("hide");
        _this.parent().children('li:first-child').removeClass("hide");
    } else {
        if ($targetId == 2) {
            _this.siblings().addClass("hide");
            _this.parent().children('li:last-child').removeClass("hide");
            _this.parent().children('li:first-child').removeClass("hide");
            _this.prev().removeClass("hide");
            _this.next().removeClass("hide");
            _this.next().next().removeClass("hide");
            _this.next().next().next().removeClass("hide");
        } else {
            if ($targetId == Page - 1) {
                _this.siblings().addClass("hide");
                _this.parent().children('li:last-child').removeClass("hide");
                _this.parent().children('li:first-child').removeClass("hide");
                _this.next().removeClass("hide");
                _this.prev().removeClass("hide");
                _this.prev().prev().removeClass("hide");
                _this.prev().prev().prev().removeClass("hide");
            }
        }
    }
}

//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function initAjaxUseGet(_url, _dataType, _contentType, divName, pageType, _startTime, _endTime) {
    var json,
        targetJson, //格式化传过来的json数据最终的形式
        $length, //返回json数据记录总数量
        $id = 1; //初始页面
    $.ajax({ //通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data: {
            pageNum: $id,
            beginTime: _startTime,
            endTime: _endTime
        },
        dataType: _dataType,
        contentType: _contentType,
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
            if (JSON.stringify(json.result) == "null") {
                $length = 0;
            } else {
                $length = json.result.length;
            }
            let $page = json.msg;

            CreateTable(divName, $id, _url, _startTime, _endTime);

            $(divName + " .pagination-box").remove();
            if ($length > 0) {
                CreatePage(divName, $page, pageType + " ");
            } else {
                showStatusModal(":-", "该 时间区间 查询没有记录");
            }

            //点击页数
            $(divName + " ." + pageType + " .page").on("click", function () {
                $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                clickPage(divName, $id, $page, $(this), _url, _startTime, _endTime);
            });

            // 点击上一页
            $(divName + " ." + pageType + " .last").on("click", function () {
                $id = clickLastPage(divName, $id, $page, _url, _startTime, _endTime);
            })

            // 点击下一页
            $(divName + " ." + pageType + " .next").on("click", function () {
                $id = clickNextPage(divName, $id, $page, _url, _startTime, _endTime);
            })
        }
    });
}

function ajaxUseGet(_url, $Id, _startTime, _endTime) {
    $.ajax({
        url: _url,
        type: "GET",
        async: false,
        data: {
            pageNum: $Id,
            beginTime: _startTime,
            endTime: _endTime
        },
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
        },
        error: function () {
            alert("error");
        }
    })
}


//customer 开始
function customerTableFunction(_dataUrl, _dataDiv, _dataAbbreviation) {
    //初始页面
    customerInitAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "all", "");

    //筛选事件
    $("#" + _dataAbbreviation + "-select").on('click', function () {
        var $name = $("#customer-name").val();
        customerInitAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "selectPage", "" + $name);
    })
}

function customerCreateTable(divName, targetId, _url, _name) {
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");
    var tableName = [];
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });
    var targetObject = {};
    customersAjaxUseGet(_url, targetId, _name);
    var map = $.parseJSON(targetJson);
    var length;
    if (JSON.stringify(json.result) == "null") {
        length = 0;
    } else {
        length = map.result.length;
    }
    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);
        $tbody.children("tr:last-child").append('<td>' + map.result[i][tableName[0]] + '</td>');
        for (let j = 1; j < tableName.length; j++) {
            let reg = /.{0,}Date.{0,}/;
            if (reg.test(tableName[j])) {
                var date = new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]] = date.split(" ")[0];
                var changeDate = targetObject[tableName[j]].split("-");
                for (let z = 1; z < changeDate.length; z++) {
                    var temp = parseInt(changeDate[z]);
                    if (temp < 10) {
                        changeDate[z] = "0" + changeDate[z];
                    }
                }
                targetObject[tableName[j]] = changeDate.join("-");
            }
            $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
        }

    }
}

//点击上一页 参数分别为表格类名，当前页id，总页数和json格式数据
function customerClickLastPage(divName, $targetId, Page, _url, _name) {
    if ($targetId > 1) {
        $targetId = $targetId - 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        customerCreateTable(divName, $targetId, _url, _name);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据
//判断下一页是否为最后一页，来确定传给createTable记录长度
function customerClickNextPage(divName, $targetId, Page, _url, _name) {
    if ($targetId < Page) {
        $targetId = $targetId + 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        customerCreateTable(divName, $targetId, _url, _name);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击分页 参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度
//判断点击页是否为最后一页，来确定传给createTable的长度
function customerClickPage(divName, $targetId, Page, _this, _url, _name) {
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    customerCreateTable(divName, $targetId, _url, _name);

    if (($targetId >= 3) && ($targetId <= Page - 2)) {
        _this.siblings().addClass("hide");
        _this.prev().prev().removeClass("hide");
        _this.prev().removeClass("hide");
        _this.next().removeClass("hide");
        _this.next().next().removeClass("hide");
        _this.parent().children('li:last-child').removeClass("hide");
        _this.parent().children('li:first-child').removeClass("hide");
    } else {
        if ($targetId == 2) {
            _this.siblings().addClass("hide");
            _this.parent().children('li:last-child').removeClass("hide");
            _this.parent().children('li:first-child').removeClass("hide");
            _this.prev().removeClass("hide");
            _this.next().removeClass("hide");
            _this.next().next().removeClass("hide");
            _this.next().next().next().removeClass("hide");
        } else {
            if ($targetId == Page - 1) {
                _this.siblings().addClass("hide");
                _this.parent().children('li:last-child').removeClass("hide");
                _this.parent().children('li:first-child').removeClass("hide");
                _this.next().removeClass("hide");
                _this.prev().removeClass("hide");
                _this.prev().prev().removeClass("hide");
                _this.prev().prev().prev().removeClass("hide");
            }
        }
    }
}

//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function customerInitAjaxUseGet(_url, _dataType, _contentType, divName, pageType, _name) {
    var json,
        targetJson, //格式化传过来的json数据最终的形式
        $length, //返回json数据记录总数量
        $id = 1; //初始页面
    var _data;
    if (_name == "") {
        _data = {
            pageNum: $id
        };
    } else {
        _data = {
            pageNum: $id,
            name: _name
        };
    }
    $.ajax({ //通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data: _data,
        dataType: _dataType,
        contentType: _contentType,
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
            if (JSON.stringify(json.result) == "null") {
                $length = 0;
            } else {
                $length = json.result.length;
            }
            let $page = json.msg;

            customerCreateTable(divName, $id, _url, _name);

            $(divName + " .pagination-box").remove();
            if ($length > 0) {
                CreatePage(divName, $page, pageType + " ");
            } else {
                showStatusModal(":-", "该 时间区间 查询没有记录")
            }

            //点击页数
            $(divName + " ." + pageType + " .page").on("click", function () {
                $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                customerClickPage(divName, $id, $page, $(this), _url, _name);
            })

            // 点击上一页
            $(divName + " ." + pageType + " .last").on("click", function () {
                $id = customerClickLastPage(divName, $id, $page, _url, _name);
            })

            // 点击下一页
            $(divName + " ." + pageType + " .next").on("click", function () {
                $id = customerClickNextPage(divName, $id, $page, _url, _name);
            })
        }
    });
}

function customersAjaxUseGet(_url, $Id, _name) {
    var _data;
    if (_name == "") {
        _data = {
            pageNum: $Id
        };
    } else {
        _data = {
            pageNum: $Id,
            name: _name
        };
    }
    $.ajax({
        url: _url,
        type: "GET",
        async: false,
        data: _data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
        },
        error: function () {
            alert("error");
        }
    })
}

//customer 结束


//原料库存开始
function materialInventoryTableFunction(_dataUrl, _dataDiv, _dataAbbreviation) {

    materialInventoryAjax("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv);
    //筛选事件
    $("#material-inventory-refresh").on('click', function () {
        materialInventoryAjax("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv);
    })
}

//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function materialInventoryAjax(_url, _dataType, _contentType, divName) {
    var json,
        targetJson, //格式化传过来的json数据最终的形式
        $length, //返回json数据记录总数量
        $id = 1; //初始页面
    $.ajax({ //通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        dataType: _dataType,
        contentType: _contentType,
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
            if (JSON.stringify(json.result) == "null") {
                $length = 0;
            } else {
                $length = json.result.length;
            }

            var tableName = [];
            $(divName + " .table-content").find("th").each(function (index, elment) {
                tableName.push($(elment).attr('name'));
            });

            for (let i = 1; i < 6; i++) {
                for (let j = 0; j < $length; j++) {
                    if (tableName[i] === json.result[j].materialClass) {
                        $("" + divName + " .table-content tbody td").eq(i).html(json.result[j].materialInventory);
                    }
                }
            }
        }
    });
}

//原料采购统计结束


// 产品库存表格开始
function productInventoryTableFunction(_dataUrl, _dataDiv, _dataAbbreviation) {
    var targetJson;
    inventoryInitAjaxUsePost("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "all", "", "", "");
    //筛选事件
    $("#" + _dataAbbreviation + "-select").on('click', function () {
        var productModel = $("#" + _dataAbbreviation + "-product-model").val();
        var productSize = $("#" + _dataAbbreviation + "-product-size").val();
        var productShape = $("#" + _dataAbbreviation + "-product-shape").val();
        inventoryInitAjaxUsePost("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "selectPage", productModel, productSize, productShape);
    })
}

function inventoryCreateTable(divName, targetId, _url, _productModel, _productSize, _productShape) {
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");
    var tableName = [];
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });
    var targetObject = {};
    inventoryAjaxUsePost(_url, targetId, _productModel, _productSize, _productShape);
    var map = $.parseJSON(targetJson);
    var length;
    if (JSON.stringify(json.result) == "null") {
        length = 0;
    } else {
        length = map.result.length;
    }
    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);
        for (let j = 0; j < tableName.length; j++) {
            $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
        }
    }
}

//点击上一页 参数分别为表格类名，当前页id，总页数和json格式数据
function inventoryClickLastPage(divName, $targetId, Page, _url, _productModel, _productSize, _productShape) {
    if ($targetId > 1) {
        $targetId = $targetId - 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        inventoryCreateTable(divName, $targetId, _url, _productModel, _productSize, _productShape);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据
//判断下一页是否为最后一页，来确定传给createTable记录长度
function inventoryClickNextPage(divName, $targetId, Page, _url, _productModel, _productSize, _productShape) {
    if ($targetId < Page) {
        $targetId = $targetId + 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        inventoryCreateTable(divName, $targetId, _url, _productModel, _productSize, _productShape);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击分页 参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度
//判断点击页是否为最后一页，来确定传给createTable的长度
function inventoryClickPage(divName, $targetId, Page, _this, _url, _productModel, _productSize, _productShape) {
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    inventoryCreateTable(divName, $targetId, _url, _productModel, _productSize, _productShape);

    if (($targetId >= 3) && ($targetId <= Page - 2)) {
        _this.siblings().addClass("hide");
        _this.prev().prev().removeClass("hide");
        _this.prev().removeClass("hide");
        _this.next().removeClass("hide");
        _this.next().next().removeClass("hide");
        _this.parent().children('li:last-child').removeClass("hide");
        _this.parent().children('li:first-child').removeClass("hide");
    } else {
        if ($targetId == 2) {
            _this.siblings().addClass("hide");
            _this.parent().children('li:last-child').removeClass("hide");
            _this.parent().children('li:first-child').removeClass("hide");
            _this.prev().removeClass("hide");
            _this.next().removeClass("hide");
            _this.next().next().removeClass("hide");
            _this.next().next().next().removeClass("hide");
        } else {
            if ($targetId == Page - 1) {
                _this.siblings().addClass("hide");
                _this.parent().children('li:last-child').removeClass("hide");
                _this.parent().children('li:first-child').removeClass("hide");
                _this.next().removeClass("hide");
                _this.prev().removeClass("hide");
                _this.prev().prev().removeClass("hide");
                _this.prev().prev().prev().removeClass("hide");
            }
        }
    }
}


//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function inventoryInitAjaxUsePost(_url, _dataType, _contentType, divName, pageType, _productModel, _productSize, _productShape) {
    var json,
        targetJson, //格式化传过来的json数据最终的形式
        $length, //返回json数据记录总数量
        $id = 1, //初始页面
        _data = {};
    if ((_productModel === "") && (_productSize === "") && (_productShape === "")) {
        $.ajax({ //通过起始时间和终止时间来获取需要的数据
            url: _url + "?pageNum=" + $id,
            type: "POST",
            dataType: _dataType,
            data: JSON.stringify(_data),
            contentType: _contentType,
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
                if (JSON.stringify(json.result) == "null") {
                    $length = 0;
                } else {
                    $length = json.result.length;
                }
                let $page = json.msg;

                inventoryCreateTable(divName, $id, _url, _productModel, _productSize, _productShape);

                $(divName + " .pagination-box").remove();
                if ($length > 0) {
                    CreatePage(divName, $page, pageType + " ");
                } else {
                    showStatusModal(":-", "该 时间区间 查询没有记录")
                }

                //点击页数
                $(divName + " ." + pageType + " .page").on("click", function () {
                    $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                    inventoryClickPage(divName, $id, $page, $(this), _url, _startTime, _endTime);
                });

                // 点击上一页
                $(divName + " ." + pageType + " .last").on("click", function () {
                    $id = inventoryClickLastPage(divName, $id, $page, _url, _startTime, _endTime);
                });

                // 点击下一页
                $(divName + " ." + pageType + " .next").on("click", function () {
                    $id = inventoryClickNextPage(divName, $id, $page, _url, _startTime, _endTime);
                })
            },
            error: function () {
                alert("error1");
            }
        });
    } else {
        if (_productModel !== "") {
            _data.productModel = _productModel;
        }
        if (_productSize !== "") {
            _data.productSize = _productSize;
        }
        if (_productShape !== "none") {
            _data.productShape = _productShape;
        }
        $.ajax({ //通过起始时间和终止时间来获取需要的数据
            url: _url + "?pageNum=" + $id,
            type: "POST",
            dataType: _dataType,
            data: JSON.stringify(_data),
            contentType: _contentType,
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
                if (JSON.stringify(json.result) == "null") {
                    $length = 0;
                } else {
                    $length = json.result.length;
                }
                let $page = json.msg;

                inventoryCreateTable(divName, $id, _url, _productModel, _productSize, _productShape);
                $(divName + " .pagination-box").remove();
                if ($length > 0) {
                    CreatePage(divName, $page, pageType + " ");
                } else {
                    showStatusModal(":-", "该 时间区间 查询没有记录")
                }

                //点击页数
                $(divName + " ." + pageType + " .page").on("click", function () {
                    $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                    inventoryClickPage(divName, $id, $page, $(this), _url, _startTime, _endTime);
                })

                // 点击上一页
                $(divName + " ." + pageType + " .last").on("click", function () {
                    $id = inventoryClickLastPage(divName, $id, $page, _url, _startTime, _endTime);
                })

                // 点击下一页
                $(divName + " ." + pageType + " .next").on("click", function () {
                    $id = inventoryClickNextPage(divName, $id, $page, _url, _startTime, _endTime);
                })
            },
            error: function () {
                alert("error1");
            }
        });
    }

}

function inventoryAjaxUsePost(_url, $Id, _productModel, _productSize, _productShape) {
    var _data = {};
    if ((_productModel === "") && (_productSize === "") && (_productShape === "")) {
        $.ajax({
            url: _url + "?pageNum=" + $Id,
            type: "POST",
            async: false,
            data: JSON.stringify(_data),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
            },
            error: function () {
                alert("error2");
            }
        })
    } else {
        if (_productModel !== "") {
            _data.productModel = _productModel;
        }
        if (_productSize !== "") {
            _data.productSize = _productSize;
        }
        if (_productShape !== "none") {
            _data.productShape = _productShape;
        }
        $.ajax({
            url: _url + "?pageNum=" + $Id,
            type: "POST",
            async: false,
            data: JSON.stringify(_data),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
            },
            error: function () {
                alert("error2");
            }
        })
    }
}

// 产品库存表格结束

//订单表格开始
function orderTableFunction(_dataUrl, _dataDiv, _dataAbbreviation) {
    var mydate = new Date();

    setDateToday(mydate, _dataAbbreviation);
    var todayTime = todayTimeFormat(mydate);
    var today = Date.parse(todayTime);
    orderInitAjaxUseGet(path + "WarehouseOrders", "json", "application/json;charset=utf-8", ".factory-order-record-table", "all", 0, today, "", "", "");

    //筛选事件
    $("#for-select").on('click', function () {
        var orderNum = $("#for-order-num").val();
        var customerName = $("#for-customer-name").val();
        var orderstatus = $("#for-order-status").val();
        var $selectStartTime = Date.parse($("#for-start-date").val());
        var $selectEndTime = Date.parse($("#for-end-date").val());
        console.log($selectStartTime);
        console.log($selectEndTime);
        if ($selectStartTime > $selectEndTime) {
            showStatusModal("请选择正确的时间");
        } else {
            orderInitAjaxUseGet(path + "WarehouseOrders", "json", "application/json;charset=utf-8", ".factory-order-record-table", "selectPage", $selectStartTime, $selectEndTime, orderNum, customerName, orderstatus);
        }
    })
}

function orderCreateTable(divName, targetId, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus) {
    var $thead = $(divName + " .table-content thead");
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");

    var thHiden = []; //隐藏的元素的name属性值所存放的数组
    $thead.find("th.hide").each(function (index, elment) {
        thHiden.push($(elment).attr("name"));
    });

    var tableName = [];
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });
    var targetObject = {};
    orderAjaxUseGet(_url, targetId, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
    var map = $.parseJSON(targetJson);
    var length;
    if (JSON.stringify(json.result) == "null") {
        length = 0;
    } else {
        length = map.result.length;
    }
    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);

        if (thHiden.length > 0) {
            var $arr_index = [];
            for (let k = 0; k < thHiden.length; k++) {
                $arr_index.push(tableName.indexOf(thHiden[k]));
            }
        }

        for (let j = 0; j < tableName.length; j++) {
            let reg = /.{0,}Date.{0,}/;
            if (reg.test(tableName[j])) {
                var date = new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]] = date.split(" ")[0];
            }


            if ((divName === ".factory-order-record-table") && ($arr_index.indexOf(j) !== -1)) {
                $tbody.children("tr:last-child").append('<td class="data-hide">' + targetObject[tableName[j]] + '</td>');
            } else {
                $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
            }
        }
        if (divName === ".factory-order-record-table") {
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-info btn-sm table-content-detail" id="row-' + (i + 1) + '" data-toggle="modal" data-target="#myModal">查看</button>');
        }
        if (divName !== ".warehouse-product-inventory-statistics-table") {
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default btn-sm table-content-modify" >修改</button>');
        }
    }

    //广源修改 订单详细信息按钮
    $(".table-content-detail").on('click', function () {
        var id = parseInt($(this).attr("id").match(/\d+/g)) - 1;
        var content = [];
        var target = {};
        target = iterationObject(map.result[id], target);
        $("#order-modal").modal("show")
            .on("shown.bs.modal", function () {
                $(".order-detail").html("");
                for (let j = 0; j < tableName.length; j++) {
                    var text = $("" + divName + " .table-content th[name=" + tableName[j] + "]").text();
                    $(".order-detail").append('<span>' + text + ':' + target[tableName[j]] + '</span><br />');
                }
            })
    });


    // 李昕修改 响应修改按钮弹出模态框
    $(".table-content-modify").click(function () {
        var $thModify = $(this).parents("table").find("th");
        // 同行的单元格
        var $tdModify = $(this).parent().find("td");
        // 对应表格存有对应模态框的ID
        var tableModalID = $(this).parents("table").attr("data-modal-id");
        // 获取要写入模态的数据
        var preData = getModifyItemData($thModify, $tdModify);
        writeDataToModal(tableModalID, preData);

    });
}


//点击上一页 参数分别为表格类名，当前页id，总页数和json格式数据
function orderClickLastPage(divName, $targetId, Page, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus) {
    if ($targetId > 1) {
        $targetId = $targetId - 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        orderCreateTable(divName, $targetId, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据
//判断下一页是否为最后一页，来确定传给createTable记录长度
function orderClickNextPage(divName, $targetId, Page, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus) {
    if ($targetId < Page) {
        $targetId = $targetId + 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        orderCreateTable(divName, $targetId, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击分页 参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度
//判断点击页是否为最后一页，来确定传给createTable的长度
function orderClickPage(divName, $targetId, Page, _this, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus) {
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    orderCreateTable(divName, $targetId, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);

    if (($targetId >= 3) && ($targetId <= Page - 2)) {
        _this.siblings().addClass("hide");
        _this.prev().prev().removeClass("hide");
        _this.prev().removeClass("hide");
        _this.next().removeClass("hide");
        _this.next().next().removeClass("hide");
        _this.parent().children('li:last-child').removeClass("hide");
        _this.parent().children('li:first-child').removeClass("hide");
    } else {
        if ($targetId == 2) {
            _this.siblings().addClass("hide");
            _this.parent().children('li:last-child').removeClass("hide");
            _this.parent().children('li:first-child').removeClass("hide");
            _this.prev().removeClass("hide");
            _this.next().removeClass("hide");
            _this.next().next().removeClass("hide");
            _this.next().next().next().removeClass("hide");
        } else {
            if ($targetId == Page - 1) {
                _this.siblings().addClass("hide");
                _this.parent().children('li:last-child').removeClass("hide");
                _this.parent().children('li:first-child').removeClass("hide");
                _this.next().removeClass("hide");
                _this.prev().removeClass("hide");
                _this.prev().prev().removeClass("hide");
                _this.prev().prev().prev().removeClass("hide");
            }
        }
    }
}


//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function orderInitAjaxUseGet(_url, _dataType, _contentType, divName, pageType, _startTime, _endTime, _orderNum, _customerName, _orderstatus) {
    var json,
        targetJson, //格式化传过来的json数据最终的形式
        $length, //返回json数据记录总数量
        $id = 1, //初始页面
        _data = {
            beginTime: _startTime,
            endTime: _endTime
        };
    if ((_orderNum === "") && (_customerName === "") && (_orderstatus === "")) {
        $.ajax({ //通过起始时间和终止时间来获取需要的数据
            url: _url,
            type: "Get",
            dataType: _dataType,
            data: _data,
            contentType: _contentType,
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
                if (JSON.stringify(json.result) == "null") {
                    $length = 0;
                } else {
                    $length = json.result.length;
                }
                let $page = json.msg;

                orderCreateTable(divName, $id, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);

                $(divName + " .pagination-box").remove();
                if ($length > 0) {
                    CreatePage(divName, $page, pageType + " ");
                } else {
                    showStatusModal(":-", "该 时间区间 查询没有记录")
                }

                //点击页数
                $(divName + " ." + pageType + " .page").on("click", function () {
                    $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                    orderClickPage(divName, $id, $page, $(this), _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                })

                // 点击上一页
                $(divName + " ." + pageType + " .last").on("click", function () {
                    $id = orderClickLastPage(divName, $id, $page, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                })

                // 点击下一页
                $(divName + " ." + pageType + " .next").on("click", function () {
                    $id = orderClickNextPage(divName, $id, $page, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                })
            },
            error: function () {
                alert("error1");
            }
        });
    } else {
        if (_orderNum !== "") {
            _data.orderNum = _orderNum;
        }
        if (_customerName !== "") {
            _data.customerName = _customerName;
        }
        if (_orderstatus !== "none") {
            _data.orderStatus = _orderstatus;
        }
        $.ajax({ //通过起始时间和终止时间来获取需要的数据
            url: _url,
            type: "Get",
            dataType: _dataType,
            data: _data,
            contentType: _contentType,
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
                if (JSON.stringify(json.result) == "null") {
                    $length = 0;
                } else {
                    $length = json.result.length;
                }
                let $page = json.msg;

                orderCreateTable(divName, $id, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                $(divName + " .pagination-box").remove();
                if ($length > 0) {
                    CreatePage(divName, $page, pageType + " ");
                } else {
                    showStatusModal(":-", "该 时间区间 查询没有记录")
                }

                //点击页数
                $(divName + " ." + pageType + " .page").on("click", function () {
                    $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                    orderClickPage(divName, $id, $page, $(this), _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                })

                // 点击上一页
                $(divName + " ." + pageType + " .last").on("click", function () {
                    $id = orderClickLastPage(divName, $id, $page, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                })

                // 点击下一页
                $(divName + " ." + pageType + " .next").on("click", function () {
                    $id = orderClickNextPage(divName, $id, $page, _url, _startTime, _endTime, _orderNum, _customerName, _orderstatus);
                })
            },
            error: function () {
                alert("error1");
            }
        });
    }

}

function orderAjaxUseGet(_url, $Id, _startTime, _endTime, _orderNum, _customerName, _orderstatus) {
    _data = {
        pageNum: $Id,
        beginTime: _startTime,
        endTime: _endTime
    };
    if ((_orderNum === "") && (_customerName === "") && (_orderstatus === "")) {
        $.ajax({
            url: _url,
            type: "Get",
            async: false,
            data: _data,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
            },
            error: function () {
                alert("error2");
            }
        })
    } else {
        if (_orderNum !== "") {
            _data.orderNum = _orderNum;
        }
        if (_customerName !== "") {
            _data.customerName = _customerName;
        }
        if (_orderstatus !== "none") {
            _data.orderStatus = _orderstatus;
        }
        $.ajax({
            url: _url,
            type: "Get",
            async: false,
            data: _data,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                json = eval(data);
                targetJson = JSON.stringify(json);
            },
            error: function () {
                alert("error2");
            }
        })
    }
}

//订单表格结束


// 统计表格开始
function statisticsTableFunction(_dataUrl, _dataDiv, _dataAbbreviation) {

    //初始页面
    var mydate = new Date();

    setDateToday(mydate, _dataAbbreviation);
    var todayTime = todayTimeFormat(mydate);
    var today = Date.parse(todayTime);
    statisticsInitAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "all", today, today);

    //筛选事件
    $("#" + _dataAbbreviation + "-select").on('click', function () {
        var $selectStartTime = Date.parse($("#" + _dataAbbreviation + "-start-date").val());
        var $selectEndTime = Date.parse($("#" + _dataAbbreviation + "-end-date").val());
        if ($selectStartTime > $selectEndTime) {
            showStatusModal("请选择正确的时间");
        } else {
            statisticsInitAjaxUseGet("" + path + _dataUrl, "json", "application/json;charset=utf-8", "" + _dataDiv, "selectPage", $selectStartTime, $selectEndTime);
        }
    })
}

function statisticsCreateTable(divName, _url, _startTime, _endTime) {
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");
    var tableName = [];
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });
    var targetObject = {};
    var map = $.parseJSON(targetJson);
    var length;
    if (JSON.stringify(map.result) == "null") {
        length = 0;
    } else {
        length = map.result.length;
    }
    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);
        $tbody.children("tr:last-child").append('<td>' + map.result[i][tableName[0]] + '</td>');
        for (let j = 1; j < tableName.length; j++) {
            let reg = /.{0,}Date.{0,}/;
            if (reg.test(tableName[j])) {
                var date = new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]] = date.split(" ")[0];
                var changeDate = targetObject[tableName[j]].split("-");
                for (let z = 1; z < changeDate.length; z++) {
                    var temp = parseInt(changeDate[z]);
                    if (temp < 10) {
                        changeDate[z] = "0" + changeDate[z];
                    }
                }
                targetObject[tableName[j]] = changeDate.join("-");
            }
            $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
        }
    }
}

//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function statisticsInitAjaxUseGet(_url, _dataType, _contentType, divName, pageType, _startTime, _endTime) {
    var json,
        $length; //返回json数据记录总数量
    $.ajax({ //通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data: {
            beginTime: _startTime,
            endTime: _endTime
        },
        dataType: _dataType,
        contentType: _contentType,
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
            if (JSON.stringify(json.result) == "null") {
                $length = 0;
            } else {
                $length = json.result.length;
            }
            let $page = json.msg;

            statisticsCreateTable(divName, _url, _startTime, _endTime);
            if ($length == 0) {
                showStatusModal(":-", "该 时间区间 查询没有记录");
            }
        }
    });
}

// 统计表格结束

// 初始化，监听开炉查询、损耗比查询、其他清仓、产品清仓四个按钮
function blowonCheckButton() {
    //点击开炉查询之后实现的交互
    $("#bor-record-button").on('click', function () {

        var $bo = $(".blowon-record-table");
        $(".lossratio-record-table").css("display", "none");
        $bo.css("display", "block");
        btnCallCommon($bo);

    });

    //点击损耗比查询之后实现的交互
    $("#lr-record-button").on('click', function () {

        var $lr = $(".lossratio-record-table");
        $(".blowon-record-table").css("display", "none");
        $lr.css("display", "block");
        btnCallCommon($lr);

    });

    //点击其他清仓查询之后实现的交互
    $("#cwor-record-button").on('click', function () {

        var $cwo = $(".check-warehouse-others-record-table");
        $(".check-warehouse-product-record-table").css("display", "none");
        $cwo.css("display", "block");
        btnCallCommon($cwo);

    })

    //点击产品清仓查询之后实现的交互
    $("#cwpr-record-button").on('click', function () {

        var $cwp = $(".check-warehouse-product-record-table");
        $(".check-warehouse-others-record-table").css("display", "none");
        $cwp.css("display", "block");
        btnCallCommon($cwp);

    })
}

// 开炉查询、损耗比查询、其他清仓、产品清仓四个按钮调用commonTableFunction函数来生成对应表格信息
function btnCallCommon($bcc) {
    commonTableFunction($bcc.attr("data-url"), $bcc.attr("data-div"), $bcc.attr("data-abbreviation"));
}


// 高于钦
function initAdd() {

    // 李昕抽取

    //输入控件获得焦点时错误提示信息消失
    $(".add-form-item").focus(function () {
        $(this).parents("div.add-form").find("span.hiddenMsg").removeClass("errorMsg");
    });

    //对输入规格进行判断
    $(".product-size-form-item").blur(function () {
        $(this).sizeJudge();
    });

    //对数值的正则表达判断
    $(".number-judge").blur(function () {
        $(this).numberJudge();
    });

    // 点击取消按钮清空所有数据
    $(".btn-cancel-in-add-form").click(function () {
        $(this).clearDatas();
    });

    //点击确定按钮在模态窗口中显示所有数据
    $(".btn-submit-in-add-form").click(function () {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $(".btn-confirm-in-modal").click(function () {
        var addUrl = $(this).parents("div.add-form").attr("data-url");
        console.log("addUrl:" + addUrl);
        $(this).passDatasToURL(addUrl, "POST");
    });


    /* 通用函数
     ----------------------------------------------------------------------------------------*/
    $(function () {

        // 为所有添加面板的产品型号选择框获取型号
        getProductModel($("select[id$=product-model]"));
        getWarehouseManager();

        //禁止直接输入日期
        $("[id$=date]").focus(function () {
            $(this).blur();
        });

        //至当天结束的日期选择
        $("[id$=end-date]").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'yy-mm-dd',
            monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            dayNamesMin: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            firstDay: 1,
            maxDate: new Date(),
            nextText: '下月',
            prevText: '上月',
            yearRange: '1970:+2017',
            onSelect: function (dataText, inst) {
                $(this).val(dataText);
            },
            //生成时间戳
            onClose: function (dataText, inst) {
                var dateStr = Date.parse(dataText);
                $(this).parents("table").find("input[id$=end-time]").val(dateStr);
            }
        });

        $("[id$=start-date]").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'yy-mm-dd',
            monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            dayNamesMin: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            firstDay: 1,
            maxDate: new Date(),
            nextText: '下月',
            prevText: '上月',
            yearRange: '1970:+2017',
            onSelect: function (dataText, inst) {
                $(this).val(dataText);
                console.log(dataText);
            },
            //生成时间戳
            onClose: function (dataText, inst) {
                var dateStr = Date.parse(dataText);
                $(this).parents("table").find("input[id$=start-time]").val(dateStr);
                console.log(dataText);
            }
        });

        //对数值的正则表达判断（保留几位小数）
        (function ($) {
            $.fn.numberJudge = function () {
                var reg = /^[0-9]+(\.[0-9]{0,*})?$/g;
                var num = $(this).val();
                var result = reg.test(num);

                if (!result) {
                    if (num == '') {
                        $(this).attr("placeholder", "输入不能为空");
                    } else {
                        $(this).val('').attr("placeholder", "请按正确格式输入");
                    }
                } else if (num == 0) {
                    $(this).val('').attr("placeholder", "输入不能为0");
                } else if ($(this).attr("id").indexOf("quantity") > 1) {
                    $(this).val(Number(num).toFixed(3));
                } else {
                    $(this).val(Number(num).toFixed(2));
                }
                return $(this).val();
            }
        })(jQuery);

        //对规格的正则表达式判断
        (function ($) {
            $.fn.sizeJudge = function () {
                var reg = /^[0-9]+(\.[0-9]{0,2})?\*[0-9]+(\.[0-9]{0,2})?\*[0-9]+(\.[0-9]{0,2})?$/g;
                var size = $(this).val();
                var result = reg.test(size);

                if (result) {
                    var sizeArr = size.split("*");
                    if (sizeArr.indexOf("0") != -1) {
                        $(this).val('').attr("placeholder", "请按正确格式输入");
                    } else {
                        sizeArr[0] = Number(sizeArr[0]).toFixed(2).toString();
                        sizeArr[1] = Number(sizeArr[1]).toFixed(2).toString();
                        sizeArr[2] = Number(sizeArr[2]).toFixed(2).toString();
                        size = sizeArr[0] + "*" + sizeArr[1] + "*" + sizeArr[2];
                        $(this).val(size);
                    }

                } else if (size == '') {
                    $(this).val('').attr("placeholder", "输入不能为空");
                } else {
                    $(this).val('').attr("placeholder", "请按正确格式输入");
                }
            }
        })(jQuery);

        //清空所有数据
        (function ($) {
            $.fn.clearDatas = function () {
                var currentDivID = $(this).parent().parent().attr("id");
                var currentIDs = "#" + currentDivID + " tbody [id]";
                $(currentIDs).each(function () {
                    $(this).val('');
                });
                $(this).siblings("span").removeClass("errorMsg");

                var btnID = $(this).attr("id");
                switch (btnID) {
                    case "btn-cancel-material": {
                        $("#material-purchase-purchase-quantity").attr("placeholder", "保留两位小数");
                        $("#material-purchase-unit-price").attr("placeholder", "保留两位小数");
                    }
                        break;

                    case "btn-cancel-product-produce": {
                        $("#product-produce-product-size").attr("placeholder", "厚*长*宽");
                        $("#product-produce-produce-quantity").attr("placeholder", "保留两位小数");
                    }
                        break;

                    case "btn-cancel-out-storage": {
                        $("#out-storage-product-size").attr("placeholder", "厚*长*宽");
                        $("#out-storage-quantity").attr("placeholder", "保留两位小数");
                    }
                        break;

                    case "btn-cancel-add-product": {
                        $("#add-product-model").attr("placeholder", "字母加数字");
                        $("#add-product input[id^=add-product-ratio]").each(function () {
                            $(this).attr("placeholder", "保留两位小数");
                        });
                    }
                        break;

                    case "btn-cancel-in-storage": {
                        $("#in-storage-product-size").attr("placeholder", "厚*长*宽");
                        $("#in-storage-quantity").attr("placeholder", "保留两位小数");
                    }
                        break;

                    case "btn-cancel-add-delivery":
                        $("#add-delivery-quantity").attr("placeholder", "保留两位小数");
                        break;
                }
            }
        })(jQuery);

        //给模态窗口传递值
        (function ($) {
            $.fn.passDatesToModal = function () {
                //保存已经输入的项
                var inputsArr = [];
                var divID = $(this).parent().parent().attr("id");
                var inputs = "#" + divID + " tbody [id]";
                var modalDivID = $("#" + divID).find("div.modal").attr("id");
                var modals = "#" + modalDivID + " span[id]";

                //需要输入项的数目
                var needLen = $(inputs).length;
                console.log(needLen);

                for (var i = 0; i < needLen; i++) {
                    var indexInput = inputs + ":eq(" + i + ")";
                    var indexModal = modals + ":eq(" + i + ")";
                    var input = $(indexInput).val();

                    if (input) {
                        $(indexModal).text(input);
                        inputsArr.push(input);
                    }
                }
                var inputLen = inputsArr.length;
                if (inputLen === needLen) {
                    var modal = "#" + modalDivID;
                    $(modal).modal('show');
                } else {
                    $(this).siblings("span").text("请输入完整信息!").addClass("errorMsg");
                }
            }
        })(jQuery);

        //将数据提取并发送到请求到后台
        (function ($) {
            $.fn.passDatasToURL = function (acceptURL, submitType) {

                //取得在同一个页面的table的id
                var tableID = $(this).parents("div.add-form").attr("id");
                var dataElesStr = "#" + tableID + " [name]";
                //带有name属性的元素个数
                var datalen = $(dataElesStr).length;
                var $datasArr = $(dataElesStr);
                var obj = {};
                for (var i = 0; i < datalen; i++) {
                    var reg = /^\d+(\.\d{0,2})?$/g;
                    if (reg.test($datasArr.eq(i).val())) {
                        obj[$datasArr.eq(i).attr("name")] = Number($datasArr.eq(i).val());
                    } else {
                        obj[$datasArr.eq(i).attr("name")] = $datasArr.eq(i).val();
                    }
                }
                var jsonStr = JSON.stringify(convertToJson(obj));
                // console.log(obj);
                // console.log(jsonStr);

                if (jsonStr) {
                    $.ajax({
                        url: path + acceptURL,
                        type: submitType,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: jsonStr,
                        success: function (data) {
                            //请求成功时关闭现有模态窗口并弹出成功提醒模态窗口
                            if (data.code === 0) {
                                $("div[id^=modal]").modal("hide");
                                // $("#modal-success").modal("show");
                                showStatusModal(data.code, data.msg);
                                // 清除提交的数据
                                $("button[id^=btn-cancel]").click();
                                // 成功后，更新记录表格
                                var $p = $("#" + tableID);
                                var $recordTableDiv = $p.parent().find("div.table-data");
                                updataRecordTable($recordTableDiv);

                            } else {
                                // $("#modal-fail span").text(data.msg);
                                // $("#modal-fail").modal("show");
                                showStatusModal(data.code, data.msg);
                            }
                        },
                        error: function (XMLResponse, textStatus) {
                            // console.log("失败了？？？" + textStatus);
                            // $("#modal-fail").modal("show");
                            showStatusModal("失败", textStatus);
                        }
                    });
                }
            };
        })(jQuery);

    });

    /* 原料采购登记
     ----------------------------------------------------------------------------------------*/
    $(function () {

        var purQuantity, uPrice, tPrice;

        //禁止直接输入总价
        $("#material-purchase-total-price").focus(function () {
            $(this).blur();
        });

        //自动生成原料ID
        $("#material-purchase-material-class").change(function () {
            $("#material-purchase-material-id").val($(this).prop("selectedIndex") + 1);
        });

        //对输入购买量进行判断
        $("#material-purchase-purchase-quantity").blur(function () {
            purQuantity = $(this).numberJudge();

            //自动生成总价
            if (purQuantity && uPrice) {
                tPrice = (purQuantity * uPrice).toFixed(2).toString();
                $("#material-purchase-total-price").val(tPrice);
            }
        });

        //对输入原料单价进行判断
        $("#material-purchase-unit-price").blur(function () {
            uPrice = $(this).numberJudge();

            //自动生成总价
            if (purQuantity && uPrice) {
                tPrice = (purQuantity * uPrice).toFixed(2).toString();
                $("#material-purchase-total-price").val(tPrice);
            }
        });

    });


    /* 产品型号添加
     ----------------------------------------------------------------------------------------*/
    $(function () {

        //对输入产品型号进行判断
        $("#add-product-model").blur(function () {
            var existCode;
            var reg = /^([a-zA-Z]{1,})([0-9]{1,})$/;
            var model = $(this).val();
            var result = reg.test(model);
            if (!result) {
                if (model == '') {
                    $(this).attr("placeholder", "输入不能为空");
                } else {
                    $(this).val('').attr("placeholder", "请按正确格式输入")
                }
            } else {
                //从数据库获取现有的型号并对比，判断是否存在
                $.ajax({
                    url: path + "ProductModelInfo/productModels",
                    type: "GET",
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        var len = data.result.length;
                        for (var i = 0; i < len; i++) {
                            if (data.result[i] == model) {
                                existCode = 1;
                            }
                        }
                    }
                });
                if (existCode == 1) {
                    $(this).focus();
                    $(this).parents("div").last().find("span").text($(this).val() + "型号已存在").addClass("errorMsg");
                    $(this).val('').attr("placeholder", "字母加数字");
                }
            }
        });

        //对输入的各种原料占比输入及和进行判断
        $("#add-product input:not(#add-product-end-date):not(#add-product-model").each(function () {
            var ratioAg, ratioCu, ratioZn, ratioCd, ratioSn;
            var totalRatio;

            $(this).blur(function () {
                var reg = /^(1|0(\.[0-9]{1,2})?)$/g;
                var ratio = $(this).val();
                var result = reg.test(ratio);

                if (!result) {
                    if (ratio == '') {
                        $(this).attr("placeholder", "输入不能为空");
                    } else if (ratio < 0 || ratio >= 1) {
                        $(this).val('').attr("placeholder", "输入超出规定范围");
                    } else {
                        $(this).val('').attr("placeholder", "请按正确格式输入");
                    }
                } else if (ratio != 0) {
                    $(this).val(Number(ratio).toFixed(2));

                    ratioAg = $("#add-product-ratioAg").val();
                    ratioCu = $("#add-product-ratioCu").val();
                    ratioZn = $("#add-product-ratioZn").val();
                    ratioCd = $("#add-product-ratioCd").val();
                    ratioSn = $("#add-product-ratioSn").val();
                    console.log(ratioAg, ratioCu, ratioZn, ratioCd, ratioSn);

                    if (ratioAg && ratioCu && ratioZn && ratioCd && ratioSn) {
                        totalRatio = Number(Number(ratioAg) + Number(ratioCu) + Number(ratioZn) + Number(ratioCd) + Number(ratioSn)).toFixed(2);
                        if (totalRatio != 1) {
                            $(this).parents("div").last().find("span").text("各项占比和不为1，请检查").addClass("errorMsg");
                            $(this).val('').attr("placeholder", "保留两位小数");
                        }
                    }
                }
            });
        });
    });


    /* 订单登记
     ----------------------------------------------------------------------------------------*/
    $(function () {

        var sellUnitPrice, sellQuantity, sellTotalPrice;
        var delivererNames = new Array();
        var delivererIDs = new Array();
        var delivererOptionHtml = '';

        //从数据库获取所有仓库管理员
        $.ajax({
            url: path + "staffs/role/仓库管理员",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                if (data.code !== 0) {
                    alert(data.msg);
                } else {
                    $.each(data.result, function (index, content) {
                        delivererNames.push(content['staffName']);
                        delivererIDs.push(content['staffId']);

                        delivererOptionHtml += '<option value="' + content['staffName'] + '">' +
                            content['staffName'] + '</option>';
                    });
                    delivererOptionHtml += '<option value="" class="blank-option" selected></option>';
                }
                $("#add-order-deliverer-name").html(delivererOptionHtml);
            }
        });

        //根据选中员工名称自动生成员工ID
        $("#add-order-deliverer-name").change(function () {
            var selectedIndex = $(this).prop("selectedIndex");
            $("#add-order-deliverer-id").val(delivererIDs[selectedIndex]);
        });


        //禁止直接输入总价
        $("#add-order-total-price").focus(function () {
            $(this).blur();
        });


        //对输入出售总量进行判断
        $("#add-order-quantity-total").blur(function () {
            sellQuantity = $(this).numberJudge();

            //自动生成总价
            if (sellQuantity && sellUnitPrice) {
                sellTotalPrice = (sellQuantity * sellUnitPrice).toFixed(2).toString();
                $("#add-order-total-price").val(sellTotalPrice);
            }
        });

        //对输入单价进行判断
        $("#add-order-unit-price").blur(function () {
            sellUnitPrice = $(this).numberJudge();

            //自动生成总价
            if (sellQuantity && sellUnitPrice) {
                sellTotalPrice = (sellQuantity * sellUnitPrice).toFixed(2).toString();
                $("#add-order-total-price").val(sellTotalPrice);
            }
        });

        //对输入收货人姓名进行判断
        $("#add-order-customer-name").blur(function () {
            var reg1 = /^[\u4E00-\u9FA5]+$/g;
            var reg2 = /^[a-zA-Z][a-zA-Z\s]*$/g;
            var name = $(this).val();
            var result = reg1.test(name) || reg2.test(name);

            if (!result) {
                if (name == '') {
                    $(this).attr("placeholder", "输入不能为空");
                } else {
                    $(this).val('').attr("placeholder", "请输入正确姓名");
                }
            }
        });

        //对输入联系电话进行判断
        $("#add-order-customer-phone").blur(function () {
            var reg1 = /^1\d{10}$/g;
            var reg2 = /^0\d{2,3}-?\d{7,8}$/g;
            var tel = $(this).val();
            var result = reg1.test(tel) || reg2.test(tel);

            if (!result) {
                if (tel == '') {
                    $(this).attr("placeholder", "输入不能为空");
                } else {
                    $(this).val('').attr("placeholder", "请输入正确联系方式");
                }
            }
        });

        //对输入配送地址进行判断
        $("#add-order-customer-address").blur(function () {
            if ($(this).val() == '' || /^\s*$/g.test($(this).val())) {
                $(this).val('').attr("placeholder", "输入不能为空");
            }
        });

        //选择送达日期
        $("[id$='arrival-date']").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'yy-mm-dd',
            monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            dayNamesMin: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            firstDay: 1,
            minDate: new Date(),
            nextText: '下月',
            prevText: '上月',
            yearRange: '-1970:+2017',
            onSelect: function (dataText, inst) {
                $(this).val(dataText);
            },
            //生成时间戳
            onClose: function (dataText, inst) {
                var dateStr = Date.parse(dataText.replace(/-/g, "/"));
                $(this).parents("table").find("input[id$=start-time]").val(dateStr);
            }
        });


    });


    /* 配送登记
     ----------------------------------------------------------------------------------------*/
    $("#delivery-record-atag").click(function () {

        //从数据库查询订单并选择，自动生成产品信息
        var orderNumbers = [];
        var orderModels = [];
        var orderSizes = [];
        var orderShapes = [];
        var orderNames = [];
        var productOptionHtml = '';

        $.ajax({
            url: path + "WarehouseOrder/orderSet",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                if (data.code != 0) {
                    alert(data.msg);
                } else {
                    $.each(data.result, function (index, content) {
                        orderNumbers.push(content['orderNum']);
                        orderModels.push(content['product']['productModelInfo']['productModel']);
                        orderSizes.push(content['product']['productSize']);
                        orderShapes.push(content['product']['productShape']);
                        orderNames.push(content['customer']['customerName']);
                    });
                    for (var i = 0; i < orderModels.length; i++) {
                        productOptionHtml += '<option value="' + orderNumbers[i] + '">' +
                            orderNumbers[i] + '</option>';
                    }


                    productOptionHtml += '<option value="" class="blank-option" selected></option>';
                }
                $("#add-delivery-order-num").html(productOptionHtml);
            },
            error: function () {
                console.log("请求订单失败!");
            }
        });

        //根据选中订单编号自动填充产品信息和收货人信息
        $("#add-delivery-order-num").change(function () {
            //获取选中项的索引
            var selectedIndex = $(this).prop("selectedIndex");
            $("#add-delivery-product-model").val(orderModels[selectedIndex]);
            $("#add-delivery-product-size").val(orderSizes[selectedIndex]);
            $("#add-delivery-product-shape").val(orderShapes[selectedIndex]);
            $("#add-delivery-customer-name").val(orderNames[selectedIndex]);
        });


        //禁止直接输入产品信息和收货人
        $("[id^=add-delivery-product]").focus(function () {
            $(this).blur();
        });
        $("#add-delivery-customer-name").focus(function () {
            $(this).blur();
        });


        //点击模态框中的确认按钮执行与后台的交互
        $("#modal-btn-submit-add-delivery").click(function () {
            var url = "warehouseDeliveryRecord/" + $("#add-delivery-order-num").val();
            $(this).passDatasToURL(url, "POST");
        });

    })
}


// 詹育壕
function initModal() {
    // 原料采购模态框的触发事件
    $("button.emit-modal-material-purchase").click(function () {
        $("#modal-material-purchase").modal("show");
    });
    // 开炉登记模态框的触发事件
    $("button.emit-modal-blowon").click(function () {
        $("#modal-blowon").modal("show");
    });
    // 胚料登记模态框的触发事件
    $("button.emit-modal-blank").click(function () {
        $("#modal-blank").modal("show");
    });
    // 产品产出登记模态框的触发事件
    $("button.emit-modal-product-produce").click(function () {
        $("#modal-product-produce").modal("show");
    });
    // 出库登记模态框的触发事件
    $("button.emit-modal-out-storage").click(function () {
        $("#modal-out-storage").modal("show");
    });
    // 产品型号登记模态框的触发事件
    $("button.emit-modal-product-model").click(function () {
        $("#modal-product-model").modal("show");
    });
    // 入库登记模态框的触发事件
    $("button.emit-modal-in-storage").click(function () {
        $("#modal-in-storage").modal("show");
    });
    // 订单登记模态框的触发事件
    $("button.emit-modal-add-order").click(function () {
        $("#modal-add-order").modal("show");
    });
    // "其他清仓"模态框的触发事件
    $("button.emit-modal-check-warehouse-others").click(function () {
        $("#modal-check-warehouse-others").modal("show");
    });
    // "产品清仓"模态框的触发事件
    $("button.emit-modal-check-warehouse-product").click(function () {
        $("#modal-check-warehouse-product").modal("show");
    });
    // 配送登记模态框的触发事件
    $("button.emit-modal-warehouse-delivery").click(function () {
        $("#modal-warehouse-delivery").modal("show");
    });
    //提交确认的模态框的触发事件
    $("button.emit-modal-confirm").click(function () {
        $("#modal-confirm").modal("show");
    });

    //不超过当天的日期选择限制,选择器是含有data-date属性的元素
    $("[data-date]").datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd',
        monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        dayNamesMin: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        firstDay: 1,
        maxDate: new Date(),
        nextText: '下月',
        prevText: '上月',
        yearRange: '1970:+2017',
        onSelect: function (dataText, inst) {
            $(this).val(dataText);
        },
    });

    //添加一行记录
    $(".btn-add-record-row").click(function () {
        addRecordRow($(this), _modelArr);
        console.log("add a new line");
    });

    //删除最后一行记录
    $(".btn-delete-last-row").click(function () {
        deleteRecordRow($(this));
    });

    //清空记录
    $(".btn-clear-record").click(function () {
        $(this).parent().parent().find("td :input").val("");
    });

    // 在登记模态框上点击提交
    $(".emit-modal-confirm").click(function () {
        var all_records = {};
        var $parentModal = $(this).parents(".modal");
        var parentModalId = $($parentModal).attr("id");
        var targetUrl = $($parentModal).attr("data-url");
        all_records[parentModalId] = getSentData(parentModalId);
        $("#modal-confirm").modal("show")
            .on("shown.bs.modal", function () {
                $("#btn-confirm").click(function () {
                    if (all_records[parentModalId]) {
                        console.log(all_records[parentModalId]);
                        postAjaxRequest(parentModalId, targetUrl, all_records);
                    }
                });
            });
    });

    //给胚料登记的原料消耗总量赋值
    $("#model-selected").change(function () {
        setMaterialConsume();
    });

    // 添加员工的模态框
    $("#emit-modal-staff-add").click(function () {
        $("#modal-staff-add").modal("show");
    });
    //将修改员工的模态框设为静态，只能通过取消和叉叉关闭
    $(".modal-modify").modal({backdrop: 'static', keybord: true});
    $("#modal-staff-modify").modal({backdrop: 'static', keybord: true});


    //禁止直接输入日期
    $("[data-date]").focus(function () {
        $(this).blur();
    });


    //对必填的项加上*号提示
    $(".required").each(function () {
        let $required = $('<strong class="high">*</strong>');
        $(this).parent().prepend($required);
    })


    //添加员工
    $("#btn-add-staff").click(function () {
        $(".required").trigger('blur');
        var numError = $(".on-error").length;
        console.log("错误数" + numError);
        console.log($(".on-error"));
        if (numError) {
            return false;
        }
        var $addingUrl = $(this).parent().prev().attr("data-url"); //获取路径
        var $labels = $("#modal-staff-add label[data-key]"); //左侧label对象
        var $inputData = $labels.next(); //右侧input对象
        var sendData = JSON.stringify(
            convertToJson(getAddItemData($labels, $inputData))); //获取要传送的数据
        var $modalId = $(this).parents(".modal").attr("id"); //获取模态框的ID
        addStaffAjax($addingUrl, sendData, $modalId);
    });

    //根据员工工号或姓名查询，待完善
    $("#search-staff").click(function () {
        var parentDivId = $(this).parent().attr("id");
        var queryObj = getSelectedCondition(parentDivId);
        initAjaxUseGetStaff(path + "staffs/searchResult", "json", "application/json;charset=utf-8", ".staff-record-table", "selectPage", queryObj);
    });

    //在modal-staff-modify上点击提交按钮的事件
    $(".btn-commit-in-staff-modal").click(function () {
        $(".data-modify").trigger('blur');
        var numError = $(".on-error-modify").length;
        if (numError) {
            return false;
        }
        var $modalId = $(this).parents(".modal").attr("id"); //父模态框的id值
        var $inputModify = $(this).parent().siblings("div").find(":input"); //父模态框上的所有input和select元素
        var $modalBody = $(this).parent().parent(); //模态框的主体
        var $inputNum = $modalBody.find("input.input-num"); //要发送到服务器的字段值所在的元素
        var modifyUrl = $modalBody.attr("data-url") + $inputNum.val(); //修改数据的服务器路径
        var sendData = convertToJson(getModalModifyData($inputModify)); //转换成JSON格式的data
        var finalData = JSON.stringify(sendData);
        addStaffModifyAjax(modifyUrl, finalData, $modalId);
    });

    //从查看员工信息上直接点击修改
    $("#btn-modify-staff").click(function () {
        var $labels = $("#modal-staff-info label"); //模态框上的所有label元素
        var $span = $("#modal-staff-info span.data-info"); //模态框上的所有span元素
        var spanData = getModifyItemData($labels, $span);
        writeDataToStaffModal("modal-staff-modify", spanData);
    });

    //表单输入验证事件监听
    checkInputAdd();
    checkInputModify();

    //
    inputCheck(".row-append");

    // 初始化型号请求
    // initAllProductInfo();
    var _productArr = getProductObj();
    var _modelArr = getAllProductModel(_productArr);
    var _sizeArr = getAllProductSize(_productArr);
    initProductSelect($("select[data-model=product-model"), _modelArr);
    initProductSelect($("select[data-size=product-size"), _sizeArr);

    // 监听员工管理左侧导航的点击
    $("#staff-management-atag").click(function () {
        //初始化员工页面记录
        var queryObj={
            pageNum:1
        };
        initAjaxUseGetStaff(path + "staffs/searchResult", "json", "application/json;charset=utf-8", ".staff-record-table", "all", queryObj);

        //获取职位信息
        var roleResult = getRoleData();
        setRole(roleResult, $("select[id*=role]"));
    });

}


// 获取所有产品包括产品型号，规格，状态
function initAllProductInfo() {
    var _productArr = getProductObj();
    var _modelArr = getAllProductModel(_productArr);
    var _sizeArr = getAllProductSize(_productArr);
    initProductSelect($("select[data-model=product-model"), _modelArr);
    initProductSelect($("select[data-size=product-size"), _sizeArr);
}


//对表格的每个输入框进行数值判断并设置自动填充元素为只读
function inputCheck(tdName) {
    $(tdName).blur(function () {
        let reg = /^\d+(\.\d{0,})?$/g;
        let $tdata = $(this).val();
        if (!reg.test($tdata)) {
            if ($tdata == "") {
                $(this).attr("placeholder", "请输入");
            } else {
                $(this).val("").attr("placeholder", "输入数字");
            }
        } else {
            $(this).val(Number($tdata).toFixed(3));
        }
        materialSum("modal-blowon");
    });
    $("td[data-auto] input").prop("readonly", true);
    $("td[data-read] input").prop("readonly", true);
}

//给开炉登记 需要统计的数据赋值，参数是表格所在的父模态框
function materialSum(parentModalId) {
    var $trs = $("#" + parentModalId).find("tr:gt(0)"); //获取添加的记录的数量
    for (let i = 0; i < $trs.length; i++) {
        var material = []; //存储每一行各种原料的值，重新开始一条记录时清空记录
        let perRowsInput = $($trs[i]).find("input"); //获取每一行的所有input的值，不包括select
        let endIndex = $($trs[i]).find("td[data-auto]").index() - 1; //index()返回的是在原表格的第几列，减1是因为当前行不包括第一列
        for (let j = 0; j < endIndex; j++) {
            material.push($(perRowsInput[j]).val());
        }
        var isValid = material.some(function (item, index, array) {
            return (item != "");
        });
        if (isValid) {
            var result = 0;
            $.each(material, function (index, elememt) {
                result = elememt - 0 + result;
            });
            $(perRowsInput[endIndex]).val(result);
        }
    }
}

//根据产品型号和开炉日期获取 胚料登记的原料消耗总量
function getMaterialConsumeSum(_path, productModel, blowonDate) {
    var resultNum;
    $.ajax({
        url: path + _path + productModel + "/" + blowonDate,
        type: "GET",
        async: false,
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (data) {
            if (data.code == 0) {
                resultNum = data.result;
            }
        }
    });
    return resultNum;
}

//给胚料登记的原料消耗总量赋值
function setMaterialConsume() {
    var date = $("#blowon-date").val();
    var model = $("#model-selected").val();
    if (date && model) {
        var dateUnix = Date.parse(date);
        var result = getMaterialConsumeSum("BlowonRecord/blankRecord/", model, dateUnix);
        $("#consume-sum").val(result);
    }
}

//在对应表格上添加一行记录
function addRecordRow(_this, modelArr) {
    var columns = $(_this).parent().parent().find("th").size(); //获取表格的列数
    var indexModel = $(_this).parent().parent().find("td[data-model]").index(); //获取产品型号所在的列数
    var indexAuto = $(_this).parent().parent().find("td[data-auto]").index(); //获取自动填充的表格所在的列数
    var indexShape = $(_this).parent().parent().find("td[data-shape]").index(); //获取产品形态一列所在的列数
    var indexSize = $(_this).parent().parent().find("td[data-size]").index(); //获取产品规格一列所在的列数
    var $tr = $("<tr></tr>");
    var optionLeft = '<option value="',
        optionMiddle = '">',
        optionRight = '</option>';
    var optionStr = optionLeft + optionMiddle + optionRight; //型号的第一项，为空
    //填充产品型号的option元素
    for (let i = 0; i < modelArr.length; i++) {
        optionStr += optionLeft + modelArr[i] + optionMiddle + modelArr[i] + optionRight;
    }
    //对特殊元素所在的列数进行判断
    for (var i = 0; i < columns; i++) {
        if (i == indexModel) {
            $tr.append('<td><select>' + optionStr + '</select></td>');
        } else if (i == indexAuto) {
            $tr.append('<td data-auto><input class="input-in-td" type="text"/></td>');
        } else if (i == indexSize) {
            $tr.append('<td data-size><input class="input-in-td" type="text"/></td>');
        } else if (i == indexShape) {
            $tr.append('<td><select><option value="直">直</option><option value="弯">弯</option></select></td>');
        } else {
            $tr.append('<td><input class="row-append input-in-td" type="text"/></td>');
        }
    }
    $(_this).parent().parent().find("table").append($tr);
    inputCheck(".row-append");
}

//在对应表格上删除最后一行记录
function deleteRecordRow(btnDel) {
    let $rows = $(btnDel).parent().parent().find("tr").length;
    if ($rows > 2) {
        $(btnDel).parent().parent().find("tr:last").remove();
    }
}

//获取要发送的数据
function getSentData(parentModalId) {
    var record = []; //存放该模态框所包含表格的数据
    var dataKey = []; //存储表头元素的data-key的属性值
    var $date = $("#" + parentModalId).find("input[data-date]"); //获取输入日期的输入框对象
    var $trs = $("#" + parentModalId).find("tr:gt(0)"); //获取添加的记录的数量
    var $ths = $("#" + parentModalId).find("th[data-key]"); //获取当前模态框的所有表头元素
    $.each($ths, function (index, elememt) {
        dataKey.push($(elememt).attr("data-key"));
    });
    for (let i = 0; i < $trs.length; i++) {
        var perRowData = new Map(); //存储一行的数据
        var $inputs = $($trs[i]).find("td :input"); //获取当前行的所有表单元素，包括select
        perRowData[$($date).attr("data-key")] = Date.parse($($date).val()); //将日期输入框对象的值传给对应的key
        for (let j = 0; j < $inputs.length; j++) {
            perRowData[dataKey[j]] = $($inputs[j]).val();
        }
        record.push(convertToJson(perRowData));
    }
    return record;
}

//初始化ajax请求，参数分别是父模态框的id，路径后缀，发送的数据(可选)
function postAjaxRequest(_parentModalId, _path, recordObj) {
    $.ajax({
        url: path + _path,
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        data: JSON.stringify(recordObj[_parentModalId]),
        success: function (data) {
            if (data.code !== 0) {
                $("#modal-fail").modal("show");
                console.log(data.msg);
            } else {
                var $pm = $("#" + _parentModalId);
                $pm.modal("hide");
                $("#modal-success").modal("show");
                clearDataAfterSuccss(_parentModalId);
                recordObj[_parentModalId] = null;
                // 成功添加后，更新记录表格
                var $recordTableDiv = $pm.parents("div.tab-pane").find("div.table-data");
                $recordTableDiv.each(function (index, element) {
                    updataRecordTable($(element));
                })
            }
        },
        error: function () {
            $("#modal-fail").modal("show");
            recordObj[_parentModalId] = null;
        }
    });
    console.log("请求已发送");
}


//获取所有的产品对象
function getProductObj() {
    var productArr = [];
    $.ajax({
        url: path + "getAllProduct",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{}",
        async: false,
        dataType: "json",
        success: function (data) {
            $.each(data.result, function (index, content) {
                productArr.push(content);
            });
        }
    });
    return productArr;
}

//获取存储型号的数组，供动态创建的下拉框使用
function getAllProductModel(productArr) {

    var modelSet = new Set();

    $.each(productArr, function (index, content) {
        modelSet.add(content['productModelInfo']['productModel']);
    });

    var modelArr = Array.from(modelSet).sort();
    return modelArr;
}


//获取存储产品规格的数组，供动态创建的下拉框使用
function getAllProductSize(productArr, modelSelected) {

    var sizeSet = new Set();
    $.each(productArr, function (index, content) {
        if (!modelSelected || content['productModelInfo']['productModel'] == modelSelected) {
            sizeSet.add(content['productSize']);
        }
    });
    var sizeArr = Array.from(sizeSet).sort();
    return sizeArr;
}

//初始化选择元素的option，参数分别为获取数据的对象和传入的数组（可以是型号或规格）
function initProductSelect(selectElememt, productArr) {
    var optionHtml = '<option value="" class="blank-option" selected></option>';
    for (let i = 0; i < productArr.length; i++) {
        optionHtml += '<option value="' + productArr[i] + '">' + productArr[i] + '</option>';
    }
    $(selectElememt).html(optionHtml);
}


//对必填项的表单验证
function checkInputAdd() {
    $(".required").blur(function () {
        var $parent = $(this).parent();
        $parent.find(".form-tips").remove();

        var errorMsg = "请填写此字段";
        var okMsg = "输入完成";

        //姓名判断
        if ($(this).is("#staff-name")) {
            let reg1 = /^[\u4e00-\u9fa5]{2,20}$/;
            let reg2 = /^[a-zA-Z]{2,20}$/;
            if (!reg1.test(this.value) && !reg2.test(this.value)) {
                let errorMsg = "请输入员工中文名或英文名，长度为2-20";
                $parent.append('<span class="form-tips on-error">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success">' + okMsg + '</span>');
            }
        }

        // 需要编写默认当天的函数
        if ($(this).is("#staff-entry-date")) {
            if (this.value == "") {
                $parent.append('<span class="form-tips on-error">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success">' + okMsg + '</span>');
            }
        }

        //手机号码判断
        if ($(this).is("#staff-tel")) {
            let reg = /^1\d{10}$/;
            if (!reg.test(this.value)) {
                let errorMsg = "请输入正确的手机号码(11位数字)";
                $parent.append('<span class="form-tips on-error">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success">' + okMsg + '</span>');
            }
        }

        //身份证号判断
        if ($(this).is("#staff-id-num")) {
            let reg = /^\d{17}[0-9X]$/;
            if (!reg.test(this.value)) {
                let errorMsg = "请输入正确的身份证号码(X为大写)";
                $parent.append('<span class="form-tips on-error">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success">' + okMsg + '</span>');
            }
        }

        //职位和状态判断
        if ($(this).is("#staff-role") || $(this).is("#staff-state")) {
            if (this.value == "") {
                let errorMsg = "请选择"
                $parent.append('<span class="form-tips on-error">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success">' + okMsg + '</span>');
            }
        }

        //密码判断
        if ($(this).is("#staff-password")) {
            if (this.value == "") {
                var pwd = $("#staff-id-num").val().slice(-6);
                this.value = pwd;
            } else if (this.value.length < 6 || this.value.length > 30) {
                let errorMsg = "密码长度为6-30(默认为身份证后6位)";
                $parent.append('<span class="form-tips on-error">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success">' + okMsg + '</span>');
            }
        }
    }).focus(function () {
        $(this).triggerHandler("blur");
    }).keyup(function () {
        $(this).triggerHandler("blur");
    });
}

//对修改员工时必填项的表单验证
function checkInputModify() {
    $(".data-modify").blur(function () {
        var $parent = $(this).parent();
        $parent.find(".form-tips").remove();

        var errorMsg = "请填写此字段";
        var okMsg = "输入完成";

        //手机号码判断
        if ($(this).is("#staff-tel-modify")) {
            let reg = /^1\d{10}$/;
            if (!reg.test(this.value)) {
                let errorMsg = "请输入正确的手机号码(11位数字)";
                $parent.append('<span class="form-tips on-error-modify">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success-modify">' + okMsg + '</span>');
            }
        }

        //修改的密码判断
        if ($(this).is("#staff-pwd-modify")) {
            if (this.value.length < 6 || this.value.length > 30) {
                let errorMsg = "密码长度为6-30(默认为身份证后6位)";
                $parent.append('<span class="form-tips on-error-modify">' + errorMsg + '</span>');
            } else {
                $parent.append('<span class="form-tips on-success-modify">' + okMsg + '</span>');
            }
        }
    }).focus(function () {
        $(this).triggerHandler("blur");
    }).keyup(function () {
        $(this).triggerHandler("blur");
    });
}

//在这个函数里面传ID到后台。再获取相应页面的数据，参数分别为表格类名，当前页id，当前页最大记录和数据json格式。
//创建表格根据当前页数来确定起始记录，通过传入的length来决定该页记录的行数（不能超过最大记录数），targetJson来获取每行的记录
function CreateTableStaff(divName, targetId, _url, queryObj) {
    var $thead = $(divName + " .table-content thead");
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");

    var thHiden = []; //隐藏的元素的name属性值所存放的数组
    $thead.find("th.data-hide").each(function (index, elment) {
        thHiden.push($(elment).attr("name"));
    });
    var tableName = []; //表格所有表头元素的name属性值所存放的数组
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });

    var targetObject = {};
    ajaxUseGetStaff(_url, targetId, queryObj);
    var map = $.parseJSON(targetJson);
    var length;
    if (JSON.stringify(json.result) == "null") {
        length = 0;
    }else {
        length = map.result.length;
    }

    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);

        if (thHiden.length > 0) {
            var $arr_index = [];
            for (let k = 0; k < thHiden.length; k++) {
                $arr_index.push(tableName.indexOf(thHiden[k]));
            }
        }

        for (let j = 0; j < tableName.length; j++) {
            let reg = /.{0,}Date.{0,}/;
            if (reg.test(tableName[j])) {
                var date = new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]] = date.split(" ")[0];
                var changeDate = targetObject[tableName[j]].split("-");
                for (let z = 1; z < changeDate.length; z++) {
                    var temp = parseInt(changeDate[z]);
                    if (temp < 10) {
                        changeDate[z] = "0" + changeDate[z];
                    }
                }
                targetObject[tableName[j]] = changeDate.join("-");
            }

            if ($arr_index.indexOf(j) !== -1) {
                $tbody.children("tr:last-child").append('<td class="data-hide">' + targetObject[tableName[j]] + '</td>');
            } else {
                $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
            }
        }

        //如果是员工的记录表格就再添加一个查看的按钮
        if (tableName.indexOf("staffName") !== -1) {
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-detail">查看</button>');
        }
        $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default staff-table-content-modify">修改</button>');
    }

    //查看员工的全部信息，完成
    $(".table-content-detail").click(function () {
        var tds = $(this).siblings("td");
        $("#modal-staff-info").modal("show")
            .on("shown.bs.modal", function () {
                var spans = $("#modal-staff-info span.data-info");
                for (let i = 0; i < tds.length; i++) {
                    $(spans[i]).text($(tds[i]).text());
                }
            });
    });

    //点击修改按钮修改员工信息
    $(".staff-table-content-modify").click(function () {
        var $thModify = $(this).parent().parent().parent().find("th");
        var $tdModify = $(this).parent().find("td");
        var tableModalID = $(this).parent().parent().parent().attr("data-modal-id"); //所在的table对应的修改信息的模态框的id值
        var preData = getModifyItemData($thModify, $tdModify); // 获取要写入模态的数据
        console.log(preData);
        writeDataToStaffModal(tableModalID, preData);
    });
}


//点击上一页 参数分别为表格类名，当前页id，总页数和json格式数据
function clickLastPageStaff(divName, $targetId, Page, _url, queryObj) {
    if ($targetId > 1) {
        $targetId = $targetId - 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        CreateTableStaff(divName, $targetId, _url, queryObj);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据判断下一页是否为最后一页，来确定传给CreateTableStaff记录长度
function clickNextPageStaff(divName, $targetId, Page, _url, queryObj) {
    if ($targetId < Page) {
        $targetId = $targetId + 1;
        let $target = $(divName + " .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        CreateTableStaff(divName, $targetId, _url, queryObj);

        if (($targetId >= 3) && ($targetId <= Page - 2)) {
            $target.siblings().addClass("hide");
            $target.prev().prev().removeClass("hide");
            $target.prev().removeClass("hide");
            $target.next().removeClass("hide");
            $target.next().next().removeClass("hide");
            $(".pagination-box ul").children('li:last-child').removeClass("hide");
            $(".pagination-box ul").children('li:first-child').removeClass("hide");
        }
    }
    return $targetId;
}

//点击分页，参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度，判断点击页是否为最后一页，来确定传给CreateTableStaff的长度
function clickPageStaff(divName, $targetId, Page, _this, _url, queryObj) {
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    CreateTableStaff(divName, $targetId, _url, queryObj);

    if (($targetId >= 3) && ($targetId <= Page - 2)) {
        _this.siblings().addClass("hide");
        _this.prev().prev().removeClass("hide");
        _this.prev().removeClass("hide");
        _this.next().removeClass("hide");
        _this.next().next().removeClass("hide");
        _this.parent().children('li:last-child').removeClass("hide");
        _this.parent().children('li:first-child').removeClass("hide");
    } else {
        if ($targetId == 2) {
            _this.siblings().addClass("hide");
            _this.parent().children('li:last-child').removeClass("hide");
            _this.parent().children('li:first-child').removeClass("hide");
            _this.prev().removeClass("hide");
            _this.next().removeClass("hide");
            _this.next().next().removeClass("hide");
            _this.next().next().next().removeClass("hide");
        } else {
            if ($targetId == Page - 1) {
                _this.siblings().addClass("hide");
                _this.parent().children('li:last-child').removeClass("hide");
                _this.parent().children('li:first-child').removeClass("hide");
                _this.next().removeClass("hide");
                _this.prev().removeClass("hide");
                _this.prev().prev().removeClass("hide");
                _this.prev().prev().prev().removeClass("hide");
            }
        }
    }
}

//调用ajaxUseGET方法 参数为url，数据类型，内容类型，表格类名，页面类型，员工工号或姓名，职位，状态，性别，婚姻状况，入职日期
function initAjaxUseGetStaff(_url, _dataType, _contentType, divName, pageType, queryObj) {
    var json,
        targetJson, //格式化传过来的json数据最终的形式
        $length, //返回json数据记录总数量
        $id = 1; //初始页面
    $.ajax({ //通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data: queryObj,
        dataType: _dataType,
        contentType: _contentType,
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
            if (JSON.stringify(json.result) === "null") {
                $length = 0;
            } else {
                $length = json.result.length;
            }
            let $page = json.msg;

            CreateTableStaff(divName, $id, _url, queryObj);

            $(divName + " .pagination-box").remove();
            if ($length > 0) {
                CreatePage(divName, $page, pageType + " ");
            } else {
                showStatusModal(":-", "该 时间区间 查询没有记录")
            }

            //点击页数
            $(divName + " ." + pageType + " .page").on("click", function () {
                $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g)); //当前为第几页
                clickPageStaff(divName, $id, $page, $(this), _url, queryObj);
            });

            // 点击上一页
            $(divName + " ." + pageType + " .last").on("click", function () {
                $id = clickLastPageStaff(divName, $id, $page, _url, queryObj);
            });

            // 点击下一页
            $(divName + " ." + pageType + " .next").on("click", function () {
                $id = clickNextPageStaff(divName, $id, $page, _url, queryObj);
            })

        }
    });
}

function ajaxUseGetStaff(_url, id, queryObj) {
    queryObj.pageNum = id;
    $.ajax({
        url: _url,
        type: "GET",
        async: false,
        data: queryObj,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            json = eval(data);
            targetJson = JSON.stringify(json);
        },
        error: function () {
            // alert("error");
            showStatusModal("error", "错误");
        }
    })
}


//获取要增加条目的输入信息
function getAddItemData($labels, $inputData) {
    var dataKey = [];
    var content = [];
    var preData = new Map();
    //存储左侧label的data-key值
    $labels.each(function (index, element) {
        dataKey.push($(element).attr("data-key"));
    });
    //存储右侧input和select的值
    $inputData.each(function (index, element) {
        content.push($(element).val());
    });
    for (let i = 0; i < dataKey.length; i++) {
        if (dataKey[i] == "staffEntryDate") {
            preData[dataKey[i]] = Date.parse(content[i]);
        } else {
            preData[dataKey[i]] = content[i];
        }
    }
    return preData;
}


// 向表格对应的模态框填入数据
function writeDataToStaffModal(modalId, writeData) {
    $("#" + modalId).modal("show")
        .on("shown.bs.modal", function () {
            $(this).find(".data-modify").each(function (index, element) {
                var key = $(element).attr("data-key");
                $(element).val(writeData[key]);
            });
        });
}


function addStaffModifyAjax(pathUrl, sendData, modalId) {
    var queryObj={
        pageNum:1
    };
    $.ajax({
        url: path + pathUrl,
        type: "PUT",
        contentType: "application/json; charset=UTF-8",
        data: sendData,
        dataType: "json",
        success: function (data) {
            if (data.code != 0) {
                console.log(data.msg);
                $("#modal-fail").modal("show");
            } else {
                console.log("成功了！！！");
                $("#" + modalId).modal("hide");
                $("#modal-staff-info").modal("hide");
                $("#modal-success").modal("show")
                    .on("hidden.bs.modal", function () {
                        initAjaxUseGetStaff(path + "staffs/searchResult", "json", "application/json;charset=utf-8", ".staff-record-table", "all", queryObj);
                    });
            }
        },
        error: function (XMLResponse, textStatus) {
            console.log("失败了？？？");
            $("#modal-fail").modal("show");
        }
    });
}

function addStaffAjax(pathUrl, sendData, modalId) {
    var queryObj={
        pageNum:1
    };
    $.ajax({
        url: path + pathUrl,
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        data: sendData,
        dataType: "json",
        success: function (data) {
            if (data.code !== 0) {
                showStatusModal(data.code, data.msg);
            } else {
                console.log("成功了！！！");
                $("#" + modalId).modal("hide");
                $("#modal-success").modal("show")
                    .on("hidden.bs.modal", function () {
                        initAjaxUseGetStaff(path + "staffs/searchResult", "json", "application/json;charset=utf-8", ".staff-record-table", "all", queryObj);
                    });
                clearDataAfterSuccss(modalId);
            }
        },
        error: function (XMLResponse, textStatus) {
            showStatusModal("失败", textStatus);
        }
    })
}


function getRoleData() {
    var roleResult = [];
    $.ajax({
        url: path + "staff/roles",
        type: "GET",
        async: false,
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (data) {
            if (data.code == 0) {
                roleResult = data.result;
            }
        }
    });
    return roleResult;
}

function setRole(roleResult, $selectModify, selectedRole) {
    // var result = getRoleData();

    var roleArr = roleResult;
    var $value = toggleDescriptionToId(selectedRole);
    var roleId = [];
    var roleDescription = [];
    var optionHtml = '';
    $.each(roleArr, function (index, content) {
        roleId.push(content['roleId']);
        roleDescription.push(content['roleDescription']);
    });
    if (!$value) {
        optionHtml += '<option value="" selected></option>';
        for (let i = 0; i < roleId.length; i++) {
            optionHtml += '<option value="' + roleId[i] + '">' + roleDescription[i] + '</option>';
        }
    } else {
        for (let i = 0; i < roleId.length; i++) {
            if (roleId[i] !== $value) {
                optionHtml += '<option value="' + roleId[i] + '">' + roleDescription[i] + '</option>';
            } else {
                optionHtml += '<option value="' + roleId[i] + '" selected>' + roleDescription[i] + '</option>';
            }
        }
    }
    $selectModify.html(optionHtml);
}

//获取筛选员工的条件
function getSelectedCondition(divId) {
    var $selectedCondition = $("#" + divId + " :input[data-key]");
    var conditionObj = new Map();
    $selectedCondition.each(function (index, element) {
        if ($(element).val()) {
            let $value = $(element).attr("data-key");
            if ($value === "entryDate") {
                conditionObj[$value] = Date.parse($(element).val());
            } else {
                conditionObj[$value] = $(element).val();
            }
        }

    });
    return conditionObj;
}

//将员工的描述转换为对应的员工ID
function toggleDescriptionToId(roleSelected) {
    var roleId = [],
        roleDescription = [];
    var roleObjArr = getRoleData();
    for (var i in roleObjArr) {
        roleId.push(roleObjArr[i]['roleId']);
        roleDescription.push(roleObjArr[i]['roleDescription']);
    }
    var idIndex = roleId.indexOf(roleSelected);
    var descriptionIndex = roleDescription.indexOf(roleSelected);
    if (idIndex !== -1) {
        return roleDescription[idIndex];
    } else {
        return roleId[descriptionIndex];
    }
}


// 李昕
// 添加修改之后更新当前表格的函数
function updataRecordTable($md) {
    var dataUrl = $md.attr("data-url");
    var dataDiv = $md.attr("data-div");
    var dataAbbreviation = $md.attr("data-abbreviation");
    var dataFunction = $md.attr("data-function");

    console.log(dataUrl + " update");

    // 若产品型号添加，给每个添加面板的产品型号下来框更新
    if (dataAbbreviation === "pmir") {
        getProductModel($("select[id$=product-model]"));
    }

    if (dataFunction === "common") {
        commonTableFunction(dataUrl, dataDiv, dataAbbreviation)
    } else if (dataFunction === "customer") {
        customerTableFunction(dataUrl, dataDiv, dataAbbreviation)
    } else if (dataFunction === "materialInventory") {
        materialInventoryTableFunction(dataUrl, dataDiv, dataAbbreviation);
    } else if (dataFunction === "productInventory") {
        productInventoryTableFunction(dataUrl, dataDiv, dataAbbreviation);
    } else if (dataFunction === "order") {
        orderTableFunction(dataUrl, dataDiv, dataAbbreviation);
    } else {
        statisticsTableFunction(dataUrl, dataDiv, dataAbbreviation);
    }
}

// 用于判断表单元素之间的关系，并做出处理
function smart() {
    //初始化为0 看需不需要
    if ($(":input[data-smart]").val() === "") {
        $(":input[data-smart]").val(0);
    }

    //输入框失去焦点的时候触发事件
    $(":input[data-smart]").blur(function () {
        var method = $(this).attr("data-smart");
        var dataSmart,
            multip = parseFloat($(this).val());//当前输入框的值赋值给multip
        switch (method) {
            case "multiplication":
                dataSmart = $(this).parent().siblings().find(":input[data-smart='multiplication']");//取所有data-smart。target的除外
                for (let i = 0; i < dataSmart.length; i++) {
                    multip = multip * parseFloat(dataSmart.eq(i).val());
                }
                $(this).parent().siblings().find(":input[data-smart='target']").val(multip);
                break;

            case "sum":
                dataSmart = $(this).parent().siblings().find(":input[data-smart='sum']");
                for (let i = 0; i < dataSmart.length; i++) {
                    multip = multip + parseFloat(dataSmart.eq(i).val());
                }
                $(this).parent().siblings().find(":input[data-smart='target']").val(multip);
                break;

            case "ratio":
                var ratioString = $(this).val();
                if (ratioString === '') {
                    $(this).val("0");
                }

                if (parseFloat($(this).val()) > 1.0) {
                    showRatioModifyError($(this), "比例和不可以大于1.0")
                } else if (parseFloat($(this).val()) < 0) {
                    showRatioModifyError($(this), "比例不可以小于0");
                } else {
                    var ratioInput = $(this).parent().parent().find(":input[data-smart='ratio']");
                    console.log(ratioInput);
                    var ratioSum = 0;
                    for (let i = 0; i < ratioInput.length; i++) {
                        ratioSum = ratioSum + parseFloat(ratioInput.eq(i).val());
                    }
                    if (ratioSum > 1.0) {
                        showRatioModifyError($(this), "比例和不可以大于1.0");
                    } else if (ratioSum === 1.0) {
                        $("#ratioErrorMsg").text("");
                        $("button#btn-submit-product-model-modify").removeAttr("disabled");
                    } else {
                        showRatioModifyError($(this), "比例和不可以小于1.0");
                    }

                }
                break;

            //修改损耗比
            case "blank":
                var material = parseFloat($(this).parent().siblings().find("[data-smart='material']").val());//获取原料消耗值
                var wasteConsume = parseFloat($(this).parent().siblings().find("[data-smart='wasteConsume']").val());//获取废料值
                var leftoverConsume = parseFloat($(this).parent().siblings().find("[data-smart='leftoverConsume']").val())//获取边角料值
                var productBlank = multip - wasteConsume - leftoverConsume;//计算实际胚料产出量
                //判定输入胚料量是否大于废料和边角料总和（即实际胚料产出量是否大于零）
                //实际胚料产出量大于等于零且小于等于原料消耗量，提交按钮可以点击
                //否则弹出提示信息，提交按钮不能点击
                if ((productBlank >= 0) && (productBlank <= material)) {
                    multip = 1 - productBlank / material;
                    $(this).parent().siblings().find("[data-smart='target']").val(multip.toFixed(4));
                    $('#modal-blank-modify .btn-commit-in-modal').removeAttr("disabled");
                } else {
                    showStatusModal("!!!", "胚料输入量不合理。应大于废料和边角料总和");
                    $('#modal-blank-modify .btn-commit-in-modal').attr("disabled", "true");
                }

                break;

            default:
                break;
        }

    })
}

// 显示比例修改时的错误
function showRatioModifyError($ratioIpt, errMsg) {
    console.log(errMsg);
    $ratioIpt.parent().parent().find("span#ratioErrorMsg").text(errMsg);
    $ratioIpt.keydown(function () {
        $("#ratioErrorMsg").text("");
    });
    $("button#btn-submit-product-model-modify").prop("disabled", "disabled");
}