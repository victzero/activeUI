$(function() {
  act.drag = {
    on: false, //正在拖动,默认false.
    point: null, //拖动起始点.
  }
  act.scalingValues = 1;

  /**
   * 事件处理分发器.根据不同的模式进行相关操作的分发.
   */
  var activeLine;

  //在canvas.upperCanvasEl上监听并分发mousedown事件.
  fabric.util.addListener(canvas.upperCanvasEl, 'mousedown', function(ev) {
    // console.log('mousedown:' + ev.which) // 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键
    log.debug('mousedow start:' + ev.which);
    if (ev.which == 1) { //处理左键
      displayMenu();
      leftClick(ev)
      act.stopEvent(ev);
    } else if (ev.which == 3) { //处理右键.
      return true;
    }
    log.debug('mousedow end:' + ev.which);
  });

  var leftClick = function(op) {
    if (act.isConnectMode()) { //处理连线模式
      var activeObj = canvas.getActiveObject();
      if (!activeObj) { //没有activeObj时为拖动画布.
        act.drag.on = true;
        act.drag.point = canvas.getPointer(op);
        return;
      }
      //有activeObj为连线.
      var activeNode = activeObj.get('parentEle');

      activeLine = new act.Cline([activeNode.left, activeNode.top, activeNode.left, activeNode.top], {

      });
      activeLine.createLink({
        start: activeNode,
        end: null
      })
      return;
    }
  }

  //在document上监听并分发mousemove事件.
  fabric.util.addListener(document, 'mousemove', function(ev) {
    if (act.isConnectMode()) { //处理连线模式
      if (act.drag.on) { //处理拖动画布
        var movePoint = canvas.getPointer(ev);
        var _startDragPoint = act.drag.point;
        canvas.setViewportTransform([act.scalingValues, 0, 0, act.scalingValues, movePoint.x - _startDragPoint.x + canvas.viewportTransform[4], movePoint.y - _startDragPoint.y + canvas.viewportTransform[5]]);
        canvas.renderAll()
        return;
      }
      var p = canvas.getPointer(ev);
      if (activeLine) {
        activeLine.update({
          'x2': p.x,
          'y2': p.y,
        })
      }
    }
  });

  //在document上监听并分发mouseup事件.
  fabric.util.addListener(document, 'mouseup', function(ev) {
    if (act.isConnectMode()) { //处理连线模式
      if (ev.which != 1) {
        act.stopEvent(ev);
        return;
      }
      if (act.drag.on) { //处理拖动画布
        // console.log('end draging Canvas!');
        var movePoint = canvas.getPointer(ev);
        var _wheelNow = act.scalingValues;
        var _startDragPoint = act.drag.point;
        // console.log('start,x:' + _startDragPoint.x + '|y:' + _startDragPoint.y)
        // console.log('end  ,x:' + movePoint.x + '|y:' + movePoint.y)
        canvas.setViewportTransform([_wheelNow, 0, 0, _wheelNow, movePoint.x - _startDragPoint.x + canvas.viewportTransform[4], movePoint.y - _startDragPoint.y + canvas.viewportTransform[5]]);
        canvas.renderAll()
        act.drag = {
          on: false,
          point: null
        }
        return;
      }
      // 找到结束点的坐标,画出线
      if (activeLine) {
        var target = canvas.findTarget(ev);
        if (!target) {
          activeLine.remove();
        } else {
          activeLine.createLink({
            end: target.get('parentEle')
          }); //设置目标节点.
        }
        activeLine = null;
      }

    }
  });

  var amenu = document.getElementById('amenu');
  //监听右击事件,弹出菜单.
  var rightClickShowMenu = function(e) {
    e = e || window.event;
    // console.log('contextmenu' + e.which) // 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键

    var target = canvas.findTarget(e);
    if (!target) {
      amenu.style.display = 'none';
      act.stopEvent(e);
      return;
    }

    //触发右键事件.以便angular内部对改时间进行处理.
    var pe = target.get('parentEle');
    if (!pe) { // 不是node节点.暂时不支持右键.
      return;
    }
    act.canvas.fire('canvasRightClick', {
      target: pe
    });

    canvas.setActiveObject(target);
    var maxWidth = document.documentElement.clientWidth - amenu.offsetWidth;
    var maxHeight = document.documentElement.clientHeight - amenu.offsetHeight;
    var left = (e.clientX < maxWidth) ? e.clientX : maxWidth;
    var top = (e.clientY < maxHeight) ? e.clientY : maxHeight;
    amenu.style.left = left + "px";
    amenu.style.top = top + "px";
    amenu.style.display = 'block';
  };

  fabric.util.addListener(canvas.upperCanvasEl, 'contextmenu', function(ev) {
    log.debug('contextmenu:' + ev.which);
    rightClickShowMenu(ev);
    act.stopEvent(ev);
    return false;
  });

  document.onclick = function() {
    displayMenu();
  }

  var displayMenu = function() {
    amenu.style.display = 'none';
  }

  var rightClick = {
    displayMenu: displayMenu,
    toggleLock: function() {
      var activeNode = act.getActiveNode();
      activeNode.toggleLock();
    },
    deleteNode: function() {
      var activeObj = canvas.getActiveObject();
      if (!activeObj) {
        return;
      }
      activeObj.get('parentEle').remove();
    },
    nodeEdit: function() {
      act.canvas.fire('nodeEditShow', {
      });
    },
    reserveData: function() {
      var cid = act.getActiveNode()._id;
      log.debug(cid)
      $.get("/demo/appendChildren", {
          cid: cid
        },
        function(data, status) {
          var node = act.nodes.get(data.cid);
          var nodes2Add = [];
          for (var i = 0; i < data.children.length; i++) {
            var child = data.children[i];
            var operator = act.config.getByType(child.type);
            if (!operator) {
              log.error('存在错误数据:' + JSON.stringify(child));
              return;
            }
            var op = act.util.extend(operator, child, true);
            nodes2Add.push(op); //只缺少x,y坐标的待添加节点的配置信息数组
          }
          //在指定node周围进行星形布局.
          act.addNodeAround(node, nodes2Add);
        });
    }

  };
  act.rc = rightClick;
});
