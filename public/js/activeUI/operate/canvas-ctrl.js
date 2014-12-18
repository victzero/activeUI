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
    log.debug('add Element on point: ' + p)
    addElement(p)
  };
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
    if (isConnectModel()) {
      de.lockMovementX = true;
      de.lockMovementY = true;
    }
    canvas.renderAll();

  }

  function isConnectModel() {
    return false;
  }
});
