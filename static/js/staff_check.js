var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程
var path9 = "http://120.77.39.33:8080/cg/"; //耀友远程无权限
var path = path9;

$(function(){
    $("#emit-modal-staff-add").click(function(){
        $("#modal-staff-add").modal("show");
    })
    $("#modal-staff-modify").modal({backdrop:'static',keybord:true}); 
       
    //初始化页面记录
    initAjaxUseGetStaff(path+"staffs/searchResult","json","application/json;charset=utf-8",".staff-record-table","all");

    //获取职位信息
    var roleResult = getRoleData();
    setRole(roleResult,$("select[id*=role]"));

    //禁止直接输入日期
    $("[data-date]").focus(function() {
        $(this).blur();
    });

    //不超过当天的日期选择限制
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

    //对必填的项加上*号提示
    $(".required").each(function(){
        let $required = $('<strong class="high">*</strong>');       
        $(this).parent().prepend($required);
    })

    //表单验证
    checkInput();

    //添加员工
    $("#btn-add-staff").click(function(){
        $(".required").trigger('blur');
        var numError = $(".on-error").length;
        if(numError){
            return false;
        }
        console.log("有执行吗、？");
        // checkInput();
        var $addingUrl = $(this).parent().prev().attr("data-url");//获取路径
        var $labels = $("#modal-staff-add label[data-key]");//左侧label对象
        var $inputData = $labels.next();//右侧input对象
        var sendData = JSON.stringify(
                    convertToJson(getAddItemData($labels,$inputData)));//获取要传送的数据
        var $modalId = $(this).parents(".modal").attr("id");//获取模态框的ID
        addAjax($addingUrl,sendData,$modalId);     
    });

    //根据员工工号或姓名查询，待完善
    $("#search-staff").click(function(){
        var parentDivId = $(this).parent().attr("id");
        var queryObj = getSelectedCondition(parentDivId);
        initAjaxUseGetStaff(path+"staffs/searchResult","json","application/json;charset=utf-8",".staff-record-table","selectPage",queryObj);
    })

    //在modal-staff-modify上点击提交按钮的事件
    $(".btn-commit-in-modal").click(function(){
        $(".required").trigger('blur');
        var numError = $(".on-error").length;
        if(numError){
            return false;
        }
        var $modalId = $(this).parents(".modal").attr("id");//父模态框的id值
        var $inputModify = $(this).parent().siblings("div").find(":input");//父模态框上的所有input和select元素
        var $modalBody = $(this).parent().parent();//模态框的主体
        var $inputNum = $modalBody.find("input.input-num");//要发送到服务器的字段值所在的元素
        var modifyUrl = $modalBody.attr("data-url") + $inputNum.val();//修改数据的服务器路径
        var sendData = convertToJson(getModalModifyData($inputModify));//转换成JSON格式的data
        var finalData = JSON.stringify(sendData);
        addModifyAjax(modifyUrl, finalData,$modalId);
    });

    //从查看员工信息上直接点击修改
    $("#btn-modify-staff").click(function(){
        var $labels = $("#modal-staff-info label"); //模态框上的所有label元素      
        var $span = $("#modal-staff-info span.data-info");//模态框上的所有span元素
        var spanData = getModifyItemData($labels,$span);
        writeDataToModal("modal-staff-modify",spanData);
    })
});

//对必填项的表单验证
function checkInput(){
    $(".required").blur(function(){
        var $parent = $(this).parent();
        $parent.find(".form-tips").remove();

        var errorMsg = "请填写此字段";
        var okMsg = "输入完成";

        //姓名判断
        if($(this).is("#staff-name")){
            let reg1 = /^[\u4e00-\u9fa5]{2,20}$/;
            let reg2 = /^[a-zA-Z]{2,20}$/;
            if(!reg1.test(this.value) && !reg2.test(this.value)){
                let errorMsg = "请输入员工中文名或英文名，长度为2-20";
                $parent.append('<span class="form-tips on-error">'+errorMsg+'</span>');
            }else{
                $parent.append('<span class="form-tips on-success">'+okMsg+'</span>');
            }
        }

        // 需要编写默认当天的函数
        if($(this).is("#staff-entry-date") ){
            if(this.value == ""){
                $parent.append('<span class="form-tips on-error">'+errorMsg+'</span>');
            }else{
                $parent.append('<span class="form-tips on-success">'+okMsg+'</span>');
            }
        }

        //手机号码判断
        if($(this).is("#staff-tel") || $(this).is("#staff-tel-modify")){
            let reg = /^1\d{10}$/;
            if(!reg.test(this.value)){
                let errorMsg = "请输入正确的手机号码(11位数字)";
                $parent.append('<span class="form-tips on-error">'+errorMsg+'</span>');             
            }else{
                $parent.append('<span class="form-tips on-success">'+okMsg+'</span>');              
            }
        }

        //身份证号判断
        if($(this).is("#staff-id-num")){
            let reg = /^\d{17}[0-9X]$/;
            if(!reg.test(this.value)){
                let errorMsg = "请输入正确的身份证号码(X为大写)";
                $parent.append('<span class="form-tips on-error">'+errorMsg+'</span>'); 
            }else{
                $parent.append('<span class="form-tips on-success">'+okMsg+'</span>');
            }
        }

        //职位和状态判断
        if($(this).is("#staff-role") || $(this).is("#staff-state")){
            if(this.value == ""){
                let errorMsg = "请选择"
                $parent.append('<span class="form-tips on-error">'+errorMsg+'</span>');
            }else{
                $parent.append('<span class="form-tips on-success">'+okMsg+'</span>');
            }
        }

        //密码判断
        if($(this).is("#staff-password") || $(this).is("#staff-password-modify")){
            if(this.value == ""){
                var pwd =  $("#staff-id-num").val().slice(-6);
                this.value = pwd;               
            }else if(this.value.length < 6 || this.value.length > 30){
                let errorMsg = "密码长度为6-30(默认为身份证后6位)";
                $parent.append('<span class="form-tips on-error">'+errorMsg+'</span>');
            }else{
                $parent.append('<span class="form-tips on-success">'+okMsg+'</span>');
            }
        }
    }).focus(function(){
        $(this).triggerHandler("blur");
    }).keyup(function(){
        $(this).triggerHandler("blur");
    });    
}

//在这个函数里面传ID到后台。再获取相应页面的数据，参数分别为表格类名，当前页id，当前页最大记录和数据json格式。
//创建表格根据当前页数来确定起始记录，通过传入的length来决定该页记录的行数（不能超过最大记录数），targetJson来获取每行的记录
function CreateTable(divName,targetId,_url,queryObj){   
    var $thead = $(divName + " .table-content thead");
    var $tbody=$(divName+" .table-content tbody");
    $tbody.html("");

    var thHiden = [];//隐藏的元素的name属性值所存放的数组
    $thead.find("th.data-hide").each(function(index,elment){
        thHiden.push($(elment).attr("name"));
    })   
    var tableName=[];//表格所有表头元素的name属性值所存放的数组
    $(divName+" .table-content").find("th").each(function(index,elment){
        tableName.push($(elment).attr('name'));
    });

    var targetObject={};
    ajaxUseGet(_url,targetId,queryObj);
    var map=$.parseJSON(targetJson);
    var length=map.result.length;

    for(let i=0;i<length;i++){
        $tbody.append('<tr id="record-table-row-'+(i+1)+'"></tr>');
        targetObject=iterationObject(map.result[i],targetObject);

        if(thHiden.length > 0){
            var $arr_index = [];    
            for (let k = 0; k < thHiden.length; k++) {
                $arr_index.push(tableName.indexOf(thHiden[k]));
            }            
        }       

        for(let j=0;j<tableName.length;j++){
            let reg = /.{0,}Date.{0,}/;
            if(reg.test(tableName[j])){
                var date=new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]]=date.split(" ")[0];
            }
        
            if($arr_index.indexOf(j) !== -1){
                $tbody.children("tr:last-child").append('<td class="data-hide">'+targetObject[tableName[j]]+'</td>');                
            }else{
                $tbody.children("tr:last-child").append('<td>'+targetObject[tableName[j]]+'</td>');                
            }            
        }

        //如果是员工的记录表格就再添加一个查看的按钮        
        if(tableName.indexOf("staffName") !== -1){
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-detail">查看</button>');
        }      
        $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-modify">修改</button>');
    }

    //查看员工的全部信息，完成
    $(".table-content-detail").click(function(){
        var tds = $(this).siblings("td");
        $("#modal-staff-info").modal("show")
            .on("shown.bs.modal",function(){
                var spans = $("#modal-staff-info span.data-info");
                for (let i = 0; i < tds.length; i++) {      
                    $(spans[i]).text( $(tds[i]).text() );
                }
            });
    });

    //点击修改按钮修改员工信息
    $(".table-content-modify").click(function () {
        var $thModify = $(this).parent().parent().parent().find("th");
        var $tdModify = $(this).parent().find("td");
        var tableModalID = $(this).parent().parent().parent().attr("data-modal-id");//所在的table对应的修改信息的模态框的id值       
        var preData = getModifyItemData($thModify, $tdModify);// 获取要写入模态的数据
        console.log(preData);
        writeDataToModal(tableModalID, preData);
    });   
}

//创建分页 参数分别为表格类名，总共页数，页面类型
function CreatePage(divName,targetPage,pageType,_url){
    $text1='<div class="pagination-box" style="margin:0 auto;width:400px;text-align: center;"><ul class="pagination '+pageType+' "></ul>';
    $(divName+" ").append($text1);
    var $ul=$(divName+" .pagination");
    $ul.append('<li class="last"><a href="#" id="bow-last">&laquo;</a></li>');
    $ul.append('<li class="next"><a href="#" id="bow-next">&raquo;</a></li>');
    for(let i=0;i<targetPage;i++){
        if(i==0){
            $('<li class="page active" id="bow-page'+(i+1)+'"><a href="#" >'+(i+1)+'</a></li>').insertBefore($ul.children('li:last-child'));
            continue;
        }
        $('<li class="page " id="bow-page'+(i+1)+'"><a href="#" >'+(i+1)+'</a></li>').insertBefore($ul.children('li:last-child'));
        if((i+1)>5){
            $ul.children('li:last-child').prev("li").addClass('hide');
        }
    }   
}

//重新编写json数据 _map 需处理的数据 targetObject 处理后存入的对象容器  参数分别为处理后的对象数据，使用目标
function iterationObject(_map,targetObject){
    for (var key in _map){
        if(typeof _map[key]==='object'){
            targetObject=iterationObject(_map[key],targetObject);
        }
        else{
            targetObject[key]=_map[key];
        }
    }
    return targetObject;
}

//点击上一页 参数分别为表格类名，当前页id，总页数和json格式数据
function clickLastPage(divName,$targetId,Page,_url,queryObj){
    if($targetId>1){
        $targetId=$targetId-1;
        let $target=$(divName+" .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        CreateTable(divName,$targetId,_url,queryObj);

        if(($targetId>=3)&&($targetId<=Page-2)){
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

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据判断下一页是否为最后一页，来确定传给createTable记录长度
function clickNextPage(divName,$targetId,Page,_url,queryObj){
    if($targetId<Page){
        $targetId=$targetId+1;
        let $target=$(divName+" .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        CreateTable(divName,$targetId,_url,queryObj);

        if(($targetId>=3)&&($targetId<=Page-2)){
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

//点击分页，参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度，判断点击页是否为最后一页，来确定传给createTable的长度
function clickPage(divName,$targetId,Page,_this,_url,queryObj){
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    CreateTable(divName,$targetId,_url,queryObj);

    if(($targetId>=3)&&($targetId<=Page-2)){
        _this.siblings().addClass("hide");
        _this.prev().prev().removeClass("hide");
        _this.prev().removeClass("hide");
        _this.next().removeClass("hide");
        _this.next().next().removeClass("hide");
        _this.parent().children('li:last-child').removeClass("hide");
        _this.parent().children('li:first-child').removeClass("hide");
    }else{
        if($targetId==2){
            _this.siblings().addClass("hide");
            _this.parent().children('li:last-child').removeClass("hide");
            _this.parent().children('li:first-child').removeClass("hide");
            _this.prev().removeClass("hide");
            _this.next().removeClass("hide");
            _this.next().next().removeClass("hide");
            _this.next().next().next().removeClass("hide");
        }
        else{
            if($targetId==Page-1){
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
function initAjaxUseGetStaff(_url,_dataType,_contentType,divName,pageType,queryObj){
    var json,
        targetJson,//格式化传过来的json数据最终的形式
        $length,//返回json数据记录总数量
        $id=1;//初始页面
    // var _queryObj = queryObj;
    // _queryObj.pageNum = $id  
    $.ajax({//通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data: queryObj,
        dataType:_dataType,
        contentType:_contentType,
        success:function(data){
            json=eval(data);
            targetJson=JSON.stringify(json);
            $length=json.result.length;
            let $page=json.msg;

            CreateTable(divName,$id,_url,queryObj);

            $(divName+" .pagination-box").remove();
            if($length>0){
                CreatePage(divName,$page,pageType+" "); 
            }else{
                alert("该查询没有记录");
            }
            
            //点击页数
            $(divName+" ."+pageType+" .page").on("click",function(){
                $id=parseInt($(this).attr('id').match(/\d+(\.\d+)?/g));//当前为第几页
                clickPage(divName,$id,$page,$(this),_url,queryObj);   
            })

            // 点击上一页
            $(divName+" ."+pageType+" .last").on("click",function(){
                $id=clickLastPage(divName,$id,$page,_url,queryObj);
            })

            // 点击下一页
            $(divName+" ."+pageType+" .next").on("click",function(){
                $id=clickNextPage(divName,$id,$page,_url,queryObj);
            })

        }
    });  
}

function ajaxUseGet(_url,$id,queryObj){
    queryObj.pageNum = $id;
    $.ajax({
        url: _url,
        type: "GET",
        async:false,
        data:queryObj,
        dataType:"json",
        contentType:"application/json;charset=utf-8",
        success:function(data){
            json=eval(data);
            targetJson=JSON.stringify(json);
        },
        error:function(){
            alert("error");
        }
    })
}

//将日期转换为时间戳
function DateToUnix(string){
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
function getModifyItemData($th,$td){
    var dataKey = [];
    var content = [];
    var preData = new Map();
    // 存储表头的data-key的值
    $th.each(function(index,element){
        dataKey.push($(element).attr("data-key"));
    });
    // 修改行的值
    $td.each(function(index,elment){
        content.push($(elment).text());
    });
    if(dataKey.length === content.length){
        for(let i = 0; i < dataKey.length; i++){
            preData[dataKey[i]]=content[i];
        }
    }
    return preData;
}

//获取要增加条目的输入信息
function getAddItemData($labels,$inputData){
    var dataKey = [];
    var content = [];
    var preData = new Map();
    //存储左侧label的data-key值
    $labels.each(function(index,element){
        dataKey.push($(element).attr("data-key"));
    });
    //存储右侧input和select的值
    $inputData.each(function(index,element){
        content.push($(element).val());
    });
    for (let i = 0; i < dataKey.length; i++) {
        if(dataKey[i] == "staffEntryDate"){
            preData[dataKey[i]] = DateToUnix(content[i]);
        }else {
            preData[dataKey[i]] = content[i];
        }        
    }
    return preData;
}

// 向表格对应的模态框填入数据
function writeDataToModal(modalId, writeData) {
    $("#" + modalId).modal("show")
        .on("shown.bs.modal", function () {
            $(this).find(".data-modify").each(function (index, element) {
                var key = $(element).attr("data-key");
                // if (key !== "role.roleId") {
                    $(element).val(writeData[key]);
                // } else {
                //     getRole(roleResult,$(element), writeData[key]);
                // }
            });
        });
}

// 将需要发送的原始数据转化为符合json接口格式的数据
function convertToJson(obj){
    var pre={};
    for( var i in obj){
        var attrs=i.indexOf('.');
        if(attrs!==-1){
            var prefix=i.substring(0,attrs);
            var postfix=i.substring(attrs+1);

            if(pre[prefix]){
                var a=postfix;
                pre[prefix][a]=obj[i];
            }else{
                pre[prefix]={};
                var a=postfix;
                pre[prefix][a]=obj[i];
            }
            delete obj[i];
        }
    }
    for(var i in pre){
        pre[i]=convertToJson(pre[i]);
        obj[i]=pre[i];
    }
    return obj;
}

function addModifyAjax(pathUrl, sendData,modalId){
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
                $("#"+modalId).modal("hide");
                $("#modal-staff-info").modal("hide");
                $("#modal-success").modal("show")
                    .on("hidden.bs.modal",function(){
                        initAjaxUseGetStaff(path+"staffs/searchResult","json","application/json;charset=utf-8",".staff-record-table","all");
                    })               
            }
        },
        error: function (XMLResponse, textStatus) {
            console.log("失败了？？？");
            $("#modal-fail").modal("show");
        }
    });
}

function addAjax(pathUrl,sendData,modalId){
    $.ajax({
        url: path + pathUrl,
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        data: sendData,
        dataType: "json",
        success: function(data){
            if(data.code !== 0){
                console.log("添加失败了,原因是："+data.msg);
                $("modal-fail").modal("show");
            }else {
                console.log("成功了！！！");
                $("#"+modalId).modal("hide");
                $("#modal-success").modal("show")
                    .on("hidden.bs.modal",function(){
                        initAjaxUseGetStaff(path+"staffs/searchResult","json","application/json;charset=utf-8",".staff-record-table","all");
                    })
            }
        },
        error: function (XMLResponse, textStatus) {
            console.log("失败了？？？");
            $("#modal-fail").modal("show");
        }        
    })
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
    console.log("getModalModifyData：");
    console.log(modifyData);
    return modifyData;
}

function getRoleData(){
    var roleResult;
    $.ajax({
        url:path + "staff/roles",
        type: "GET",
        async: false,
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function(data){
            if(data.code == 0){               
                roleResult = data.result;
            } 
        }
    });
    return roleResult;
}

function setRole(roleResult,$selectModify, selectedRole) {
    // roleResult = getRoleData();
    var roleArr = roleResult;
    var $value = toggleDescriptionToId(roleArr,selectedRole);
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
                }
                else {
                    optionHtml += '<option value="' + roleId[i] + '" selected>' + roleDescription[i] + '</option>';
                }
            }
        }
        $selectModify.html(optionHtml);
}

//获取筛选员工的条件
function getSelectedCondition(divId){
    var $selectedCondition = $("#"+ divId +" :input[data-key]");
    var conditionObj = new Map();
    $selectedCondition.each(function(index,element){
        if($(element).val()){
            let $value = $(element).attr("data-key");
            if($value === "entryDate"){
                conditionObj[ $value ] = DateToUnix($(element).val());
            }else{
                conditionObj[ $value ] = $(element).val();
            }            
        }
       
    })
    conditionObj.pageNum = 1;
    return conditionObj;
}

//将员工的描述转换为对应的员工ID
function toggleDescriptionToId(roleResult,roleSelected){
    var roleId = [], roleDescription = [];
    // var roleResult = getRoleData();
    for(var i in roleResult){
        roleId.push(roleResult[i]['roleId']);
        roleDescription.push(roleResult[i]['roleDescription']);
    }
    var idIndex = roleId.indexOf(roleSelected);
    var descriptionIndex = roleDescription.indexOf(roleSelected);
    if(idIndex !== -1){
        return roleDescription[idIndex];
    }else{
        return roleId[descriptionIndex];
    }
}