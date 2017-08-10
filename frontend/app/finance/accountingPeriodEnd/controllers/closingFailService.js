/**
 * Created by Administrator on 2017/6/16.
 */
define(
	['angularAMD',
		'app/common/Services/AmHttp',
		'app/common/Services/commonService',
		'app/common/Services/gridDefaultOptionsService',
	],
	function(angularAMD) {

		angularAMD.service(
			'closingFailService',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation: true,
							controller: "closingFailCtrl",
							backdrop: "static",
							size: "64%", //lg,sm,md,llg,ssm
							templateUrl: 'app/finance/accountingPeriodEnd/views/closing_fail.html?ver=' + _version_,
							resolve: {
								model: function() {
									return model;
								}
							}
						}).result;
				};

			}
		);
		angularAMD.controller("closingFailCtrl", function($scope, amHttp, $modalInstance,model, transervice, uiGridConstants,Notification, httpService, gridDefaultOptionsService) {
			//console.log(PSKU_CODE,PSKU_NAME_CN,num);
			$scope.gridOptions = {
				columnDefs: [{
						field: 'NUMBER',
						width: '5%',
						displayName: transervice.tran('序号'),
						cellClass:'text-center',
						enableCellEdit: false
					},
					{
						field: 'ORDER_CD',
						width: '20%',
						displayName: transervice.tran('单据号'),
						cellClass:'text-center',
						enableCellEdit: false,
						//footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);font-size:16px;text-align:center;">日均销量</div>'
					},
					{
						field: 'ORDER_TYPE',
						width: '20%',
						displayName: transervice.tran('单据类型'),
						cellClass:'text-center',
						enableCellEdit: false,
						footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);"></div>'
					},
					{
						field: 'ORDER_STATE',
						width: '20%',
						displayName: transervice.tran('审核状态'),
						cellClass:'text-center',
						enableCellEdit: false
					},
					{
						field: 'ORGANISATION_NAME_CN',
						width: '20%',
						displayName: transervice.tran('核算组织'),
						cellClass:'text-center',
						enableCellEdit: false
					
					},
					{
						field: 'ACCOUNTING_PERIOD',
						width: '15%',
						displayName: transervice.tran('期间'),
						cellClass:'text-center',
						enableCellEdit: false
					
					}					
				],
				enablePagination: true, //是否分页，默认为true
				enablePaginationControls: true,
				enableGridMenu: false, //是否使用菜单
				//showColumnFooter: true,

				//---------------api---------------------
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;
					//分页按钮事件
					gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
						if(getPage) {
							getPage(newPage, pageSize);
						}
					});
				}
			};
			gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
			$scope.init = function(currentPage, pageSize) {
				var pageTotals = pageSize || 15;
				var selectWhere = {
					"ACCOUNTING_PERIOD_ID":model.ACCOUNTING_PERIOD_ID,
				    "page": currentPage||1,
				    "limit": pageTotals
				};
				httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "getunauditedorder", "POST", selectWhere).then(
					function(result) {
						var data = result.data;						
						result._meta.totalCount*1&&($scope.gridOptions.totalItems=result._meta.totalCount);										 
						data.forEach((ob,index) => {
							ob.NUMBER = (index+1)+(selectWhere.page-1)*selectWhere.limit;
						})
						$scope.gridOptions.data = data;
					})

			};
			$scope.init();
			
            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init(currentPage,pageSize);
            }
			//导出
			function exp () {
				var html_txt = [
					`<form id="form" style="display:none" target="" method="post" action="${httpService.webApi.api}/finance/accountingperiod/excelunauditedorder">`,
						'<input type="hidden" name="ACCOUNTING_PERIOD_ID" value='+model.ACCOUNTING_PERIOD_ID+'>',
					'</form>'
				].join('');
				$('body').append($(html_txt));
				$("#form").submit();
				$("#form").remove();
			}
			$scope.export = exp;            
            //关闭页面
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };
            
		});

	})