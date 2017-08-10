define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/gridTableDirt'
	],
	function(angularAMD) {

		angularAMD.service(
			'userPermissionService',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation : true,
							controller : "userPermissionListCtrl",
							backdrop:"static",
							size:"lg",//lg,sm,md,llg,ssm
							templateUrl : 'app/userCenter/permissions/dialog/views/userpermissionlist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("userPermissionListCtrl",function( $scope,amHttp,$modalInstance,transervice,uiGridConstants,httpService ){


			$scope.gridOptions = {
				columnDefs: [
					{ field: 'USERNAME', displayName: transervice.tran('用户名称'), enableCellEdit: false, cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.USERNAME}}</a>' },
					{ field: 'ORGANISATION_CODE', displayName: transervice.tran('组织编码'),  enableCellEdit: false, cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ORGANISATION_CODE}}</a>' },
					{ field: 'ORGANISATION_NAME_CN', displayName: transervice.tran('组织名称'), enableCellEdit: false, cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ORGANISATION_NAME_CN}}</a>' },
					{ field: 'SUBSYSTEM', displayName: transervice.tran('子系统'), cellClass: 'red', enableCellEdit: false },
					{field: 'FUNC_MODULE', displayName: transervice.tran('模块'),cellClass: 'red', enableCellEdit: false},
					{ field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'), cellClass: 'red', enableCellEdit: false },
					{ field: 'PERMISSION_NAME_CN', displayName: transervice.tran('权限名'), cellClass: 'red', enableCellEdit: false },
					{ field: 'STATE', displayName: transervice.tran('权限状态'), cellClass: 'red', enableCellEdit: false },
					{ field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色'), enableCellEdit: false, cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ROLE_INFO_NAME_CN}}</a>' }
				],
				paginationCurrentPage: 1, //当前页码
				paginationPageSize: 20 //每页显示个数

			};


			//初始化
			function init() {

				var userName = "";
				if ($scope.userName !== undefined) {
					userName = $scope.userName;
				}
				var dataSearch = {
					"USERNAME": userName
				};

				httpService.httpHelper(httpService.webApi.api, "users/personalr","getuserpermission", "POST", dataSearch).then(function (datas) {
					$scope.gridOptions.data = [];
					if(datas.data.length){
						$scope.gridOptions.totalItems = datas.data.length;
						$scope.gridOptions.data=datas.data;

					}
				})
			}
			//初始化
			init();

			//刷新查询
			$scope.searchUserPermission = function () {
				$scope.gridOptions.paginationCurrentPage = 1;
				init();
			}

			$scope.gridOptions.getGridApi=function(gridApi){
				$scope.gridApi=gridApi;
			};

			$scope.gridOptions.getPage=function(pageNo,pageSize){
				init();
			};

			//取消
			$scope.cancel = function () {
				$modalInstance.dismiss(false);
			}




		});


	})
