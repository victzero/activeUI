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
