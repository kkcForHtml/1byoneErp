define(['angularAMD', "app/common/Services/UserCache", 'app/common/Services/DialogService'], function (angularAMD) {

	angularAMD.service('amHttp', ["$http", "userCache", "$rootScope", "$q", "amDialogService", function ($http, userCache, $rootScope, $q, amDialogService) {
		var callArray = new Array();
		var callCounter = 0;

		var basePath = "http://localhost:9090/";
		userCache.set("isLogin",true);//没做登录功能时设置登录状态
		var dataStream;
		this.getBasePath = function () {
			return basePath;
		};
		this.get = function (path, args) {
			var deferred = $q.defer();
			if (userCache.get("isLogin")) {
				addAjaxSign();
				$http.get(path, args)
					.then(
					function (res) {
						removeAjaxSign();
						if (res.status == 200) {
							deferred.resolve(res.data);
						} else if (res.status == 203) {
							addToQueue(deferred, "get", path, args, true);
						} else {
							deferred.reject(res);
						}
					}, function (res) {
						removeAjaxSign();
						deferred.reject(res);
					});
			}
			else {
				addToQueue(deferred, "get", path, args);
			}

			return deferred.promise;
		}

		this.post = function (path, args) {
			var deferred = $q.defer();
			if (userCache.get("isLogin")) {
				addAjaxSign();
				$http.post(path, args)
					.then(
					function (res) {
						removeAjaxSign();
						if (res.status == 200) {
							deferred.resolve(res.data);
						} else if (res.status == 203) {
							addToQueue(deferred, "post", path, args, true);
						} else {
							deferred.reject(res);
						}
					}, function (res) {
						removeAjaxSign();
						deferred.reject(res);
					});
			}
			else {
				addToQueue(deferred, "post", path, args);
			}

			return deferred.promise;
		}

		this.put = function (path, args) {
			var deferred = $q.defer();
			if (userCache.get("isLogin")) {
				addAjaxSign();
				$http.put(path, args)
					.then(
					function (res) {
						removeAjaxSign();
						if (res.status == 200) {
							deferred.resolve(res.data);
						} else if (res.status == 203) {
							addToQueue(deferred, "put", path, args, true);
						} else {
							deferred.reject(res);
						}
					}, function (res) {
						removeAjaxSign();
						deferred.reject(res);
					});
			}
			else {
				addToQueue(deferred, "put", path, args);
			}

			return deferred.promise;
		}

		this.delete = function (path, args) {
			var deferred = $q.defer();
			if (userCache.get("isLogin")) {
				addAjaxSign();
				$http.delete(path, args)
					.then(
					function (res) {
						removeAjaxSign();
						if (res.status == 200) {
							deferred.resolve(res.data);
						} else if (res.status == 203) {
							addToQueue(deferred, "delete", path, args, true);
						} else {
							deferred.reject(res);
						}
					}, function (res) {
						removeAjaxSign();
						deferred.reject(res);
					});
			}
			else {
				addToQueue(deferred, "delete", path, args);
			}

			return deferred.promise;
		}

		this.postWithoutLogin = function (path, args) {
			var deferred = $q.defer();
			addAjaxSign();
			$http.post(path, args)
				.then(function (res) {
					removeAjaxSign();
					if (res.status == 200) {
						deferred.resolve(res.data);
					} else if (res.status == 401) {
						$rootScope.$emit("relogin");
					} else {
						deferred.reject(res);
					}
				}, function (res) {
					if (res.status == 401) {
						$rootScope.$emit("relogin");
					}
					removeAjaxSign();
					deferred.reject(res);
				});
			return deferred.promise;
		}

		this.postWithoutAuth = function (path, args) {
			var deferred = $q.defer();
			addAjaxSign();
			$http.post(path, args)
				.then(function (res) {
					removeAjaxSign();
					if (res.status == 200) {
						deferred.resolve(res.data);
					} else {
						deferred.reject(res);
					}
				}, function (res) {
					if (res.status == 401) {
						$rootScope.$emit("relogin");
					}
					removeAjaxSign();
					deferred.reject(res);
				});
			return deferred.promise;
		}

		this.setAuthKey = function (key) {
			//$http.defaults.headers.common.Authorization = "Bearer " + key;
			$http.defaults.headers.common.Authorization = key;
		}

		function addToQueue(deferred, method, path, args, reqDialog) {
			//callArray.reverse();
			callArray.push({ deferred: deferred, method: method, url: path, args: args });
			//callArray.reverse();
			//未验证登录，需要重新登录
			if (userCache.get("isLogin") && reqDialog && callArray.length == 1) {
				amDialogService.alert("用户信息验证失败，请重新登录")
					.then(function () {
						$rootScope.$emit("relogin");
					}).then(function () {
						deferred.reject("relogin");
						return deferred;
					});
			}
		}

		function addAjaxSign() {
			if (!this.callCounter) {
				angular.element("body").append('<div id="ajaxSign" class="loading_div"><img src="images/spin.gif" class="loading_img"/></div>');
			}
			this.callCounter++;
		}

		function removeAjaxSign() {
			this.callCounter--;
			if (!callCounter) {
				angular.element("#ajaxSign").remove();
			}
		}

		this.addAjaxSign = function () {
			angular.element("body").append('<div id="ajaxSign" class="loading_div"><img src="images/spin.gif" class="loading_img"/></div>');
		};
		this.removeAjaxSign = function () {
			angular.element("#ajaxSign").remove();
		}

		$rootScope.$on("login-state-changed", function () {
			if (!userCache.get("isLogin")) {
				return;
			}

			while (callArray.length > 0) {
				var item = callArray.pop();
				recall(item);
			}
		});

		function recall(item) {
			if (item.method == "get") {
				addAjaxSign();
				$http.get(item.url, item.args)
					.then(
					function (res) {
						removeAjaxSign();
						if (res.status == 200) {
							item.deferred.resolve(res.data);
						} else if (res.status == 203) {
							addToQueue(item.deferred, "get", item.url, item.args);
						} else {
							item.deferred.reject(res);
						}
					}, function (res) {
						removeAjaxSign();
						item.deferred.reject(res);
					});
			}
			else if (item.method == "post") {
				addAjaxSign();
				$http.post(item.url, item.args)
					.then(
					function (res) {
						removeAjaxSign();
						if (res.status == 200) {
							item.deferred.resolve(res.data);
						} else if (res.status == 203) {
							addToQueue(item.deferred, "post", item.url, item.args);
						} else {
							item.deferred.reject(res);
						}
					}, function (res) {
						removeAjaxSign();
						item.deferred.reject(res);
					});
			}
		}

		return this;
	}]);
})









