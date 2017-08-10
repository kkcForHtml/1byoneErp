define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/directives/singleSelectDirt',
    "app/inventoryCenter/skallocation/controllers/skallocationAddService",
    "app/inventoryCenter/skallocation/controllers/skallocationEditService",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/dialogPopupDirt',
    'app/common/Services/messageService',
    'app/common/Services/configService',
    "app/inventoryCenter/skallocation/controllers/goodsRejectedService"
], function () {
    "use strict";
    return ['$scope', '$confirm', 'Notification','skallocationAddService','skallocationEditService','commonService','configService', 'httpService','$filter', 'amHttp', 'transervice', 'uiGridConstants','gridDefaultOptionsService','messageService','goodsRejectedService',
        function ($scope, $confirm, Notification, skallocationAddService,skallocationEditService,commonService,configService,httpService,$filter, amHttp, transervice, uiGridConstants,gridDefaultOptionsService,messageService,goodsRejectedService) {
        $scope.gridOptions = {
                columnDefs: [
                    { field: 'ALLOCATION_CD', displayName: transervice.tran('调拨计划单号'),enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.ALLOCATION_CD}}</a>'
                    },
                    { field: 'o_organisation_e.ORGANISATION_NAME_CN', displayName: transervice.tran('调出组织'),enableCellEdit: false},
                    { field: 'o_organisation_a.ORGANISATION_NAME_CN', displayName: transervice.tran('调入组织'),enableCellEdit: false},
                    { field: 'ESTIMATED_AT', displayName: transervice.tran('预计调出日期'),enableCellEdit: false},
                    { field: 'ESTIMATEDA_AT', displayName: transervice.tran('预计调入日期'),enableCellEdit: false},
                    { field: 'b_warehouse_e.WAREHOUSE_NAME_CN', displayName: transervice.tran('调出仓库'),enableCellEdit: false},
                    { field: 'b_warehouse_a.WAREHOUSE_NAME_CN', displayName: transervice.tran('调入仓库'),enableCellEdit: false},
                    { field: 'ALLOCATION_STATE', displayName: transervice.tran('单据状态'),enableCellEdit: false,cellTemplate:
                        '<span ng-if="row.entity.ALLOCATION_STATE==1">未审核</span>'+
                        '<span ng-if="row.entity.ALLOCATION_STATE==2">已审核</span>'
                    }
                ],

                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                        if(newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                }
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            $scope.gridOptions.getGridApi=function(gridApi){
                $scope.gridApi=gridApi;
            };
            //切换页码
            $scope.gridOptions.getPage=function(pageNo,pageSize){
                $scope.init(pageNo,pageSize);
            };

            //初始化
            $scope.init = function (currentPage, pageSize) {
                $scope.initUser = configService.getUserInfo();//当前登陆者
                if($scope.searchCondition === undefined || $scope.searchCondition === null) {
                    $scope.searchCondition = "";
                }
                var dataSearch = {
                    "where":['and',
                        "sk_allocation.DELETED_STATE=0",
                        ["or" ,
                            ["like","orge.ORGANISATION_NAME_CN",$scope.searchCondition],
                            ["like","orga.ORGANISATION_NAME_CN",$scope.searchCondition],
                            ["like","ware.WAREHOUSE_NAME_CN",$scope.searchCondition],
                            ["like","wara.WAREHOUSE_NAME_CN",$scope.searchCondition],
                            ["like","sk_allocation.ALLOCATION_CD",$scope.searchCondition]
                        ]],
                    "joinWith":["o_organisation_e","o_organisation_a","b_warehouse_e","b_warehouse_a","sk_allocation_detail","u_userinfo_a","u_userinfoc"],
                    "orderby":"ALLOCATION_STATE asc,ALLOCATION_ID desc",
                    "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                    "distinct" : true
                };
                httpService.httpHelper(httpService.webApi.api, "inventory/allocation","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if(datas.data.length){
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function(obj,index){
                            obj.ESTIMATEDA_AT = $filter("date")(new Date(parseInt(obj.ESTIMATEDA_AT)*1000), "yyyy-MM-dd");
                            obj.ESTIMATED_AT = $filter("date")(new Date(parseInt(obj.ESTIMATED_AT)*1000), "yyyy-MM-dd");
                        });
                        $scope.gridOptions.data = datas.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    }
                });
            };

            //初始化
            $scope.init();

            //搜索
            $scope.search = function(){
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            };
            
            //新增
            $scope.add = function(){
                skallocationAddService.showDialog().then(function(data){
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.init();
                });
            };

            //编辑
            $scope.openDetail = function(item){
                var _index = $.inArray(item,$scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList = $scope.gridOptions.data.map(obj=>obj.ALLOCATION_ID);
                skallocationEditService.showDialog(item,_index,$scope.gridOptions.data.length,idList).then(function(data){
                    $scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                });
            };
            
            //删除
            $scope.del = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var flag = true;
                angular.forEach(rows,function (obj,index) {
                    if(obj.ALLOCATION_STATE === '2'){
                        flag = false;
                        return ;
                    }
                });
                if(!flag){
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }
                $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function () {
                    var delRows = [];
                    angular.forEach(rows, function(obj,index){
                        var delObj = {};
                        delObj.ALLOCATION_ID = obj.ALLOCATION_ID;
                        delObj.DELETED_STATE = 1;
                        delObj.DETAIL_CODE = 1;
                        delRows.push(delObj);
                    });
                    httpService.httpHelper(httpService.webApi.api, "inventory/allocation","update", "POST", {"batchMTC":delRows}).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        $scope.gridApi.selection.clearSelectedRows();
                        $scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                    });
                });
            };
        }
    ];
});