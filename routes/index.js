var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
                      title : 'Home',
                      page : 'Leave History',
                      sub : ''
                     }
                  );
});

module.exports = router;
