define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'money_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal.open({
                        animation: true,
                        controller: "money_edit_Ctrl",
                        backdrop: "static",
                        size: "llg",//lg,sm,md,llg,ssm
                        templateUrl: 'app/masterCenter/money/views/money_edit.html?ver=' + _version_,
                        resolve: {
                            model: function () {
                                return model;
                            }
                        }
                    }).result;
                };
            }
        );
        angularAMD.controller("money_edit_Ctrl", function ($scope, $confirm, $filter, $timeout, uiGridConstants, amHttp, httpService, model, $modalInstance, Notification, transervice, $http, $q, $interval, commonService, gridDefaultOptionsService, messageService) {

            //取消操作
            $scope.cancel = function () {
                $modalInstance.dismiss(angular.copy($scope.model));
            };

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

            function checkData() {
                var errorMsg = "";
                if ($scope.model.MONEY_NAME_CN == null || $scope.model.MONEY_NAME_CN == "" || $scope.model.MONEY_NAME_CN == undefined) {
                    return errorMsg = '请输入币种名称(中文)';
                }
                $scope.model.b_exchange_rate = new Array();
                //var drityData = $scope.gridApi.rowEdit.getDirtyRows();
                angular.forEach($scope.gridOptions.data, function (obj, indexObj) {
                    var entitys = angular.copy(obj);
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
                    $scope.model.b_exchange_rate.push(entitys);
                });
                return errorMsg;
            }

            //删除多余数据
            function deleteSurplus(modelTemp) {
                delete modelTemp['CREATED_AT'];
                delete modelTemp['CUSER_ID'];
                delete modelTemp['UUSER_ID'];
                delete modelTemp['UPDATED_AT'];
                delete modelTemp['moneyList'];
                delete modelTemp['rowEntity'];
                angular.forEach(modelTemp.b_exchange_rate, function (obj, index) {
                    delete obj['copyModel'];
                    delete obj['rowEntity'];
                    delete obj['CREATED_AT'];
                    delete obj['CUSER_ID'];
                    delete obj['UUSER_ID'];
                    delete obj['UPDATED_AT'];
                });
                return modelTemp;
            }

            //保存
            $scope.save = function () {
                var errorMsg = checkData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                var moodelTemp = deleteSurplus($scope.model);
                return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "update?id=" + $scope.model.MONEY_ID, "POST", moodelTemp).then(function (datas) {
                    Notification.success(datas.message);
                    $modalInstance.close($scope.model);//返回数据
                });
            }

            $scope.gridOptions = {
                columnDefs: [
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
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.EFFECTIVE_START_DATE"></div>',
                    },
                    {
                        field: 'EFFECTIVE_END_DATE',
                        displayName: transervice.tran('*有效截止日'),
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
                paginationPageSize: 10, //每页显示个数
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

            //初始化基础数据
            function baseInit() {
                //初始化下拉框
                $scope.model = angular.copy(model);
                $scope.model.rowEntity = {"fieldDataObjectMap": {}};
                //初始化汇率类型和状态
                $scope.model.rowEntity.fieldDataObjectMap['EXCHANGE_RATE_TYPE_ID'] = {"list": commonService.getDicList("EXCHANGE_RATE")};
                $scope.model.rowEntity.fieldDataObjectMap['EXCHANGE_RATE_STATE'] = {"list": commonService.getDicList("STATE")};
                //获取币种
                var moneyListWhere = {"where": ["and", ["<>", "MONEY_STATE", 0]]};
                return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", moneyListWhere).then(function (result) {
                    angular.forEach(result.data, function (ob, index) {
                        ob.value = ob.MONEY_ID;
                        ob.name = ob.MONEY_NAME_CN;
                    })
                    $scope.model.rowEntity.fieldDataObjectMap['MONEY_ID'] = {"list": result.data};
                    $scope.model.rowEntity.fieldDataObjectMap['TARGET_MONEY_ID'] = {"list": result.data};
                    $scope.model.moneyList = result.data;
                }).then(function () {
                    init();
                });
            }

            function searchCondition(pageSize) {
                var dataSearch = {
                    "where": ['and', ['=', 'MONEY_ID', $scope.model.MONEY_ID]],
                    "orderby": "EXCHANGE_RATE_STATE desc,UPDATED_AT desc",
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                }
                return dataSearch;
            }

            function init(currentPage, pageSize) {

                //过滤条件
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
                    })
                    if (!currentPage) {
                        $scope.gridOptions.paginationCurrentPage = 1;
                    }
                });
            }

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                init(currentPage, pageSize);
            }

            //编辑新增方法
            $scope.subEdit = function (item) {
                if ($scope.model.rowEntity.fieldDataObjectMap.TARGET_MONEY_ID.list.length <= 0) {
                    Notification.error(transervice.tran("请先补充基础数据中的货币,再新增汇率"));
                    return;
                }
                var newData = {
                    "MONEY_ID": $scope.model.MONEY_ID,
                    "EXCHANGE_RATE_TYPE_ID": "1",
                    "TARGET_MONEY_ID": "",
                    "EXCHANGE_RATE_STATE": "1",
                    "EFFECTIVE_START_DATE": "",
                    "EFFECTIVE_END_DATE": "",
                    "EXCHANGE_RATE_ODDS": "",
                    "EXCHANGE_RATE_REMARKS": "",
                    "rowEntity": $scope.model.rowEntity,
                };
                $scope.gridOptions.data.unshift(newData);
            }

            //删除数据
            $scope.subDel = function () {
                var dataRow = $scope.gridOptions.data;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["EXCHANGE_RATE_ID"] && rows[i]["EXCHANGE_RATE_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.gridOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApi.rowEdit.setRowsClean(myArrayNot);
                    if (myArray.length <= 0) {
                        $scope.gridApi.selection.clearSelectedRows();
                    }
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                                $scope.gridApi.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                init();
                            }
                        );
                    });
                }
            }

            baseInit();
        });
    })