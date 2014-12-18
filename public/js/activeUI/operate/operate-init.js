var operateCtrl = ['$scope', function($scope) {
  $scope.operators = [];
  $scope.canvas = canvas;

  configOperate($scope);
}];

//操作区初始化.
var configOperate = function($scope) {
  //操作对象初始化.
  $scope.operators = aconfig.operator;
}

app.controller('operateCtrl', operateCtrl);

// toolbar init.
var toolbarCtrl = ['$scope', function($scope) {
  $scope.tools = [];
  $scope.canvas = canvas;

  configToolbar($scope);
}];
var configToolbar = function($scope) {
  $scope.tools = actGlobal.tools;

  $scope.chooseTool = function(index) {
    var tool = $scope.tools[index];
    if (tool.mode != null) {
      tool.active = 'active';
      actGlobal.setMode(tool.mode);

      for (var j = 0; j < $scope.tools.length; j++) {
        if (j != index) {
          $scope.tools[j].active = '';
        }
      }
    }
    if(tool.action){
      tool.action();
    }
  }
};

app.controller('toolbarCtrl', toolbarCtrl);
