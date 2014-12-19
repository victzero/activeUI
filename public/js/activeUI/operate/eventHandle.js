$(function() {
  /**
   * 事件处理分发器.根据不同的模式进行相关操作的分发.
   */
  var activeLine;

  //在canvas.upperCanvasEl上监听并分发mousedown事件.
  fabric.util.addListener(canvas.upperCanvasEl, 'mousedown', function(op) {
    if (!act.isConnectMode()) {
      return;
    }
    var activeObj = canvas.getActiveObject();
  });

  //在document上监听并分发mousemove事件.
  fabric.util.addListener(document, 'mousemove', function(op) {
    if (!act.isConnectMode()) {
      return;
    }
    var p = canvas.getPointer(op.e);

  });

  //在document上监听并分发mouseup事件.
  fabric.util.addListener(document, 'mouseup', function(op) {
    if (!act.isConnectMode()) {
      return;
    }

  })
});
