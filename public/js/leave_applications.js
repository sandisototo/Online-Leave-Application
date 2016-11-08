angular.module('leave_applications', ['ngMaterial','MyModule', 'ngCookies'])
    .controller('leaveController',  ['$scope', '$http',  '$mdSidenav', '$mdDialog', '$mdToast','$cookieStore', '$window', 'SharedProperties',  '$timeout' , function($scope, $http,  $mdSidenav, $mdDialog, $mdToast, $cookieStore, $window, SharedProperties, $timeout){
        var self = this;
        $scope.user_data = [];
        $scope.application_posted = false;
        $scope.leave_filter = true;
        $scope.number_of_days = false;
        //user session containing all their information
        if($cookieStore.get('user_data')){
            $scope.user_data = $cookieStore.get('user_data');
        }
        console.log($scope.user_data);
        $scope.$watch('user_data', function() {
          if($scope.user_data.length === 0){

            delete $cookieStore["user_data"];
            $window.location.href = '/login';

        }

        }, true);
        /*Done Setting all user information*/

        $scope.data =0;

        $scope.displayDialog = displayDialog;
        $scope.displayError = displayError;
        $scope.simpleToastBase = simpleToastBase;
        //user Data Sessin display
        $scope.toggleList = function (){
              $mdSidenav('left').toggle();
         }
        load();

   $scope.select_leave_status=  function (value){
         $scope.leave_filter = true;
         $scope.number_of_days = false;
          $scope.select = value;
          $scope.toggleList();
    }

     $scope.logout = function(){

          delete $cookieStore["user_data"];
          $window.location.href = '/login';
     }
 
    function displayDialog(operacion, data, event) {
        //console.log(data); return false;
        var tempData = undefined;
        if (data === undefined) {
            tempData = {};
        } else {
          var status = data.status;
          var display_status = "Approved by lead.";
          if( status === 1){
              display_status = "Approved";
          }else if (status === 3 ) {
              display_status = "Pending";
          }else if (status === 0) {
              display_status = "Declined";
          }
            tempData = {
                leave_hash: data.leave_hash,
                reason: data.reason,
                lead_id: data.lead_id,
                leave_type_id: data.leave_type_id,
                status: display_status,
                reason_for_declined: data.reason_for_declined,
                lead_comment: data.lead_comment,
                date_from:   new Date(data.date_from),
                date_to: new Date(data.date_to),
            };
        }
        $mdDialog.show({
            templateUrl: 'editor.html',
            targetEvent: event,
            locals: {
                selectedItem: tempData,
                dataTable:   $scope.select.content,
                operacion: operacion
            },
            bindToController: true,
            controller: DialogController,
            parent: angular.element(document.body)
        })
        .then(
            function (result) {
                displayError(result);
            }
        );
    }


      $scope.leave_days = function(){

        $scope.leave_filter = false;
        $scope.number_of_days = true;

        $scope.user_all_leave_days = {
          annual : 12,
  				sick : 10,
  				family: 4,
  				special:8,
  				study:20
        };

        var params = {
          'staff_id':$scope.user_data.id,
       }

       $http.post(SharedProperties.leave_api_url+'leave_type/get_all_number_of_days_left', params)
       .success(function(data, status){
           var formatted_data = angular.fromJson(data);
           angular.forEach(formatted_data.leave_types, function(value, key) {

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
           .error(function(data, status) {
              console.log("Error loading leave days ");
           })
           .finally(function() {
               console.log("Leave days loaded.");
           });
      }

    function DialogController($scope, $mdDialog, operacion, selectedItem, dataTable) {
      $scope.onlyWeekendsPredicate = function(date) {
        var day = date.getDay();
        return day === 1 || day === 2 || day === 3 || day === 4 || day === 5 ;
      }
      //console.log(selectedItem); return false;
      $scope.user_data = $cookieStore.get('user_data');
        $scope.select = {
            content: dataTable,
            application: selectedItem,
            operacion: 'New application'
        };

      $http.get(SharedProperties.leave_api_url+'leave/get_all_leads').
      success(function(data) {
          $scope.leads = [];
          angular.forEach(data.leads, function(value, key) {
              $scope.leads.push(data.leads[key].staff);
          });
      }).
      error(function(data) {
          console.log(data);
      });

      $http.get(SharedProperties.leave_api_url+'leave_type/get_all_types').
      success(function(data) {

        $scope.leave_types = data.leave_types;
        //console.log(data.leave_types);
      }).
      error(function(data) {
          console.log(data);
      });

        //Determinando el tipo de operacion que es
        switch (operacion) {
            case 'C':
                $scope.select.operacion = 'New application';
                break;
            case 'UD':
                $scope.select.operacion = 'Update';
                break;
            case 'R':
                $scope.select.operacion = 'Details';
                break;
            default:
                $scope.select.operacion = 'Details';
                break;
        }

        //Metodos del controller del cuadro de dialogo
        $scope.calculate_num_days = calculate_num_days;
        $scope.back = back;
        $scope.save = save;
        $scope.update = update;
        $scope.check_leave_days = check_leave_days;
        $scope.new_application = new_application;
        $scope.delete = remove;

        function calculate_num_days(date_from,date_to){

            var iWeeks, iDateDiff, iAdjust = 0;
            if (date_to < date_from) return -1; // error code if dates transposed
            var iWeekday1 = date_from.getDay(); // day of week
            var iWeekday2 = date_to.getDay();
            iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
            iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
            if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
            iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
            iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;
            iWeeks = Math.floor((date_to.getTime() - date_from.getTime()) / 604800000)

            if (iWeekday1 <= iWeekday2) {
              iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
            } else {
              iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
            }

            iDateDiff -= iAdjust // take into account both days on weekend

            $scope.dayDifference = iDateDiff + 1; // add 1 because dates are inclusive
          
        }
       
        function back() {
            $mdDialog.cancel();
        }

        //Choose what view to render
        function save(application, operacion) {
                $scope.application_posted = true;
                if(operacion === "Update")
                    update(application);
                  else {
                    new_application(application);
                  }
        }
        //check leave days
        function check_leave_days(leave_type_id, date_from , date_to, callback){

          var params = {
            'staff_id':$scope.user_data.id,
            'leave_type_id':leave_type_id,
            'date_from':date_from,
            'date_to': date_to,
         }

         $http.post(SharedProperties.leave_api_url+'leave_type/check_leave_days', params)
         .success(function(data, status){
             var formatted_data = angular.fromJson(data);
               //console.log(formatted_data.status); return false;
                return callback(formatted_data.status);

             })
             .error(function(data, status) {
                console.log("Error checking number of days");
             })
             .finally(function() {
                 console.log("Number of days checked.");
             });
        }

        //new leave application
        function new_application(application){
            date_from =  moment(application.date_from).format("YYYY-MM-DD HH:mm:ss");
            date_to =  moment(application.date_to).format("YYYY-MM-DD HH:mm:ss");
             $scope.check_leave_days(application.leave_type_id, date_from , date_to, function(status){
                 var message = "";
                  if(status){
                      var params = {
                        'staff_id':$scope.user_data.id,
                        'lead_id':application.lead_id,
                        'leave_type_id':application.leave_type_id,
                        'date_from':date_from,
                        'date_to': date_to,
                        'reason': application.reason,
                     }
                    $http.post(SharedProperties.leave_api_url+'leave/new', params)
                    .success(function(data, status){
                        var formatted_data = angular.fromJson(data);

                        if(formatted_data.status){
                          message = "Success! Your leave application has been submitted. ";
                        }else{
                          message = "Error: There was an error trying to apply for a leave!";
                        }
                        $mdDialog.hide(message);
                        //simpleToastBase(message, 'bottom right', 10000, 'X');
                          console.log(formatted_data);
                        })
                        .error(function(data, status) {

                        })
                        .finally(function() {
                            load();
                            console.log("finally applied for leave.");
                        });
                  }else{
                    message = "Error: Sorry, the leave days exceeds the amount of leave days left for this type of leave.";
                     $mdDialog.hide(message);
                  }

             });



        }

        //Update Leave Application
        function update(application) {
            //console.log(application);
            date_from =  moment(application.date_from).format("YYYY-MM-DD HH:mm:ss");
            date_to =  moment(application.date_to).format("YYYY-MM-DD HH:mm:ss");
            var params = {
              'leave_hash' : application.leave_hash,
              'lead_id':application.lead_id,
              'leave_type_id':application.leave_type_id,
              'date_from':date_from,
              'date_to': date_to,
              'reason': application.reason,
           }

           $http.post(SharedProperties.leave_api_url+'leave/staff_update_leave', params)
           .success(function(data, status){
               var formatted_data = angular.fromJson(data);
               var message = "";
               if(formatted_data.status){
                 message = "Success! Your leave application has been Updated. ";
               }else{
                 message = "Error: There was an error trying to Update your leave!";
               }
               $mdDialog.hide(message);
               })
               .error(function(data, status) {

               })
               .finally(function() {
                   load();
                   console.log("finally updated leave.");
               });

        }


        function remove() {

        }
    }



    function displayError(msg) {
        simpleToastBase(msg, 'bottom right', 6000, 'X');
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

  function load(){

          var params = {
          'staff_id':$scope.user_data.id
        }

            $http.post(SharedProperties.leave_api_url+'leave/get_all_staff_leave', params).
            success(function(data) {

                $scope.data = data.staff_leave_applications;

                var all_content = $scope.data;
                var pending_content = [];
                var declined_content = [];
                var approved_content = [];

                var pending_content_index = 0;
                var declined_content_index = 0;
                var approved_content_index = 0;

                angular.forEach($scope.data, function(value, key) {

                      if(  value.status == 3 || value.status == 2){

                          pending_content[pending_content_index] = value;
                          pending_content_index++;

                      }else if (value.status == 1) {

                          approved_content[declined_content_index] = value;
                          declined_content_index++;
                      }else if (value.status == 0){

                          declined_content[approved_content_index] = value;
                          approved_content_index++;
                      }

                });
              //console.log($scope.data );
                $scope.leave_applications = [
                    {
                        name: 'All',
                        content: all_content
                    },
                    {
                        name: 'Pending',
                        content: pending_content
                    },
                    {
                        name: 'Approved',
                        content: approved_content
                    },
                    {
                        name: 'Declined',
                        content: declined_content
                    }
                ];
                $scope.select = $scope.leave_applications[0];
                //console.log($scope.leave_applications );
            }).
            error(function(data) {
              $scope.loginErrorToast("ERROR: Server is not responding. Please try again later. ")
   					 $timeout(function(){
   						 delete $cookieStore["user_data"];
   						 $window.location.href = '/login';
   					 }, 2000);
            });
        };

        $scope.loginErrorToast = function(message) {
              $mdToast.show(
                  $mdToast.simple()
                      .content(message)
                      .position('bottom right')
                      .hideDelay(10000)
                      .action('X')
              );
          };




    }]);
