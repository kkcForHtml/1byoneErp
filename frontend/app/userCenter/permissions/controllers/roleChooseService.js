define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/gridTableDirt',
		'app/common/Services/messageService',
	],
	function(angularAMD) {

		angularAMD.service(
			'roleChooseService',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation : true,
							controller : "roleChooseCtrl",
							backdrop:"static",
							size:"md",//lg,sm,md,llg,ssm
							templateUrl : 'app/userCenter/permissions/views/rolelist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("roleChooseCtrl",function( $scope,amHttp,Notification,$modalInstance,messageService,transervice,uiGridConstants,httpService,gridDefaultOptionsService ){


			$scope.gridOptions = {
				columnDefs: [
					{ field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色名称'),enableCellEdit: false},
					{ field: 'ROLE_INFO_CODE', displayName: transervice.tran('角色编码'),enableCellEdit: false}

				],

					//enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
					paginationPageSize: 10, //每页显示个数
					multiSelect: false,
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

					});
				}
			};

			gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
			//初始化
			function init(currentPage, pageSize) {

				var roleName = "";
				var dataSearch = "";
				if ($scope.roleName !== undefined) {
					roleName = $scope.roleName;
				}
				var dataSearch = {
						"where": ["like","ROLE_INFO_NAME_CN",roleName],
						 "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize
					};



				httpService.httpHelper(httpService.webApi.api, "users/roleinfo","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
					$scope.gridOptions.data = [];

					//if(datas.data.length){
						$scope.gridOptions.totalItems = datas._meta.totalCount;
						$scope.gridOptions.data=datas.data;
						if (!currentPage) {
							$scope.gridOptions.paginationCurrentPage = 1;
						}

					//}
				})
			}
			//初始化
			init();

			//查询
			$scope.searchRoleList = function () {
				$scope.gridOptions.paginationCurrentPage = 1;
				init();
			}

			//确定
			$scope.confirm = function(){
				var rows = $scope.gridApi.selection.getSelectedRows();
				if (!rows.length) {
					return Notification.error(transervice.tran(messageService.error_empty));
				}
				$modalInstance.close(rows[0]);
			};

			$scope.gridOptions.getGridApi=function(gridApi){
				$scope.gridApi=gridApi;
			};

			$scope.gridOptions.getPage=function(pageNo,pageSize){
				init(pageNo,pageSize);
			};

			//取消
			$scope.cancel = function () {
				$modalInstance.dismiss(false);
			}




		});


	})
