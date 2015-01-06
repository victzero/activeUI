var act = act || (act = {}),
  extend = fabric.util.object.extend;

act.nodes = {
  nodeObjs: {},
  get: function(id) {
    return this.nodeObjs[id];
  },
  add: function(node) {
    this.nodeObjs[node._id] = node;
  },
  remove: function(node) {
    delete this.nodeObjs[node._id];
  },
  setActiveNode: function(node) {
    var last = act.nodes.lastActive;
    if (last) {
      last.setActive(false);
    }
    if (node) {
      node.setActive(true);
      act.nodes.lastActive = node;
    }
  },
  showAll: function() {
    var objs = this.nodeObjs;
    var i = 0;
    for (var key in objs) {
      log.debug('node[' + i + ']:' + key +
        '\n\t\tlabel:' + objs[key].label + ',left:' + objs[key].left + ',top:' + objs[key].top +
        '\n\t\tsrcLine length:' + Object.keys(objs[key].srcLine).length +
        '\n\t\ttargetLine length:' + Object.keys(objs[key].targetLine).length);
      i++;
    }
  }
};
act.getActiveNode = function() {
  var activeObj = canvas.getActiveObject();
  if (!activeObj) {
    return null;
  }
  return activeObj.get('parentEle');
};
act.svgCache = {
  map: {},
  put: function(url, obj) {
    this.map[url] = obj;
  },
  exist: function(url) {
    return typeof this.map[url] != 'undefined';
  },
  get: function(url, cb) {
    if (!this.exist(url)) {
      return;
    }
    var sobj = this.map[url].toObject();
    fabric.PathGroup.fromObject(sobj, function(pg) {
      cb && cb(pg);
    });
  },
}


/**
 * [addNode description]
 * 添加node节点.
 * @param {[type]} options [description]
 */
act.addNode = function(options) {
  var node = new act.Node(options); //新建的对象无需调用renderAll方法,在Pic加载完成后自动render
  return node;
}

/**
 * [addNodeAround description]
 * 在指定node周围进行布局.
 * @param {[type]} node [description]
 * @param {[type]} around 只缺少x,y坐标的待添加节点的配置信息数组
 */
act.addNodeAround = function(node, aroundArr, lineOptions) {
  var srcLength = Object.keys(node.srcLine).length;
  var center = {
    x: node.left,
    y: node.top
  };
  // if (srcLength && srcLength != 0) {
  //   alert('暂时不支持在已有子节点的节点上追加节点.');
  //   return;
  // }
  var nLength = aroundArr.length;
  var angle = Math.PI * 2 / (nLength + srcLength); //两点之间的角度.
  var r = (lineOptions && lineOptions.c_radius) || act.config.radius || 120;

  var toNodeIndex = 0;
  for (var key in node.srcLine) {
    var line = node.srcLine[key];
    var toNode = line.toNode; //找到已有的目标节点.
    toNode.update({
      x: center.x + r * Math.cos(angle * toNodeIndex),
      y: center.y + r * Math.sin(angle * toNodeIndex),
    }); //移动目标节点位置.
    toNodeIndex++;
  }

  for (var i = 0; i < nLength; i++) {
    var ar = aroundArr[i];
    var end = act.addNode({
      left: center.x + r * Math.cos(angle * (i + srcLength)),
      top: center.y + r * Math.sin(angle * (i + srcLength)),
      url: ar.img,
      label: ar.title,
      srcType: ar.type,
    });
    // new act.Cline(null, lineOptions).createLink({
    //   start: node,
    //   end: end
    // });
  };
}
