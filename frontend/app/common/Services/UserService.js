define([ 'angularAMD','ng-Dialog',"app/common/Services/UserCache",'app/common/Services/AmHttp'], function(angularAMD) {
	
	var transform = function (str) {
		  if (!str){
			      return str;
			  }
		 for (var i = 3; i < str.length; i += 4)
		 {
				      var temp = str[i];
				      str[i - 3] = str[i];
				      str[i] = temp;
				      var temp = str[i-1];
				      str[i - 1] = str[i-2];
				      str[i - 2] = temp;
				  }
			  return str;
	}

	
	angularAMD.service('userLogin', [ "$q", "ngDialog", "userCache", "amHttp", "$rootScope", function ($q, ngDialog, userCache, amHttp, $rootScope) {
        
	    return function () {
	        userCache.set("loginInfo", {});
	        userCache.set("isLogin", false);
	            return ngDialog.open({
	                animation: true,
	                backdrop: false,
	                showClose: false,
	                closeByDocument: false,
	                closeByEscape: false,
	                ariaAuto: false,
	                ariaRole: false,
	                className: 'ngdialog-theme-plain login-dialog',
	                controller: "LoginDialogController",
	                template: 'views/common/loginDialog.html'
	            }).closePromise
	            .then(function (result) {
	                amHttp.setAuthKey(result.value.key);
	                var sJWS = transform(result.value.key);
	                userCache.set("key", sJWS);
	                userCache.set("loginInfo", result.value.value);
	                userCache.set("isLogin", true);

	                $rootScope.$broadcast("login-state-changed");
	            });
	        }
	}]);
	
	angularAMD.service('userLogout', ["userLogin", "userCache", "$rootScope", function (userLogin, userCache, $rootScope) {

	    return function () {
	        userCache.remove("key");
	        $rootScope.$broadcast("login-state-changed");
	        return userLogin();
	    }
	}]);
	
	
	angularAMD.service('userRefreshKey', ["userCache", "$rootScope", "amHttp", "userLogin", "amDialogService", function (userCache, $rootScope, amHttp, userLogin, amDialogService) {
	    return function () {
	        return amHttp.postWithoutLogin("auth/login/refreshUserInfo").then(function (result) {
	            if (result&&result.success) {
	                userCache.set("isLogin", true);
	                userCache.set("loginInfo", result.value);
	                amHttp.setAuthKey(result.key);
	                var sJWS = transform(result.key);
	                userCache.set("key", sJWS);
	                $rootScope.$broadcast("login-state-changed");
	            }
	            else {
					if(result){
						amDialogService.alert(result.message)
							.then(function () {
								var flag=$("body").hasClass("ngdialog-open");

								userCache.set("isLogin", false);
								userCache.remove("loginInfo");
								userCache.remove("key");
								amHttp.setAuthKey("");
                               if(!flag){
								   userLogin();
							   }

							});
					}else{
						var flag=$("body").hasClass("ngdialog-open");
						userCache.set("isLogin", false);
						userCache.remove("loginInfo");
						userCache.remove("key");
						amHttp.setAuthKey("");
						if(!flag){
							userLogin();
						}
					}

	            }
	        });
	    }
	}]);

	angularAMD.service('userInitFromCache', ["userCache", "userRefreshKey", "amHttp", function (userCache, userRefreshKey, amHttp) {
	    return function () {
	        userCache.set("isLogin", false);
	        var keyStr = userCache.get("key");
	        if (keyStr)
	        {
	            var key = transform(keyStr);
	            amHttp.setAuthKey(keyStr);
	        }
	        userRefreshKey();
	    }
	}]);


	angularAMD.controller("LoginDialogController", ["$scope", "amHttp", "$sce","loginCache", "$state",
	    function ($scope, amHttp, $sce, loginCache, $state) {

	        $scope.userName = loginCache.get("userName");
	        //$scope.passWord = loginCache.get("passWord");

	        function createGuid() {
	            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	                return v.toString(16);
	            });
	        }

	        var guid = createGuid();

	        function getValidateImageUrl()
	        {
	            var url = "auth/captcha?id=" + Math.round(Math.random() * 10) + "&guid=" + guid;
	            return url;
	            //return $sce.trustAsResourceUrl(url)
	        }

	        $scope.validateImageUrl = getValidateImageUrl();

	        $scope.refreshValidateCode = function () {
	            $scope.validateImageUrl = getValidateImageUrl();
	        }

	        $scope.doLogin = function () {

	            if (!$scope.userName)
	            {
	                $scope.errorMessage = "请输入用户名。";
	                $scope.validateImageUrl = getValidateImageUrl();
	                return;
	            }
	            else if (!$scope.passWord)
	            {
	                $scope.errorMessage = "请输入密码。";
	                $scope.validateImageUrl = getValidateImageUrl();
	                return;
	            }

	            amHttp.postWithoutAuth("auth/login/doLogin", { 'userName': $scope.userName, 'passWord': $scope.passWord, 'validateCode': $scope.validateCode,'Guid':guid })
	                .then(function(result){
	                    if(!result.success)
	                    {
	                        $scope.errorMessage = result.message;
	                        $scope.validateImageUrl = getValidateImageUrl();
	                    }
	                    else
	                    {
	                        loginCache.set("userName", $scope.userName);
	                        //loginCache.set("passWord", $scope.passWord);
	                        $scope.closeThisDialog(result);
	                        $state.go("main", null, {reload:true});
	                    }
	                    
	                });
	            
	    };
	}]);
	
	angularAMD.service('UserService', ["$rootScope", function ($rootScope) {
		  var isLogin = true;

		  var userInfo = {};

		  this.isLogin = function(){
		    return isLogin;
		  }

		  this.getUserInfo = function()
		  {
		    if(isLogin)
		    {
		      return null;
		    }
		    return userInfo;
		  }

		  this.login = function(info)
		  {
		    isLogin = true;
		    userInfo = info;
		    $rootScope.$emit("login-state-changed");
		  }

		  this.logout = function(){
		    isLogin = false;
		    userInfo = {};

		    $rootScope.$emit("login-state-changed");
		  }

		  return this;
		}]);
	
	
})





