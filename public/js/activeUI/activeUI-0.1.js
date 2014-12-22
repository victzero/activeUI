var canvas = this.__canvas = new fabric.Canvas('activeCanvas', {
  selection: true
});
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  /**
   * [ondrop description]
   * 将图片拖动到canvas画布时的操作。
   * @type {[type]}
   */
  canvas.upperCanvasEl.ondrop = canvasOndrop;

  canvas.upperCanvasEl.ondragover = function(ev) {
    ev.preventDefault();
    return;
  }

  function canvasOndrop(ev) {
    ev = ev || window.event;

    var p = canvas.getPointer(ev);
    addElement(p)
  };

  var _labelNum = 0;

  function addElement(p) {
      var de = new fabric.DefaultElement({
        left: p.x,
        top: p.y,
        label: 'label' + _labelNum++,
        hasControls: false,
        hasBorders: true
      });
      if (isConnectModel()) {
        de.lockMovementX = true;
        de.lockMovementY = true;
      }
      canvas.add(de);
      canvas.renderAll();
    }
    /***************end************************/

  /**
   * [movingModel description]
   * 不同的操作模式.
   * @return {[type]} [description]
   */
  var __operatingModel = 'moving';
  var startMoveModel = function() {
    canvas.selection = true;
    canvas.moveCursor = 'move';
    canvas.hoverCursor = 'move';
    var objs = canvas.getObjects()
    for (var i = objs.length - 1; i >= 0; i--) {
      objs[i].lockMovementX = false;
      objs[i].lockMovementY = false;
    };
    canvas.renderAll();
    __operatingModel = 'moving';
  }

  var endMoveModel = function() {
    //移动模式结束时需要取消所有选中的对象.
    canvas.selection = false; //禁止选中

    //禁止拖拽
    canvas.moveCursor = 'default';
    canvas.hoverCursor = 'default';
    var objs = canvas.getObjects()
    for (var i = objs.length - 1; i >= 0; i--) {
      objs[i].lockMovementX = true;
      objs[i].lockMovementY = true;
    };
    canvas.renderAll();
  }

  var startConnectModel = function() {
    endMoveModel();
    __operatingModel = 'connecting';
  }

  var endConnectModel = function() {
    //连接模式结束时需要结束所有连线操作,包括正在拖动中线.
  }

  var isConnectModel = function() {
    return __operatingModel == 'connecting';
  }

  var resetModel = function() {
    //根据当前的模式进行结束调用
  }

  /**
   * 在连线模式下,点击/移动/松开鼠标的各个操作.
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  var activeLine;
  fabric.util.addListener(canvas.upperCanvasEl, 'mousedown', function(e) {
    var activeObj = canvas.getActiveObject();
    if (activeObj) {
      if (activeObj.isType('text')) {
        $('#textInput').attr('disabled', false).val(activeObj.text);
      } else if (activeObj.isType('defaultElement')) {
        $('#textInput').attr('disabled', false).val(activeObj.label);
      }
    } else {
      $('#textInput').attr('disabled', true);
    }
    if (!isConnectModel()) {
      return;
    }

    if (activeObj) {

      activeLine = new DefaultLine([activeObj.left, activeObj.top, activeObj.left, activeObj.top], {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 5,
        selectable: false
      });
      activeObj.srcLine.push(activeLine);
      activeLine.fromObj = activeObj;
      // console.log(activeObj.name + ':' +activeObj.srcLine.length + '|mousedown|' + activeObj.targetLine.length)

      canvas.add(activeLine);
      canvas.renderAll();
    }
  })

  fabric.util.addListener(document, 'mousemove', function(op) {
    if (!isConnectModel()) {
      return;
    }
    var p = canvas.getPointer(op.e);
    if (activeLine) {
      activeLine.set({
        'x2': p.x,
        'y2': p.y,
      })
      canvas.renderAll();
    }
  })

  fabric.util.addListener(document, 'mouseup', function(op) {
    if (!isConnectModel()) {
      return;
    }
    // 找到结束点的坐标,画出线
    if (activeLine) {
      var target = canvas.findTarget(op.e);
      if (!target) {
        activeLine.fromObj.srcLine.pop();
        canvas.remove(activeLine)
        canvas.renderAll();
      } else {
        activeLine.set({
          'x2': target.left,
          'y2': target.top,
        });

        target.targetLine.push(activeLine);
        activeLine.toObj = target;
        // console.log(target.name + ':' +target.srcLine.length + '|mouseup|' + target.targetLine.length)

        canvas.sendToBack(activeLine)
        canvas.renderAll();
        activeLine = null;
      }
    }
  })

  /**
   * 移动每个对象时同时移动与它绑定的线.
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  canvas.on('object:moving', function(e) {
    if (isConnectModel()) {
      return;
    }
    // console.debug('object:moving')
    var p = e.target;
    // console.log(p.srcLine.length + '|' + p.targetLine.length)
    movingObject(p)

    canvas.renderAll();
  });

  function movingObject(tar, centerPoint) {
    if (tar._objects) {// 组拖动,centerPoint为组的中心.
      for (var i = tar._objects.length - 1; i >= 0; i--) {
        movingObject(tar._objects[i], tar.getCenterPoint())
      };
      return;
    }
    centerPoint = centerPoint || {
      x: 0,
      y: 0
    };

    if (tar.srcLine) {
      for (var i = tar.srcLine.length - 1; i >= 0; i--) {
        // console.log(tar.srcLine[i].toString())
        tar.srcLine[i].set({
          'x1': tar.left + centerPoint.x,
          'y1': tar.top + centerPoint.y
        });
      };
    }
    if (tar.targetLine) {
      for (var i = tar.targetLine.length - 1; i >= 0; i--) {
        // console.log(tar.targetLine[i].toString())
        tar.targetLine[i].set({
          'x2': tar.left + centerPoint.x,
          'y2': tar.top + centerPoint.y
        })
      };
    }
  }

  /**
   * [showAllElement description]
   * 测试方法,打出有对象信息到控制台
   * @return {[type]} [description]
   */
  function showAllElement() {
    for (var i = 0; i < canvas.getObjects().length; i++) {
      console.log(canvas.getObjects()[i].toString());
    };
  }

  /**
   * [thumbnail description]
   * 缩略图的实现
   * @type {[type]}
   */
  var thumbnail = document.getElementById('thumbnailCanvas');
  var thumbnail_ctx = thumbnail.getContext('2d');

  function thumbnailCanvasShow() {
    thumbnail_ctx.clearRect(0, 0, thumbnail.width, thumbnail.height);
    var image = new Image();
    image.src = canvas.toDataURL("image/png");

    thumbnail_ctx.drawImage(image, 0, 0, 800, 500, 0, 0, 160, 100);

    setTimeout(thumbnailCanvasShow, 100);
  }

  thumbnailCanvasShow();

  /**
   * [hawkeyeCanvasShow description]
   * 鹰眼图
   * @return {[type]} [description]
   */

  var hawkeye = document.getElementById('hawkeyeCanvas');
  var hawkeye_ctx = hawkeye.getContext('2d');

  function hawkeyeCanvasShow() {
    //XXX:内存泄露
    canvas.clone(function(cloned) {
      var image = new Image();
      image.src = cloned.toDataURL({
        format: "image/png",
        multiplier: 0.5
      });
      $('#fullImage').html(image);
    })

    // setTimeout(hawkeyeCanvasShow, 1000);
  }

  hawkeyeCanvasShow();

  /**
   * 缩放
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var _wheelNow = 1; //缩放比例.
  var _wheelChange = 500; //缩放影响比例.
  var _wheelEach = 300; //每次滚动缩放值.
  var _wheelMin = 0.2; //最小缩放值.
  var _wheelMinCnt = Math.floor((1 - _wheelMin) / (_wheelEach / _wheelChange));
  var _wheelMaxCnt = 10;

  fabric.util.addListener(canvas.upperCanvasEl, 'mousewheel', function(event) {
    // console.log(event.wheelDeltaY);
    _wheelNow += event.wheelDeltaY / _wheelChange;
    // console.log(_wheelNow);
    if (_wheelNow < 1 - _wheelEach / _wheelChange * _wheelMinCnt) {
      _wheelNow = 1 - _wheelEach / _wheelChange * _wheelMinCnt;
    } else if (_wheelNow > 1 + _wheelEach / _wheelChange * _wheelMaxCnt) {
      _wheelNow = 1 + _wheelEach / _wheelChange * _wheelMaxCnt;
    }

    var point = canvas.getPointer(event);
    canvas.zoomToPoint(point, _wheelNow);
    // canvas.setZoom(_wheelNow)
    event.preventDefault()
  });

  /**
   * [defaultWheel description]
   * 默认大小.
   * @return {[type]} [description]
   */
  function defaultWheel() {
    var point = new fabric.Point(canvas.width / 2, canvas.height / 2);
    // canvas.zoomToPoint(point, 1);
    _wheelNow = 1;
    canvas.setViewportTransform([_wheelNow, 0, 0, _wheelNow, 0, 0]);
    canvas.renderAll()
  }

  /**
   * [oMenu description]
   * 右键菜单.
   * @type {[type]}
   */
  var oMenu = document.getElementById("menu");
  fabric.util.addListener(canvas.upperCanvasEl, 'contextmenu', function(e) {
    // console.log('oncontextmenu')
    e = e || window.event; //处理event事件对象兼容性

    var target = canvas.findTarget(e);
    if (!target) {
      // console.log('oncontextmenu: no target!');
      oMenu.style.display = "none";
      e.preventDefault();
      return;
    }

    canvas.setActiveObject(target)

    oMenu.style.display = "block";
    var maxWidth = document.documentElement.clientWidth - oMenu.offsetWidth;
    var maxHeight = document.documentElement.clientHeight - oMenu.offsetHeight;
    var left = (e.clientX < maxWidth) ? e.clientX : maxWidth;
    var top = (e.clientY < maxHeight) ? e.clientY : maxHeight;
    oMenu.style.left = left + "px";
    oMenu.style.top = top + "px";

    e.preventDefault()
    return false; //取消右键默认菜单
  });

  document.onclick = function(e) {
    oMenu.style.display = "none";
  }

  /**
   * 非连线模式下,拖动空白区域时,为拖拽画布.
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  var _startDragCanvas = false;
  var _startDragPoint;
  fabric.util.addListener(canvas.upperCanvasEl, 'mousedown', function(e) {
    if (!isConnectModel()) {
      return;
    }
    var activeObj = canvas.getActiveObject();
    if (!activeObj) {
      // console.log('_startDragCanvas!')
      _startDragCanvas = true;
      _startDragPoint = canvas.getPointer(e.e);
      // canvas.selection = false;
    }
  });

  fabric.util.addListener(canvas.upperCanvasEl, 'mousemove', function(op) {
    if (!isConnectModel()) {
      return;
    }
    if (_startDragCanvas) {
      var movePoint = canvas.getPointer(op.e);
      // console.log('draging Canvas!' + movePoint)
      canvas.setViewportTransform([_wheelNow, 0, 0, _wheelNow, movePoint.x - _startDragPoint.x + canvas.viewportTransform[4], movePoint.y - _startDragPoint.y + canvas.viewportTransform[5]]);
      canvas.renderAll()
    }
  });

  fabric.util.addListener(canvas.upperCanvasEl, 'mouseup', function(op) {
    if (!isConnectModel()) {
      return;
    }
    if (_startDragCanvas) {
      // console.log('end draging Canvas!');
      var movePoint = canvas.getPointer(op.e);
      // console.log('start,x:' + _startDragPoint.x + '|y:' + _startDragPoint.y)
      // console.log('end  ,x:' + movePoint.x + '|y:' + movePoint.y)
      canvas.setViewportTransform([_wheelNow, 0, 0, _wheelNow, movePoint.x - _startDragPoint.x + canvas.viewportTransform[4], movePoint.y - _startDragPoint.y + canvas.viewportTransform[5]]);
      canvas.renderAll()
      _startDragCanvas = false;
      _startDragPoint = null;
    }
  });

  /**
   * [saveImage2Local description]
   * 保存图片到本地.
   * @return {[type]} [description]
   */
  function saveImage2Local() {
    // 图片导出为 png 格式
    var type = 'png';
    var imgData = canvas.toDataURL(type);
    // 加工image data，替换mime type
    imgData = imgData.replace(_fixType(type), 'image/octet-stream');
    // 下载后的问题名
    var filename = 'activeUI_' + (new Date()).getTime() + '.' + type;
    // download
    saveFile(imgData, filename);
  }

  /**
   * 获取mimeType
   * @param  {String} type the old mime-type
   * @return the new mime-type
   */
  var _fixType = function(type) {
    type = type.toLowerCase().replace(/jpg/i, 'jpeg');
    var r = type.match(/png|jpeg|bmp|gif/)[0];
    return 'image/' + r;
  };

  /**
   * 在本地进行文件保存
   * @param  {String} data     要保存到本地的图片数据
   * @param  {String} filename 文件名
   */
  var saveFile = function(data, filename) {
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
  };


  function canvas2JSON() {
    $('#jsonData').text(JSON.stringify(canvas.toJSON()));
  }

  function canvasFromJSON() {
    var data = $('#jsonData').val();
    canvas.loadFromJSON(data);
  }

  /**
   * [showInStar description]
   * 星型展示
   * @return {[type]} [description]
   */
  function showInStar() {
    var activeObj = canvas.getActiveObject();
    if (!activeObj) {
      alert('请选择主节点!');
      return;
    }
    var lines = activeObj.srcLine;
    var center = {
      x: activeObj.left,
      y: activeObj.top
    }
    var r;
    var angle = Math.PI / 3; //两点之间的角度.
    for (var i = 0; i < lines.length; i++) {
      var target = lines[i].toObj;
      if (!r) {
        r = Math.sqrt(Math.pow(target.left - center.x, 2) + Math.pow(target.top - center.y, 2));
      }
      target.left = center.x + r * Math.cos(angle * i);
      target.top = center.y + r * Math.sin(angle * i);
      movingObject(target)
    };
  }

  /**
   * [animateInStar description]
   * 星形发散.
   * @return {[type]} [description]
   */
  function animateInStar() {
    var activeObj = canvas.getActiveObject();
    if (!activeObj) {
      alert('请选择操作对象!');
      return;
    }
    var stars = [];
    var center = {
      x: activeObj.left,
      y: activeObj.top
    }
    var r = 120;
    var angle = Math.PI / 3; //两点之间的角度.
    for (var i = 0; i < 6; i++) {
      stars[i] = new fabric.DefaultElement({
        left: center.x,
        top: center.y,
        selectable: false,
        hasControls: false,
        hasBorders: false
      });
      // stars[i] = new fabric.Rect({
      //   width: 50,
      //   height: 50,
      //   left: 100,
      //   top: 100,
      //   stroke: '#aaf',
      //   strokeWidth: 5,
      //   fill: '#faa',
      //   selectable: false
      // });
      canvas.add(stars[i]);
      stars[i].animate({
        'left': center.x + r * Math.cos(angle * i),
        'top': center.y + r * Math.sin(angle * i)
      }, {
        duration: 1000,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: function() {
          //
        },
        easing: fabric.util.ease['easeInOutSine']
      });
    }
  }

  /**
   * [Text2 description]
   * 添加可编辑文本信息框.
   * @type {fabric}
   */
  var Text2 = new fabric.Text('foo bar\nbaz', {
    left: 400,
    top: 150,
    fontSize: 14,
    fontFamily: 'Helvetica',
    fill: '#333',
    hasControls: false,
    hasBorders: true
  });

  canvas.add(Text2)

  function setActiveProp(name, value) {
    var object = canvas.getActiveObject();
    if (!object) return;

    object.set(name, value).setCoords();
    canvas.renderAll();
  }

  $('#textInput').bind('keyup', function() {
    var object = canvas.getActiveObject();
    if (!object) return;

    if (object.isType('text')) {
      object.set('text', $('#textInput').val()).setCoords();
      canvas.renderAll();
    } else {
      object.set('label', $('#textInput').val()).setCoords();
      canvas.renderAll();
    }

  })

  function removeElement(){
    var activeObj = canvas.getActiveObject();
    if (!activeObj) {
      alert('请选择操作对象!');
      return;
    }
    canvas.remove(activeObj)
  }


  /**
   * [largeElementsTest description]
   * 大量数据测试
   * @return {[type]} [description]
   */
  function largeElementsTest() {
      for (var i = 50 - 1; i >= 0; i--) {
        i--
        addElement({
          'x': i,
          'y': i
        })
        addElement({
          'x': i + 100,
          'y': i
        })
      };
    }
    // largeElementsTest();

  // var ctx = hawkeye_ctx;

  function drawLinearGradient() {
    var _gm, _pattern, _img;
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0)';
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;
    ctx.font = '10px sans-serif';
    ctx.translate(0, 0);
    ctx.scale(NaN, NaN);
    ctx.translate(0, 0);
    ctx.save();
    _gm = ctx.createLinearGradient(115, 15, 285, 15);
    ctx.fillStyle = _gm;
    _gm.addColorStop(0, 'rgba(255,255,0,1)');
    _gm.addColorStop(1, 'rgba(255,0,0,1)');;
    ctx.font = '12px sans-serif';
    ctx.beginPath();
    ctx.moveTo(200, 15);
    ctx.bezierCurveTo(247, 15, 285, 40, 285, 70);
    ctx.bezierCurveTo(285, 100, 247, 125, 200, 125);
    ctx.bezierCurveTo(153, 125, 115, 100, 115, 70);
    ctx.bezierCurveTo(115, 40, 153, 15, 200, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    _gm = _pattern = _img = null;
  }
  drawLinearGradient();
