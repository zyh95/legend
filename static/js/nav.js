var path = "http://119.29.173.65:8080/cg/";// 服务器的绝对路径
// var path = "http://110.64.72.43:8080/cg/";// 耀友
var featureDisplay = new Set();// 存储ul.nav-tabs a的name，存在keyName则表明，对应的功能模块代码已加载
// 功能、请求路径、处理的块元素div的对应关系对象
var relationMap = {
    orderManagement: {"recordServerUrl": "", "divClass": ""},
    staffManagement: {"recordServerUrl": "", "divClass": ""},
    customerInfo: {"recordServerUrl": "", "divClass": ""},
    statisticsQuery: {"recordServerUrl": "", "divClass": ""},
    userGuide: {"recordServerUrl": "", "divClass": ""},
    materialPurchase: {"recordServerUrl": "", "divClass": ""},
    blowOn: {"recordServerUrl": "", "divClass": ""},
    productModel: {"recordServerUrl": "", "divClass": ""},
    productProduce: {"recordServerUrl": "", "divClass": ""},
    outStorageRecord: {"recordServerUrl": "", "divClass": ""},
    factoryInventory: {"recordServerUrl": "", "divClass": ""},
    checkWarehouse: {"recordServerUrl": "", "divClass": ""},
    factoryStatistics: {"recordServerUrl": "", "divClass": ""},
    inStorageRecord: {"recordServerUrl": "", "divClass": ""},
    deliveryRecord: {"recordServerUrl": "", "divClass": ""},
    warehouseInventory: {"recordServerUrl": "", "divClass": ""},
    warehouseStatistics: {"recordServerUrl": "", "divClass": ""}
};

// 获取登录用户的名字
$(document).ready(function () {
    $.getJSON(path + 'staff/userInfo', function (json) {
        $('#staff-name').html('<span class="glyphicon glyphicon-user"></span> ' + json.result);
    });
});


//可修改加载用户指导文档
// 从服务器加载未加载的功能模块代码
// 对应关系：ul.nav-tabs a[name(1-1)href]
// (ul.nav-tabs a[href])(1-1)(div.tab-content div[id])
// $('ul[id=nav-tabs] a').click(function () {
//     var keyName = this.name;// 从a标签中获取对应的name
//     var hrefArr = this.href.split('#');// 从href提取对应div的id
//     var divID = hrefArr.slice(-1);
//
//     // 判断改name对应的div是否已经加载过。
//     // 未加载，则向服务器发起请求加载代码对应的字符串数据，并在featureDisplay集合中添加该name；
//     // 已加载，则不向服务器发起请求。
//     if (!featureDisplay.has(keyName)) {
//         $.get(path + 'div', {"featureID": keyName}, function (result) {
//             featureDisplay.add(keyName);
//             var div = $(result);// 将字符串转为jQuery对象
//             $('#feature-display').append(div);
//             $(".tab-pane.active").removeClass("active");
//             $(div).addClass("active").addClass("tab-pane").attr('id', divID);
//         })
//             .error(function (ob, error) {
//                 console.log(error);
//             });
//     }
// });


// 响应头部导航栏的点击，显示对应的竖向标签页导航
$('.role-navbar-nav').click(function(){
    $(this).siblings("li").removeClass("active");
    $(this).addClass("active");
    var idValue = this.id.split("-");
    var navtabsClassName = idValue[0]  + '-navtabs';
    // console.log(navtabsClassName);
    // console.log(typeof(navtabsClassName));
    var $liTag = $("." + navtabsClassName);
    $liTag.siblings("li[class!="+ navtabsClassName + "]").hide();
    $liTag.show();

//        使标签页处于被选中状态，但暂时无法切换对应的显示内容，及其动态数据，故注解
//        $liTag.first().siblings().removeClass("active");
//        $liTag.first().addClass("active");
});


// 竖向标签页导航点击的数据请求加载
$('ul#nav-tabs a').click(function(){
    var aTagName = this.name;
//function(aTagName);
});