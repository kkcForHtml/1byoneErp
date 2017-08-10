/**
 * Created by admin on 2017/6/26.
 */
define([
    'ngload!ui-notification',
        "app/finance/accountingPeriodEnd/controllers/business_range_service",
        'app/common/Services/gridDefaultOptionsService',
        "app/finance/accountingPeriodEnd/controllers/closingFailService"
        
    ],
    function () {
        return ['$scope','Notification', 'httpService', 'transervice', 'gridDefaultOptionsService', 'business_range_service','closingFailService','$filter',
            function ($scope,Notification, httpService, transervice, gridDefaultOptionsService,business_range_service,closingFailService,$filter) {
                $scope.gridSystemsOptions = {
                    columnDefs: [
                        {
                            field: 'ORGANISATION_NAME_CN',
                            displayName: transervice.tran('核算组织'),
                            enableCellEdit: false
                        },
                        {
                            field: 'ACCOUNTING_PERIOD',
                            displayName: transervice.tran('未关账期间'),
                            enableCellEdit: false
                        },
                        {
                            field: 'START_AT',
                            type: 'date',
                            cellFilter: "date:'yyyy-MM-dd'",
                            displayName: transervice.tran('开始日期'),
                            enableCellEdit: false
                        },
                        {
                            field: 'END_AT',
                            type: 'date',
                            cellFilter: "date:'yyyy-MM-dd'",
                            displayName: transervice.tran('结束日期'),
                            enableCellEdit: false
                        },
                        {
                            field: 'ORGANISATION_ID',
                            displayName: transervice.tran('全部业务区间'),
                            enableCellEdit: false,
                            cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.seeBusinessRange(row.entity)">查看</a>'
                        },

                    ],
                    enablePagination: true, //是否分页，默认为true
                    enablePaginationControls: true,//使用默认的底部分页

                    //---------------api---------------------
                    onRegisterApi: function (gridApis) {
                        $scope.gridApis = gridApis;
                        //分页按钮事件
                        gridApis.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                            if (getPage) {
                                getPage(newPage, pageSize);
                            }
                        });
                        //行选中
	                    $scope.gridApis.selection.on.rowSelectionChanged($scope, function (row, event) {
	                        if (row) {
	
	                        }
	                    });
                        
                    }


                };
                gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridSystemsOptions);

                /**
                 * 查询所有已定义的实体法人
                 * @param where
                 */


                function search(page) {
	                var datam = {
						"page":page||$scope.gridSystemsOptions.paginationCurrentPage,
						"limit": $scope.gridSystemsOptions.paginationPageSize
	
	                };

                    httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "indexclose", "POST", datam).then(function (datas) {
                        $scope.gridSystemsOptions.data = [];
                        var getAccountingCN =["第一期","第二期","第三期","第四期","第五期","第六期","第七期","第八期","第九期","第十期","第十一期","第十二期"];
                        if (datas.data.length > 0) {
                            datas._meta.totalCount*1&&($scope.gridSystemsOptions.totalItems = datas._meta.totalCount);
                            for(var i=0;i<datas.data.length;i++){
                                var d =datas.data[i];
                                d.copyObject = angular.copy(d);
                                d.rowEntity = $scope.rowEntity;
                                d.ACCOUNTING_PERIOD = getAccountingCN[d.ACCOUNTING_PERIOD-1];
                                d.START_AT = d.START_AT?$filter("date")(new Date(d.START_AT*1000),"yyyy-MM-dd"):"";
                                d.END_AT = d.END_AT?$filter("date")(new Date(d.END_AT*1000),"yyyy-MM-dd"):"";

                            }
                            $scope.gridSystemsOptions.data = datas.data;
                        }
                    })
                }

                //页码改变时触发方法
                function getPage(currentPage, pageSize) {
                    search();
                }

                search(1);

                //关账
                $scope.closeAccountingPeriod = function (){
                    //获取选择行的数据
                    var rows = angular.copy($scope.gridApis.selection.getSelectedRows());
                    var data = angular.copy(rows);
                    var postData = [];
             		rows.forEach(function (obj) {
             			postData.push(obj.ACCOUNTING_PERIOD_ID);
             		})
                    if (!data.length) {
                        return Notification.error(transervice.tran('请选择要操作的数据！'));
                    }

                    httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "closeac","POST",{"ACCOUNTING_PERIOD_ID":postData}).then(function (result) {
                        return result
                    }).then(function (result) {
                    	if (result.code==99) {
		                	return	closingFailService.showDialog(result.data)
                    	}
                    	Notification.success(transervice.tran('操作成功'));
                    	search(1);
                    })

                }
                //反关帐
                $scope.reversalAccountingPeriod = function (){
                    //获取选择行的数据
                    var rows = angular.copy($scope.gridApis.selection.getSelectedRows());
                    var data = angular.copy(rows);
                    var postData = [];
                    //拼要修改的数据
             		rows.forEach(function (obj) {
             			postData.push(obj.ACCOUNTING_PERIOD_ID);
             		})
                    if (!data.length) {
                        return Notification.error(transervice.tran('请选择要操作的数据！'));
                    }
                    httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "recloseac","POST",{"ACCOUNTING_PERIOD_ID":postData}).then(function (result) {
                        search(1);
                    })
                    
                }
                //查看业务区间
                $scope.seeBusinessRange = function (rowData) {
                    //获取当前行行数据
                    business_range_service.showDialog(rowData);
                }

            }
        ]
    })
;