define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    "app/masterCenter/money/controllers/money_edit_service",
    "app/masterCenter/money/controllers/money_add_service",
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'Notification', 'httpService', '$q', 'amHttp', 'transervice', 'uiGridConstants', 'money_edit_service', 'money_add_service', 'commonService', 'gridDefaultOptionsService', 'messageService',
        function ($scope, $confirm, Notification, httpService, $q, amHttp, transervice, uiGridConstants, money_edit_service, money_add_service, commonService, gridDefaultOptionsService, messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        name: 'edit',
                        displayName: transervice.tran('操作'),
                        enableCellEdit: false,
                        cellTemplate: '<button type="button" class="btn btn-sm btn-link" btn-per="{id:1,name:\'编辑\'}" ng-click="grid.appScope.edit(row.entity)"><i class="fa fa-fw fa-pencil"></i></button>'
                    },
                    {
                        field: 'MONEY_CODE',
                        displayName: transervice.tran('ISO货币编码'),
                        enableCellEdit: false,
                    },
                    {
                        name: 'MONEY_NAME_CN',
                        displayName: transervice.tran('币种名称(中文)'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'MONEY_SYMBOLS',
                        displayName: transervice.tran('货币符号'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'MONEY_STATE',
                        displayName: transervice.tran('是否启用'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.MONEY_STATE.list"
                    },
                    {
                        field: 'MONEY_REMARKS',
                        displayName: transervice.tran('备注'),
                        enableCellEdit: false,

                    },
                ],

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //初始化基础数据
            function baseInit() {
                //初始化下拉框
                $scope.model = new Object();
                $scope.model.rowEntity = {"fieldDataObjectMap": {}};
                //货币状态
                $scope.model.rowEntity.fieldDataObjectMap['MONEY_STATE'] = {"list": commonService.getDicList("STATE")};
                init();
            }

            function searchCondition(pageSize) {
                var searchCondition = $scope.model.searchCodeName;
                var dataSearch = {
                    "orderby": "MONEY_STATE desc,UPDATED_AT desc",
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if (searchCondition != "" && searchCondition != null && searchCondition != undefined) {
                    dataSearch["addWhere"] = [{
                        "and": ["or",
                            ["like", "MONEY_CODE", searchCondition],
                            ["like", "MONEY_NAME_CN", searchCondition]]
                    }];
                }
                return dataSearch;
            }

            //初始化数据
            function init(currentPage, pageSize) {
                //搜索条件
                var dataSearch = searchCondition(pageSize);
                return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                    $scope.gridOptions.data = datas.data;
                    angular.forEach($scope.gridOptions.data, function (ob, index) {
                        ob.rowEntity = $scope.model.rowEntity;
                    })
                    if (!currentPage) {
                        $scope.gridOptions.paginationCurrentPage = 1;
                    }
                })
            }

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                init(currentPage, pageSize);
            }

            //模糊搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }

            //编辑方法
            $scope.edit = function (item) {
                money_edit_service.showDialog(item).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });
            }

            //新增方法
            $scope.add = function (item) {
                money_add_service.showDialog(item).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });
            }

            //删除数据
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var deleteRowModel = {
                    "batch": rows
                };
                //var deferred = $q.defer();
                $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "master/basics/money", "delete", "POST", deleteRowModel).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.gridApi.selection.clearSelectedRows();
                        //deferred.resolve();
                        init();
                    });
                });
                //return deferred.promise;
            }

            baseInit();
        }]
});
