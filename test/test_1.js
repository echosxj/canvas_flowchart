/**
 * Created by xiaojia on 2017/6/16.
 */
function CanvasFlowChart(id,_config){
    var config=(_config instanceof Object)?_config:{};
    //ratio调整高清屏下canvas模糊问题
    this.ratio=1;
    //缩放
    this.scale=1.2;
    this.scaleCount=0;

    this.Canvas_lists = [];
    this.line_lists=[];
    this.startRect_lists=[];
    this.endRect_lists=[];
    this.canvas=document.getElementById(id);
    //this.context=this.canvas.getContext('2d');
    //在需要用context的地方用this.canvas.getContext('2d')
    //首页颜色
    this.firstRectColor=config.firstRectColor||'#ffb61e';
    this.rectInsideColor='#ffffff';
    this.rectOutsideColor='#48c0a3';
    //选中的颜色
    this.shadowColor=config.shadowBlur||'blue';
    this.shadowBlur=20;
    this.shadowOffsetX=10;
    this.shadowOffsetY=10;
    //canvas宽高
    this.canvasWidth=config.canvasWidth||800;
    this.canvasHeight=config.canvasHeight||500;
//图中button属性
    this.buttonName_lists=config.buttonName_lists||['修改信息'];
    this.buttonGap = (config.buttonGap||5);
    this.buttonWidth=(config.buttonWidth||60);
    this.buttonHeight=(config.buttonHeight||30);
    this.buttonMarginTop=(config.buttonMarginTop||40);
    this.buttonColor=config.buttonColor||'#48c0a3';
    this.buttonPadding=(config.buttonPadding||4);
//关闭按钮
    this.canvasCloseImg=new Image();
    this.canvasCloseImg.src=config.canvasCloseImg||'../public/img/close.png';
    this.closeButtonWith=(config.closeButtonWith||15);
    this.closeButtonMarginRight=(config.closeButtonMarginRight||20);
    this.closeButtonMarginTop=(config.closeButtonMarginTop||5);
//arrow image
    /*this.arrowImg=new Image();
     this.arrowImg.src=config.arrowImg||'../public/right.png';*/
    this.arrowImgWidth=(config.arrowImgWidth||15);
    this.cicleRadius = 8;
//区别mouseup和click
    this.moveFlag=false;
    this.clickFlag=false;
//判断是否可以画线
    this.canLineDraw=false;
//判断是否可以拖动
    this.isDragging = false;
//连线
    this.startRect=null;
    this.endRect=null;
    this.tmpPoint={x:null,y:null};
    this.lineGap=10;
//text
    this.textMarginLeft=(config.textMarginLeft||20);
    this.textMarginTop=(config.textMarginTop||50);
    this.textMarginTopWithoutFlowName=(config.textMarginTopWithoutFlowName||20);
    this.textGapHeight=(config.textGapHeight||20);

    this.flowNameMarginTop=(config.flowNameMarginTop||30);
    /*canvas_toolbar点击修改全局值*/
    this.canDragRect=true;
    this.canDrawLine=false;
    this.canDeleteLine=false;
//操作button
    this.canvas_btns=null;
    this.previousSelectedRect=null;


    this.testList=[
        {x: 10, y: 10, flowName:'初审', text: [{name:'是否会审', value: ['是'],something:'2131231'},{name:'审批人', value: ['王一', '李2']}],isCurrent:false},
        {x: 280, y: 10,flowName:'复审', text: [{name:'是否会审', value: ['是']},{name:'审批人', value: ['王一', '李2']}],isCurrent:false},
        {x: 540, y: 10,flowName:' ', text: [{name:'是否会审', value: ['是']},{name:'审批人', value: ['王一', '李2', '李2', '李2', '李2', '李2', '李2', '李2', '李2', '李2', '李2']}],isCurrent:true},
        {x: 260, y: 300,flowName:'111111111111111111111111111111111111111111111', text: [{name:'是否会审', value: ['是']},{name:'审批人', value: ['王一', '李2']}]},
        {x: 500, y: 300, text: [{name:'是否会审', value: ['是']},{name:'审批人', value: ['王一', '李2']}]},
    ];
    //给定text修改index=i的rect
    this.changeRectInfo=function (newText) {
        var text=newText||this.willReplaceRectText;
        if(newText){this.willReplaceRectText=newText};
        var _this=this;
        //添加确认
        /*/!*var _confirm=confirm('确认是否修改');*!/
         console.log('confirm',_this.confirm);
         var _confirm=null;
         if(!_this.confirm){
         _this.confirm=true;
         _confirm=confirm('确认是否修改');
         if(_confirm===true){
         if((text instanceof Array)&&text.length){
         console.log('changeText:',text);
         console.log('this old text,',this.Canvas_lists[_this.canvasInfoChangeIndex][text]);
         this.Canvas_lists[_this.canvasInfoChangeIndex].text=text;
         console.log('canvas_lists,',this.Canvas_lists);
         this.drawAll();
         this.initCanvas(this.Canvas_lists.slice(0));
         //初始化
         /!*this.canvasInfoChangeIndex=null;
         this.onchangedRectText=[{}];
         this.willReplaceRectText=[{}];*!/
         }else{
         alert('修改数据错误，信息应该为数组')
         }
         _this.confirm=false;
         }
         }
         //_this.confirm=confirm('确认是否修改');*/
        var _confirm=confirm('确认是否修改');
        if(_confirm){
            if((text instanceof Array)&&text.length){
                console.log('changeText:',text);
                console.log('this old text,',this.Canvas_lists[_this.canvasInfoChangeIndex][text]);
                this.Canvas_lists[_this.canvasInfoChangeIndex].text=text;
                console.log('canvas_lists,',this.Canvas_lists);
                this.drawAll();
                //this.initCanvas(this.Canvas_lists.slice(0));
                //初始化
                /*this.canvasInfoChangeIndex=null;
                 this.onchangedRectText=[{}];
                 this.willReplaceRectText=[{}];*/
            }else{
                alert('修改数据错误，信息应该为数组')
            }

        }
        _confirm=null;

        _this.drawAll();


    };
    //自定义按钮事件
    this.myClickEvent=function () {

    };
    this.canvasInfoChangeIndex=null; //被修改rect的index
    this.onchangedRectText=[]; //输出被修改rect的信息
    this.willReplaceRectText=[];//储存修改后rect的信息

    this.canvasListSort=[];
    // 是否为当前流程
    //放到rect里面
    //this.isCurrentPath=false;
    this.currentPathColor='#c93756';
    this.framePadding=5;

    //字体
    this.NameFontSize=18;
    this.NameFont='bold '+this.NameFontSize+'px sans-serif';
    this.ValueFontSize=13;
    this.ValueFont=this.ValueFontSize+'px sans-serif';
    this.flowNameFontSize=20;
    this.flowNameFont='bold '+this.flowNameFontSize+'px sans-serif';
    this.putCanvasBtnId=config.putCanvasBtnId||null;

    //只能观看
    this.onlyShow=(config.onlyShow==true)?true:false;

}

CanvasFlowChart.prototype={
    init:function (domId,dataArray) {
        this.canvas.width=this.canvasWidth;
        this.canvas.height=this.canvasHeight;
        var _this=this;
        _this.createButtonArea();
        _this.createDownloadArea();
        //btn添加属性
        this.canvas_btns =$('.canvas_btn');
        this.canvas_btns.on('click',function (e) {
            e=e||window.event;
            _this.addCanvasBtnChoosed(e);
        });

        //创建img


        //获取canvas

        var canvas=this.canvas;
        var context=this.canvas.getContext('2d');
        //修复retina高清屏幕问题
        this.setRatio(context);
        this.fixRetinaCanvas(canvas,context);

        /*mousedown move up out*/
        //鼠标事件

        canvas.onmousedown = function(e) {
            _this.moveFlag = true;
            _this.clickFlag = true;
            console.log('mousedown');
            _this.canvasClick(e);
            canvas.onmousemove = function (e) {
                _this.clickFlag = false;
                if (_this.isDragging == true) {
                    _this.dragRect(e);

                    canvas.onmouseup = function () {
                        console.log('drag stop');
                        _this.stopDragging();
                    };
                }
                if (_this.canLineDraw) {
                    _this.makeTmpLinePoint(e);
                    /*var moveX = e.pageX - canvas.offsetLeft;
                     var moveY = e.pageY - canvas.offsetTop;*/
                    canvas.onmouseup = function (e) {
                        var clickX = e.pageX - canvas.offsetLeft+_this.canvas.parentNode.scrollLeft;
                        var clickY = e.pageY - canvas.offsetTop+_this.canvas.parentNode.scrollTop;
                        var fixX=clickX*_this.ratio;
                        var fixY=clickY*_this.ratio;
                        var isInLeftRect=false;
                        for (var i = 0; i < _this.Canvas_lists.length; i++) {
                            var rect = _this.Canvas_lists[i];
                            //判断到达的Rect
                            var inRect = ((fixX-rect.x)>0)&&((fixX-rect.x)<rect.width)&&((fixY-rect.y)>0)&&((fixY-rect.y)<rect.height);
                            if (inRect) {
                                isInLeftRect = true;
                                (function (i) {
                                    if(_this.endRect_lists.indexOf(i)==-1) {_this.endRect = i;}
                                })(i);
                            }
                            ;
                        }
                        ;

                        if (isInLeftRect) {
                            if(_this.startRect_lists.indexOf(_this.startRect)==-1&&_this.endRect_lists.indexOf(_this.endRect)==-1&&_this.startRect!=_this.endRect&&_this.startRect!=null&&_this.endRect!=null){
                                _this.line_lists.push([_this.startRect, _this.endRect]);
                                _this.startRect_lists.push(_this.startRect);
                                _this.endRect_lists.push(_this.endRect);
                            }

                        }

                        console.log('draw line stop');
                        _this.canLineDraw = false;
                        _this.startRect = null;
                        _this.endRect = null;
                        _this.tmpPoint = {x: null, y: null};
                        _this.canvasInfoChangeIndex=null;
                        _this.drawAll();
                    };
                }


            };
            //button点击事件
            canvas.onmouseup = function (e) {
                var clickX = e.pageX - canvas.offsetLeft+_this.canvas.parentNode.scrollLeft;
                var clickY = e.pageY - canvas.offsetTop+_this.canvas.parentNode.scrollTop;
                var fixX=clickX*_this.ratio;
                var fixY=clickY*_this.ratio;
                if(_this.clickFlag) {
                    console.log('click true');
                    _this.canvasClickButton(e);
                    if(_this.canDeleteLine){
                        _this.deleteLine(fixX,fixY);
                    }
                } else{console.log('clickfalse')}
                _this.drawAll(fixX,fixY);
            };
        };
        canvas.onmouseout = function () {
            (_this.stopDragging)();
            _this.canLineDraw=false;
            _this.startRect=null;
            _this.endRect=null;
            _this.drawAll()
        };
    },
    createRectObj: function createRectObj(x, y, flowName, text,isCurrent) {
        var _this=this;
        var _num=0;
        var context=this.canvas.getContext('2d');
        var _tmptextwidth=0;
        context.save();
        context.font=_this.flowNameFont;
        var _tmpnamewidth=context.measureText(flowName).width;
        context.restore();
        var _tmpvaluewidth=0;
        var _tmpwidth=0;

        for(var _i=0;_i<text.length;_i++){
            var _v=text[_i].value;
            for(var _j=0;_j<_v.length;_j++){
                _num++;
                var _vw=Number(context.measureText(_v[_j]).width);
                if(_vw>_tmpwidth){
                    _tmpwidth=_vw;
                }
            }
        }
        _tmpwidth=_tmpnamewidth>_tmpwidth?_tmpnamewidth:_tmpwidth;
        var _scale=_this.scaleCount;
        var _iscurrent=isCurrent==true?true:false;
        var _height=text.length?((_num+text.length-1)*20+70+_this.textMarginTop):70+_this.textMarginTop;
        //text:[{name:'',value:['']}]
        var myscale=(_scale<0)?Math.pow((_this.scale),Math.abs(_scale)):Math.pow((1/_this.scale),Math.abs(_scale));

        console.log('scaled',myscale);
        return{
            x : x/myscale,
            y : y/myscale,
            flowName:flowName||"",  //(flowName||'流程名称'),
            text:text||[{name:'提示',value:'没有内容'}],
            color : '#e9f1f6',
            isSelected : false,
            width:((_tmpwidth>100?_tmpwidth:100)+2*_this.textMarginLeft+50)/myscale,
            /*height:height||150,*/
            height:_height/myscale,
            mx:0,
            my:0,
            canStartLine : false,
            changeText : function(_text) {
                text=_text;
            },
            isCurrent:_iscurrent,
        }
    },
    CanvasEventFalse:function () {
        this.canDragRect=false;
        this.canDrawLine=false;
        this.canDeleteLine=false;
    },
    addCanvasBtnChoosed:function (e){
        var _this=this;
        (function(){
            _this.canvas_btns.removeClass('canvas_btn_choosed').addClass('canvas_btn_unchoosed');
        })();
        console.log(e.target.nodeName.toLowerCase());
        if(e.target.nodeName.toLowerCase()=='button'){
            $(e.target).removeClass('canvas_btn_unchoosed').addClass('canvas_btn_choosed');
        }
        if(e.target.nodeName.toLowerCase()=='div'){
            $(e.target.parentNode).removeClass('canvas_btn_unchoosed').addClass('canvas_btn_choosed');
        }

    },
    toggleDragRect:function (e) {
        this.CanvasEventFalse();
        this.canDragRect=true;
        this.drawAll();
    },
    toggleDrawLine:function (e) {
        this.CanvasEventFalse();
        this.canDrawLine=true;
        this.drawAll();
    },
    toggleDeleteLine:function (e) {
        this.CanvasEventFalse();
        this.canDeleteLine=true;
        this.drawAll();
    },
    addRandomRect:function () {
        /*var _this=this;
         var myscale=_this.scaleCount<0?Math.pow((_this.scale),Math.abs(_this.scaleCount)):Math.pow((1/_this.scale),Math.abs(_this.scaleCount));_this.scaleCount=0;*/
        // 一个随机大小和位置
        var x = 300;
        var y = 200;

        // 一个随机颜色
        /* var colors = ["green", "blue", "red", "yellow", "magenta", "orange", "brown", "purple", "pink"];
         var color = colors[this.randomFromTo(0, 8)];*/

        var rect = this.createRectObj(x, y,'新增流程' ,[{name:'是否会审',value:' '},{name:'审批人',value:' '}]);
        // 把它保存在数组中
        this.Canvas_lists.push(rect);
        this.toggleDragRect();
        // 重新绘制画布
        this.drawAll();
    },
    clearCanvas:function () {
        this.Canvas_lists = [];
        this.line_lists = [];
        this.startRect_lists=[];
        this.endRect_lists=[];
        this.startRect=null;
        this.endRect = null;
        this.canvasInfoChangeIndex=null;
        this.changeScale(0);
        this.drawAll();
    },
    drawBg:function(){
        var context=this.canvas.getContext('2d');
        var _this=this;
        context.save();
        context.beginPath();
        context.fillStyle='#ffffff';
        context.fillRect(0,0,this.canvasWidth,this.canvasHeight);
        context.closePath();
        context.restore();
    },
    drawRects:function drawRects(x,y) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        // 清除画布，准备绘制
        //context.clearRect(0, 0, canvas.width, canvas.height);
        // 遍历所有rect
        for(var i=0; i<_this.Canvas_lists.length; i++) {
            var rect = _this.Canvas_lists[i];
            //画一个外框
            context.save();
            context.beginPath();
            context.moveTo(rect.x-_this.framePadding,rect.y);
            context.arcTo(rect.x-_this.framePadding,rect.y-_this.framePadding,rect.x,rect.y-_this.framePadding,this.framePadding);
            context.lineTo(rect.x+rect.width,rect.y-_this.framePadding);
            context.arcTo(rect.x+rect.width+_this.framePadding,rect.y-_this.framePadding,rect.x+rect.width+_this.framePadding,rect.y,_this.framePadding);
            context.lineTo(rect.x+rect.width+_this.framePadding,rect.y+rect.height);
            context.arcTo(rect.x+rect.width+_this.framePadding,rect.y+rect.height+_this.framePadding,rect.x+rect.width,rect.y+rect.height+_this.framePadding,_this.framePadding);
            context.lineTo(rect.x,rect.y+rect.height+_this.framePadding);
            context.arcTo(rect.x-_this.framePadding,rect.y+rect.height+_this.framePadding,rect.x-_this.framePadding,rect.y+rect.height,_this.framePadding);
            context.lineTo(rect.x-_this.framePadding,rect.y);
            /*if(rect.isCurrent){
             context.fillStyle=_this.currentPathColor;
             }else{
             context.fillStyle='#ffffff'
             }*/
            if(i==0){
                context.fillStyle=_this.firstRectColor;
            }
            else{
                context.fillStyle=_this.rectOutsideColor;
            }
            if(rect.isCurrent){
                context.fillStyle=_this.currentPathColor;
            }
            context.lineWidth=3;
            context.stroke();
            context.fill();
            context.closePath();
            context.restore();


            context.save();
            context.beginPath();
            context.lineWidth=1;
            context.rect(rect.x, rect.y, rect.width, rect.height);
            if(x&&y&&context.isPointInPath(x,y)){
                console.log('inRectPath');
                context.shadowBlur=_this.shadowBlur;
                context.shadowColor=_this.shadowColor;
                /* context.shadowOffsetX=_this.shadowOffsetX;
                 context.shadowOffsetY=_this.shadowOffsetY*/
            }else{
                if (_this.previousSelectedRect != null) {_this.previousSelectedRect.isSelected = false;}
            }
            if(rect.isSelected){
                context.shadowBlur=_this.shadowBlur;
                context.shadowColor=_this.shadowColor;
                /*context.shadowOffsetX=_this.shadowOffsetX;
                 context.shadowOffsetY=_this.shadowOffsetY*/
            }
            /*if(i==0){
             context.fillStyle = _this.firstRectColor;
             }else{
             context.fillStyle = rect.color;
             }*/
            context.fillStyle = _this.rectInsideColor;
            /*   if(rect.isCurrent){
             context.fillStyle = _this.currentPathColor;
             }*/
            context.strokeStyle = "black";
            context.fill();
            context.stroke();
            context.closePath();
            context.restore();


            context.save();
            context.beginPath();
            //左边圈
            /* if(i>0){
             context.save();
             context.beginPath();
             context.moveTo(rect.x, rect.y+rect.height/2);
             context.arc(rect.x-cicleRadius, rect.y+rect.height/2, cicleRadius, 0, Math.PI*2,true);
             context.closePath();
             context.restore();
             }*/

            //右边圈
            /* context.save();
             context.beginPath();
             context.moveTo(rect.x+rect.width+2*cicleRadius, rect.y+rect.height/2);
             context.arc(rect.x+rect.width+cicleRadius, rect.y+rect.height/2, cicleRadius, 0, Math.PI*2);
             context.closePath();
             context.restore();*/


            /* context.fillStyle = rect.color;
             context.strokeStyle = "black";
             if (rect.isSelected) {
             context.lineWidth = 3;
             } else {
             context.lineWidth = 1;
             }
             context.fill();
             context.stroke();*/
            context.closePath();

            //首个Rect有标识，同时放在endRect_lists内
            if(_this.endRect_lists.indexOf(0)==-1){
                _this.endRect_lists.push(0);
            }


            /*填充text*/
            context.save();
            context.beginPath();
            context.translate(rect.x,rect.y);
            context.fillStyle='black';
            var allValueNum=0;
            if(rect.text.length){
                for(var textObjIndex=0;textObjIndex<rect.text.length;textObjIndex++){
                    var textObj=rect.text[textObjIndex];
                    //对每个textObj进行渲染
                    context.save();
                    context.save();

                    context.save();
                    context.font=_this.flowNameFont;
                    var flowNameWith=context.measureText(rect.flowName).width;
                    if(flowNameWith>(rect.width-2*_this.textMarginLeft)) {
                        var scaled = flowNameWith/(rect.width-2*_this.textMarginLeft);
                        context.scale(1/scaled,1/scaled);
                    }
                    context.fillText(rect.flowName,rect.width/2-flowNameWith/2,_this.flowNameMarginTop);
                    context.restore();
                    var _textMarginTop=rect.flowName?_this.textMarginTop:_this.textMarginTopWithoutFlowName;
                    context.font=_this.NameFont;
                    var _name=textObj.name+' : ';
                    var nameWidth=context.measureText(_name).width;
                    context.restore();
                    var valueWidth=0;
                    for(var valueIndex=0;valueIndex<textObj.value.length;valueIndex++){
                        allValueNum++;
                        if(valueIndex==0){
                            context.save();
                            context.font=_this.NameFont;
                            context.fillText(_name,_this.textMarginLeft,_textMarginTop+_this.textGapHeight*(allValueNum));
                            context.restore();
                        }
                        context.save();
                        context.font=_this.ValueFont;
                        var _tmpvalueWidth=context.measureText(String(textObj.value[valueIndex]));
                        if(_tmpvalueWidth>valueWidth){valueWidth=_tmpvalueWidth}
                        context.fillText(String(textObj.value[valueIndex]),_this.textMarginLeft+Number(nameWidth),_textMarginTop+_this.textGapHeight*(allValueNum));
                        context.restore();
                    }


                    var textWidth=nameWidth+valueWidth;
                    if(textWidth>(rect.width-2*_this.textMarginLeft)) {
                        var scaled = textWidth/(rect.width-2*_this.textMarginLeft);
                        context.scale(scaled,scaled);
                        console.log(scaled);
                    }



                    context.restore();

                    //考虑画线
                    context.save();
                    context.beginPath();
                    context.lineWidth=1;
                    context.moveTo(_this.textMarginLeft,_textMarginTop+_this.textGapHeight*(allValueNum+0.5));
                    context.lineTo(rect.width-_this.textMarginLeft,_textMarginTop+_this.textGapHeight*(allValueNum+0.5));
                    context.fillStyle='black';
                    context.closePath();
                    context.stroke();
                    context.restore();

                    allValueNum++;
                }
            }else{
                context.fillText('没有信息：',_this.textMarginLeft,_this.textMarginTop+_this.textGapHeight);
            }
            context.closePath();

            /*制作button*/
            //button位置
            // button之间的间隔是5
            /*var buttonName_lists=['删除上连接','删除下连接','修改信息'];
             var buttonGap = 5,buttonWidth=70,buttonHeight=30;*/
            _this.buttonName_lists.map(function (item,index) {
                context.save();
                context.beginPath();
                context.translate(rect.width-(_this.buttonGap*(index+1)+_this.buttonWidth*(index+1)),rect.height-_this.buttonMarginTop);
                context.fillStyle=_this.buttonColor;
                context.rect(0,0,_this.buttonWidth,_this.buttonHeight);
                context.fill();
                context.closePath();
                //button字
                context.fillStyle='black';
                context.font=_this.ValueFont;
                //context.fillText(item,5,20);
                context.translate(0,_this.buttonHeight/2);
                context.save();
                var textWidth=context.measureText(item).width;
                var btnwidth=_this.buttonWidth-2*_this.buttonPadding;
                if(_this.scaleCount<0){
                    if(textWidth>btnwidth){
                        var scaled=btnwidth/textWidth;
                        context.scale(scaled,scaled);
                    }
                }
                context.fillText(item,_this.buttonPadding,_this.buttonPadding);
                context.restore();
                context.restore();
            });

            //画close按钮
            context.save();
            context.beginPath();
            //var closeButtonWith=15,closeButtonMarginRight=20,closeButtonMarginTop=5;
            context.drawImage(_this.canvasCloseImg,rect.width-_this.closeButtonMarginRight,_this.closeButtonMarginTop,_this.closeButtonWith,_this.closeButtonWith);
            context.closePath();
            context.restore();
            context.restore();
            context.restore();
        }
    },
    drawLine:function (x,y){
        //draw from line_lists
        var x=x,y=y;
        var context=this.canvas.getContext('2d');
        var _this=this;
        for(var i=0; i<_this.line_lists.length; i++) {
            var line = _this.line_lists[i];
            var rect1=_this.Canvas_lists[line[0]];//右边圈
            var rect2=_this.Canvas_lists[line[1]];//左边圈
            var rect1x=rect1.x+rect1.width+_this.cicleRadius;
            var rect1y=rect1.y+rect1.height/2;
            var rect2x=rect2.x-_this.cicleRadius;
            var rect2y=rect2.y+rect2.height/2;
            var choosed=false;

            //判断选中
            context.save();
            context.beginPath();
            context.moveTo(rect1x, rect1y);
            if(rect1x<=rect2x){
                context.lineTo(rect1x,rect1y-5);
                context.lineTo((rect1x+rect2x)/2+5,rect1y-5);
                context.lineTo((rect1x+rect2x)/2+5,rect2y-5);
                context.lineTo(rect2x,rect2y-5);
                context.lineTo(rect2x,rect2y+5);
                context.lineTo((rect1x+rect2x)/2-5,rect2y+5);
                context.lineTo((rect1x+rect2x)/2-5,rect1y+5);
                context.lineTo(rect1x,rect1y+5);
            }else{
                context.lineTo(rect1x,rect1y-5);
                context.lineTo(rect1x+_this.lineGap+5,rect1y-5);
                context.lineTo(rect1x+_this.lineGap+5,(rect1y+rect2y)/2-5);
                context.lineTo(rect2x-_this.lineGap+5,(rect1y+rect2y)/2-5);
                context.lineTo(rect2x-_this.lineGap+5,rect2y-5);
                context.lineTo(rect2x,rect2y-5);
                context.lineTo(rect2x,rect2y+5);
                context.lineTo(rect2x-_this.lineGap-5,rect2y+5);
                context.lineTo(rect2x-_this.lineGap-5,(rect1y+rect2y)/2+5);
                context.lineTo(rect1x+_this.lineGap-5,(rect1y+rect2y)/2+5);
                context.lineTo(rect1x+_this.lineGap-5,rect1y+5);
                context.lineTo(rect1x,rect1y+5);
            }
            context.lineTo(rect1x,rect1y);
            if(context.isPointInPath(x,y)&&x&&y){
                choosed=true;
            }
            context.closePath();
            context.restore();


            context.save();
            context.beginPath();
            context.moveTo(rect1x, rect1y);
            //根据不同的坐标来实现不同的line
            /**/
            if(rect1x<=rect2x){
                context.lineTo((rect1x+rect2x)/2,rect1y);
                context.lineTo((rect1x+rect2x)/2,rect2y);
            }else{
                context.lineTo(rect1x+_this.lineGap,rect1y);
                context.lineTo(rect1x+_this.lineGap,(rect1y+rect2y)/2);
                context.lineTo(rect2x-_this.lineGap,(rect1y+rect2y)/2);
                context.lineTo(rect2x-_this.lineGap,rect2y);
            }
            /**/

            context.lineTo(rect2x,rect2y);
            //画箭头
            context.lineTo(rect2x-5,rect2y-5);
            context.lineTo(rect2x-5,rect2y+5);
            context.lineTo(rect2x,rect2y);

            context.lineWidth=10;//这个是选择的宽度
            context.fillStyle='black';
            /* var _x=Number(x),_y=Number(y);
             console.log(context.isPointInPath(x,y));
             if(x&&y&&(context.isPointInStroke(_x,_y))){
             context.shadowBlur=10;
             context.shadowColor="blue";
             //context.fill();
             }*/
            if(choosed){
                context.shadowBlur=_this.shadowBlur/2;
                context.shadowColor="blue";
            }
            //context.strokeStyle = "black";
            context.lineJoin="round";
            context.lineWidth = 3;
            // context.drawImage(_this.arrowImg,rect2x-10,rect2y-_this.arrowImgWidth/2,_this.arrowImgWidth,_this.arrowImgWidth);
            //context.fill();
            context.stroke();
            context.closePath();
            context.restore();
        }
    },
    drawTmpLine:function (){
        var _this=this;
        var context=_this.canvas.getContext('2d');
        if(_this.startRect!=null&&_this.tmpPoint.x&&_this.tmpPoint.y){
            console.log('has _this.tmpPoint');
            var _startRect =_this.Canvas_lists[_this.startRect];
            context.beginPath();
            context.moveTo(_startRect.x+_startRect.width/2,_startRect.y+_startRect.height/2);
            context.lineTo(_this.tmpPoint.x,_this.tmpPoint.y);
            context.lineWidth=3;
            context.stroke();
            context.closePath();
        }
    },
    deleteLine:function (x,y){
        //draw from line_lists
        var _this=this;
        var context=this.canvas.getContext('2d');
        context.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(var i=0; i<_this.line_lists.length; i++) {
            var line = _this.line_lists[i];
            var rect1=_this.Canvas_lists[line[0]];//右边圈
            var rect2=_this.Canvas_lists[line[1]];//左边圈
            context.save();
            context.beginPath();
            var rect1x=rect1.x+rect1.width+_this.cicleRadius;
            var rect1y=rect1.y+rect1.height/2;
            var rect2x=rect2.x-_this.cicleRadius;
            var rect2y=rect2.y+rect2.height/2;
            context.moveTo(rect1x, rect1y);

            //根据不同的坐标来实现不同的line
            /*context.lineTo((rect1x+rect2x)/2,rect1y);
             context.lineTo((rect1x+rect2x)/2,rect2y);*/
            if(rect1x<=rect2x){
                context.lineTo(rect1x,rect1y-5);
                context.lineTo((rect1x+rect2x)/2+5,rect1y-5);
                context.lineTo((rect1x+rect2x)/2+5,rect2y-5);
                context.lineTo(rect2x,rect2y-5);
                context.lineTo(rect2x,rect2y+5);
                context.lineTo((rect1x+rect2x)/2-5,rect2y+5);
                context.lineTo((rect1x+rect2x)/2-5,rect1y+5);
                context.lineTo(rect1x,rect1y+5);
            }else{
                context.lineTo(rect1x,rect1y-5);
                context.lineTo(rect1x+_this.lineGap+5,rect1y-5);
                context.lineTo(rect1x+_this.lineGap+5,(rect1y+rect2y)/2-5);
                context.lineTo(rect2x-_this.lineGap+5,(rect1y+rect2y)/2-5);
                context.lineTo(rect2x-_this.lineGap+5,rect2y-5);
                context.lineTo(rect2x,rect2y-5);
                context.lineTo(rect2x,rect2y+5);
                context.lineTo(rect2x-_this.lineGap-5,rect2y+5);
                context.lineTo(rect2x-_this.lineGap-5,(rect1y+rect2y)/2+5);
                context.lineTo(rect1x+_this.lineGap-5,(rect1y+rect2y)/2+5);
                context.lineTo(rect1x+_this.lineGap-5,rect1y+5);
                context.lineTo(rect1x,rect1y+5);
            }
            context.lineTo(rect1x,rect1y);
            context.lineTo(rect2x,rect2y);
            if(context.isPointInPath(x,y)&&x&&y){
                var _startNum=_this.startRect_lists.indexOf(line[0]);
                var _endNum=_this.endRect_lists.indexOf(line[1]);
                _this.startRect_lists.splice(_startNum,1);
                _this.endRect_lists.splice(_endNum,1);
                _this.line_lists.splice(i,1);
                context.closePath();
                context.restore();
            }
            /*if(x&&y&&context.isPointInStroke(x,y)){
             var _startNum=_this.startRect_lists.indexOf(line[0]);
             var _endNum=_this.endRect_lists.indexOf(line[1]);
             _this.startRect_lists.splice(_startNum,1);
             _this.endRect_lists.splice(_endNum,1);
             _this.line_lists.splice(i,1);
             context.closePath();
             context.restore();
             return
             }*/
            context.closePath();
            context.restore();
        }
        this.drawAll();

    },
    drawAll:function (x,y){
        var context=this.canvas.getContext('2d');
        var _this=this;
        context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        this.drawBg();
        this.drawLine(x,y);
        this.drawRects(x,y);
        this.drawTmpLine();
    },
    canvasClick:function (e) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        // 取得画布上被单击的点
        var clickX = e.pageX - this.canvas.offsetLeft+_this.canvas.parentNode.scrollLeft;
        var clickY = e.pageY - this.canvas.offsetTop+_this.canvas.parentNode.scrollTop;
        var fixX=clickX*_this.ratio;
        var fixY=clickY*_this.ratio;
        //判断是否在矩形内，是=》矩形可拖拽
        for(var i=_this.Canvas_lists.length-1; i>=0; i--) {
            var rect = _this.Canvas_lists[i];
            //计算是否在该矩形内部
            var inRect = ((fixX-rect.x)>0)&&((fixX-rect.x)<rect.width)&&((fixY-rect.y)>0)&&((fixY-rect.y)<rect.height);
            if (inRect) {
                console.log('inRect');
                /*在Rect内部 如果选项是选择，则拖拽状态为true*/
                if(_this.canDragRect){
                    if (_this.previousSelectedRect != null) {_this.previousSelectedRect.isSelected = false;}
                    rect.mx = fixX - rect.x;
                    rect.my = fixY - rect.y;
                    _this.previousSelectedRect = rect;

                    rect.isSelected = true;

                    _this.isDragging = true;

                    _this.drawAll(fixX,fixY);

                    return;
                }
                /*在Rect内部 如果选项是连线，则连线*/
                if(_this.canDrawLine){
                    _this.canLineDraw = true;
                    console.log('mousedown function && candrawline');
                    // i值因为闭包需要匿名执行
                    (function (i) {
                        if(_this.startRect_lists.indexOf(i)==-1){
                            _this.startRect = i;
                            console.log('this.startRect',i);
                        }
                    })(i);
                }

                /*如果选项是删除连线，则删除*/


                /*之前的*/
                /*if (this.previousSelectedRect != null) {this.previousSelectedRect.isSelected = false;}
                 rect.mx = clickX - rect.x;
                 rect.my = clickY - rect.y;
                 this.previousSelectedRect = rect;
                 rect.isSelected = true;
                 this.isDragging = true;
                 drawAll(x,y);
                 return;*/
            }
        }
        //判断是否在圆圈内，
        /* for(var i=this.Canvas_lists.length-1; i>=0; i--) {
         var rect = this.Canvas_lists[i];
         //判断左边圆圈
         var distanseLeftCicle = Math.sqrt(Math.pow(rect.x - this.cicleRadius - clickX, 2)
         + Math.pow(rect.y + rect.height/2 - clickY, 2));
         if(distanseLeftCicle<=this.cicleRadius){
         console.log('distanse left')
         };
         //判断右边边圆圈
         var distanseRightCicle = Math.sqrt(Math.pow(rect.x + rect.width + this.cicleRadius - clickX, 2)
         + Math.pow(rect.y + rect.height/2 - clickY, 2));
         if(distanseRightCicle<=this.cicleRadius){
         console.log('distanse right');
         this.canLineDraw = true;
         //目前先只支持右圆圈指向左圆圈
         // i值因为闭包需要匿名执行
         (function (i) {
         if(this.startRect_lists.indexOf(i)==-1){
         this.startRect = i;
         console.log('this.startRect',i);
         }
         })(i)
         }
         }*/
    },
    canvasClickButton:function (e) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        // 取得画布上被单击的点
        var clickX = e.pageX - this.canvas.offsetLeft+_this.canvas.parentNode.scrollLeft;
        var clickY = e.pageY - this.canvas.offsetTop+_this.canvas.parentNode.scrollTop;
        var fixX=clickX*_this.ratio;
        var fixY=clickY*_this.ratio;
        //判断是否在矩形内，是=》矩形可拖拽
        for(var i=_this.Canvas_lists.length-1; i>=0; i--) {
            var rect = _this.Canvas_lists[i];
            //计算是否在该矩形内部
            var inRect = ((fixX-rect.x)>0)&&((fixX-rect.x)<rect.width)&&((fixY-rect.y)>0)&&((fixY-rect.y)<rect.height);
            if (inRect) {
                if (_this.previousSelectedRect != null) {_this.previousSelectedRect.isSelected = false;}
                rect.isSelected = true;
                _this.previousSelectedRect = rect;
                _this.isDragging = false;
                //判断rect中的button
                //var this.buttonGap = 5,this.buttonWidth=70,this.buttonHeight=30;this.buttonMarginTop=50;
                for(var index=0;index<_this.buttonName_lists.length;index++){
                    var buttonX=rect.width-(_this.buttonGap*(index+1)+_this.buttonWidth*(index+1))+rect.x;
                    var buttonY=rect.height-_this.buttonMarginTop+rect.y;
                    if(fixX>buttonX&&(fixX<(buttonX+_this.buttonWidth))&&(fixY>buttonY)&&(fixY<(buttonY+_this.buttonHeight))){
                        console.log(i);//第几个rect
                        console.log(index);//第i个rect的第index个button
                        /*console.log(this.buttonName_lists[index]);
                         console.log(this.Canvas_lists[i].text);*/
                        switch (index){
                            /* case 0: button1Click(i);return;break;
                             case 1: button2Click(i);return;break;
                             case 2: button3Click(i);return;break;*/
                            /*case 0: button1Click(i);return;break;
                             case 1: button2Click(i);return;break;
                             case 2: button3Click(i);return;break;*/
                            case 0:_this.button3Click(i);return;break;
                            default: break;
                        }
                    }
                }
                //判断close按钮
                //var this.closeButtonWith=15,this.closeButtonMarginRight=20,this.closeButtonMarginTop=5;
                var closeX=rect.x+rect.width-_this.closeButtonMarginRight;
                var closeY=rect.y+_this.closeButtonMarginTop;
                if((fixX-closeX)>=0&&(fixX-closeX)<=_this.closeButtonWith&&(fixY-closeY)>=0&&(fixY-closeY)<=_this.closeButtonWith){
                    _this.buttonCloseClick(i);
                }
                _this.drawAll(fixX,fixY);
                return;
            }
        }

    },
//buttonclick处理
    /*button1Click:function (i){
     //删除i的左连接
     for(var index=0;index<this.line_lists.length;index++){
     var lines=this.line_lists[index];
     if(lines[1]==i){
     console.log('delete left line of Canvas_list-'+i);
     //删除this.line_lists
     this.line_lists.splice(index,1);
     //删除start和this.endRect_lists
     this.startRect_lists.splice(this.startRect_lists.indexOf(lines[0]),1);
     this.endRect_lists.splice(this.endRect_lists.indexOf(lines[1]),1);
     drawAll();
     return;
     }
     }
     },
     button2Click:function (i) {
     var context=this.canvas.getContext('2d');
     var _this=this;
     //删除i的右连接
     for(var index=0;index<this.line_lists.length;index++){
     var lines=this.line_lists[index];
     if(lines[0]==i){
     console.log('delete right line of Canvas_list-'+i);
     //删除this.line_lists
     this.line_lists.splice(index,1);
     //删除start和this.endRect_lists
     this.startRect_lists.splice(this.startRect_lists.indexOf(lines[0]),1);
     this.endRect_lists.splice(this.endRect_lists.indexOf(lines[1]),1);
     drawAll();
     return;
     }
     }
     },*/
    button3Click:function (i) {
        console.log('button3click:'+i);
        this.canvasInfoChangeIndex=i;
        this.onchangedRectText=this.Canvas_lists[i].text.slice(0);//把数据传出去
        this.myClickEvent();
        //var newData=this.changeRectInfo();//拿到后续处理的数据
        //console.log('newData',newData);
        /*this.Canvas_lists[i].text=newData;
         console.log('canvas_lists,',this.Canvas_lists);
         this.drawAll();
         this.initCanvas(this.Canvas_lists.slice(0));*/

        //this.PromiseTest();
    },
    buttonCloseClick:function (i) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        _this.Canvas_lists.splice(i,1);
        for(var indexLeft=0;indexLeft<_this.line_lists.length;indexLeft++){
            var lines=_this.line_lists[indexLeft];
            if(lines[1]==i){
                console.log('delete left line of Canvas_list-'+i);
                //删除start和_this.endRect_lists
                _this.startRect_lists.splice(_this.startRect_lists.indexOf(lines[0]),1);
                _this.endRect_lists.splice(_this.endRect_lists.indexOf(lines[1]),1);
                //删除_this.line_lists
                _this.line_lists.splice(indexLeft,1);
            }
        }
        for(var indexRight=0;indexRight<_this.line_lists.length;indexRight++){
            var lines=_this.line_lists[indexRight];
            if(lines[0]==i){
                console.log('delete right line of Canvas_list-'+i);

                //删除start和_this.endRect_lists
                _this.startRect_lists.splice(_this.startRect_lists.indexOf(lines[0]),1);
                /*new_startRect_list_Right=_this.startRect_lists.map(function(item){
                 if(item>i){
                 return item-1;
                 }
                 else{
                 return item
                 }
                 });*/
                _this.endRect_lists.splice(_this.endRect_lists.indexOf(lines[1]),1);
                // new_endRect_list_Right=_this.endRect_lists.map()
                //删除_this.line_lists
                _this.line_lists.splice(indexRight,1);
            }
        }

        //因为_this.Canvas_lists删除对象index会变化，所以需要对_this.line_lists进行调整
        var new_line_lists=[];
        for(var index=0;index<_this.line_lists.length;index++){
            var _lines=_this.line_lists[index].map(function (item) {
                if(item>i){
                    return item-1;
                }
                else{
                    return item
                }
            });
            new_line_lists.push(_lines);
        }
        _this.line_lists=new_line_lists;
        //startRect_list调整

        _this.startRect_lists=_this.startRect_lists.map(function (item) {
            if(item>i){
                return item-1;
            }
            else{
                return item
            }
        });

        _this.endRect_lists=_this.endRect_lists.map(function (item) {
            if(item>i){
                return item-1;
            }
            else{
                return item
            }
        });



        this.drawAll();
    },
//在某个范围内生成随机数
    randomFromTo:function (from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    },
    stopDragging:function () {
        this.isDragging = false;
    },
    dragRect:function (e) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        // 判断是否开始拖拽
        if (this.isDragging == true) {
            // 判断拖拽对象是否存在
            if (this.previousSelectedRect != null) {
                // 取得鼠标位置
                var clickX = e.pageX - this.canvas.offsetLeft+_this.canvas.parentNode.scrollLeft;
                var clickY = e.pageY - this.canvas.offsetTop+_this.canvas.parentNode.scrollTop;
                var fixX=clickX*_this.ratio;
                var fixY=clickY*_this.ratio;
                this.previousSelectedRect.x = fixX - this.previousSelectedRect.mx;
                this.previousSelectedRect.y = fixY - this.previousSelectedRect.my;

                // 更新画布
                this.drawAll(fixX,fixY);
            }
        }
    },
//这个可以放到drwaLine里面 因为需要clearRect
    makeTmpLinePoint:function (e) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        if(this.canLineDraw=true){
            var moveX = e.pageX - this.canvas.offsetLeft+_this.canvas.parentNode.scrollLeft;
            var moveY = e.pageY - this.canvas.offsetTop+_this.canvas.parentNode.scrollTop;

            var fixX=moveX*_this.ratio;
            var fixY=moveY*_this.ratio;

            this.tmpPoint.x = fixX;
            this.tmpPoint.y = fixY;
            this.drawAll()
        }
    },
    initCanvas:function (rect_array){
        var _this=this;
        this.startRect_lists=[];
        this.endRect_lists=[];
        this.Canvas_lists=[];
        this.line_lists=[];
        rect_array.forEach(function (item,index) {
            var _newItem=_this.createRectObj(item.x,item.y,item.flowName,item.text,item.isCurrent);
            _this.Canvas_lists.push(_newItem);
            if(index<(rect_array.length-1)){
                _this.line_lists.push([index,index+1]);
                _this.startRect_lists.push(index);
                _this.endRect_lists.push(index+1);
            }
        });

        _this.drawAll()
    },
    getcanvasListSort:function(){
        var _this=this;
        var _tmp_line_lists=this.line_lists.slice(0);
        var _tmpSort=[];
        var _currentNum=0;
        var whileCount=0;
        var line_lists_length=this.line_lists.length;
        if(_tmp_line_lists.length==0){
            _tmpSort=[0]
        }else{

            while(whileCount<line_lists_length){
                for(var _i=0;_i<_tmp_line_lists.length;_i++){
                    var lines=_tmp_line_lists[_i];
                    if(lines[0]==_currentNum){
                        _tmpSort.push(lines[0]);
                        _currentNum=lines[1];
                        _tmp_line_lists.splice(_i,1);
                        if(_tmp_line_lists.length<1){
                            //_tmpSort.push(_currentNum);
                            //break;
                        }
                        console.log('11111')
                    }
                    console.log('222')
                }

                whileCount++;
            }
            /*   while(_tmp_line_lists.length>0){
             for(var _i=0;_i<_tmp_line_lists.length;_i++){
             var lines=_tmp_line_lists[_i];
             if(lines[0]==_currentNum){
             _tmpSort.push(lines[0]);
             _currentNum=lines[1];
             _tmp_line_lists.splice(_i,1);
             if(_tmp_line_lists.length<1){
             _tmpSort.push(_currentNum);
             break;
             }
             }
             }
             }*/
            console.log('sort');
            _tmpSort.push(_currentNum);
            //var _i=0;
            /* do{
             var tmp=_tmp_line_lists.filter(function(item){
             return item[0]==_currentNum
             });
             var getline=tmp[0];
             if(tmp.length!=0){
             console.log('getline');
             _tmpSort.push(getline[0]);
             _currentNum=getline[1];
             }else{
             // break;
             }
             _currentNum=tmp[1];
             _i++;
             }while(_i<_tmp_line_lists.length);*/
            /*  for(var _i=0;_i<_tmp_line_lists.length;_i++){
             /!* var tmp=_tmp_line_lists.filter(function(item){
             return item[0]==_currentNum
             });
             var getline=tmp[0];
             if(tmp.length!=0){
             console.log('getline');
             _tmpSort.push(getline[0]);
             _currentNum=getline[1];
             }else{
             // break;
             }
             _currentNum=tmp[1];*!/
             console.log(1)
             }*/
        }
        console.log(_tmpSort)
        this.canvasListSort=_tmpSort;
    },
    outputData:function (){
        var _this=this;
        this.getcanvasListSort();
        var _tmpSort=this.canvasListSort.slice(0);

        console.log(_tmpSort);
        //return _tmpSort;
        var _tmp_Canvas_lists=_this.Canvas_lists.slice(0);
        var dataLists=[];
        _tmpSort.forEach(function (item) {
            dataLists.push(_tmp_Canvas_lists[item])
        });
        console.log(dataLists);
        //return dataLists;
        var correct=(_this.Canvas_lists.length==_tmpSort.length)?true:false;
        if(correct){
            return dataLists;
        }else{
            if(_this.Canvas_lists.length!=0){alert('存在流程框无连线');}
            else{
                alert('无流程');
            }
            return []
        }

    },
//调整高清屏下canvas模糊问题
    setRatio:function (ctx) {
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStorePixelRatio = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        this.ratio = devicePixelRatio / backingStorePixelRatio;

    },
    fixRetinaCanvas:function(canvas, ctx) {
        if (this.ratio > 1) {
            canvas.style.height = this.canvasHeight + 'px';
            canvas.style.width = this.canvasWidth + 'px';
            canvas.width *= this.ratio;
            canvas.height *= this.ratio;
            /* ctx.scale(this.ratio,this.ratio);*/
            //ctx.scale(3,3);
        }
    },
    PromiseTest:function () {
        var _this=this;
        return new Promise(function (resolve,reject) {
            alert('123');
            console.log('onchangeRectText',_this.onchangedRectText);
            resolve(_this.onchangedRectText);
        }).then(function (data) {
            alert(data);
            $('#canvas_btn_changeInfo').show();
            $('#canvas_btn_changeInfo').on('click',function (e) {
                var newData=_this.changeRectInfo();//拿到后续处理的数据
                return newData
            })
        },function (err) {
            console.log(err)
        })
            .then(function (data) {
                _this.Canvas_lists[_this.canvasInfoChangeIndex].text=data;
                _this.drawAll();
            })
    },
    //创建按钮区域
    createButtonArea: function(){
        var btnString='<div id="canvas_toolbar"> <button id="canvas_btn_toggleDragRect" class="canvas_btn" title="选择流程或连线" ><div></div></button> <button id="canvas_btn_toggleDrawLine" class="canvas_btn" title="连线"  ><div></div></button> <button id="canvas_btn_toggleDeleteLine" class="canvas_btn" title="删除连线" ><div></div></button> <button id="canvas_btn_addRect" class="canvas_btn" title="新增流程框" ><div></div></button><button id="canvas_btn_autoSort" class="canvas_btn" title="自动排序" ><div></div></button> <button id="canvas_btn_clearAll" class="canvas_btn" title="清空流程图" ><div></div></button> <button id="canvas_btn_test" class="canvas_btn"  title="快速生成模板"><div></div></button> <button id="canvas_btn_outputData" class="canvas_btn" title="输出流程信息"><div></div></button><button id="canvas_btn_enlarge" class="canvas_btn" title="放大图片"><div></div></button><button id="canvas_btn_shrink" class="canvas_btn" title="缩小图片"><div></div></button> <button id="canvas_btn_recovery" class="canvas_btn" title="恢复图片"><div></div></button><button id="canvas_btn_saveImg" class="canvas_btn" title="保存图片"><div></div></button> <button id="canvas_btn_addHeight" class="canvas_btn" title="增加区域高度"><div></div></button><button id="canvas_btn_reduceHeight" class="canvas_btn" title="减小区域高度"><div></div></button> </button> <button id="canvas_btn_addWidth" class="canvas_btn" title="增加区域宽度"><div></div></button><button id="canvas_btn_reduceWidth" class="canvas_btn" title="减小区域宽度"><div></div></button> </button> </div>';
        if(this.putCanvasBtnId==null){
            $(btnString).insertAfter($(this.canvas));
        }else{
            console.log($('#'+this.putCanvasBtnId))
            $('#'+this.putCanvasBtnId).append($(btnString))
        }

        var _this=this;
        $('#canvas_btn_test').on('click',function () {
            _this.initCanvas(c.testList);
        });
        $('#canvas_btn_addRect').on('click',function () {
            _this.addRandomRect();
        });
        $('#canvas_btn_clearAll').on('click',function () {
            _this.clearCanvas();
        });
        $('#canvas_btn_toggleDragRect').on('click',function () {
            _this.toggleDragRect();
        });
        $('#canvas_btn_toggleDrawLine').on('click',function () {
            _this.toggleDrawLine();
        });
        $('#canvas_btn_toggleDeleteLine').on('click',function () {
            _this.toggleDeleteLine();
        });
        $('#canvas_btn_outputData').on('click',function () {
            var data=_this.outputData();
            //var data='1';
            $('#showData').text(String(data));
        });
        $('#canvas_btn_saveImg').on('click',function () {
            _this.savaAsJPEG();
        });
        $('#canvas_btn_addHeight').on('click',function(){
            _this.addCanvasHeight();
        });
        $('#canvas_btn_reduceHeight').on('click',function(){
            _this.reduceCanvasHeight();
        });
        $('#canvas_btn_addWidth').on('click',function(){
            _this.addCanvasWidth();
        });
        $('#canvas_btn_reduceWidth').on('click',function(){
            _this.reduceCanvasWidth();
        });
        $('#canvas_btn_autoSort').on('click',function(){
            _this.autoSort();
        });
        $('#canvas_btn_enlarge').on('click',function(){
            _this.changeScale(1)
        });
        $('#canvas_btn_shrink').on('click',function(){
            _this.changeScale(-1)
        });
        $('#canvas_btn_recovery').on('click',function(){
            _this.changeScale(0)
        })
    },
    //保存图片
    createDownloadArea:function(){
        var _this=this;
        $('<a id="downloadCanvasImg" href="" download="canvasImg.jpeg" style="display: none"> <img id="canvasImg" src="" alt="" style="display: none"> </a>').insertAfter(_this.canvas)
    },
    savaAsJPEG:function () {
        var image = document.getElementById('canvasImg');
        var download = document.getElementById('downloadCanvasImg');
        var imgData=this.canvas.toDataURL("image/jpeg");
        image.src = imgData;
        download.href= imgData;
        download.click();
    },

    //宽度可以自己调节
    addCanvasWidth:function () {
        var canvas=this.canvas;
        var context=this.canvas.getContext('2d');
        var _this=this;
        _this.canvasWidth=_this.canvasWidth+500;
        this.canvas.width=this.canvasWidth;
        this.canvas.height=this.canvasHeight;
        this.fixRetinaCanvas(canvas,context);
        this.drawAll();
    },
    reduceCanvasWidth:function () {
        var canvas=this.canvas;
        var context=this.canvas.getContext('2d');
        var _this=this;
        _this.canvasWidth=_this.canvasWidth<=800?800:_this.canvasWidth-500;
        this.canvas.width=this.canvasWidth;
        this.canvas.height=this.canvasHeight;
        this.fixRetinaCanvas(canvas,context);
        this.drawAll()
    },

    //高度可以自己调节
    addCanvasHeight:function () {
        var canvas=this.canvas;
        var context=this.canvas.getContext('2d');
        var _this=this;
        _this.canvasHeight=_this.canvasHeight+200;
        this.canvas.width=this.canvasWidth;
        this.canvas.height=this.canvasHeight;
        this.fixRetinaCanvas(canvas,context);
        this.drawAll();
    },
    reduceCanvasHeight:function () {
        console.log('reduce height');
        var canvas=this.canvas;
        var context=this.canvas.getContext('2d');
        var _this=this;
        this.canvas.width=this.canvasWidth;
        _this.canvasHeight=_this.canvasHeight==500?500:_this.canvasHeight-200;
        this.canvas.height=this.canvasHeight;
        this.fixRetinaCanvas(canvas,context);
        this.drawAll()
    },

    //自动排序成图
    autoSort:function () {
        var _this=this;
        var _heightLists=[0,0,0];
        this.getcanvasListSort();

        var _tmpIndexList=[];
        var _length=this.Canvas_lists.length;
        for(var _i=0;_i<_length;_i++){
            _tmpIndexList.push(_i);
        }

        console.log(_tmpIndexList);
        console.log(_this.canvasListSort);

        _this.canvasListSort.map(function (rectIndex,index) {
            var item=_this.Canvas_lists[rectIndex];
            var _x=(index)%3;
            item.x=_x*(item.width)+50*(_x+1);
            var _y=Math.floor((index)/3);
            item.y=_heightLists[_x]+(_y)*50+20;
            _heightLists[_x]+=item.height;
        });
        /*_this.Canvas_lists.forEach(function (item,index) {
         var _x=(index)%3;
         item.x=_x*(item.width)+50*(_x+1);
         var _y=Math.floor((index)/3);
         /!*item.y=(_y*(item.height)+50*(_y+1);*!/
         item.y=_heightLists[_x]+(_y)*50+20;
         _heightLists[_x]+=item.height;
         });*/
        var indexLists=_tmpIndexList.filter(function (item) {
            return _this.canvasListSort.indexOf(item)==-1
        });
        var sortlength=_this.canvasListSort.length;
        if(indexLists.length>0){
            console.log(indexLists);
            indexLists.forEach(function(item_index,index){
                var item=_this.Canvas_lists[item_index];
                var _x=(index+sortlength)%3;
                item.x=_x*(item.width)+50*(_x+1);
                var _y=Math.floor((index+sortlength)/3);
                item.y=_heightLists[_x]+(_y)*50+20;
                _heightLists[_x]+=item.height;
            })
        }

        _this.drawAll();
    },

    //调整scale缩放
    changeScale:function (option) {
        //option为操作   -1 是缩小  0是恢复 是放大
        var _this=this;
        var myscale;
        switch(option){
            case -1:myscale=_this.scale;_this.scaleCount-=1;break;
            case 1:myscale=1/_this.scale;_this.scaleCount+=1;break;
            case 0:myscale=_this.scaleCount<0?Math.pow((1/_this.scale),Math.abs(_this.scaleCount)):Math.pow((_this.scale),Math.abs(_this.scaleCount));_this.scaleCount=0;break;
            default:break;
        }
        this.buttonGap /=myscale;
        this.buttonWidth/=myscale;
        this.buttonHeight/=myscale;
        this.buttonMarginTop/=myscale;
        this.closeButtonWith/=myscale;
        this.closeButtonMarginRight/=myscale;
        this.closeButtonMarginTop/=myscale;
        this.arrowImgWidth/=myscale;
        this.cicleRadius /= myscale;
        this.lineGap/=myscale;
        this.textMarginLeft/=myscale;
        this.textMarginTop/=myscale;
        this.textGapHeight/=myscale;
        this.NameFontSize/=myscale;
        this.NameFont='bold '+this.NameFontSize+'px sans-serif';
        this.ValueFontSize/=myscale;
        this.ValueFont=this.ValueFontSize+'px sans-serif';
        this.flowNameFontSize/=myscale;
        this.flowNameFont='bold '+this.flowNameFontSize+'px sans-serif';
        this.framePadding/=myscale;
        this.buttonPadding/=myscale;
        this.shadowBlur/=myscale;
        this.shadowOffsetX/=myscale;
        this.shadowOffsetY/=myscale;
        this.flowNameMarginTop/=myscale;
        //给所有rect内x,y进行修改
        this.Canvas_lists.forEach(function(item){
            item.x/=myscale;
            item.y/=myscale;
            item.width/=myscale;
            item.height/=myscale;
        });
        this.drawAll();

    }
};