define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',
        'app/masterCenter/product/controllers/productSKUCtrl',
        'app/inventoryCenter/common/controllers/SaleorderChooseService',
        'app/inventoryCenter/common/controllers/historyPlacingChooseService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'skplacingEditService',
            function ($q, $modal) {
                this.showDialog = function (model, index, count, idList) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skplacingEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skplacing/views/skplacing_edit.html?ver=' + _version_,
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
                                idList: function () {
                                    return idList;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skplacingEditCtrl", function ($scope, amHttp, $confirm, model, index, count, idList, $modalInstance, httpService, Notification, configService, transervice, $http, $q, $interval, commonService, $filter, partner_list_service, SaleorderChooseService, historyPlacingChooseService, gridDefaultOptionsService, messageService) {
            $scope.index = index;
            $scope.count = count;
            $scope.idList = idList;
            $scope.rowEntity = {warehouseList: []};
            $scope.warehouseTotalList = new Array();
            $scope.warehouseTypeArr = new Array(1, 2, 5, 8);
            $scope.MONEY_LIST = new Array();
            $scope.EXCHANGER_LIST = new Array();
            $scope.isSelectSku = 0;
            $scope.isChoosePlacing = 0;

            //初始化单据类型下拉框
            $scope.model = model;
            $scope.needSaleOrder = true;

            $scope.TARIFF = 0.00;  //组织税率

            $scope.sdkCondtion = {
                where: ["and", ["=", "g_product_sku.PSKU_STATE", 1]],
                joinWith: ["b_unit", "g_product_sku_price"]
            };

            $scope.options = {
                filter: "contains",
                autoBind: true,
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_CODE",
                optionLabel: "请输入SKU名称",
                url: httpService.webApi.api + "/master/product/prodsku/index",
                search: $scope.sdkCondtion

            };

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'SALES_ORDER',
                        displayName: transervice.tran('销售订单'),
                        enableCellEdit: false,
                        //cellTemplate: '<div type="button" class="ui-grid-cell-contents ng-binding ng-scope" ng-click="grid.appScope.searchSaleOrder(row.entity)" style="width:100%;">{{row.entity.SALES_ORDER}}</div>',
                        editableCellTemplate: '<div><form><input type="text" maxlength="255" ui-grid-editor ng-model="row.entity.SALES_ORDER"></form></div>',
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'RED_PLACING_CD',
                        displayName: transervice.tran('红字出库单号'),
                        enableCellEdit: false,
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents ng-binding ng-scope" ng-click="grid.appScope.searchPlacingOrder(row.entity)" style="width:100%;">{{row.entity.RED_PLACING_CD}}</div>',
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'PDSKU_CODE',
                        width: 110,
                        displayName: transervice.tran('SKU'),
                        editableCellTemplate: '<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.PSKU_ID" change="grid.appScope.selectRowChange(row)" row="row"></div></div>',                        //enableCellEdit: true,
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    },
                    {field: 'PRODUCT_DE', displayName: transervice.tran('产品说明'), enableCellEdit: false},
                    {
                        field: 'UNIT_ID',
                        displayName: transervice.tran('单位'),
                        enableCellEdit: false,
                        cellClass: 'text-right',
                        cellTemplate: '<span>{{row.entity.b_unit.UNIT_NAME_CN}}</span>'
                    },
                    {
                        field: 'PDNUMBER', displayName: transervice.tran('数量'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.PDNUMBER}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="9999999999" min="-9999999"  ng-disabled="isdisable" ui-grid-editor ng-model="row.entity.PDNUMBER"></form></div>',
                        cellClass: "text-right",
                        enableCellEdit: true,
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    }, {
                        field: 'TAX_RATE', displayName: transervice.tran('税率'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_RATE?row.entity.TAX_RATE*100+"%":row.entity.TAX_RATE}}</div>',
                        editableCellTemplate: '<div><form><input type="text" ui-grid-editor ng-model="row.entity.TAX_RATE"></form></div>',
                        enableCellEdit: true,
                        cellClass: "text-right",
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'NOT_TAX_UNITPRICE',
                        displayName: transervice.tran('税前单价'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{grid.appScope.changeNotTaxPRICE(row.entity)|number:2}}</div>',

                    }, {
                        field: 'UNIT_PRICE',
                        displayName: transervice.tran('含税单价'),
                        enableCellEdit: true,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNIT_PRICE|number:2}}</div>',
                        editableCellTemplate: '<div><form><input type="text" numeric decimals="2" min="0" max="9999999999" ui-grid-editor ng-model="row.entity.UNIT_PRICE"></form></div>',
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'NOT_TAX_AMOUNT',
                        displayName: transervice.tran('税前金额'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" ><span>{{grid.appScope.calNotTaxMoney(row.entity)|number:2}}</span></div>'
                    }, {
                        field: 'PDMONEY',
                        displayName: transervice.tran('税价合计'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" ><span>{{grid.appScope.calMoney(row.entity)|number:2}}</span></div>'
                    },
                    {
                        field: 'PDWAREHOUSE_ID',
                        displayName: transervice.tran('出库仓库'),
                        cellTemplate: '<span>{{grid.appScope.getWarehouseName(row.entity.PDWAREHOUSE_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.warehouseList",
                        cellEditableCondition: function () {
                            return $scope.model.PLAN_STATE != 2;
                        }
                    }

                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false,//是否使用分页按钮
//				onRegisterApi: function(gridApi) {
//					$scope.gridApi = gridApi;
//					$scope.saveRow = function (rowEntity) {
//		                // create a fake promise - normally you'd use the promise returned by $http or $resource
//		                var promise = $q.defer();
//		                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
//		                promise.reject();
//		            };					
//				}

            };
			gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            //翻页触发方法
            $scope.gridOptions.getPage = function (pageNo, pageSize) {

            }

            //初始化组织,仓库
            var p = $q.defer(), _obj = {};
            $scope.orgoptions = {
                types: [4],
                getList: function (data) {
                    $scope.model.org = data;
                    p.resolve();
                }
            }
            //初始化转对象
            function toObject(list, code, n) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i][code] == n) {
                        return list[i];
                    }
                }
            };

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
                //$scope.gridOptions.data = [];
                var dataSearch = {
                    "where": ['and', ["=", "sk_placing.DELETED_STATE", 0]],
                    "joinWith": ["o_organisation", "b_warehouse", "pa_partner", "sk_placing_detail", "u_userinfo_a", "u_userinfoc"],
                    "orderby": "PLAN_STATE asc,PLACING_AT asc,UPDATED_AT desc,CREATED_AT desc",
                    "distinct": true
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/placing", "view?id=" + $scope.idList[offset], "POST", dataSearch).then(function (result) {
                    $scope.copyModel = $.extend(true, {}, $scope.model, result.data);
                    $scope.model = angular.copy($scope.copyModel);
                    $scope.model.PLACING_AT = $filter("date")(new Date(parseInt($scope.model.PLACING_AT) * 1000), "yyyy-MM-dd");
                    init();
                });
            }

            //获取api
            $scope.gridOptions.getGridApi = function (api) {
                $scope.gridApi = api;
            }

            //勾选某一行
            $scope.gridOptions.selectRow = function (row) {

            }

            //编辑后触发
            /*$scope.gridOptions.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {


             }*/

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //金额触发显示
            $scope.calMoney = function (entity) {
                //金额显示变化的控制
                entity.PDMONEY = (parseFloat(entity.UNIT_PRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);
                if (isNaN(entity.PDMONEY)) {
                    return 0;
                }
                //计算总金额
                if ($scope.model) {
                    if ($scope.model.PMONEY_ID) {
                        calcTotal();
                    }
                }

                return entity.PDMONEY;
            }

            //新增明细
            $scope.addDetail = function (index) {
                if (!$scope.model.PRGANISATION_ID) {
                    return Notification.error(transervice.tran('请先选择组织'));
                }

                if (!$scope.model.PMONEY_ID) {
                    $scope.msg = "请选择金额信息-币种";
                    return;
                }

                var newData = {
                    //"SALES_ORDER": "",
                    "PDSKU_CODE": "",
                    "PSKU_ID": "",
                    "PRODUCT_DE": "",
                    "UNIT_ID": "",
                    "PDNUMBER": "",
                    "UNIT_PRICE": "",
                    "TAX_RATE": "",
                    "NOT_TAX_UNITPRICE": "",
                    "NOT_TAX_AMOUNT": "",
                    "PDMONEY": "",
                    "PDWAREHOUSE_ID": $scope.model.PWAREHOUSE_ID,
                    rowEntity: $scope.rowEntity,
                    options: angular.copy($scope.options),
                    "UNIT_NAME_CN": ""
                };

                //newData.options.search.andwhere={PSKU_ID:0};
                //newData.options.search.where.push(["=","g_product_sku.ORGAN_CODE_DEMAND",$scope.model.PRGANISATION_CODE]);

                if (index) {
                    $scope.gridOptions.data.splice(index, 0, newData);
                } else {
                    $scope.gridOptions.data.unshift(newData);
                }
                gridDefaultOptionsService.refresh($scope.gridOptions, "PSKU_CODE");//刷新方法

            };

            //行删除
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                if (rows.length >= $scope.gridOptions.data.length) {
                    return Notification.error(transervice.tran(messageService.error_detail_delAll));
                }

                var myArray = new Array();
                var myArrayNot = new Array();
                angular.forEach(rows, function (obj, objIndex) {
                    if (obj["PLACING_DETAIL_ID"] && obj["PLACING_DETAIL_ID"] > 0) {
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
                    if ($scope.gridOptions.data <= 0) {
                        $scope.model.needPurchase = 0;
                    }
                }
                if (myArray.length > 0) {
                    $confirm({
                        text: transervice.tran(messageService.confirm_del)
                    }).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "inventory/placingdetail", "delete", "POST", deleteRowModel).then(function (datas) {
                            $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                            $scope.gridApi.selection.clearSelectedRows();
                            Notification.success(datas.message);
                            init();
                        });
                    });
                }
            }

            //页面元素显示初始化
            function baseInfoInit() {
                $scope.model.isLink = $scope.model.isLink ? $scope.model.isLink : 1;
                //页面元素显示初始化
                if ($scope.model.PLAN_STATE == 2) {
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    if ($scope.model.SYSTEM_GENERATION == 1) {
                        //系统自动生成的单据不能反审核
                        $scope.showResetAuth = false;
                    } else {
                        $scope.showResetAuth = true;
                    }
                    $scope.showSave = false;
                } else {
                    $scope.currentState = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                }

                $scope.CUSER_NAME = $scope.model.u_userinfoc == null ? "" : $scope.model.u_userinfoc.u_staff_info.STAFF_NAME_CN;
                $scope.CREATED_AT = $filter("date")(new Date(parseInt($scope.model.CREATED_AT) * 1000), "yyyy-MM-dd");
                if (!isNaN($scope.model.PLACING_AT)) {
                    $scope.PLACING_AT = $filter("date")(new Date(parseInt($scope.model.PLACING_AT) * 1000), "yyyy-MM-dd");
                } else {
                    $scope.PLACING_AT = $scope.model.PLACING_AT;
                }
                $scope.customerName = $scope.model.pa_partner.PARTNER_NAME_CN;
                $scope.PPARTNER_ID = $scope.model.PPARTNER_ID;
                $scope.typeList = [{"value": 1, "name": "销售出库"}, {"value": 2, "name": "内部销售出库"}, {
                    "value": 3,
                    "name": "其他出库"
                }];
                $scope.model.ORDER_TYPE = parseInt($scope.model.ORDER_TYPE);
                $scope.PRGANISATION_ID = $scope.model.PRGANISATION_ID;

                //当前登陆者
                $scope.currentuser = configService.getUserInfo();
            };

            //初始化
            function init() {

                if ($scope.model.PLAN_STATE == 2)
                    $scope.isdisable = true;

                $scope.warehouseList = new Array();
                //页面元素显示初始化
                baseInfoInit();


                p.promise.then(function () {
                    $scope.PRGANISATION_ID = $scope.model.PRGANISATION_ID;
                    _obj = toObject($scope.model.org, 'ORGANISATION_ID', $scope.PRGANISATION_ID);

                    //初始化仓库
                    _obj.user_warehouse = initWarehouse(_obj.user_warehouse);

                    $scope.warehouseList = $scope.rowEntity.warehouseList = _obj.user_warehouse;
                    $scope.model.MONEY_ID_TEMP = $scope.model.PMONEY_ID;
                    getskuDetail();
                });

            }

            function initWarehouse(rows) {
                var warehouseList = new Array();
                angular.forEach(rows, function (obj, index) {
                    if (obj.ORGANISATION_ID == $scope.model.PRGANISATION_ID && $scope.model.ORDER_STATE == 2 && $scope.model.SYSTEM_GENERATION == 1) {
                        warehouseList.push(obj);
                    } else { //只显示中转仓
                        if (obj.ORGANISATION_ID == $scope.model.PRGANISATION_ID && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
                            warehouseList.push(obj);
                        }
                    }
                });
                return warehouseList;
            }

            //初始化明细获取
            function getskuDetail() {

//              $scope.gridOptions.totalItems = $scope.model.sk_placing_detail.length;
//
//              angular.forEach($scope.gridOptions.data, function (object, index) {
//                  object.UNIT_NAME_CN = object.b_unit.UNIT_NAME_CN;
//                  object.PSKU_NAME_CN = object.g_product_sku.PSKU_NAME_CN;
//                  object.MONEY_CODE = $scope.model.PMONEY_CODE;
//                  object.options = {
//                      autoBind: true,
//                      dataTextField: "PSKU_CODE",
//                      dataValueField: "PSKU_CODE",
//                      optionLabel: "请输入SKU",
//                      url: httpService.webApi.api + "/master/product/prodsku/index",
//                      search: {
//                          where: ["and", ["=", "g_product_sku.PSKU_STATE", 1]]
//                          , joinWith: ["b_unit", "g_product_sku_price"], andwhere: {PSKU_ID: 0}
//                      }
//
//                  };
//              });

                //          $scope.gridOptions.data = $scope.model.sk_placing_detail;

                var dataSearch = {
                    "where": ["=", "PLACING_ID", $scope.model.PLACING_ID],
                    "joinWith": ["b_unit", "g_product_sku"]
                }
                httpService.httpHelper(httpService.webApi.api, "/inventory/placingdetail", "index", "POST", dataSearch).then(function (result) {
                    result._meta.totalCount * 1 && ($scope.gridOptions.totalItems = result._meta.totalCount);
                    $scope.gridOptions.data = result.data;
                    if ($scope.gridOptions.data.length > 0) {
                        $scope.PMONEY = 0;
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            if (object.RED_PLACING_CD) {
                                $scope.isChoosePlacing = 1;
                            } else {
                                $scope.isSelectSku = 1;
                            }

                            object.UNIT_NAME = object.b_unit.UNIT_NAME_CN;
                            object.PSKU_NAME_CN = object.g_product_sku.PSKU_NAME_CN;
                            object.PMONEY_ID = $scope.model.PMONEY_ID;
                            object.rowEntity = $scope.rowEntity;
                            object.options = {
                                autoBind: true,
                                dataTextField: "PSKU_CODE",
                                dataValueField: "PSKU_CODE",
                                optionLabel: "请输入SKU",
                                url: httpService.webApi.api + "/master/product/prodsku/index",
                                search: {
                                    where: ["and", ["=", "g_product_sku.PSKU_STATE", 1]]
                                    , joinWith: ["b_unit", "g_product_sku_price"], andwhere: {PSKU_ID: 0}
                                }

                            };

                            if (object.RED_STORAGE_DETAIL_ID) {
                                $scope.model.needPurchase = 2;
                            }

                            object.PDMONEY = (parseFloat(object.UNIT_PRICE) * parseFloat(object.PDNUMBER)).toFixed(2);
                            $scope.PMONEY = parseFloat($scope.PMONEY) + parseFloat(object.PDMONEY);

                        });
                    } else {
                        $scope.model.needPurchase = 0;
                    }
                });
            }

            //金额信息初始化
            function pmoneyInit() {
                if ($scope.MONEY_LIST.length > 0) {
                    $scope.moneyCodeList = $scope.MONEY_LIST;
                } else {
                    var conWhere = {"where": ["=", "MONEY_STATE", 1]};
                    //初始化币种列表
                    httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", conWhere).then(
                        function (result) {
                            $scope.moneyCodeList = result.data;
                        }
                    );
                }

                if ($scope.EXCHANGER_LIST.length > 0) {
                    $scope.exchangerRateList = $scope.EXCHANGER_LIST;
                } else {
                    //获取汇率信息
                    var conRate = {"where": ["=", "EXCHANGE_RATE_STATE", 1]};
                    httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "index", "POST", conRate).then(
                        function (result) {
                            $scope.exchangerRateList = result.data;
                        }
                    );
                }
            }

            //基本信息和金额信息初始化
            init();
            pmoneyInit();


            //初始化组织列表
            function initOrg() {

                $scope.orgoptions = {
                    types: [4],
                    change: function (PRGANISATION_ID, entity) {
                        //组织列表选择change事件
                        if (PRGANISATION_ID) {
                            if ($scope.model.PRGANISATION_ID && $scope.gridOptions.data.length > 0 && $scope.gridOptions.data[0]['PDSKU_CODE'] != "") {
                                $confirm({text: transervice.tran('修改组织会把明细清空，是否继续？')}).then(function () {
                                    //清空明细
                                    $scope.gridOptions.data = [];
                                    $scope.customerName = "";
                                    $scope.addDetail();

                                    $scope.model.PRGANISATION_ID = PRGANISATION_ID;
                                    $scope.warehouseList = new Array();
                                    angular.forEach($scope.warehouseTotalList, function (obj, index) {
                                        if (obj.ORGANISATION_ID == PRGANISATION_ID && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
                                            $scope.warehouseList.push(obj);
                                        }
                                    });
                                });
                            } else {
                                $scope.model.PRGANISATION_ID = PRGANISATION_ID;
                                $scope.warehouseList = new Array();
                                $scope.customerName = "";
                                angular.forEach($scope.warehouseTotalList, function (obj, index) {
                                    if (obj.ORGANISATION_ID == PRGANISATION_ID && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
                                        $scope.warehouseList.push(obj);
                                    }
                                });
                            }

                            var orgWhere = {"where": ['=', 'ORGANISATION_ID', PRGANISATION_ID]};

                            //获取组织信息
                            httpService.httpHelper(httpService.webApi.api, "organization/organisation", "view", "POST", orgWhere).then(
                                function (result) {
                                    $scope.TARIFF = result.data.TARIFF;
                                }
                            )
                        }
                        $scope.rowEntity.warehouseList = $scope.warehouseList;

                    }
                }
            }


            //币种切换事件
            $scope.changePmoneyCode = function (pmoneyId) {
                if (pmoneyId) {
                    calTotalMoney(pmoneyId, $scope.PLACING_AT);
                }
            }
            //SKU行选择
            $scope.selectRowChange = function (row) {  //选择

                row.entity.PDSKU_CODE = row.selectModel.PSKU_CODE;

                row.entity.isSKUEdit = true;
                row.entity.UNIT_PRICE = 0.00;
                row.entity.UNIT_NAME = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit.UNIT_ID;

                row.entity.TAX_RATE = $scope.TARIFF;
                row.entity.PSKU_NAME_CN = row.selectModel.PSKU_NAME_CN;
                row.entity.PRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.PSKU_ID = row.selectModel.PSKU_ID;
                row.entity.PDNUMBER = 0;
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE * row.entity.PDNUMBER).toFixed(2);
                row.entity.isSKUSelect = true;
                $scope.isSelectSku = 1;

                $scope.gridOptions.gridApi.grid.refresh();
                //计算总金额
                if ($scope.model) {
                    if ($scope.model.PMONEY_ID) {
                        calTotalMoney($scope.model.PMONEY_ID, $scope.PLACING_AT);
                    }
                }
                $scope.gridOptions.gridApi.grid.refresh();
            };

            //税前金额触发显示
            $scope.calNotTaxMoney = function (entity) {
                //金额显示变化的控制
                entity.NOT_TAX_AMOUNT = (parseFloat(entity.NOT_TAX_UNITPRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);
                if (isNaN(entity.NOT_TAX_AMOUNT)) {
                    return 0;
                }
                return entity.NOT_TAX_AMOUNT;
            };

            //计算税前单价
            $scope.changeNotTaxPRICE = function (entity) {
                entity.NOT_TAX_UNITPRICE = (parseFloat(entity.UNIT_PRICE) / (1 + parseFloat(entity.TAX_RATE))).toFixed(2);
                if (isNaN(entity.NOT_TAX_UNITPRICE)) {
                    return 0;
                }
                return entity.NOT_TAX_UNITPRICE;
            };

            //计算总金额
            function calTotalMoney(pmoneyId, moneyTime) {
                var timeTemp = angular.copy(moneyTime);
                timeTemp = new Date(timeTemp.replace(/-/g, '/')).getTime();
                timeTemp = Math.round((timeTemp).valueOf() / 1000);
                //单价 金额改变
                var exchangeTemp = [];

                angular.forEach($scope.gridOptions.data, function (row, i) {
                    var temp = [];
                    temp.push(row.PMONEY_ID);
                    temp.push(pmoneyId);
                    temp.push(timeTemp);
                    exchangeTemp.push(temp);
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

            //校验汇率是否可用
            function checkExchangeRate(data) {
                var flag = true;
                angular.forEach(data, function (row, i) {
                    if (row['3'] == null) {
                        flag = false;
                    }
                });
                return flag;
            }

            function changeExchangeRate(data) {
                angular.forEach(data, function (row, i) {
                    $scope.gridOptions.data[i].PMONEY_ID = row['1']
                    $scope.gridOptions.data[i].NOT_TAX_UNITPRICE = $scope.gridOptions.data[i].NOT_TAX_UNITPRICE * row['3'];
                    $scope.gridOptions.data[i].UNIT_PRICE = $scope.gridOptions.data[i].UNIT_PRICE * row['3'];
                    $scope.gridOptions.data[i].PDMONEY = (parseFloat($scope.gridOptions.data[i].UNIT_PRICE) * parseFloat($scope.gridOptions.data[i].STORAGE_DNUMBER)).toFixed(2);               //含税总价
                    $scope.gridOptions.data[i].NOT_TAX_AMOUNT = (parseFloat($scope.gridOptions.data[i].NOT_TAX_UNITPRICE) * parseFloat($scope.gridOptions.data[i].STORAGE_DNUMBER)).toFixed(2);     //不含税总价
                });
                calcTotal();
            }

            function calcTotal() {
                $scope.model.PMONEY = 0;
                $scope.PMONEY = 0;
                if ($scope.model.PMONEY_ID) {
                    angular.forEach($scope.gridOptions.data, function (obj, index) {
                        if (obj.PDMONEY == 'NaN') {
                            obj.PDMONEY = 0;
                        }
                        $scope.PMONEY += Number(obj.PDMONEY);
                    });
                }
                $scope.model.PMONEY = $scope.PMONEY.toFixed(2);
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
                            $scope.customerName = data.PARTNER_NAME_CN;
                            $scope.PPARTNER_ID = data.PARTNER_ID;
                        });
                    } else {
                        $scope.customerName = data.PARTNER_NAME_CN;
                        $scope.PPARTNER_ID = data.PARTNER_ID;
                    }
                });
            }


            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };


            //获取出库仓库名称
            $scope.getWarehouseName = function (warehouseId) {
                if (warehouseId) {
                    var warehouse = $scope.warehouseList.filter(c => c.WAREHOUSE_ID == warehouseId);
                    if (warehouse.length) {
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            }

            //保存操作
            $scope.save = function () {
                //校验信息
                checkInfo();
                checkDetailInfo();
                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                //组装数据
                getInfo();

                //保存更新数据
                saveinfo();
            };

            //校验信息
            function checkInfo() {
                $scope.msg = "";
                if (!$scope.model) {
                    $scope.msg = "请选择组织";
                    return;
                }
                if (!$scope.model.PRGANISATION_ID) {
                    $scope.msg = "请选择组织";
                    return;
                } else if (!$scope.model.ORDER_TYPE) {
                    $scope.msg = "请选择单据类型";
                    return;
                } else if (!$scope.model.PPARTNER_ID) {
                    $scope.msg = "请选择供应商";
                    return;
                } else if (!$scope.model.PWAREHOUSE_ID) {
                    $scope.msg = "请选择出库仓库";
                    return;
                } else if (!$scope.model.PMONEY_ID) {
                    $scope.msg = "请选择金额信息-币种";
                    return;
                }
                else if ($scope.gridOptions.data.length <= 0) {
                    $scope.msg = "请添加出库明细";
                    return;
                }

            }

            //校验明细信息
            function checkDetailInfo() {
                if ($scope.msg.length > 0) {
                    return;
                }
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    if (!row.PDSKU_CODE) {
                        $scope.msg = "请选择SKU";
                        return;
                    } else if (!row.PDWAREHOUSE_ID) {
                        $scope.msg = "请选择出库明细的出库仓库";
                        return;
                    } else if (!row.PDNUMBER) {
                        $scope.msg = "请填写SKU的数量";
                        return;
                    }
                });


            }

            //组装数据
            function getInfo() {
                //组装数据
                var formatDate = new Date($scope.PLACING_AT.replace(/-/g, '/')).getTime();
                $scope.model.PLACING_AT = Math.round(formatDate / 1000);
                $scope.PRGANISATION_ID = $scope.PRGANISATION_ID;

                //明细
                $scope.model.sk_placing_detail = $scope.gridOptions.data;
                //清除不需要更新的信息
                delete $scope.model.b_warehouse;
                delete $scope.model.o_organisation;
                delete $scope.model.pa_partner;
                delete $scope.model.u_userinfo_a;
                delete $scope.model.u_userinfoc;

            }

            //保存更新数据
            function saveinfo() {

                var action = "update?id=" + $scope.model.PLACING_ID;

                var data = $scope.model;

                delete data.org;
                angular.forEach(data.sk_placing_detail,function(obj,index){
                    delete obj.b_unit;
                    delete obj.g_product_sku;
                    delete obj.options;
                    delete obj.rowEntity;
                });

                httpService.httpHelper(httpService.webApi.api, "inventory/placing", action, "POST", data).then(
                    function (result) {
//                      setTimeout(function () {
//                          $modalInstance.close($scope.model);//返回数据
//                      }, 50);
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        Notification.success(transervice.tran('保存成功'));
                    }
                );
            }


            //审核
            $scope.authSkplace = function () {

                checkAuth(2, 1);
            }

            //反审核
            $scope.resetAuthSkplace = function () {
                //校验确认审核
                checkAuth(1, 2);
            }

            //查询销售订单
            $scope.searchSaleOrder = function (entity) {
                if ($scope.model.PLAN_STATE == 2) {
                    return;
                }
                if (!$scope.needSaleOrder) {
                    return;
                }
                if (!$scope.PRGANISATION_ID) {
                    return Notification.error(transervice.tran("请先选择组织"));
                }
                if (!$scope.customerName) {
                    return Notification.error(transervice.tran("请先选择客户"));
                }
                SaleorderChooseService.showDialog().then(function (data) {
                    entity.SALES_ORDER = data.cr_sales_order.SALES_ORDER_CD;
                    entity.PLACING_CD = '';
                    entity.PDSKU_CODE = data.PSKU_CODE;
                    entity.PSKU_ID = data.g_product_sku.PSKU_ID;
                    entity.PSKU_NAME_CN = data.g_product_sku.PSKU_NAME_CN;
                    entity.UNIT_ID = data.UNIT_ID;
                    entity.UNIT_NAME = data.b_unit.UNIT_NAME_CN;
                    entity.TAX_RATE = data.TAX_RATE;
                    entity.PDNUMBER = data.PURCHASE;
                    entity.MONEY_ID = data.cr_sales_order.MONEY_ID;
                    entity.UNIT_PRICE = data.TAX_UNITPRICE == null ? 0 : data.TAX_UNITPRICE;
                    entity.NOT_TAX_AMOUNT = data.NOT_TAX_AMOUNT == null ? 0 : data.NOT_TAX_AMOUNT;
                    entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE == null ? 0 : data.NOT_TAX_UNITPRICE;

                    entity.PDMONEY = data.TOTAL_TAX_AMOUNT;
                    console.log(entity);
                    $scope.gridOptions.gridApi.grid.refresh();

                    //计算总金额
                    if ($scope.model) {
                        if ($scope.model.MONEY_ID) {
                            calTotalMoney($scope.model.MONEY_ID, $scope.PLACING_AT);
                        }
                    }
                });
            }

            //查询出库订单
//          $scope.searchPlacingOrder = function (entity) {
//              if (!entity.PLACING_CD && entity.PDSKU_CODE) {
//                  return;
//              }
//
//              if ($scope.model.PLAN_STATE == 2) {
//                  return;
//              }
//              if (!$scope.needSaleOrder) {
//                  return;
//              }
//              if (!$scope.PRGANISATION_CODE) {
//                  return Notification.error(transervice.tran("请先选择组织"));
//              }
//              if (!$scope.customerName) {
//                  return Notification.error(transervice.tran("请先选择客户"));
//              }
//              historyPlacingChooseService.showDialog($scope).then(function (data) {
//                  var is_repeat = false;
//                  angular.forEach($scope.gridOptions.data, function (value, i) {
//                      if (value.RED_PLACING_DETAIL_ID == data.PLACING_DETAIL_ID) {
//                          is_repeat = true;
//                      }
//                  });
//                  if (is_repeat) {
//                      return Notification.error(transervice.tran("请勿选择重复的出库订单"));
//                  }
//
//                  entity.SALES_ORDER = data.SALES_ORDER;
//                  entity.RED_PLACING_CD = data.PLACING_CD;
//                  entity.RED_PLACING_DETAIL_ID = data.PLACING_DETAIL_ID;
//                  entity.PDSKU_CODE = data.PDSKU_CODE;
//                  entity.PSKU_ID = data.g_product_sku.PSKU_ID;
//                  entity.PRODUCT_DE = data.PRODUCT_DE;
//                  entity.UNIT_CODE = data.UNIT_CODE;
//                  entity.UNIT_NAME = data.b_unit.UNIT_NAME_CN;
//                  entity.TAX_RATE = data.TAX_RATE;
//                  entity.PDNUMBER = (-1) * data.psd_num;
//                  entity.MONEY_CODE = data.sk_placing.PMONEY_CODE;
//                  entity.PMONEY_ID = data.sk_placing.PMONEY_ID;
//                  entity.UNIT_PRICE = data.UNIT_PRICE == null ? 0 : data.UNIT_PRICE;
//                  entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE==null?0:data.NOT_TAX_UNITPRICE;
//                  entity.NOT_TAX_AMOUNT = data.NOT_TAX_AMOUNT==null?0:data.NOT_TAX_AMOUNT;
//
//                  entity.PDMONEY = data.PDMONEY;
//                  $scope.gridOptions.gridApi.grid.refresh();
//
//                  $scope.isChoosePlacing = 1;
//
//                  //计算总金额
//                  if ($scope.model) {
//                      if ($scope.model.MONEY_CODE) {
//                          calTotalMoney($scope.model.MONEY_CODE, $scope.PLACING_AT);
//                      }
//                  }
//              });
//          }

            function searchPlacingData() {
                $scope.model.EXISTS_DETAILID = [];
                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    if (obj.RED_PLACING_DETAIL_ID) {
                        $scope.model.EXISTS_DETAILID.push(obj.RED_PLACING_DETAIL_ID);
                    }
                });
            }


            $scope.searchPlacingOrder = function (entity) {
                if (!entity.RED_PLACING_DETAIL_ID && entity.PSKU_ID) {
                    return;
                }
                if ($scope.isSelectSku == 2) {
                    return;
                }

                if (!$scope.needSaleOrder) {
                    return;
                }
                if (!$scope.model.PRGANISATION_ID) {
                    return Notification.error(transervice.tran("请先选择组织"));
                }
                if (!$scope.customerName) {
                    return Notification.error(transervice.tran("请先选择客户"));
                }
                searchPlacingData();
                historyPlacingChooseService.showDialog($scope).then(function (data) {
                    formatSelectData(entity, data, 2);


                });
            }

            function formatSelectData(entity, dataArray, flag) {
                var data = dataArray['0'];
                var index = $.inArray(entity, $scope.gridOptions.data);
                entity.isEdit = 2;
                entity.SALES_ORDER = data.SALES_ORDER;
                entity.RED_PLACING_CD = data.PLACING_CD;
                entity.RED_PLACING_DETAIL_ID = data.PLACING_DETAIL_ID;
                entity.PDSKU_CODE = data.PDSKU_CODE;
                entity.PSKU_ID = data.g_product_sku.PSKU_ID;
                entity.PRODUCT_DE = data.PRODUCT_DE;
                entity.UNIT_ID = data.UNIT_ID;
                entity.UNIT_NAME = data.b_unit.UNIT_NAME_CN;
                entity.TAX_RATE = data.TAX_RATE;
                entity.PDNUMBER = (-1) * data.psd_num;
                entity.MONEY_ID = data.sk_placing.PMONEY_ID;
                entity.PMONEY_ID = data.sk_placing.PMONEY_ID;
                entity.UNIT_PRICE = data.UNIT_PRICE == null ? 0 : data.UNIT_PRICE;
                entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE == null ? 0 : data.NOT_TAX_UNITPRICE;
                entity.NOT_TAX_AMOUNT = data.NOT_TAX_AMOUNT == null ? 0 : data.NOT_TAX_AMOUNT;

                entity.PDMONEY = data.PDMONEY;
                $scope.gridOptions.gridApi.grid.refresh();
                $scope.isChoosePlacing = 1;

                $scope.gridOptions.gridApi.grid.refresh();
                dataArray.splice(0, 1);
                if (dataArray.length > 0) {
                    $scope.addDetail(++index);
                    formatSelectData($scope.gridOptions.data[index], dataArray, flag);
                }
                //计算总金额
                if ($scope.model) {
                    if ($scope.model.PMONEY_ID) {
                        calTotalMoney($scope.model.PMONEY_ID, $scope.PLACING_AT);
                    }
                }
            }


            //校验确认审核
            function checkAuth(planState, authFlag) {
                //校验信息
                checkInfo();
                checkDetailInfo();
                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                //组装数据
                getInfo();

                //校验会计期间和SKU库存
                var arr = new Object();

                var sku_arr = new Object();

                angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                    var sku = new Object();
                    sku['PSKU_ID'] = obj1.PSKU_ID;
                    sku['PSKU_CODE'] = obj1.PDSKU_CODE;
                    sku['NUMBER'] = (-1) * obj1.PDNUMBER;
                    sku['WAREHOUSE_ID'] = obj1.PDWAREHOUSE_ID;
                    sku_arr[objIndex1] = sku;
                });

                httpService.httpHelper(httpService.webApi.api, "inventory/placing", "checkskuinventory", "POST", sku_arr).then(function (datas) {

                    if (datas.data.flag == false) {

                        $confirm({text: transervice.tran('选择的' + datas.data.sku + '库存不足，是否继续操作？')}).then(function () {
                            //更新单据状态
                            updateSkState(planState, authFlag);
                        });
                    } else {
                        //更新单据状态
                        updateSkState(planState, authFlag);
                    }


                });
            }

            //更新出库单状态
            function updateSkState(planState, authFlag) {

                $scope.model.PLAN_STATE = planState;
                $scope.model.authFlag = authFlag;
                $scope.model.AUTITO_ID = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_ID;
                $scope.model.AUTITO_AT = Math.round(new Date().getTime() / 1000);
                if (planState == 2) {
                    return $confirm({
                        text: transervice.tran(messageService.confirm_audit)
                    }).then(function () {
                        updateData(authFlag);
                    });
                } else {
                    updateData(authFlag);
                }

            }
            function updateData(authFlag) {
                httpService.httpHelper(httpService.webApi.api, "inventory/placing", "updateplacing", "POST", $scope.model).then(function (datas) {

                    Notification.success(transervice.tran('操作成功'));
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    afterAuth(authFlag);

                })                
            }
            //审核和反审核后的处理
            function afterAuth(authFlag) {
                if (authFlag == 1) {
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    $scope.showSave = false;
                    $scope.isdisable = true;
                    if ($scope.model.SYSTEM_GENERATION != 1) {
                        $scope.showResetAuth = true;
                    }

                } else {
                    $scope.currentState = "未审核";
                    $scope.showAuth = true;
                    $scope.isdisable = false;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                }
            }
        });
    })
