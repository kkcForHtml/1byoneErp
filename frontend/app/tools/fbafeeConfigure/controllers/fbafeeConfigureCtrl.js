define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/tools/fbafeeConfigure/controllers/fbafeeConfigure_edit',
    'app/tools/fbafeeConfigure/controllers/fbafeeConfigure_add',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'Notification', 'amHttp', 'transervice', '$filter', 'httpService', 'uiGridConstants', 'commonService', 'gridDefaultOptionsService', 'messageService', 'fbafeeConfigure_edit_service','fbafeeConfigure_add_service',
        function ($scope, $confirm, Notification, amHttp, transervice, $filter, httpService, uiGridConstants, commonService, gridDefaultOptionsService, messageService, fbafeeConfigure_edit_service,fbafeeConfigure_add_service) {

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'edit',
                        displayName: transervice.tran('操作'),
                        enableCellEdit: false,
                        cellTemplate: '<button type="button" class="btn btn-sm btn-link" ng-click="grid.appScope.edit(row.entity)"><i class="fa fa-fw fa-pencil"></i></button>'
                    },
                    {
                        field: 'AREA_ID',
                        displayName: transervice.tran('国家'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.AREA_ID.list"
                    }, {
                        field: 'LENGTHUNIT',
                        displayName: transervice.tran('长度单位'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.LENGTHUNIT.list"
                    }, {
                        field: 'WEIGHTUNIT',
                        displayName: transervice.tran('重量单位'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.WEIGHTUNIT.list"
                    },
                    {
                        field: 'VOLWEIGHTPROP',
                        type: 'number',
                        cellClass: "text-right",
                        enableCellEdit: false,
                        displayName: transervice.tran('体积重比例'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.VOLWEIGHTPROP"></form></div>'
                    },
                    /*{
                        field: 'ISACTIVE',
                        displayName: transervice.tran('是否启用'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        enableCellEdit: false,
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ISACTIVE.list"
                    },*/
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
            $scope.rowEntity = {
                "fieldDataObjectMap": {}
            }
            var stateList = commonService.getDicList("STATE");
            $scope.rowEntity.fieldDataObjectMap['ISACTIVE'] = {
                "list": stateList
            }

            $scope.rowEntity.fieldDataObjectMap['LENGTHUNIT'] = {
                "list": [{value:"in",name:"英寸"},{value:"cm",name:"厘米"}]
            };
            $scope.rowEntity.fieldDataObjectMap['WEIGHTUNIT'] = {
                "list": [{value:"lb",name:"磅"},{value:"g",name:"克"}]
            }

            //国家
            selectWhere = {"where": ["and", ["<>", "AREA_FID", "0"]]};
            httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST", selectWhere).then(function (result) {
                if (result != null && result.status == 200) {
                    angular.forEach(result.data, function (ob, index) {
                        ob.value = ob.AREA_ID;
                        ob.name = ob.AREA_NAME_CN;
                    });
                    $scope.rowEntity.fieldDataObjectMap['AREA_ID'] = {
                        "list": result.data
                    }
                }
            });

            //模拟新增的models
            $scope.addModels = [];
            $scope.init = function () {
                var pageSize = $scope.gridOptions.paginationPageSize ? $scope.gridOptions.paginationPageSize : 20;
                var currentPage = $scope.gridOptions.paginationCurrentPage ? $scope.gridOptions.paginationCurrentPage : 1;
                var dataSearch = {
                    "orderby": "UPDATED_AT desc",
                    "limit": pageSize
                };
                return httpService.httpHelper(httpService.webApi.api, "tools/fbafee", "index?page=" + currentPage, "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.totalItems = datas._meta.totalCount;
                    $scope.gridOptions.data = datas.data;
                    angular.forEach($scope.gridOptions.data, function (obj, index) {
                        obj.rowEntity = $scope.rowEntity;
                        //obj.stateList = stateList;
                    });
                    $scope.gridOptions.paginationCurrentPage = currentPage;
                    $scope.gridOptions.paginationPageSize = pageSize;
                })
            };
            $scope.init();

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init();
            }

            //编辑方法
            $scope.edit = function (item) {
                fbafeeConfigure_edit_service.showDialog(item).then(function (data) {
                    if (item) {
                        angular.copy(data, item);
                    } else {
                        $scope.addModels.push(data);
                    }
                    $scope.init();
                });
            };
            //新增方法
            $scope.add = function (item) {
                fbafeeConfigure_add_service.showDialog(item).then(function (data) {
                    if (item) {
                        angular.copy(data, item);
                    } else {
                        $scope.addModels.push(data);
                    }
                    $scope.init();
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
                    httpService.httpHelper(httpService.webApi.api, "tools/fbafee", "delete", "POST", deleteRowModel).then(function (datas) {
                            Notification.success(datas.message);
                            $scope.gridApi.selection.clearSelectedRows();
                            $scope.init();
                        }
                    );
                });
            }

            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            }

        }]
});
