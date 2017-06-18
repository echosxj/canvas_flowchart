/**
 * Created by xj on 2017/6/16.
 */
/**
 * Created by xiaojia on 2017/6/16.
 */
function CanvasFlowChart(id,config){
    this.Canvas_lists = [];
    this.line_lists=[];
    this.startRect_lists=[];
    this.endRect_lists=[];
    this.canvas=document.getElementById(id);
    //this.context=this.canvas.getContext('2d');
    //在需要用context的地方用this.canvas.getContext('2d')
    //首页颜色
    this.firstRectColor='yellow';
    this.canvasWidth=800;
    this.canvasHeight=500;
//图中button属性
    this.buttonName_lists=['修改信息','1'];
    this.buttonGap = 5;
    this.buttonWidth=70;
    this.buttonHeight=30;
    this.buttonMarginTop=40;
//关闭按钮
    this.canvasCloseImg=new Image();
    this.canvasCloseImg.src='../public/close.png';
    this.closeButtonWith=15;
    this.closeButtonMarginRight=20;
    this.closeButtonMarginTop=5;
//arrow image
    this.arrowImg=new Image();
    this.arrowImg.src='../public/right.png';
    this.arrowImgWidth=15;
    this.cicleRadius = 1;
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
    this.textMarginLeft=20;
    this.textMarginTop=20;
    this.textGapHeight=20;
    /*canvas_toolbar点击修改全局值*/
    this.canDragRect=true;
    this.canDrawLine=false;
    this.canDeleteLine=false;
//操作button
    this.canvas_btns=null;

    this.previousSelectedRect=null;
    this.canvasInfoChangeIndex=null;
    this.testList=[
        {x: 10, y: 10, text: [{name:'test', value: ['王一', '李2']},{name:'test', value: ['王一', '李2']},{name:'test', value: ['王一', '李2']}]},
        {x: 250, y: 10, text: [{name:'2131', value: ['王一']}]},
        {x: 100, y: 200, text: [{name:'dsa', value: ['王一', '李2','1231231']}]},
        {x: 500, y: 200, text: [{name:'tesssst', value: ['王一', '李2']}]},
        {x: 500, y: 350, text: [{name:'tessdat', value: ['王一', '李2']}]},
    ];
    this.changeRectInfo=function () {
        return [{name:'changeRectInfo', value: ['test']},{name:'test', value: ['王一', '李2']}]
    };
    this.onchangedRect=null;
}

CanvasFlowChart.prototype={
    init:function (domId,dataArray) {
        this.canvas.width=this.canvasWidth;
        this.canvas.height=this.canvasHeight;
        var _this=this;
        //btn添加属性
        this.canvas_btns =$('.canvas_btn');
        this.canvas_btns.on('click',function (e) {
            e=e||window.event;
            _this.addCanvasBtnChoosed(e);
        });

        //创建DOM对象

        //获取canvas

        var canvas=this.canvas;
        var context=this.canvas.getContext('2d');
        //修复retina高清屏幕问题


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
                        var clickX = e.pageX - canvas.offsetLeft;
                        var clickY = e.pageY - canvas.offsetTop;
                        var isInLeftRect=false;
                        for (var i = 0; i < _this.Canvas_lists.length; i++) {
                            var rect = _this.Canvas_lists[i];
                            //判断到达的Rect
                            var inRect = ((clickX-rect.x)>0)&&((clickX-rect.x)<rect.width)&&((clickY-rect.y)>0)&&((clickY-rect.y)<rect.height);
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
                var clickX = e.pageX - canvas.offsetLeft;
                var clickY = e.pageY - canvas.offsetTop;
                if(_this.clickFlag) {
                    console.log('click true');
                    _this.canvasClickButton(e);
                    if(_this.canDeleteLine){
                        _this.deleteLine(clickX,clickY);
                    }
                } else{console.log('clickfalse')}
                _this.drawAll(clickX,clickY);
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
    createRectObj : function createRectObj(x, y, text, color,width,height) {
        var _num=0;
        for(var _i=0;_i<text.length;_i++){
            var _v=text[_i].value;
            for(var _j=0;_j<_v.length;_j++){
                _num++
            }
        }
        var _height=text.length?(_num*20+100):100;
        //text:[{name:'',value:['']}]
        return{
            x : x,
            y : y,
            /* text:{
             //是否会审
             shouldChecked:text.shouldChecked||true,
             //审批人名单
             checkPersonList:text.checkPersonList||[]
             },*/
            text:text||[{name:'提示',value:'没有内容'}],
            color : color||'#e9f1f6',
            isSelected : false,
            width:width||230,
            /*height:height||150,*/
            height:_height,
            mx:0,
            my:0,
            canStartLine : false,
            changeText : function(_text) {
                text=_text;
            }
        }
    },
    CanvasEventFalse:function () {
        this.canDragRect=false;
        this.canDrawLine=false;
        this.canDeleteLine=false;
    },
    addCanvasBtnChoosed:function (e){
        this.canvas_btns.removeClass('canvas_btn_choosed').addClass('canvas_btn_unchoosed');
        $(e.target).removeClass('canvas_btn_unchoosed').addClass('canvas_btn_choosed');
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
        // 一个随机大小和位置
        var x = this.randomFromTo(this.canvas.width/4, 3*this.canvas.width/4);
        var y = this.randomFromTo(this.canvas.height/4, 3*this.canvas.height/4);

        // 一个随机颜色
        var colors = ["green", "blue", "red", "yellow", "magenta", "orange", "brown", "purple", "pink"];
        var color = colors[this.randomFromTo(0, 8)];

        var rect = this.createRectObj(x, y, [{name:'random',value:'123'}]);
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
        this.startRect=null;
        this.endRect = null;
        this.canvasInfoChangeIndex=null;
        this.drawAll();
    },
    drawRects:function drawRects(x,y) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        // 清除画布，准备绘制
        //context.clearRect(0, 0, canvas.width, canvas.height);
        // 遍历所有rect
        for(var i=0; i<_this.Canvas_lists.length; i++) {
            var rect = _this.Canvas_lists[i];
            context.save();
            context.beginPath();
            context.lineWidth=1;
            context.rect(rect.x, rect.y, rect.width, rect.height);
            if(x&&y&&context.isPointInPath(x,y)){
                console.log('inRectPath');
                context.shadowBlur=20;
                context.shadowColor='blue'
            }

            if(i==0){
                context.fillStyle = _this.firstRectColor;
            }else{
                context.fillStyle = rect.color;
            }
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
            /* context.save();
             context.beginPath();
             context.translate(rect.x+NumCicleRadius+3,rect.y+NumCicleRadius+3);
             var NumCicleRadius=8;
             context.arc(0,0,NumCicleRadius,0,Math.PI*2,true);
             context.closePath();
             context.font='bold 10px Arial';
             context.textAlign='center';
             context.textBaseline='middle';
             context.fillStyle='blue';
             context.fillText(String(i+1),0,0);
             context.stroke();
             context.restore();*/



            /*填充text*/
            context.save();
            context.beginPath();
            context.translate(rect.x,rect.y);
            context.font='10px';
            //context.textAlign='center';
            //context.textBaseline='middle';
            context.fillStyle='black';
            /*var checkedInfo=rect.text.shouldChecked?'是':'否';
             //var textMarginLeft=20,textMarginTop=20,textGapHeight=20;
             context.fillText('是否会审：'+checkedInfo,textMarginLeft,textMarginTop);
             if(rect.text.checkPersonList.length){
             for(var _p=0;_p<rect.text.checkPersonList.length;_p++){
             var checkPersons=rect.text.checkPersonList[_p];
             _p==0?context.fillText('参评人员：'+checkPersons,textMarginLeft,textMarginTop+textGapHeight*(_p+1)):context.fillText('                  '+checkPersons,textMarginLeft,textMarginTop+textGapHeight*(_p+1));
             }
             }else{
             context.fillText('参评人员：',textMarginLeft,textMarginTop+textGapHeight);
             }*/
            var allValueNum=0;
            if(rect.text.length){
                for(var textObjIndex=0;textObjIndex<rect.text.length;textObjIndex++){
                    var textObj=rect.text[textObjIndex];
                    //对每个textObj进行渲染
                    var _name=textObj.name+' : ';
                    var nameWidth=context.measureText(_name).width;
                    for(var valueIndex=0;valueIndex<textObj.value.length;valueIndex++){
                        allValueNum++;
                        if(valueIndex==0){
                            context.fillText(_name,_this.textMarginLeft,_this.textMarginTop+_this.textGapHeight*(allValueNum))
                        }
                        context.fillText(String(textObj.value[valueIndex]),_this.textMarginLeft+Number(nameWidth),_this.textMarginTop+_this.textGapHeight*(allValueNum))
                    }


                    /* textObjIndex==0?context.fillText('参评人员：'+checkPersons,textMarginLeft,textMarginTop+textGapHeight*(textObjIndex+1)):context.fillText('                  '+checkPersons,textMarginLeft,textMarginTop+textGapHeight*(textObjIndex+1));*/
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
                context.fillStyle='#21a675';
                context.rect(0,0,_this.buttonWidth,_this.buttonHeight);
                context.fill();
                context.closePath();
                //button字
                context.fillStyle='black';
                context.font='10px Arial';
                context.fillText(item,5,20);
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
            /**/
            context.restore();
        }
    },
    drawLine:function (x,y){
        //draw from line_lists
        var context=this.canvas.getContext('2d');
        var _this=this;
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
            context.fillStyle='black';
            console.log(context.isPointInStroke(x,y));
            if(x&&y&&context.isPointInStroke(x,y)){
                context.shadowBlur=10;
                context.shadowColor="blue";
                //context.fill();
            }
            //context.strokeStyle = "black";
            context.lineJoin="round";
            context.lineWidth = 3;
            context.drawImage(_this.arrowImg,rect2x-10,rect2y-_this.arrowImgWidth/2,_this.arrowImgWidth,_this.arrowImgWidth);
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
                context.lineTo((rect1x+rect2x)/2,rect1y);
                context.lineTo((rect1x+rect2x)/2,rect2y);
            }else{
                context.lineTo(rect1x+_this.lineGap,rect1y);
                context.lineTo(rect1x+_this.lineGap,(rect1y+rect2y)/2);
                context.lineTo(rect2x-_this.lineGap,(rect1y+rect2y)/2);
                context.lineTo(rect2x-_this.lineGap,rect2y);
            }

            context.lineTo(rect2x,rect2y);
            console.log(context.isPointInStroke(x,y));
            if(x&&y&&context.isPointInStroke(x,y)){
                var _startNum=_this.startRect_lists.indexOf(line[0]);
                var _endNum=_this.endRect_lists.indexOf(line[1]);
                _this.startRect_lists.splice(_startNum,1);
                _this.endRect_lists.splice(_endNum,1);
                _this.line_lists.splice(i,1);
                context.closePath();
                context.restore();
                return
            }
            context.closePath();
            context.restore();
        }
        this.drawAll();

    },
    drawAll:function (x,y){
        var context=this.canvas.getContext('2d');
        var _this=this;
        context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        this.drawLine(x,y);
        this.drawRects(x,y);
        this.drawTmpLine();
    },
    canvasClick:function (e) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        // 取得画布上被单击的点
        var clickX = e.pageX - this.canvas.offsetLeft;
        var clickY = e.pageY - this.canvas.offsetTop;
        console.log('canvasClick,',clickX,clickY);
        //判断是否在矩形内，是=》矩形可拖拽
        for(var i=_this.Canvas_lists.length-1; i>=0; i--) {
            var rect = _this.Canvas_lists[i];
            //计算是否在该矩形内部
            var inRect = ((clickX-rect.x)>0)&&((clickX-rect.x)<rect.width)&&((clickY-rect.y)>0)&&((clickY-rect.y)<rect.height);
            if (inRect) {
                /*在Rect内部 如果选项是选择，则拖拽状态为true*/
                if(_this.canDragRect){
                    if (_this.previousSelectedRect != null) {_this.previousSelectedRect.isSelected = false;}
                    rect.mx = clickX - rect.x;
                    rect.my = clickY - rect.y;
                    _this.previousSelectedRect = rect;

                    rect.isSelected = true;

                    _this.isDragging = true;

                    _this.drawAll(clickX,clickY);

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
        var clickX = e.pageX - this.canvas.offsetLeft;
        var clickY = e.pageY - this.canvas.offsetTop;
        //判断是否在矩形内，是=》矩形可拖拽
        for(var i=_this.Canvas_lists.length-1; i>=0; i--) {
            var rect = _this.Canvas_lists[i];
            //计算是否在该矩形内部
            var inRect = ((clickX-rect.x)>0)&&((clickX-rect.x)<rect.width)&&((clickY-rect.y)>0)&&((clickY-rect.y)<rect.height);
            if (inRect) {
                rect.isSelected = true;
                _this.isDragging = false;
                //判断rect中的button
                //var this.buttonGap = 5,this.buttonWidth=70,this.buttonHeight=30;this.buttonMarginTop=50;
                for(var index=0;index<_this.buttonName_lists.length;index++){
                    var buttonX=rect.width-(_this.buttonGap*(index+1)+_this.buttonWidth*(index+1))+rect.x;
                    var buttonY=rect.height-_this.buttonMarginTop+rect.y;
                    if(clickX>buttonX&&(clickX<(buttonX+_this.buttonWidth))&&(clickY>buttonY)&&(clickY<(buttonY+_this.buttonHeight))){
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
                if((clickX-closeX)>=0&&(clickX-closeX)<=_this.closeButtonWith&&(clickY-closeY)>=0&&(clickY-closeY)<=_this.closeButtonWith){
                    _this.buttonCloseClick(i);
                }
                _this.drawAll(clickX,clickY);
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
        this.onchangedRectText=this.Canvas_lists[i].text;//把数据传出去
        var newData=this.changeRectInfo();//拿到后续处理的数据
        this.Canvas_lists[i].text=newData;
        this.drawAll();
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
                var x = e.pageX - this.canvas.offsetLeft;
                var y = e.pageY - this.canvas.offsetTop;
                this.previousSelectedRect.x = x - this.previousSelectedRect.mx;
                this.previousSelectedRect.y = y - this.previousSelectedRect.my;

                // 更新画布
                this.drawAll(x,y);
            }
        }
    },
//这个可以放到drwaLine里面 因为需要clearRect
    makeTmpLinePoint:function (e) {
        var context=this.canvas.getContext('2d');
        var _this=this;
        if(this.canLineDraw=true){
            var moveX = e.pageX - this.canvas.offsetLeft;
            var moveY = e.pageY - this.canvas.offsetTop;
            this.tmpPoint.x = moveX;
            this.tmpPoint.y = moveY;
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
            var _newItem=_this.createRectObj(item.x,item.y,item.text);
            _this.Canvas_lists.push(_newItem);
            if(index<(rect_array.length-1)){
                _this.line_lists.push([index,index+1]);
                _this.startRect_lists.push(index);
                _this.endRect_lists.push(index+1)
            }
        });

        _this.drawAll()
    },
    outputData:function (){
        var _this=this;
        var _tmp_line_lists=this.line_lists.slice(0);
        var _tmpSort=[];
        var _currentNum=0;
        while(_tmp_line_lists.length>0){
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
        }

        console.log(_tmpSort);
        //return _tmpSort;
        var _tmp_Canvas_lists=_this.Canvas_lists.slice(0);
        var dataLists=[];
        _tmpSort.forEach(function (item) {
            dataLists.push(_tmp_Canvas_lists[item])
        })
        console.log(dataLists)
        // return dataLists;
    }
};



//调整高清屏下canvas模糊问题
function fixRetinaCanvas(canvas, ctx) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStorePixelRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;


    var ratio = devicePixelRatio / backingStorePixelRatio;


    if (ratio > 1) {
        canvas.style.height = canvas.height + 'px';
        canvas.style.width = canvas.width + 'px';
        canvas.width *= ratio;
        canvas.height *= ratio;
    }

}