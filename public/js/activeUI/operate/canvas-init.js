//init
var canvas;
$(function() {
  canvas = new fabric.Canvas('activeCanvas', {
    selection: true,
    'width': act.config.canvas.width,
    'height': act.config.canvas.height
  });
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  /**
   * [ondrop description]
   * 将图片拖动到canvas画布时的操作。
   * @type {[type]}
   */
  function canvasOndrop(ev) {
    ev = ev || window.event;

    var p = canvas.getPointer(ev);
    var pindex = ev.dataTransfer.getData('pindex');
    var index = ev.dataTransfer.getData('index');
    var obj = act.config['operators'][pindex]['objs'][index];
    if (!obj) {
      return;
    }
    log.debug('add node to the cavnas[ title:' + obj.title + ',img: ' + obj.img + ']');

    //获得到拖进来的对象,来组织url和label以及id(??)
    act.addNode({
      left: p.x,
      top: p.y,
      url: obj.img,
      label: obj.title,
      srcType: obj.type,
      // rcArr: obj.rcArr,
    });

    act.stopEvent(ev);
  };

  /**
   *
   */
  canvas.observe('selection:created', function() {
    var group = canvas.getActiveGroup();
    // Detect if group has locked items, perhaps using group.forEachObject()
    group.hasControls = false; //禁止对group旋转和缩放.
    log.debug('group created.')
    if (act.isMoveMode()) {
      group.on('moving', function(p) {
        for (var i = 0; i < group.getObjects().length; i++) {
          var obj = group.getObjects()[i];
          if (obj.isNode) {
            obj.parentEle._updateNode('group', this.getCenterPoint());
            // obj.fire('moving')
          }
        }
      })
    }
  });

  canvas.upperCanvasEl.ondragover = function(ev) {
    act.stopEvent(ev);
    return;
  }
  canvas.upperCanvasEl.ondrop = canvasOndrop;

  act.canvas = canvas;
});
