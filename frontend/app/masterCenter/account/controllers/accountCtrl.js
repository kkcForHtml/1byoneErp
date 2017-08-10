define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    "app/masterCenter/account/controllers/account_edit",
    "app/masterCenter/account/controllers/account_add",
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'Notification', 'amHttp', 'transervice', '$filter', 'httpService', 'uiGridConstants', 'account_edit', 'account_add', 'commonService', 'gridDefaultOptionsService', 'messageService',
        function ($scope, $confirm, Notification, amHttp, transervice, $filter, httpService, uiGridConstants, account_edit, account_add, commonService, gridDefaultOptionsService, messageService) {

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'edit',
                        displayName: transervice.tran('操作'),
                        enableCellEdit: false,
                        cellTemplate: '<button type="button" class="btn btn-sm btn-link" btn-per="{id:7,name:\'编辑\'}" ng-click="grid.appScope.edit(row.entity)"><i class="fa fa-fw fa-pencil"></i></button>'
                    },
                    {field: 'ACCOUNT', displayName: '账号', enableCellEdit: false}, {
                        field: 'CHANNEL_ID',
                        displayName: transervice.tran('所属平台'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name', enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.CHANNEL_ID.list"
                    },
                    {field: 'MERCHANTID', displayName: 'Merchant ID', enableCellEdit: false},
                    {
                        field: 'AREA_ID',
                        displayName: transervice.tran('地区'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name', enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.AREA_ID.list"
                    },
                    {
                        field: 'COUNTRY_ID',
                        displayName: transervice.tran('国家'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name', enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.COUNTRY_ID.list"
                    },
                    {field: 'ACCOUNT_REMARKS', displayName: '备注', enableCellEdit: false},
                    {
                        field: 'ACCOUNT_STATE',
                        displayName: transervice.tran('是否启用'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value', enableCellEdit: false,
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ACCOUNT_STATE.list"
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
                $scope.model.rowEntity = {"fieldDataObjectMap": {}}
                $scope.model.rowEntity.fieldDataObjectMap['ACCOUNT_STATE'] = {"list": commonService.getDicList("STATE")}
                //地区列表
                selectWhere = {"where": ["and", ["=", "b_area.AREA_FID", "0"]], "joinwith": ['b_areas']};
                return httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST", selectWhere).then(function (result) {
                    var countryID = new Array();
                    angular.forEach(result.data, function (ob, indexOb) {
                        ob.value = ob.AREA_ID;
                        ob.name = ob.AREA_NAME_CN;
                        if (ob.b_areas) {
                            //国家
                            angular.forEach(ob.b_areas, function (obj, indexObj) {
                                obj.value = obj.AREA_ID;
                                obj.name = obj.AREA_NAME_CN;
                                countryID.push(obj);
                            });
                        }
                    });
                    $scope.model.rowEntity.fieldDataObjectMap['COUNTRY_ID'] = {"list": countryID}
                    $scope.model.rowEntity.fieldDataObjectMap['AREA_ID'] = {"list": result.data}
                }).then(function () {
                    //平台列表
                    var selectWhere = {"where": ["and", ["<>", "CHANNEL_STATE", 0]]};
                    return httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(function (result) {
                        angular.forEach(result.data, function (ob, index) {
                            ob.value = ob.CHANNEL_ID;
                            ob.name = ob.CHANNEL_NAME_CN;
                        });
                        $scope.model.rowEntity.fieldDataObjectMap['CHANNEL_ID'] = {"list": result.data}
                    }).then(function () {
                        init();
                    })
                });
            }

            function searchCondition(pageSize) {
                var dataSearch = {
                    "joinwith": ["o_organisation"],
                    "orderby": "ACCOUNT_STATE desc,UPDATED_AT desc",
                    "limit": pageSize
                };
                var searchCondition = $scope.model.searchCondition;
                if (searchCondition != undefined && searchCondition != null && searchCondition != "") {
                    var and = new Array();
                    and.push("or");
                    and.push(["like", "ACCOUNT", searchCondition]);
                    angular.forEach($scope.model.rowEntity.fieldDataObjectMap['CHANNEL_ID']['list'], function (obj, index) {
                        if (obj.name.indexOf(searchCondition) >= 0) {
                            and.push(["=", "CHANNEL_ID", obj.value])
                        }
                    });
                    dataSearch["addWhere"] = [{"and": and}];
                }
                return dataSearch;
            }

            function init(currentPage, pageSize) {
                //搜索过滤条件
                var dataSearch = searchCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                    $scope.gridOptions.data = datas.data;
                    angular.forEach($scope.gridOptions.data, function (obj, index) {
                        obj.rowEntity = $scope.model.rowEntity;
                    });
                    if (!currentPage) {
                        $scope.gridOptions.paginationCurrentPage = 1;
                    }
                })
            };

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                init(currentPage, pageSize);
            }

            //编辑方法
            $scope.edit = function (item) {
                account_edit.showDialog(item).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });
            };
            //新增方法
            $scope.add = function (item) {
                account_add.showDialog(item).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });
            }

            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var deleteRowModel = {
                    "batch": rows
                };
                return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "master/basics/account", "delete", "POST", deleteRowModel).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.gridApi.selection.clearSelectedRows();
                        init();
                    });
                });
            }

            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }

            baseInit();

        }]
});
