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
      'img': '../images/51.svg'
    }, {
      'type': 102,
      'title': '人物102',
      'img': '../images/a.jpg'
    }, {
      'type': 103,
      'title': '人物103',
      'img': '../images/51.svg'
    }]
  }, {
    heading: 'B区',
    objs: [{
      'type': 201,
      'title': '人物201',
      'img': '../images/a.jpg'
    }, {
      'type': 202,
      'title': '人物202',
      'img': '../images/51.svg'
    }, {
      'type': 203,
      'title': '人物203',
      'img': '../images/a.jpg'
    }]
  }],
}
act.config = extend(act.config, aconfig);
