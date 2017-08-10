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
    'app/common/Services/gridDefaultOptionsService',
    'bowerLibs/common/ui-bootstrap-tpls-2.5.0',
    'app/common/directives/popoverDirt',
    'app/common/Services/messageService',
    'app/purchasingCenter/purchaseOrder/controllers/purchase_edit_service',
    'app/masterCenter/product/controllers/productSKU_edit_service',
    'app/masterCenter/product/controllers/productSKU_add_service',
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', '$q', '$interval', 'gridDefaultOptionsService', 'messageService', 'purchase_edit_service', 'productSKU_edit_service',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp, transervice, uiGridConstants, $q, $interval, gridDefaultOptionsService, messageService, purchase_edit_service, productSKU_edit_service) {
            $scope.gridOptions = {
                columnDefs: [{
                    field: 'AUDIT_STATE',
                    width: 75,
                    enableCellEdit: false,
                    displayName: transervice.tran('审批状态'),
                    cellClass: 'text-center unedit',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getOrderStateName(row.entity.AUDIT_STATE)}}</div>'
                }, {
                    field: 'DORGANISATION_ID',
                    width: 110,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('需求组织'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.pu_purchase.o_organisation_o?row.entity.pu_purchase.o_organisation_o.ORGANISATION_NAME_CN:""}}</div>'
                }, {
                    field: 'PU_ORDER_CD',
                    width: 180,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('采购订单编号'),
                    //cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.editPo(row.entity)">{{row.entity.PU_ORDER_CD}}</a>'
                }, {
                    field: 'PARTNER_CONCAT',
                    width: 100,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('供应商')
                }, {
                    field: 'PSKU_CODE',
                    enableCellEdit: false, cellClass: 'unedit',
                    width: 120,
                    displayName: transervice.tran('SKU'),
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
                    field: 'FNSKU',
                    width: 110,
                    enableCellEdit: false, cellClass: 'unedit',
                    displayName: transervice.tran('FNSKU')
                }, {
                    field: 'TCHEDULING_NUMBER',
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    width: 85,
                    displayName: transervice.tran('品检数量')
                }, {
                    field: 'DELIVERY_AT',
                    width: 120,
                    displayName: transervice.tran('交货日期'),
                    type: 'date',
                    enableCellEdit: false, cellClass: 'unedit',
                    cellFilter: "date:'yyyy-MM-dd'",
                }, {
                    field: 'INSPECTION_AT',
                    width: 120,
                    displayName: transervice.tran('验货日期'),
                    cellFilter: "dirtyFilter:row:col",
                    editableCellTemplate: '<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.INSPECTION_AT"></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'INSPECTION_NAME',
                    displayName: transervice.tran('验货员'),
                    width: 85,
                    enableCellEdit: true,
                    /*cellFilter: 'gridFieldFilter:row:col',
                     editableCellTemplate: 'ui-grid/dropdownEditor',
                     editDropdownIdLabel: 'value',
                     editDropdownValueLabel: 'name',
                     enableCellEdit: true,
                     editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.INSPECTION_CODE.list",*/
                    editableCellTemplate: '<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.INSPECTION_ID"  row="row"></div></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'EACH_BOX_NUMBER',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('每箱数量'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.EACH_BOX_NUMBER"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'FCL_NUMBER',
                    width: 85,
                    enableCellEdit: false,
                    cellClass: "text-right unedit",
                    displayName: transervice.tran('整箱数')
                }, {
                    field: 'FCL_LONG',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('箱长(CM)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_LONG"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'FCL_WIDE',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('箱宽(CM)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_WIDE"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'FCL_HIGH',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('箱高(CM)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_HIGH"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'FCL_NET_WEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('净重(KG)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_NET_WEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'FCL_GROSS_WEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('毛重(KG)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.FCL_GROSS_WEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
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
                    displayName: transervice.tran('尾箱长(CM)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_LONG"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'TAILBOX_WIDE',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱宽(CM)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_WIDE"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'TAILBOX_HIGH',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱高(CM)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_HIGH"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'TAILBOX_WEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱净重(KG)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_WEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'TAILBOX_NETWEIGHT',
                    width: 85,
                    enableCellEdit: true,
                    displayName: transervice.tran('尾箱毛重(KG)'),
                    editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="4" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.TAILBOX_NETWEIGHT"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColorRight
                }, {
                    field: 'INSPECTION_STATE',
                    displayName: transervice.tran('验货状态'),
                    width: 75,
                    cellFilter: 'gridFieldFilter:row:col',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel: 'value',
                    editDropdownValueLabel: 'name',
                    enableCellEdit: true,
                    editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.INSPECTION_STATE.list",
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
                    },
                    cellClass: changeBackColor
                }, {
                    field: 'QCTABLES_REMARKS',
                    width: 150,
                    enableCellEdit: true,
                    displayName: transervice.tran('备注'),
                    editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.QCTABLES_REMARKS"></form></div>',
                    cellEditableCondition: function ($scope) {
                        return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 2;
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
                        //编辑平台
                        if (colDef.field == "EACH_BOX_NUMBER") {
                            if (newValue == null || newValue == "" || newValue == undefined || newValue == 0) {
                                rowEntity.FCL_NUMBER = 0;
                                rowEntity.TAILBOX_BNUMBER = 0;
                                rowEntity.TAILBOX_NUMBER = 0;
                            } else {
                                rowEntity.FCL_NUMBER = Math.floor(rowEntity.TCHEDULING_NUMBER / newValue);
                                rowEntity.TAILBOX_BNUMBER = rowEntity.TCHEDULING_NUMBER - (rowEntity.FCL_NUMBER * newValue);
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

            $scope.refreshSKU=function () {
                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
            }

            //设置样式函数 偏右
            function changeBackColorRight(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (row.entity.AUDIT_STATE == 1) {
                    return 'canedit text-right'
                } else {
                    return 'unedit text-right'
                }
            }

            //设置样式函数 居中
            function changeBackColor(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (row.entity.AUDIT_STATE == 1) {
                    return 'canedit'
                } else {
                    return 'unedit'
                }
            }

            function refresh() {
                var datas = $scope.gridOptions.data;
                $scope.gridOptions.data = [];
                setTimeout(function () {
                    $scope.gridOptions.data = datas;
                    $scope.gridOptions.gridApi.grid.refresh();
                }, 10)
            }

            $scope.dicOptions = {
                filter: "contains",
                autoBind: true,
                dataTextField: "STAFF_NAME_CN",
                dataValueField: "USER_INFO_ID",
                optionLabel: "请选择",
                table:"u_user_info",
                url: httpService.webApi.api + "/users/userinfo/index",
                search: {
                    select: ['staff.STAFF_NAME_CN', 'u_user_info.*'],
                    joinwith: ['u_staffinfo2'],
                    distinct: 1
                },
                o_change: $scope.selectRowChange,
            };

            $scope.selectRowChange = function (row) {
                // $scope.gridApi.core.getVisibleRows()
                if (row) {
                    $scope.gridApi.rowEdit.setRowsDirty([row.entity]);
                    $scope.gridApi.grid.refresh();
                    var model = row.selectModel;
                    row.entity.INSPECTION_NAME = model.STAFF_NAME_CN;
                    //row.entity.INSPECTION_ID=model.INSPECTION_ID;
                }
            }

            $scope.dicOptions.o_change = $scope.selectRowChange;

            //订单状态
            $scope.orderStates = commonService.getDicList("PU_PURCHASE"); //其中"PRODUCT_SKU"是字典表里的分组名
            $scope.inspectStates = commonService.getDicList("INSPECTION_STATE"); //其中"INSPECTION_STATE"是字典表里的分组名

            //模糊搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                var timeFrom = angular.copy($scope.timeFrom);
                var timeTo = angular.copy($scope.timeTo);
                if (timeFrom != "" && timeFrom != null && timeTo != "" && timeTo != null) {
                    timeFrom = new Date(timeFrom.replace(/-/g, '/')).getTime();
                    timeTo = new Date(timeTo.replace(/-/g, '/')).getTime();
                    if (timeFrom > timeTo) {
                        return Notification.error(transervice.tran("起始日期不能大于结束日期"));
                    }
                }
                $scope.init();
            }

            $scope.rowEntity = {
                "fieldDataObjectMap": {}
            }
            $scope.rowEntity.fieldDataObjectMap['INSPECTION_STATE'] = {
                "list": $scope.inspectStates
            };
            $scope.searchPartner = "";
            $scope.partnerS = {
                transport: {
                    read: {
                        type: "POST",
                        url: httpService.webApi.api + "/master/partint/partner/index",
                        dataType: "json"
                    },
                    parameterMap: function (options, operation) {
                        //用户列表的显示，包括查询
                        var search = {
                            "where": ["and", ["<>", "PARTNER_STATE", 0]],
                            "orderby": "PARTNER_ID asc",
                            "limit": 0
                        };
                        if (options.filter && options.filter.filters) {
                            search = commonService.getFilter(search, options.filter.filters, options.filter.logic);
                        }
                        return search;
                    }
                },
                schema: {
                    data: function (d) {
                        var list = new Array();
                        angular.forEach(d.data, function (obj) {
                            list.push({
                                "D_NAME_CN": obj.PARTNER_ID + "_" + obj.PARTNER_ANAME_CN,
                                "D_VALUE": obj.PARTNER_ID
                            });
                        });
                        return list; //响应到页面的数据
                    }
                },
                error: httpService.kendoErr,
                serverFiltering: false,
            };

            $scope.partnerModel = {
                filter: "contains",
                autoBind: false,
                optionLabel: "请选择",
                dataSource: $scope.partnerS,
                dataTextField: "D_NAME_CN",
                dataValueField: "D_VALUE",
                serverFiltering: true,
            };

            $scope.searchAudit = "0";
            $scope.searchInspection = "0";
            $scope.timeFrom = $filter("date")((new Date().valueOf() - (90 * 24 * 3600 * 1000)), "yyyy-MM-dd");
            $scope.timeTo = $filter("date")((new Date().valueOf() + (90 * 24 * 3600 * 1000)), "yyyy-MM-dd");
            $scope.init = function (currentPage, pageSize) {
                var selectWhere = {
                    "where": ["<>", "pu_qctables.DELETED_STATE", 1],
                    "joinwith": ['pu_purchase', 'pu_purchase_detail', 'u_userinfo_uic'],
                    "orderby": "pu_qctables.AUDIT_STATE asc,pu_qctables.UPDATED_AT desc",
                    "distinct": true,
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                var andFW = new Array("and");
                if ($scope.searchAudit != null && $scope.searchAudit != "" && $scope.searchAudit != undefined && $scope.searchAudit != 0) { //审核
                    andFW.push(["=", "pu_qctables.AUDIT_STATE", $scope.searchAudit])
                }
                if ($scope.searchInspection != null && $scope.searchInspection != "" && $scope.searchInspection != undefined && $scope.searchInspection != 0) { //未验货
                    andFW.push(["=", "pu_qctables.INSPECTION_STATE", $scope.searchInspection])
                }
                if ($scope.searchPartner != "" && $scope.searchPartner != null && $scope.searchPartner != undefined) { //供应商
                    andFW.push(["=", "pu_purchase.PARTNER_ID", $scope.searchPartner])
                }
                if ($scope.timeFrom != "" && $scope.timeFrom != null) {
                    var timeFrom = angular.copy($scope.timeFrom);
                    timeFrom = new Date(timeFrom.replace(/-/g, '/')).getTime();
                    timeFrom = Math.round((timeFrom).valueOf() / 1000);
                    andFW.push([">=", "pu_qctables.DELIVERY_AT", timeFrom])
                }
                if ($scope.timeTo != "" && $scope.timeTo != null) {
                    var timeTo = angular.copy($scope.timeTo);
                    timeTo = new Date(timeTo.replace(/-/g, '/')).getTime();
                    timeTo = Math.round((timeTo).valueOf() / 1000);
                    andFW.push(["<=", "pu_qctables.DELIVERY_AT", timeTo])
                }
                if (andFW.length > 1) {
                    selectWhere["andFilterWhere"] = andFW;
                }
                return httpService.httpHelper(httpService.webApi.api, "purchase/qctables", "index?page=" + (currentPage ? currentPage : 1), "POST", selectWhere).then(
                    function (result) {
                        result._meta.totalCount * 1 && ($scope.gridOptions.totalItems = result._meta.totalCount);
                        var data = result.data;
                        //$scope.gridOptions.data = [];
                        data.forEach(d => {
                            d.DELIVERY_AT = $filter("date")(d.DELIVERY_AT * 1000, "yyyy-MM-dd");
                            if (d.INSPECTION_AT == "" || d.INSPECTION_AT == null || d.INSPECTION_AT == undefined || d.INSPECTION_AT == 0) {
                                d.INSPECTION_AT = $filter("date")(new Date().valueOf(), "yyyy-MM-dd");
                            } else {
                                d.INSPECTION_AT = $filter("date")(d.INSPECTION_AT * 1000, "yyyy-MM-dd");
                            }
                            if (d.pu_purchase) {
                                if(d.pu_purchase.pa_partner){
                                    d.PARTNER_CONCAT = d.pu_purchase.pa_partner.PARTNER_CODE + "_" + d.pu_purchase.pa_partner.PARTNER_ANAME_CN;
                                }
                            }
                            if (d.pu_purchase_detail) {
                                d.FNSKU = d.pu_purchase_detail.FNSKU;
                            }
                            d.rowEntity = $scope.rowEntity;

                            //初始化sku控件
                            d.options = angular.copy($scope.dicOptions);
                            d.options.value = d.INSPECTION_ID;
                            d.options.search.andwhere = ["=", "u_user_info.USER_INFO_ID", d.INSPECTION_ID];
                            if (d.u_userinfo_uic) {
                                d.INSPECTION_NAME = d.u_userinfo_uic.STAFF_NAME_CN;
                            }
                            d.index = $scope.gridOptions.data.length;
                            d.copyObject = angular.copy(d);
                        });
                        $scope.gridOptions.data = data;
                        //$scope.gridApi.grid.refresh();
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                        if ($scope.gridApi.selection.getSelectedRows().length) {
                            $scope.clearAll();
                        }
                    });
            };
            $scope.init();

            //导出
            $scope.export = function () {
                var form = $("<form>"); //定义一个form表单
                form.attr("style", "display:none");
                form.attr("target", "");
                form.attr("method", "post");
                var input1 = $("<input>");
                input1.attr("type", "hidden");
                input1.attr("name", "searchInspection"); //验货状态
                input1.attr("value", $scope.searchInspection);
                form.append(input1);
                var input2 = $("<input>");
                input2.attr("type", "hidden");
                input2.attr("name", "searchAudit"); //审核状态
                input2.attr("value", $scope.searchAudit);
                form.append(input2);
                var input3 = $("<input>");
                input3.attr("type", "hidden");
                input3.attr("name", "searchPartner"); //供应商
                input3.attr("value", $scope.searchPartner);
                form.append(input3);
                var input4 = $("<input>");
                input4.attr("type", "hidden");
                input4.attr("name", "timeFrom"); //交货日期起始
                var timeFrom = angular.copy($scope.timeFrom);
                if (timeFrom != "" && timeFrom != null) {
                    timeFrom = new Date(timeFrom.replace(/-/g, '/')).getTime();
                    timeFrom = Math.round((timeFrom).valueOf() / 1000) + (24 * 3600);
                } else {
                    timeFrom = "";
                }
                input4.attr("value", timeFrom);
                form.append(input4);
                var input5 = $("<input>");
                input5.attr("type", "hidden");
                input5.attr("name", "timeTo"); //交货日期结束
                var timeTo = angular.copy($scope.timeTo);
                if (timeTo != "" && timeTo != null) {
                    timeTo = new Date(timeTo.replace(/-/g, '/')).getTime();
                    timeTo = Math.round((timeTo).valueOf() / 1000) + (24 * 3600);
                } else {
                    timeTo = "";
                }
                input5.attr("value", timeTo);
                form.append(input5);
                form.attr("action", httpService.webApi.api + "/purchase/pinspect/exportpi");
                $("body").append(form); //将表单放置在web中
                form.submit(); //表单提交
            }

            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x * 100) / 100;
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

            //获取采购订单审核状态名称
            $scope.getOrderStateName = function (state) {
                var states = $scope.orderStates.filter(o => o.D_VALUE == state);
                if (states.length) {
                    return states[0].D_NAME_CN;
                }
            }
            //获取验货审核状态名称
            $scope.getInspectStateName = function (state) {
                var states = $scope.inspectStates.filter(o => o.D_VALUE == state);
                if (states.length) {
                    return states[0].D_NAME_CN;
                }
            }

            //删除多余数据
            function deleteSurplus(modelTemp) {
                angular.forEach(modelTemp,function(obj,index){
                    delete obj['copyModel'];
                    delete obj['copyObject'];
                    delete obj['index'];
                    delete obj['options'];
                    delete obj['u_userinfo_uic'];
                });
                return modelTemp;
            }

            //保存
            $scope.save = function () {
                var filedList = [];
                $scope.gridOptions.columnDefs.forEach(d=> {
                    if (d.field && d.enableCellEdit) {
                        filedList.push(d.field);
                    }
                });
                filedList.push("QCTABLES_ID");
                var drityData = gridDefaultOptionsService.getDirtyRows(angular.copy($scope.gridOptions.data), filedList, "QCTABLES_ID");
                if (drityData.length <= 0) {
                    return Notification.error(transervice.tran(messageService.error_choose_n));
                }
                var errorMsg = "";
                var entitys = angular.copy(drityData);
                entitys.forEach(value => {
                    if (value.AUDIT_STATE == 2) {
                        errorMsg = transervice.tran(messageService.error_audit_a);
                    }
                    value = $scope.formatData(value);
                });
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                entitys = deleteSurplus(entitys);
                var saveData = {
                    batchMTC: entitys
                };
                return httpService.httpHelper(httpService.webApi.api, "purchase/qctables", "update", "POST", saveData).then(function (datas) {
                    Notification.success(datas.message);
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    $scope.init();
                })
            };

            //删除
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var data = [];
                //var myArray = [];
                for (var i = 0; i < rows.length; i++) {
                    var obj = rows[i];
                    if (obj.AUDIT_STATE == 2) {
                        Notification.error(transervice.tran(messageService.error_audit_a));
                        return;
                    } else {
                        data.push(obj.QCTABLES_ID);
                    }
                }
                return $confirm({
                    text: transervice.tran(messageService.confirm_del)
                }).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "purchase/pinspect", "pidel", "POST", data).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        $scope.init();
                    });
                });
            };
            //审核
            $scope.batchAudit = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var data = [];
                //var myArray = [];
                for (var i = 0; i < rows.length; i++) {
                    var obj1 = rows[i];
                    var obj = angular.copy(obj1);
                    if (obj.AUDIT_STATE == 2) {
                        Notification.error(transervice.tran(messageService.error_audit_a));
                        return;
                    } else if (obj.INSPECTION_ID == "" || obj.INSPECTION_ID == null || obj.INSPECTION_ID == undefined) {
                        Notification.error(transervice.tran('选择的数据中验货员不能为空，请重新选择!'));
                        return;
                    } else if (obj.INSPECTION_AT == "" || obj.INSPECTION_AT == null || obj.INSPECTION_AT == undefined) {
                        Notification.error(transervice.tran('选择的数据中验货日期不能为空，请重新选择!'));
                        return;
                    } else if (obj.INSPECTION_STATE == "" || obj.INSPECTION_STATE == null || obj.INSPECTION_STATE == undefined) {
                        Notification.error(transervice.tran('选择的数据中验货状态不能为空，请重新选择!'));
                        return;
                    } else if (obj.INSPECTION_STATE === "3") {
                        Notification.error(transervice.tran('选择的数据不能含未验货，请重新选择!'));
                        return;
                    } else {
                        obj.ORDER_STATE = 2;
                        obj = $scope.formatData(obj);
                        data.push(obj);
                    }
                }
                data = deleteSurplus(data);
                var updateData = {"batchMTC": data}
                return $confirm({
                    text: transervice.tran(messageService.confirm_audit)
                }).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "purchase/pinspect", "piaudit", "POST", updateData).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        $scope.init();
                    });
                });
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

            $scope.formatData = function (obj) {
                obj.DELIVERY_AT = $scope.formatDate(obj.DELIVERY_AT);
                obj.INSPECTION_AT = $scope.formatDate(obj.INSPECTION_AT);
                delete obj['pu_purchase'];
                delete obj['pu_purchase_detail'];
                delete obj['rowEntity'];
                delete obj['CREATED_AT'];
                delete obj['CUSER_ID'];
                delete obj['UUSER_ID'];
                delete obj['UPDATED_AT'];
                return obj;
            }

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
                    if (obj.AUDIT_STATE != 2) {
                        Notification.error(transervice.tran(messageService.error_audit_n));
                        return;
                    } else {
                        data.push(obj.QCTABLES_ID);
                    }
                }
                data = deleteSurplus(data);
                return $confirm({
                    text: transervice.tran(messageService.confirm_audit_f)
                }).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "purchase/pinspect", "pireaudit", "POST", data).then(function (datas) {
                        Notification.success(datas.message);
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        $scope.init();
                    });
                });
            };

            $scope.clearAll = function () {
                $scope.gridApi.selection.clearSelectedRows();
            };

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }
        }
    ]
});