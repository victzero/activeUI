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
      'title': '人物0',
      'img': '../images/51.svg'
    }, {
      'title': '人物1',
      'img': '../images/a.jpg'
    }, {
      'title': '人物2',
      'img': '../images/51.svg'
    }]
  }, {
    heading: 'B区',
    objs: [{
      'title': '人物10',
      'img': '../images/a.jpg'
    }, {
      'title': '人物11',
      'img': '../images/51.svg'
    }, {
      'title': '人物12',
      'img': '../images/a.jpg'
    }]
  }],
}
act.config = extend(act.config, aconfig);
