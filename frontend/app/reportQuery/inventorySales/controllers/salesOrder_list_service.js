/**
 * Created by Administrator on 2017/6/16.
 */
define(
	['angularAMD',
		'app/common/Services/AmHttp',
		'app/common/Services/gridDefaultOptionsService',
	],
	function(angularAMD) {

		angularAMD.service(
			'salesOrder_list_service',
			function($q, $modal) {
				this.showDialog = function(PSKU_CODE,PSKU_NAME_CN,num) {
					return $modal
						.open({
							animation: true,
							controller: "salesOrderListCtrl",
							backdrop: "static",
							size: "65%", //lg,sm,md,llg,ssm
							templateUrl: 'app/reportQuery/inventorySales/views/salesOrder_list_service.html?ver=' + _version_,
							resolve: {
								PSKU_CODE: function() {
									return PSKU_CODE;
								},
								PSKU_NAME_CN: function() {
									return PSKU_NAME_CN;
								},
								num: function() {
									return num;
								}
							}
						}).result;
				};

			}
		);
		angularAMD.controller("salesOrderListCtrl", function($scope, amHttp, $modalInstance, PSKU_CODE,PSKU_NAME_CN,num, transervice, uiGridConstants, commonService,Notification, httpService, gridDefaultOptionsService) {
			//console.log(PSKU_CODE,PSKU_NAME_CN,num);
			$scope.gridOptions = {
				columnDefs: [{
						field: 'PURCHASE_DATE',
						width: '20%',
						displayName: transervice.tran('销售日期'),
						enableCellEdit: false,
						type: 'date',
						cellFilter: "date:'yyyy-MM-dd'",
						footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);"></div>'
					},
					{
						field: 'CHANNEL_NAME_CN',
						width: '20%',
						displayName: transervice.tran('平台'),
						enableCellEdit: false,
						//footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);font-size:16px;text-align:center;">日均销量</div>'
					},
					{
						field: 'MONEY_NAME_CN',
						width: '15%',
						displayName: transervice.tran('币种'),
						enableCellEdit: false,
						footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);"></div>'
					},
					{
						field: 'ITEM_PRICE',
						width: '15%',
						displayName: transervice.tran('单价'),
						enableCellEdit: false,
						cellFilter: "number:2",
						cellClass:'text-right',
						//footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);"></div>'
					},
					{
						field: 'QUANTITY_SHIPPED',
						width: '15%',
						displayName: transervice.tran('数量'),
						enableCellEdit: false,
						cellClass:'text-right',
						//footerCellTemplate: '<div class="ui-grid-cell-contents text-right" style="background:#fff; font-size:16px;">{{grid.appScope.avg|number:2}}</div>'
					},
					{
						field: 'AMOUNT',
						width: '15%',
						displayName: transervice.tran('金额'),
						enableCellEdit: false,
						cellFilter: "number:2",
						cellClass:'text-right',
						//footerCellTemplate: '<div class="ui-grid-cell-contents" style="background-color: rgb(255,204,204);"></div>'
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
			$scope.model = {
				"PSKU_CODE":PSKU_CODE,
				"PSKU_NAME_CN":PSKU_NAME_CN,
				
			}
			$scope.yesterday = getYTT(-1);
			$scope.times = getYTT(-num-1);
			$scope.init = function(currentPage, pageSize) {
				var sT = changeTime($scope.times,'start');
				var yT = changeTime($scope.yesterday);
				var pageTotals = pageSize || 20;
				var selectWhere = {
					"sku": "100US-0002",
				    "page": currentPage||1,
				    "limit": pageTotals,
				    "startTime": sT,
				    "endTime": yT					
				};
				httpService.httpHelper(httpService.webApi.api, "amazon/amazonorder", "amazon_order", "POST", selectWhere).then(
					function(result) {
						var data = result.data.list;
						if (result.data.count*1) {
							$scope.gridOptions.totalItems=result.data.count;								
						}					
						 
						data.forEach(ob => {
							ob.UPDATE_TIME *= 1000;
						})
						$scope.gridOptions.data = data;
						$scope.avg = result.data.ave;
//						if (!data.length) {
//							return Notification.error(transervice.tran('暂无数据!'))
//						}
					})

			};
			$scope.init();
			//搜索
			$scope.search = function () {
				this.init();
			}
			function changeTime (n,flag) {
				//return typeof n!==undefined&&n?flag=='start'?n+' 00:00:00':n+' 23:59:59':n;
				return n;
			}
			
			//获取距离今天天数年月日
			function getYTT (AddDayCount) {
				var dd = new Date(); 
				dd.setDate(dd.getDate()+AddDayCount);
				var y = dd.getFullYear(); 
				var m = dd.getMonth()+1;
				var d = dd.getDate(); 
				return y+"-"+m+"-"+d; 
			}
            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init(currentPage,pageSize);
            }
            //关闭页面
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };
            
		});

	})