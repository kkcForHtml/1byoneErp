/**
 * Created by Administrator on 2017/5/19.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/directives/singleSelectDirt',
    'app/purchasingCenter/purchasingTracking/controllers/generate_schedule_service',
    'app/purchasingCenter/purchasingTracking/controllers/purchase_receive_service',
    'app/purchasingCenter/purchasingTracking/controllers/generate_requestPayment_service',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/dialogPopupDirt',
    'app/common/Services/messageService',
    'app/purchasingCenter/purchaseOrder/controllers/purchase_edit_service',
    'app/masterCenter/product/controllers/productSKU_edit_service',
    'app/masterCenter/product/controllers/productSKU_add_service',
    "app/inventoryCenter/skstorage/controllers/skstorageAddService",
    "app/inventoryCenter/common/controllers/purchaseChooseService",
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', '$q', '$interval', 'gridDefaultOptionsService', 'generate_schedule_service', 'purchase_receive_service', 'generate_requestPayment_service', 'messageService', 'purchase_edit_service', 'productSKU_edit_service', 'skstorageAddService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp, transervice, uiGridConstants, $q, $interval, gridDefaultOptionsService, generate_schedule_service, purchase_receive_service, generate_requestPayment_service, messageService, purchase_edit_service, productSKU_edit_service, skstorageAddService) {
            $scope.gridOptions = {
                columnDefs: [{
                    field: 'PRE_ORDER_AT',
                    width: 100,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('下单日期'),
                    type: 'date',
                    cellFilter: "date:'yyyy-MM-dd'"
                }, {
                    field: 'CHANNEL_NAME_CN',
                    width: 115,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('平台'),
                    //pinnedLeft:true
                }, {
                    field: 'PARTNER_ANAME_CN',
                    width: 85,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('供应商')
                }, {
                    field: 'PU_PURCHASE_CD',
                    width: 170,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('采购订单号'),
                    //cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.editPo(row.entity)">{{row.entity.PU_PURCHASE_CD}}</a>'
                    //cellTemplate: '<div><a class="btn btn-link" style="padding-top: 3px;" p-link link-code="row.entity.PU_PURCHASE_CD" link-state="\'1\'">{{row.entity.PU_PURCHASE_CD}}</a></div>',
                    cellTemplate:'<div class=" noEdit-color" ><a class="btn btn-link" style="padding-top: 3px;" p-link link-code="row.entity.PU_PURCHASE_CD" link-state="1" refresh="grid.appScope.refreshOrder()">{{row.entity.PU_PURCHASE_CD}}</a></div>',
                }, {
                    field: 'ORDER_STATE',
                    width: 75,
                    enableCellEdit: false,
                    displayName: transervice.tran('单据状态'),
                    cellClass: 'text-center unedit',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getOrderStateName(row.entity.ORDER_STATE)}}</div>'
                }, {
                    field: 'PSKU_CODE',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 120,
                    displayName: transervice.tran('采购单SKU'),
                    //cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.editPorduct(row.entity.PSKU_CODE)">{{row.entity.PSKU_CODE}}</a>',
                    //cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" ><a class="btn btn-link" sku-link="row.entity.PSKU_ID">{{row.entity.PSKU_CODE}}</a></div>',
                    //cellTemplate: '<div><a class="btn btn-link" sku-link="row.entity.PSKU_ID">{{row.entity.PSKU_CODE}}</a></div>',
                    cellTemplate:'<div class=" noEdit-color" ><a class="btn btn-link" style="padding-top: 3px;" sku-link="row.entity.PSKU_ID" refresh="grid.appScope.refreshSKU()">{{row.entity.PSKU_CODE}}</a></div>',
                }, {
                    field: 'PSKU_NAME_CN',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 150,
                    displayName: transervice.tran('产品名称')
                }, {
                    field: 'PURCHASE',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 70,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('数量')
                }, {
                    field: 'TAX_UNITPRICE',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 90,
                    displayName: transervice.tran('单价'),
                    cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TAX_UNITPRICE|number:2}}</div>'
                }, {
                    field: 'MONEY_NAME_CN',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 70,
                    displayName: transervice.tran('币种')
                }, {
                    field: 'TAX_AMOUNT',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 90,
                    displayName: transervice.tran('金额'),
                    cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TAX_AMOUNT|number:2}}</div>'
                }, {
                    field: 'THIS_APPLY_AMOUNT',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 90,
                    displayName: transervice.tran('已申付金额'),
                    cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.THIS_APPLY_AMOUNT|number:2}}</div>',
                }, {
                    field: 'UNTHIS_APPLY_AMOUNT',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 90,
                    displayName: transervice.tran('未申付金额'),
                    cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNTHIS_APPLY_AMOUNT|number:2}}</div>'
                }, {
                    field: 'RGOODS_AMOUNT',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 90,
                    displayName: transervice.tran('已付金额'),
                    cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.RGOODS_AMOUNT|number:2}}</div>',
                }, {
                    field: 'UNRGOODS_AMOUNT',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 90,
                    displayName: transervice.tran('未付金额'),
                    cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNRGOODS_AMOUNT|number:2}}</div>'
                }, {
                    field: 'FNSKU',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 110,
                    displayName: transervice.tran('产品条码')
                }, {
                    field: 'PLATFORM_SKU',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 110,
                    displayName: transervice.tran('平台SKU')
                }, {
                    field: 'ACCOUNT',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 110,
                    displayName: transervice.tran('帐号')
                }, {
                    field: 'RGOODS_NUMBER',
                    enableCellEdit: false,
                    width: 90,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('已收货数量')
                }, {
                    field: 'UNRGOODS_NUMBER',
                    enableCellEdit: false,
                    width: 90,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('未收货数量')
                }, {
                    field: 'COMMI_PERIOD',
                    width: 100,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('承诺交期'),
                    type: 'date',
                    cellFilter: "date:'yyyy-MM-dd'"
                }, {
                    field: 'INSPECTION_STATE',
                    width: 75,
                    enableCellEdit: false,
                    displayName: transervice.tran('验货状态'),
                    cellClass: "text-right unedit",
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getInspectStateName(row.entity.INSPECTION_STATE)}}</div>'
                }, {
                    field: 'INSPECTION_NUMBER',
                    width: 90,
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('已验数量')
                }, {
                    field: 'SCHEDULING_NUMBER',
                    width: 90,
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('已排程数量')
                }, {
                    field: 'UNINSPECTION_NUMBER',
                    width: 90,
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('未验数量')
                }, {
                    field: 'INSPECTIONLOG',
                    displayName: transervice.tran('验货日志'),
                    width: 85,
                    enableCellEdit: false, cellClass: 'unedit',
                    //cellTemplate: '<div popover template-url="\'app/purchasingCenter/purchasingTracking/dialog/views/inspectLog.html\'" place="\'bottom\'" model="row.entity.pu_qctabless" lable-text="row.entity.INSPECTIONLOG"></div>'
                    cellTemplate: '<span dialog-popup    template-url="app/purchasingCenter/purchasingTracking/views/inspectLog.html"   id="uniqueinspectionlogger{{row.entity.index}}"   dialog-model="row.entity.pu_qctabless" >-----</span>',
                }, {
                    field: 'PARTNER_CODE',
                    width: 75,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('厂商编码')
                }, {
                    field: 'DELIVERY_METHOD',
                    width: 75,
                    enableCellEdit: false,
                    displayName: transervice.tran('提货方式'),
                    cellClass: 'text-center unedit',
                    //cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getOrderStateName(row.entity.ORDER_STATE)}}</div>'
                }, {
                    field: 'ORGANISATION_ID',
                    width: 110,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('采购组织'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.pu_purchase.o_organisation?row.entity.pu_purchase.o_organisation.ORGANISATION_NAME_CN:""}}</div>'

                }, {
                    field: 'DORGANISATION_ID',
                    width: 110,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('需求组织'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.pu_purchase.o_organisation_o?row.entity.pu_purchase.o_organisation_o.ORGANISATION_NAME_CN:""}}</div>'
                }, {
                    field: 'STAFF_CODE1',
                    width: 75,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('采购员')
                }, {
                    field: 'UNIT_NAME_CN',
                    width: 75,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('单位')
                }, {
                    field: 'FCL_NUMBER',
                    width: 85,
                    type: 'number',
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('整箱数')
                }, {
                    field: 'EACH_NUMBER',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('每箱数量'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0"  max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.EACH_NUMBER"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'FCL_LONG',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('整箱-长'),
                    editableCellTemplate: '<div><form><input  formatting="false"  numeric decimals="2"  max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_LONG"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'FCL_WIDE',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('整箱-宽'),
                    editableCellTemplate: '<div><form><input  formatting="false"  numeric decimals="2"  max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_WIDE"></form></div>',
                    cellEditableCondition: function (index) {
                        return index.col.grid.options.data[index.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'FCL_HIGH',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('整箱-高'),
                    editableCellTemplate: '<div><form><input  formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_HIGH"></form></div>',
                    cellEditableCondition: function (index) {
                        return index.col.grid.options.data[index.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'GROSS_WEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('整箱-毛重'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.GROSS_WEIGHT"></form></div>',
                    cellEditableCondition: function (index) {
                        return index.col.grid.options.data[index.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'FCL_NET_WEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('整箱-净重'),
                    editableCellTemplate: '<div><form><input  formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_NET_WEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'TAILBOX_NUMBER',
                    width: 85,
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('尾箱数')
                }, {
                    field: 'TAILBOX_BNUMBER',
                    width: 85,
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('尾箱每箱数量')
                }, {
                    field: 'TAILBOX_LONG',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱-长'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_LONG"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'TAILBOX_WIDE',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱-宽'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_WIDE"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'TAILBOX_HIGH',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱-高'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_HIGH"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'TAILBOX_WEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱-毛重'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_WEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'TAILBOX_NETWEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱-净重'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_NETWEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].ORDER_STATE != 2;
                    },
                    cellClass: changeBackColor
                }],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

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
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //编辑每箱数量
                        if (colDef.field == "EACH_NUMBER") {
                            if (newValue == null || newValue == "" || newValue == undefined || newValue == 0) {
                                rowEntity.FCL_NUMBER = 0;
                                rowEntity.TAILBOX_BNUMBER = 0;
                                rowEntity.TAILBOX_NUMBER = 0;
                            } else {
                                rowEntity.FCL_NUMBER = Math.floor(rowEntity.PURCHASE / newValue);
                                rowEntity.TAILBOX_BNUMBER = rowEntity.PURCHASE - (rowEntity.FCL_NUMBER * newValue);
                                rowEntity.TAILBOX_NUMBER = rowEntity.TAILBOX_BNUMBER > 0 ? 1 : 0;
                            }
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

            $scope.refreshOrder=function () {
                init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
            }

            $scope.refreshSKU=function () {
                init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
            }

            //设置样式函数
            function changeBackColor(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (row.entity.ORDER_STATE == 1) {
                    return 'canedit text-right'
                } else {
                    return 'unedit text-right'
                }
            }

            //初始化基础数据
            function baseInit() {
                //初始化下拉框
                $scope.model = new Object();
                $scope.model.search = new Object();
                //单据状态
                $scope.model.orderStates = commonService.getDicList("PU_PURCHASE"); //其中"PRODUCT_SKU"是字典表里的分组名
                $scope.model.inspectStates = commonService.getDicList("INSPECTION_STATE"); //其中"INSPECTION_STATE"是字典表里的分组名

                //搜索条件
                $scope.model.search.searchPayment = "1";
                $scope.model.search.searchInspection = "0";
                $scope.model.search.searchReceipt = "0";
                $scope.model.search.timeFrom = $filter("date")((new Date().valueOf() - (90 * 24 * 3600 * 1000)), "yyyy-MM-dd");
                $scope.model.search.timeTo = $filter("date")((new Date().valueOf() + (90 * 24 * 3600 * 1000)), "yyyy-MM-dd");

                init();
            }

            //模糊搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                var timeFrom = angular.copy($scope.model.search.timeFrom);
                var timeTo = angular.copy($scope.model.search.timeTo);
                if (timeFrom != "" && timeFrom != null && timeTo != "" && timeTo != null) {
                    timeFrom = new Date(timeFrom.replace(/-/g, '/')).getTime();
                    timeTo = new Date(timeTo.replace(/-/g, '/')).getTime();
                    if (timeFrom > timeTo) {
                        return Notification.error(transervice.tran("起始日期不能大于结束日期"));
                    }
                }
                init();
            }

            function searchCondition(pageSize) {
                var selectWhere = {
                    "where": ['and', ["=", "pu_purchase.ORDER_TYPE", 1], ["=", "pu_purchase.DELETED_STATE", 0]],
                    "joinwith": ['pu_purchase', 'g_product_sku', 'b_account', 'b_unit', 'pu_qctabless'],
                    "orderby": "pu_purchase.ORDER_STATE asc,pu_purchase_detail.UPDATED_AT desc",
                    "distinct": true,
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                var andW = new Array("or");
                if ($scope.model.search.searchData != null && $scope.model.search.searchData != "" && $scope.model.search.searchData != undefined) { //搜索框
                    andW.push(["like", "pu_purchase_detail.PU_PURCHASE_CD", $scope.model.search.searchData])
                    andW.push(["like", "pu_purchase_detail.PSKU_CODE", $scope.model.search.searchData])
                    andW.push(["like", "pu_purchase_detail.PSKU_NAME_CN", $scope.model.search.searchData])
                }
                if (andW.length > 1) {
                    selectWhere["andWhere"] = andW;
                }
                var andFW = new Array("and");
                if ($scope.model.search.searchPayment != 0) { //未付款
                    if ($scope.model.search.searchPayment == 1) {
                        andFW.push([">", "(pu_purchase_detail.TAX_AMOUNT  - pu_purchase_detail.THIS_APPLY_AMOUNT)", "0"])
                    } else if ($scope.model.search.searchPayment == 2) {
                        andFW.push(["<=", "(pu_purchase_detail.TAX_AMOUNT  - pu_purchase_detail.THIS_APPLY_AMOUNT)", "0"])
                    }
                }
                if ($scope.model.search.searchInspection != 0) { //未验货
                    if ($scope.model.search.searchInspection == 1) {
                        andFW.push([">", "(pu_purchase_detail.PURCHASE - pu_purchase_detail.INSPECTION_NUMBER- pu_purchase_detail.SCHEDULING_NUMBER)", "0"])
                    } else if ($scope.model.search.searchInspection == 2) {
                        andFW.push(["=", "(pu_purchase_detail.PURCHASE - pu_purchase_detail.INSPECTION_NUMBER- pu_purchase_detail.SCHEDULING_NUMBER)", "0"])
                    }
                }
                if ($scope.model.search.searchReceipt != 0) { //未收货
                    if ($scope.model.search.searchReceipt == 1) {
                        andFW.push([">", "(pu_purchase_detail.PURCHASE - pu_purchase_detail.RGOODS_NUMBER)", "0"])
                    } else if ($scope.model.search.searchReceipt == 2) {
                        andFW.push(["=", "(pu_purchase_detail.PURCHASE - pu_purchase_detail.RGOODS_NUMBER)", "0"])
                    }
                }
                if ($scope.model.search.timeFrom != "" && $scope.model.search.timeFrom != null) {//下单时间 起
                    var timeFrom = angular.copy($scope.model.search.timeFrom);
                    timeFrom = new Date(timeFrom.replace(/-/g, '/')).getTime();
                    timeFrom = Math.round((timeFrom).valueOf() / 1000);
                    andFW.push([">=", "pu_purchase.PRE_ORDER_AT", timeFrom])
                }
                if ($scope.model.search.timeTo != "" && $scope.model.search.timeTo != null) {//下单时间 止
                    var timeTo = angular.copy($scope.model.search.timeTo);
                    timeTo = new Date(timeTo.replace(/-/g, '/')).getTime();
                    timeTo = Math.round((timeTo).valueOf() / 1000);
                    andFW.push(["<=", "pu_purchase.PRE_ORDER_AT", timeTo])
                }
                if (andFW.length > 1) {
                    selectWhere["andFilterWhere"] = andFW;
                }
                return selectWhere;
            }

            function formatInitData(data) {
                var i = 0;
                data.forEach(d => {
                    d.index = i++;
                    if (d.pu_purchase) {
                        d.PRE_ORDER_AT = d.pu_purchase.PRE_ORDER_AT * 1000;
                        if(d.pu_purchase.pa_partner){
                            d.PARTNER_ANAME_CN = d.pu_purchase.pa_partner.PARTNER_ANAME_CN;
                            d.PARTNER_CODE = d.pu_purchase.pa_partner.PARTNER_CODE;
                        }
                        d.PARTNER_ID = d.pu_purchase.PARTNER_ID;
                        d.ORDER_STATE = d.pu_purchase.ORDER_STATE;
                        d.MONEY_NAME_CN = d.pu_purchase.b_money.MONEY_NAME_CN;
                        d.ORGANISATION_ID = d.pu_purchase.o_organisation.ORGANISATION_ID;
                        d.DORGANISATION_ID = d.pu_purchase.o_organisation_o.ORGANISATION_ID;
                        d.STAFF_CODE1 = d.pu_purchase.u_userinfo_g ? d.pu_purchase.u_userinfo_g.STAFF_NAME_CN : "";
                        d.CHANNEL_NAME_CN = d.pu_purchase.b_channel.CHANNEL_NAME_CN;
                    }
                    d.COMMI_PERIOD = d.COMMI_PERIOD * 1000;
                    if (d.b_account) {
                        d.ACCOUNT = d.b_account.ACCOUNT;
                    }
                    d.UNTHIS_APPLY_AMOUNT = d.TAX_AMOUNT - d.THIS_APPLY_AMOUNT;
                    d.UNRGOODS_AMOUNT = d.TAX_AMOUNT - d.RGOODS_AMOUNT;
                    d.UNRGOODS_NUMBER = d.PURCHASE - d.RGOODS_NUMBER;
                    d.UNINSPECTION_NUMBER = d.PURCHASE - d.INSPECTION_NUMBER - d.SCHEDULING_NUMBER;
                    if (d.b_unit) {
                        d.UNIT_NAME_CN = d.b_unit.UNIT_NAME_CN;
                    }
                    d.INSPECTIONLOG = "-----";
                    if (d.pu_qctabless && d.pu_qctabless.length > 0) {
                        d.pu_qctabless.forEach(p => {
                            if (p.INSPECTION_AT == "" || p.INSPECTION_AT == null || p.INSPECTION_AT == undefined) {
                                p.timeF = "";
                            } else {
                                p.timeF = $filter("date")(new Date(parseInt(p.INSPECTION_AT) * 1000), "yyyy-MM-dd");
                            }
                            $scope.model.orderStates.forEach(os => {
                                if (os.D_VALUE == p.AUDIT_STATE) {
                                    p.AUDIT_STATENAME = os.D_NAME_CN;
                                }
                            });
                            $scope.model.inspectStates.forEach(is => {
                                if (is.D_VALUE == p.INSPECTION_STATE) {
                                    p.INSPECTION_STATENAME = is.D_NAME_CN;
                                }
                            });
                            p.userName = p.u_userinfo_uic ? p.u_userinfo_uic.STAFF_NAME_CN : "";
                        });
                    }
                });
                return data;
            }

            function init(currentPage, pageSize) {

                //搜索条件
                var dataSearch = searchCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "purchase/purchasedetail", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(
                    function (result) {
                        $scope.gridOptions.totalItems = result._meta.totalCount;
                        //格式化出师参数
                        var data = formatInitData(result.data);
                        $scope.gridOptions.data = data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                        $scope.clearAll();
                    });
            };

            //导出
            $scope.export = function () {
                var dirtyRow = $scope.gridApi.rowEdit.getDirtyRows();
                if (dirtyRow.length > 0) {
                    return Notification.error(transervice.tran('请保存数据后操作!'));
                }
                var form = $("<form>"); //定义一个form表单
                form.attr("style", "display:none");
                form.attr("target", "");
                form.attr("method", "post");
                var input1 = $("<input>");
                input1.attr("type", "hidden");
                input1.attr("name", "searchPayment"); //付款状态
                input1.attr("value", $scope.model.search.searchPayment);
                form.append(input1);
                var input2 = $("<input>");
                input2.attr("type", "hidden");
                input2.attr("name", "searchInspection"); //验货状态
                input2.attr("value", $scope.model.search.searchInspection);
                form.append(input2);
                var input3 = $("<input>");
                input3.attr("type", "hidden");
                input3.attr("name", "searchReceipt"); //收货状态
                input3.attr("value", $scope.model.search.searchReceipt);
                form.append(input3);
                var input4 = $("<input>");
                input4.attr("type", "hidden");
                input4.attr("name", "timeFrom");
                var timeFrom = angular.copy($scope.model.search.timeFrom);
                if (timeFrom != "" && timeFrom != null) {
                    timeFrom = new Date(timeFrom.replace(/-/g, '/')).getTime();
                    timeFrom = Math.round((timeFrom).valueOf() / 1000);
                } else {
                    timeFrom = "";
                }
                input4.attr("value", timeFrom);
                form.append(input4);
                var input5 = $("<input>");
                input5.attr("type", "hidden");
                input5.attr("name", "timeTo");
                var timeTo = angular.copy($scope.model.search.timeTo);
                if (timeTo != "" && timeTo != null) {
                    timeTo = new Date(timeTo.replace(/-/g, '/')).getTime();
                    timeTo = Math.round((timeTo).valueOf() / 1000);
                } else {
                    timeTo = "";
                }
                input5.attr("value", timeTo);
                form.append(input5);
                form.attr("action", httpService.webApi.api + "/purchase/ptrack/exportpt");
                $("body").append(form); //将表单放置在web中
                form.submit(); //表单提交
            }

            //获取采购订单审核状态名称
            $scope.getOrderStateName = function (state) {
                var states = $scope.model.orderStates.filter(o => o.D_VALUE == state);
                if (states.length) {
                    return states[0].D_NAME_CN;
                }
            }

            //获取验货审核状态名称
            $scope.getInspectStateName = function (state) {
                var states = $scope.model.inspectStates.filter(o => o.D_VALUE == state);
                if (states.length) {
                    return states[0].D_NAME_CN;
                }
            }

            //保存
            $scope.save = function () {
                var rows = $scope.gridApi.rowEdit.getDirtyRows();
                var errorMsg = "";
                var entity = rows.map(r => r.entity);
                if (rows.length <= 0) {
                    errorMsg = transervice.tran(messageService.error_choose_n);
                }
                var entitys = angular.copy(entity);
                entitys.forEach(value => {
                    if (value.ORDER_STATE == 2) {
                        errorMsg = transervice.tran(messageService.error_audit_a);
                    }
                    value = $scope.formatData(value);
                });
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                var saveData = {
                    batchMTC: entitys
                };
                return httpService.httpHelper(httpService.webApi.api, "purchase/purchasedetail", "update", "POST", saveData).then(function (datas) {
                    Notification.success(datas.message);
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    $scope.clearAll();
                    init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                })
            };

            //生成验货排程
            $scope.generateScheduling = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var errorMsg = "";
                rows.forEach(value => {
                    if (value.ORDER_STATE != 2) {
                        errorMsg = messageService.error_audit_n;
                    }
                });
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                generate_schedule_service.showDialog(rows).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.clearAll();
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                });
            };

            //付款申请
            $scope.generatePaymentRequest = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var errorMsg = "";
                for (var i = 0; i < rows.length; i++) {
                    var obj = rows[i];
                    if (obj.ORDER_STATE != 2) {
                        errorMsg = messageService.error_audit_n;
                        break;
                    }
                    if ((i != rows.length - 1) && (obj.PARTNER_ID != rows[i + 1].PARTNER_ID || obj.ORGANISATION_ID != rows[i + 1].ORGANISATION_ID || obj.DORGANISATION_ID != rows[i + 1].DORGANISATION_ID)) {
                        errorMsg = "选择的单据供应商、采购组织、需求组织不一致，不能作此操作！";
                        break;
                    }
                }
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                generate_requestPayment_service.showDialog(rows).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.clearAll();
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                })
            };

            function formatPurchasingReceivingData(data) {
                var gridData = [];
                angular.forEach(data, function (ob, index) {
                    var temp = [];
                    temp['PU_ORDER_CD'] = ob.PU_PURCHASE_CD;
                    temp['PURCHASE_DETAIL_ID'] = ob.PURCHASE_DETAIL_ID;
                    temp['PSKU_CODE'] = ob.PSKU_CODE;
                    temp['PSKU_ID'] = ob.PSKU_ID;
                    temp['PSKU_NAME_CN'] = ob.PSKU_NAME_CN;
                    temp['UNIT_NAME_CN'] = ob.UNIT_NAME_CN;
                    temp['MONEY_ID'] = ob.pu_purchase.MONEY_ID;
                    temp['UNIT_ID'] = ob.b_unit.UNIT_ID;
                    temp['STORAGE_DNUMBER'] = ob.UNRGOODS_NUMBER;
                    temp['TAX_RATE'] = ob.TAX_RATE;
                    temp['TAX_UNITPRICE'] = ob.TAX_UNITPRICE;
                    temp['NOT_TAX_UNITPRICE'] = ob.NOT_TAX_UNITPRICE;
                    gridData.push(temp);
                });

                var skStorageData = {
                    "ORGANISATION_ID": data['0'].ORGANISATION_ID,
                    "PARTNER_NAME_CN": data['0'].pu_purchase.pa_partner.PARTNER_NAME_CN,
                    "PARTNER_ID": data['0'].PARTNER_ID,
                    "MONEY_ID": data['0'].pu_purchase.MONEY_ID,
                    "MONEY_NAME_CN": data['0'].MONEY_NAME_CN,
                    "data": gridData
                }
                return skStorageData;
            }

            function checkPurchasingReceivingData(data) {
                var errorMsg = "";
                var ORGANISATION_ID = data['0']['ORGANISATION_ID'];
                var PARTNER_ID = data['0']['PARTNER_ID'];
                data.forEach(value => {
                    if (value.ORDER_STATE != 2) {
                        errorMsg = messageService.error_audit_n;
                    }
                    if (value.ORGANISATION_ID != ORGANISATION_ID) {
                        errorMsg = "采购组织不一样";
                    }
                    if (value.PARTNER_ID != PARTNER_ID) {
                        errorMsg = "供应商不一样";
                    }
                });
                return errorMsg;
            }

            //采购收货
            $scope.purchasingReceiving = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var data = angular.copy(rows);

                var errorMsg = checkPurchasingReceivingData(data);
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }

                var skStorageData = formatPurchasingReceivingData(data);

                checkExchangeRate(skStorageData);
            };

            function checkExchangeRate(skStorageData) {
                var timeTemp = new Date().valueOf() / 1000;
                var moneyTemp = skStorageData.MONEY_ID;
                var temp = [];
                angular.forEach(skStorageData.data, function (obj, index) {
                    var tempp = [];
                    tempp.push(obj["MONEY_ID"]);
                    tempp.push(moneyTemp);
                    tempp.push(timeTemp);
                    temp.push(tempp);
                });
                return httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", temp).then(function (datas) {
                    var flag = true;
                    var totalAccount = 0;
                    angular.forEach(datas.data, function (row, i) {
                        if (row['3'] == null) {
                            flag = false;
                        } else {
                            skStorageData.data[i]["TAX_UNITPRICE"] = Number(skStorageData.data[i]["TAX_UNITPRICE"]) * row["3"];
                            skStorageData.data[i]["NOT_TAX_UNITPRICE"] = Number(skStorageData.data[i]["NOT_TAX_UNITPRICE"]) * row["3"];
                            skStorageData.data[i]['STORAGE_DMONEY'] = Number(skStorageData.data[i]["TAX_UNITPRICE"]) * Number(skStorageData.data[i]['STORAGE_DNUMBER']); //含税总价
                            skStorageData.data[i]['NOT_TAX_AMOUNT'] = Number(skStorageData.data[i]['NOT_TAX_UNITPRICE']) * Number(skStorageData.data[i]['STORAGE_DNUMBER']);     //不含税总价
                            totalAccount = parseFloat(totalAccount) + parseFloat(skStorageData.data[i]['STORAGE_DMONEY']);
                        }
                    });
                    if (flag) {
                        skStorageData["STORAGE_MONEY"] = totalAccount.toFixed(2),
                            skstorageAddService.showDialog(skStorageData).then(function (data) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                                $scope.clearAll();
                                init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                            });
                    } else {
                        return Notification.error(transervice.tran(messageService.error_exchange_rate));
                    }
                });
            }

            $scope.formatData = function (obj) {
                obj.COMMI_PERIOD = $scope.formatDate(obj.COMMI_PERIOD);
                obj.PRE_ORDER_AT = $scope.formatDate(obj.PRE_ORDER_AT);
                delete obj['b_account'];
                delete obj['b_unit'];
                delete obj['g_product_sku'];
                delete obj['pu_purchase'];
                delete obj['pu_qctabless'];
                delete obj['CREATED_AT'];
                delete obj['CUSER_ID'];
                delete obj['UUSER_ID'];
                delete obj['UPDATED_AT'];
                return obj;
            }

            //审核
            $scope.batchAudit = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var data = [];
                var row = angular.copy(rows);
                for (var i = 0; i < row.length; i++) {
                    var obj = row[i];
                    if (obj.ORDER_STATE == 2) {
                        Notification.error(transervice.tran(messageService.error_audit_a));
                        return;
                    } else {
                        obj = $scope.formatData(obj);
                        obj.ORDER_STATE = 2;
                        data.push(obj);
                    }
                }
                var updateData = {"batchMTC": data}
                return $confirm({
                    text: transervice.tran(messageService.confirm_audit)
                }).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "purchase/ptrack", "ptaudit", "POST", updateData).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.clearAll();
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                    });
                });
            };
            //反审核
            $scope.batchAntiAudit = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var data = [];
                //var myArray = [];
                for (var i = 0; i < rows.length; i++) {
                    var obj = rows[i];
                    if (obj.ORDER_STATE != 2) {
                        Notification.error(transervice.tran(messageService.error_audit_n));
                        return;
                    } else {
                        data.push(obj.PU_PURCHASE_CD);
                    }
                }
                return $confirm({
                    text: transervice.tran(messageService.confirm_audit_f)
                }).then(function () {

                    httpService.httpHelper(httpService.webApi.api, "purchase/ptrack", "ptreaudit", "POST", data).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.clearAll();
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                    });
                });
            };

            $scope.clearAll = function () {
                $scope.gridApi.selection.clearSelectedRows();
            };

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = Math.round((object) / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };
            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                init(currentPage, pageSize);
            }

            baseInit();
        }
    ]
});