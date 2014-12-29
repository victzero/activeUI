var rightClickCtrl = ['$scope', function($scope) {
  $scope.rcArr = [];
  $scope.canvas = canvas;

  $scope.menuClick = function(callback){
    act.rc.displayMenu();
    callback && callback();
  }

  angular.element(document).ready(function() {
    addAccessors($scope);
    watchCanvas($scope);
  });
}];

function addAccessors($scope) {

  $scope.rcArr = [];
}

function watchCanvas($scope) {

  function updateScope(op) {
    $scope.rcArr = op.target.rcArr;
    $scope.$$phase || $scope.$digest();
    // act.canvas.renderAll();
  }

  act.canvas.on('canvasRightClick', updateScope)
}

app.controller('rightClickCtrl', rightClickCtrl);


// angular.element(document).ready(function() {
//   var $injector = angular.bootstrap(document, ['myApp']);
//   var $controller = $injector.get('$controller');
//   var AngularCtrl = $controller('AngularCtrl');
//   AngularCtrl.setUserName();
// });

// var controllerElement = document.querySelector('[id=amenu]')
// var controllerScope = angular.element(controllerElement).scope();
// controllerScope.setUserName(26);
