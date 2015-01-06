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
        title: '锁定|解锁',
        click: function() {
          act.rc.toggleLock();
        }
      }, {
        title: '删除元素',
        click: function() {
          act.rc.deleteNode();
        }
      }, {
        title: '编辑名称',
        click: function() {
          act.rc.nodeEdit();
        }
      }, {
        title: '红色数据',
        click: function() {
          act.rc.reserveData({
            url: "/demo/appendChildren",
            lineOptions: {
              stroke: '#A02536',
              c_radius: 180
            }
          });
        }
      }, {
        title: '蓝色数据',
        click: function() {
          act.rc.reserveData({
            url: "/demo/appendChildren",
            lineOptions: {
              stroke: '#0076D8',
            }
          });
        }
      }, {
        title: '多条数据',
        click: function() {
          act.rc.reserveData({
            url: "/demo/appendChildrenSvg",
            lineOptions: {
              stroke: '#0076D8',
              c_radius: 220
            }
          });
        }
      }],
      dblclick: function(op) {
        // console.log('您进行了双击.' + op.node.label)
        act.rc.nodeEdit();
      }
    }, {
      'type': 102,
      'title': '人物102',
      'img': '../images/51.JPG',
      'rcArr': [{
        title: '删除元素',
        click: function() {
          act.rc.deleteNode();
        }
      }, {
        title: '编辑名称',
        click: function() {
          act.rc.nodeEdit();
        }
      }, {
        title: '获取数据',
        click: function() {
          act.rc.reserveData({
            url: "/demo/appendChildren",
          });
        }
      }, {
        title: '红色数据',
        click: function() {
          act.rc.reserveData({
            url: "/demo/appendChildrenImg",
            lineOptions: {
              stroke: '#A02536',
              c_radius: 180
            }
          });
        }
      }, {
        title: '蓝色数据',
        click: function() {
          act.rc.reserveData({
            url: "/demo/appendChildrenImg",
            lineOptions: {
              stroke: '#0076D8',
            }
          });
        }
      }]
    }, {
      'type': 103,
      'title': '人物103',
      'img': '../images/51.svg',
      rcArr: [{
        title: '删除元素',
        click: function() {
          act.rc.deleteNode();
        }
      }]
    }]
  }, {
    heading: 'B区',
    objs: [{
      'type': 201,
      'title': '人物201',
      'img': '../images/51.JPG',
      rcArr: [{
        title: '删除元素',
        click: function() {
          act.rc.deleteNode();
        }
      }]
    }, {
      'type': 202,
      'title': '人物202',
      'img': '../images/51.svg',
      rcArr: [{
        title: '删除元素',
        click: function() {
          act.rc.deleteNode();
        }
      }]
    }, {
      'type': 203,
      'title': '人物203',
      'img': '../images/51.JPG',
      rcArr: [{
        title: '删除元素',
        click: function() {
          act.rc.deleteNode();
        }
      }]
    }]
  }],
}
act.config = extend(act.config, aconfig);
