define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/inventoryCenter/common/controllers/historyStorageChooseService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        angularAMD.service(
            'skstorageAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal.open({
                        animation: true,
                        controller: "skstorageAddCtrl",
                        backdrop: "static",
                        size: "llg",//lg,sm,md,llg,ssm
                        templateUrl: 'app/inventoryCenter/skstorage/views/skstorage_add.html?ver=' + _version_,
                        resolve: {
                            model: function () {
                                return model;
                            }
                        }
                    }).result;
                };
            }
        );
        angularAMD.controller("skstorageAddCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, configService, Notification, transervice, $http, $q, $interval, commonService, $filter, partner_list_service, purchaseChooseService, historyStorageChooseService, gridDefaultOptionsService, messageService) {

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PU_ORDER_CD',
                        displayName: transervice.tran('采购订单'),
                        enableCellEdit: false,
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents" ng-click="grid.appScope.searchPuorder(row.entity)" style="width:100%;">{{row.entity.PU_ORDER_CD}}</div>'
                    },
                    {
                        field: 'RED_STORAGE_CD',
                        displayName: transervice.tran('红字入库单号'),
                        enableCellEdit: false,
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents " ng-click="grid.appScope.searchStorage(row.entity)" style="width:100%;">{{row.entity.RED_STORAGE_CD}}</div>'
                    },
                    {
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        width: 110,
                        displayName: transervice.tran('SKU')
                    },
                    {field: 'PSKU_NAME_CN', displayName: transervice.tran('产品名称'), enableCellEdit: false},
                    {
                        field: 'UNIT_ID',
                        displayName: transervice.tran('单位'),
                        cellClass: 'text-right',
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.UNIT_NAME}}</div>'
                    },
                    {
                        field: 'STORAGE_DNUMBER', displayName: transervice.tran('数量'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999" min="-99999999"   ui-grid-editor ng-model="row.entity.STORAGE_DNUMBER"></form></div>',
                        cellClass: "text-right"
                    }, {
                        field: 'TAX_RATE', displayName: transervice.tran('税率'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_RATE?row.entity.TAX_RATE*100+"%":row.entity.TAX_RATE}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric  max="9999999999.99" min="0"   ui-grid-editor ng-model="row.entity.TAX_RATE"></form></div>',
                        enableCellEdit: false,
                        cellClass: "text-right"
                    },
                    {
                        field: 'NOT_TAX_UNITPRICE',
                        displayName: transervice.tran('税前单价'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.NOT_TAX_UNITPRICE|number:2}}</div>',
                    }, {
                        field: 'UNIT_PRICE',
                        displayName: transervice.tran('含税单价'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNIT_PRICE|number:2}}</div>',
                    },
                    {
                        field: 'NOT_TAX_AMOUNT',
                        displayName: transervice.tran('税前金额'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.NOT_TAX_AMOUNT|number:2}}</div>',
                    }, {
                        field: 'STORAGE_DMONEY',
                        displayName: transervice.tran('税价合计'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.STORAGE_DMONEY|number:2}}</div>',
                    },
                    {
                        field: 'SWAREHOUSE_ID', displayName: transervice.tran('入库仓库'), width: 150,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getWarehouseName(row.entity.SWAREHOUSE_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "warehouseList",
                    }
                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false//是否使用分页按钮

            };

            $scope.gridOptions.data = [];
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //翻页触发方法
            $scope.gridOptions.getPage = function (pageNo, pageSize) {

            }

            //获取api
            $scope.gridOptions.getGridApi = function (api) {
                $scope.gridApi = api;
            }

            //勾选某一行
            $scope.gridOptions.selectRow = function (row) {

            }

            //编辑后触发
            $scope.gridOptions.afterCellEdit = function (rowEntity, colDef, newValue, oldValue) {
                //编辑数量
                if (colDef.field == "STORAGE_DNUMBER") {
                    if (newValue == null || newValue == "" || newValue == undefined) {
                        rowEntity.STORAGE_DNUMBER = 0;
                    } else {
                        rowEntity.STORAGE_DNUMBER = newValue;
                    }
                    //红字入库单
                    if ($scope.model.needPurchase == 2) {
                        if (rowEntity.STORAGE_DNUMBER >= 0) {
                            rowEntity.STORAGE_DNUMBER = -1;
                        }
                    } else { //蓝字入库单
                        if (rowEntity.STORAGE_DNUMBER <= 0) {
                            rowEntity.STORAGE_DNUMBER = 1;
                        }
                    }

                    rowEntity.NOT_TAX_AMOUNT = rowEntity.NOT_TAX_UNITPRICE * rowEntity.STORAGE_DNUMBER;
                    rowEntity.STORAGE_DMONEY = rowEntity.UNIT_PRICE * rowEntity.STORAGE_DNUMBER;
                    calcTotal();

                }
            }

            function calcTotal() {
                $scope.model.STORAGE_MONEY = 0;
                if ($scope.model.MONEY_ID) {
                    angular.forEach($scope.gridOptions.data, function (obj, index) {
                        $scope.model.STORAGE_MONEY += Number(obj.STORAGE_DMONEY);
                    });
                }
                $scope.model.STORAGE_MONEY = $scope.model.STORAGE_MONEY.toFixed(2);
            }

            //币种切换事件
            $scope.changePmoneyID = function (pmoneyID) {
                if (pmoneyID) {
                    calTotalMoney(pmoneyID, $scope.model.STORAGE_AT);
                }
            }

            function changeExchangeRate(data) {
                angular.forEach(data, function (row, i) {
                    $scope.gridOptions.data[i].MONEY_ID = row['1']
                    $scope.gridOptions.data[i].NOT_TAX_UNITPRICE = $scope.gridOptions.data[i].NOT_TAX_UNITPRICE * row['3'];
                    $scope.gridOptions.data[i].UNIT_PRICE = $scope.gridOptions.data[i].UNIT_PRICE * row['3'];
                    $scope.gridOptions.data[i].STORAGE_DMONEY = (parseFloat($scope.gridOptions.data[i].UNIT_PRICE) * parseFloat($scope.gridOptions.data[i].STORAGE_DNUMBER)).toFixed(2);               //含税总价
                    $scope.gridOptions.data[i].NOT_TAX_AMOUNT = (parseFloat($scope.gridOptions.data[i].NOT_TAX_UNITPRICE) * parseFloat($scope.gridOptions.data[i].STORAGE_DNUMBER)).toFixed(2);     //不含税总价
                });
                calcTotal();
            }

            function checkExchangeRate(data) {
                var flag = true;
                angular.forEach(data, function (row, i) {
                    if (row['3'] == null) {
                        flag = false;
                    }
                });
                return flag;
            }

            //计算总金额
            function calTotalMoney(pmoneyID, moneyTime) {
                var timeTemp = angular.copy(moneyTime);
                timeTemp = new Date(timeTemp.replace(/-/g, '/')).getTime();
                timeTemp = Math.round((timeTemp).valueOf() / 1000);
                //单价 金额改变
                var exchangeTemp = [];
                angular.forEach($scope.gridOptions.data, function (row, i) {
                    var temp = [];
                    temp.push(row.MONEY_ID);
                    temp.push(pmoneyID);
                    temp.push(timeTemp);
                    exchangeTemp.push(temp)
                });
                if (exchangeTemp.length) {
                    httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", exchangeTemp).then(function (datas) {
                        var flag = checkExchangeRate(datas.data);
                        if (flag) {
                            changeExchangeRate(datas.data);
                        } else {
                            Notification.error(transervice.tran(messageService.error_exchange_rate));
                            $scope.model.MONEY_ID = $scope.model.MONEY_ID_TEMP;
                        }
                    });
                }
            }

            //查询客户
            $scope.searchPartner = function () {
                partner_list_service.showDialog([]).then(function (data) {
                    if ($scope.gridOptions.data.length > 0) {
                        $confirm({text: transervice.tran('修改供应商会把明细清空，是否继续？')}).then(function () {
                            //清空明细
                            $scope.gridOptions.data = [];
                            $scope.model.needPurchase = 0;
                            $scope.model.STORAGE_MONEY = 0.00;
                            $scope.model.customerName = data.PARTNER_NAME_CN;
                            $scope.model.PPARTNER_ID = data.PARTNER_ID;
                        });
                    } else {
                        $scope.model.customerName = data.PARTNER_NAME_CN;
                        $scope.model.PARTNER_ID = data.PARTNER_ID;
                    }
                });
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            $scope.orgoptions = {
                types: [4],
                change: function (ORGANISATION_ID, entity) {
                    //组织列表选择change事件
                    if (ORGANISATION_ID) {
                        if ($scope.model.ORGANISATION_ID && $scope.gridOptions.data.length > 0) {
                            $confirm({text: transervice.tran('修改组织会把明细清空，是否继续？')}).then(function () {
                                //清空明细
                                $scope.gridOptions.data = [];
                                $scope.model.needPurchase = 0;
                                $scope.model.STORAGE_MONEY = 0.00;
                                $scope.model.ORGANISATION_ID_TEMP = $scope.model.ORGANISATION_ID
                                orgChangeWarehouse(ORGANISATION_ID);
                            }, function () {
                                $scope.model.ORGANISATION_ID = $scope.model.ORGANISATION_ID_TEMP
                            });
                        } else {
                            $scope.model.ORGANISATION_ID_TEMP = $scope.model.ORGANISATION_ID
                            orgChangeWarehouse(ORGANISATION_ID);
                        }
                    }
                }
            };

            function orgChangeWarehouse(ORGANISATION_ID) {
                $scope.model.ORGANISATION_ID = ORGANISATION_ID;
                $scope.model.warehouseList = new Array();
                angular.forEach($scope.model.warehouseTotalList, function (obj, index) {
                    if (obj.ORGANISATION_ID == ORGANISATION_ID && obj.WAREHOUSE_TYPE_ID == 1) {
                        $scope.model.warehouseList.push(obj);
                    }
                });
            }

            //初始化
            function init() {
                if (model) {
                    $scope.model.ORGANISATION_ID = model.ORGANISATION_ID;
                    angular.forEach($scope.model.warehouseTotalList, function (obj, index) {
                        if (obj.ORGANISATION_ID == $scope.model.ORGANISATION_ID && obj.WAREHOUSE_TYPE_ID == 1) {
                            $scope.model.warehouseList.push(obj);
                        }
                    });
                    angular.forEach($scope.model.warehouseList, function (obj, index) {
                        if (obj.WAREHOUSE_TYPE_ID == 1) {
                            $scope.model.WAREHOUSE_ID = obj.WAREHOUSE_ID;
                        }
                    });
                    $scope.model.customerName = model.PARTNER_NAME_CN;
                    $scope.model.PARTNER_ID = model.PARTNER_ID;
                    $scope.model.ORDER_TYPE = "1";
                    $scope.model.MONEY_ID = model.MONEY_ID;
                    $scope.model.STORAGE_MONEY = model.STORAGE_MONEY;
                    $scope.model.needPurchase = 1;
                    $scope.addDetailX(model.data);
                    //calTotalMoney($scope.model.MONEY_ID, $scope.model.STORAGE_AT);
                    model = "";
                }
                $scope.model.MONEY_ID_TEMP = $scope.model.MONEY_ID;
                $scope.model.ORGANISATION_ID_TEMP = $scope.model.ORGANISATION_ID;
            }

            function baseInit() {
                //页面元素显示初始化
                $scope.model = new Object();
                $scope.model.needPurchase = 0;//默认为0, 为1时只能选择采购定订单, 为2时只能选择入库单
                $scope.model.currentuser = configService.getUserInfo();
                $scope.model.currentState = "草稿";
                $scope.model.CUSER_NAME = $scope.model.currentuser == null ? "" : $scope.model.currentuser.u_staffinfo2.STAFF_NAME_CN;
                $scope.model.CUSER_ID = $scope.model.currentuser == null ? "" : $scope.model.currentuser.USER_INFO_ID;
                $scope.showAuth = false;
                $scope.showResetAuth = false;
                $scope.model.MONEY_ID = "";
                $scope.model.STORAGE_MONEY = 0.00;
                $scope.model.ORDER_TYPE = "1";
                $scope.model.typeList = [{
                    "value": "1",
                    "name": "采购入库"
                }, {
                    "value": "2",
                    "name": "内部采购入库"
                }, {
                    "value": "3",
                    "name": "其他入库"
                }];
                //时间日期初始化
                $scope.model.CREATED_ATTEMP = $filter("date")(new Date(), "yyyy-MM-dd");
                $scope.model.STORAGE_AT = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss");
                var conWhere = {"where": ["=", "MONEY_STATE", 1]};
                //初始化币种列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", conWhere).then(function (result) {
                    $scope.model.moneyList = result.data;
                }).then(function () {
                    //初始化入库仓库列表
                    var selectWhere = {"where": ["=", "WAREHOUSE_STATE", 1], 'limit': 0};
                    httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                        $scope.model.warehouseTotalList = result.data;
                        $scope.model.warehouseList = [];
                        init();
                    });
                });
            }

            //切换单据类型事件
            $scope.changeType = function () {
                if ($scope.gridOptions.data.length > 0) {
                    if ($scope.gridOptions.data[0]["PSKU_CODE"] != "") {
                        $confirm({text: transervice.tran('修改单据类型会把明细清空，是否继续？')}).then(function () {
                            //清空明细
                            $scope.gridOptions.data = [];
                            $scope.model.needPurchase = 0;
                        });
                    } else {
                        //清空明细
                        $scope.gridOptions.data = [];
                        $scope.model.needPurchase = 0;
                    }
                }
            }

            //获取仓库名称
            $scope.getWarehouseName = function (warehouseID) {
                if (warehouseID) {
                    var warehouse = $scope.model.warehouseList.filter(c=>c.WAREHOUSE_ID == warehouseID);
                    if (warehouse.length) {
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            }

            //新增明细
            $scope.addDetailX = function (object) {
                object.forEach(d => {
                    var newData = {
                        "PU_ORDER_CD": d.PU_ORDER_CD,
                        "RED_STORAGE_CD": "",
                        "MONEY_ID": d.MONEY_ID,
                        "PSKU_CODE": d.PSKU_CODE,
                        "PSKU_ID": d.PSKU_ID,
                        "PSKU_NAME_CN": d.PSKU_NAME_CN,
                        "UNIT_ID": d.UNIT_ID,
                        "TAX_RATE": d.TAX_RATE,
                        "STORAGE_DNUMBER": d.STORAGE_DNUMBER,
                        "UNIT_PRICE": d.TAX_UNITPRICE,
                        "NOT_TAX_UNITPRICE": d.NOT_TAX_UNITPRICE,
                        "STORAGE_DMONEY": d.STORAGE_DMONEY,
                        "NOT_TAX_AMOUNT": d.NOT_TAX_AMOUNT,
                        "SWAREHOUSE_ID": $scope.model.WAREHOUSE_ID,
                        "warehouseList": $scope.model.warehouseList,
                        options: angular.copy($scope.options),
                        "UNIT_NAME": d.UNIT_NAME_CN,
                        "PURCHASE_DETAIL_ID": d.PURCHASE_DETAIL_ID
                    };
                    $scope.gridOptions.data.unshift(newData);
                });
            };

            //新增明细
            $scope.addDetail = function (index) {
                var msg = checkInfo();
                if (msg != "") {
                    return Notification.error(transervice.tran(msg));
                }
                var newData = {
                    "PU_ORDER_CD": "",
                    "RED_STORAGE_CD": "",
                    "PSKU_CODE": "",
                    "PSKU_ID": "",
                    "PSKU_NAME_CN": "",
                    "TDRODUCT_DE": "",
                    "UNIT_ID": "",
                    "STORAGE_DNUMBER": "",
                    "UNIT_PRICE": "",
                    "STORAGE_DMONEY": "",
                    "TAX_RATE": "",
                    "NOT_TAX_UNITPRICE": "",
                    "NOT_TAX_AMOUNT": "",
                    "SWAREHOUSE_ID": $scope.model.WAREHOUSE_ID,
                    "warehouseList": $scope.model.warehouseList,
                    options: angular.copy($scope.options),
                    "UNIT_NAME": ""
                };
                index = index ? index : 0;
                $scope.gridOptions.data.splice(index, 0, newData);
            };

            //行删除
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                //移除数据
                rows.forEach((obj)=> {
                    $scope.model.STORAGE_MONEY = (Number($scope.model.STORAGE_MONEY) - Number(obj.STORAGE_DMONEY)).toFixed(2);
                    $scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                })
                if ($scope.gridOptions.data <= 0) {
                    $scope.model.needPurchase = 0;
                }
                $scope.gridApi.selection.clearSelectedRows();
            }

            function searchPuorderStorageData() {
                var modelTemp = new Object();
                modelTemp.ORGANISATION_ID = $scope.model.ORGANISATION_ID;
                modelTemp.PARTNER_ID = $scope.model.PARTNER_ID;
                modelTemp.MONEY_ID = $scope.model.MONEY_ID;
                var timeTemp = new Date($scope.model.STORAGE_AT.replace(/-/g, '/')).getTime();
                timeTemp = Math.round((timeTemp).valueOf() / 1000);
                modelTemp.STORAGE_AT = timeTemp;
                modelTemp.EXISTS_DETAILID = [];
                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    if (obj.PURCHASE_DETAIL_ID) {
                        modelTemp.EXISTS_DETAILID.push(obj.PURCHASE_DETAIL_ID);
                    }
                });
                return modelTemp;
            }

            //查询采购订单
            $scope.searchPuorder = function (entity) {
                var msg = checkSelectInfo(2);
                if (msg != "") {
                    if (msg == 1) {
                        return;
                    } else {
                        return Notification.error(transervice.tran(msg));
                    }
                }
                var modelTemp = searchPuorderStorageData();
                purchaseChooseService.showDialog(modelTemp).then(function (data) {
                    formatSelectData(entity, data, 1);
                });
            }

            //查询历史入库单
            $scope.searchStorage = function (entity) {
                var msg = checkSelectInfo(1);
                if (msg != "") {
                    if (msg == 1) {
                        return;
                    } else {
                        return Notification.error(transervice.tran(msg));
                    }
                }
                var modelTemp = searchPuorderStorageData();
                historyStorageChooseService.showDialog(modelTemp).then(function (data) {
                    formatSelectData(entity, data, 2);
                });
            }

            function formatSelectData(entity, dataArray, flag) {
                var data = dataArray['0'];
                var index = $.inArray(entity, $scope.gridOptions.data);
                entity.RED_STORAGE_CD = data.RED_STORAGE_CD;
                entity.RED_STORAGE_DETAIL_ID = data.RED_STORAGE_DETAIL_ID;
                entity.STORAGE_DNUMBER = data.STORAGE_DNUMBER;
                entity.MONEY_ID = data.MONEY_ID;
                entity.PU_ORDER_CD = data.PU_ORDER_CD;
                entity.PURCHASE_DETAIL_ID = data.PURCHASE_DETAIL_ID;
                entity.PSKU_CODE = data.PSKU_CODE;
                entity.PSKU_ID = data.PSKU_ID;
                entity.PSKU_NAME_CN = data.PSKU_NAME_CN;
                entity.UNIT_ID = data.UNIT_ID;
                entity.UNIT_NAME = data.UNIT_NAME_CN;
                entity.TAX_RATE = data.TAX_RATE; //税率
                entity.UNIT_PRICE = data.UNIT_PRICE == null ? 0 : data.UNIT_PRICE; //含税单价
                var STORAGE_DMONEY = entity.STORAGE_DMONEY;
                entity.STORAGE_DMONEY = (Number(entity.UNIT_PRICE) * Number(entity.STORAGE_DNUMBER)).toFixed(2); //含税总价
                entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE == null ? 0 : data.NOT_TAX_UNITPRICE; //不含税单价
                entity.NOT_TAX_AMOUNT = (Number(entity.NOT_TAX_UNITPRICE) * Number(entity.STORAGE_DNUMBER)).toFixed(2); //不含税总价
                $scope.model.needPurchase = flag;
                $scope.model.STORAGE_MONEY = (Number($scope.model.STORAGE_MONEY) + Number(entity.STORAGE_DMONEY) - Number(STORAGE_DMONEY)).toFixed(2);
                $scope.gridOptions.gridApi.grid.refresh();
                dataArray.splice(0, 1);
                if (dataArray.length > 0) {
                    $scope.addDetail(++index);
                    formatSelectData($scope.gridOptions.data[index], dataArray, flag);
                }
            }

            function checkSelectInfo(flag) {
                var msg = "";
                if ($scope.model.ORDER_STATE == 2) {
                    msg = "1";
                }
                if ($scope.model.needPurchase != 0) {
                    if ($scope.gridOptions.data.length > 1) {
                        if ($scope.model.needPurchase == flag) {
                            msg = "1";
                        }
                    }
                }
                if (!$scope.model.ORGANISATION_ID) {
                    msg = "请选择组织";
                }
                if (!$scope.model.customerName) {
                    msg = "请选择供应商";
                }
                if (!$scope.model.MONEY_ID) {
                    msg = "请选择金额信息-币种";
                }
                return msg;
            }

            //保存操作
            $scope.save = function () {
                //校验信息
                var msg = checkInfo();
                if (msg != "") {
                    return Notification.error(transervice.tran(msg));
                }
                msg = checkDetailInfo();
                if (msg != "") {
                    return Notification.error(transervice.tran(msg));
                }

                //组装数据
                var modelTemp = getInfo();

                return httpService.httpHelper(httpService.webApi.api, "inventory/storage", "create", "POST", modelTemp).then(function (result) {
                    afterSave(result);
                });
            };

            //校验信息
            function checkInfo() {
                if (!$scope.model) {
                    return "请选择组织";
                }
                if (!$scope.model.ORGANISATION_ID) {
                    return "请选择组织";
                } else if (!$scope.model.ORDER_TYPE) {
                    return "请选择单据类型";
                } else if (!$scope.model.PARTNER_ID) {
                    return "请选择供应商";
                } else if (!$scope.model.WAREHOUSE_ID) {
                    return "请选择入库仓库";
                } else if (!$scope.model.MONEY_ID) {
                    return "请选择金额信息-币种";
                }
                return "";
            }

            //校验明细信息
            function checkDetailInfo() {
                if ($scope.gridOptions.data.length <= 0) {
                    return "请添加入库明细";
                }
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    if (!row.PURCHASE_DETAIL_ID) {
                        return "请选择采购订单或者入库单";
                    } else if (!row.PSKU_CODE) {
                        return "请选择SKU";
                    } else if (!row.SWAREHOUSE_ID) {
                        return "请选择入库明细的入库仓库";
                    } else if (!row.STORAGE_DNUMBER && !row.STORAGE_DNUMBER == 0) {
                        return "请填写SKU数量";
                    }
                });
                return "";
            }

            //删除多余数据
            function deleteSurplus(modelTemp) {
                delete modelTemp['b_warehouse'];
                delete modelTemp['currentuser'];
                delete modelTemp['moneyList'];
                delete modelTemp['o_organisation'];
                delete modelTemp['stateList'];
                delete modelTemp['pa_partner'];
                delete modelTemp['typeList'];
                delete modelTemp['u_userinfoc'];
                delete modelTemp['warehouseList'];
                angular.forEach(modelTemp.sk_storage_detail, function (obj, index) {
                    delete obj['b_unit'];
                    delete obj['g_product_sku'];
                    delete obj['warehouseList'];
                });
                return modelTemp;
            }

            //组装数据
            function getInfo() {
                var modelTemp = angular.copy($scope.model);
                //组装数据
                var formatDate = new Date(modelTemp.STORAGE_AT.replace(/-/g, '/')).getTime();
                modelTemp.STORAGE_AT = Math.round(formatDate / 1000);
                //明细
                modelTemp.sk_storage_detail = angular.copy($scope.gridOptions.data);
                modelTemp = deleteSurplus(modelTemp);
                return modelTemp;
            }

            //保存后处理
            function afterSave(result) {
                Notification.success(transervice.tran(result.message));
                setTimeout(function () {
                    $modalInstance.close($scope.model);//返回数据
                }, 50);
                $scope.showAuth = true;
            }

            //基本信息和金额信息初始化
            baseInit();
        });
    })
