/**
 * Created by Administrator on 2017/5/18.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'css!bowerLibs/select2/css/select2',
    'css!bowerLibs/select2/css/select2-bootstrap.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/configService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/select2-directive',
    'app/common/Services/messageService'

], function () {
    return ['$scope', '$confirm', 'Notification', 'commonService', 'configService', '$q', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService', 'messageService',
        function ($scope, $confirm, Notification, commonService, configService, $q, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService, messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'ORGANISATION_NAME',
                        displayName: transervice.tran('组织'),
                        enableCellEdit: false,
                        width: 100,
                        cellClass: "unedit",
                    },
                    {
                        field: 'NOTE_CD',
                        displayName: transervice.tran('发运单/调拨单'),
                        enableCellEdit: false,
                        width: 150, cellClass: "unedit",
                    },
                    {
                        field: 'WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('接收仓库'),
                        enableCellEdit: false,
                        width: 150, cellClass: "unedit",
                    },
                    {
                        field: 'PSKU_CODE',
                        displayName: transervice.tran('SKU'),
                        enableCellEdit: false,
                        width: 100, cellClass: "unedit",
                    },
                    {
                        field: 'ACTUAL_AT1',
                        displayName: transervice.tran('收货日期'),
                        enableCellEdit: false, cellClass: "unedit",
                        width: 100,
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    },
                    {
                        field: 'SHIPMENT_NUMBER',
                        displayName: transervice.tran('发运数量'),
                        enableCellEdit: false,
                        cellClass: 'text-right unedit',
                        width: 85
                    },
                    {
                        field: 'RECEIVE_NUMBER',
                        displayName: transervice.tran('实际接收数量'),
                        enableCellEdit: false,
                        cellClass: 'text-right unedit',
                        width: 125
                    },
                    {
                        field: 'ADJUSTMENT_BEFORE',
                        displayName: transervice.tran('调整前差异'),
                        enableCellEdit: false,
                        cellClass: 'text-right unedit',
                        width: 115
                    },
                    {
                        field: 'ADJUSTMENT_NUMBER',
                        displayName: transervice.tran('已调整数量'),
                        enableCellEdit: false,
                        cellClass: 'text-right unedit',
                        width: 115
                    },
                    {
                        field: 'ADJUSTMENT_AFTER',
                        displayName: transervice.tran('调整后差异'),
                        enableCellEdit: false,
                        cellClass: 'text-right unedit',
                        width: 115
                    },
                    {
                        field: 'ADJUSTMENT_CD',
                        displayName: transervice.tran('调整单号'),
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        width: 150
                    },
                    {
                        field: 'ADJUSTMENT_NUMBER_UN',
                        displayName: transervice.tran('调整数量'),
                        enableCellEdit: true,
                        width: 125,
                        cellClass: 'text-right',
                        editableCellTemplate: '<div><form><input  formatting="false"  numeric decimals="0" max="99999999"  min="-99999999" ui-grid-editor ng-model="row.entity.ADJUSTMENT_NUMBER_UN"></form></div>',
                    },
                    {
                        field: 'PENDING_REMARKS',
                        displayName: transervice.tran('备注'),
                        enableCellEdit: true,
                        cellClass: 'text-right',
                        width: 160
                    }
                ],
                enableHorizontalScrollbar: 1,
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

            //切换页码
            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                init(pageNo, pageSize);
            };

            //模糊搜索
            $scope.search = function () {
                $scope.selectWhere = {};
                $scope.selectWhere = {
                    "isInit": 2,
                    "organization": $scope.organization,
                    "sku": $scope.sku,
                    "warehouseType": $scope.warehouseType,
                    "channel": $scope.channel,
                    "adjustment1": $scope.adjustment1,
                    "adjustment2": $scope.adjustment2,
                    "adjustment3": $scope.adjustment3,
                };
                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
            }

            function baseInit() {
                formatSearchCondition();
                $scope.adjustment2 = true;
                $scope.init();
            }

            function formatSearchCondition() {
                //当前登录用户
                $scope.userInfo = configService.getUserInfo();
                //组织下平台
                $scope.orgBchannelList = new Array();
                //用户组织
                $scope.userOrgList = new Array();
                //用户仓库
                $scope.userWarehouseList = new Array();
                //用户分类
                $scope.productTypeList = [];
                //用户sku
                $scope.productCodeList = [];
                $scope.userOrgOptions = {
                    data: $scope.userOrgList
                };
                $scope.userChannelOptions = {
                    data: $scope.orgBchannelList
                };
                $scope.userWarehouseOptions = {
                    data: $scope.userWarehouseList
                };
                $scope.userProductOptions = {
                    data: $scope.productCodeList
                };
                $scope.isAdmin = false;
                var data = $scope.userInfo.u_role_user.filter(e=>e.ROLE_INFO_ID);
                data.forEach(obj => {
                    if (obj.u_roleInfo.ROLE_TYPE_ID == 3) {
                        $scope.isAdmin = true;
                        return
                    }
                });
                getOrgList().then(function () {
                    $scope.orgList.length && $scope.orgList.forEach(v=> {
                        $scope.userOrgList.push({
                            id: v.ORGANISATION_ID,
                            text: v.ORGANISATION_NAME_CN
                        });
                        v.b_channel.length && v.b_channel.forEach(c=> {
                            $scope.orgBchannelList.push({
                                "id": c.CHANNEL_ID,
                                "text": c.CHANNEL_NAME_CN,
                                "ORGANISATION_ID": c.ORGANISATION_ID
                            });
                        });
                        v.user_warehouse.length && v.user_warehouse.forEach(w=> {
                            $scope.userWarehouseList.push({
                                "CHANNEL_ID": w.CHANNEL_ID,
                                "id": w.WAREHOUSE_ID,
                                "text": w.WAREHOUSE_NAME_CN,
                                "ORGANISATION_ID": w.ORGANISATION_ID
                            });
                        })
                    });

                    //用户小分类
                    var productTypeList = $scope.userInfo.u_user_category ? $scope.userInfo.u_user_category : [];
                    productTypeList && productTypeList.forEach(v=> {
                        if (v.p_category != null) {
                            if (v.p_category.g_product_types_1.length > 0) {
                                v.p_category.g_product_types_1.forEach(s=> {
                                    s.product && s.product.forEach(p=> {
                                        $scope.productCodeList.push({
                                            "id": p.PSKU_ID,
                                            "text": p.PSKU_CODE,
                                            "PRODUCT_TYPE_ID": p.PRODUCT_TYPE_ID
                                        })
                                    })
                                })
                            }
                        }
                    });
                    $scope.init()
                });
            }

            function getOrgList() {
                //库存组织&用户分配的组织
                return configService.getOrganisationList([4]).then(function (datas) {
                    $scope.orgList = [];
                    if (!$scope.isAdmin) {
                        datas && datas.forEach(d=> {
                            if ($scope.userInfo.u_user_organization.length > 0) {
                                var data = $scope.userInfo.u_user_organization.filter(v=>v.ORGANISATION_ID == d.ORGANISATION_ID);
                                if (data.length > 0) {
                                    $scope.orgList.push(data[0].o_organisation);
                                }
                            }
                        });
                    } else {
                        $scope.orgList = $scope.orgList.concat(datas);
                    }
                });
            };

            function searchCondition(currentPage, pageSize) {
                var searchWhere = {};
                if ($scope.selectWhere != null) {
                    searchWhere = $scope.selectWhere;
                } else {
                    searchWhere = {"isInit": 1};
                }
                searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchWhere.page = (currentPage ? currentPage : 1);
                return searchWhere;
            }

            //初始化
            $scope.init = function (currentPage, pageSize) {
                var dataSearch = searchCondition(currentPage, pageSize);
                httpService.httpHelper(httpService.webApi.api, "inventory/pendingst", "receivedifferencereport", "POST", dataSearch).then(function (datas) {
                    datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                    angular.forEach(datas.data, function (obj, index) {
                        if (obj.ACTUAL_AT) {
                            obj.ACTUAL_AT1 = obj.ACTUAL_AT * 1000;
                        }
                        obj.ADJUSTMENT_BEFORE = Number(obj.RECEIVE_NUMBER) - Number(obj.SHIPMENT_NUMBER);
                        obj.ADJUSTMENT_AFTER = Number(obj.RECEIVE_NUMBER) - Number(obj.SHIPMENT_NUMBER) + Number(obj.ADJUSTMENT_NUMBER);
                        obj.ADJUSTMENT_NUMBER_UN = 0;
                    });
                    $scope.gridOptions.data = datas.data;
                    if (!currentPage) {
                        $scope.gridOptions.paginationCurrentPage = 1;
                    }
                })
            }

            function deleteSurplus(temp) {
                delete temp['ACTUAL_AT1'];
                delete temp['ADJUSTMENT_AFTER'];
                delete temp['ADJUSTMENT_BEFORE'];
                delete temp['ADJUSTMENT_CD'];
                delete temp['CREATED_AT'];
                delete temp['CUSER_CODE'];
                delete temp['CUSER_ID'];
                delete temp['UPDATED_AT'];
                delete temp['UUSER_CODE'];
                delete temp['UUSER_ID'];
                delete temp['WAREHOUSE_NAME_CN'];
                return temp;
            }

            function getInfo(rows) {
                var modelTemp = [];
                angular.forEach(rows, function (obj, index) {
                    var temp = angular.copy(obj);
                    temp = deleteSurplus(temp);
                    modelTemp.push(temp);
                });
                return modelTemp;
            }

            //保存
            $scope.btnSave = function () {
                var rows = $scope.gridApi.rowEdit.getDirtyRows();
                var entity = rows.map(r => r.entity);
                if (rows.length <= 0) {
                    return Notification.error(messageService.error_choose_n);
                }
                var entitys = angular.copy(entity);
                //组装数据
                var modelTemp = getInfo(entitys);
                var saveRows = {batchMTC: modelTemp};
                return httpService.httpHelper(httpService.webApi.api, "inventory/pendingst", "update", "POST", saveRows).then(function (datas) {
                    afterButton(datas);
                })
            };

            function checkDifferenceAdjustment(data) {
                var msg = "";
                var PRGANISATION_CODE_TEMP = data['0'].PRGANISATION_CODE;
                var ETWAREHOUSE_CODE_TEMP = data['0'].ETWAREHOUSE_CODE;
                angular.forEach(data, function (obj, index) {
                    if (obj.ADJUSTMENT_NUMBER_UN == undefined || obj.ADJUSTMENT_NUMBER_UN == null || obj.ADJUSTMENT_NUMBER_UN == "" || obj.ADJUSTMENT_NUMBER_UN == 0) {
                        msg = "调整对象记录中调整数量为必填项!";
                    }
                    if (obj.PRGANISATION_CODE != PRGANISATION_CODE_TEMP || obj.ETWAREHOUSE_CODE != ETWAREHOUSE_CODE_TEMP) {
                        msg = "请选择同一组织同一仓库的记录进行调整!";
                    }
                });
                return msg;
            }

            //差异调整按钮
            $scope.differenceAdjustment = function (row) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length <= 0) {
                    Notification.error(transervice.tran(messageService.error_empty));
                    return;
                }
                var msg = checkDifferenceAdjustment(rows);
                if (msg != "") {
                    return Notification.error(transervice.tran(msg));
                }
                //组装数据
                var modelTemp = getInfo(rows);
                return httpService.httpHelper(httpService.webApi.api, "inventory/pendingst", "receivedifferenceadjustment", "POST", modelTemp).then(function (datas) {
                    afterButton(datas);
                })
            }

            function afterButton(datas) {
                Notification.success(transervice.tran(datas.message));
                $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                $scope.gridApi.selection.clearSelectedRows();
                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
            }

            //展开更多条件
            $scope.showMore = function (n) {
                var $this = $('.carett');
                if (n) {
                    if (!$this.hasClass('cur')) {
                        $this.addClass('cur');
                        $('#more').animate({
                            'height': 270
                        }, 200);
                    } else {
                        $this.removeClass('cur');
                        $('#more').animate({
                            'height': 0
                        }, 200);
                    }
                } else {
                    $this.removeClass('cur');
                    $('#more').animate({
                        'height': 0
                    }, 200);
                }
            }

            baseInit();
        }
    ]
})
;