define(
	[  
	'angularAMD',
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'app/common/Services/messageService',    
	'app/index/toDoList/directives/triggerClick',
	],
	function(angularAMD) {

		angularAMD.directive('todoList',
			function() {
				return {
					restrict : 'EA',
					templateUrl: 'app/index/toDoList/views/toDoList.html',
            		controller: 'toDoListCtrl',					
				};
			});
			
			angularAMD.controller("toDoListCtrl",function( $scope,transervice,httpService,Notification){

				$scope.aa='<h1>121312</h1>';
				$scope.init = function () {
					httpService.httpHelper(httpService.webApi.api, "indexpage/indexpage", "pendingschedule", "POST").then(function (data) {
						if (data.status==200) {
							$scope.todolister = data.data;
						}
					},function (data) {
						Notification.error(transervice.tran(data.message));	
					});					
				}
				
				$scope.init();
	
			});


	})
