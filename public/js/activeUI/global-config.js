var extend = fabric.util.object.extend;
//操作对象区配置信息.
var aconfig = {
  canvas: {
    width: 1250,
    height: 550
  },
  operators: [{
    heading: 'A区',
    objs: [{
      'type': 101,
      'title': '人物101',
      'img': '../images/51.svg',
      'rcArr': [{
        title: '删除',
        onclick: function() {
          act.rc.deleteNode();
        }
      }, {
        title: '编辑名称',
        onclick: function() {

        }
      }, {
        title: '获取数据',
        onclick: function() {
          act.rc.reserveData();
        }
      }]
    }, {
      'type': 102,
      'title': '人物102',
      'img': '../images/a.jpg',
      'rcArr': [{
        title: '删除元素',
        onclick: function() {

        }
      }, {
        title: '编辑名称',
        onclick: function() {

        }
      }, {
        title: '获取数据',
        onclick: function() {

        }
      }]
    }, {
      'type': 103,
      'title': '人物103',
      'img': '../images/51.svg',
      rcArr: [{
        title: '删除元素',
        onclick: function() {
          act.rc.deleteNode();
        }
      }]
    }]
  }, {
    heading: 'B区',
    objs: [{
      'type': 201,
      'title': '人物201',
      'img': '../images/a.jpg',
      rcArr: [{
        title: '删除元素',
        onclick: function() {
          act.rc.deleteNode();
        }
      }]
    }, {
      'type': 202,
      'title': '人物202',
      'img': '../images/51.svg',
      rcArr: [{
        title: '删除元素',
        onclick: function() {
          act.rc.deleteNode();
        }
      }]
    }, {
      'type': 203,
      'title': '人物203',
      'img': '../images/a.jpg',
      rcArr: [{
        title: '删除元素',
        onclick: function() {
          act.rc.deleteNode();
        }
      }]
    }]
  }],
}
act.config = extend(act.config, aconfig);
