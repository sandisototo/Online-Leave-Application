function PREAPPROVE_ROUTER(router) {
    var self = this;
    self.handleRoutes(router);

}

PREAPPROVE_ROUTER.prototype.handleRoutes= function(router) {

  router.get('/', function(req, res, next) {
  //res.send(enviroment.leave_api_url);
    res.render('login', {
                            title: 'Staff Login' ,
                          });
  });


};

module.exports = PREAPPROVE_ROUTER;
