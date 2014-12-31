var nodeEditCtrl = function($scope) {
  $scope.save = function() {
    $scope.$broadcast('show-errors-check-validity');

    if ($scope.nodeEditForm.$valid) {
      var title = $scope.node.name;
      if (title !== $scope.nodeTmp.label) {
        $scope.nodeTmp.setLabel(title);
      }
      // $scope.reset();
      $('#nodeEditModal').modal('hide');
    }
  };

  $scope.reset = function() {
    $scope.$broadcast('show-errors-reset');
    $scope.node = {
      name: ''
    };
  };

  angular.element(document).ready(function() {
    watchCanvas($scope);
  });

  function watchCanvas($scope) {

    function nodeEditShow() {
      var node = act.getActiveNode();
      if (!node) {
        return;
      }
      $scope.nodeTmp = node;
      $scope.node = {
        name: node.label
      };
      $('#nodeEditModal').modal(); //弹出编辑框.
      $scope.$$phase || $scope.$digest();
      // act.canvas.renderAll();
    }

    //取消编辑,关闭窗口时触发.
    function nodeEditCancle() {
      // $('#nodeEditModal').modal('hide');
    }

    act.canvas.on('nodeEditShow', nodeEditShow)
    $('#nodeEditModal').on('hide.bs.modal', nodeEditCancle);
  }

};

app.controller('nodeEditCtrl', nodeEditCtrl);

$(function() {
  $('#nodeEditModal').modal('hide'); //默认隐藏.
});
