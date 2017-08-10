define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/Services/configService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/messageService',
    'app/common/directives/dialogPopupDirt',
    "app/inventoryCenter/skfiallocation/controllers/skfiallocationAddService",
    "app/inventoryCenter/skfiallocation/controllers/skfiallocationEditService"
], function () {
    "use strict";
    return ['$scope', '$confirm', 'Notification','skfiallocationAddService','skfiallocationEditService','commonService','configService', 'httpService','$filter', 'amHttp', 'transervice', 'uiGridConstants','gridDefaultOptionsService','messageService',
        function ($scope, $confirm, Notification, skfiallocationAddService,skfiallocationEditService,commonService,configService,httpService,$filter, amHttp, transervice, uiGridConstants,gridDefaultOptionsService,messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'o_organisation.ORGANISATION_NAME_CN', displayName: transervice.tran('组织'),enableCellEdit: false},
                    { field: 'FIALLOCATION_CD', displayName: transervice.tran('调拨单号'),enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.FIALLOCATION_CD}}</a>'
                    },
                    { field: 'ALLOCATION_AT', displayName: transervice.tran('调拨日期'),enableCellEdit: false},
                    { field: 'b_warehouse_e.WAREHOUSE_NAME_CN', displayName: transervice.tran('调出仓库'),enableCellEdit: false},
                    { field: 'b_warehouse_a.WAREHOUSE_NAME_CN', displayName: transervice.tran('调入仓库'),enableCellEdit: false},
                    { field: 'ALLOCATION_STATE', displayName: transervice.tran('单据状态'),enableCellEdit: false,cellTemplate:
                    '<span ng-if="row.entity.ALLOCATION_STATE==2">已审核</span>'+
                    '<span ng-if="row.entity.ALLOCATION_STATE==1">未审核</span>'}
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
                $scope.currentuser = configService.getUserInfo();//当前登陆者
                if($scope.searchCondition == undefined || $scope.searchCondition == null) {
                    $scope.searchCondition = "";
                }
                var dataSearch = {
                    "where":["and",
                        ["or" ,
                            ["like","o_organisation.ORGANISATION_NAME_CN",$scope.searchCondition],
                            ["like","wara.WAREHOUSE_NAME_CN",$scope.searchCondition],
                            ["like","ware.WAREHOUSE_NAME_CN",$scope.searchCondition],
                            ["like","sk_fiallocation.FIALLOCATION_CD",$scope.searchCondition]
                        ],
                        "sk_fiallocation.DELETED_STATE=0"
                    ],
                    "joinWith":["o_organisation","b_warehouse_e","b_warehouse_a","sk_fiallocation_detail","u_userinfo_a","u_userinfoc"],
                    "orderby":"ALLOCATION_STATE asc,FIALLOCATION_ID desc",
                    "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                    "distinct" : true
                };
                httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    $scope.gridOptions.totalItems = datas._meta.totalCount;
                    if(datas.data.length){
                        angular.forEach(datas.data, function(obj,index){
                            obj.ALLOCATION_AT = $filter("date")(new Date(parseInt(obj.ALLOCATION_AT)*1000), "yyyy-MM-dd");
                        });
                        $scope.gridOptions.data=datas.data;
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
                skfiallocationAddService.showDialog().then(function(data){
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.init();
                });
            };

            //编辑页面
            $scope.openDetail = function(item){
                var _index = $.inArray(item,$scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList = $scope.gridOptions.data.map(obj=>obj.FIALLOCATION_ID);
                skfiallocationEditService.showDialog(item,_index,$scope.gridOptions.data.length,idList).then(function(data){
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
                    if(obj.ALLOCATION_STATE == 2){
                        flag = false;
                        return ;
                    }
                });
                if(!flag){
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }
                $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function () {
                    var delArray = [];
                    angular.forEach(rows, function(obj,index){
                        var rowObj = {};
                        rowObj.FIALLOCATION_ID = obj.FIALLOCATION_ID;
                        rowObj.DELETED_STATE = 1;
                        rowObj.DETAIL_CODE = 1;
                        delArray.push(rowObj);
                    });
                    var updateRows = {
                        "batchMTC":delArray
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation","update", "POST", updateRows).then(function (datas) {
                        Notification.success(transervice.tran('操作成功'));
                        $scope.gridApi.selection.clearSelectedRows();
                        $scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                    });
                });
            };
        }
    ];
});