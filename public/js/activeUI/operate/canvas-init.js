//init
var canvas;
$(function() {
  canvas = new fabric.Canvas('activeCanvas', {
    selection: true,
    'width': '1250',
    'height': '550'
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
    var namespace = ev.dataTransfer.getData('namespace');
    var index = ev.dataTransfer.getData('index');
    var obj = aconfig[namespace][index];
    if (!obj) {
      return;
    }
    log.debug('add node to the cavnas[ title:' + obj.title + ',img: ' + obj.img + ']');
    var type = 'svg';
    if (!obj.img.endsWith('svg')) {
      type = 'image';
    }

    //获得到拖进来的对象,来组织url和label以及id(??)
    act.addNode({
      left: p.x,
      top: p.y,
      url: obj.img,
      type: type,
      label: obj.title
    })
  };

  /**
   * 禁止对group旋转和缩放.
   */
  canvas.observe('selection:created', function() {
    var group = canvas.getActiveGroup();
    // Detect if group has locked items, perhaps using group.forEachObject()
    group.hasControls = false;
  });

  canvas.upperCanvasEl.ondragover = function(ev) {
    ev.preventDefault();
    return;
  }
  canvas.upperCanvasEl.ondrop = canvasOndrop;

  var _labelNum = 0;

  function addElement(p) {
    var de = new act.Node({
      left: p.x,
      top: p.y,
      url: '../images/51.svg',
      label: 'label' + _labelNum++,
    });
    // if (actGlobal.isConnectMode()) {
    //   de.lockMovementX = true;
    //   de.lockMovementY = true;
    // }
    canvas.renderAll();
  }

  act.canvas = canvas;
});

