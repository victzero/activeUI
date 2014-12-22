var act = act || (act = {}),
  extend = fabric.util.object.extend;

act.nodeObjs = [];
act.showAllNode = function() {
  for (var i = 0; i < act.nodeObjs.length; i++) {
    console.log('node[' + i + ']:' + act.nodeObjs[i].label + ',left:' + act.nodeObjs[i].left + ',top:' + act.nodeObjs[i].top);
    console.log('node[' + i + '].srcLine length:' + Object.keys(act.nodeObjs[i].srcLine).length);
    console.log('node[' + i + '].targetLine length:' + Object.keys(act.nodeObjs[i].targetLine).length);
  }
};
/**
 * 此类为框架操作对象.由于拖拽并新增节点时,需要同时添加多个fabric对象,所以使用该类进行统一操作.
 * 新增的对象包括如下信息:
 * type: 对象类型image||svg,可选,默认为svg
 * url: url地址
 * label: 描述信息,可以使用\n进行换行.
 * top,left:安放的坐标位置
 */
act.Node = fabric.util.createClass({
  type: 'svg', //svg || image
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  loadedObject: null,
  text: null,
  textOptions: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    fill: '#333',
    hasControls: false,
    hasBorders: false,
  },
  initialize: function(options) {
    this.srcLine = {}; //以其为起点,初始化的位置不同,决定了其作用域不同.
    this.targetLine = {}; //以其为终点
    options && this.setOptions(options);
    options.url && this._loadPic(); //加载图片对象.
  },
  setOptions: function(options) {
    for (var prop in options) {
      this.set(prop, options[prop]);
    }
  },
  _loadPic: function() {
    var _this = this;
    var _loadSvgCallback = function(objects, options) {
      svg = fabric.util.groupSVGElements(objects, options);
      _this.loadedObject = svg;
      _this._afterLoad();
    };
    var _loadImageCallback = function(image) {
      _this.loadedObject = image;
      _this._afterLoad();
    };

    if (this.type == 'svg') {
      fabric.loadSVGFromURL(this.url, _loadSvgCallback);
    } else
    if (this.type == 'image') {
      fabric.Image.fromURL(this.url, _loadImageCallback);
    }
  },
  _afterLoad: function() {

    this._initPic(); //在图片加载完毕后进行初始化操作.
    this.label && this._loadLabel(); //加载描述文字

    this._matchMode();
    this._renderAll();
  },
  _matchMode: function() {
    if (act.isConnectMode()) {
      this.loadedObject.lockMovementX = true;
      this.loadedObject.lockMovementY = true;
      this.text.lockMovementX = true;
      this.text.lockMovementY = true;
    }
    if (act.isMoveMode()) {
      this.loadedObject.lockMovementX = false;
      this.loadedObject.lockMovementY = false;
      this.text.lockMovementX = false;
      this.text.lockMovementY = false;
    }
  },
  _initPic: function() {
    var _this = this;
    this.width = this.loadedObject.width;
    this.height = this.loadedObject.height;
    this.loadedObject.set({
      left: this.left,
      top: this.top,
      angle: 0,
      hasBorders: false,
      hasControls: false,
      parentEle: this,
      isNode: true
    }).scale(1).setCoords();

    this.loadedObject.on('moving', function(op) {
      log.debug('pic is moving')
      _this._updateNode('pic');
    })
  },
  _loadLabel: function() {
    var _this = this;
    var labelOpt = extend({
      left: this.left,
      top: this._getLabelTop(),
    }, this.textOptions);
    this.text = new fabric.Text(this.label, labelOpt);
    this.text.set({
      parentEle: this,
    });
    this.text.on('moving', function() {
      log.debug('label is moving')
      _this._updateNode('label');
    })
  },
  _getLabelTop: function() {
    return this.top + this.height / 2 + this.textOptions.fontSize / 2
  },
  _updateNode: function(src, cp) {
    if (act.isConnectMode()) {
      return;
    }
    cp || (cp = {
      x: 0,
      y: 0
    });
    if (src == 'label') { //label标签
      this.left = this.text.left;
      this.top = this.text.top - this.textOptions.fontSize / 2 - this.height / 2
      this.loadedObject.set({
        left: this.left,
        top: this.top,
      }).setCoords();
    } else if (src == 'pic') {
      this.left = this.loadedObject.left + cp.x;
      this.top = this.loadedObject.top + cp.y;
      this.text.set({
        left: this.left - cp.x,
        top: this._getLabelTop() - cp.y
      }).setCoords();
    }
    this._updateLines();
  },
  _updateLines: function() {
    //TODO:更新相关连线.
    // console.log('_updateLines,src:' + this.srcLine + ',target:' + this.targetLine)
    for (var key in this.srcLine) {
      var line = this.srcLine[key];
      // console.log('_updateLines of src:' + key)
      line.update({
        'x1': this.left,
        'y1': this.top
      });
    }
    for (var key in this.targetLine) {
      var line = this.targetLine[key];
      // console.log('_updateLines of target:' + key)
      line.update({
        'x2': this.left,
        'y2': this.top
      });
    }

  },
  _renderAll: function() {
    this.loadedObject && canvas.add(this.loadedObject);
    this.text && canvas.add(this.text)
    act.nodeObjs.push(this);
  },
  addSrcLine: function(line) {
    this.srcLine[line._id] = line;
    console.log('node ' + this.label + ',addSrcLine:' + line._id + ',length:' + Object.keys(this.srcLine).length)
  },
  deleteSrcLineById: function(id) {
    delete this.srcLine[id];
  },
  addTargetLine: function(line) {
    this.targetLine[line._id] = line;
    console.log('node ' + this.label + ',addTargetLine:' + line._id + ',length:' + Object.keys(this.srcLine).length)
  },
  deleteTargetLineById: function(id) {
    delete this.targetLine[id];
  },
  set: function(key, value) {
    if (typeof key === 'object') {
      this._setObject(key);
    } else {
      if (typeof value === 'function' && key !== 'clipTo') {
        this._set(key, value(this.get(key)));
      } else {
        this._set(key, value);
      }
    }
    return this;
  },
  /**
   * @private
   * @param {String} key
   * @param {Any} value
   * @return {fabric.Object} thisArg
   */
  _set: function(key, value) {
    var shouldConstrainValue = (key === 'scaleX' || key === 'scaleY');

    if (shouldConstrainValue) {
      value = this._constrainScale(value);
    }
    if (key === 'scaleX' && value < 0) {
      this.flipX = !this.flipX;
      value *= -1;
    } else if (key === 'scaleY' && value < 0) {
      this.flipY = !this.flipY;
      value *= -1;
    } else if (key === 'width' || key === 'height') {
      this.minScaleLimit = toFixed(Math.min(0.1, 1 / Math.max(this.width, this.height)), 2);
    } else if (key === 'shadow' && value && !(value instanceof fabric.Shadow)) {
      value = new fabric.Shadow(value);
    }

    this[key] = value;

    return this;
  },
  toString: function() {}
})


/**
 * 每一个可操作元素,暂时使用圆形代替。
 */
fabric.Element = fabric.util.createClass(fabric.Circle, {
  type: 'element',
  initialize: function(options) {
    options || (options == {});
    this.callSuper('initialize', options);
    this.set('label', options.label || '');
  },
  _render: function(ctx) {
    this.callSuper('_render', ctx);
    if (this.label) {
      ctx.font = '12px Helvetica';
      ctx.fillStyle = '#333';
      ctx.fillText(this.label, -this.width / 2 - this.radius * 1, -this.height / 2 + this.radius * 3);
    }
  }
});

act.addNode = function(options) {
  var node = new act.Node(options); //新建的对象无需调用renderAll方法,在Pic加载完成后自动render
}

act.Cline = fabric.util.createClass({
  type: 'cline',
  _id: null,
  line: null,
  fromNode: null,
  toNode: null,
  isBack: false,
  defOptions: act.config.lineOptions,
  initialize: function(points, options) {
    options || (options == {});
    options = extend(this.defOptions, options);
    this._id = act.guid();
    this.line = new fabric.Line(points, options);
    this.line.set({
      parentEle: this
    });
    canvas.add(this.line);
    // this._renderAll();
  },
  createLink: function(op) {
    if (op.start) { //绑定起点
      this.fromNode = op.start;
      op.start.addSrcLine(this);
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
  },
  update: function(op) {
    this.line.set(op);
    if (!this.isBack) {
      canvas.sendToBack(this.line);
      this.isBack = true;
    }
    canvas.renderAll();
  },
  remove: function() {
    this.fromNode && this.fromNode.deleteSrcLineById(this._id); //存在from时
    this.toNode && this.toNode.deleteTargetLineById(this._id);
    canvas.remove(this.line)
    canvas.renderAll();
  },
  _renderAll: function() {

  }
});
