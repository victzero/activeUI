var rightClickCtrl = ['$scope', function($scope) {
  $scope.rcArr = [];
  $scope.canvas = canvas;

  $scope.menuClick = function(callback) {
    act.rc.displayMenu();
    callback && callback();
  }

  angular.element(document).ready(function() {
    addAccessors($scope);
    watchCanvas($scope);
  });

  function watchCanvas($scope) {

    function updateScope(op) {
      $scope.rcArr = op.target.getRcArr();
      $scope.$$phase || $scope.$digest();
      // act.canvas.renderAll();
    }

    // console.log('add listener on canvasRightClick')
    act.canvas.on('canvasRightClick', updateScope)
  }
}];

function addAccessors($scope) {

  $scope.rcArr = [];
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
