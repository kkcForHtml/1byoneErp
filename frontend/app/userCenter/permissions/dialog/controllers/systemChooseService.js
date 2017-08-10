define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/gridTableDirt'
	],
	function(angularAMD) {

		angularAMD.service(
			'systemChooseService',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation : true,
							controller : "systemChooseCtrl",
							backdrop:"static",
							size:"lg",//lg,sm,md,llg,ssm
							templateUrl : 'app/userCenter/permissions/dialog/views/systemlist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("systemChooseCtrl",function( $scope,amHttp,model,$modalInstance,Notification,transervice,uiGridConstants,httpService ){

			$scope.condition = model;
			$scope.gridOptions = {
				columnDefs: [
					{ field: 'SUBSYSTEM', displayName: transervice.tran('子系统'), cellClass: 'red',enableCellEdit: false},
					{ field: 'FUNC_MODULE', displayName: transervice.tran('模块'),enableCellEdit: false},
					{ field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'),enableCellEdit: false}


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
						if(row){
							//$modalInstance.close(row.entity);
						}
					});
				}
			};
			//初始化
			function init() {

				var dataSearch = [];
				if ($scope.condition.length > 0) {
					dataSearch = {
						"where":["not in","BUSINESS_SYSTEM_ID",$scope.condition]
					}
				}

				httpService.httpHelper(httpService.webApi.api, "users/busines","index", "POST", dataSearch).then(function (datas) {
					$scope.gridOptions.data = [];
					if(datas.data.length){
						$scope.gridOptions.totalItems = datas.data.length;
						$scope.gridOptions.data=datas.data;

					}
				})
			}
			//初始化
			init();

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
