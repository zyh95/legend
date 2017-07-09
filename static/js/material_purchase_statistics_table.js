var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程
var path=path4;

$(document).ready(function(){
    document.getElementById("mps-start-time").valueAsDate=new Date();
    document.getElementById("mps-end-time").valueAsDate=new Date();
    var targetJson;

    //初始页面
    var mydate=new Date();
    var today=DateToUnix(""+mydate.getFullYear()+"-"+(mydate.getMonth()+1)+"-"+mydate.getDate());
    fpiStatisticsInitAjaxUseGet(path+"statisticMaterialRecords","json","application/json;charset=utf-8",".material-purchase-statistics-table","all",0,today);

    //筛选事件
    $("#mps-select").on('click',function(){
        var $selectStartTime=DateToUnix($("#mps-start-time").val());
        var $selectEndTime=DateToUnix($("#mps-end-time").val());
        if($selectStartTime>$selectEndTime){
            alert("请选择正确的时间");
        }else{
            fpiStatisticsInitAjaxUseGet(path+"statisticMaterialRecords","json","application/json;charset=utf-8",".material-purchase-statistics-table","selectPage",$selectStartTime,$selectEndTime);
        }
    })

})

///参数为当前页表格的页id和行数
//在这个函数里面传ID到后台。再获取相应页面的数据 参数分别为表格类名，当前页id，当前页最大记录和数据json格式
//创建表格根据当前页数来确定起始记录，通过传入的length来决定该页记录的行数（不能超过最大记录数），targetJson来获取每行的记录
function fpiStatisticsCreateTable(divName,_url,_startTime,_endTime){
    var $tbody=$(divName+" .table-content tbody");
    $tbody.html("");
    var tableName=[];
    $(divName+" .table-content").find("th").each(function(index,elment){
        tableName.push($(elment).attr('name'));
    }); 
    var targetObject={};
    var map=$.parseJSON(targetJson);
    var length;
    if(JSON.stringify(targetJson.result)=="null"){
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
        if((divName!=".material-purchase-statistics-table")&&(true)){
            $tbody.children("tr:last-child").append('<button type="button" class="btn btn-default table-content-modify" >修改</button>');
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

//调用ajaxUse GET方法 参数为url 访问方法，数据类型，内容类型，表格类名，页面类型
function fpiStatisticsInitAjaxUseGet(_url,_dataType,_contentType,divName,pageType,_startTime,_endTime){
    var json,
        $length;//返回json数据记录总数量
    $.ajax({//通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
        data:{
            beginTime:_startTime,
            endTime:_endTime
        },
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

            fpiStatisticsCreateTable(divName,_url,_startTime,_endTime);
        }
    });  
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