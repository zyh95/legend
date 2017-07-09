var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程

var path = path6;

$(function(){

    var _productArr = getProductObj();//获取所有产品的数组
    var _modelArr = getAllProductModel(_productArr);//获取所有型号的数组
    var _sizeArr = getAllProductSize(_productArr);//获取所有规格的数组
    var _shapeArr = getAllProductShape(_productArr);//获取所有形态的数组
    initProductSelect($("select[data-model=product-model"),_modelArr);//初始化型号
    initProductSelect($("select[data-size=product-size"),_sizeArr);//初始化规格
    initProductSelect($("select[data-shape=product-shape"),_shapeArr);//初始化形态

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
        onSelect: function(dataText, inst) {
            $(this).val(dataText);
        },
    });

    /*修改过*/
    //添加一行记录
    $(".btn-add-record-row").click(function(){
        addRecordRow($(this),_modelArr,_sizeArr,_shapeArr,_productArr);
    });
    
    //删除最后一行记录
    $(".btn-delete-last-row").click(function(){
        deleteRecordRow($(this));
    });

    //清空记录
    $(".btn-clear-record").click(function(){
        $(this).parent().parent().find("td :input").val("");
    })

    // 在登记模态框上点击提交
    $(".emit-modal-confirm").click(function(){
        var all_records = {};
        var $parentModal = $(this).parents(".modal");
        var parentModalId = $($parentModal).attr("id");
        var targetUrl = $($parentModal).attr("data-url");
        all_records[parentModalId] =getSentData(parentModalId);
        $("#modal-confirm").modal("show")
            .on("shown.bs.modal",function(){
                $("#btn-confirm").click(function(){
                    if(all_records[parentModalId]){
                        console.log(all_records[parentModalId]);
                        postAjaxRequest(parentModalId,targetUrl,all_records);                        
                    }                
                });
            });
    });

    //给胚料登记的原料消耗总量赋值
    $("#model-selected").change(function(){
        setMaterialConsume();
    });

    /*新增，当产品型号改变时触发*/
    $("select[data-model=product-model]").change(function(){
        var $model = $(this).val();
        var sizeArr = getAllProductSize(_productArr,$model);
        var $sizeSelected = $(this).parent().next("td").find("select[data-size=product-size]");
        initProductSelect($sizeSelected,sizeArr);//初始化规格下拉框的内容

        var $size = $($sizeSelected).val();//获取当前规格的值        
        var shapeArr = getAllProductShape(_productArr,$model,$size);
        var $shapeSelected = $($sizeSelected).parent().next("td").find("select[data-shape=product-shape]");
        initProductSelect($shapeSelected,shapeArr);
    });
    /*当规格变化时触发*/
    $("select[data-size=product-size]").change(function(){
        var $modelSelected = $(this).parent().prev("td").find("select[data-model=product-model]");//找到规格框之前的型号框
        var $model = $($modelSelected).val();//型号框的值

        var $size = $(this).val();//获取当前规格的值        
        var shapeArr = getAllProductShape(_productArr,$model,$size);//获取选定的型号和规格之后的形态数组
        var $shapeSelected = $(this).parent().next("td").find("select[data-shape=product-shape]");
        initProductSelect($shapeSelected,shapeArr);
    });
});

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
//对表格的每个输入框进行数值判断并设置自动填充元素为只读
function inputCheck(tdName,parentModalId){
    $(tdName).blur(function(){
        let reg = /^\d+(\.\d{0,3})?$/g;
        let $tdata = $(this).val();
        if(!reg.test($tdata)){
            if($tdata == ""){
                $(this).attr("placeholder","请输入");
            }else{
                $(this).val("").attr("placeholder","输入数字");
            }
        }else{
            $(this).val(Number($tdata).toFixed(2));
        }
            materialSum("modal-blowon");       
    });
    $("td[data-auto] input").prop("readonly",true);
    $("td[data-read] input").prop("readonly",true);
}
//给开炉登记 需要统计的数据赋值，参数是表格所在的父模态框
function materialSum(parentModalId){
    var $trs = $("#"+parentModalId).find("tr:gt(0)");//获取添加的记录的数量
    for(let i=0;i<$trs.length;i++){
        var material = [];//存储每一行各种原料的值，重新开始一条记录时清空记录
        let perRowsInput = $($trs[i]).find("input");//获取每一行的所有input的值，不包括select
        let endIndex = $($trs[i]).find("td[data-auto]").index()-1;//index()返回的是在原表格的第几列，减1是因为当前行不包括第一列
        for (let j = 0; j < endIndex; j++) {
            material.push($(perRowsInput[j]).val());
        }
        var isValid = material.some(function(item,index,array){
            return (item != "");
        })
        if(isValid){
            var result = 0;
            $.each(material,function(index,elememt){
                result = elememt - 0 + result;
            });
            $(perRowsInput[endIndex]).val(result);
        }    
    }
}
//根据产品型号和开炉日期获取 胚料登记的原料消耗总量
function getMaterialConsumeSum(_path,productModel,blowonDate){
    var resultNum;
    $.ajax({
        url: path + _path + productModel + "/" + blowonDate,
        type: "GET",
        async: false,
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success:  function(data){
            if(data.code == 0){
                resultNum = data.result;
            }
        }
    });
    return resultNum;
}
//给胚料登记的原料消耗总量赋值
function setMaterialConsume(){
    var date = $("#blowon-date").val();
    var model = $("#model-selected").val();
    if(date && model){
        var dateUnix = DateToUnix(date);
        var result = getMaterialConsumeSum("BlowonRecord/blankRecord/",model,dateUnix);
        $("#consume-sum").val(result);
    }
}
//在对应表格上添加一行记录,参数分别是型号数组，规格数组，形态数组，全部产品的数组
function addRecordRow(_this,_modelArr,_sizeArr,_shapeArr,_productArr){
    var columns = $(_this).parent().parent().find("th").size();//获取表格的列数
    var indexModel = $(_this).parent().parent().find("td[data-model]").index();//获取产品型号所在的列数
    var indexAuto = $(_this).parent().parent().find("td[data-auto]").index();//获取自动填充的表格所在的列数
    var indexShape = $(_this).parent().parent().find("td[data-shape]").index();//获取产品形态一列所在的列数
    var indexSize = $(_this).parent().parent().find("td[data-size]").index();//获取产品规格一列所在的列数
    var $tr = $("<tr></tr>");
    var optionLeft = '<option value="' ,
        optionMiddle = '">',
        optionRight = '</option>';
    var optionStrModel = optionLeft + optionMiddle + optionRight;//型号的第一项，为空
    var optionStrSize = optionLeft + optionMiddle + optionRight;//规格的第一项，为空
    var optionStrShape = optionLeft + optionMiddle + optionRight;//形态的第一项，为空    
    //填充产品型号的option元素
    for (let i = 0; i < _modelArr.length; i++) {
        optionStrModel += optionLeft + _modelArr[i] + optionMiddle + _modelArr[i] + optionRight;
    }
    //填充产品规格的option元素
    for (let i = 0; i < _sizeArr.length; i++) {
        optionStrSize += optionLeft + _sizeArr[i] + optionMiddle + _sizeArr[i] + optionRight;
    }
    //填充产品形态的option元素
    for (let i = 0; i < _shapeArr.length; i++) {
        optionStrShape += optionLeft + _shapeArr[i] + optionMiddle + _shapeArr[i] + optionRight;
    }
    //对特殊元素所在的列数进行判断
    for (let i = 0; i < columns; i++) {
        if(i == indexModel){
            $tr.append('<td data-model><select data-model="product-model">' + optionStrModel + '</select></td>');
        }else if(i == indexAuto){
            $tr.append('<td data-auto><input class="input-in-td" type="text"/></td>');
        }else if(i == indexSize){
            $tr.append('<td data-size><select data-size="product-size">' + optionStrSize + '</select></td>');
        }else if(i == indexShape){
            $tr.append('<td data-shape><select data-shape="product-shape">' + optionStrShape +'</select></td>');
        }else{
            $tr.append('<td><input class="row-append input-in-td" type="text"/></td>');
        }            
    }
    $(_this).parent().parent().find("table").append($tr);
    inputCheck(".row-append");

    //当型号变化时触发
    $("select[data-model=product-model]").change(function(){
        var $model = $(this).val();
        var sizeSelectedArr = getAllProductSize(_productArr,$model);//获取选定型号对应的规格数组
        var $sizeSelected = $(this).parent().next("td").find("select[data-size=product-size]");
        initProductSelect($sizeSelected,sizeSelectedArr);//初始化规格下拉框的内容

        var $size = $($sizeSelected).val();//获取当前规格的值        
        var shapeSelectedArr = getAllProductShape(_productArr,$model,$size);
        var $shapeSelected = $($sizeSelected).parent().next("td").find("select[data-shape=product-shape]");
        initProductSelect($shapeSelected,shapeSelectedArr);
    });
    /*当规格变化时触发*/
    $("select[data-size=product-size]").change(function(){
        var $modelSelected = $(this).parent().prev("td").find("select[data-model=product-model]");//找到规格框之前的型号框
        var $model = $($modelSelected).val();//型号框的值

        var $size = $(this).val();//获取当前规格的值        
        var shapeSelectedArr = getAllProductShape(_productArr,$model,$size);//获取选定的型号和规格之后的形态数组
        var $shapeSelected = $(this).parent().next("td").find("select[data-shape=product-shape]");//形态框的对象
        initProductSelect($shapeSelected,shapeSelectedArr);
    });
}
//在对应表格上删除最后一行记录
function deleteRecordRow(btnDel){
    let $rows = $(btnDel).parent().parent().find("tr").length;
    if( $rows > 2){
        $(btnDel).parent().parent().find("tr:last").remove();
    }
}
//获取要发送的数据
function getSentData(parentModalId){
    var record = [];//存放该模态框所包含表格的数据
    var dataKey = [];//存储表头元素的data-key的属性值
    var $date = $("#" + parentModalId).find("input[data-date]");//获取输入日期的输入框对象
    var $trs = $("#" + parentModalId).find("tr:gt(0)");//获取添加的记录的数量
    var $ths = $("#" + parentModalId).find("th[data-key]");//获取当前模态框的所有表头元素
    $.each($ths,function(index,elememt){
        dataKey.push($(elememt).attr("data-key"));
    });
    for (let i = 0; i < $trs.length; i++) {
        var perRowData = new Map();//存储一行的数据        
        var $inputs = $($trs[i]).find("td :input");//获取当前行的所有表单元素，包括select
        perRowData[$($date).attr("data-key")] =DateToUnix( $($date).val() );//将日期输入框对象的值传给对应的key
        for (let j = 0; j < $inputs.length; j++) {
            perRowData[dataKey[j]] = $($inputs[j]).val();
        }
        record.push(convertToJson(perRowData));
    }
    return record;
}
//初始化ajax请求，参数分别是父模态框的id，路径后缀，发送的数据(可选)
function postAjaxRequest(_parentModalId,_path,recordObj){
    $.ajax({
        url: path + _path,
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        data: JSON.stringify(recordObj[_parentModalId]),        
        success: function(data){
            if(data.code != 0){
                console.log(data.msg);
            }else{
                $("#" + _parentModalId).modal("hide");
                $("#modal-success").modal("show");
                recordObj[_parentModalId] = null;
            }
        },
        error: function(){
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
function getAllProductModel(productArr){    
    var modelSet = new Set();
    $.each(productArr,function(index,content){
        modelSet.add(content['productModelInfo']['productModel']);
    })
    var modelArr = Array.from(modelSet).sort();
    return modelArr;
}

//初始化选择元素的option，参数分别为获取数据的对象和传入的数组（可以是型号或规格）
function initProductSelect(selectElememt,productArr){
    var optionHtml = '<option value="" class="blank-option" selected></option>';
    for (let i = 0; i < productArr.length; i++) {
        optionHtml += '<option value="' + productArr[i] + '">' + productArr[i] + '</option>';
    }
    $(selectElememt).html(optionHtml);
}

/*修改*/
//获取存储产品规格的数组，供动态创建的下拉框使用
function getAllProductSize(productArr,modelSelected){
    var sizeSet = new Set();
    if(!modelSelected){
        $.each(productArr,function(index,content){
            sizeSet.add(content['productSize']);      
        });
    }else{
        $.each(productArr,function(index,content){
            if(content['productModelInfo']['productModel']==modelSelected){
                sizeSet.add(content['productSize']);
            }
        });        
    }
    var sizeArr = Array.from(sizeSet).sort();
    return sizeArr;
}

/*新增*/
// 获取型号、规格对应的形态数组
function getAllProductShape(productArr,modelSelected,sizeSelected){
    var shapeSet = new Set();
    if(!modelSelected && !sizeSelected){
       $.each(productArr,function(index,content){
            shapeSet.add(content['productShape']+"");
        }); 
    }else if(modelSelected && !sizeSelected){
        $.each(productArr,function(index,content){
            if(content['productModelInfo']['productModel']==modelSelected){
                shapeSet.add(content['productShape']+"");
            }
        });
    }else if(!modelSelected && sizeSelected){
        $.each(productArr,function(index,content){
            if(content['productSize']==sizeSelected){
                shapeSet.add(content['productShape']+"");
            }
        });
    }else{
        $.each(productArr,function(index,content){
            if(content['productModelInfo']['productModel']==modelSelected && content['productSize']==sizeSelected){
                shapeSet.add(content['productShape']+"");
            }
        });
    }
    var shapeArr = Array.from(shapeSet).sort();
    return shapeArr;
}