act.Cline = fabric.util.createClass({
  type: 'cline',
  _id: null,
  line: null,
  fromNode: null,
  toNode: null,
  isBack: false,
  qrender: true,
  initialize: function(points, options) {
    options || (options == {});
    options = act.util.extend(act.config.lineOptions, options, true);
    this._id = act.guid();
    this.line = new fabric.Line(points, options);
    this.line.set({
      parentEle: this
    });
    act.canvas.add(this.line);
  },
  createLink: function(op) {
    if (op.start) { //绑定起点
      this.fromNode = op.start;
      op.start.addSrcLine(this);
      this.update({
        'x1': op.start.left,
        'y1': op.start.top,
      });
    }
    if (op.end && (target = op.end)) { //绑定终点
      if (target == this.fromNode) {
        log.debug('目标节点和初始节点为同一节点,放弃该操作.');
        this.remove();
        return;
      }
      //TODO:判断start和end之间是否已经建立了关系,如果已经建立了关系,则此次操作无效.
      this.toNode = target;
      target.addTargetLine(this);
      this.update({
        'x2': target.left,
        'y2': target.top,
      });
    }
    this._renderAll();
  },
  update: function(op) {
    this.line.set(op);
    if (!this.isBack) {
      canvas.sendToBack(this.line);
      this.isBack = true;
    }
  },
  remove: function() { //把线从节点的关联关系中删除.
    this.fromNode && this.fromNode.deleteSrcLineById(this._id); //存在from时
    this.toNode && this.toNode.deleteTargetLineById(this._id);
    act.canvas.remove(this.line)
    this._renderAll();
  },
  _renderAll: function() {
    this.qrender && act.canvas.renderAll();
  }
});
