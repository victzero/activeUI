/**
 * 声明全局变量act的命名空间.
 * 声明app为angular主模块.
 * @type {[type]}
 */
var app = angular.module('activeUI', ['ui.bootstrap.showErrors']); // ng-app
var act = act || (act = {});

act.util = act.util || (act.util = {});
act.util = {
  extend: function(destination, source, needCopy) {
    needCopy && (destination = JSON.parse(JSON.stringify(destination)));
    for (var property in source) {
      destination[property] = source[property];
    }
    return destination;
  },
  clone: function(object) {
    return extend({}, object);
  }
};

extend = act.util.extend;

/**
 * angular全局配置
 */
app.config(function($interpolateProvider) {
  $interpolateProvider
    .startSymbol('{{')
    .endSymbol('}}');
});

var actMode = {
  _toolMode: 'move', //默认模式
  _set2MoveMode: function(canvas) {
    canvas.selection = true;
    canvas.moveCursor = 'move';
    canvas.hoverCursor = 'move';
    var objs = canvas.getObjects()
    for (var i = objs.length - 1; i >= 0; i--) {
      objs[i].lockMovementX = false;
      objs[i].lockMovementY = false;
    };
    canvas.renderAll();
  },
  _set2ConnectMode: function(canvas) {
    //移动模式结束时需要取消所有选中的对象.
    canvas.selection = false; //禁止选中

    //禁止拖拽
    canvas.moveCursor = 'default';
    canvas.hoverCursor = 'default';
    var objs = canvas.getObjects()
    for (var i = objs.length - 1; i >= 0; i--) {
      objs[i].lockMovementX = true;
      objs[i].lockMovementY = true;
    };
    canvas.renderAll();
  },
  setMode: function(mode) {
    if (mode) {
      (this._toolMode = mode);
      canvas.deactivateAll();
      log.debug('切换到模式:' + mode);

      if (mode == 'move') {
        act._set2MoveMode(act.canvas);
      }
      if (mode == 'connect') {
        act._set2ConnectMode(act.canvas);
      }
    }
  },
  isMoveMode: function() {
    return this._toolMode === 'move';
  },
  isConnectMode: function() {
    return this._toolMode === 'connect';
  }
};
act = extend(act, actMode);

// act.wheel = {
//   now: 1, //实时缩放比例.
//   offset: 500, //缩放影响比例.
//   effect: 300, //每次滚动缩放值.
//   min: 0.2, //最小缩放比例
//   minCnt: Math.floor((1 - this.min) / (_wheelEach / _wheelChange)),
//   maxCnt: 10,
// }

act.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };
})();

act.stopEvent = function(ev) {
  if (ev) {
    ev.preventDefault && ev.preventDefault();
    ev.stopPropagation && ev.stopPropagation();
  }
}

//默认配置.
act.config = {
  canvas: {
    width: 1250,
    height: 550
  },
  operators: [], //操作对象区配置信息.
  opScaling: 1, //加载对象的默认缩放值.
  getByType: function(type) { //根据type获得到operate.
    //FIXME:可以增加缓存.
    var ops = act.config.operators;
    for (var i = ops.length - 1; i >= 0; i--) {
      var objs = ops[i].objs;
      for (var j = 0; j < objs.length; j++) {
        var t = objs[j].type;
        if (t == type) {
          return objs[j];
        }
      }
    };
  },
  lineOptions: {
    fill: 'black',
    stroke: '#444', //此处为默认颜色.TODO:绘制线条时可定制颜色,
    strokeWidth: 2,
    selectable: false
  },
}

/**
 * 自定义drag drop属性,允许指定的html标签可拖拽.
 */
app.directive('draggable', function() {
  return function(scope, element) {
    // this gives us the native JS object
    var el = element[0];
    el.draggable = true;
    el.addEventListener('dragstart', function(e) {
      act.rc.displayMenu();

      e.dataTransfer.effectAllowed = 'move';
      var $this = $(this);
      var pindex = $this.data('pindex');
      e.dataTransfer.setData('pindex', pindex);

      var index = $this.data('index');
      e.dataTransfer.setData('index', index);
      this.classList.add('drag');
      return false;
    }, false);
    el.addEventListener('dragend', function(e) {
      this.classList.remove('drag');
      return false;
    }, false);
  }
});
app.directive('droppable', function() {
  return {
    //We need to update the scope object
    //so that it includes the bin attribute we added to the mark up:
    scope: {
      drop: '&',
      bin: '=' // bi-directional scope
    },
    link: function(scope, element) {
      // again we need the native object
      var el = element[0];
      el.addEventListener('dragover', function(e) {
        log.debug('dragover element:' + el.tagName)
        e.dataTransfer.dropEffect = 'move';
        // allows us to drop
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        this.classList.add('over');
        return false;
      }, false);
      el.addEventListener('dragenter', function(e) {
        log.debug('dragenter element:' + el.tagName)
        this.classList.add('over');
        return false;
      }, false);
      el.addEventListener('dragleave', function(e) {
        log.debug('dragleave element:' + el.tagName)
        this.classList.remove('over');
        return false;
      }, false);
      el.addEventListener('drop', function(e) {
        log.debug('drop to element:' + el.tagName)
          // Stops some browsers from redirecting.
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        this.classList.remove('over');

        var item = document.getElementById(e.dataTransfer.getData('Text'));
        // this.appendChild(item);
        scope.$apply(function(scope) {
          var fn = scope.drop();
          if ('undefined' !== typeof fn) {
            fn(item);
          }
        });
        return false;
      }, false);
    }
  }
});


if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}
