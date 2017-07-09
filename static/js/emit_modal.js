$(function(){
    // 原料采购模态框的触发事件
    $("button.emit-modal-material-purchase").click(function(){
        $("#modal-material-purchase").modal("show");
    });
    // 开炉登记模态框的触发事件
    $("button.emit-modal-blowon").click(function(){
        $("#modal-blowon").modal("show");
    });
    // 胚料登记模态框的触发事件
    $("button.emit-modal-blank").click(function(){
        $("#modal-blank").modal("show");
    });
    // 产品产出登记模态框的触发事件
    $("button.emit-modal-product-produce").click(function(){
        $("#modal-product-produce").modal("show");
    });
    // 出库登记模态框的触发事件
    $("button.emit-modal-out-storage").click(function(){
        $("#modal-out-storage").modal("show");
    });
    // 产品型号登记模态框的触发事件
    $("button.emit-modal-product-model").click(function(){
        $("#modal-product-model").modal("show");
    });
    // 入库登记模态框的触发事件
    $("button.emit-modal-in-storage").click(function(){
        $("#modal-in-storage").modal("show");
    });
    // 订单登记模态框的触发事件
    $("button.emit-modal-add-order").click(function(){
        $("#modal-add-order").modal("show");
    });
    // "其他清仓"模态框的触发事件
    $("button.emit-modal-check-warehouse-others").click(function(){
        $("#modal-check-warehouse-others").modal("show");
    });
    // "产品清仓"模态框的触发事件
    $("button.emit-modal-check-warehouse-product").click(function(){
        $("#modal-check-warehouse-product").modal("show");
    });
    // 配送登记模态框的触发事件
    $("button.emit-modal-warehouse-delivery").click(function(){
        $("#modal-warehouse-delivery").modal("show");
    });
    //提交确认的模态框的触发事件
    $("button.emit-modal-confirm").click(function(){
        $("#modal-confirm").modal("show");
    });
})
