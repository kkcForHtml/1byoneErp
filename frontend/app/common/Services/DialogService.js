define([ 'angularAMD','ngload!ui.bootstrap','ng-Dialog'], function(angularAMD) {
	
	//controller
	angularAMD.controller("AmDialogServiceController", ["$scope", "$timeout", "message", "messageType",'title' ,'$sce','$modalInstance', function ($scope, $timeout, message, messageType,title, $sce,$modalInstance) {
	    switch (messageType)
	    {
	        case 1:{
	            //alert
	            $scope.errorIcon = "images/exclamation5.png";
	            $scope.isHideCancel = true;
	            $scope.title = "警告";
	            $scope.panelClass = "panel-danger";
	        } break;
	        case 2: {
	            //success
	            $scope.errorIcon = "images/agt_action_success.png";
	            $scope.isHideCancel = true;
	            $scope.title = "操作成功";
	            $scope.panelClass = "panel-success";
	        } break;
	        case 3: {
	            //confirm
	            $scope.errorIcon = "images/question3.png";
	            $scope.isHideCancel = false;
	            $scope.title = "确认";
	            $scope.panelClass = "panel-warning";
	        } break;
			case 4: {
				//confirm
				//$scope.errorIcon = "images/question3.png";
				$scope.isHideCancel = false;
				$scope.title = title;
				$scope.panelClass = "panel-success";
			} break;
	    }
	    $scope.messageText = $sce.trustAsHtml(message);
	    //$scope.messageText = message;
	    //$scope.msgArr = message.split("<br/>");

	    if (messageType == 2)
	    {
	        $timeout(function () {
	        	$modalInstance.close(true);
	        }, 10000);
	    }
	    
	  //选择
	    $scope.ok = function () {
	        $modalInstance.close(true);
	    }

	    //取消
	    $scope.cancel = function () {
	        $modalInstance.close(false);
	    }
	}]);
	

	
	angularAMD.service('amDialogService', ["$q", "$modal",'ngDialog', function ($q, $modal,ngDialog) {
	    this.alert = function (messageText) {
	        return $modal.open({
	        	animation : true,
				templateUrl : 'app/common/views/alert.html',
				backdrop:"static",
	            controller: "AmDialogServiceController",
				size:'ssm',
	            resolve: {
	                messageType: function(){
	                    return 1
	                },
	                message: function () {
	                    return messageText;
	                },
					title:function(){
						return '';
					}
	            },
	        }).result;
	    };

	    this.success = function (messageText) {
	    	 return $modal.open({
		        	animation : true,
					templateUrl :  'app/common/views/alert.html',
					backdrop:"static",
		            controller: "AmDialogServiceController",
				    size:'ssm',
		            resolve: {
		                messageType: function(){
		                    return 2
		                },
		                message: function () {
		                    return messageText;
		                },
						title:function(){
							return '';
						}
		            },
		        }).result;
	    };

	    this.confirm = function (messageText) {
	        var deferred = $q.defer();
	        $modal.open({
	        	animation : true,
				templateUrl :  'app/common/views/alert.html',
				backdrop:"static",
	            controller: "AmDialogServiceController",
				size:'ssm',
	            resolve: {
	                messageType: function(){
	                    return 3
	                },
	                message: function () {
	                    return messageText;
	                },
					title:function(){
						return '';
					}
	            },
	        }).result.then(function (data) {
	            if (data==false||data==true) {
	                deferred.resolve(data);
	            } else {
	                deferred.reject();
	            }
	        });

	        return deferred.promise
	    };
		this.tips = function (messageText,title) {
			var deferred = $q.defer();
			$modal.open({
				animation : true,
				templateUrl :  'app/common/views/tips.html',
				backdrop:"static",
				controller: "AmDialogServiceController",
				size:'ssm',
				resolve: {
					messageType: function(){
						return 4
					},
					message: function () {
						return messageText;
					},
					title:function(){
						return title;
					}
				},
			}).result.then(function (data) {
				if (data==false||data==true) {
					deferred.resolve(data);
				} else {
					deferred.reject();
				}
			});

			return deferred.promise
		};
	   
	}]);
	
	


})
