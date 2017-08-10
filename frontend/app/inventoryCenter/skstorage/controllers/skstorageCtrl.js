/**
 * Created by Administrator on 2017/5/31.
 */
define([
    "app/inventoryCenter/skstorage/controllers/skstorageAddService",
    "app/inventoryCenter/skstorage/controllers/skstorageEditService",
    'app/masterCenter/bchannel/controllers/partner_list_service',
    "app/inventoryCenter/common/controllers/purchaseChooseService",
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/configService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'

], function () {
    return ['$scope', '$confirm', 'Notification', 'skstorageAddService', 'skstorageEditService', 'partner_list_service', 'purchaseChooseService', 'commonService', 'configService', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService', 'messageService',
        function ($scope, $confirm, Notification, skstorageAddService, skstorageEditService, partner_list_service, purchaseChooseService, commonService, configService, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService, messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'o_organisation.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('组织'),
                        enableCellEdit: false
                    },
                    {
                        field: 'STORAGE_CD',
                        displayName: transervice.tran('入库单号'),
                        enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" btn-per="{id:24,name:\'编辑\'}"ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.STORAGE_CD}}</a>'
                    },
                    {field: 'STORAGE_AT1', displayName: transervice.tran('入库日期'), enableCellEdit: false},
                    {
                        field: 'b_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('入库仓库'),
                        enableCellEdit: false
                    },
                    {field: 'pa_partner.PARTNER_NAME_CN', displayName: transervice.tran('供应商'), enableCellEdit: false},
                    {
                        field: 'ORDER_STATE',
                        displayName: transervice.tran('单据状态'),
                        enableCellEdit: false,
                        cellTemplate: '<span ng-if="row.entity.ORDER_STATE==2">已审核</span>' +
                        '<span ng-if="row.entity.ORDER_STATE==1">未审核</span>'
                    }
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {

                        }
                    });
                }
            };

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            $scope.gridOptions.getGridApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };

            //切换页码
            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                init(pageNo, pageSize);
            };

            function baseInit() {
                $scope.model = new Object();
                //当前用户
                $scope.model.currentuser = configService.getUserInfo();
                //初始化下拉框
                $scope.model.rowEntity = {"fieldDataObjectMap": {}};
                $scope.model.rowEntity.fieldDataObjectMap['ORDER_STATE'] = {"list": commonService.getDicList("SK_STORAGE")};//入库表 -单据状态
                init();
            }

            function searchCondition(pageSize) {
                if ($scope.model.searchCondition == undefined || $scope.model.searchCondition == null) {
                    $scope.model.searchCondition = "";
                }
                var dataSearch = {
                    "where": ["and", ["or", ["like", "o_organisation.ORGANISATION_NAME_CN", $scope.model.searchCondition],
                        ["like", "b_warehouse.WAREHOUSE_NAME_CN", $scope.model.searchCondition],
                        ["like", "sk_storage.STORAGE_CD", $scope.model.searchCondition]
                    ], "sk_storage.DELETED_STATE=0"],
                    "joinWith": ["sk_storage_detail", "o_organisation", "b_warehouse", "pa_partner", "u_userinfoc"],
                    "orderby": "sk_storage.ORDER_STATE asc,sk_storage.STORAGE_AT asc,sk_storage.UPDATED_AT desc,sk_storage.CREATED_AT desc",
                    "limit": pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                    "distinct": true
                };
                return dataSearch;
            }

            //初始化
            function init(currentPage, pageSize) {
                //搜索条件
                var dataSearch = searchCondition(pageSize);
                $scope.model.searchConditions = dataSearch;

                httpService.httpHelper(httpService.webApi.api, "inventory/storage", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                    angular.forEach(datas.data, function (obj, index) {
                        obj.STORAGE_AT1 = $filter("date")(new Date(parseInt(obj.STORAGE_AT) * 1000), "yyyy-MM-dd");
                    });
                    $scope.gridOptions.data = datas.data;
                    if (!currentPage) {
                        $scope.gridOptions.paginationCurrentPage = 1;
                    }
                })
            }

            //搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }

            //新增
            $scope.add = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                skstorageAddService.showDialog().then(function (data) {
                    init();
                });
            };

            //编辑页面
            $scope.openDetail = function (item) {
                var _index = $.inArray(item, $scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList=$scope.gridOptions.data.map(d=>d.STORAGE_ID);
                skstorageEditService.showDialog(item, _index, $scope.gridOptions.totalItems, $scope.model.searchConditions,idList).then(function (data) {
                    init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                },function(data){
                    init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                });
            };

            //删除
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                //审核的不能删除
                var keepGoing = true;
                angular.forEach(rows, function (obj, index) {
                    if (obj.ORDER_STATE == 2) {
                        keepGoing = false;
                    }
                });
                if (!keepGoing) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }

                $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                    var delArray = new Array();
                    angular.forEach(rows, function (obj, index) {
                        var rowObj = new Object();
                        rowObj.DELETED_STATE = 1;
                        rowObj.STORAGE_ID = obj.STORAGE_ID;
                        delArray.push(rowObj);
                    });
                    var updateRows = {
                        "batchMTC": delArray
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/storage", "update", "POST", updateRows).then(function (datas) {
                        Notification.success(transervice.tran(datas.message));
                        $scope.gridApi.selection.clearSelectedRows();
                        init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                    });
                });
            };

            //导出
            $scope.export = function () {
                var form = $("<form>");//定义一个form表单
                form.attr("style", "display:none");
                form.attr("target", "");
                form.attr("method", "post");
                var input1 = $("<input>");
                input1.attr("type", "hidden");
                input1.attr("name", "search");
                input1.attr("value", $scope.model.searchCondition);
                form.append(input1);
                form.attr("action", httpService.webApi.api + "/inventory/storage/export");
                $("body").append(form);//将表单放置在web中
                form.submit();//表单提交
            }

            //初始化
            baseInit();
        }]
});
