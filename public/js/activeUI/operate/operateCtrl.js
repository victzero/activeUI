var operateCtrl = ['$scope', function($scope) {
  $scope.operators = [];
  $scope.canvas = canvas;

  configOperate($scope);
}];

//操作区初始化.
var configOperate = function($scope) {
  //操作对象初始化.
  $scope.operators = act.config.operators;
}

app.controller('operateCtrl', operateCtrl);

// toolbar init.
var toolbarCtrl = ['$scope', function($scope) {
  $scope.tools = [];
  $scope.canvas = canvas;

  configToolbar($scope);
}];
var configToolbar = function($scope) {
  $scope.tools = [{
    title: '移动|选择',
    active: 'active',
    mode: 'move',
    action: function() {
      act.setMode('move');
    }
  }, {
    title: '连线|拖动',
    active: '',
    mode: 'connect',
    action: function() {
      act.setMode('connect');
    }
  }, {
    title: '保存图片',
    active: '',
    mode: null, //不影响模式
    action: function() { //不影响模式,但是有直接操作.
      saveImage2Local(false);
    }
  }];

  $scope.chooseTool = function(index) {
    var tool = $scope.tools[index];
    if (tool.mode != null) { // 修改激活状态.
      tool.active = 'active';
      for (var j = 0; j < $scope.tools.length; j++) {
        if (j != index) {
          $scope.tools[j].active = '';
        }
      }
    }
    if (tool.action) {
      tool.action();
    }
  }
};

app.controller('toolbarCtrl', toolbarCtrl);

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
  if (!save) {
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
