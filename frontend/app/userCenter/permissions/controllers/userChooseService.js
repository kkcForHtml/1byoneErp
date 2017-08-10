define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
		'app/common/directives/gridTableDirt',
		'app/common/Services/messageService',
	],
	function(angularAMD) {

		angularAMD.service(
			'userChooseService',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation : true,
							controller : "userChooseCtrl",
							backdrop:"static",
							size:"md",//lg,sm,md,llg,ssm
							templateUrl : 'app/userCenter/permissions/views/userlist.html?ver='+_version_,
							resolve : {

								model : function() {
									return model;
								}

							}
						}).result;
				};


			}
		);
		angularAMD.controller("userChooseCtrl",function( $scope,amHttp,Notification,$modalInstance,model,messageService,transervice,uiGridConstants,httpService,gridDefaultOptionsService ){


			$scope.gridOptions = {
				columnDefs: [
					{ field: 'USER_INFO_CODE', displayName: transervice.tran('用户编码'),enableCellEdit: false},
					{ field: 'u_staffinfo.STAFF_NAME_CN', displayName: transervice.tran('用户名称'),enableCellEdit: false},
					{ field: 'ORGANISATION_CODE', displayName: transervice.tran('组织编码'),enableCellEdit: false,
						cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.o_organisation.ORGANISATION_CODE}}</div>'
					},
					{ field: 'o_organisation.ORGANISATION_NAME_CN', displayName: transervice.tran('组织名称'),enableCellEdit: false}
				],

				//enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
				paginationPageSize: 10, //每页显示个数
				enableSelectAll: model.multiSelect?true:false,
				multiSelect: model.multiSelect?true:false,
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
			if(model){
				$scope.model = model;
			}
			function init(currentPage, pageSize) {

				var userName = "";
				if ($scope.userName !== undefined) {
					userName = $scope.userName;
				}
					var dataSearch = {
						"where": ["=","u_user_info.STAFF_STATE",1],
						"joinWith":["u_user_organization","o_organisation","u_staffinfo"],
						"groupby": "u_user_info.USER_INFO_ID",
						"limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
						"distinct": true
					};
				if(userName.length>0){
					dataSearch.where = ["and",["=","u_user_info.STAFF_STATE",1],["like","sta.STAFF_NAME_CN",userName]];
				}
				httpService.httpHelper(httpService.webApi.api, "users/userinfo","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
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

			//查询
			$scope.searchUserList = function () {
				init();
			};
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
