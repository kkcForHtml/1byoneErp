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
    'app/purchasingCenter/purchasingPlan/controllers/create_po_service',
    'app/purchasingCenter/purchasingPlan/controllers/import_service',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/configService',
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', '$q', '$interval', 'messageService', 'configService', 'create_po_service', 'import_service', 'gridDefaultOptionsService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp, transervice, uiGridConstants, $q, $interval, messageService, configService, create_po_service, import_service, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'DORGANISATION_ID',
                        width: 120,
                        displayName: transervice.tran('*需求组织'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: '<div><form ><select ui-grid-edit-dropdown  ng-model="row.entity.DORGANISATION_ID" ng-options="item.value as item.name for item in row.entity.rowEntity.fieldDataObjectMap.DORGANISATION_ID.list" ng-change="grid.appScope.zuzhiChange(row.entity)"></select></form></div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'PSKU_CODE',
                        /*enableCellEdit: false,*/
                        displayName: transervice.tran('*SKU'),
                        width: 150,//id="f{{grid.appScope.gridOptions_detail.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_detail.columnDefs.indexOf(col.colDef)}}"
                        editableCellTemplate: '<div ng-if="!grid.appScope.gridOptions.showDirt"  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.PSKU_CODE" change="grid.appScope.selectRowChange(row)" row="row" style="width:90%"></div></div>',

                       // editableCellTemplate: '<div ng-if="!grid.appScope.gridOptions.showDirt"  id="f{{row.entity.index}}" ><div single-select options="row.entity.options" select-model="row.entity.PSKU_CODE" change="grid.appScope.selectRowChange(row)" row="row" style="width:90%"></div></div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        width: 200,
                        cellClass: 'unedit',
                        displayName: transervice.tran('产品名称'),
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        }
                    },
                    {
                        field: 'UNIT_NAME_CN',
                        width: 85,
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        displayName: transervice.tran('计量单位')
                    },
                    {
                        field: 'CHANNEL_ID',
                        width: 100,
                        displayName: transervice.tran('*平台'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getChannelName(row.entity.CHANNEL_ID,row.entity.rowEntity.fieldDataObjectMap.CHANNEL_ID.list)|dirtyFilter:row:col}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.CHANNEL_ID.list",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'PURCHASE',  width: 100, displayName: transervice.tran('*需求数量'),
                        editableCellTemplate: '<div><form><input formatting="false" numeric  decimals="0" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.PURCHASE"></form></div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if(row.entity.PLAN_STATE==1){
                                return 'canedit_num'
                            }else{
                                return 'unedit_num'
                            }
                        }
                    },
                    {
                        field: 'PACKING_NUMBER',
                        width: 100,
                        enableCellEdit: false,
                        displayName: transervice.tran('每箱数量'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.PACKING_NUMBER}}</div>',
                        cellClass:'unedit_num'
                    },
                    {
                        field: 'FCL_NUMBER',
                        width: 100,
                        enableCellEdit: false,
                        displayName: transervice.tran('总箱数'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.FCL_NUMBER|number:2}}</div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                                if(!(Math.floor(row.entity.FCL_NUMBER) ==row.entity.FCL_NUMBER)||row.entity.FCL_NUMBER==0){
                                    return 'red_unedit'
                                }else{
                                    return 'unedit_num'
                                }
                        }
                    },
                    {
                        field: 'CABINET_NUMBER',
                        width: 100,
                        enableCellEdit: false,
                        displayName: transervice.tran('整柜数量'),
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                                if(!(Math.floor(row.entity.CABINET_NUMBER) ==row.entity.CABINET_NUMBER)||row.entity.CABINET_NUMBER==0){
                                    return 'red_unedit'
                                }else{
                                    return 'unedit_num'
                                }
                        }
                    },
                    {
                        field: 'DEMAND_AT',
                        width: 130,
                        displayName: transervice.tran('需求日期'),
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.DEMAND_AT"></div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'CUSER_CODE',
                        width: 80,
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        displayName: transervice.tran('制单人'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{(row.entity.u_userinfo && row.entity.u_userinfo.u_staffinfo)?row.entity.u_userinfo.u_staffinfo.STAFF_NAME_CN:row.entity.u_userinfo.STAFF_CODE}}</div>'
                    },
                    {
                        field: 'CREATED_AT',
                        width: 160,
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        displayName: transervice.tran('计划日期'),
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div class="hidden-clock"  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.CREATED_AT"></div>'
                    },
                    {
                        field: 'PLAN_STATE',
                        width: 100,
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        displayName: transervice.tran('下推状态'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PLAN_STATE.list"
                    },
                    {
                        field: 'FNSKU',
                        width: 120,
                        displayName: transervice.tran('产品条码'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.FNSKU.list",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'PLATFORM_SKU', width: 130, displayName: transervice.tran('平台SKU'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PLATFORM_SKU.list",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'ACCOUNT_ID', width: 80, displayName: transervice.tran('账号'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ACCOUNT_ID.list",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'PLAN_REMARKS', width: 100, displayName: transervice.tran('备注'),
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    },
                    {
                        field: 'PLAN_TYPE',
                        width: 100,
                        displayName: transervice.tran('*采购类型'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PLAN_TYPE.list",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE == 1;
                        },
                        cellClass:changeBackColor
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                /*paginationPageSizes: [1,2,50], //每页显示个数可选项
                 paginationCurrentPage: 1, //当前页码
                 paginationPageSize:1,//每页显示个数*!/*/

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridOptions.gridApi = gridApi;
                    $scope.gridApi.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                        var data = oldRowCol;
                        if (oldRowCol) {
                            if (oldRowCol.col.field == 'PSKU_CODE') {
                                var rowIndex = oldRowCol.row.entity.index;
                                $("#f" + rowIndex).hide();
                                $("#f" + rowIndex).prev("div").removeClass("ui-grid-cell-contents-hidden");
                                $("#f" + rowIndex).prev("div").show();
                            }
                        }
                        oldRowCol = newRowCol;
                        if (newRowCol.col.field == 'PSKU_CODE') {
                            if (newRowCol.row.entity.DORGANISATION_ID != null && newRowCol.row.entity.DORGANISATION_ID.length > 0) {
                                var rowIndex = oldRowCol.row.entity.index;
                                $("#f" + rowIndex).show();
                                $("#f" + rowIndex).prev("div").hide();
                            } else {
                                var rowIndex = newRowCol.row.entity.index;
                                $("#f" + rowIndex).hide();
                                $("#f" + rowIndex).prev("div").removeClass("ui-grid-cell-contents-hidden");
                                $("#f" + rowIndex).prev("div").show();
                                return Notification.error(transervice.tran("请先选择需求组织！"));
                            }
                        }
                    });

                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        //编辑平台
                        if (colDef.field == "CHANNEL_ID") {
                            var CHANNEL_ID = rowEntity.CHANNEL_ID;
                            var data = (rowEntity.skuMapping && rowEntity.skuMapping.length > 0) ? rowEntity.skuMapping.filter(d=> {
                                return d.CHANNEL_ID == CHANNEL_ID && d.PLATFORM_TYPE_ID == 2
                            }) : [];
                            rowEntity.ACCOUNT_ID = (data != null && data.length == 1) ? data[0].ACCOUNT_ID : null;
                            rowEntity.FNSKU = (data != null && data.length == 1) ? data[0].FNSKU : null;
                            rowEntity.PLATFORM_SKU = (data != null && data.length == 1) ? data[0].PLATFORM_SKU : null;
                            if (data != null && data.length > 1) {
                                var data = data.filter(d=> {
                                    return d.CHANNEL_ID == CHANNEL_ID && d.DEFAULTS == 1
                                });
                                if (data != null && data.length == 1) {
                                    rowEntity.ACCOUNT_ID = data[0].ACCOUNT_ID;
                                    rowEntity.FNSKU = data[0].FNSKU;
                                    rowEntity.PLATFORM_SKU = data[0].PLATFORM_SKU;
                                }
                            }
                            if (data.length <= 0) {
                                var dataEbay = (rowEntity.skuMapping && rowEntity.skuMapping.length > 0) ? rowEntity.skuMapping.filter(d=> {
                                    return d.CHANNEL_ID == CHANNEL_ID && d.PLATFORM_TYPE_ID == 1
                                }) : null;
                                rowEntity.ACCOUNT_ID = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].ACCOUNT_ID : null;
                                rowEntity.FNSKU = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].FNSKU : null;
                                rowEntity.PLATFORM_SKU = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].PLATFORM_SKU : null;
                                if (dataEbay != null && dataEbay.length > 1) {
                                    var dataEbayD = dataEbay.filter(d=> {
                                        return d.CHANNEL_ID == CHANNEL_ID && d.DEFAULTS == 1
                                    });
                                    if (dataEbayD != null && dataEbayD.length == 1) {
                                        rowEntity.ACCOUNT_ID = dataEbayD[0].ACCOUNT_ID;
                                        rowEntity.FNSKU = null;
                                        rowEntity.PLATFORM_SKU = null;
                                    }
                                }
                            }
                        }
                        //编辑数量
                        if (colDef.field == "PURCHASE") {
                            var PURCHASE = rowEntity.PURCHASE ? Number(rowEntity.PURCHASE) : Number(0);
                            rowEntity.PACKING_NUMBER = rowEntity.PACKING_NUMBER ? Number(rowEntity.PACKING_NUMBER) : Number(0);//每箱数量
                            rowEntity.FCL_NUMBER = (rowEntity.PACKING_NUMBER != 0 && PURCHASE != 0) ? (PURCHASE / rowEntity.PACKING_NUMBER) : Number(0);//总箱数
                        }
                        //编辑产品编码
                        if (colDef.field == "FNSKU") {
                            var FNSKU = rowEntity.FNSKU;
                            if(FNSKU){
                                var data = (rowEntity.skuMapping && rowEntity.skuMapping.length > 0) ? rowEntity.skuMapping.filter(d=> {
                                    return d.FNSKU == FNSKU && d.PLATFORM_TYPE_ID == 2
                                }) : [];
                                rowEntity.ACCOUNT_ID = (data != null && data.length == 1) ? data[0].ACCOUNT_ID : null;
                                rowEntity.CHANNEL_ID = (data != null && data.length == 1) ? data[0].CHANNEL_ID : null;
                                rowEntity.FNSKU = (data != null && data.length == 1) ? data[0].FNSKU : null;
                                rowEntity.PLATFORM_SKU = (data != null && data.length == 1) ? data[0].PLATFORM_SKU : null;
                                if (data != null && data.length > 1) {
                                    var data = data.filter(d=> {
                                        return d.CHANNEL_ID == CHANNEL_ID && d.DEFAULTS == 1
                                    });
                                    if (data != null && data.length == 1) {
                                        rowEntity.ACCOUNT_ID = data[0].ACCOUNT_ID;
                                        rowEntity.CHANNEL_ID = data[0].CHANNEL_ID;
                                        rowEntity.PLATFORM_SKU = data[0].PLATFORM_SKU;
                                    }
                                }
                            }
                        }
                        //编辑平台SKU
                        if (colDef.field == "PLATFORM_SKU") {
                            var PLATFORM_SKU = rowEntity.PLATFORM_SKU;
                            if(PLATFORM_SKU){
                                var data = (rowEntity.skuMapping && rowEntity.skuMapping.length > 0) ? rowEntity.skuMapping.filter(d=> {
                                    return d.PLATFORM_SKU == PLATFORM_SKU && d.PLATFORM_TYPE_ID == 2
                                }) : [];
                                rowEntity.ACCOUNT_ID = (data != null && data.length == 1) ? data[0].ACCOUNT_ID : null;
                                rowEntity.CHANNEL_ID = (data != null && data.length == 1) ? data[0].CHANNEL_ID : null;
                                rowEntity.FNSKU = (data != null && data.length == 1) ? data[0].FNSKU : null;
                                rowEntity.PLATFORM_SKU = (data != null && data.length == 1) ? data[0].PLATFORM_SKU : null;
                                if (data != null && data.length > 1) {
                                    var data = data.filter(d=> {
                                        return d.CHANNEL_ID == CHANNEL_ID && d.DEFAULTS == 1
                                    });
                                    if (data != null && data.length == 1) {
                                        rowEntity.ACCOUNT_ID = data[0].ACCOUNT_ID;
                                        rowEntity.CHANNEL_ID = data[0].CHANNEL_ID;
                                        rowEntity.FNSKU = data[0].FNSKU;
                                    }
                                }
                            }
                        }
                        //编辑账号
                        if (colDef.field == "ACCOUNT_ID") {
                            var ACCOUNT_ID = rowEntity.ACCOUNT_ID;
                            if(ACCOUNT_ID){
                                var data = (rowEntity.skuMapping && rowEntity.skuMapping.length > 0) ? rowEntity.skuMapping.filter(d=> {
                                    return d.ACCOUNT_ID == ACCOUNT_ID && d.PLATFORM_TYPE_ID == 2
                                }) : [];
                                rowEntity.ACCOUNT_ID = (data != null && data.length == 1) ? data[0].ACCOUNT_ID : null;
                                rowEntity.CHANNEL_ID = (data != null && data.length == 1) ? data[0].CHANNEL_ID : null;
                                rowEntity.FNSKU = (data != null && data.length == 1) ? data[0].FNSKU : null;
                                rowEntity.PLATFORM_SKU = (data != null && data.length == 1) ? data[0].PLATFORM_SKU : null;
                                if (data != null && data.length > 1) {
                                    var data = data.filter(d=> {
                                        return d.CHANNEL_ID == CHANNEL_ID && d.DEFAULTS == 1
                                    });
                                    if (data != null && data.length == 1) {
                                        rowEntity.ACCOUNT_ID = data[0].ACCOUNT_ID;
                                        rowEntity.CHANNEL_ID = data[0].CHANNEL_ID;
                                        rowEntity.PLATFORM_SKU = data[0].PLATFORM_SKU;
                                        rowEntity.FNSKU = data[0].FNSKU;
                                    }
                                }
                                if (data.length <= 0) {
                                    var dataEbay = (rowEntity.skuMapping && rowEntity.skuMapping.length > 0) ? rowEntity.skuMapping.filter(d=> {
                                        return d.ACCOUNT_ID == ACCOUNT_ID && d.PLATFORM_TYPE_ID == 1
                                    }) : [];
                                    rowEntity.ACCOUNT_ID = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].ACCOUNT_ID : null;
                                    rowEntity.CHANNEL_ID = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].CHANNEL_ID : null;
                                    rowEntity.FNSKU = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].FNSKU : null;
                                    rowEntity.PLATFORM_SKU = (dataEbay != null && dataEbay.length == 1) ? dataEbay[0].PLATFORM_SKU : null;
                                    if (dataEbay != null && dataEbay.length > 1) {
                                        var dataEbayD = dataEbay.filter(d=> {
                                            return d.CHANNEL_ID == CHANNEL_ID && d.DEFAULTS == 1
                                        });
                                        if (dataEbayD != null && dataEbayD.length == 1) {
                                            rowEntity.ACCOUNT_ID = dataEbayD[0].ACCOUNT_ID;
                                            rowEntity.CHANNEL_ID = dataEbayD[0].CHANNEL_ID;
                                            rowEntity.FNSKU = null;
                                            rowEntity.PLATFORM_SKU = null;
                                        }
                                    }
                                }
                            }
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

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            $scope.zuzhiChange = function (rowEntity) {
                $scope.dicOptions = {
                    filter: "contains",
                    autoBind: true,
                    table:"g_product_sku",
                    dataTextField: "PSKU_CODE",
                    dataValueField: "PSKU_CODE",
                    optionLabel: "请选择",
                    url: httpService.webApi.api + "/master/product/prodsku/index",
                    search: {
                        limit: 0,
                        distinct: true,
                        where: ["and", ["<>", "g_product_sku.PSKU_STATE", 0], ["=", "g_product_sku.ORGAN_ID_DEMAND", rowEntity.DORGANISATION_ID]],
                        joinWith: ['b_unit', 'g_organisation', 'g_product_sku_packing', 'g_product_sku_supplier', 'g_product_sku_fnsku', 'g_product_sku_price']
                    }
                };
                var userInfo = angular.copy($scope.userInfo);
                if (userInfo && userInfo.u_staffinfo2) {
                    userInfo.u_staffinfo = userInfo.u_staffinfo2;
                }
                var chooseOrg = $scope.orgList.filter(v=>v.value == rowEntity.DORGANISATION_ID);
                var platformOfDemandOrgList = [];
                chooseOrg.length > 0 && chooseOrg[0].b_channel.forEach(c=> {
                    platformOfDemandOrgList.push({
                        "value": c.CHANNEL_ID,
                        "name": c.CHANNEL_NAME_CN
                    })
                });
                /*if(chooseOrg.length>0){
                 platformOfDemandOrgList = chooseOrg[0].b_channel
                 }*/
                rowEntity.rowEntity.fieldDataObjectMap.CHANNEL_ID = {"list": platformOfDemandOrgList};
                var newItem = {
                    "DORGANISATION_ID": rowEntity.DORGANISATION_ID,
                    "PU_PLAN_ID":rowEntity.PU_PLAN_ID,
                    "PLAN_STATE": 1,
                    "PLAN_TYPE": rowEntity.PLAN_TYPE,
                    "PSKU_CODE": null,
                    "CREATED_AT": rowEntity.CREATED_AT,
                    "CUSER_CODE": (userInfo && userInfo.u_staffinfo) ? userInfo.u_staffinfo.STAFF_NAME_CN : null,
                    "u_userinfo": userInfo ? userInfo : null,
                    "index": rowEntity.index,
                    "options": angular.copy($scope.dicOptions),
                    "rowEntity": rowEntity.rowEntity
                }
                angular.copy(newItem, rowEntity);
                newItem.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND",rowEntity.DORGANISATION_ID]);

                rowEntity.PSKU_CODE = null;
                rowEntity.options = angular.copy($scope.dicOptions);
                gridDefaultOptionsService.refresh($scope.gridOptions,"PSKU_CODE");//刷新方法
                /*refresh($scope.gridOptions, ()=> {
                });*/
            }
            //获取所有平台
            function getChannelList() {
                configService.getOrganisationList([4]).then(function (datas) {
                    $scope.orgList = [];
                    datas && datas.forEach(d=> {
                        $scope.orgList.push({
                            'value': d.ORGANISATION_ID,
                            'name': d.ORGANISATION_NAME_CN,
                            'b_channel': d.b_channel
                        });
                    });
                    var searchData = {
                        "where": ["<>", "b_channel.CHANNEL_STATE", 0],
                        "orderby": "b_channel.UPDATED_AT desc",
                        "select": ["b_channel.CHANNEL_ID", "b_channel.CHANNEL_NAME_CN"],
                        "limit": 0
                    };
                    httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", searchData).then(function (datas) {
                        $scope.channelList = datas.data;
                        init();
                    })
                });
            };
            getChannelList();

            $scope.poStateList = commonService.getDicList("PU_PLAN"); //下推状态
            $scope.poTypeList = commonService.getDicList("PLAN_TYPE"); //采购类型
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();

            function init(currentPage, pageSize) {
                var selectWhere = {};
                if ($scope.searchWhere) {
                    selectWhere = $scope.searchWhere;
                } else {
                    selectWhere.where = ["and", ["<>", "pu_plan.DELETED_STATE", 1], ["<>", "pu_plan.PLAN_STATE", 3]];
                }
                selectWhere.joinwith = ["g_product_sku", "u_userinfo"];
                selectWhere.orderby = "pu_plan.PLAN_STATE,pu_plan.UPDATED_AT desc";
                selectWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                selectWhere.distinct = true;
                httpService.httpHelper(httpService.webApi.api, "purchase/plan", "index?page=" + (currentPage ? currentPage : 1), "POST", selectWhere).then(
                    function (result) {
                        result._meta.totalCount*1&&($scope.gridOptions.totalItems=result._meta.totalCount);
                        var data = result.data;
                        data.forEach(d=> {
                            var dicOptions = {
                                filter: "contains",
                                autoBind: true,
                                /*  dataSource: null,*/
                                dataTextField: "PSKU_CODE",
                                dataValueField: "PSKU_CODE",
                                optionLabel: "请选择",
                                url: httpService.webApi.api + "/master/product/prodsku/index",
                                search: {
                                    limit: 0,
                                    where: ["and", ["<>", "g_product_sku.PSKU_STATE", 0], ["=", "g_product_sku.ORGAN_ID_DEMAND", d.DORGANISATION_ID]],
                                    joinWith: ['b_unit', 'g_organisation', 'g_product_sku_packing', 'g_product_sku_supplier', 'g_product_sku_fnsku', 'g_product_sku_price']
                                }
                            };
                            var options = dicOptions;
                            options.value = d.PSKU_CODE;
                            options.search.andwhere = ["=", "PSKU_CODE", d.PSKU_CODE];
                            d.options = options;
                            d.CREATED_AT = d.CREATED_AT ? ($filter("date")(d.CREATED_AT * 1000, "yyyy-MM-dd")) : null;
                            d.DEMAND_AT = d.DEMAND_AT ? ($filter("date")(d.DEMAND_AT * 1000, "yyyy-MM-dd")) : null;
                            /*d.CREATED_AT = new Date(d.CREATED_AT * 1000);
                             d.DEMAND_AT = d.DEMAND_AT ? (new Date(d.DEMAND_AT * 1000)) : null;*/
                            //单位
                            if (d.g_product_sku != null && d.g_product_sku.b_unit != null) {
                                d.UNIT_ID = d.g_product_sku.b_unit.UNIT_ID;
                                d.UNIT_NAME_CN = d.g_product_sku.b_unit.UNIT_NAME_CN;
                            }
                            d.COMMI_PERIOD = $filter("date")((new Date().valueOf() + (d.g_product_sku&&d.g_product_sku.g_next_cycle&&d.g_product_sku.g_next_cycle.DELIVERY?(d.g_product_sku.g_next_cycle.DELIVERY * 24 * 3600 * 1000):0)), "yyyy-MM-dd");
                            //需求组织下的所有平台
                            var channelOfDemandOrgList = [];
                            var data = $scope.orgList ? $scope.orgList.filter(v=>v.value == d.DORGANISATION_ID) : [];
                            if (data.length > 0) {
                                channelOfDemandOrgList = data[0].b_channel;
                            }
                            var platformOfDemandOrgList = [];
                            channelOfDemandOrgList.length > 0 && channelOfDemandOrgList.forEach(c=> {
                                platformOfDemandOrgList.push({
                                    "value": c.CHANNEL_ID,
                                    "name": c.CHANNEL_NAME_CN
                                });
                            });

                            //SKU对应FNSKU、平台、账号，平台SKU (映射)
                            var fnSkuList = [];
                            var bchannelList = [];
                            var accountList = [];
                            var platformSkuList = [];
                            var skuMapping = [];
                            if (d.g_product_sku != null && d.g_product_sku.g_product_sku_fnsku != null) {
                                d.g_product_sku.g_product_sku_fnsku.forEach(obj=> {
                                    obj.b_channel != null && obj.b_channel.PLATFORM_TYPE_ID == '2' && fnSkuList.push({
                                        "name": obj.FNSKU,
                                        "value": obj.FNSKU,
                                        "CHANNEL_ID": obj.CHANNEL_ID,
                                    });
                                    if (obj.b_channel != null) {
                                        bchannelList.push({
                                            "value": obj.CHANNEL_ID,
                                            "name": obj.b_channel.CHANNEL_ID,
                                            "CHANNEL_ID": obj.CHANNEL_ID,
                                        });
                                    }
                                    if (obj.b_account != null) {
                                        accountList.push({
                                            "value": obj.ACCOUNT_ID,
                                            "name": obj.b_account.ACCOUNT,
                                            "CHANNEL_ID": obj.CHANNEL_ID,
                                        });
                                    }
                                    obj.b_channel != null && obj.b_channel.PLATFORM_TYPE_ID == '2' && platformSkuList.push({
                                        "name": obj.PLATFORM_SKU,
                                        "value": obj.PLATFORM_SKU,
                                        "CHANNEL_ID": obj.CHANNEL_ID,
                                    });
                                    skuMapping.push({
                                        "PLATFORM_TYPE_ID": obj.b_channel != null ? obj.b_channel.PLATFORM_TYPE_ID : null,
                                        "FNSKU": obj.b_channel != null && obj.b_channel.PLATFORM_TYPE_ID == '2' ? obj.FNSKU : null,
                                        "CHANNEL_ID": obj.CHANNEL_ID,
                                        "CHANNEL_NAME_CN": obj.b_channel != null ? obj.b_channel.CHANNEL_ID : null,
                                        "ACCOUNT_ID": obj.ACCOUNT_ID ? obj.ACCOUNT_ID : null,
                                        "ACCOUNT": obj.b_account != null ? obj.b_account.ACCOUNT : null,
                                        "PLATFORM_SKU": obj.b_channel != null && obj.b_channel.PLATFORM_TYPE_ID == '2' ? obj.PLATFORM_SKU : null,
                                        "DEFAULTS": obj.DEFAULTS
                                    });
                                    d.skuMapping = skuMapping;
                                });
                            }
                            d.skuMapping = skuMapping;
                            //装箱资料
                            if (d.g_product_sku != null && d.g_product_sku.g_product_sku_packing != null) {
                                d.PACKING_NUMBER = d.g_product_sku.g_product_sku_packing.PACKING_NUMBER ? d.g_product_sku.g_product_sku_packing.PACKING_NUMBER : 0;//每箱数量
                                d.CABINET_NUMBER = d.g_product_sku.g_product_sku_packing.CABINET_NUMBER ? d.g_product_sku.g_product_sku_packing.CABINET_NUMBER : 0;//整柜数量
                                d.NET_WEIGHT = d.g_product_sku.g_product_sku_packing.NET_WEIGHT ? d.g_product_sku.g_product_sku_packing.NET_WEIGHT : 0;//净重
                                d.GROSS_WEIGHT = d.g_product_sku.g_product_sku_packing.GROSS_WEIGHT ? d.g_product_sku.g_product_sku_packing.GROSS_WEIGHT : 0;//毛重
                                d.PACKING_LONG = d.g_product_sku.g_product_sku_packing.PACKING_LONG ? d.g_product_sku.g_product_sku_packing.PACKING_LONG : 0;//装箱长
                                d.PACKING_WIDE = d.g_product_sku.g_product_sku_packing.PACKING_WIDE ? d.g_product_sku.g_product_sku_packing.PACKING_WIDE : 0;//装箱宽
                                d.PACKING_HIGH = d.g_product_sku.g_product_sku_packing.PACKING_HIGH ? d.g_product_sku.g_product_sku_packing.PACKING_HIGH : 0;//装箱高
                                d.FCL_NUMBER = (d.PURCHASE != 0 && d.PACKING_NUMBER != 0) ? (Number(d.PURCHASE) / Number(d.PACKING_NUMBER)) : 0;
                            }
                            var rowEntity = {
                                "fieldDataObjectMap": {
                                    "DORGANISATION_ID": {
                                        "list": $scope.orgList
                                    },
                                    "PLAN_STATE": {
                                        "list": $scope.poStateList
                                    },
                                    "PLAN_TYPE": {
                                        "list": $scope.poTypeList
                                    },
                                    "CHANNEL_ID": {
                                        "list": platformOfDemandOrgList
                                    },
                                    "FNSKU": {
                                        "list": fnSkuList
                                    },
                                    "PLATFORM_SKU": {
                                        "list": platformSkuList
                                    },
                                    "ACCOUNT_ID": {
                                        "list": accountList
                                    }
                                }
                            };
                            d.FNSKU = (d.FNSKU && d.FNSKU.length) > 0 ? d.FNSKU : null;
                            d.PLATFORM_SKU = (d.PLATFORM_SKU && d.PLATFORM_SKU.length) > 0 ? d.PLATFORM_SKU : null;
                            d.ACCOUNT_ID = (d.ACCOUNT_ID && d.ACCOUNT_ID.length) > 0 ? d.ACCOUNT_ID : null;
                            d.PLAN_REMARKS = (d.PLAN_REMARKS && d.PLAN_REMARKS.length) > 0 ? d.PLAN_REMARKS : null;
                            d.PU_PLAN_ID = d.PU_PLAN_ID;
                            d.copyObject = angular.copy(d);
                            d.rowEntity = rowEntity;
                            d.index = $scope.gridOptions.data.length;

                        });
                        $scope.gridOptions.data = data;
                        var data = $scope.gridOptions.data;
                        $scope.gridApi.selection.clearSelectedRows();
                        /*refresh($scope.gridOptions, ()=> {*/
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                            /*$scope.clearAll();

                        });*/

                    });
            };
            //init();

            //新增
            $scope.add = function () {
                var rowEntity = {
                    "fieldDataObjectMap": {
                        "DORGANISATION_ID": {
                            "list": $scope.orgList
                        },
                        "PLAN_TYPE": {
                            "list": $scope.poTypeList
                        }
                    }
                };
                var userInfo = angular.copy($scope.userInfo);
                if (userInfo && userInfo.u_staffinfo2) {
                    userInfo.u_staffinfo = userInfo.u_staffinfo2;
                }
                var data = new Date();
                data = $scope.formatDate(data);
                data = $filter("date")(data * 1000, "yyyy-MM-dd");
                var newData = {
                    "DORGANISATION_ID": null,
                    "PSKU_CODE": null,
                    "PLAN_STATE": 1,
                    "PLAN_TYPE": "1",
                    "CREATED_AT": data,
                    "CUSER_CODE": (userInfo && userInfo.u_staffinfo) ? userInfo.u_staffinfo.STAFF_NAME_CN : null,
                    "u_userinfo": userInfo ? userInfo : null,
                    "index": $scope.gridOptions.data.length,
                    "copyObject": {},
                    "rowEntity": rowEntity
                };
                $scope.gridOptions.data.unshift(newData);
                /*refresh($scope.gridOptions, ()=> {
                });*/
            };
            //保存
            $scope.save = function () {
                var filedList = [];
                $scope.gridOptions.columnDefs.forEach(d=> {
                    if (d.field && d.enableCellEdit) {
                        filedList.push(d.field);
                    }
                });
                filedList.push("PU_PLAN_ID");
                var entitys = getDirtyRows(angular.copy($scope.gridOptions.data), filedList, "PU_PLAN_ID");
                if (entitys.length <= 0) {
                    return Notification.error(transervice.tran(messageService.error_choose_n));
                }
                for (var i = 0; i < entitys.length; i++) {
                    var value = entitys[i];
                    if (value.DORGANISATION_ID == null || value.DORGANISATION_ID.length == 0) {
                        return Notification.error(transervice.tran('请输入需求组织'));
                    }
                    if (value.PSKU_CODE == null || value.PSKU_CODE.length == 0) {
                        return Notification.error(transervice.tran('请输入SKU'));
                    }
                    if (value.CHANNEL_ID == null || value.CHANNEL_ID.length == 0) {
                        return Notification.error(transervice.tran('请输入平台'));
                    }
                    if (value.PURCHASE == null || value.PURCHASE.length == 0 ) {
                        return Notification.error(transervice.tran('请输入需求数量'));
                    }
                    if(value.PURCHASE <= 0){
                        return Notification.error(transervice.tran('需求数量必须大于0'));
                    }
                    if (value.PLAN_TYPE == null || value.PLAN_TYPE.length == 0) {
                        return Notification.error(transervice.tran('请输入采购类型'));
                    }
                    value.CREATED_AT = value.CREATED_AT && $scope.formatDate(new Date(value.CREATED_AT.replace(/-/g, "/")));
                    value.DEMAND_AT = value.DEMAND_AT && $scope.formatDate(new Date(value.DEMAND_AT.replace(/-/g, "/")));
                    delete value['g_product_sku'];
                    delete value['copyObject'];
                    delete value['options'];
                    delete value['rowEntity'];
                    delete value['skuMapping'];
                    delete value['u_userinfo'];
                    delete value['copyModel'];
                }
                var saveData = {batchMTC: entitys};
                return httpService.httpHelper(httpService.webApi.api, "purchase/plan", "update", "POST", saveData).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                })

            };
            //删除
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({text: transervice.tran(messageService.confirm_del)})
                    .then(function () {
                        var delRows = rows.filter(e=>e.PU_PLAN_ID);
                        if (delRows.length) {
                            var myArray = [];
                            for (var i = 0; i < delRows.length; i++) {
                                var obj = delRows[i];
                                if (obj.PLAN_STATE == 2) {
                                    Notification.error(transervice.tran(messageService.error_audit_a));
                                    return;
                                } else {
                                    myArray.push(obj.PU_PLAN_ID);
                                    delRows.forEach(e=>e.DELETED_STATE = 1);
                                }
                            }
                            var delData = {
                                "condition": {"where": {"PU_PLAN_ID": myArray}},
                                "edit": {"DELETED_STATE": 1}
                            };
                            return httpService.httpHelper(httpService.webApi.api, "purchase/plan", "update", "POST", delData).then(function (result) {
                                Notification.success(transervice.tran(result.message));
                                $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a, rows) == -1);
                            }, function (result) {
                                Notification.error(transervice.tran(result.message));
                            });
                        } else {
                            $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a, rows) == -1);
                        }
                    })
            };
            //审核
            $scope.batchAudit = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));//判断是否选择了数据
                }
                var valiRows = rows.filter(a=>a.PLAN_STATE == 2);
                if (valiRows.length > 0) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));//是否包含了已审核数据
                }
                var myArray = [];
                for (var i = 0; i < rows.length; i++) {
                    var value = rows[i];
                    if (value.PSKU_CODE == null || value.PSKU_CODE.length == 0) {
                        return Notification.error(transervice.tran('请输入SKU'));
                    }
                    if (value.CHANNEL_ID == null || value.CHANNEL_ID.length == 0) {
                        return Notification.error(transervice.tran('请输入平台'));
                    }
                    if (value.PURCHASE == null || value.PURCHASE.length == 0) {
                        return Notification.error(transervice.tran('请输入需求数量'));
                    }
                    if (value.PLAN_TYPE == null || value.PLAN_TYPE.length == 0) {
                        return Notification.error(transervice.tran('请输入采购类型'));
                    }
                    value.PLAN_STATE = 2;
                    value.CREATED_AT = value.CREATED_AT && $scope.formatDate(new Date(value.CREATED_AT.replace(/-/g, "/")));
                    value.DEMAND_AT = value.DEMAND_AT && $scope.formatDate(new Date(value.DEMAND_AT.replace(/-/g, "/")));
                    delete value['copyObject'];
                    delete value['options'];
                    delete value['rowEntity'];
                    delete value['skuMapping'];
                    delete value['u_userinfo'];
                    myArray[i] = value;
                }
                return $confirm({text: transervice.tran(messageService.confirm_audit)})
                    .then(function () {
                        var updateData = {
                            "batchMTC": myArray
                        };
                        return httpService.httpHelper(httpService.webApi.api, "purchase/plan", "update", "POST", updateData).then(function (result) {
                            Notification.success(transervice.tran(result.message));
                            $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                            init();
                        });
                    });
            };
            //反审核
            $scope.batchAntiAudit = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));//判断是否选择了数据
                }
                var valiRows = rows.filter(a=>a.PLAN_STATE == 1);
                if (valiRows.length) {
                    return Notification.error(transervice.tran(messageService.error_audit_n));//判断是否包含未审核数据
                }
                var myArray = [];
                for (var i = 0; i < rows.length; i++) {
                    var obj = rows[i];
                    myArray[i] = Number(obj.PU_PLAN_ID);
                }
                var updateData = {
                    "condition": {"where": {"PU_PLAN_ID": myArray}},
                    "edit": {"PLAN_STATE": 1}
                };
                return httpService.httpHelper(httpService.webApi.api, "purchase/plan", "reaudit", "POST", updateData).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    init();
                });
            };
            //采购计划单确认
            $scope.setPO = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = [];
                for (var i = 0; i < rows.length; i++) {
                    var obj = rows[i];
                    if (obj.PLAN_STATE == 1) {
                        Notification.error(transervice.tran(messageService.error_audit_n));
                        return;
                    } else if (!obj.PU_PLAN_ID) {
                        Notification.error(transervice.tran(messageService.error_audit_a));
                        return;
                    } else {
                        obj.channelList = $scope.channelList;
                        myArray[i] = obj;
                    }
                }
                create_po_service.showDialog(myArray).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });

            };
            //下载模板
            $scope.downloadTempl = function () {

            };
            //导入
            $scope.importPuPlan = function () {
                import_service.showDialog().then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });
            };

            //单选SKU
            $scope.selectRowChange = function (row) {
                if (row.entity.DORGANISATION_ID == null || row.entity.DORGANISATION_ID.length == 0) {
                    row.entity.PSKU_CODE = null;
                    return Notification.error(transervice.tran(messageService.error_choose_org));
                }
                row.isDirty = true;
                row.isError = true;
                var PSKU_CODE = row.entity.PSKU_CODE;
                var newData = {
                    "PSKU_CODE": PSKU_CODE
                };
                var fnSkuList = [];
                var bchannelList = [];
                var accountList = [];
                var platformSkuList = [];
                var skuMapping = [];
                var searchCoditions = {
                    where: ["and", ["=", "g_product_sku.PSKU_CODE", PSKU_CODE], ["=", "g_product_sku.ORGAN_ID_DEMAND", row.entity.DORGANISATION_ID]],
                    joinWith: ['b_unit', 'g_organisation', 'g_product_sku_packing', 'g_product_sku_supplier', 'g_product_sku_fnsku', 'g_product_sku_price']
                };
                httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "index", "POST", searchCoditions).then(
                    function (result) {
                        if(result.data[0]!=null){
                            var obj = result.data[0];
                            //需求组织下的所有平台
                            var platformOfDemandOrgList = [];
                            var data = $scope.orgList.length > 0 ? $scope.orgList.filter(v=>v.value == row.entity.DORGANISATION_ID) : [];
                            data.length > 0 && data[0].b_channel.forEach(c=> {
                                platformOfDemandOrgList.push({
                                    "value": c.CHANNEL_ID,
                                    "name": c.CHANNEL_NAME_CN
                                })
                            });
                            newData.PSKU_NAME_CN = obj.PSKU_NAME_CN;

                            //单位
                            if (obj.b_unit) {
                                newData.UNIT_ID = obj.b_unit.UNIT_ID;
                                newData.UNIT_NAME_CN = obj.b_unit.UNIT_NAME_CN;
                            }
                            //SKU对应FNSKU、平台、账号，平台SKU (映射)
                            obj.g_product_sku_fnsku.forEach(item=> {
                                if (item.b_channel != null) {
                                    bchannelList.push({
                                        "value": item.CHANNEL_ID,
                                        "name": item.b_channel.CHANNEL_ID
                                    });
                                }
                                if (item.b_account != null) {
                                    accountList.push({
                                        "value": item.ACCOUNT_ID,
                                        "name": item.b_account.ACCOUNT,
                                        "CHANNEL_ID": item.CHANNEL_ID
                                    });
                                }
                                item.b_channel != null && item.b_channel.PLATFORM_TYPE_ID == '2' && fnSkuList.push({
                                    "name": item.FNSKU,
                                    "value": item.FNSKU,
                                    "CHANNEL_ID": item.CHANNEL_ID
                                });
                                item.b_channel != null && item.b_channel.PLATFORM_TYPE_ID == '2' && platformSkuList.push({
                                    "name": item.PLATFORM_SKU,
                                    "value": item.PLATFORM_SKU,
                                    "CHANNEL_ID": item.CHANNEL_ID
                                });
                                skuMapping.push({
                                    "PLATFORM_TYPE_ID": item.b_channel ? item.b_channel.PLATFORM_TYPE_ID : null,
                                    "FNSKU": item.b_channel != null && item.b_channel.PLATFORM_TYPE_ID == '2' ? item.FNSKU : null,
                                    "CHANNEL_ID": item.CHANNEL_ID,
                                    "CHANNEL_NAME_CN": item.b_channel ? item.b_channel.CHANNEL_ID : null,
                                    "ACCOUNT_ID": item.ACCOUNT_ID ? item.ACCOUNT_ID : null,
                                    "ACCOUNT": item.b_account ? item.b_account.ACCOUNT : null,
                                    "PLATFORM_SKU": item.b_channel != null && item.b_channel.PLATFORM_TYPE_ID == '2' ? item.PLATFORM_SKU : null,
                                    "DEFAULTS": item.DEFAULTS
                                });

                                if (item.b_channel && item.DEFAULTS == 1 && item.b_channel.PLATFORM_TYPE_ID == 2) {
                                    newData.CHANNEL_ID = item.CHANNEL_ID;
                                    newData.ACCOUNT_ID = item.ACCOUNT_ID;
                                    newData.FNSKU = item.FNSKU;
                                    newData.PLATFORM_SKU = item.PLATFORM_SKU;
                                } else {
                                    newData.ACCOUNT_ID = null;
                                    newData.FNSKU = null;
                                    newData.PLATFORM_SKU = null;
                                }

                            });
                            newData.skuMapping = skuMapping;
                            if (obj.g_product_sku_packing) {
                                newData.PACKING_NUMBER = obj.g_product_sku_packing.PACKING_NUMBER ? obj.g_product_sku_packing.PACKING_NUMBER : 0;//每箱数量
                                newData.CABINET_NUMBER = obj.g_product_sku_packing.CABINET_NUMBER ? obj.g_product_sku_packing.CABINET_NUMBER : 0;//整柜数量
                                newData.NET_WEIGHT = obj.g_product_sku_packing.NET_WEIGHT ? obj.g_product_sku_packing.NET_WEIGHT : 0;//净重
                                newData.GROSS_WEIGHT = obj.g_product_sku_packing.GROSS_WEIGHT ? obj.g_product_sku_packing.GROSS_WEIGHT : 0;//毛重
                                newData.PACKING_LONG = obj.g_product_sku_packing.PACKING_LONG ? obj.g_product_sku_packing.PACKING_LONG : 0;//装箱长
                                newData.PACKING_WIDE = obj.g_product_sku_packing.PACKING_WIDE ? obj.g_product_sku_packing.PACKING_WIDE : 0;//装箱宽
                                newData.PACKING_HIGH = obj.g_product_sku_packing.PACKING_HIGH ? obj.g_product_sku_packing.PACKING_HIGH : 0;//装箱高
                            }
                            var rowEntity = {
                                "fieldDataObjectMap": {
                                    "DORGANISATION_ID": {
                                        "list": $scope.orgList
                                    },
                                    "PLAN_STATE": {
                                        "list": $scope.poStateList
                                    },
                                    "PLAN_TYPE": {
                                        "list": $scope.poTypeList
                                    },
                                    "CHANNEL_ID": {
                                        "list": platformOfDemandOrgList
                                    },
                                    "FNSKU": {
                                        "list": fnSkuList
                                    },
                                    "PLATFORM_SKU": {
                                        "list": platformSkuList
                                    },
                                    "ACCOUNT_ID": {
                                        "list": accountList
                                    }
                                }
                            };
                            newData.CREATED_AT = row.entity.CREATED_AT;
                            newData.PLAN_STATE = 1;
                            newData.PLAN_TYPE = "1";
                            newData.index = row.entity.index;
                            newData.rowEntity = rowEntity;
                            newData.DORGANISATION_ID = row.entity.DORGANISATION_ID;
                            $scope.dicOptions = {
                                filter: "contains",
                                autoBind: true,
                                /*  dataSource: null,*/
                                dataTextField: "PSKU_CODE",
                                dataValueField: "PSKU_CODE",
                                optionLabel: "请选择",
                                table:"g_product_sku",
                                url: httpService.webApi.api + "/master/product/prodsku/index",
                                search: {
                                    limit: 0,
                                    distinct: true,
                                    where: ["and", ["<>", "g_product_sku.PSKU_STATE", 0], ["=", "g_product_sku.ORGAN_ID_DEMAND", row.entity.DORGANISATION_ID]],
                                    joinWith: ['b_unit', 'g_organisation', 'g_product_sku_packing', 'g_product_sku_supplier', 'g_product_sku_fnsku', 'g_product_sku_price']
                                }
                            };
                            newData.options = angular.copy($scope.dicOptions);
                            newData.u_userinfo = row.entity.u_userinfo ? row.entity.u_userinfo : null;
                            newData.PURCHASE = Number(0);
                            newData.PU_PLAN_ID = row.entity.PU_PLAN_ID;
                            newData.DEMAND_AT = null;
                            newData.PSKU_ID = obj.PSKU_ID;
                            newData.PLAN_REMARKS = (row.entity.PLAN_REMARKS && row.entity.PLAN_REMARKS.length) > 0 ? row.entity.PLAN_REMARKS : null;
                            newData.copyObject = row.entity.copyObject ? row.entity.copyObject : {};
                            angular.copy(newData, row.entity);
                        }
                    }
                );
            };
            //获取修改过的实体
            function getDirtyRows(datas, fileds, idtext) {
                if (!datas) {
                    return;
                }
                var result = [];
                datas.forEach(d=> {
                    if (!d[idtext]) {
                        result.push(d);
                    } else {
                        var flag = getEqualResult(d, fileds);
                        if (!flag) {
                            result.push(d);
                        }
                    }
                })
                return result;
                function getEqualResult(data, fields) {
                    var copyData = data.copyObject;
                    for (var i = 0; i < fields.length; i++) {
                        var f = fields[i];
                        if (angular.isDate(data[f]) || angular.isDate(copyData[f])) {
                            var object = data[f] ? Math.round((data[f]).valueOf() / 1000) : 0;
                            var object1 = copyData[f] ? Math.round((copyData[f]).valueOf() / 1000) : 0;
                            if (object != object1) {
                                return false;
                            }
                        } else if (copyData[f] != data[f]) {
                            return false;

                        }
                    }
                    return true;
                }
            }

            //获取平台名称
            $scope.getChannelName = function (code, channelList) {
                if (!channelList) {
                    return null;
                }
                var channels = channelList.filter(c=>c.value == code);
                if (channels.length) {
                    return channels[0].name;
                }
                return null;
            };

            //模糊搜索
            $scope.search = function () {
                if ($scope.searchCondtion) {
                    var serach = ["or", ["like", "pu_plan.PSKU_CODE", $scope.searchCondtion], ["like", "pu_plan.PSKU_NAME_CN", $scope.searchCondtion]];
                    var data = $scope.channelList.filter(d=>d.CHANNEL_NAME_CN.indexOf($scope.searchCondtion) != -1);
                    if (data.length > 0) {
                        data.forEach(d=> {
                            serach.push(["like", "pu_plan.CHANNEL_ID", d.CHANNEL_ID]);
                        })
                    }
                    var state = $scope.poStateList.filter(v=>v.D_NAME_CN.indexOf($scope.searchCondtion) != -1);
                    if (state.length > 0) {
                        state.forEach(d=> {
                            serach.push(["=", "pu_plan.PLAN_STATE", d.D_VALUE]);
                        })
                    }
                    $scope.searchWhere = {
                        "where": ["and", ["<>", "pu_plan.DELETED_STATE", 1], serach]
                    };
                } else {
                    $scope.searchWhere = null;
                }
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            };

            $scope.clearAll = function () {
                $scope.gridApi.selection.clearSelectedRows();
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

            function refresh(options, fn) {
                var datas = options.data;
                options.data = [];
                setTimeout(function () {
                    options.data = datas;
                    options.gridApi.grid.refresh();
                    fn();
                }, 5);
            }
            //设置样式函数
            function changeBackColor(grid, row, col, rowRenderIndex, colRenderIndex) {
                if(row.entity.PLAN_STATE==1){
                    return 'canedit'
                }else{
                    return 'unedit'
                }
            }
            //设置样式函数
            function changeBackColorOfNum(grid, row, col, rowRenderIndex, colRenderIndex) {
                if(row.entity.PLAN_STATE==1){
                    return 'red_unedit'
                }else{
                    return 'unedit_num'
                }
            }

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                refresh($scope.gridOptions, function () {
                    init(currentPage, pageSize);
                })
            }
        }]
});
