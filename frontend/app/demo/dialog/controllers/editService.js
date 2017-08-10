define(
	['angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/dropDownMutiSelect'
	],
	function (angularAMD) {

		angularAMD.service(
			'editService',
			function ($q, $modal) {
				this.showDialog = function (model) {
					return $modal
						.open({
							animation: true,
							controller: "editCtrl",
							backdrop: "static",
							size: "lg",//lg,sm,md,llg,ssm
							templateUrl: 'app/demo/dialog/views/edit.html?ver='+_version_,
							resolve: {

								model: function () {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("editCtrl", function ($scope, amHttp, model, $modalInstance, httpService, commonService) {

			$scope.model = model;

			//单选下拉框
			$scope.dicDataSource = {
				transport: {
					read: {
						type: "POST",
						url: httpService.webApi.api + "/common/base/dictionary/index",
						dataType: "json"
					},
					parameterMap: function (options, operation) {
						//用户列表的显示，包括查询
						var search = {
							where: { D_GROUP: 'ORGANISATION_RELATION' },
							"limit": 0
						};
						if (options.filter && options.filter.filters) {
							search = commonService.getFilter(search, options.filter.filters, options.filter.logic);
						}
						return search;
					}
				},
				schema: {
					data: function (d) {
						var list = new Array();
						angular.forEach(d.data, function (obj) {
							list.push({ "D_NAME_CN": obj.D_NAME_CN, "D_VALUE": obj.D_VALUE });
						});
						return list; //响应到页面的数据
					}
				},
				error: httpService.kendoErr,
				serverFiltering: true,
			};

			$scope.dicOptions = {
				filter: "contains",
				autoBind: false,
				dataSource: $scope.dicDataSource,
				dataTextField: "D_NAME_CN",
				dataValueField: "D_VALUE",
				optionLabel: "请选择",
				dataBound: function (el) {
					console.log(1231231)
				},
				// valueTemplate: '<span >343434343434</span>',
				// template: '<span >8888</span>'
			};
			$scope.dictionary = 1;

			$scope.mdicOptions = {
				filter: "contains",
				autoBind: false,
				dataSource: $scope.dicDataSource,
				dataTextField: "D_NAME_CN",
				dataValueField: "D_VALUE",
				optionLabel: "请选择"
			};

			$scope.mmdicOptions = {
				autoBind: false,
				filter: "contains",
				dataSource: $scope.dicDataSource,
				dataTextField: "D_NAME_CN",
				dataValueField: "D_VALUE"
			};

			$scope.mdictionary = [1, 2];

			//取消
			$scope.cancel = function () {
				$modalInstance.dismiss(false);
			}

			//保存
			$scope.save = function () {
				$scope.mdictionary;
				$modalInstance.close($scope.model);//返回数据
			}


		});


	})
