var $length;//为后台返回的每行相应的数值
var $text='data';
var $tbody=$(".blowon-record .content tbody");
var $id=1;//初始id为1
var $selectId=1;//筛选页面id
var $borStartTime;//起始时间
var $borEndTime;//终止时间
var json;
var path='http://110.64.72.46:8080/cg';

$(document).ready(function(){
    $.ajax({
        url: path+"/BlowonRecord/getAllBlowonRecord",
        type: "GET",
        dataType:"json",
        contentType:"application/json;charset=utf-8",
        success:function(data){
            json=eval(data);
            $length=json.result.length;
            // $length=json.result.length;//该值从后台返回总的数量
            $tbody.html("");
            var $tr;
            if($length>20){
               CreateTable(1,0,0,20);
            }
            else{
                CreateTable(1,0,0,$length);
            }
            var page=Math.ceil($length/20);
            if($length>0){
                CreatePage(page,'all');
            }
        }
    });
    



    // 点击分页标签触发事件
    $(".blowon-record .all .page").on("click",function(){
        $id=$(this).attr('id').match(/\d+(\.\d+)?/g);//当前为第几页
        $(this).addClass("active").removeClass("hide");
        $(this).siblings().removeClass("active");
        let partLength=$id*20>$length?$length:$id*20;
        CreateTable($id,0,0,partLength);

        if(($id>=3)&&($id<=page-2)){
            $(this).siblings().addClass("hide");
            $(this).prev().prev().removeClass("hide");
            $(this).prev().removeClass("hide");
            $(this).next().removeClass("hide");
            $(this).next().next().removeClass("hide");
            $ul.children('li:last-child').removeClass("hide");
            $ul.children('li:first-child').removeClass("hide");
        }
        
    })

    // 点击上一页
    $(".blowon-record .all .last").on("click",function(){
        if($id>1){
            $id=$id-1;
            let $target=$ul.children().eq($id);
            $target.addClass("active").removeClass('hide');
            $target.siblings().removeClass("active");
            CreateTable($id,0,0,$id*20);

            if(($id>=3)&&($id<=page-2)){
                $target.siblings().addClass("hide");
                $target.prev().prev().removeClass("hide");
                $target.prev().removeClass("hide");
                $target.next().removeClass("hide");
                $target.next().next().removeClass("hide");
                $ul.children('li:last-child').removeClass("hide");
                $ul.children('li:first-child').removeClass("hide");
            }
        }
    })

    // 点击下一页
    $(".blowon-record .all .next").on("click",function(){
        if($id<page){
            $id=$id+1;
            let $target=$ul.children().eq($id);
            $target.addClass("active").removeClass('hide');
            $target.siblings().removeClass("active");
            CreateTable($id,0,0,$id*20);

            if(($id>=3)&&($id<=page-2)){
                $target.siblings().addClass("hide");
                $target.prev().prev().removeClass("hide");
                $target.prev().removeClass("hide");
                $target.next().removeClass("hide");
                $target.next().next().removeClass("hide");
                $ul.children('li:last-child').removeClass("hide");
                $ul.children('li:first-child').removeClass("hide");
            }
        }
    })

    $(".content button").on('click',function(){
        var $buttonId=$(this).attr('id').match(/\d+(\.\d+)?/g);//当前为第几行
        var content=[],trLength=$(this).siblings().size();
        $(this).parent().find("td").each(function(index,elment){
            content.push($(elment).text());
        });
        alert(content);     
    })

    // 筛选事件
    $("#select").on('click',function(){
        selectId=1;
        $borSelectStartTime=$("#bor-start-time").value;//获取选择的起始时间
        $borSelectEndTime=$("#bor-end-time").value//获取选择的终止时间
        var $borSelectRecordLength;//根据后台处理后的数据返回数据行数
        $.ajax({
            url: path+"/BlowonRecord/getAllBlowonRecord",
            type: "GET",
            dataType:"json",
            async:false,
            contentType:"application/json;charset=utf-8",
            success:function(data){
                json=eval(data);
                $borSelectRecordLength=json.result.length;
            }
        });

        alert($borSelectRecordLength);
        let $selectPage=Math.ceil($borSelectRecordLength/20);
        if($selectPage>1){
            CreateTable(1,0,0,20);
        }
        else{
            CreateTable(1,0,0,$borSelectRecordLength);
        }
        if($borSelectRecordLength){
           CreatePage($selectPage,'selectPage'); 
        }
        
        //筛选事件点击页数
        $(".blowon-record .selectPage .page").on("click",function(){
            alert($borSelectStartTime);
            alert($borSelectEndTime);
            $selectId=$(this).attr('id').match(/\d+(\.\d+)?/g);//当前为第几页
            $(this).addClass("active").removeClass("hide");
            $(this).siblings().removeClass("active");
            let partLength=$selectId*20>$borSelectRecordLength?$borSelectRecordLength:$selectId*20;
            CreateTable($selectId,0,0,partLength);

            if(($selectId>=3)&&($selectId<=$selectPage-2)){
                $(this).siblings().addClass("hide");
                $(this).prev().prev().removeClass("hide");
                $(this).prev().removeClass("hide");
                $(this).next().removeClass("hide");
                $(this).next().next().removeClass("hide");
                $ul.children('li:last-child').removeClass("hide");
                $ul.children('li:first-child').removeClass("hide");
            }
            
        })

        // 筛选事件点击上一页
        $(".blowon-record .selectPage .last").on("click",function(){
            if($selectId>1){
                $selectId=$selectId-1;
                let $target=$ul.children().eq($selectId);
                $target.addClass("active").removeClass('hide');
                $target.siblings().removeClass("active");
                CreateTable($selectId,0,0,$selectId*20);

                if(($selectId>=3)&&($selectId<=$selectPage-2)){
                    $target.siblings().addClass("hide");
                    $target.prev().prev().removeClass("hide");
                    $target.prev().removeClass("hide");
                    $target.next().removeClass("hide");
                    $target.next().next().removeClass("hide");
                    $ul.children('li:last-child').removeClass("hide");
                    $ul.children('li:first-child').removeClass("hide");
                }
            }
        })

        // 筛选事件点击下一页
        $(".blowon-record .selectPage .next").on("click",function(){
            if($selectId<$selectPage){
                $selectId=$selectId+1;
                let $target=$ul.children().eq($selectId);
                $target.addClass("active").removeClass('hide');
                $target.siblings().removeClass("active");
                CreateTable($selectId,0,0,$selectId*20);

                if(($selectId>=3)&&($selectId<=$selectPage-2)){
                    $target.siblings().addClass("hide");
                    $target.prev().prev().removeClass("hide");
                    $target.prev().removeClass("hide");
                    $target.next().removeClass("hide");
                    $target.next().next().removeClass("hide");
                    $ul.children('li:last-child').removeClass("hide");
                    $ul.children('li:first-child').removeClass("hide");
                }
            }
        })
    })

    
})

//参数为当前页表格的页id和行数
//在这个函数里面传ID到后台。再获取相应页面的数据
function CreateTable(targetId,startTime,endTime,length){
    let record;//数组形式存储后台返回的数据
    $tbody.html("");
    for(let i=(targetId-1)*20;i<length;i++){
        $tbody.append('<tr id="record-table-row-'+(i+1)+'"></tr>');
        $tr=$tbody.children("tr:last-child");
        $tr.append('<td>'+json.result[i].blowonNum+'</td>')
            .append('<td>'+json.result[i].blowonDate+'</td>')
            .append('<td>'+json.result[i].productModelInfo.productModel+'</td>')
            .append('<td>'+json.result[i].consumeAg+'</td>')
            .append('<td>'+json.result[i].consumeCu+'</td>')
            .append('<td>'+json.result[i].consumeZn+'</td>')
            .append('<td>'+json.result[i].consuneCd+'</td>')
            .append('<td>'+json.result[i].consumeSn+'</td>')
            .append('<td>'+json.result[i].wasteConsume+'</td>')
            .append('<td>'+json.result[i].leftoverConsume+'</td>')
            .append('<td>'+json.result[i].materialConsume+'</td>')
            .append('<td>'+json.result[i].staffName+'</td>')
            .append('<button type="button" class="btn btn-default" id="table-button-'+(i+1)+'">修改</button>');
        }
}

//
function CreatePage(targetPage,pageType){
    $(".pagination-box").remove();
    $text1='<div class="pagination-box" style="margin:0 auto;width:300px;text-align: center;"><ul class="pagination '+pageType+' "></ul>';
    $(".blowon-record").append($text1);
    $ul=$(".pagination");
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

