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
							templateUrl : 'app/userCenter/permissions/views/systemlist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("systemChooseCtrl",function( $scope,amHttp,model,$modalInstance,Notification,transervice,uiGridConstants,httpService,gridDefaultOptionsService ){

			$scope.condition = model;
			$scope.gridOptions = {
				columnDefs: [
					{ field: 'SUBSYSTEM', displayName: transervice.tran('子系统'),enableCellEdit: false},
					{ field: 'FUNC_MODULE', displayName: transervice.tran('模块'),enableCellEdit: false},
					{ field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'),enableCellEdit: false}


				],

				    enableSelectAll: true,
					paginationPageSize: 10, //每页显示个数
					multiSelect: true,
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

			//初始化
			function init(currentPage, pageSize) {

				if ($scope.condtionName == undefined) {
					$scope.condtionName = "";
				}



				if ($scope.condition.length ||$scope.condition.notInId.length||$scope.condition.inId.length ) {
					var dataSearch = {
						"where":["and",["or" ,["like","SUBSYSTEM",$scope.condtionName],
							["like","FUNC_MODULE",$scope.condtionName],
							["like","BUSINESS_OBJECT",$scope.condtionName]
						]],
						"limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize
					};
					if($scope.condition.notInId.length){
						dataSearch.where.push(["not in","BUSINESS_OBJECT_ID",$scope.condition.notInId])
					}
					if($scope.condition.inId.length){
						dataSearch.where.push(["in","BUSINESS_OBJECT_ID",$scope.condition.inId])
					}

				} else {
					var dataSearch ={
						"where":["or" ,["like","SUBSYSTEM",$scope.condtionName],
							["like","FUNC_MODULE",$scope.condtionName],
							["like","BUSINESS_OBJECT",$scope.condtionName]
						],
						"limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize
					};
				}

				httpService.httpHelper(httpService.webApi.api, "users/busines","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
					$scope.gridOptions.data = [];

						$scope.gridOptions.totalItems = datas._meta.totalCount;
						$scope.gridOptions.data=datas.data;
						if (!currentPage) {
							$scope.gridOptions.paginationCurrentPage = 1;
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
				$modalInstance.close(rows);
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

			//查询
			$scope.searchSystemList = function () {
				$scope.gridOptions.paginationCurrentPage = 1;
				init();
			}


		});


	})
