angular.module('preapprove', ['ngMaterial','MyModule'])
.config(function($mdThemingProvider, $mdIconProvider){

    $mdThemingProvider.theme('default')
        .primaryPalette('purple')
        // default shades
        .accentPalette('purple', {
          'default': '500' // use shade 200 for default, and keep all other shades the same
        });
})
  .controller('DemoCtrl', function($scope,$http, $mdToast,$location) {
    var enviroment = "live";

    var api_urls   = {};


    if(enviroment === "dev"){

      api_urls   = {
            leave_api_url : "http://localhost:3000/",
            message_api_url : "",
      };

    }else{
      api_urls   = {
            leave_api_url : "http://lapi.rlabs.org/",
            message_api_url : "",
      };
    }

    $scope.leave_hash = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

    $scope.lead_response = {
      status: 2,
      reason: '',
      leave_hash: ''

    };

    $scope.reason_input = false;

    $scope.showReasonInput = function(){
      $scope.reason_input = true;
    };
    $scope.hideReasonInput = function(){
      $scope.reason_input = false;
    };
    leave_days();
    console.log("working ");
    $scope.lead_preapprove = lead_preapprove;
    $scope.simpleToastBase = simpleToastBase;
    $scope.bottonDisable = false;

    //my

     function leave_days(){

      $scope.user_all_leave_days = {
        annual : 12,
        sick : 10,
        family: 4,
        special:8,
        study:20
      };

     console.log($scope.leave_hash);


     var params = {

          'leave_hash' :$scope.leave_hash
       }

     $http.post(api_urls.leave_api_url+'leave/get_leave',params)
       .success(function(data, status){

           var formatted_data = angular.fromJson(data);
           var staff_id = formatted_data.leave_details['id'];
           var params = {
                'staff_id' :staff_id
           }

     $http.post(api_urls.leave_api_url+'leave_type/get_all_number_of_days_left', params)
     .success(function(data, status){
         var formatted_data = angular.fromJson(data);
         angular.forEach(formatted_data.leave_types, function(value, key) {
              console.log(value.text);
              if(value.leave_type_id === 2){
                  $scope.user_all_leave_days.sick = value.num_days;
              }else if (value.leave_type_id === 1) {
                    $scope.user_all_leave_days.annual = value.num_days;
              }else if (value.leave_type_id === 3) {
                      $scope.user_all_leave_days.family = value.num_days;
              }else if (value.leave_type_id === 4) {
                      $scope.user_all_leave_days.special = value.num_days;
              }else if (value.leave_type_id === 5) {
                      $scope.user_all_leave_days.study = value.num_days;
              }
          });

         })
      })
         .error(function(data, status) {
            console.log("Error loading leave days ");
         })
         .finally(function() {
             console.log("Leave days loaded.");
         });
    }

    //end my

    function lead_preapprove(lead_response) {

          $scope.bottonDisable = true;


        var params = {

          'leave_hash' : lead_response.leave_hash,
          'lead_comment': lead_response.reason,
          'leave_status': lead_response.status,
       }

       $http.post(api_urls.leave_api_url+'leave/preapprove', params)
       .success(function(data, status){
           var formatted_data = angular.fromJson(data);
           var message = "";
           if(formatted_data.status){
             message = formatted_data.description;
           }else{
             message = formatted_data.description;
           }
           //$mdDialog.hide(message);
           simpleToastBase(message, 'bottom right', 10000, 'X');
             //console.log(formatted_data);
           })
           .error(function(data, status) {

           })
           .finally(function() {
               load();
               console.log("finally updated leave.");
           });

    }

    function simpleToastBase(message, position, delay, action) {
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .position(position)
                .hideDelay(delay)
                .action(action)
        );
    }

  });
