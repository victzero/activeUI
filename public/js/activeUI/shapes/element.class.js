var act = {},
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
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
    lockScalingFlip: true,
    hoverCursor: 'default',
    moveCursor: 'default',
  },
  initialize: function(options) {
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

    this._renderAll();
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
      hasControls: false
    }).scale(1).setCoords();

    this.loadedObject.on('moving', function(op) {
      _this._updateNode();
    })
  },
  _loadLabel: function() {
    var labelOpt = extend({
      left: this.left,
      top: this._getLabelTop(),
    }, this.textOptions);
    this.text = new fabric.Text(this.label, labelOpt);
  },
  _getLabelTop: function() {
    return this.top + this.height / 2 + this.textOptions.fontSize / 2;
  },
  _updateNode: function(op) {
    this.left = this.loadedObject.left;
    this.top = this.loadedObject.top;
    this.text.set({
      left: this.left,
      top: this._getLabelTop(),
    })
  },
  _renderAll: function() {
    this.loadedObject && canvas.add(this.loadedObject);
    this.text && canvas.add(this.text)
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

var _ElementNum = 0;

fabric.DefaultElement = fabric.util.createClass(fabric.Element, {
  type: 'defaultElement',
  initialize: function(options) {
    options || (options == {});
    options.strokeWidth = 5;
    options.radius = 12;
    options.fill = '#fff';
    options.stroke = '#666';
    this.callSuper('initialize', options);
    this.set('label', options.label || '');
    this.name = 'element' + _ElementNum++;
    // this.label = 'element' + _ElementNum++;

    this.set('srcLine', []); //以该对象为起点
    this.set('targetLine', []); //以该对象为终点
  },

  toString: function() {
    return this.name + ':srcLine.length-' + this.get('srcLine').length + '|targetLine.length-' + this.get('targetLine').length
  },

  _render: function(ctx) {
    this.callSuper('_render', ctx);
  }
})

fabric.DefaultElement.fromObject = function(object) {
  return new fabric.DefaultElement(object);
};


var DefaultLine = fabric.util.createClass(fabric.Line, {
  initialize: function(points, options) {
    options || (options == {});
    this.callSuper('initialize', points, options);
  },

  toString: function() {
    // this.fromObj &&
    // this.toObj **
    return 'x1:' + this.x1 + ',y1:' + this.y1 + ',x2:' + this.x2 + ',y2:' + this.y2;
  },
  _render: function(ctx) {
    this.callSuper('_render', ctx)
  }
})
