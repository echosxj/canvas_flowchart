/**
 * Created by xiaojia on 2017/6/16.
 */
function CanvasFlowChart(config){
    this.Canvas_lists = [];
    this.line_lists=[];
    this.startRect_lists=[];
    this.endRect_lists=[];
    this.canvas=document.getElementById("canvas_flowchart");
    this.context=this.canvas.getContext('2d');
    this.canvasWidth=800;
    this.canvasHeight=500;
//图中button属性
    this.buttonName_lists=['删除左连接','删除右连接','修改信息'];
    this.buttonGap = 5;
    this.buttonWidth=70;
    this.buttonHeight=30;
    this.buttonMarginTop=40;
//关闭按钮
    this.canvasCloseImg=new Image();
    this.canvasCloseImg.src='./close.png';
    this.closeButtonWith=15;
    this.closeButtonMarginRight=20;
    this.closeButtonMarginTop=5;
//arrow image
    this.arrowImg=new Image();
    this.arrowImg.src='./right.png';
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
        {x: 10, y: 10, text: {shouldChecked: true, checkPersonList: ['王一', '李2']}},
        {x: 250, y: 10, text: {shouldChecked: true, checkPersonList: ['王一']}},
        {x: 100, y: 200, text: {shouldChecked: true, checkPersonList: ['王一', '李2','1233123']}},
        {x: 500, y: 200, text: {shouldChecked: true, checkPersonList: ['王一']}},
        {x: 500, y: 350, text: {shouldChecked: true, checkPersonList: ['王一']}},
    ]
}

CanvasFlowChart.prototype={
    init:function (domId,dataArray) {
        var _this=this;
        //创建DOM对象
        var buttonDomString='<div id="canvas_toolbar"> <button id="canvas_btn_toggleDragRect" class="canvas_btn" >选择</button> <button id="canvas_btn_toggleDrawLine" class="canvas_btn" >连线</button> <button id="canvas_btn_toggleDeleteLine" class="canvas_btn">删除</button> <button class="canvas_btn" ">添加圆圈</button> <button class="canvas_btn" >清空画布</button> <button class="canvas_btn" onclick="">测试</button> </div>';
        /*var canvasDomString='<div id="canvas_area"><canvas id="canvas_flowchart" class="canvas_style" width="'+_this.canvasWidth+'" height="'+ _this.canvasHeight +'"> </canvas> </div>';*/
        $('#'+domId).append(buttonDomString);


        //添加按钮事件
        _this.canvas_btns=$('.canvas_btn');
        _this.canvas_btns.on('click',function (e) {
            e=e||window.event;
            _this.addCanvasBtnChoosed(e);
        });
        _this.canvas_btns[0].onclick=_this.toggleDragRect;
        _this.canvas_btns[1].onclick=_this.toggleDrawLine;
        _this.canvas_btns[2].onclick=_this.toggleDeleteLine;
        _this.canvas_btns[3].onclick=_this.addRandomRect;
        _this.canvas_btns[4].onclick=_this.clearCanvas;
/*        _this.canvas_btns[0].on('click',_this.toggleDragRect);
        _this.canvas_btns[1].on('click',_this.toggleDrawLine);
        _this.canvas_btns[2].on('click',_this.toggleDeleteLine);
        _this.canvas_btns[3].on('click',_this.addRandomRect);
        _this.canvas_btns[4].on('click',_this.clearCanvas);*/


        //获取canvas
        _this.canvas = document.getElementById("canvas_flowchart");
        _this.context = document.getElementById("canvas_flowchart").getContext("2d");
        //鼠标事件
        var canvas=_this.canvas;
        var context=_this.context;
        /*mousedown move up out*/
        canvas.onmousedown = function(e) {
            _this.moveFlag = true;
            _this.clickFlag = true;
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
    createRectObj : function (x, y, text, color,width,height) {
    var _height=text.checkPersonList?(text.checkPersonList.length*20+100):100;
    return{
        x : x,
        y : y,
        text:{
            //是否会审
            shouldChecked:text.shouldChecked||true,
            //审批人名单
            checkPersonList:text.checkPersonList||[]
        },
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

    var rect = this.createRectObj(x, y, 'test');
    // 把它保存在数组中
    this.Canvas_lists.push(rect);

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
    drawRects:function (x,y) {
    var firstRectColor='yellow';
    // 遍历所有rect
    for(var i=0; i<this.Canvas_lists.length; i++) {
        var rect = this.Canvas_lists[i];
        this.context.save();
        this.context.beginPath();
        this.context.lineWidth=1;
        this.context.rect(rect.x, rect.y, rect.width, rect.height);
        if(x&&y&&this.context.isPointInPath(x,y)){
            console.log('inRectPath');
            this.context.shadowBlur=20;
            this.context.shadowColor='blue'
        }

        if(i==0){
            this.context.fillStyle = firstRectColor;
        }else{
            this.context.fillStyle = rect.color;
        }
        this.context.strokeStyle = "black";
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
        this.context.restore();
        this.context.save();
        this.context.beginPath();
        this.context.closePath();
        //首个Rect有标识，同时放在endRect_lists内
        if(this.endRect_lists.indexOf(0)==-1){
            this.endRect_lists.push(0);
        }
        /*填充text*/
        this.context.save();
        this.context.beginPath();
        this.context.translate(rect.x,rect.y);
        this.context.font='bold 10px Arial';
        //this.context.textAlign='center';
        //this.context.textBaseline='middle';
        this.context.fillStyle='black';
        var checkedInfo=rect.text.shouldChecked?'是':'否';
        //var this.textMarginLeft=20,this.textMarginTop=20,this.textGapHeight=20;
        this.context.fillText('是否会审：'+checkedInfo,this.textMarginLeft,this.textMarginTop);
        if(rect.text.checkPersonList.length){
            for(var _p=0;_p<rect.text.checkPersonList.length;_p++){
                var checkPersons=rect.text.checkPersonList[_p];
                _p==0?this.context.fillText('参评人员：'+checkPersons,this.textMarginLeft,this.textMarginTop+this.textGapHeight*(_p+1)):this.context.fillText('                  '+checkPersons,this.textMarginLeft,this.textMarginTop+this.textGapHeight*(_p+1));
            }
        }else{
            this.context.fillText('参评人员：',this.textMarginLeft,this.textMarginTop+this.textGapHeight);
        }
        this.context.closePath();


        /*制作button*/
        //button位置
        // button之间的间隔是5
        /*var this.buttonName_lists=['删除上连接','删除下连接','修改信息'];
         var this.buttonGap = 5,this.buttonWidth=70,this.buttonHeight=30;*/
        this.buttonName_lists.map(function (item,index) {
            this.context.save();
            this.context.beginPath();
            this.context.translate(this.buttonGap*(index+1)+this.buttonWidth*index,rect.height-this.buttonMarginTop);
            this.context.fillStyle='#21a675';
            this.context.rect(0,0,this.buttonWidth,this.buttonHeight);
            this.context.fill();
            this.context.closePath();
            //button字
            this.context.fillStyle='black';
            this.context.font='10px Arial';
            this.context.fillText(item,5,20);
            this.context.restore();
        });

        //画close按钮
        this.context.save();
        this.context.beginPath();
        //var this.closeButtonWith=15,this.closeButtonMarginRight=20,this.closeButtonMarginTop=5;
        this.context.drawImage(this.canvasCloseImg,rect.width-this.closeButtonMarginRight,this.closeButtonMarginTop,this.closeButtonWith,this.closeButtonWith);
        this.context.closePath();
        this.context.restore();


        this.context.restore();
        /**/
        this.context.restore();
    }
},
    drawLine:function (x,y){
    //draw from line_lists
    for(var i=0; i<this.line_lists.length; i++) {
        var line = this.line_lists[i];
        var rect1=this.Canvas_lists[line[0]];//右边圈
        var rect2=this.Canvas_lists[line[1]];//左边圈
        this.context.save();
        this.context.beginPath();
        var rect1x=rect1.x+rect1.width+this.cicleRadius;
        var rect1y=rect1.y+rect1.height/2;
        var rect2x=rect2.x-this.cicleRadius;
        var rect2y=rect2.y+rect2.height/2;
        this.context.moveTo(rect1x, rect1y);

        //根据不同的坐标来实现不同的line

        /**/
        if(rect1x<=rect2x){
            this.context.lineTo((rect1x+rect2x)/2,rect1y);
            this.context.lineTo((rect1x+rect2x)/2,rect2y);
        }else{
            this.context.lineTo(rect1x+this.lineGap,rect1y);
            this.context.lineTo(rect1x+this.lineGap,(rect1y+rect2y)/2);
            this.context.lineTo(rect2x-this.lineGap,(rect1y+rect2y)/2);
            this.context.lineTo(rect2x-this.lineGap,rect2y);
        }
        /**/

        this.context.lineTo(rect2x,rect2y);
        this.context.fillStyle='black';
        console.log(this.context.isPointInStroke(x,y));
        if(x&&y&&this.context.isPointInStroke(x,y)){
            this.context.shadowBlur=10;
            this.context.shadowColor="blue";
            //this.context.fill();
        }
        //this.context.strokeStyle = "black";
        this.context.lineJoin="round";
        this.context.lineWidth = 3;
        this.context.drawImage(this.arrowImg,rect2x-10,rect2y-this.arrowImgWidth/2,this.arrowImgWidth,this.arrowImgWidth);
        this.context.stroke();
        this.context.closePath();
        this.context.restore();
    }
},
    drawTmpLine:function (){
    if(this.startRect!=null&&this.tmpPoint.x&&this.tmpPoint.y){
        console.log('has this.tmpPoint');
        var _startRect =this.Canvas_lists[this.startRect];
        this.context.beginPath();
        this.context.moveTo(_startRect.x+_startRect.width/2,_startRect.y+_startRect.height/2);
        this.context.lineTo(this.tmpPoint.x,this.tmpPoint.y);
        this.context.lineWidth=3;
        this.context.stroke();
        this.context.closePath();
    }
},
    deleteLine:function (x,y){
    //draw from line_lists
    this.context.clearRect(0,0,canvas.width,canvas.height);
    for(var i=0; i<this.line_lists.length; i++) {
        var line = this.line_lists[i];
        var rect1=this.Canvas_lists[line[0]];//右边圈
        var rect2=this.Canvas_lists[line[1]];//左边圈
        this.context.save();
        this.context.beginPath();
        var rect1x=rect1.x+rect1.width+this.cicleRadius;
        var rect1y=rect1.y+rect1.height/2;
        var rect2x=rect2.x-this.cicleRadius;
        var rect2y=rect2.y+rect2.height/2;
        this.context.moveTo(rect1x, rect1y);

        //根据不同的坐标来实现不同的line
        /*this.context.lineTo((rect1x+rect2x)/2,rect1y);
         this.context.lineTo((rect1x+rect2x)/2,rect2y);*/
        if(rect1x<=rect2x){
            this.context.lineTo((rect1x+rect2x)/2,rect1y);
            this.context.lineTo((rect1x+rect2x)/2,rect2y);
        }else{
            this.context.lineTo(rect1x+this.lineGap,rect1y);
            this.context.lineTo(rect1x+this.lineGap,(rect1y+rect2y)/2);
            this.context.lineTo(rect2x-this.lineGap,(rect1y+rect2y)/2);
            this.context.lineTo(rect2x-this.lineGap,rect2y);
        }

        this.context.lineTo(rect2x,rect2y);
        console.log(this.context.isPointInStroke(x,y));
        if(x&&y&&this.context.isPointInStroke(x,y)){
            var _startNum=this.startRect_lists.indexOf(line[0]);
            var _endNum=this.endRect_lists.indexOf(line[1]);
            this.startRect_lists.splice(_startNum,1);
            this.endRect_lists.splice(_endNum,1);
            this.line_lists.splice(i,1);
            this.context.closePath();
            this.context.restore();
            return
        }
        this.context.closePath();
        this.context.restore();
    }
    drawAll();

},
    drawAll:function (x,y){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawLine(x,y);
    this.drawRects(x,y);
    this.drawTmpLine();
},
    canvasClick:function (e) {
    // 取得画布上被单击的点
    var clickX = e.pageX - this.canvas.offsetLeft;
    var clickY = e.pageY - this.canvas.offsetTop;
    //判断是否在矩形内，是=》矩形可拖拽
    for(var i=this.Canvas_lists.length-1; i>=0; i--) {
        var rect = this.Canvas_lists[i];
        //计算是否在该矩形内部
        var inRect = ((clickX-rect.x)>0)&&((clickX-rect.x)<rect.width)&&((clickY-rect.y)>0)&&((clickY-rect.y)<rect.height);
        if (inRect) {
            /*在Rect内部 如果选项是选择，则拖拽状态为true*/
            if(this.canDragRect){
                if (this.previousSelectedRect != null) {this.previousSelectedRect.isSelected = false;}
                rect.mx = clickX - rect.x;
                rect.my = clickY - rect.y;
                this.previousSelectedRect = rect;

                rect.isSelected = true;

                this.isDragging = true;

                drawAll(clickX,clickY);

                return;
            }
            /*在Rect内部 如果选项是连线，则连线*/
            if(this.canDrawLine){
                this.canLineDraw = true;
                console.log('mousedown function && candrawline');
                // i值因为闭包需要匿名执行
                (function (i) {
                    if(this.startRect_lists.indexOf(i)==-1){
                        this.startRect = i;
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
    // 取得画布上被单击的点
    var clickX = e.pageX - this.canvas.offsetLeft;
    var clickY = e.pageY - this.canvas.offsetTop;
    //判断是否在矩形内，是=》矩形可拖拽
    for(var i=this.Canvas_lists.length-1; i>=0; i--) {
        var rect = this.Canvas_lists[i];
        //计算是否在该矩形内部
        var inRect = ((clickX-rect.x)>0)&&((clickX-rect.x)<rect.width)&&((clickY-rect.y)>0)&&((clickY-rect.y)<rect.height);
        if (inRect) {
            rect.isSelected = true;
            this.isDragging = false;
            //判断rect中的button
            //var this.buttonGap = 5,this.buttonWidth=70,this.buttonHeight=30;this.buttonMarginTop=50;
            for(var index=0;index<this.buttonName_lists.length;index++){
                var buttonX=this.buttonGap*(index+1)+this.buttonWidth*index+rect.x;
                var buttonY=rect.height-this.buttonMarginTop+rect.y;
                if(clickX>buttonX&&(clickX<(buttonX+this.buttonWidth))&&(clickY>buttonY)&&(clickY<(buttonY+this.buttonHeight))){
                    console.log(i);//第几个rect
                    console.log(index);//第i个rect的第index个button
                    /*console.log(this.buttonName_lists[index]);
                     console.log(this.Canvas_lists[i].text);*/
                    switch (index){
                        case 0: button1Click(i);return;break;
                        case 1: button2Click(i);return;break;
                        case 2: button3Click(i);return;break;
                        default: break;
                    }
                }
            }
            //判断close按钮
            //var this.closeButtonWith=15,this.closeButtonMarginRight=20,this.closeButtonMarginTop=5;
            var closeX=rect.x+rect.width-this.closeButtonMarginRight;
            var closeY=rect.y+this.closeButtonMarginTop;
            if((clickX-closeX)>=0&&(clickX-closeX)<=this.closeButtonWith&&(clickY-closeY)>=0&&(clickY-closeY)<=this.closeButtonWith){
                buttonCloseClick(i);
            }
            drawAll(clickX,clickY);
            return;
        }
    }

},
//buttonclick处理
    button1Click:function (i){
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
},
    button3Click:function (i) {
    console.log('button3click:'+i);
    this.canvasInfoChangeIndex=i;
    $('#mask').show()
},
    buttonCloseClick:function (i) {
    this.Canvas_lists.splice(i,1);
    for(var indexLeft=0;indexLeft<this.line_lists.length;indexLeft++){
        var lines=this.line_lists[indexLeft];
        if(lines[1]==i){
            console.log('delete left line of Canvas_list-'+i);
            //删除start和this.endRect_lists
            this.startRect_lists.splice(this.startRect_lists.indexOf(lines[0]),1);
            this.endRect_lists.splice(this.endRect_lists.indexOf(lines[1]),1);
            //删除this.line_lists
            this.line_lists.splice(indexLeft,1);
        }
    }
    for(var indexRight=0;indexRight<this.line_lists.length;indexRight++){
        var lines=this.line_lists[indexRight];
        if(lines[0]==i){
            console.log('delete right line of Canvas_list-'+i);

            //删除start和this.endRect_lists
            this.startRect_lists.splice(this.startRect_lists.indexOf(lines[0]),1);
            /*new_startRect_list_Right=this.startRect_lists.map(function(item){
             if(item>i){
             return item-1;
             }
             else{
             return item
             }
             });*/
            this.endRect_lists.splice(this.endRect_lists.indexOf(lines[1]),1);
            // new_endRect_list_Right=this.endRect_lists.map()
            //删除this.line_lists
            this.line_lists.splice(indexRight,1);
        }
    }

    //因为this.Canvas_lists删除对象index会变化，所以需要对this.line_lists进行调整
    var new_line_lists=[];
    for(var index=0;index<this.line_lists.length;index++){
        var _lines=this.line_lists[index].map(function (item) {
            if(item>i){
                return item-1;
            }
            else{
                return item
            }
        });
        new_line_lists.push(_lines);
    }
    this.line_lists=new_line_lists;
    //startRect_list调整

    this.startRect_lists=this.startRect_lists.map(function (item) {
        if(item>i){
            return item-1;
        }
        else{
            return item
        }
    });

    this.endRect_lists=this.endRect_lists.map(function (item) {
        if(item>i){
            return item-1;
        }
        else{
            return item
        }
    });



    drawAll();
},
    inRect:function (x,y){
    for(var i=this.Canvas_lists.length-1; i>=0; i--) {
        var rect = this.Canvas_lists[i];
        //计算是否在该矩形内部
        var inRect = ((clickX-rect.x)>0)&&((clickX-rect.x)<rect.width)&&((clickY-rect.y)>0)&&((clickY-rect.y)<rect.height);
        return inRect
    }
},
//在某个范围内生成随机数
    randomFromTo:function (from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
},
    stopDragging:function () {
    this.isDragging = false;
},

    dragRect:function (e) {
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
            drawAll(x,y);
        }
    }
},
//这个可以放到drwaLine里面 因为需要clearRect
    makeTmpLinePoint:function (e) {
    if(this.canLineDraw=true){
        var moveX = e.pageX - this.canvas.offsetLeft;
        var moveY = e.pageY - this.canvas.offsetTop;
        this.tmpPoint.x = moveX;
        this.tmpPoint.y = moveY;
        drawAll()
    }
},
    initCanvas:function (rect_array){
    //array{x,y,text:{shouldChecked:true,checkPersonList:['王一','李2']}}
    this.startRect_lists=[];
    this.endRect_lists=[];
    this.Canvas_lists=[];
    this.line_lists=[];
    rect_array.forEach(function (item,index) {
        var _newItem=this.createRectObj(item.x,item.y,item.text);
        this.Canvas_lists.push(_newItem);
        if(index<(rect_array.length-1)){
            this.line_lists.push([index,index+1]);
            this.startRect_lists.push(index);
            this.endRect_lists.push(index+1)
        }
    });

    drawAll()
},
}
