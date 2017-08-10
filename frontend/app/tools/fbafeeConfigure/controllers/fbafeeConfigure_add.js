/**
 * Created by Administrator on 2017/7/5 0005.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'fbafeeConfigure_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "fbafeeConfigure_add_Ctrl",
                            backdrop: "static",
                            size: "1100px",//lg,sm,md,llg,ssm
                            templateUrl: 'app/tools/fbafeeConfigure/views/fbafeeConfigure_add.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("fbafeeConfigure_add_Ctrl", function ($scope, $confirm, $filter, $timeout, uiGridConstants, amHttp, httpService, model, $modalInstance, Notification, transervice, $http, $q, $interval, commonService, gridDefaultOptionsService, messageService) {
            if (model) {
                $scope.model = angular.copy(model);
                $scope.bareaList = $scope.model.rowEntity.fieldDataObjectMap['AREA_ID'].list;
                $scope.unitLengthList = $scope.model.rowEntity.fieldDataObjectMap['LENGTHUNIT'].list;
                $scope.unitWightList = $scope.model.rowEntity.fieldDataObjectMap['WEIGHTUNIT'].list;
            }

            //取消操作
            $scope.cancel = function () {
                $modalInstance.dismiss(angular.copy($scope.model));
            };

            $scope.unitLengthList = [{value: "in", name: "英寸"}, {value: "cm", name: "厘米"}];
            $scope.unitWightList = [{value: "lb", name: "磅"}, {value: "g", name: "克"}];

            //国家
            selectWhere = {"where": ["and", ["<>", "AREA_FID", "0"]]};
            httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST", selectWhere).then(function (result) {
                if (result != null && result.status == 200) {
                    angular.forEach(result.data, function (ob, index) {
                        ob.value = ob.AREA_ID;
                        ob.name = ob.AREA_NAME_CN;
                    });
                    $scope.bareaList = result.data;
                }
            });

            //保存
            $scope.save = function () {
                var updataDate = angular.copy($scope.model);

                if (updataDate.AREA_ID == null || updataDate.AREA_ID == "" || updataDate.AREA_ID == undefined) {
                    return Notification.error(transervice.tran("请输入国家"));
                }
                if (updataDate.LENGTHUNIT == null || updataDate.LENGTHUNIT == "" || updataDate.LENGTHUNIT == undefined) {
                    return Notification.error(transervice.tran("请输入长度单位"));
                }
                if (updataDate.WEIGHTUNIT == null || updataDate.WEIGHTUNIT == "" || updataDate.WEIGHTUNIT == undefined) {
                    return Notification.error(transervice.tran("请输入重量单位"));
                }
                if (updataDate.VOLWEIGHTPROP == null || updataDate.VOLWEIGHTPROP == "" || updataDate.VOLWEIGHTPROP == undefined) {
                    updataDate.VOLWEIGHTPROP = 0;
                }

                var drityFbaFeeDetailData = $scope.fbaFeeDetailOptions.data;
                var drityMcfFeeDetailData = $scope.mcfFeeDetailOptions.data;
                var drityMStorageFeeDetailData = $scope.mStorageFeeDetailOptions.data;

                var drityFbaFeeDetailArray = new Array();
                angular.forEach(drityFbaFeeDetailData, function (obj, indexObj) {
                    var entityData = angular.copy(obj);
                    drityFbaFeeDetailArray.push(entityData);
                });
                var drityMcfFeeDetailArray = new Array();
                angular.forEach(drityMcfFeeDetailData, function (obj, indexObj) {
                    var entityData = angular.copy(obj);
                    drityMcfFeeDetailArray.push(entityData);
                });
                var drityMStorageFeeDetailArray = new Array();
                angular.forEach(drityMStorageFeeDetailData, function (obj, indexObj) {
                    var entityData = angular.copy(obj);
                    drityMStorageFeeDetailArray.push(entityData);
                });
                //拼成数组
                var dataUpdate = angular.copy($scope.model);
                if (drityFbaFeeDetailArray.length > 0) {
                    dataUpdate["to_fbafeedetail"] = drityFbaFeeDetailArray;
                }
                if (drityMcfFeeDetailArray.length > 0) {
                    dataUpdate["to_mcffeedetail"] = drityMcfFeeDetailArray;
                }
                if (drityMStorageFeeDetailArray.length > 0) {
                    dataUpdate["to_mstoragefeedetail"] = drityMStorageFeeDetailArray;
                }
                return httpService.httpHelper(httpService.webApi.api, "tools/fbafee", "create", "POST", dataUpdate).then(function (datas) {
                        Notification.success(datas.message);
                        $modalInstance.close($scope.model);//返回数据
                    }
                );
            }

            $scope.fbaFeeDetailOptions = {
                columnDefs: [
                    {
                        field: 'LINE', width: 75, cellClass: "text-right",
                        displayName: transervice.tran('优先级'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LINE"></form></div>',
                    }, {
                        field: 'LENGTHMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('长度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LENGTHMAX"></form></div>',
                    }, {
                        field: 'WIDTHMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('宽度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.WIDTHMAX"></form></div>',
                    }, {
                        field: 'HEIGHTMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('高度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.HEIGHTMAX"></form></div>',
                    }, {
                        field: 'LENGTHADDWMAX', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('长度+围度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LENGTHADDWMAX"></form></div>',
                    }, {
                        field: 'WEIGHTMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('重量上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTMAX"></form></div>',
                    }, {
                        field: 'DIAGONALMAX', width: 100, cellClass: "text-right",
                        displayName: transervice.tran('对角线上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.DIAGONALMAX"></form></div>',
                    }, {
                        field: 'PACKAGETYPE', width: 150,
                        displayName: transervice.tran('包装类型'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="45"   ui-grid-editor ng-model="row.entity.PACKAGETYPE"></form></div>',
                    }, {
                        field: 'PACKAGEWEIGHT', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('包装重量'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.PACKAGEWEIGHT"></form></div>',
                    }, {
                        field: 'YKG', width: 85,
                        displayName: transervice.tran('首重'), cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.YKG"></form></div>',
                    }, {
                        field: 'YKGPRICE9', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('首重价格(1-9)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.YKGPRICE9"></form></div>',
                    }, {
                        field: 'YKGPRICE10', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('首重价格(10-12)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.YKGPRICE10"></form></div>',
                    }, {
                        field: 'OVERWEIGHTUNIT', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('超重单位重'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTUNIT"></form></div>',
                    }, {
                        field: 'OVERWEIGHTPRICE9', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('超重单价(1-9)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTPRICE9"></form></div>',
                    }, {
                        field: 'OVERWEIGHTPRICE10', width: 155, cellClass: "text-right",
                        displayName: transervice.tran('超重单价(10-12)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTPRICE10"></form></div>',
                    },
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiFbaFeeDetail = gridApi;
                    $scope.fbaFeeDetailOptions.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    });
                    //行选中事件
                    $scope.gridApiFbaFeeDetail.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowFbaFeeDetail);
                }
            }

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.fbaFeeDetailOptions);

            $scope.saveRowFbaFeeDetail = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiFbaFeeDetail.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //新增方法
            $scope.fbaFeeDetailAdd = function (item) {
                var line = 0;
                angular.forEach($scope.fbaFeeDetailOptions.data, function (obj, index) {
                    if (Number(obj.LINE) > line) {
                        line = Number(obj.LINE);
                    }
                });
                var datas = {
                    "where": ['and', ['=', 'FBAFEERULE_ID', $scope.model.FBAFEERULE_ID]],
                    "orderby": "LINE desc",
                    "limit": 1,
                }
                httpService.httpHelper(httpService.webApi.api, "tools/fbafeedetail", "index", "POST", datas).then(function (datas) {
                    if (datas.data) {
                        if (Number(datas.data[0].LINE) > line) {
                            line = Number(datas.data[0].LINE);
                        }
                    }
                }).then(function () {
                    line = line + 10;
                    var newData = {
                        "LINE": line,
                        "LENGTHMAX": 0,
                        "WIDTHMAX": 0,
                        "HEIGHTMAX": 0,
                        "LENGTHADDWMAX": 0,
                        "WEIGHTMAX": 0,
                        "DIAGONALMAX": 0,
                        "PACKAGETYPE": "",
                        "PACKAGEWEIGHT": 0,
                        "YKG": 0,
                        "YKGPRICE9": 0,
                        "YKGPRICE10": 0,
                        "OVERWEIGHTUNIT": 0,
                        "OVERWEIGHTPRICE9": 0,
                        "OVERWEIGHTPRICE10": 0,
                    };
                    $scope.fbaFeeDetailOptions.data.unshift(newData);
                });
            }

            //删除数据
            $scope.fbaFeeDetailDel = function () {
                var dataRow = $scope.fbaFeeDetailOptions.data;
                var rows = $scope.gridApiFbaFeeDetail.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["FBAFEEDETAIL_ID"] && rows[i]["FBAFEEDETAIL_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.fbaFeeDetailOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiFbaFeeDetail.rowEdit.setRowsClean(myArrayNot);
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "tools/fbafeedetail", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiFbaFeeDetail.rowEdit.setRowsClean($scope.fbaFeeDetailOptions.data);
                                Notification.success(datas.message);
                                $scope.fbaFeeDetailInit();
                            }
                        );
                    });
                }
            }
            $scope.fbaFeeDetailOptions.data = [];


            $scope.mcfFeeDetailOptions = {
                columnDefs: [
                    {
                        field: 'LINE', width: 75, cellClass: "text-right",
                        displayName: transervice.tran('优先级'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LINE"></form></div>',
                    }, {
                        field: 'LENGTHMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('长度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LENGTHMAX"></form></div>',
                    }, {
                        field: 'WIDTHMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('宽度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.WIDTHMAX"></form></div>',
                    }, {
                        field: 'HEIGHTMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('高度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.HEIGHTMAX"></form></div>',
                    }, {
                        field: 'LENGTHADDWMAX', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('长度+围度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LENGTHADDWMAX"></form></div>',
                    }, {
                        field: 'WEIGHTMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('重量上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTMAX"></form></div>',
                    }, {
                        field: 'DIAGONALMAX', width: 100, cellClass: "text-right",
                        displayName: transervice.tran('对角线上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.DIAGONALMAX"></form></div>',
                    }, {
                        field: 'PACKAGETYPE', width: 150,
                        displayName: transervice.tran('包装类型'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="45"   ui-grid-editor ng-model="row.entity.PACKAGETYPE"></form></div>',
                    }, {
                        field: 'PACKAGEWEIGHT', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('包装重量'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.PACKAGEWEIGHT"></form></div>',
                    }, {
                        field: 'YKG', width: 85,
                        displayName: transervice.tran('首重'), cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.YKG"></form></div>',
                    }, {
                        field: 'YKGPRICE_SHIP', width: 245, cellClass: "text-right",
                        displayName: transervice.tran('首重价格(STANDARD SHIPPING)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.YKGPRICE_SHIP"></form></div>',
                    }, {
                        field: 'YKGPRICE_EXP', width: 185, cellClass: "text-right",
                        displayName: transervice.tran('首重价格(EXPEDITED)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.YKGPRICE_EXP"></form></div>',
                    }, {
                        field: 'YKGPRICE_PRI', width: 185, cellClass: "text-right",
                        displayName: transervice.tran('首重价格(PRIORITY)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.YKGPRICE_PRI"></form></div>',
                    }, {
                        field: 'OVERWEIGHTUNIT', width: 100, cellClass: "text-right",
                        displayName: transervice.tran('超重单位重'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTUNIT"></form></div>',
                    }, {
                        field: 'OVERWEIGHTPRICE_SHIP', width: 245, cellClass: "text-right",
                        displayName: transervice.tran('超重单价(STANDARD SHIPPING)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTPRICE_SHIP"></form></div>',
                    }, {
                        field: 'OVERWEIGHTPRICE_EXP', width: 185, cellClass: "text-right",
                        displayName: transervice.tran('超重单价(EXPEDITED)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTPRICE_EXP"></form></div>',
                    }, {
                        field: 'OVERWEIGHTPRICE_PRI', width: 185, cellClass: "text-right",
                        displayName: transervice.tran('超重单价(PRIORITY)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.OVERWEIGHTPRICE_PRI"></form></div>',
                    },
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiMcfFeeDetail = gridApi;
                    $scope.mcfFeeDetailOptions.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {

                    });
                    //行选中事件
                    $scope.gridApiMcfFeeDetail.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowMcfFeeDetail);
                }
            }

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.mcfFeeDetailOptions);

            $scope.saveRowMcfFeeDetail = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiMcfFeeDetail.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //新增方法
            $scope.mcfFeeDetailAdd = function (item) {
                var line = 0;
                angular.forEach($scope.mcfFeeDetailOptions.data, function (obj, index) {
                    if (Number(obj.LINE) > line) {
                        line = Number(obj.LINE);
                    }
                });
                var datas = {
                    "where": ['and', ['=', 'FBAFEERULE_ID', $scope.model.FBAFEERULE_ID]],
                    "orderby": "LINE desc",
                    "limit": 1,
                }
                httpService.httpHelper(httpService.webApi.api, "tools/mcffeedetail", "index", "POST", datas).then(function (datas) {
                    if (datas.data) {
                        if (Number(datas.data[0].LINE) > line) {
                            line = Number(datas.data[0].LINE);
                        }
                    }
                }).then(function () {
                    line = line + 10;
                    var newData = {
                        "LINE": line,
                        "LENGTHMAX": 0,
                        "WIDTHMAX": 0,
                        "HEIGHTMAX": 0,
                        "LENGTHADDWMAX": 0,
                        "WEIGHTMAX": 0,
                        "DIAGONALMAX": 0,
                        "PACKAGETYPE": "",
                        "PACKAGEWEIGHT": 0,
                        "YKG": 0,
                        "YKGPRICE_SHIP": 0,
                        "YKGPRICE_EXP": 0,
                        "YKGPRICE_PRI": 0,
                        "OVERWEIGHTUNIT": 0,
                        "OVERWEIGHTPRICE_SHIP": 0,
                        "OVERWEIGHTPRICE_EXP": 0,
                        "OVERWEIGHTPRICE_PRI": 0,
                    };
                    $scope.mcfFeeDetailOptions.data.unshift(newData);
                });
            }

            //删除数据
            $scope.mcfFeeDetailDel = function () {
                var dataRow = $scope.mcfFeeDetailOptions.data;
                var rows = $scope.gridApiMcfFeeDetail.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["MCFFEEDETAIL_ID"] && rows[i]["MCFFEEDETAIL_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.mcfFeeDetailOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiMcfFeeDetail.rowEdit.setRowsClean(myArrayNot);
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "tools/mcffeedetail", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiMcfFeeDetail.rowEdit.setRowsClean($scope.mcfFeeDetailOptions.data);
                                Notification.success(datas.message);
                                $scope.mcfFeeDetailInit();
                            }
                        );
                    });
                }
            }
            $scope.mcfFeeDetailOptions.data = [];
            $scope.mStorageFeeDetailOptions = {
                columnDefs: [
                    {
                        field: 'LINE', width: 75, cellClass: "text-right",
                        displayName: transervice.tran('优先级'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LINE"></form></div>',
                    }, {
                        field: 'LENGTHMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('长度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LENGTHMAX"></form></div>',
                    }, {
                        field: 'WIDTHMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('宽度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.WIDTHMAX"></form></div>',
                    }, {
                        field: 'HEIGHTMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('高度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.HEIGHTMAX"></form></div>',
                    }, {
                        field: 'LENGTHADDWMAX', width: 125, cellClass: "text-right",
                        displayName: transervice.tran('长度+围度上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.LENGTHADDWMAX"></form></div>',
                    }, {
                        field: 'WEIGHTMAX', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('重量上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTMAX"></form></div>',
                    }, {
                        field: 'DIAGONALMAX', width: 100, cellClass: "text-right",
                        displayName: transervice.tran('对角线上限'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.DIAGONALMAX"></form></div>',
                    }, {
                        field: 'PACKAGEWEIGHT', width: 85, cellClass: "text-right",
                        displayName: transervice.tran('包装重量'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999999"  min="0" ui-grid-editor ng-model="row.entity.PACKAGEWEIGHT"></form></div>',
                    }, {
                        field: 'MINVENTORYFEE9', width: 135,
                        displayName: transervice.tran('月存储费(1-9)'), cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.MINVENTORYFEE9"></form></div>',
                    }, {
                        field: 'MINVENTORYFEE10', width: 135, cellClass: "text-right",
                        displayName: transervice.tran('月存储费(10-12)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.MINVENTORYFEE10"></form></div>',
                    }, {
                        field: 'LONGTIMEFEE6', width: 165, cellClass: "text-right",
                        displayName: transervice.tran('LONG TIME费(6-12)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.LONGTIMEFEE6"></form></div>',
                    }, {
                        field: 'LONGTIMEFEE12', width: 195, cellClass: "text-right",
                        displayName: transervice.tran('LONG TIME费(超过11)'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="6" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.LONGTIMEFEE12"></form></div>',
                    },
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiMStorageFeeDetail = gridApi;
                    $scope.mStorageFeeDetailOptions.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    });
                    //行选中事件
                    $scope.gridApiMStorageFeeDetail.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowMStorageFeeDetail);
                }
            }

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.mStorageFeeDetailOptions);

            $scope.saveRowMStorageFeeDetail = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiMStorageFeeDetail.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //新增方法
            $scope.mStorageFeeDetailAdd = function (item) {
                var line = 0;
                angular.forEach($scope.mStorageFeeDetailOptions.data, function (obj, index) {
                    if (Number(obj.LINE) > line) {
                        line = Number(obj.LINE);
                    }
                });
                var datas = {
                    "where": ['and', ['=', 'FBAFEERULE_ID', $scope.model.FBAFEERULE_ID]],
                    "orderby": "LINE desc",
                    "limit": 1,
                }
                httpService.httpHelper(httpService.webApi.api, "tools/mstoragefeedetail", "index", "POST", datas).then(function (datas) {
                    if (datas.data) {
                        if (Number(datas.data[0].LINE) > line) {
                            line = Number(datas.data[0].LINE);
                        }
                    }
                }).then(function () {
                    line = line + 10;
                    var newData = {
                        "LINE": line,
                        "LENGTHMAX": 0,
                        "WIDTHMAX": 0,
                        "HEIGHTMAX": 0,
                        "LENGTHADDWMAX": 0,
                        "WEIGHTMAX": 0,
                        "DIAGONALMAX": 0,
                        "PACKAGEWEIGHT": 0,
                        "MINVENTORYFEE9": 0,
                        "MINVENTORYFEE10": 0,
                        "LONGTIMEFEE6": 0,
                        "LONGTIMEFEE12": 0,
                    };
                    $scope.mStorageFeeDetailOptions.data.unshift(newData);
                });
            }

            //删除数据
            $scope.mStorageFeeDetailDel = function () {
                var dataRow = $scope.mStorageFeeDetailOptions.data;
                var rows = $scope.gridApiMStorageFeeDetail.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["MSTORAGEFEEDETAIL_ID"] && rows[i]["MSTORAGEFEEDETAIL_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.gridApiMStorageFeeDetail.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiCredit.rowEdit.setRowsClean(myArrayNot);
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "tools/mstoragefeedetail", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiMStorageFeeDetail.rowEdit.setRowsClean($scope.mStorageFeeDetailOptions.data);
                                Notification.success(datas.message);
                                $scope.creditInit();
                            }
                        );
                    });
                }
            }
            $scope.mStorageFeeDetailOptions.data = [];

        });
    })