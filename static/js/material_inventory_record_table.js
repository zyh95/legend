var path1 = "http://110.64.72.46:8080/cg/";//杭澍
var path2 = "http://110.64.72.43:8080/cg/";//耀友
var path3 = "http://119.29.173.65:8080/cg/";//锡龙
var path4 = "http://110.64.91.19:8080/cg/";//耀友宿舍
var path5 = "http://192.168.1.155:8080/cg/";//杭澍宿舍
var path6 = "http://45.76.198.134:8080/cg/";//耀友远程
var path=path6;

$(document).ready(function(){
    
    materialInventoryAjax(path+"material/inventories","json","application/json;charset=utf-8",".material-inventory-record-table");

    //筛选事件
    $("#material-inventory-refresh").on('click',function(){
         materialInventoryAjax(path+"material/inventories","json","application/json;charset=utf-8",".material-inventory-record-table");
    })

})

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
function materialInventoryAjax(_url,_dataType,_contentType,divName){
    var json,
        targetJson,//格式化传过来的json数据最终的形式
        $length,//返回json数据记录总数量
        $id=1;//初始页面
    $.ajax({//通过起始时间和终止时间来获取需要的数据
        url: _url,
        type: "GET",
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

            var tableName=[];
            $(divName+" .table-content").find("th").each(function(index,elment){
                tableName.push($(elment).attr('name'));
            }); 

            for(let i=1;i<6;i++){
                for(let j=0;j<$length;j++){
                    if(tableName[i]===json.result[j].materialClass){
                        $(""+divName+" .table-content tbody td").eq(i).html(json.result[j].materialInventory);
                    }
                }
            }
        }
    });  
}