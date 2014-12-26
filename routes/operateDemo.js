var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/appendChildren', function(req, res) {
  var cid = req.query.cid;
  console.log(cid)
  var data = {
        cid: cid,
        children: [{
          type: '101',
          title: 't1',
          data: {}
        },{
          type: '101',
          title: 't2',
          data: {}
        },{
          type: '103',
          title: 't3',
          data: {}
        }]
      };
  res.send(data);
});

module.exports = router;
