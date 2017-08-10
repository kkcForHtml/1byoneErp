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
            'skstorageEditService',
            function ($q, $modal) {
                this.showDialog = function (model, index, count, searchConditions, idList) {
                    return $modal.open({
                        animation: true,
                        controller: "skstorageEditCtrl",
                        backdrop: "static",
                        size: "llg", //lg,sm,md,llg,ssm
                        templateUrl: 'app/inventoryCenter/skstorage/views/skstorage_edit.html?ver=' + _version_,
                        resolve: {
                            model: function () {
                                return model;
                            },
                            index: function () {
                                return index;
                            },
                            count: function () {
                                return count;
                            },
                            searchConditions: function () {
                                return searchConditions;
                            },
                            idList: function () {
                                return idList;
                            }
                        }
                    }).result;
                };
            }
        );
        angularAMD.controller("skstorageEditCtrl", function ($scope, amHttp, $confirm, model, index, count, searchConditions, idList, $modalInstance, httpService, Notification, configService, purchaseChooseService, transervice, $http, $q, $interval, commonService, historyStorageChooseService, $filter, partner_list_service, gridDefaultOptionsService, messageService) {
            $scope.index = index;
            if (idList)
                $scope.count = idList.length;
            //$scope.count = count;
            $scope.searchConditions = searchConditions;
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PU_ORDER_CD',
                        displayName: transervice.tran('采购订单'),
                        enableCellEdit: false,
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents" ng-click="grid.appScope.searchPuorder(row.entity)" style="width:100%;">{{row.entity.PU_ORDER_CD}}</div>',

                    },
                    {
                        field: 'RED_STORAGE_CD',
                        displayName: transervice.tran('红字入库单号'),
                        enableCellEdit: false,
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents " ng-click="grid.appScope.searchStorage(row.entity)" style="width:100%;">{{row.entity.RED_STORAGE_CD}}</div>',
                    },
                    {
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        width: 110,
                        displayName: transervice.tran('SKU')
                    },
                    {
                        field: 'PSKU_NAME_CN',
                        displayName: transervice.tran('产品名称'),
                        enableCellEdit: false
                    },
                    {
                        field: 'UNIT_ID',
                        displayName: transervice.tran('单位'),
                        enableCellEdit: false,
                        cellClass: 'text-right',
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.UNIT_NAME}}</div>'
                    },
                    {
                        field: 'STORAGE_DNUMBER',
                        displayName: transervice.tran('数量'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999" min="-99999999"   ui-grid-editor ng-model="row.entity.STORAGE_DNUMBER"></form></div>',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if (row.entity.STORAGE_DNUMBER < 0) {
                                return 'red_edit'
                            }
                            return 'text-right'
                        },
                        enableCellEdit: true,
                        cellEditableCondition: function () {
                            return $scope.model.ORDER_STATE != 2;
                        }
                    }, {
                        field: 'TAX_RATE',
                        displayName: transervice.tran('税率'),
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
                        field: 'SWAREHOUSE_ID',
                        displayName: transervice.tran('入库仓库'),
                        width: 150,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getWarehouseName(row.entity.SWAREHOUSE_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "warehouseList",
                        cellEditableCondition: function () {
                            return $scope.model.ORDER_STATE != 2;
                        }
                    }
                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false //是否使用分页按钮
            };

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //翻页触发方法
            $scope.gridOptions.getPage = function (pageNo, pageSize) {

            }

            //首单
            $scope.firstPage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery(0).then(function () {
                    $scope.index = 0;
                    $scope.nextBtnDisabled = false;
                });
            };

            //上一单
            $scope.prePage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.index - 1).then(function () {
                    $scope.index -= 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //下一单
            $scope.nextPage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.index + 1).then(function () {
                    $scope.index += 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //尾单
            $scope.lastPage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.count - 1).then(function () {
                    $scope.index = $scope.count - 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //翻单查询
            function turnPageQuery(offset) {
                /*$scope.gridOptions.data = [];
                 $scope.searchConditions.offset = offset;
                 delete $scope.searchConditions.limit;
                 return httpService.httpHelper(httpService.webApi.api, "inventory/storage", "view", "POST", $scope.searchConditions).then(function (result) {
                 initMain(result.data);
                 });*/
                return initMain(idList[offset]);
            }

            //获取api
            $scope.gridOptions.getGridApi = function (api) {
                $scope.gridApi = api;
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

            //计算总金额
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

            //根据汇率修改单价和不含税单价
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

            //校验是否所有汇率都存在
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
                //单价 金额改变
                var exchangeTemp = [];
                angular.forEach($scope.gridOptions.data, function (row, i) {
                    var temp = [];
                    temp.push(row.MONEY_ID);
                    temp.push(pmoneyID);
                    temp.push(moneyTime);
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
                } else {
                    $scope.model.STORAGE_MONEY = 0.00;
                }
            }

            //取消操作
            $scope.cancel = function () {
                if ($scope.gridOptions.data.length <= 0) {
                    return Notification.error(transervice.tran("请添加入库明细"));
                } else {
                    var flag = false;
                    angular.forEach($scope.gridOptions.data, function (obj, index) {
                        if (obj["STORAGE_DETAIL_ID"] && obj["STORAGE_DETAIL_ID"] != "") {
                            flag = true;
                        }
                    });
                    if (!flag) {
                        return Notification.error(transervice.tran("请保存明细"));
                    }
                }
                $modalInstance.close();
            };

            //获取仓库名称
            $scope.getWarehouseName = function (warehouseID) {
                var name = "";
                if (warehouseID) {
                    angular.forEach($scope.modelInit.warehouseList, function (obj, index) {
                        if (obj.WAREHOUSE_ID == warehouseID) {
                            name = obj.WAREHOUSE_NAME_CN;
                        }
                    });
                }
                return name;
            }

            function initBase() {
                $scope.modelInit = new Object();
                $scope.modelInit.STORAGE_ID = angular.copy(model.STORAGE_ID);
                $scope.modelInit.isLink = angular.copy(model.isLink);
                $scope.modelInit.isLink = $scope.modelInit.isLink ? $scope.modelInit.isLink : 1;
                //当前登陆者
                $scope.modelInit.currentuser = configService.getUserInfo();
                $scope.modelInit.stateList = commonService.getDicList("SK_STORAGE");
                $scope.modelInit.typeList = [{
                    "value": "1",
                    "name": "采购入库"
                }, {
                    "value": "2",
                    "name": "内部采购入库"
                }, {
                    "value": "3",
                    "name": "其他入库"
                }];
                //初始化所有国家、仓库
                return configService.getOrganisationList([4]).then(function (datas) {
                    $scope.modelInit.organisationList = datas;
                    $scope.modelInit.warehouseList = [];
                }).then(function () {
                    var where = {"where": ["=", "MONEY_STATE", 1]};
                    //初始化币种列表
                    return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", where).then(function (result) {
                        $scope.modelInit.moneyList = result.data;
                    }).then(function () {
                        return initMain($scope.modelInit.STORAGE_ID);
                    });
                });
            }

            //根据需要修改按钮的显示
            function formatButton() {
                if ($scope.model.ORDER_STATE == 2) {
                    $scope.showAuth = false;
                    if ($scope.model.SYSTEM_GENERATION == 1) {
                        //系统自动生成的单据不能反审核
                        $scope.showResetAuth = false;
                    } else {
                        $scope.showResetAuth = true;
                    }
                    $scope.showSave = false;
                } else {
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                }
            }

            //格式化主表信息
            function initMain(STORAGE_ID) {
                var where = {
                    "where": ["=", "sk_storage.STORAGE_ID", STORAGE_ID],
                    "joinwith": ["pa_partner", "u_userinfoc"]
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/storage", "view", "POST", where).then(function (result) {
                    $scope.model = angular.copy(result.data);
                    //区分页面按钮 显示或者隐藏
                    formatButton();
                    //$scope.model.ORGANISATION_NAME_CN = $scope.model.o_organisation.ORGANISATION_NAME_CN;
                    $scope.model.CUSER_NAME = $scope.model.u_userinfoc == null ? "" : $scope.model.u_userinfoc.u_staff_info.STAFF_NAME_CN;
                    $scope.model.STORAGE_AT1 = $filter("date")(new Date(parseInt($scope.model.STORAGE_AT) * 1000), "yyyy-MM-dd");
                    $scope.model.CREATED_AT1 = $filter("date")(new Date(parseInt($scope.model.CREATED_AT) * 1000), "yyyy-MM-dd");
                    $scope.model.customerName = $scope.model.pa_partner.PARTNER_NAME_CN;
                    $scope.model.MONEY_ID_TEMP = $scope.model.MONEY_ID;
                    $scope.model.needPurchase = 1;//1 采购 2 红字  默认为 1
                    $scope.modelInit.warehouseList = [];
                    angular.forEach($scope.modelInit.organisationList, function (obj, index) {
                        if (obj.ORGANISATION_ID == $scope.model.ORGANISATION_ID) {
                            $scope.model.ORGANISATION_NAME_CN = obj.ORGANISATION_NAME_CN;
                            //已审核并且是内部生成的内部采购入库单需要显示所有仓库
                            if ($scope.model.ORDER_STATE == 2 && $scope.model.SYSTEM_GENERATION == 1) {
                                $scope.modelInit.warehouseList = obj.user_warehouse;
                            } else { //只显示中转仓
                                angular.forEach(obj.user_warehouse, function (obj, index) {
                                    if (obj.WAREHOUSE_TYPE_ID == 1) {
                                        $scope.modelInit.warehouseList.push(obj);
                                    }
                                });
                            }
                        }
                    });
                    return initDetail();
                });
            }

            //格式化子表信息
            function initDetail() {
                var where = {
                    "where": ["=", "sk_storage_detail.STORAGE_ID", $scope.model.STORAGE_ID],
                    "joinwith": ["b_unit"],
                    "orderby": "sk_storage_detail.UPDATED_AT DESC"
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/storagedetail", "index", "POST", where).then(function (result) {
                    result._meta.totalCount * 1 && ($scope.gridOptions.totalItems = result._meta.totalCount);
                    $scope.gridOptions.data = result.data;
                    if ($scope.gridOptions.data.length > 0) {
                        angular.forEach($scope.gridOptions.data, function (obj, index) {
                            obj.UNIT_NAME = obj.b_unit.UNIT_NAME_CN;
                            obj.MONEY_ID = $scope.model.MONEY_ID;
                            obj.warehouseList = $scope.modelInit.warehouseList;
                            if (obj.RED_STORAGE_DETAIL_ID) {
                                $scope.model.needPurchase = 2;
                            }
                        });
                    } else {
                        $scope.model.needPurchase = 0;
                    }
                });
            }

            //新增明细
            $scope.addDetail = function (index) {
                var newData = {
                    "PU_ORDER_CD": "",
                    "STORAGE_CD": "",
                    "PSKU_CODE": "",
                    "PSKU_ID": "",
                    "UNIT_ID": "",
                    "STORAGE_DNUMBER": 0,
                    "UNIT_PRICE": 0,
                    "STORAGE_DMONEY": 0,
                    "SWAREHOUSE_ID": $scope.model.WAREHOUSE_ID,
                    "warehouseList": $scope.model.warehouseList,
                    options: angular.copy($scope.options),
                    "UNIT_NAME": "",
                    "PSKU_NAME_CN": "",
                    "NOT_TAX_AMOUNT": 0,
                    "NOT_TAX_UNITPRICE": 0,
                    "TAX_RATE": 0,
                };
                index = index ? index : 0;
                $scope.gridOptions.data.splice(index, 0, newData);
            };

            //删除按钮
            $scope.delDetail = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                if (rows.length >= $scope.gridOptions.data.length) {
                    return Notification.error(transervice.tran(messageService.error_detail_delAll));
                }

                var myArray = new Array();
                var myArrayNot = new Array();
                var exitsTemp = 0;
                angular.forEach($scope.gridOptions.data, function (obj, objIndex) {
                    if (obj["STORAGE_DETAIL_ID"] && obj["STORAGE_DETAIL_ID"] > 0) {
                        exitsTemp++;
                    }
                });
                angular.forEach(rows, function (obj, objIndex) {
                    if (obj["STORAGE_DETAIL_ID"] && obj["STORAGE_DETAIL_ID"] > 0) {
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
                                $scope.model.STORAGE_MONEY = (Number($scope.model.STORAGE_MONEY) - Number(obj.STORAGE_DMONEY)).toFixed(2);
                            }
                        });
                    });
                    $scope.gridApi.rowEdit.setRowsClean(myArrayNot);
                    if (myArray.length <= 0) {
                        $scope.gridApi.selection.clearSelectedRows();
                    }
                    if ($scope.gridOptions.data <= 0) {
                        $scope.model.needPurchase = 0;
                    }
                }
                if (myArray.length > 0) {
                    if (exitsTemp > myArray.length) {
                        $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                            var deleteRowModel = {
                                "batch": myArray
                            };
                            httpService.httpHelper(httpService.webApi.api, "inventory/storagedetail", "delete", "POST", deleteRowModel).then(function (datas) {
                                $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                                $scope.gridApi.selection.clearSelectedRows();
                                angular.forEach(myArray, function (obj, objIndex) {
                                    $scope.model.STORAGE_MONEY = (Number($scope.model.STORAGE_MONEY) - Number(obj.STORAGE_DMONEY)).toFixed(2);
                                });
                                Notification.success(datas.message);
                                initDetail();
                            });
                        });
                    } else {
                        return Notification.error(transervice.tran("明细必须保存一条实际存在的数据"));
                    }
                }
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

                httpService.httpHelper(httpService.webApi.api, "inventory/storage", "update?id=" + $scope.model.STORAGE_ID, "POST", modelTemp).then(function (datas) {
                    setTimeout(function () {
                        $modalInstance.close($scope.model); //返回数据
                    }, 50);
                    Notification.success(transervice.tran(datas.message));
                });
            };

            //组装数据
            function getInfo() {
                var modelTemp = angular.copy($scope.model);
                //明细
                modelTemp.sk_storage_detail = angular.copy($scope.gridOptions.data);
                modelTemp = deleteSurplus(modelTemp);
                return modelTemp;
            }

            //审核
            $scope.authSkstorage = function () {
                checkAuth(2, 1);
            }

            //反审核
            $scope.resetAuthSkstorage = function () {
                //校验确认审核
                checkAuth(1, 2);
            }

            //校验确认审核
            function checkAuth(planState, authFlag) {
                var msg = checkInfo(planState);
                if (msg != "") {
                    return Notification.error(transervice.tran(msg));
                }
                msg = checkDetailInfo();
                if (msg != "") {
                    return Notification.error(transervice.tran(msg));
                }

                var dataTemp = formatDetail();
                //ORDER_STATE 2为审核，1为反审核
                var data = {
                    "ORDER_STATE": planState,
                    "batchMTC": dataTemp
                }

                httpService.httpHelper(httpService.webApi.api, "inventory/storage", "auditreaudit", "POST", data).then(function (datas) {
                    if (datas.data.flag == 1) {
                        //更新单据状态
                        updateSkState(planState, authFlag);
                    } else if (datas.data.flag == 2) {
                        return Notification.error(transervice.tran('入库日期不在会计期间！'));
                    } else {
                        $confirm({text: transervice.tran('选择的' + datas.data.instant_inventory + '库存不足，是否继续操作？')}).then(function () {
                            //更新单据状态
                            updateSkState(planState, authFlag);
                        });
                    }
                });
            }

            //校验信息
            function checkInfo(planState) {
                if ($scope.model.SYSTEM_GENERATION == 1) {
                    return messageService.error_audit_s;
                }
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
                } else if ($scope.model.ORDER_STATE == planState) {
                    return planState == 1 ? messageService.error_audit_a : messageService.error_audit_n;
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

            function formatDetail() {
                var arr = new Array();
                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    var temp = new Object();
                    temp["SWAREHOUSE_ID"] = obj.SWAREHOUSE_ID;
                    temp["PSKU_ID"] = obj.PSKU_ID;
                    temp["PSKU_CODE"] = obj.PSKU_CODE;
                    temp["STORAGE_DNUMBER"] = obj.STORAGE_DNUMBER;
                    temp["STORAGE_ID"] = $scope.model.STORAGE_ID;
                    arr.push(temp);
                });
                return arr;
            }

            //更新入库单状态
            function updateSkState(planState, authFlag) {
                //组装数据
                var modelTemp = formatData(planState);
                var dataSearch = new Object();
                dataSearch["ORDER_STATE"] = planState;
                dataSearch["batchMTC"] = new Array();
                dataSearch["batchMTC"].push(modelTemp);
                if (planState == 2) {
                    return $confirm({
                        text: transervice.tran(messageService.confirm_audit)
                    }).then(function () {
                        updateData(dataSearch, authFlag);
                    });
                } else {
                    updateData(dataSearch, authFlag);
                }
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
                delete modelTemp['UUSER_ID'];
                delete modelTemp['UPDATED_AT'];
                delete modelTemp['CREATED_AT'];
                delete modelTemp['CUSER_ID'];
                angular.forEach(modelTemp.sk_storage_detail, function (obj, index) {
                    delete obj['b_unit'];
                    delete obj['g_product_sku'];
                    delete obj['warehouseList'];
                    delete obj['UUSER_ID'];
                    delete obj['UPDATED_AT'];
                    delete obj['CUSER_ID'];
                    delete obj['CREATED_AT'];
                });
                return modelTemp;
            }

            //组装审核反审核数据
            function formatData(planState) {
                var modelTemp = angular.copy($scope.model);
                modelTemp.ORDER_STATE = planState;
                if (planState == 2) {
                    modelTemp.AUTITO_ID = $scope.modelInit.currentuser == null ? "" : $scope.modelInit.currentuser.USER_INFO_ID;
                    modelTemp.AUTITO_AT = Math.round(new Date().getTime() / 1000);
                }
                modelTemp["authFlag"] = planState && planState == 2 ? 1 : 0;
                modelTemp.sk_storage_detail = angular.copy($scope.gridOptions.data);
                modelTemp = deleteSurplus(modelTemp);
                return modelTemp
            }

            //更新数据库
            function updateData(dataSearch, authFlag) {
                httpService.httpHelper(httpService.webApi.api, "inventory/storage", "updatecustom", "POST", dataSearch).then(function (datas) {
                    Notification.success(transervice.tran(datas.message));
                    afterAuth(authFlag);
                });
            }

            //审核和反审核后的处理
            function afterAuth(authFlag) {
                if (authFlag == 1) {
                    $scope.model.ORDER_STATE = "2";
                } else {
                    $scope.model.ORDER_STATE = "1";
                }
                formatButton();
                initDetail();
            }

            //拼装查询采购订单和历史入库单数据
            function searchPuorderStorageData() {
                var modelTemp = new Object();
                modelTemp.ORGANISATION_ID = $scope.model.ORGANISATION_ID;
                modelTemp.PARTNER_ID = $scope.model.PARTNER_ID;
                modelTemp.MONEY_ID = $scope.model.MONEY_ID;
                modelTemp.STORAGE_AT = $scope.model.STORAGE_AT;
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

            //格式化选择的数据加入明细
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
                entity.STORAGE_DMONEY = (parseFloat(entity.UNIT_PRICE) * parseFloat(entity.STORAGE_DNUMBER)).toFixed(2); //含税总价
                entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE == null ? 0 : data.NOT_TAX_UNITPRICE; //不含税单价
                entity.NOT_TAX_AMOUNT = (parseFloat(entity.NOT_TAX_UNITPRICE) * parseFloat(entity.STORAGE_DNUMBER)).toFixed(2); //不含税总价
                $scope.model.needPurchase = flag;
                $scope.model.STORAGE_MONEY = (Number($scope.model.STORAGE_MONEY) + Number(entity.STORAGE_DMONEY) - Number(STORAGE_DMONEY)).toFixed(2);
                $scope.gridOptions.gridApi.grid.refresh();
                dataArray.splice(0, 1);
                if (dataArray.length > 0) {
                    $scope.addDetail(++index);
                    formatSelectData($scope.gridOptions.data[index], dataArray, flag);
                }
            }

            //校验要选择的数据合法性
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
                    msg = "请先选择组织";
                }
                if (!$scope.model.customerName) {
                    msg = "请先选择供应商";
                }
                if (!$scope.model.MONEY_ID) {
                    msg = "请先选择币种";
                }
                return msg;
            }

            initBase();
        });
    })