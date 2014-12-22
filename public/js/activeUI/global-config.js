var extend = fabric.util.object.extend;
//操作对象区配置信息.
var aconfig = {
  canvas: {
    width: 1250,
    height: 550
  },
  operator: [{
    'title': '人物0',
    'img': '../images/51.svg'
  }, {
    'title': '人物1',
    'img': '../images/a.jpg'
  }, {
    'title': '人物2',
    'img': '../images/51.svg'
  }]
}
act.config = extend(act.config, aconfig);
