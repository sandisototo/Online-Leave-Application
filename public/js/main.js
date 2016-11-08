angular.module('starterApp', ['ngMaterial','angular-loading-bar', 'login', 'leave_applications']).run(function($log){
        $log.debug("MyApp is ready!");
      }).config(function($mdThemingProvider, $mdIconProvider){

          $mdThemingProvider.theme('default')
              .primaryPalette('purple')
              // default shades
              .accentPalette('purple', {
                'default': '500' // use shade 200 for default, and keep all other shades the same
              });
      })
      .service("SharedProperties", function () {
        var enviroment = "live";

        var api_urls   = {};


        if(enviroment === "dev"){

          api_urls   = {
                leave_api_url : "http://localhost:3000/",
                message_api_url : "",
          };

        }else{
          api_urls  = {
                leave_api_url : "http://lapi.rlabs.org/",
                message_api_url : "",
          };

        }

         return api_urls;
});
