var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程

var path = path6;

$(document).ready(function () {
    document.getElementById("wisr-start-time").valueAsDate = new Date();
    document.getElementById("wisr-end-time").valueAsDate = new Date();
    var targetJson;

    //获取型号数据
    // $.ajax({
    //     url: path + "ProductModelInfo/getAllProductModelInfo",
    //     type: "GET",
    //     contentType: "application/json; charset=utf-8",
    //     dataType: "json",
    //     success: function (data) {
    //         if (data.code != 0) {
    //             console.log("获取型号失败：");
    //             console.log(data.msg);
    //         } else {
    //             var html = '';
    //             $.each(data.result, function (index, content) {
    //                 html += '<option value="' + content['productModel'] + '">' +
    //                     content['productModel'] + '</option>';
    //             });
    //             html += '<option value="" class="blank-option" selected></option>';
    //         }
    //         $("select[id*=product-model]").html(html);
    //     }
    // });

    // 发送修改后的入库记录
    // 李昕修改
    $(".btn-commit-in-modal").click(function () {
        //language=JQuery-CSS
        var $inputModify = $(this).parent().siblings("div").find(":input");
        var $modalBody = $(this).parent().parent();
        var $inputNum = $modalBody.find("input.input-num");
        var modifyUrl = $modalBody.attr("data-url") + $inputNum.val();
        var sendData = convertToJson(getModalModifyData($inputModify));
        var finalData = JSON.stringify(sendData);
        addModifyAjax(modifyUrl, finalData);
    });

    //初始页面
    var mydate = new Date();
    var today = DateToUnix("" + mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate());
    initAjaxUseGet(path + "WarehouseInStorageRecords", "json", "application/json;charset=utf-8", ".warehouse-in-storage-record-table", "all", 0, today);

    //筛选事件
    $("#wisr-select").on('click', function () {
        var $selectStartTime = DateToUnix($("#wisr-start-time").val());
        var $selectEndTime = DateToUnix($("#wisr-end-time").val());
        if ($selectStartTime > $selectEndTime) {
            alert("请选择正确的时间");
        } else {
            initAjaxUseGet(path + "WarehouseInStorageRecords", "json", "application/json;charset=utf-8", ".warehouse-in-storage-record-table", "selectPage", $selectStartTime, $selectEndTime);
        }

    });

    //近三天
    $("#wisr-threeDays").on('click', function () {
        var mydate = new Date();
        var today = DateToUnix("" + mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate());
        // var otherday = today - 3 * 60 * 60 * 24 * 1000;
        var otherday = today - 259200000;// 直接使用计算结果减少计算
        initAjaxUseGet(path + "WarehouseInStorageRecords", "json", "application/json;charset=utf-8", ".warehouse-in-storage-record-table", "threeDaysPage", otherday, today);
    });

    //近一周
    $("#wisr-aWeek").on('click', function () {
        var mydate = new Date();
        var today = DateToUnix("" + mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate());
        // var otherday = today - 7 * 60 * 60 * 24 * 1000;
        var otherday = today - 604800000;
        initAjaxUseGet(path + "WarehouseInStorageRecords", "json", "application/json;charset=utf-8", ".warehouse-in-storage-record-table", "aWeekPage", otherday, today);
    });

    //近两周
    $("#wisr-twoWeeks").on('click', function () {
        var mydate = new Date();
        var today = DateToUnix("" + mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate());
        var otherday = today - 1209600000;
        initAjaxUseGet(path + "WarehouseInStorageRecords", "json", "application/json;charset=utf-8", ".warehouse-in-storage-record-table", "twoWeeksPage", otherday, today);
    });

    //近一个月
    $("#wisr-aMonth").on('click', function () {
        var mydate = new Date();
        var today = DateToUnix("" + mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate());
        var otherday = DateToUnix("" + mydate.getFullYear() + "-" + mydate.getMonth() + "-" + mydate.getDate())
        initAjaxUseGet(path + "WarehouseInStorageRecords", "json", "application/json;charset=utf-8", ".warehouse-in-storage-record-table", "aMonthPage", otherday, today);
    });
});

///参数为当前页表格的页id和行数
//在这个函数里面传ID到后台。再获取相应页面的数据 参数分别为表格类名，当前页id，当前页最大记录和数据json格式
//创建表格根据当前页数来确定起始记录，通过传入的length来决定该页记录的行数（不能超过最大记录数），targetJson来获取每行的记录
function CreateTable(divName, targetId, _url, _startTime, _endTime) {
    var $tbody = $(divName + " .table-content tbody");
    $tbody.html("");
    var tableName = [];
    $(divName + " .table-content").find("th").each(function (index, elment) {
        tableName.push($(elment).attr('name'));
    });
    var targetObject = {};
    ajaxUseGet(_url, targetId, _startTime, _endTime);
    var map = $.parseJSON(targetJson);
    var length = map.result.length;
    for (let i = 0; i < length; i++) {
        $tbody.append('<tr id="record-table-row-' + (i + 1) + '"></tr>');
        targetObject = iterationObject(map.result[i], targetObject);
        $tbody.children("tr:last-child").append('<td>' + map.result[i][tableName[0]] + '</td>');
        for (let j = 1; j < tableName.length; j++) {
            let reg = /.{0,}Date.{0,}/;
            if (reg.test(tableName[j])) {
                var date = new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]] = date.split(" ")[0];
            }
            $tbody.children("tr:last-child").append('<td>' + targetObject[tableName[j]] + '</td>');
        }
        $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-modify" >修改</button>');

    }


    // 李昕修改 响应修改按钮弹出模态框
    $(".table-content-modify").click(function () {
        var $thModify = $(this).parent().parent().parent().find("th");
        var $tdModify = $(this).parent().find("td");
        var tableModalID = $(this).parent().parent().parent().attr("data-modal-id");
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
        }
        else {
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
        }
        else {
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
        targetJson,//格式化传过来的json数据最终的形式
        $length,//返回json数据记录总数量
        $id = 1;//初始页面
    $.ajax({//通过起始时间和终止时间来获取需要的数据
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
            $length = json.result.length;
            let $page = json.msg;

            CreateTable(divName, $id, _url, _startTime, _endTime);

            $(divName + " .pagination-box").remove();
            if ($length > 0) {
                CreatePage(divName, $page, pageType + " ");
            } else {
                alert("该查询没有记录");
            }

            //点击页数
            $(divName + " ." + pageType + " .page").on("click", function () {
                $id = parseInt($(this).attr('id').match(/\d+(\.\d+)?/g));//当前为第几页
                clickPage(divName, $id, $page, $(this), _url, _startTime, _endTime);
            });

            // 点击上一页
            $(divName + " ." + pageType + " .last").on("click", function () {
                $id = clickLastPage(divName, $id, $page, _url, _startTime, _endTime);
            });

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

//将日期转为时间戳
function DateToUnix(string) {
    var f = string.split(' ', 2);
    var d = (f[0] ? f[0] : '').split('-', 3);
    var t = (f[1] ? f[1] : '').split(':', 3);
    return (new Date(
        parseInt(d[0], 10) || null,
        (parseInt(d[1], 10) || 1) - 1,
        parseInt(d[2], 10) || null,
        parseInt(t[0], 10) || null,
        parseInt(t[1], 10) || null,
        parseInt(t[2], 10) || null
    )).getTime();
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
    $inputForm.each(function (index, element) {
        var dataType = $(element).attr("data-type");
        var dataKey = $(element).attr("data-key");
        var dataVal = $(element).val();
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
    return modifyData
}


// 向表格对应的模态框填入数据
function writeDataToModal(modalID, writeData) {
    $("#" + modalID).modal("show")
        .on("shown.bs.modal", function () {
            $(this).find(".data-modify").each(function (index, element) {
                var key = $(element).attr("data-key");
                if (key !== "product.productModelInfo.productModel") {
                    $(element).val(writeData[key]);
                } else {
                    getProductModel($(element), writeData[key]);
                }
            });
        });

}

// 获取已添加的产品型号,并将修改前的值selectedModel所在的option的属性设为selected
// 若为空则不显示（对应添加功能）
function getProductModel($selectModify, selectedModel) {
    $.ajax({
        url: path + "getAllProduct",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{}",
        dataType: "json",
        success: function (data) {
            var modelSet = new Set();
            var optionHtml = '';
            $.each(data.result, function (index, content) {
                modelSet.add(content['productModelInfo']['productModel']);
            });
            var modelArr = Array.from(modelSet).sort();
            if (!selectedModel) {
                optionHtml += '<option value="" class="blank-option" selected></option>';
                for (let i = 0; i < modelArr.length; i++) {
                    optionHtml += '<option value="' + modelArr[i] + '">' + modelArr[i] + '</option>';
                }
            } else {
                for (let i = 0; i < modelArr.length; i++) {
                    if (modelArr[i] !== selectedModel) {
                        optionHtml += '<option value="' + modelArr[i] + '">' + modelArr[i] + '</option>';
                    }
                    else {
                        optionHtml += '<option value="' + modelArr[i] + '"selected>' + modelArr[i] + '</option>';
                    }
                }
            }
            $selectModify.html(optionHtml);
        }
    })
}


// 将需要发送的原始数据转化为符合json接口格式的数据
function convertToJson(obj) {
    var pre = {};
    for (i in obj) {
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
function addModifyAjax(pathUrl, sendData) {
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
                $("#modal-in-storage-modify").modal("hide");
                $("#modal-success").modal("show");
            }
        },
        error: function (XMLResponse, textStatus) {
            console.log("失败了？？？" + textStatus);
            $("#modal-fail").modal("show");
        }
    });
}
