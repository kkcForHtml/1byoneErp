/**
 * Created by Administrator on 2017/5/19.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/common/Services/commonService'
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
                            size:"1600px",
                            templateUrl: 'app/purchasingCenter/purchasingPlan/dialog/views/createPurchasingOrder.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("createPOCtrl", function ($scope,$filter, amHttp, model, $timeout, $modalInstance, Notification, transervice, httpService, commonService,$q, $interval) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PARTNER_CODE',
                        displayName: transervice.tran('*供应商'),
                        width: 150,
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PARTNER_CODE.list"
                    },
                    {field: 'PSKU_CODE', enableCellEdit: false, displayName: transervice.tran('SKU'), width: 100},
                    {
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('产品名称'),
                        width: 150
                    },
                    {
                        field: 'DORGANISATION_CODE_NAME',
                        enableCellEdit: false,
                        displayName: transervice.tran('需求组织'),
                        width: 120
                    },
                    {
                        field: 'ORGANISATION_CODE',
                        displayName: transervice.tran('*采购组织'),
                        width: 120,
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ORGANISATION_CODE.list"
                    },
                    {
                        field: 'CHANNEL_CODE',
                        enableCellEdit: false,
                        displayName: transervice.tran('平台'),
                        width: 60
                    },
                    {
                        field: 'UNIT_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('计量单位'),
                        width: 100
                    },
                    {field: 'PURCHASE', displayName: transervice.tran('数量'),width: 100},
                    {
                        field: 'PACKING_NUMBER',
                        enableCellEdit: false,
                        displayName: transervice.tran('每箱数量'),
                        width: 80
                    },
                    {
                        field: 'FCL_NUMBER',
                        width: 70,
                        enableCellEdit: false,
                        displayName: transervice.tran('箱数'),
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if ((Number(grid.getCellValue(row, col)) | 0 ) != Number(grid.getCellValue(row, col))) {
                                return 'red';
                            }
                        }
                    },
                    {
                        field: 'FCL_GROSS_WEIGHT',
                        enableCellEdit: false,
                        displayName: transervice.tran('整柜数量'),
                        width: 100
                    },
                    {
                        field: 'MONEY_CODE',
                        displayName: transervice.tran('*币种'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.MONEY_CODE.list",
                        width: 100
                    },
                    {field: 'TAX_UNITPRICE', displayName: transervice.tran('采购单价'), cellClass: 'red', width: 100},
                    {field: 'TAX_AMOUNT', displayName: transervice.tran('金额'), cellClass: 'red', width: 100},
                    {field: 'TAX_RATE', displayName: transervice.tran('税率'), cellClass: 'red', width: 100},
                    {
                        field: 'NOT_TAX_UNITPRICE',
                        enableCellEdit: false,
                        displayName: transervice.tran('不含税单价'),
                        width: 100
                    },
                    {
                        field: 'NOT_TAX_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('不含税金额'),
                        width: 100
                    },
                    {
                        field: 'SMETHOD',
                        displayName: transervice.tran('结算方式'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.SMETHOD.list",
                        width: 100
                    },
                    {
                        field: 'DELIVERY_METHOD',
                        displayName: transervice.tran('提货方式'),
                        width: 100
                    },
                    {
                        field: 'COMMI_PERIOD',
                        displayName: transervice.tran('*承诺交期'),
                        width: 120,
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    },
                    {field: 'FNSKU', enableCellEdit: false, width: 100, displayName: transervice.tran('产品条码')},
                    {field: 'PLATFORM_SKU', enableCellEdit: false, width: 100, displayName: transervice.tran('平台SKU')},
                    {
                        field: 'ACCOUNT_ID',enableCellEdit: false, width: 150,
                        cellTemplate:'<span>{{grid.appScope.getAccountName(row.entity.accountList,row.entity.ACCOUNT_ID)}}</span>',
                        displayName: transervice.tran('平台账号')
                    },
                    {
                        field: 'DEMAND_AT',
                        enableCellEdit: false,
                        width: 120,
                        displayName: transervice.tran('需求日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    },
                    {field: 'DETAIL_REMARKS',width: 120,enableCellEdit: false, displayType: 'numeric', displayName: transervice.tran('备注')},
                    {field: 'FCL_LONG', width: 90, displayType: 'numeric', displayName: transervice.tran('整箱-长')},
                    {field: 'FCL_WIDE', width: 90, displayType: 'numeric', displayName: transervice.tran('整箱-宽')},
                    {field: 'FCL_HIGH', width: 90, displayType: 'numeric', displayName: transervice.tran('整箱-高')},
                    {
                        field: 'GROSS_WEIGHT',
                        width: 90,
                        displayType: 'numeric',
                        displayName: transervice.tran('整箱-毛重')
                    },
                    {
                        field: 'FCL_NET_WEIGHT',
                        width: 90,
                        displayType: 'numeric',
                        displayName: transervice.tran('整箱-净重')
                    },
                    {
                        field: 'PLAN_TYPE', width: 100,
                        cellTemplate:'<span>{{grid.appScope.getplanTypeName(row.entity.PLAN_TYPE)}}</span>',
                        displayName: transervice.tran('采购类型'),
                        enableCellEdit: false
                    }
                ],

                paginationPageSizes: [20, 50, 100], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 20, //每页显示个数
                useExternalPagination: true,//是否使用分页按钮
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                enableVerticalScrollbar: 1,

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function (row, colDef, newValue, oldValue) {
                        //编辑供应商
                        if (colDef.field == "PARTNER_CODE") {
                            var PARTNER_CODE = row.PARTNER_CODE;
                            var PURCHASE = Number(row.PURCHASE);
                            if(row.poPriceList.length>0){
                                row.poPriceList.forEach(d=>{
                                    if(PARTNER_CODE == d.PARTNER_CODE && PURCHASE >= d.PRODUCT_SKU_MOQ ){
                                        row.TAX_UNITPRICE = Number(d.UNIT_PRICE);
                                        row.TAX_AMOUNT = row.TAX_UNITPRICE * PURCHASE;
                                        var taxRate = row.TAX_RATE.substr(0,row.TAX_RATE.length-1)/100;
                                        //不含税单价
                                        row.NOT_TAX_UNITPRICE = toDecimal(row.TAX_UNITPRICE ? (row.TAX_UNITPRICE/(1+(taxRate ? taxRate:0))):0);
                                        //不含税金额
                                        row.NOT_TAX_AMOUNT = toDecimal(Number(row.NOT_TAX_UNITPRICE) * PURCHASE);
                                    }
                                });
                            }
                        }
                        //编辑数量
                        if (colDef.field == "PURCHASE") {
                            var PURCHASE = Number(row.PURCHASE);
                            row.TAX_AMOUNT = row.TAX_UNITPRICE * PURCHASE;
                            row.NOT_TAX_AMOUNT = toDecimal(Number(row.NOT_TAX_UNITPRICE) * PURCHASE);
                        }

                    });
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
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //查询采购职能树
            (function () {
                var dataSearch = {
                    "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",2]],
                    "joinwith":["o_organisationt"],
                    "limit":0
                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                    var poOrgList = datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
                    $scope.poOrgList = [];
                    $scope.poTaxList = [];
                    poOrgList.forEach(d=>{
                        $scope.poOrgList.push({
                            "value": d.ORGANISATION_CODE,
                            "name": d.ORGANISATION_NAME_CN
                        });
                        $scope.poTaxList.push({
                            "ORGANISATION_CODE":d.ORGANISATION_CODE,
                            "TARIFF": d.TARIFF
                        });
                    });
                });
            })();

            //查询所有币种
            function getAllCurrency() {
                var dataSearch = {
                    "where": ["<>", "DELETED_STATE", 1],
                    "limit":0
                };
                return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", dataSearch).then(function (datas) {
                    var currencyList = datas.data;
                    $scope.currencyList = [];
                    currencyList.forEach(d=>{
                        $scope.currencyList.push({
                            "value": d.MONEY_CODE,
                            "name": d.MONEY_NAME_CN
                        });
                    });
                });
            };
            getAllCurrency().then(function(){
                $scope.init();
            });

            $scope.smethodList = commonService.getDicList("PARTNER_SMETHOD"); //结算方式
            $scope.poTypeList = commonService.getDicList("PLAN_TYPE"); //采购类型
            if(model){
                $scope.model = model;
            }
            $scope.init = function(){
                $scope.model.forEach(d=>{
                    d.DORGANISATION_CODE = d.ORGAN_CODE_DEMAND;
                    d.DORGANISATION_CODE_NAME = d.ORGAN_CODE_DEMAND_NAME;
                    d.UNIT_CODE = d.UNIT_CODE;
                    d.UNIT_NAME_CN = d.UNIT_NAME_CN;
                    //供应商
                    var supplierList = [];
                    if(d.g_product_sku.g_product_sku_supplier != null){
                        d.g_product_sku.g_product_sku_supplier.forEach(s=>{
                            supplierList.push({
                                "value": s.PARTNER_CODE,
                                "name": s.PARTNER_CODE+'_'+s.pa_partner.PARTNER_ANAME_CN
                            });
                            if(s.DEFAULTS == 1){
                                d.PARTNER_CODE = s.PARTNER_CODE;
                                d.SMETHOD = s.pa_partner.SMETHOD;
                            }
                        });
                    }
                    //采购价格
                    var poPriceList = [];
                    if(d.g_product_sku.g_product_sku_price!=null){
                        d.g_product_sku.g_product_sku_price.forEach(c=>{
                            poPriceList.push({
                                "PARTNER_CODE":c.PARTNER_CODE,
                                "UNIT_PRICE":Number(c.UNIT_PRICE) ,
                                "PRODUCT_SKU_MOQ": Number(c.PRODUCT_SKU_MOQ)
                            });
                        });
                    }
                    d.poPriceList = poPriceList;
                    //采购组织 、税率
                    d.ORGANISATION_CODE = d.g_product_sku.ORGAN_CODE_PURCHASE;
                    var poTax = $scope.poTaxList.filter(c=>c.ORGANISATION_CODE==d.ORGANISATION_CODE);
                    var taxRate = Number(poTax.length?poTax[0].TARIFF:0);
                    d.TAX_RATE = Number(poTax.length?poTax[0].TARIFF:0)*100+"%";
                    //采购单价、金额
                    if(d.PARTNER_CODE!=null && d.poPriceList.length>0){
                        var count = Number(d.PURCHASE);
                        d.poPriceList.forEach(v=>{
                            if(d.PARTNER_CODE == v.PARTNER_CODE && count >= v.PRODUCT_SKU_MOQ ){
                                d.TAX_UNITPRICE = toDecimal(Number(v.UNIT_PRICE));
                                d.TAX_AMOUNT = Number(d.TAX_UNITPRICE * count);
                            }
                        });
                    }
                    //不含税单价
                    d.NOT_TAX_UNITPRICE = toDecimal(d.TAX_UNITPRICE ? (d.TAX_UNITPRICE/(1+(taxRate ? taxRate:0))):0);
                    //不含税金额
                    d.NOT_TAX_AMOUNT = toDecimal(Number(d.NOT_TAX_UNITPRICE) * Number(d.PURCHASE));
                    d.FCL_LONG = d.PACKING_LONG;
                    d.FCL_WIDE = d.PACKING_WIDE;
                    d.FCL_HIGH = d.PACKING_HIGH;
                    d.FCL_NET_WEIGHT = d.NET_WEIGHT;//净重
                    d.FCL_GROSS_WEIGHT =  d.GROSS_WEIGHT ;//毛重
                    //获取账号
                    d.accountList = d.rowEntity.fieldDataObjectMap.ACCOUNT_ID.list;
                    var rowEntity = {
                        "fieldDataObjectMap": {
                            "PARTNER_CODE": {
                                "list": supplierList
                            },
                            "ORGANISATION_CODE": {
                                "list": $scope.poOrgList
                            },
                            "MONEY_CODE": {
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
            };
            //采购类型名称
            $scope.getplanTypeName = function(value){
                var planType = $scope.poTypeList.filter(t=>t.D_VALUE == value);
                if(planType.length){
                    return planType[0].name;
                }
                return "";
            }
            //账号名称
            $scope.getAccountName = function(accountList,value){
                var planType = accountList.filter(t=>t.value == value);
                if(planType.length){
                    return planType[0].name;
                }
                return "";
            };

            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x*100)/100;
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

            //确定
            $scope.confirm = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要审核的数据！'));
                }
                for(var i =0 ;i<rows.length;i++) {
                    var value = rows[i];
                    if (value.PARTNER_CODE == null) {
                        return Notification.error(transervice.tran('供应商为必填项！'));
                    }
                    if (value.ORGANISATION_CODE == null) {
                        return Notification.error(transervice.tran('采购组织为必填项！'));
                    }
                    if (value.MONEY_CODE == null) {
                        return Notification.error(transervice.tran('币种为必填项！'));
                    }
                    if (value.COMMI_PERIOD == null) {
                        return Notification.error(transervice.tran('承诺交期为必填项！'));
                    }
                    value.COMMI_PERIOD = $scope.formatDate(value.COMMI_PERIOD);
                    value.DEMAND_AT = $scope.formatDate(value.DEMAND_AT);
                    value.TAX_RATE = value.TAX_RATE.substr(0, value.TAX_RATE.length - 1) / 100;
                    var g_product_sku = {"g_product_sku": value.g_product_sku};

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
                };
                httpService.httpHelper(httpService.webApi.api, "purchase/plan","generatepurchase" ,"POST", rows).then(function (result) {
                    Notification.success(transervice.tran('保存成功'));
                    $modalInstance.close();
                })
            };

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



