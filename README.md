# xj_Canvas_Flowchart



    
     new CanvasFlowChart(canvasId,config)

    
     自己配置
     config={
        //name:value，
        canvasWidth:300,
        buttonColor:'red',
     }
     配置参数
     //首页颜色
     firstRectColor||'yellow';
     //选中的颜色
     shadowBlur||'blue';
     //canvas宽高
     canvasWidth||800;
     canvasHeight||500;
     //图中button属性
     buttonName_lists||['修改信息'];
     buttonGap||5;
     buttonWidth||70;
     buttonHeight||30;
     buttonMarginTop||40;
     buttonColor||'#21a675';
     //关闭按钮
     canvasCloseImg||'../public/close.png';
     closeButtonWith||15;
     closeButtonMarginRight||20;
     closeButtonMarginTop||5;
     //arrow image
     arrowImg||'../public/right.png';
     arrowImgWidth||15;
     //text
     textMarginLeft||20;
     textMarginTop||20;
     textGapHeight||20;


     *内部调用函数
     init()初始化
     changeRectInfo()修改当前点击rect内的信息
     myClickEvent()自定义点击rect内按钮的事件
     initCanvas(array)根据array来初始化canvas，需要先init（）,
     clearCanvas()清空画布
     addRandomRect()生成随机位置的rect
     toggleDragRect();选择拖拽功能
     toggleDrawLine();选择划线功能
     toggleDeleteLine();选择删线功能


     *
     数据类型
      text:[
            {name:'1',value:[{data:''}]},
            {name:'1',value:[{data:''},{data:''}]},
         ]
     *
     


     使用举例（test/test.html）
    var c=new CanvasFlowChart('canvas_flowchart');
    c.init();
    $('#canvas_btn_test').on('click',function () {
        c.initCanvas(c.testList);
    });
    $('#canvas_btn_addRect').on('click',function () {
        c.addRandomRect();
    });
    $('#canvas_btn_clearAll').on('click',function () {
        c.clearCanvas();
    });
    $('#canvas_btn_toggleDragRect').on('click',function () {
        c.toggleDragRect();
    });
    $('#canvas_btn_toggleDrawLine').on('click',function () {
        c.toggleDrawLine();
    });
    $('#canvas_btn_toggleDeleteLine').on('click',function () {
        c.toggleDeleteLine();
    });
    $('#canvas_btn_outputData').on('click',function () {
        var data=c.outputData();
        //var data='1';
        $('#showData').text(String(data));
    });

    c.myClickEvent=function () {
        $('#changeArea').show();
        $('#changeRectBtn').one ('click',function () {
            c.willReplaceRectText= [{
                name:$('#changeRectName').val(),
                value:[$('#changeRectValue').val()]
            }];
            c.changeRectInfo();
            $('#changeArea').hide();
        });
        //c.onchangedRect=null;

    };