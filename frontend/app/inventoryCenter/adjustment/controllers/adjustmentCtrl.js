/**
 * Created by Administrator on 2017/5/18.
 */
define([
    "app/inventoryCenter/adjustment/controllers/adjustmentAddService",
    "app/inventoryCenter/adjustment/controllers/adjustmentEditService",
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'

], function () {
    return ['$scope', '$confirm', 'Notification', 'commonService', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService', 'adjustmentAddService', 'adjustmentEditService','messageService',
        function ($scope, $confirm, Notification, commonService, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService, adjustmentAddService, adjustmentEditService,messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'o_organisation.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('组织'),
                        enableCellEdit: false
                    },
                    {
                        field: 'ADJUSTMENT_CD',
                        displayName: transervice.tran('库存调整单号'),
                        enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.ADJUSTMENT_CD}}</a>'
                    },
                    {field: 'ADJUSTMENT_AT', displayName: transervice.tran('调整日期'), enableCellEdit: false},
                    {
                        field: 'b_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('调整仓库'),
                        enableCellEdit: false
                    },
                    {
                        field: 'PLAN_STATE',
                        displayName: transervice.tran('单据状态'),
                        enableCellEdit: false,
                        cellTemplate: '<span ng-if="row.entity.PLAN_STATE==2">已审核</span>' +
                        '<span ng-if="row.entity.PLAN_STATE==1">未审核</span>'
                    }

                ],

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {

                        }
                    });
                }
            };


            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //初始化
            function init() {

                if ($scope.searchCondtion == undefined || $scope.searchCondtion == null) {
                    $scope.searchCondtion = "";
                }
                var dataSearch = {
                        "where": ["and", ["or", ["like", "o_organisation.ORGANISATION_NAME_CN", $scope.searchCondtion],
                        ["like", "b_warehouse.WAREHOUSE_NAME_CN", $scope.searchCondtion],
                        ["like", "sk_adjustment.ADJUSTMENT_CD", $scope.searchCondtion]
                    ],
                        ['=','DELETED_STATE',0]
                        ],
                    "joinWith": ["o_organisation", "b_warehouse","u_user_info"],
                    'limit': $scope.gridOptions.paginationPageSize,
                    "orderby":"sk_adjustment.PLAN_STATE asc,sk_adjustment.CREATED_AT desc",
                    "distinct":true
                };


                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "index?page=" + $scope.gridOptions.paginationCurrentPage, "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];

                    if (datas._meta.totalCount) {

                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function (obj, index) {
                            obj.ADJUSTMENT_AT = $filter("date")(new Date(parseInt(obj.ADJUSTMENT_AT) * 1000), "yyyy-MM-dd");
                        });

                        $scope.gridOptions.data = datas.data;

                    }
                })
            }

            //初始化
            init();

            //搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }
            //新增
            $scope.add = function () {
                var item=new Object();
                item.organisation_list = organisation_list;
                adjustmentAddService.showDialog(item).then(function (data) {
                    init();
                });
            };
            //编辑页面
            $scope.openDetail = function (item) {
                var _index = $.inArray(item,$scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList = $scope.gridOptions.data.map(obj=>obj.ADJUSTMENT_ID);
                item['organisation_list'] = organisation_list;
                adjustmentEditService.showDialog(item,_index,$scope.gridOptions.data.length,idList).then(function (data) {
                    init();
                });
            };

            //初始化组织架构数据
            var dataSearch = {
                "where": ["and", ["=", "o_organisation_relation_middle.ENTITY_STATE", 1],
                    ["=", "o_organisation_relation_middle.FUNCTION_ID", 4]],
                "joinwith": ["o_organisationt"]
            };
            var organisation_list = new Array();
            httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                organisation_list = datas.data;
            });


            //审核
            $scope.auth = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择要操作的数据'));
                }

                //校验会计期间和SKU库存que
                var searchData = new Array();

                var keepGo = true;
                angular.forEach(rows, function (obj, index) {
                    if (obj.PLAN_STATE == 2) {
                        keepGo = false;
                    }
                    var arr = new Object();
                    var formatDate = new Date(obj.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                    var adjustAt = Math.round(formatDate / 1000);
                    arr["ORGANISATION_ID"] = obj.ORGANISATION_ID;
                    arr["ADJUSTMENT_AT"] = adjustAt;
                    arr["ADJUSTMENT_ID"] = obj.ADJUSTMENT_ID;
                    arr["ADJUSTMENT_CD"] = obj.ADJUSTMENT_CD;
                    arr['planState'] = 1;
                    arr['authFlag'] = 1;

                    searchData.push(arr);
                });

                if (!keepGo) {
                    return Notification.error(transervice.tran('已审核的单据不能再审'));
                }
                //确认审核
                confirmAuth(searchData, rows, 2, 1);

            };

            /**
             * 确认审核
             * @param arr
             */
            function confirmAuth(searchData, rows, planState, authFlag) {

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "checkadjustment", "POST", searchData).then(function (datas) {
                    if(datas.data.flag == false) {
                        $confirm({ text: transervice.tran('选择的'+datas.data.sku+'库存不足，是否继续操作？') }).then(function () {
                            //更新单据状态
                            updateAdjustState(rows,planState, authFlag);
                        });
                    } else {
                        updateAdjustState(rows,planState, authFlag);                    }
                });
            }

            //反审核
            $scope.resetAuth = function () {

                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择要操作的数据'));
                }
                var keepGo = true;
                //校验SKU库存
                var searchData = new Array();
                angular.forEach(rows, function (obj, index) {
                    if (obj.PLAN_STATE != 2) {
                        keepGo = false;
                    }
                    var arr = new Object();
                    var formatDate = new Date(obj.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                    var placingAt = Math.round(formatDate / 1000);

                    arr["ORGANISATION_ID"] = obj.ORGANISATION_ID;
                    arr["ADJUSTMENT_AT"] = placingAt;
                    arr["ADJUSTMENT_ID"] = obj.ADJUSTMENT_ID;
                    arr["ADJUSTMENT_CD"] = obj.ADJUSTMENT_CD;
                    arr['planState'] = 0;
                    arr['authFlag'] = 2;

                    searchData.push(arr);
                });

                if (!keepGo) {
                    return Notification.error(transervice.tran('未审核的单据不能反审核'));
                }

                //确认反审核
                confirmAuth(searchData, rows, 1, 2);
            };


            $scope.gridOptions.getGridApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };

            //删除方法
            $scope.del = function (){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                //审核的不能删除
                var keepGoing = true;
                angular.forEach(rows, function (obj, index) {
                    if (obj.PLAN_STATE == 2) {
                        keepGoing = false;
                    }
                });

                if (!keepGoing) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }

                $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                    var delArray = new Array();
                    var copy_rows = angular.copy(rows);
                    angular.forEach(copy_rows, function (obj, index) {
                        obj.PRGANISATION_ID = obj.PRGANISATION_ID;
                        obj.AWAREHOUSE_ID = obj.AWAREHOUSE_ID;
                        obj.ADJUSTMENT_REASON = obj.ADJUSTMENT_REASON;
                        var formatDate = new Date(obj.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                        obj.ADJUSTMENT_AT =Math.round(formatDate / 1000);
                        obj.DELETED_STATE = 1;
                        obj.ADJUSTMENT_ID = obj.ADJUSTMENT_ID;
                        obj.ADJUSTMENT_CD = obj.ADJUSTMENT_CD;

                        //清除不需要更新的信息
                        delete obj.b_warehouse;
                        delete obj.o_organisation;
                        delete obj.sk_adjustment_detail;
                        delete obj.u_user_info;
                        delete obj.organisation_list;
                        delArray.push(obj);
                    });
                    var updateRows = {
                        "batch": delArray
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "deleteadj", "POST", updateRows).then(function (datas) {
                        Notification.success(transervice.tran(datas.message));
                        init();
                    });
                });

            }

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                init();
            }

            //更新出库单状态
            function updateAdjustState(rows, planState, authFlag) {

                //获取当前登陆人信息
                var USERINFO = localStorage.getItem('USERINFO');
                USERINFO = angular.fromJson(USERINFO);

                var updateData = angular.copy(rows);

                angular.forEach(updateData, function (obj, index) {
                    obj.PLAN_STATE = planState;
                    obj.authFlag = authFlag;
                    var formatDate = new Date(obj.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                    obj.ADJUSTMENT_AT = Math.round(formatDate / 1000);
                    obj.AUTITO_AT =  Math.round(new Date().getTime() / 1000);

                    //清除不需要更新的信息
                    delete obj.b_warehouse;
                    delete obj.o_organisation;
                    delete obj.sk_adjustment_detail;

                });
                var dataSearch = {
                    "batchMTC": updateData
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "update", "POST", dataSearch).then(function (datas) {

                    Notification.success(transervice.tran(datas.message));
                    init();

                })
            }
        }]
});
