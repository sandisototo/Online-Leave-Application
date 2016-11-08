angular.module("login", ['ngMaterial','ngCookies'])

	.controller("LoginController", ['$http', '$scope', '$location', '$window', '$mdToast', '$cookieStore', 'SharedProperties', function($http, $scope,$location,$window,$mdToast, $cookieStore, SharedProperties){


		$scope.user = null;
    $scope.error = "";
    $scope.user = {
      email: "",
      password: "",
      name: "",
      surname: ""
    };

		$scope.forgot_password_email = "";

		$scope.login = function(user){
			///console.log(user); return false;
      var params = {

        'email' : user.email,
        'password':  user.password

     }


     $scope.failed = false;
     $scope.success = false;
		 $scope.forgot  = false;
     $http.post(SharedProperties.leave_api_url+'staff/staff_login', params)
     .success(function(data, status){
         //console.log(data); return false;
         var formatted_data = angular.fromJson(data);
           //console.log(formatted_data.user_details.name); return false;
         var message = "";
         if(!formatted_data.status){
            $scope.failed = true;
            $scope.error = formatted_data.description;
            massage = formatted_data.description;

         }else{
          $scope.success = true;
          $scope.user.name = formatted_data.user_details.name;
          $scope.user.surname = formatted_data.user_details.surname;
					//console.log(formatted_data.user_details);
					$cookieStore.put('user_data', formatted_data.user_details);
					$scope.leave_days();
         }

         })
         .error(function(data, status) {
					 $scope.loginErrorToast("ERROR: Server is not responding. Please try again later. ")
					 $timeout(function(){
						 delete $cookieStore["user_data"];
						 $window.location.href = '/login';
					 }, 2000);

         })
         .finally(function() {
             console.log("Logged In");
         });
		};

		$scope.leave_days = function(){
			$scope.user_data = $cookieStore.get('user_data');

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

					//console.log($scope.user_all_leave_days); return false;

				 })
				 .error(function(data, status) {
						console.log("Error loading leave days ");
				 })
				 .finally(function() {
						 console.log("Leave days loaded.");
				 });
		}

		$scope.forgot_password = function(){
			  $scope.failed = false;
			$scope.forgot = true;
		};
		$scope.reset_password = function(user_email){
			var params = {
				'email' : user_email,
		  }
			$http.post(SharedProperties.leave_api_url+'staff/reset_password', params)
			.success(function(data, status){
					//console.log(data); return false;
					var formatted_data = angular.fromJson(data);

					var message = "";
					if(!formatted_data.status){
						 message = formatted_data.description;
					}else{
						 message = formatted_data.description+" PLEASE CHECK YOUR EMAIL.";

					}
						 //simpleToastBase(message, 'bottom right', 10000, 'X');
						 $mdToast.show(
								 $mdToast.simple()
										 .content(message)
										 .position('bottom right')
										 .hideDelay(10000)
										 .action('X')
						 );
					})
					.error(function(data, status) {
						$scope.loginErrorToast("ERROR: Server is not responding. Please try again later. ")
 					 $timeout(function(){
 						 delete $cookieStore["user_data"];
 						 $window.location.href = '/login';
 					 }, 2000);
					})
					.finally(function() {
							console.log("Logged In");
					});
		};

    $scope.proceed = function(){
        $window.location.href = '/';
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
