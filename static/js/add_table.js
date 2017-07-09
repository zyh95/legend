var path1 = "http://110.64.72.46:8080/cg/" //杭澍
var path2 = "http://110.64.72.43:8080/cg/" //耀友
var path3 = "http://119.29.173.65:8080/cg/" //锡龙
var path4 = "http://110.64.91.19:8080/cg/" //耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/" //杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/" //远程1
var path7 = "http://119.29.200.238:8080/cg/" //远程2


/* 通用函数
----------------------------------------------------------------------------------------*/
$(function() {

    //输入控件获得焦点时错误提示信息消失
    $("div.add-table").children("table").find(" [id]").focus(function() {
        $(this).parents("table").parent().prev().find("span").removeClass("errorMsg");
    });

    //从数据库获取产品型号
    $.ajax({
        url: path6 + "getAllProduct",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: "{}",
        dataType: "json",
        success: function(data) {
            if (data.code != 0) {
                alert(data.msg);
            } else {
                console.log(data.result);
                var html = '';
                var tempArr = [];
                var modelArr = [];
                $.each(data.result, function(index, content) {
                    tempArr.push(content['productModelInfo']['productModel']);
                });
                tempArr.sort();
                modelArr.push(tempArr[0]);
                for (var i = 1; i < tempArr.length; i++) {
                    if (tempArr[i] !== tempArr[i - 1]) {
                        modelArr.push(tempArr[i]);
                    }
                }
                for (var i = 0; i < modelArr.length; i++) {
                    html += '<option value="' + modelArr[i] + '">' +
                        modelArr[i] + '</option>';
                }
                html += '<option value="" class="blank-option" selected></option>';
            }
            $("select[id$=product-model]").html(html);
        }
    });

    //禁止直接输入日期
    $("[id$=date]").focus(function() {
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
        yearRange: '-1970:+2017',
        onSelect: function(dataText, inst) {
            $(this).val(dataText);
        },
        //生成时间戳
        onClose: function(dataText, inst) {
            var dateStr = Date.parse(dataText.replace(/-/g, "/"));
            $(this).parents("table").find("input[id$=end-time]").val(dateStr);
        }
    });

    //对数值的正则表达判断
    (function($) {
        $.fn.numberJudge = function() {
            var reg = /^[0-9]+(\.[0-9]{0,2})?$/g;
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
            } else {
                $(this).val(Number(num).toFixed(2));
            }
            return $(this).val();
        }
    })(jQuery);

    //对规格的正则表达式判断
    (function($) {
        $.fn.sizeJudge = function() {
            var reg = /^[0-9]*(\.[0-9]{0,2})?\*[0-9]*(\.[0-9]{0,2})?\*[0-9]*(\.[0-9]{0,2})?$/g;
            var size = $(this).val();
            var result = reg.test(size);

            if (result) {
                var sizeArr = size.split("*");
                sizeArr[0] = Number(sizeArr[0]).toFixed(2).toString();
                sizeArr[1] = Number(sizeArr[1]).toFixed(2).toString();
                sizeArr[2] = Number(sizeArr[2]).toFixed(2).toString();
                size = sizeArr[0] + "*" + sizeArr[1] + "*" + sizeArr[2];
                $(this).val(size);
            } else if (size == '') {
                $(this).val('').attr("placeholder", "输入不能为空");
            } else {
                $(this).val('').attr("placeholder", "请按正确格式输入");
            }
        }
    })(jQuery);

    //清空所有数据
    (function($) {
        $.fn.clearDatas = function() {
            var currentDivID = $(this).parents("div").last().attr("id");
            var currentIDs = "#" + currentDivID + " tbody [id]";
            $(currentIDs).each(function() {
                $(this).val('');
            });
        }
    })(jQuery);

    //给模态窗口传递值
    (function($) {
        $.fn.passDatesToModal = function() {
            //保存已经输入的项
            var inputsArr = new Array();
            var divID = $(this).parents("div").last().attr("id");
            var inputs = "#" + divID + " tbody [id]";
            var modalDivID = $(this).parents("div").last().next('div').attr("id");
            var modals = "#" + modalDivID + " span[id]";

            //需要输入项的数目
            var needLen = $(inputs).length;

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

    //将带有用“.”连接的属性名的对象转换为嵌套JSON字符串
    function convert(obj) {
        var object = {};
        var pre = {};
        for (var i in obj) {
            var attrs = i.indexOf('.');
            if (attrs != -1) {
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
            pre[i] = convert(pre[i]);
            obj[i] = pre[i];
        }
        return obj;
    }

    //将数据提取并发送到请求到后台
    (function($) {
        $.fn.passDatasToURL = function(acceptURL, submitType) {

            //取得在同一个页面的table的id
            var tableID = $(this).parents("div").last().prev("div").attr("id");
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
            var jsonStr = JSON.stringify(convert(obj));

            if (jsonStr) {
                $.ajax({
                    url: acceptURL,
                    type: submitType,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: jsonStr,
                    success: function(data) {
                        //请求成功时关闭现有模态窗口并弹出成功提醒模态窗口
                        if (data.code == 0) {
                            $("div[id^=modal]").modal("hide");
                            $("#modal-success").modal("show");
                            $("button[id^=btn-cancel]").click();
                        } else {
                            $("#modal-fail span").text(data.msg);
                            $("#modal-fail").modal("show");
                        }
                    },
                    error: function() {
                        //请求失败时弹出失败提醒模态窗口
                        $("#modal-fail").modal("show");
                    }
                });
            }
        };
    })(jQuery);

})

/* 原料采购登记
----------------------------------------------------------------------------------------*/
$(function() {

    var purQuantity, uPrice, tPrice;

    //禁止直接输入总价
    $("#material-purchase-total-price").focus(function() {
        $(this).blur();
    });

    //自动生成原料ID
    $("#material-purchase-material-class").change(function() {
        $("#material-purchase-material-id").val($(this).prop("selectedIndex") + 1);
    });

    //对输入购买量进行判断
    $("#material-purchase-purchase-quantity").blur(function() {
        purQuantity = $(this).numberJudge();

        //自动生成总价
        if (purQuantity && uPrice) {
            tPrice = (purQuantity * uPrice).toFixed(2).toString();
            $("#material-purchase-total-price").val(tPrice);
        }
    });

    //对输入原料单价进行判断
    $("#material-purchase-unit-price").blur(function() {
        uPrice = $(this).numberJudge();

        //自动生成总价
        if (purQuantity && uPrice) {
            tPrice = (purQuantity * uPrice).toFixed(2).toString();
            $("#material-purchase-total-price").val(tPrice);
        }
    });

    // 点击取消按钮清空所有数据
    $("#btn-cancel-material").click(function() {
        $(this).clearDatas();
        $("#material-purchase-purchase-quantity").attr("placeholder", "保留两位小数");
        $("#material-purchase-unit-price").attr("placeholder", "保留两位小数");
    });

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-material").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $("#modal-btn-submit-material").click(function() {
        $(this).passDatasToURL(path6 + "materialPurchaseRecord", "POST");
    });

});


/* 产品产出登记 
----------------------------------------------------------------------------------------*/
$(function() {

    //对输入规格进行判断
    $("#product-produce-product-size").blur(function() {
        $(this).sizeJudge();
    });

    //对输入产出总量进行判断
    $("#product-produce-produce-quantity").blur(function() {
        $(this).numberJudge();
    });

    // 点击取消按钮清空所有数据
    $("#btn-cancel-product-produce").click(function() {
        $(this).clearDatas();
        $("#product-produce-product-size").attr("placeholder", "厚*长*宽");
        $("#product-produce-produce-quantity").attr("placeholder", "保留两位小数");
    });

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-product-produce").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台交互
    $("#modal-btn-submit-product-produce").click(function() {
        $(this).passDatasToURL(path6 + "ProductProduce/createProductProduce", "POST");
    });
})


/* 工厂出库登记
----------------------------------------------------------------------------------------*/
$(function() {

    //对输入规格进行判断
    $("#out-storage-product-size").blur(function() {
        $(this).sizeJudge();
    });

    //对输入出库总量进行判断
    $("#out-storage-quantity").blur(function() {
        $(this).numberJudge();
    });

    // 点击取消按钮清空所有数据
    $("#btn-cancel-out-storage").click(function() {
        $(this).clearDatas();
        $("#out-storage-product-size").attr("placeholder", "厚*长*宽");
        $("#out-storage-quantity").attr("placeholder", "保留两位小数");
    })

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-out-storage").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $("#modal-btn-submit-out-storage").click(function() {
        $(this).passDatasToURL(path6 + "FactoryOutStorageRecord/createFactoryOutStorageRecord", "POST");
    });

})


/* 产品型号添加
----------------------------------------------------------------------------------------*/
$(function() {

    //对输入产品型号进行判断
    $("#add-product-model").blur(function() {
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
                url: path6 + "ProductModelInfo/productModels",
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    var len = data.result.length;
                    for (var i = 0; i < len; i++) {
                        if (data.result[i] == model) {
                            existCode = 1;
                        }
                    }
                }
            })
            if (existCode == 1) {
                $(this).focus();
                $(this).parents("div").last().find("span").text($(this).val() + "型号已存在").addClass("errorMsg");
            }
        }
    });

    //对输入的各种原料占比输入及和进行判断
    $("#add-product input:not(#add-product-end-date):not(#add-product-model").each(function() {
        var ratioAg, ratioCu, ratioZn, ratioCd, ratioSn;
        var totalRatio;

        $(this).blur(function() {
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

                if (ratioAg && ratioCu && ratioZn && ratioCd && ratioSn) {
                    totalRatio = Number(Number(ratioAg) + Number(ratioCu) + Number(ratioZn) +
                        Number(ratioCd) + Number(ratioSn)).toFixed(2);
                    if (totalRatio != 1) {
                        $(this).parents("div").last().find("span").text("各项占比和不为1，请检查").addClass("errorMsg");
                        $(this).val('').attr("placeholder", "保留两位小数");
                    }
                }
            }

        });
    });

    // 点击取消按钮清空所有数据
    $("#btn-cancel-add-product").click(function() {
        $(this).clearDatas();
        $("#add-product-model").attr("placeholder", "字母加数字");
        $("#add-product input[id^=add-product-ratio]").each(function() {
            $(this).attr("placeholder", "保留两位小数");
        });
    });

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-add-product").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $("#modal-btn-submit-add-product").click(function() {
        $(this).passDatasToURL(path6 + "ProductModelInfo/createProductModelInfo", "POST");
    });

})


/* 仓库入库登记
----------------------------------------------------------------------------------------*/
$(function() {

    //对输入规格进行判断
    $("#in-storage-product-size").blur(function() {
        $(this).sizeJudge();
    });

    //对输入出库总量进行判断
    $("#in-storage-quantity").blur(function() {
        $(this).numberJudge();
    });

    //点击取消按钮清空所有数据
    $("#btn-cancel-in-storage").click(function() {
        $(this).clearDatas();
        $("#in-storage-product-size").attr("placeholder", "厚*长*宽");
        $("#in-storage-quantity").attr("placeholder", "保留两位小数");
    })

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-in-storage").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $("#modal-btn-submit-in-storage").click(function() {
        $(this).passDatasToURL(path6 + "WarehouseInStorageRecord", "POST");
    });

})


/* 订单登记
----------------------------------------------------------------------------------------*/
$(function() {

    var sellUnitPrice, sellQuantity, sellTotalPrice;
    var delivererNames = new Array();
    var delivererIDs = new Array();
    var delivererOptionHtml = '';

    //从数据库获取所有仓库管理员
    $.ajax({
        url: path6 + "staffs/role/仓库管理员",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            if (data.code != 0) {
                alert(data.msg);
            } else {
                $.each(data.result, function(index, content) {
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
    $("#add-order-deliverer-name").change(function() {
        var selectedIndex = $(this).prop("selectedIndex");
        $("#add-order-deliverer-id").val(delivererIDs[selectedIndex]);
    });

    //禁止直接输入总价
    $("#add-order-total-price").focus(function() {
        $(this).blur();
    })

    //对输入规格进行判断
    $("#add-order-product-size").blur(function() {
        $(this).sizeJudge();
    });

    //对输入出售总量进行判断
    $("#add-order-quantity-total").blur(function() {
        sellQuantity = $(this).numberJudge();

        //自动生成总价
        if (sellQuantity && sellUnitPrice) {
            sellTotalPrice = (sellQuantity * sellUnitPrice).toFixed(2).toString();
            $("#add-order-total-price").val(sellTotalPrice);
        }
    });

    //对输入单价进行判断
    $("#add-order-unit-price").blur(function() {
        sellUnitPrice = $(this).numberJudge();

        //自动生成总价
        if (sellQuantity && sellUnitPrice) {
            sellTotalPrice = (sellQuantity * sellUnitPrice).toFixed(2).toString();
            $("#add-order-total-price").val(sellTotalPrice);
        }
    });

    //对输入收货人姓名进行判断
    $("#add-order-customer-name").blur(function() {
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
    $("#add-order-customer-phone").blur(function() {
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
    $("#add-order-customer-address").blur(function() {
        if ($(this).val() == '' || /^\s*$/g.test($(this).val())) {
            $(this).val('').attr("placeholder", "输入不能为空");
        }
    });

    //选择送达日期
    $("#add-order-arrival-date").datepicker({
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
        onSelect: function(dataText, inst) {
            $(this).val(dataText);
        },
        //生成时间戳
        onClose: function(dataText, inst) {
            var dateStr = Date.parse(dataText.replace(/-/g, "/"));
            $(this).parents("table").find("input[id$=start-time]").val(dateStr);
        }
    });

    //点击取消按钮清空所有数据
    $("#btn-cancel-add-order").click(function() {
        $(this).clearDatas();
        var phs = $("#add-order-record tbody [placeholder]");
        $(phs[0]).attr("placeholder", "厚*长*宽");
        $(phs[1]).attr("placeholder", "保留两位小数");
        $(phs[2]).attr("placeholder", "保留两位小数");
        for (var i = 3; i < 6; i++) {
            $(phs[i]).attr("placeholder", "");
        }
    });

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-add-order").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $("#modal-btn-submit-add-order").click(function() {
        $(this).passDatasToURL(path6 + "WarehouseOrder", "POST");
    });

})


/* 配送登记
----------------------------------------------------------------------------------------*/
$(function() {

    //从数据库查询订单并选择，自动生成产品信息
    var orderNumbers = new Array();
    var orderModels = new Array();
    var orderSizes = new Array();
    var orderShapes = new Array();
    var orderNames = new Array();
    var productOptionHtml = '';

    $.ajax({
        url: path6 + "WarehouseOrder/orderSet",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            if (data.code != 0) {
                alert(data.msg);
            } else {
                $.each(data.result, function(index, content) {
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
        error: function() {
            console.log("请求订单失败!");
        }
    });

    //根据选中订单编号自动填充产品信息和收货人信息
    $("#add-delivery-order-num").change(function() {
        //获取选中项的索引
        var selectedIndex = $(this).prop("selectedIndex");

        $("#add-delivery-product-model").val(orderModels[selectedIndex]);
        $("#add-delivery-product-size").val(orderSizes[selectedIndex]);
        $("#add-delivery-product-shape").val(orderShapes[selectedIndex]);
        $("#add-delivery-customer-name").val(orderNames[selectedIndex]);
    });

    //禁止直接输入产品信息和收货人
    $("[id^=add-delivery-product]").focus(function() {
        $(this).blur();
    });
    $("#add-delivery-customer-name").focus(function() {
        $(this).blur();
    });

    //对输入配送量进行判断
    $("#add-delivery-quantity").blur(function() {
        $(this).numberJudge();
    });

    //点击取消按钮清除所有数据
    $("#btn-cancel-add-delivery").click(function() {
        $(this).clearDatas();
        $("#add-delivery-quantity").attr("placeholder", "保留两位小数");
    });

    //点击确定按钮在模态窗口中显示所有数据
    $("#btn-submit-add-delivery").click(function() {
        $(this).passDatesToModal();
    });

    //点击模态框中的确认按钮执行与后台的交互
    $("#modal-btn-submit-add-delivery").click(function() {
        var url = path6 + "warehouseDeliveryRecord/" + $("#add-delivery-order-num").val();
        $(this).passDatasToURL(url, "POST");
    });

})