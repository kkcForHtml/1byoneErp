define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'Notification', '$timeout', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', '$http', '$q', '$interval', 'commonService', 'gridDefaultOptionsService', 'messageService',
        function ($scope, $confirm, Notification, $timeout, httpService, $filter, amHttp, transervice, uiGridConstants, $http, $q, $interval, commonService, gridDefaultOptionsService, messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'MONEY_ID',
                        displayName: transervice.tran('*币种'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.MONEY_ID.list"
                    },
                    {
                        field: 'TARGET_MONEY_ID',
                        displayName: transervice.tran('*目标货币'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.TARGET_MONEY_ID.list"
                    }, {
                        field: 'EXCHANGE_RATE_TYPE_ID',
                        displayName: transervice.tran('货币汇率类型'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.EXCHANGE_RATE_TYPE_ID.list"
                    }, {
                        field: 'EXCHANGE_RATE_STATE',
                        displayName: transervice.tran('是否启用'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.EXCHANGE_RATE_STATE.list"
                    },
                    {
                        field: 'EFFECTIVE_START_DATE',
                        displayName: transervice.tran('*有效起始日'),
                        /*type: 'date',
                         cellFilter: "date:'yyyy-MM-dd'",*/
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.EFFECTIVE_START_DATE"></div>',
                    },
                    {
                        field: 'EFFECTIVE_END_DATE',
                        displayName: transervice.tran('*有效截止日'),
                        /*type: 'date',
                         cellFilter: "date:'yyyy-MM-dd'"*/
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.EFFECTIVE_END_DATE"></div>',
                    },
                    {
                        field: 'EXCHANGE_RATE_ODDS',
                        type: 'number',
                        cellClass: "text-right",
                        displayName: transervice.tran('*倍率'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.EXCHANGE_RATE_ODDS"></form></div>'
                    },
                    {
                        field: 'EXCHANGE_RATE_REMARKS', displayName: transervice.tran('备注'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.EXCHANGE_RATE_REMARKS"></form></div>'
                    },
                ],

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridOptions.gridApi = gridApi;
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
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //模糊搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }

            //初始化基础数据
            function baseInit() {
                //初始化下拉框
                $scope.model = new Object();
                $scope.model.rowEntity = {"fieldDataObjectMap": {}};
                //初始化汇率类型和状态
                $scope.model.rowEntity.fieldDataObjectMap['EXCHANGE_RATE_TYPE_ID'] = {"list": commonService.getDicList("EXCHANGE_RATE")};
                $scope.model.rowEntity.fieldDataObjectMap['EXCHANGE_RATE_STATE'] = {"list": commonService.getDicList("STATE")};
                //获取币种
                var moneyListWhere = {"where": ["and", ["<>", "MONEY_STATE", 0]]};
                return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", moneyListWhere).then(function (result) {
                    if (result != null && result.status == 200) {
                        angular.forEach(result.data, function (ob, index) {
                            ob.value = ob.MONEY_ID;
                            ob.name = ob.MONEY_NAME_CN;
                        })
                        $scope.model.rowEntity.fieldDataObjectMap['MONEY_ID'] = {"list": result.data};
                        $scope.model.rowEntity.fieldDataObjectMap['TARGET_MONEY_ID'] = {"list": result.data};
                        $scope.model.moneyList = result.data;
                    }
                }).then(function () {
                    init();
                });
            }

            function searchCondition(pageSize) {
                var searchCondition = $scope.model.searchMoney;
                var dataSearch = {
                    "orderby": "EXCHANGE_RATE_STATE desc,UPDATED_AT desc",
                    "joinwith": ["b_money", "b_target_money"],
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if (searchCondition != "" && searchCondition != null && searchCondition != undefined) {
                    dataSearch["addWhere"] = [{
                        "and": ['or',
                            ["like", "b_money.MONEY_NAME_CN", searchCondition],
                            ["like", "b_target_money.MONEY_NAME_CN", searchCondition]]
                    }];
                }
                return dataSearch;
            }

            //初始化数据
            function init(currentPage, pageSize) {
                //搜索条件
                var dataSearch = searchCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                    $scope.gridOptions.data = [];
                    $scope.gridOptions.data = datas.data;
                    $scope.gridApi.grid.refresh();
                    angular.forEach($scope.gridOptions.data, function (ob, index) {
                        ob.EFFECTIVE_START_DATE = $filter("date")(ob.EFFECTIVE_START_DATE * 1000, "yyyy-MM-dd");
                        ob.EFFECTIVE_END_DATE = $filter("date")(ob.EFFECTIVE_END_DATE * 1000, "yyyy-MM-dd");
                        ob.rowEntity = $scope.model.rowEntity;
                        ob.copyObject = angular.copy(ob);
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

            //编辑新增一行
            $scope.edit = function (item) {
                var newData = {
                    "MONEY_ID": "",
                    "TARGET_MONEY_ID": "",
                    "EXCHANGE_RATE_TYPE_ID": "1",
                    "moneyList": $scope.model.moneyList,
                    "EXCHANGE_RATE_STATE": "1",
                    "EFFECTIVE_START_DATE": "",
                    "EFFECTIVE_END_DATE": "",
                    "EXCHANGE_RATE_ODDS": "",
                    "EXCHANGE_RATE_REMARKS": "",
                    "rowEntity": $scope.model.rowEntity,
                };
                $scope.gridOptions.data.unshift(newData);
            }

            //删除按钮
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                angular.forEach(rows, function (obj, objIndex) {
                    if (obj["EXCHANGE_RATE_ID"] && obj["EXCHANGE_RATE_ID"] > 0) {
                        myArray.push(obj);
                    } else {
                        myArrayNot.push(obj);
                    }
                });
                if (myArrayNot.length > 0) {
                    angular.forEach(myArrayNot, function (obj, objIndex) {
                        angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                            if (obj.$$hashKey == obj1.$$hashKey) {
                                $scope.gridOptions.data.splice(objIndex1, 1);
                            }
                        });
                    });
                    $scope.gridApi.rowEdit.setRowsClean(myArrayNot);
                    if (myArray.length <= 0) {
                        $scope.gridApi.selection.clearSelectedRows();
                    }
                }
                if (myArray.length > 0) {
                    $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "delete", "POST", deleteRowModel).then(function (datas) {
                                $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                                $scope.gridApi.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                init();
                            }
                        );
                    });
                }
            }

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = new Date(object.replace(/-/g, '/')).getTime();
                        object = Math.round((object).valueOf() / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };

            //检验数据
            function checkData() {
                //检验数据
                var filedList = [];
                $scope.gridOptions.columnDefs.forEach(d=> {
                    if (d.field && d.enableCellEdit) {
                        filedList.push(d.field);
                    }
                });
                filedList.push("EXCHANGE_RATE_ID");
                var drityData = gridDefaultOptionsService.getDirtyRows(angular.copy($scope.gridOptions.data), filedList, "EXCHANGE_RATE_ID");
                if (drityData.length <= 0) {
                    return messageService.error_choose_n;
                }
                var errorMsg = "";
                $scope.model.saveModel = new Array();
                angular.forEach(drityData, function (obj, indexObj) {
                    var entitys = angular.copy(obj);
                    if (entitys.MONEY_ID == "" || entitys.MONEY_ID == null || entitys.MONEY_ID == undefined) {
                        return errorMsg = '请输入币种';
                    }
                    if (entitys.TARGET_MONEY_ID == "" || entitys.TARGET_MONEY_ID == null || entitys.TARGET_MONEY_ID == undefined) {
                        return errorMsg = '请输入目标货币';
                    }
                    if (entitys.MONEY_ID == entitys.TARGET_MONEY_ID) {
                        return errorMsg = '币种和目标货币不能一样';
                    }
                    if (entitys.EFFECTIVE_START_DATE == "" || entitys.EFFECTIVE_START_DATE == null || entitys.EFFECTIVE_START_DATE == undefined || $scope.formatDate(entitys.EFFECTIVE_START_DATE) > 9999999999) {
                        return errorMsg = '请输入正确有效起始日';
                    }
                    if (entitys.EFFECTIVE_END_DATE == "" || entitys.EFFECTIVE_END_DATE == null || entitys.EFFECTIVE_END_DATE == undefined || $scope.formatDate(entitys.EFFECTIVE_END_DATE) > 9999999999) {
                        return errorMsg = '请输入正确有效截止日';
                    }
                    if (entitys.EXCHANGE_RATE_ODDS == "" || entitys.EXCHANGE_RATE_ODDS == null || entitys.EXCHANGE_RATE_ODDS == undefined || entitys.EXCHANGE_RATE_ODDS <= 0) {
                        return errorMsg = '请输入倍率,并且倍率必须大于0!';
                    }
                    if ($scope.formatDate(entitys.EFFECTIVE_START_DATE) > $scope.formatDate(entitys.EFFECTIVE_END_DATE)) {
                        return errorMsg = '起始日期不能大于结束日期';
                    }
                    entitys.EFFECTIVE_START_DATE = $scope.formatDate(entitys.EFFECTIVE_START_DATE);
                    entitys.EFFECTIVE_END_DATE = $scope.formatDate(entitys.EFFECTIVE_END_DATE);
                    delete entitys['copyModel'];
                    delete entitys['rowEntity'];
                    delete entitys['moneyList'];
                    delete entitys['CREATED_AT'];
                    delete entitys['CUSER_ID'];
                    delete entitys['UUSER_ID'];
                    delete entitys['UPDATED_AT'];
                    $scope.model.saveModel.push(entitys);
                });
                return errorMsg;
            }

            //保存按钮
            $scope.save = function () {
                var errorMsg = checkData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                var updateRowModel = {
                    "batchMTC": $scope.model.saveModel
                };
                return httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "update", "POST", updateRowModel).then(function (datas) {
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    Notification.success(datas.message);
                    init();
                });
            }

            baseInit();
        }]
});
