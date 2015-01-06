var act = act || (act = {}),
  extend = fabric.util.object.extend;

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
  srcType: null,
  _id: null,
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  loadedObject: null,
  text: null,
  group: null,
  locked: true,
  qrender: true,
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
    this._id = act.guid();
    options && this.setOptions(options);
    this.setType(); //定义type为svg或image.
    options.url && this._loadPic(); //加载图片对象.
  },
  setType: function() {
    var type = 'svg';
    if (!this.url.endsWith('svg')) {
      type = 'image';
    }
    this.type = type;
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
      var sobj = svg.toObject();
      fabric.PathGroup.fromObject(sobj, function(pg) {
        act.svgCache.put(_this.url, pg);
      })
      _this.loadedObject = svg;
      _this._afterLoad();
    };
    var _loadSvgFromCache = function(pathGroup) {
      _this.loadedObject = pathGroup;
      _this._afterLoad();
    }
    var _loadImageCallback = function(image) {
      _this.loadedObject = image;
      _this._afterLoad();
    };

    if (this.type == 'svg') {
      if (act.svgCache.exist(this.url)) {
        act.svgCache.get(this.url, function(pg) {
          pg && _loadSvgFromCache(pg);
        });
      } else {
        fabric.loadSVGFromURL(this.url, _loadSvgCallback);
      }
    } else
    if (this.type == 'image') {
      fabric.Image.fromURL(this.url, _loadImageCallback);
    }
  },
  _afterLoad: function() {

    this._initPic(); //在图片加载完毕后进行初始化操作.
    this.label && this._loadLabel(); //加载描述文字

    this._renderAll();
  },
  _matchMode: function() {
    // if (act.isConnectMode()) {
    //   this.lock();
    // }
    // if (act.isMoveMode()) {
    //   this.unlock();
    // }
    if (this.active) {
      act.nodes.setActiveNode(this);
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
    }).scale(1).setCoords();
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
  },
  _getLabelTop: function() {
    return this.top + this.height / 2 + this.textOptions.fontSize / 2
  },
  update: function(op) {
    this.left = op.x;
    this.top = op.y;
    this.group.set({
      left: this.left,
      top: this.top
    }).setCoords();
    this._updateLines();

    // var _this = this;
    // fabric.util.animate({
    //   startValue: this.left,
    //   endValue: op.x,
    //   // byValue: options.by,
    //   easing: fabric.util.ease['easeOutQuad'],
    //   duration: 1000,
    //   // abort: options.abort && function() {
    //   //   return options.abort.call(_this);
    //   // },
    //   onChange: function(value) {
    //     _this.left = value;
    //     _this.group.set({
    //       left: _this.left,
    //       top: _this.top
    //     }).setCoords();
    //     _this._updateLines();
    //     act.canvas.renderAll();
    //   },
    //   onComplete: function() {
    //     act.canvas.renderAll();
    //   }
    // });

    // fabric.util.animate({
    //   startValue: this.top,
    //   endValue: op.y,
    //   // byValue: options.by,
    //   easing: fabric.util.ease['easeOutQuad'],
    //   duration: 1000,
    //   // abort: options.abort && function() {
    //   //   return options.abort.call(_this);
    //   // },
    //   onChange: function(value) {
    //     _this.top = value;
    //     _this.group.set({
    //       left: _this.left,
    //       top: _this.top
    //     }).setCoords();
    //     _this._updateLines();
    //     act.canvas.renderAll();
    //   },
    //   onComplete: function() {
    //     act.canvas.renderAll();
    //   }
    // });

    // this.left = op.x;
    // this.top = op.y;
    // this.group.animate({
    //   left: this.left,
    //   top: this.top
    // }, {
    //   duration: 1000,
    //   onChange: function(value) {
    //     act.canvas.renderAll();
    //   },
    //   onComplete: function() {
    //     // animateBtn.disabled = false;
    //   },
    //   easing: fabric.util.ease['easeOutQuad']
    // });

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
    } else if (src == 'group') {
      this.left = this.group.left + cp.x;
      this.top = this.group.top + cp.y;
    }
    this._updateLines();
  },
  _updateLines: function() {
    // 更新相关连线.
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
    var _this = this;
    var group = new fabric.Group([this.loadedObject, this.text], {
      left: this.left,
      top: this.top,
      hasBorders: false,
      hasControls: false,
      parentEle: this,
      isNode: true
    });
    group.on('moving', function(op) {
      _this._updateNode('group');
    });
    group.scale(act.config.opScaling).setCoords();

    this.group = group;
    this._matchMode();

    canvas.add(group);
    act.nodes.add(this);

    this.qrender && act.canvas.renderAll();
  },
  addSrcLine: function(line) {
    this.srcLine[line._id] = line;
    log.debug('node ' + this.label + ',addSrcLine:' + line._id + ',length:' + Object.keys(this.srcLine).length)
  },
  deleteSrcLineById: function(id) {
    delete this.srcLine[id];
  },
  addTargetLine: function(line) {
    this.targetLine[line._id] = line;
    log.debug('node ' + this.label + ',addTargetLine:' + line._id + ',length:' + Object.keys(this.srcLine).length)
  },
  deleteTargetLineById: function(id) {
    delete this.targetLine[id];
  },
  toggleLock: function() {
    if (this.locked == true) {
      this.unlock();
    } else {
      this.lock();
    }
  },
  lock: function() {
    this.locked = true;
    this.group.lockMovementX = true;
    this.group.lockMovementY = true;
    this.group.set('fontStyle', 'italic');
  },
  unlock: function() {
    this.locked = false;
    this.group.lockMovementX = false;
    this.group.lockMovementY = false;
    this.group.set('fontStyle', '');
  },
  setActive: function(status) {
    if (status) {
      this.active = true;
      this.group.setFill('#00E23F');
    } else {
      this.active = false;
      this.group.setFill(this.textOptions.fill);
    }
  },
  remove: function() { //删除该节点,即删除该节点所有相关的连线.再删除本身.
    for (var sl in this.srcLine) {
      this.srcLine[sl].remove();
    }
    for (var tl in this.targetLine) {
      this.targetLine[tl].remove()
    }
    act.nodes.remove(this);
    canvas.remove(this.group);
    //释放该节点.
  },
  setLabel: function(val) {
    this.label = val;
    this.text.set('text', val).setCoords();
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
  toString: function() {
    return ['Node', '_id:' + this._id, 'label:' + this.label].join(',');
  },
  get: function(property) {
    return this[property];
  },
  getOperator: function() {
    var operator = act.config.getByType(this.srcType);
    return operator;
  },
  getRcArr: function() {
    var operator = this.getOperator();
    return operator.rcArr;
  }
});
