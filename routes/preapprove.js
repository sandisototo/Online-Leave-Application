var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:leave_hash', function(req, res, next) {
    res.send("leave_hash is set to " + req.params.leave_hash);
  res.render('preapprove', {
                          title: 'Pre-aprove' ,
                          page: 'RLabs Leave Application Confirmation',
                          sub: 'LEAD: confirm this leave application'
                        });
});

module.exports = router;
