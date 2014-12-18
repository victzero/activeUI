var app = angular.module('activeUI', []); // ng-app

/**
 * angular全局配置
 */
app.config(function($interpolateProvider) {
  $interpolateProvider
    .startSymbol('{{')
    .endSymbol('}}');
});

var actGlobal = {
  _toolMode: 'move', //默认模式
  tools: [{
    title: '移动|选择',
    active: 'active',
    mode: 'move'
  }, {
    title: '连线|拖动',
    active: '',
    mode: 'connect'
  }, {
    title: '保存图片',
    active: '',
    mode: null, //不影响模式
    action: function() { //不影响模式,但是有直接操作.
      saveImage2Local(false);
    }
  }],
  setMode: function(mode) {
    if (mode) {
      (this._toolMode = mode);
      log.debug('切换到模式:' + mode);
    }
  },
  isMove: function() {
    return this._toolMode === 'move';
  },
  isConnect: function() {
    return this._toolMode === 'connect';
  }
};

/**
 * 自定义drag drop属性,允许指定的html标签可拖拽.
 */
app.directive('draggable', function() {
  return function(scope, element) {
    // this gives us the native JS object
    var el = element[0];
    el.draggable = true;
    el.addEventListener('dragstart', function(e) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('Text', this.id);
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

/**
 * [saveImage2Local description]
 * 保存图片到本地.
 * @param {boolean} save true为保存到本地,false为新窗口中打开
 * @return {[type]} [description]
 */
function saveImage2Local(save) {
  // 图片导出为 png 格式
  var type = 'png';
  var imgData = canvas.toDataURL(type);
  if(!save){
    window.open(imgData)
    return;
  }
  // 加工image data，替换mime type
  imgData = imgData.replace(_fixType(type), 'image/octet-stream');
  // 下载后的问题名
  var filename = 'activeUI_' + (new Date()).getTime() + '.' + type;
  // download
  saveFile(imgData, filename);
};
/**
 * 获取mimeType
 * @param  {String} type the old mime-type
 * @return the new mime-type
 */
var _fixType = function(type) {
  type = type.toLowerCase().replace(/jpg/i, 'jpeg');
  var r = type.match(/png|jpeg|bmp|gif/)[0];
  return 'image/' + r;
};
/**
 * 在本地进行文件保存
 * @param  {String} data     要保存到本地的图片数据
 * @param  {String} filename 文件名
 */
var saveFile = function(data, filename) {
  var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
  save_link.href = data;
  save_link.download = filename;

  var event = document.createEvent('MouseEvents');
  event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  save_link.dispatchEvent(event);
};
