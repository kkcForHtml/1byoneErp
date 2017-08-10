define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/gridTableDirt'
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
							templateUrl : 'app/userCenter/permissions/dialog/views/rolelist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("roleChooseCtrl",function( $scope,amHttp,$modalInstance,transervice,uiGridConstants,httpService ){


			$scope.gridOptions = {
				columnDefs: [
					{ field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色名称'), cellClass: 'red',enableCellEdit: false},
					{ field: 'ROLE_INFO_CODE', displayName: transervice.tran('角色编码'),enableCellEdit: false}

				],
					paginationCurrentPage: 1, //当前页码
					paginationPageSize: 20, //每页显示个数
					enableSelectAll: false,
					enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
					multiSelect: false,
				//---------------api---------------------
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;

					//行选中事件
					$scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){

					});
				}
			};


			//初始化
			function init() {

				var roleName = "";
				var dataSearch = "";
				if ($scope.roleName !== undefined) {
					roleName = $scope.roleName;
				}
				if (roleName !== "") {
					 dataSearch = {
						"where": ["like","ROLE_INFO_NAME_CN",roleName]
					};
				}


				httpService.httpHelper(httpService.webApi.api, "users/roleinfo","index", "POST", dataSearch).then(function (datas) {
					$scope.gridOptions.data = [];
					if(datas.data.length){
						$scope.gridOptions.totalItems = datas.data.length;
						$scope.gridOptions.data=datas.data;

					}
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
					return Notification.error(transervice.tran('请选择您要添加的数据！'));
				}
				$modalInstance.close(rows[0]);
			};

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
