$(function() {
  /**
   * 事件处理分发器.根据不同的模式进行相关操作的分发.
   */
  var activeLine;

  //在canvas.upperCanvasEl上监听并分发mousedown事件.
  fabric.util.addListener(canvas.upperCanvasEl, 'mousedown', function(op) {
    if (act.isConnectMode()) { //处理连线模式
      var activeObj = canvas.getActiveObject();
      if (!activeObj) {
        return;
      }
      var activeNode = activeObj.get('parentEle');


      activeLine = new act.Cline([activeNode.left, activeNode.top, activeNode.left, activeNode.top], {

      });
      activeLine.createLink({
        start: activeNode,
        end: null
      })
      return;
    }
  });

  //在document上监听并分发mousemove事件.
  fabric.util.addListener(document, 'mousemove', function(op) {
    if (act.isConnectMode()) { //处理连线模式
      var p = canvas.getPointer(op.e);
      if (activeLine) {
        activeLine.update({
          'x2': p.x,
          'y2': p.y,
        })
      }
    }
  });

  //在document上监听并分发mouseup事件.
  fabric.util.addListener(document, 'mouseup', function(op) {
    if (act.isConnectMode()) { //处理连线模式
      // 找到结束点的坐标,画出线
      if (activeLine) {
        var target = canvas.findTarget(op.e);
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
  })
});
