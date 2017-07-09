var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程
var path=path4;

$(document).ready(function(){

    //初始页面
    customerInitAjaxUseGet(path+"customers","json","application/json;charset=utf-8",".customer-table","all","");

    //筛选事件
    $("#customer-select").on('click',function(){
        var $name=$("#customer-name").val();
        customerInitAjaxUseGet(path+"customers","json","application/json;charset=utf-8",".customer-table","selectPage",""+$name);
    })

})

///参数为当前页表格的页id和行数
//在这个函数里面传ID到后台。再获取相应页面的数据 参数分别为表格类名，当前页id，当前页最大记录和数据json格式
//创建表格根据当前页数来确定起始记录，通过传入的length来决定该页记录的行数（不能超过最大记录数），targetJson来获取每行的记录
function customerCreateTable(divName,targetId,_url,_name){
    var $tbody=$(divName+" .table-content tbody");
    $tbody.html("");
    var tableName=[];
    $(divName+" .table-content").find("th").each(function(index,elment){
        tableName.push($(elment).attr('name'));
    }); 
    var targetObject={};
    customersAjaxUseGet(_url,targetId,_name);
    var map=$.parseJSON(targetJson);
    var length;
    if(JSON.stringify(json.result)=="null"){
        length=0;
    }else{
        length=map.result.length;
    }
    for(let i=0;i<length;i++){
        $tbody.append('<tr id="record-table-row-'+(i+1)+'"></tr>');
        targetObject=iterationObject(map.result[i],targetObject);
        $tbody.children("tr:last-child").append('<td>'+map.result[i][tableName[0]]+'</td>');
        for(let j=1;j<tableName.length;j++){
            let reg = /.{0,}Date.{0,}/;
            if(reg.test(tableName[j])){
                var date=new Date(targetObject[tableName[j]]).toLocaleString(targetObject[tableName[j]]);
                targetObject[tableName[j]]=date.split(" ")[0];
            }
            $tbody.children("tr:last-child").append('<td>'+targetObject[tableName[j]]+'</td>');
        }
        $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-modify" >修改</button>');
    
    }
}

//创建分页 参数分别为表格类名，总共页数，页面类型
function customerCreatePage(divName,targetPage,pageType,_url){
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
function customerClickLastPage(divName,$targetId,Page,_url,_name){
    if($targetId>1){
        $targetId=$targetId-1;
        let $target=$(divName+" .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        customerCreateTable(divName,$targetId,_url,_name);

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

//点击下一页 参数分别为表格类名，当前页id，总页数，总记录数量，json格式数据
//判断下一页是否为最后一页，来确定传给createTable记录长度
function customerClickNextPage(divName,$targetId,Page,_url){
    if($targetId<Page){
        $targetId=$targetId+1;
        let $target=$(divName+" .pagination-box ul").children().eq($targetId);
        $target.addClass("active").removeClass('hide');
        $target.siblings().removeClass("active");
        customerCreateTable(divName,$targetId,_url,_name);

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

//点击分页 参数分别为表格类名，点击页id，总页数，当前点击对象，json格式数据，总记录长度
//判断点击页是否为最后一页，来确定传给createTable的长度
function customerClickPage(divName,$targetId,Page,_this,_url){
    _this.addClass("active").removeClass("hide");
    _this.siblings().removeClass("active");
    customerCreateTable(divName,$targetId,_url,_name);

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


//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function customerInitAjaxUseGet(_url,_dataType,_contentType,divName,pageType,_name){
    var json,
        targetJson,//格式化传过来的json数据最终的形式
        $length,//返回json数据记录总数量
        $id=1;//初始页面
    var _data;
    if(_name==""){
        _data={
            pageNum:$id
        };
    }else{
        _data={
            pageNum:$id,
            name:_name
        };
    }
    $.ajax({//通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data:_data,
        dataType:_dataType,
        contentType:_contentType,
        success:function(data){
            json=eval(data);
            targetJson=JSON.stringify(json);
            if(JSON.stringify(json.result)=="null"){
                $length=0;
            }else{
                $length=json.result.length;
            }
            let $page=json.msg;

            customerCreateTable(divName,$id,_url,_name);

            $(divName+" .pagination-box").remove();
            if($length>0){
               customerCreatePage(divName,$page,pageType+" "); 
            }else{
                alert("该查询没有记录");
            }
            
            //点击页数
            $(divName+" ."+pageType+" .page").on("click",function(){
                $id=parseInt($(this).attr('id').match(/\d+(\.\d+)?/g));//当前为第几页
                customerClickPage(divName,$id,$page,$(this),_url,_name);   
            })

            // 点击上一页
            $(divName+" ."+pageType+" .last").on("click",function(){
                $id=customerClickLastPage(divName,$id,$page,_url,_name);
            })

            // 点击下一页
            $(divName+" ."+pageType+" .next").on("click",function(){
                $id=customerClickNextPage(divName,$id,$page,_url,_name);
            })
        }
    });  
}

function customersAjaxUseGet(_url,$Id,_name){
    var _data;
    if(_name==""){
        _data={
            pageNum:$Id
        };
    }else{
        _data={
            pageNum:$Id,
            name:_name
        };
    }
    $.ajax({
        url: _url,
        type: "GET",
        async:false,
        data:_data,
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