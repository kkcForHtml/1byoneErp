/**
 * Created by Administrator on 2017/5/19.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/common/Services/commonService',
        'app/common/Services/configService',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'create_po_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "createPOCtrl",
                            backdrop: "static",
                            //size: "llg",//lg,sm,md,llg,ssm
                            size: "1600px",
                            templateUrl: 'app/purchasingCenter/purchasingPlan/views/createPurchasingOrder.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("createPOCtrl", function ($scope, $filter, amHttp, model, $timeout, messageService, $modalInstance, configService, gridDefaultOptionsService, Notification, transervice, httpService, commonService, $q, $interval) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PARTNER_ID',
                        displayName: transervice.tran('*供应商'),
                        width: 150,
                        cellClass: 'canedit_def',
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PARTNER_ID.list"
                    },
                    {field: 'PSKU_CODE',cellClass: 'unedit', enableCellEdit: false, displayName: transervice.tran('SKU'), width: 100},
                    {
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('产品名称'),
                        width: 150
                    },
                    {
                        field: 'DORGANISATION_ID',
                        enableCellEdit: false,
                        displayName: transervice.tran('需求组织'),
                        width: 120,
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getOrgName(row.entity.dorgList,row.entity.DORGANISATION_ID)}}</div>',
                    },
                    {
                        field: 'ORGANISATION_ID',
                        displayName: transervice.tran('*采购组织'),
                        width: 120,
                        cellClass: 'canedit_def',
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ORGANISATION_ID.list"
                    },
                    {
                        field: 'CHANNEL_ID',
                        enableCellEdit: false,
                        displayName: transervice.tran('平台'),
                        width: 100,
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getChannelName(row.entity.channelList,row.entity.CHANNEL_ID)}}</div>',
                    },
                    {
                        field: 'UNIT_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('计量单位'),
                        width: 100
                    },
                    {
                        field: 'PURCHASE',
                        //cellClass: "text-right",
                        cellClass: "canedit_num_def",
                        editableCellTemplate: '<div ><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.PURCHASE"></form></div>',
                        displayName: transervice.tran('*数量'), width: 100
                    },
                    {
                        field: 'PACKING_NUMBER',
                        enableCellEdit: false,
                        cellClass: "text-right",
                        displayName: transervice.tran('每箱数量'),
                        width: 100
                    },
                    {
                        field: 'FCL_NUMBER',
                        width: 100,
                        enableCellEdit: false,
                        cellClass:'text-right',
                        displayName: transervice.tran('箱数'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.FCL_NUMBER|number:2}}</div>',
                        /*cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if ((Number(grid.getCellValue(row, col)) | 0 ) != Number(grid.getCellValue(row, col))) {
                                return 'red';
                            } else {
                                return 'text-right';
                            }
                        }*/
                    },
                    {
                        field: 'CABINET_NUMBER',
                        enableCellEdit: false,
                        displayName: transervice.tran('整柜数量'),
                        width: 100,
                        cellClass:'text-right',
                        /*cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if (!(Math.floor(grid.getCellValue(row, col)) == grid.getCellValue(row, col)) || grid.getCellValue(row, col) == 0) {
                                return 'red'
                            } else {
                                return 'text-right'
                            }
                        }*/
                    },
                    {
                        field: 'MONEY_ID',
                        cellClass: "canedit_def",
                        displayName: transervice.tran('*币种'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.MONEY_ID.list",
                        width: 100
                    }, {
                        field: 'TAX_UNITPRICE',
                        displayName: transervice.tran('采购单价'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_UNITPRICE|number:2}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAX_UNITPRICE"></form></div>',
                        width: 120,
                        cellClass: "canedit_num_def"
                    },

                    {
                        field: 'TAX_AMOUNT',
                        displayName: transervice.tran('金额'),
                        //cellClass: 'red',
                        enableCellEdit: false,
                        width: 120,
                        //cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.amountSum(row.entity)|number:2}}</div>',
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TAX_AMOUNT|number:2}}</div>'
                    },
                    {
                        field: 'TAX_RATE', displayName: transervice.tran('税率'), width: 100,
                        cellClass: "canedit_num_def",
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAX_RATE"></form></div>',
                    },
                    {
                        field: 'NOT_TAX_UNITPRICE',
                        enableCellEdit: false,
                        displayName: transervice.tran('不含税单价'),
                        width: 120,
                        //cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.noTaxPrice(row.entity)|number:2}}</div>'
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.NOT_TAX_UNITPRICE|number:2}}</div>'
                    },
                    {
                        field: 'NOT_TAX_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('不含税金额'),
                        width: 120,
                        //cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.noTaxAmount(row.entity)|number:2}}</div>'
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.NOT_TAX_UNITPRICE*row.entity.PURCHASE|number:2}}</div>'
                    },
                    {
                        field: 'SMETHOD',
                        cellClass: 'canedit_def',
                        displayName: transervice.tran('*结算方式'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.SMETHOD.list",
                        width: 120
                    },
                    {
                        field: 'DELIVERY_METHOD',
                        cellClass: 'canedit_def',
                        displayName: transervice.tran('提货方式'),
                        width: 120
                    },
                    {
                        field: 'COMMI_PERIOD',
                        cellClass: 'canedit_def',
                        displayName: transervice.tran('*承诺交期'),
                        width: 160,
                        /*type: 'date',
                         cellFilter: "date:'yyyy-MM-dd'",*/
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div style="display: inherit" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.COMMI_PERIOD"></div>'
                    },
                    {field: 'FNSKU', enableCellEdit: false, width: 120, displayName: transervice.tran('产品条码')},
                    {field: 'PLATFORM_SKU', enableCellEdit: false, width: 120, displayName: transervice.tran('平台SKU')},
                    {
                        field: 'ACCOUNT_ID', enableCellEdit: false, width: 150,
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getAccountName(row.entity.accountList,row.entity.ACCOUNT_ID)}}</div>',
                        displayName: transervice.tran('平台账号')
                    },
                    {
                        field: 'DEMAND_AT',
                        enableCellEdit: false,
                        width: 120,
                        displayName: transervice.tran('需求日期'),
                        /*type: 'date',
                         cellFilter: "date:'yyyy-MM-dd'",*/
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.DEMAND_AT"></div>'
                    },
                    {field: 'DETAIL_REMARKS', cellClass: 'canedit_def',width: 120, displayName: transervice.tran('备注')},
                    {
                        field: 'FCL_LONG', cellClass: "canedit_num_def", width: 90, displayName: transervice.tran('整箱-长'),
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_LONG"></form></div>'
                    },
                    {
                        field: 'FCL_WIDE',
                        cellClass: "canedit_num_def",
                        width: 90,
                        displayType: 'numeric',
                        displayName: transervice.tran('整箱-宽'),
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_WIDE"></form></div>',
                    },
                    {
                        field: 'FCL_HIGH',
                        cellClass: "canedit_num_def",
                        width: 90,
                        displayType: 'numeric',
                        displayName: transervice.tran('整箱-高'),
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_HIGH"></form></div>',
                    },
                    {
                        field: 'GROSS_WEIGHT',
                        width: 90,
                        cellClass: "canedit_num_def",
                        displayType: 'numeric',
                        displayName: transervice.tran('整箱-毛重'),
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.GROSS_WEIGHT"></form></div>',

                    },
                    {
                        field: 'FCL_NET_WEIGHT',
                        width: 90,
                        cellClass: "canedit_num_def",
                        displayType: 'numeric',
                        displayName: transervice.tran('整箱-净重'),
                        editableCellTemplate: '<div><form><input formatting="false" numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_NET_WEIGHT"></form></div>',

                    },
                    {
                        field: 'PLAN_TYPE', width: 100,
                        cellClass: "canedit_def",
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getplanTypeName(row.entity.PLAN_TYPE)}}</div>',
                        displayName: transervice.tran('采购类型'),
                        enableCellEdit: false
                    }
                ],
                useExternalPagination: false,//是否使用分页按钮
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                enableVerticalScrollbar: 1,

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridOptions.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function (row, colDef, newValue, oldValue) {
                        var CREATED_AT = row.CREATED_AT && $scope.formatDate(new Date(row.CREATED_AT.replace(/-/g, "/")));
                        //编辑供应商
                        if (colDef.field == "PARTNER_ID") {
                            var PARTNER_ID = row.PARTNER_ID;
                            var PURCHASE = Number(row.PURCHASE);
                            if (row.poPriceList.length > 0) {
                                row.poPriceList.forEach(d=> {
                                    if (PARTNER_ID == d.PARTNER_ID && PURCHASE >= d.PRODUCT_SKU_MOQ) {
                                        var oldMoneyCode = row.MONEY_ID;
                                        row.MONEY_ID = d.MONEY_ID;
                                        exchangeRate(oldMoneyCode,row.MONEY_ID,CREATED_AT).then(function(){
                                            if($scope.moneyRate[0][0]==null ||$scope.moneyRate[0][3]==null){
                                                $scope.moneyRate[0][3] = 1;
                                            }
                                            //采购单价
                                            row.TAX_UNITPRICE = Number(d.UNIT_PRICE*$scope.moneyRate[0][3]);
                                            //总金额
                                            row.TAX_AMOUNT = Number(row.TAX_UNITPRICE * PURCHASE);
                                            var taxRate = Number(Number(row.TAX_RATE.substr(0, row.TAX_RATE.length - 1) / 100));
                                            //不含税单价
                                            row.NOT_TAX_UNITPRICE = $scope.noTaxPrice(row);
                                            //row.NOT_TAX_UNITPRICE = row.TAX_UNITPRICE ? (row.TAX_UNITPRICE / (1 + (taxRate ? taxRate : 0))) : 0;
                                            //不含税金额
                                            row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);
                                            //row.NOT_TAX_AMOUNT = Number(row.NOT_TAX_UNITPRICE) * PURCHASE;
                                        });
                                    }
                                });
                            }else{
                                var aa = row.rowEntity.fieldDataObjectMap.PARTNER_ID.list.filter(d=> {
                                    return d.value == PARTNER_ID
                                });
                                if (aa.length > 0) {
                                    row.MONEY_ID = aa[0].MONEY_ID;
                                }
                            }
                            //结算方式
                            var data = row.smethodList.filter(d=> {
                                return PARTNER_ID == d.PARTNER_ID
                            });
                            if (data.length > 0) {
                                row.SMETHOD = data[0].value;
                            }
                        }
                        //编辑采购组织
                        if(colDef.field == "ORGANISATION_ID"){
                            var poTax = $scope.poTaxList.length > 0 ? $scope.poTaxList.filter(c=>c.ORGANISATION_ID == row.ORGANISATION_ID) : "";
                            var taxRate = toDecimal(Number(poTax.length ? poTax[0].TARIFF : 0));
                            row.TAX_RATE = Number(poTax.length ? poTax[0].TARIFF : 0) * 100 + "%";
                            var TAX_UNITPRICE = Number(row.TAX_UNITPRICE);
                            //不含税单价
                            row.NOT_TAX_UNITPRICE = $scope.noTaxPrice(row);
                            //不含税金额
                            row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);
                        }
                        //编辑数量
                        if (colDef.field == "PURCHASE") {
                            var PURCHASE = Number(row.PURCHASE);
                            if (row.poPriceList.length > 0) {
                                row.poPriceList.forEach(d=> {
                                    if (row.PARTNER_ID == d.PARTNER_ID && row.PURCHASE >= d.PRODUCT_SKU_MOQ) {
                                        var oldMoneyCode = row.MONEY_ID;
                                        row.MONEY_ID = d.MONEY_ID;
                                        exchangeRate(oldMoneyCode,row.MONEY_ID,CREATED_AT).then(function(){
                                            if($scope.moneyRate[0][0]==null || $scope.moneyRate[0][3]==null){
                                                $scope.moneyRate[0][3] = 1;
                                            }
                                            //采购单价
                                            row.TAX_UNITPRICE = toDecimal(Number(d.UNIT_PRICE*$scope.moneyRate[0][3]));
                                            row.TAX_AMOUNT = Number(row.TAX_UNITPRICE * row.PURCHASE);
                                            var taxRate = Number(row.TAX_RATE.substr(0, row.TAX_RATE.length - 1) / 100);
                                            //不含税单价
                                            row.NOT_TAX_UNITPRICE = $scope.noTaxPrice(row);
                                            //row.NOT_TAX_UNITPRICE = row.TAX_UNITPRICE ? (row.TAX_UNITPRICE / (1 + (taxRate ? taxRate : 0))) : 0;
                                            //不含税金额
                                            row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);
                                            //row.NOT_TAX_AMOUNT = Number(row.NOT_TAX_UNITPRICE) * row.PURCHASE;
                                        })
                                    }
                                });
                            }
                            row.FCL_NUMBER = (PURCHASE != 0 && row.PACKING_NUMBER != 0) ? PURCHASE / row.PACKING_NUMBER : 0;
                        }
                        //编辑币种
                        if(colDef.field == "MONEY_ID"){
                            var PURCHASE = Number(row.PURCHASE);
                            exchangeRate(oldValue,newValue,CREATED_AT).then(function(){
                                if($scope.moneyRate[0][0]==null){
                                    $scope.moneyRate[0][3] = 1;
                                }
                                if($scope.moneyRate[0][3]==null){
                                    row.MONEY_ID = oldValue;
                                    return Notification.error(transervice.tran('无对应币种兑换汇率'));
                                }
                                //采购单价
                                row.TAX_UNITPRICE = toDecimal($scope.moneyRate?Number(row.TAX_UNITPRICE*$scope.moneyRate[0][3]):Number(row.TAX_UNITPRICE));
                                //总金额
                                row.TAX_AMOUNT = Number(row.TAX_UNITPRICE * PURCHASE);
                                var taxRate = Number(Number(row.TAX_RATE.substr(0, row.TAX_RATE.length - 1) / 100));
                                //不含税单价
                                row.NOT_TAX_UNITPRICE = $scope.noTaxPrice(row);
                                //row.NOT_TAX_UNITPRICE = row.TAX_UNITPRICE ? (row.TAX_UNITPRICE / (1 + (taxRate ? taxRate : 0))) : 0;
                                //不含税金额
                                row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);
                                //row.NOT_TAX_AMOUNT = Number(row.NOT_TAX_UNITPRICE) * PURCHASE;
                            });
                        }
                        //编辑采购单价
                        if (colDef.field == "TAX_UNITPRICE") {
                            var TAX_UNITPRICE = Number(row.TAX_UNITPRICE);
                            //金额
                            row.TAX_AMOUNT = TAX_UNITPRICE * row.PURCHASE;
                            var taxRate = row.TAX_RATE.substr(0, row.TAX_RATE.length - 1) / 100;
                            //不含税单价
                            row.NOT_TAX_UNITPRICE = $scope.noTaxPrice(row);
                            //row.NOT_TAX_UNITPRICE = TAX_UNITPRICE ? (TAX_UNITPRICE ? (TAX_UNITPRICE / (1 + (taxRate ? taxRate : 0))) : 0) : 0;
                            //不含税金额
                            row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);
                            //row.NOT_TAX_AMOUNT = Number(row.NOT_TAX_UNITPRICE) * Number(row.PURCHASE);
                        }
                        //编辑税率
                        if (colDef.field == "TAX_RATE") {
                            var tax = row.TAX_RATE.toString();
                            if(tax){
                                var index = tax.indexOf("%");
                                var taxRate = 0;
                                if (index != -1) {
                                    taxRate = Number(tax.substr(0, tax.length - 1)) / 100;
                                } else {
                                    taxRate = Number(row.TAX_RATE) / 100;
                                    row.TAX_RATE = row.TAX_RATE + "%";
                                }
                                var TAX_UNITPRICE = Number(row.TAX_UNITPRICE);
                                //不含税单价
                                row.NOT_TAX_UNITPRICE = $scope.noTaxPrice(row);
                                //不含税金额
                                row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);
                            }else{
                                row.TAX_RATE = 0;
                                row.TAX_RATE = row.TAX_RATE + "%";
                                //不含税单价
                                row.NOT_TAX_UNITPRICE =$scope.noTaxPrice(row);
                                //不含税金额
                                row.NOT_TAX_AMOUNT = $scope.noTaxAmount(row);

                            }
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

            //查询采购职能树&&用户 -- 所有币种
            function getAllCurrency() {
                //查询采购职能树
                configService.getOrganisationList([2]).then(function (datas) {
                    $scope.poOrgList = [];
                    $scope.poTaxList = [];
                    datas && datas.forEach(d=> {
                        $scope.poOrgList.push({
                            "value": d.ORGANISATION_ID,
                            "name": d.ORGANISATION_NAME_CN
                        });
                        $scope.poTaxList.push({
                            "ORGANISATION_ID": d.ORGANISATION_ID,
                            "TARIFF": d.TARIFF
                        });
                    });
                    var dataSearch = {
                        "where": ["<>", "MONEY_STATE", 0],
                        "limit": 0
                    };
                    httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", dataSearch).then(function (datas) {
                        var currencyList = datas.data;
                        $scope.currencyList = [];
                        currencyList.forEach(d=> {
                            $scope.currencyList.push({
                                "value": d.MONEY_ID,
                                "name": d.MONEY_NAME_CN
                            });
                        });
                        $scope.init();
                    });
                });
            };
            getAllCurrency();
            $scope.smethodList = commonService.getDicList("PARTNER_SMETHOD"); //结算方式
            $scope.poTypeList = commonService.getDicList("PLAN_TYPE"); //采购类型
            if (model) {
                $scope.model = model;
            }
            $scope.init = function () {
                $scope.model.forEach(d=> {
                    d.dorgList = d.rowEntity.fieldDataObjectMap.DORGANISATION_ID ? d.rowEntity.fieldDataObjectMap.DORGANISATION_ID.list : [];
                    d.UNIT_CODE = d.UNIT_CODE;
                    d.UNIT_NAME_CN = d.UNIT_NAME_CN;
                    d.DETAIL_REMARKS = d.PLAN_REMARKS;
                    //供应商
                    var supplierList = [];
                    var smethodList = [];
                    if (d.g_product_sku.g_product_sku_supplier != null) {
                        d.g_product_sku.g_product_sku_supplier.forEach(s=> {
                            supplierList.push({
                                "value": s.PARTNER_ID,
                                "name": s.pa_partner.PARTNER_CODE + '_' + s.pa_partner.PARTNER_ANAME_CN,
                                "MONEY_ID": s.pa_partner.MONEY_ID
                            });
                            var data = $scope.smethodList.filter(d=> {
                                return d.D_VALUE == s.pa_partner.SMETHOD
                            });
                            if (data.length > 0) {
                                smethodList.push({
                                    "PARTNER_ID": s.PARTNER_ID,
                                    "value": data[0].D_VALUE,
                                    "name": data[0].D_NAME_CN
                                });
                            }

                            if (s.DEFAULTS == 1) {
                                d.PARTNER_ID = s.PARTNER_ID;
                                d.SMETHOD = s.pa_partner.SMETHOD;
                                d.MONEY_ID = s.pa_partner.MONEY_ID;
                            }
                        });
                    }
                    d.supplierList = supplierList;
                    d.smethodList = smethodList;
                    //采购价格
                    var poPriceList = [];
                    if (d.g_product_sku.g_product_sku_price != null) {
                        d.g_product_sku.g_product_sku_price.forEach(c=> {
                            poPriceList.push({
                                "PARTNER_ID": c.PARTNER_ID,
                                "UNIT_PRICE": Number(c.UNIT_PRICE),
                                "PRODUCT_SKU_MOQ": Number(c.PRODUCT_SKU_MOQ),
                                "MONEY_ID": c.MONEY_ID
                            });
                        });
                    }
                    d.poPriceList = poPriceList;
                    poPriceList.sort(function (a, b) {
                        return (a.PARTNER_ID == b.PARTNER_ID && a.PRODUCT_SKU_MOQ - b.PRODUCT_SKU_MOQ);
                    });

                    //采购组织 、税率
                    d.ORGANISATION_ID = d.g_product_sku.ORGAN_ID_PURCHASE;
                    var poTax = $scope.poTaxList.length > 0 ? $scope.poTaxList.filter(c=>c.ORGANISATION_ID == d.ORGANISATION_ID) : "";
                    var taxRate = toDecimal(Number(poTax.length ? poTax[0].TARIFF : 0));
                    d.TAX_RATE = Number(poTax.length ? poTax[0].TARIFF : 0) * 100 + "%";
                    //采购单价、金额
                    if (d.PARTNER_ID != null && d.poPriceList.length > 0) {
                        var count = Number(d.PURCHASE);
                        d.poPriceList.forEach(v=> {
                            if (d.PARTNER_ID == v.PARTNER_ID && count >= v.PRODUCT_SKU_MOQ) {
                                d.TAX_UNITPRICE = Number(v.UNIT_PRICE);
                                d.TAX_AMOUNT = Number(d.TAX_UNITPRICE * count);
                                d.MONEY_ID = v.MONEY_ID;
                            }
                        });
                    }
                    d.TAX_UNITPRICE = d.TAX_UNITPRICE ? d.TAX_UNITPRICE : Number(0);
                    d.TAX_AMOUNT = d.TAX_AMOUNT ? d.TAX_AMOUNT : Number(0);
                    //不含税单价
                    d.NOT_TAX_UNITPRICE = toDecimal(d.TAX_UNITPRICE ? (d.TAX_UNITPRICE / (1 + (taxRate ? taxRate : 0))) : 0);
                    //不含税金额
                    d.NOT_TAX_AMOUNT = Number(d.NOT_TAX_UNITPRICE) * Number(d.PURCHASE);
                    d.FCL_LONG = d.PACKING_LONG;
                    d.FCL_WIDE = d.PACKING_WIDE;
                    d.FCL_HIGH = d.PACKING_HIGH;
                    d.FCL_NET_WEIGHT = d.NET_WEIGHT;//净重
                    d.GROSS_WEIGHT = d.GROSS_WEIGHT;//毛重
                    //获取账号
                    d.accountList = d.rowEntity.fieldDataObjectMap.ACCOUNT_ID ? d.rowEntity.fieldDataObjectMap.ACCOUNT_ID.list : [];
                    var rowEntity = {
                        "fieldDataObjectMap": {
                            "PARTNER_ID": {
                                "list": supplierList
                            },
                            "ORGANISATION_ID": {
                                "list": $scope.poOrgList
                            },
                            "MONEY_ID": {
                                "list": $scope.currencyList
                            },
                            "SMETHOD": {
                                "list": $scope.smethodList
                            }
                        }
                    };
                    d.rowEntity = rowEntity;
                });
                $scope.gridOptions.data = angular.copy($scope.model);
                $timeout(function () {
                    if ($scope.gridApi.selection.selectRow) {
                        $scope.gridApi.selection.selectAllRows();
                    }
                });
            };

            //currency:当前币种 currencyTo:目标币种 amount:待转金额
             function exchangeRate(currency,currencyTo,orderTime){
                 $scope.moneyRate = null;
                 var data = [];
                 data[0]=[currency,currencyTo,orderTime];
                return httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", data).then(function (result) {
                    $scope.moneyRate =  result.data;
                });
            };

            //需求组织
            $scope.getOrgName = function (dorgList, value) {
                var org = dorgList.filter(t=>t.value == value);
                if (org.length) {
                    return org[0].name;
                }
                return "";
            }
            //平台
            $scope.getChannelName = function (channelList, value) {
                var channel = channelList.filter(t=>t.CHANNEL_ID == value);
                if (channel.length) {
                    return channel[0].CHANNEL_NAME_CN;
                }
                return "";
            }
            //采购类型名称
            $scope.getplanTypeName = function (value) {
                var planType = $scope.poTypeList.filter(t=>t.D_VALUE == value);
                if (planType.length) {
                    return planType[0].name;
                }
                return "";
            };

            //账号名称
            $scope.getAccountName = function (accountList, value) {
                var planType = accountList.filter(t=>t.value == value);
                if (planType.length) {
                    return planType[0].name;
                }
                return "";
            };

            //确定
            $scope.confirm = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                for (var i = 0; i < rows.length; i++) {
                    var value = rows[i];
                    if (value.PARTNER_ID == null || value.PARTNER_ID.length == 0) {
                        return Notification.error(transervice.tran('请输入供应商'));
                    }
                    if (value.ORGANISATION_ID == null || value.ORGANISATION_ID.length == 0) {
                        return Notification.error(transervice.tran('请输入采购组织'));
                    }
                    if (value.MONEY_ID == null || value.MONEY_ID.length == 0) {
                        return Notification.error(transervice.tran('请输入币种'));
                    }
                    if (value.COMMI_PERIOD == null || value.COMMI_PERIOD.length == 0) {
                        return Notification.error(transervice.tran('请输入承诺交期'));
                    }
                    if (value.SMETHOD == null || value.SMETHOD.length == 0) {
                        return Notification.error(transervice.tran('请输入结算方式'));
                    }
                    if (value.PURCHASE == null || value.PURCHASE.length == 0) {
                        return Notification.error(transervice.tran('请输入数量'));
                    }
                    if (value.PURCHASE>2147483647) {
                        return Notification.error(transervice.tran('数量的值必须不大于2147483647'));
                    }
                    value.EACH_NUMBER = value.PACKING_NUMBER;
                    value.COMMI_PERIOD = $scope.formatDate(new Date(value.COMMI_PERIOD.replace(/-/g, "/")));
                    value.DEMAND_AT = value.DEMAND_AT ? $scope.formatDate(new Date(value.DEMAND_AT.replace(/-/g, "/"))) : null;
                    //value.DEMAND_AT = $scope.formatDate(value.DEMAND_AT);
                    value.TAX_RATE = value.TAX_RATE.substr(0, value.TAX_RATE.length - 1) / 100;
                    value.PSKU_ID = value.g_product_sku ? value.g_product_sku.PSKU_ID : null;
                    var g_product_sku = {"g_product_sku": value.g_product_sku};
                    value.ORDER_TYPE = 1;
                    if (value.FCL_NUMBER < 1) {
                        value.FCL_NUMBER = 1;
                    }
                    if (value.FCL_NUMBER > 1 && !(Math.floor(value.FCL_NUMBER) == value.FCL_NUMBER)) {
                        value.FCL_NUMBER = Math.floor(value.FCL_NUMBER);
                        value.TAILBOX_NUMBER = 1;
                        value.TAILBOX_BNUMBER = value.PURCHASE - (value.PACKING_NUMBER * value.FCL_NUMBER);
                    }
                    delete value['g_product_sku'];
                    delete value['CREATED_AT'];
                    delete value['UPDATED_AT'];
                    delete value['UUSER_CODE'];
                    delete value['CUSER_CODE'];
                    delete value['rowEntity'];
                    delete value['options'];
                    delete value['skuMapping'];
                    delete value['poPriceList'];
                    delete value['accountList'];
                    delete value['copyObject'];
                }
                ;
                return httpService.httpHelper(httpService.webApi.api, "purchase/plan", "generatepurchase", "POST", rows).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close();
                })
            };

            //计算金额 = 数量*含税单价
            $scope.amountSum = function(entity){
                if(entity.PURCHASE && entity.TAX_UNITPRICE){
                    var result=(entity.PURCHASE*entity.TAX_UNITPRICE).toFixed(2);
                    entity.TAX_AMOUNT=result;
                    return result;
                }
                return 0;
            };

            //计算不含税单价
            $scope.noTaxPrice = function(entity){
                var taxRate = toDecimal(Number(entity.TAX_RATE.substr(0, entity.TAX_RATE.length - 1) / 100));
                if(entity.TAX_UNITPRICE){
                    //不含税单价
                    var NOT_TAX_UNITPRICE = toDecimal(entity.TAX_UNITPRICE /(1 + taxRate));
                    entity.NOT_TAX_UNITPRICE = NOT_TAX_UNITPRICE;
                    return NOT_TAX_UNITPRICE;
                }
                return 0;
            };

            //计算不含税金额
            $scope.noTaxAmount = function(entity){
                var noTaxPrice = $scope.noTaxPrice(entity);
                var result=0;
                if(entity.PURCHASE && noTaxPrice){
                    var result=(entity.PURCHASE*noTaxPrice);
                }
                entity.NOT_TAX_AMOUNT=result;
                return result;
            };


            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x * 100) / 100;
                if (f == x) {
                    return x;
                }
                var s = f.toString();
                var rs = s.indexOf('.');
                if (rs < 0) {
                    rs = s.length;
                    s += '.';
                }
                while (s.length <= rs + 2) {
                    s += '0';
                }
                return s;
            }


            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (angular.isDate(object)) {
                    object = Math.round((object).valueOf() / 1000);
                } else {
                    object = Math.round((object) / 1000);
                }
                return object;
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close();
                //$modalInstance.dismiss(false);

            };

        })
    });



