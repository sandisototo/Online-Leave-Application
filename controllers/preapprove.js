function PREAPPROVE_ROUTER(router) {
    var self = this;
    self.handleRoutes(router);
}

PREAPPROVE_ROUTER.prototype.handleRoutes= function(router) {

  router.get('/:leave_hash/', function(req, res, next) {
  //res.send(enviroment.leave_api_url);
    res.render('preapprove', {
                            title: 'Pre-aprove' ,
                            page: 'RLabs Leave Application Confirmation',
                            sub: 'LEAD: confirm this leave application',
                            leave_hash: req.params.leave_hash
                          });
  });


};

module.exports = PREAPPROVE_ROUTER;
