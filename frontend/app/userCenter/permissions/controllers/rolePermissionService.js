define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/gridTableDirt',
		'app/userCenter/roleManagement/controllers/roleInfo_edit_service',
	],
	function(angularAMD) {

		angularAMD.service(
			'rolePermissionService',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation : true,
							controller : "rolePermissionListCtrl",
							backdrop:"static",
							size:"lg",//lg,sm,md,llg,ssm
							templateUrl : 'app/userCenter/permissions/views/rolepermissionlist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("rolePermissionListCtrl",function( $scope,amHttp,model,$modalInstance,transervice,uiGridConstants,httpService,commonService,gridDefaultOptionsService,roleInfo_edit_service ){


			$scope.gridOptions = {
				columnDefs: [
					{ field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色'), enableCellEdit: false,cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.editRole(row.entity)">{{row.entity.ROLE_INFO_NAME_CN}}</a>' },
					{ field: 'SUBSYSTEM', displayName: transervice.tran('子系统'),enableCellEdit: false },
					{ field: 'FUNC_MODULE', displayName: transervice.tran('模块'), enableCellEdit: false},
					{ field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'),  enableCellEdit: false },
					{field: 'PERMISSION_NAME_CN', displayName: transervice.tran('权限名'), enableCellEdit: false},
					{ field: 'AUTHORISATION_STATE', displayName: transervice.tran('权限状态'),  enableCellEdit: false,
						cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getStateName(row.entity.AUTHORISATION_STATE)}}</div>'

					/*cellTemplate:
						'<label ng-if="row.entity.AUTHORISATION_STATE==1">有权</label>'+
						'<label ng-if="row.entity.AUTHORISATION_STATE==0">无权</label>'*/}
				],
				paginationPageSize: 10, //每页显示个数
				//---------------api---------------------
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;
					//分页按钮事件
					gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
						if(newPage) {
							$scope.gridOptions.getPage(newPage, pageSize);
						}
					});
					//行选中事件
					$scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
						if(row){

							//$modalInstance.close(row.entity);
						}
					});
				}

			};
			gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
			$scope.permissionState = [{"D_VALUE":1,"D_NAME_CN":"有权"},{"D_VALUE":0,"D_NAME_CN":"无权"}];
			$scope.roleTypeList = commonService.getDicList("ROLE_INFO");
			if(model){
				$scope.model = angular.copy(model);
				$scope.roleName = $scope.model.ROLE_INFO_NAME_CN;
			}
			//初始化
			function init(currentPage, pageSize) {
				var roleName = "";
				if ($scope.roleName !== undefined) {
					roleName = $scope.roleName;
				}
				var dataSearch = {
					"ROLE_INFO_NAME_CN": roleName,
					"limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
					"page":currentPage ? currentPage : 1
				};

				httpService.httpHelper(httpService.webApi.api, "users/roleinfo","getrolepermissioninfo", "POST", dataSearch).then(function (datas) {
					$scope.gridOptions.data = [];
					if(datas.data.length){
						$scope.gridOptions.totalItems = datas._meta.totalCount;
						$scope.gridOptions.data=datas.data;
						if (!currentPage) {
							$scope.gridOptions.paginationCurrentPage = 1;
						}


					}
				})
			}
			//初始化
			init();

			$scope.getStateName = function(value){
				var permissionState = $scope.permissionState.filter(t=>t.D_VALUE == value);
				if(permissionState.length){
					return permissionState[0].D_NAME_CN;
				}
				return "";
			};
			//刷新查询
			$scope.searchRole = function () {
				$scope.gridOptions.paginationCurrentPage = 1;
				init();
			}

			$scope.gridOptions.getGridApi=function(gridApi){
				$scope.gridApi=gridApi;
			};

			//切换页码
			$scope.gridOptions.getPage=function(pageNo,pageSize){
				init(pageNo,pageSize);
			};

			//取消
			$scope.cancel = function () {
				$modalInstance.dismiss(false);
			}

			//编辑角色
			$scope.editRole = function(item){
				var selectWhere = {
					"where":["=","u_role_info.ROLE_INFO_ID",item.ROLE_INFO_ID],
					"joinwith":["u_role_user","u_userinfo"],
					"distinct": true
				};
				var model = null;
				httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "view", "POST",selectWhere).then(
					function (result){
						model = result.data;
						model["roleTypeList"] = $scope.roleTypeList;
						roleInfo_edit_service.showDialog(model).then(function(data){
							$scope.gridOptions.paginationCurrentPage=1;
							init();
						});
					});
			};

			/*//编辑角色
			$scope.editRole = function(item){
				item["roleTypeList"] = $scope.roleTypeList;
				roleInfo_edit_service.showDialog(item).then(function(data){
					$scope.gridOptions.paginationCurrentPage=1;
					init();
				});
			};*/

		});


	})
