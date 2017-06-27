/**
 * Created by pnf01 on 2017/6/22.
 */
var jsondata={
    "handleClass": "com.pnf.flow.PackageAuditHandler",
    "opRound": 0,
    "createrName": null,
    "flowTitle": "标段审批测试-会签",
    "companyId": null,
    "createTime": null,
    "flowTag": null,
    "objId": null,
    "details": null,
    "createrId": null,
    "flowId": "82c1d437-c5ea-4901-a1cf-43e2e6238e88",
    "listStep": [
        {
            "listOperator": [
                {
                    "operatorName": "肖睿",
                    "operatorId": "c4c66516-9bca-4ca0-b000-d3cbf5c9c739"
                },
                {
                    "operatorName": "左浩",
                    "operatorId": "yg001"
                }
            ],
            "userCount": 2,
            "stepTitle": "初审",
            "name": "1",
            "signType": "USign",
            "id": "2d580ff2-c6e1-4b06-ab35-048e4741c619"
        },
        {
            "listOperator": [
                {
                    "operatorName": "左浩",
                    "operatorId": "yg001"
                },
                {
                    "operatorName": "肖睿",
                    "operatorId": "c4c66516-9bca-4ca0-b000-d3cbf5c9c739"
                }
            ],
            "userCount": 2,
            "stepTitle": "复审",
            "name": "2",
            "signType": "USign",
            "id": "cfc4e9b7-2a38-40d4-a8d9-40303c072e91"
        }
    ],
    "status": 0
};

//var data=JSON.parse(jsondata);
console.log(jsondata.handleClass);

//将数据转换成canvas的画图数据
function convertDataToCanvas(data){

}

//需要存入的是
var listStep=[];




var c=new CanvasFlowChart('canvas_flowchart',{
    putCanvasBtnId:'put_canvas_btn',
});
c.init();
c.myClickEvent=function () {
    $('#changeArea').show();
};
$('#changeRectBtn').on ('click',function () {
    var newdata=[{
        name:$('#changeRectName').val(),
        value:[{data:$('#changeRectValue').val()}]
    }];
    c.changeRectInfo(newdata);
    $('#changeArea').hide();
});


/*
c.onchangedRectText*/
