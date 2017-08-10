/**
 * Created by Fable on 2017/6/15.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/gridDefaultOptionsService',
    "app/inventoryCenter/pskdelivery/controllers/pskdeliveryDialogService",

    "app/inventoryCenter/skallocation/controllers/skallocationEditService",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/dialogPopupDirt',
    'app/common/Services/messageService',
    'app/common/Services/configService',
    "app/inventoryCenter/skallocation/controllers/goodsRejectedService"

],function(){
    return ['$scope', '$confirm', 'Notification','skallocationEditService', 'commonService', 'httpService', '$filter', 'transervice','$q','gridDefaultOptionsService','pskdeliveryDialogService',
        function($scope,$confirm,Notification,skallocationEditService,commonService,httpService,$filter,transervice,$q,gridDefaultOptionsService,pskdeliveryDialogService){

            var selectFialls = new  Array();

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'o_organisation.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('组织'),
                        enableCellEdit: false
                    },
                    {
                        field: 'ALLOCATION_ID',
                        displayName: transervice.tran('调拨计划单号'),
                        enableCellEdit: false,
                        width:160,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.openAllDetail(row.entity)">{{row.entity.sk_allocation.ALLOCATION_CD}}</a>'
                    },
                    {
                        field: 'PLAN_AT',
                        displayName: transervice.tran('计划调拨日期'),
                        enableCellEdit: false
                    },
                    {
                        field: 'ACTUAL_AT',
                        displayName: transervice.tran('实际调拨日期'),
                        enableCellEdit: false
                    },
                    {
                        field: 'PSKU_CODE',
                        displayName: transervice.tran('SKU'),
                        enableCellEdit: false
                    },
                    {
                        field: 'TDRODUCT_DE',
                        displayName: transervice.tran('产品描述'),
                        enableCellEdit: false
                    },
                    {
                        field: 'SHIPMENT_NUMBER',
                        displayName: transervice.tran('计划调拨数量'),
                        cellClass:'text-right',
                        enableCellEdit: false
                    },
                    {
                        field: 'RECEIVE_NUMBER',
                        displayName: transervice.tran('实际调拨数量'),
                        cellClass:'text-right',
                        editableCellTemplate: '<div><input type="text" numeric decimals="0" max="9999999999" min="0"   ui-grid-editor ng-model="row.entity.RECEIVE_NUMBER"></div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE != 1;
                        }
                    },
                    {
                        field: 'e_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('调出仓库'),
                        enableCellEdit: false
                    },
                    {
                        field: 'i_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('调入仓库'),
                        enableCellEdit: false
                    },
                    {
                        field: 'PLAN_STATE',
                        displayName: transervice.tran('状态'),
                        enableCellEdit: false,
                        cellTemplate: '<span ng-if="row.entity.PLAN_STATE==0">待出库</span>' +
                        '<span ng-if="row.entity.PLAN_STATE==1">已出库</span>'
                    },
                    {
                        field: 'u_user_info.u_staff_info.STAFF_NAME_CN',
                        displayName: transervice.tran('经手人'),
                        enableCellEdit: false
                    },
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

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //初始化
            function init() {

                if ($scope.searchCondtion == undefined || $scope.searchCondtion == null) {
                    $scope.searchCondtion = "";
                }
                var dataSearch = {
                    "where": ["or", ["like", "o_organisation.ORGANISATION_NAME_CN", $scope.searchCondtion],
                        ["like", "a.WAREHOUSE_NAME_CN", $scope.searchCondtion],
                        ["like", "e.WAREHOUSE_NAME_CN", $scope.searchCondtion],
                        ["like", "sk_pending_delivery.ALLOCATION_ID", $scope.searchCondtion],
                        ["like", "sk_allocation.ALLOCATION_CD", $scope.searchCondtion],
                    ],
                    //"andwhere":["and",['=','sk_pending_delivery.OUTBOUND_TYPE',2]],
                    "joinWith": ["o_organisation", "a_warehouse as a","e_warehouse as e","u_user_info",'sk_allocation'],
                    'limit': $scope.gridOptions.paginationPageSize,
                    "orderby":"sk_pending_delivery.PLAN_STATE asc,sk_pending_delivery.CREATED_AT desc",
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/pendingde", "index?page=" + $scope.gridOptions.paginationCurrentPage, "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if (datas._meta.totalCount) {
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function (obj, index) {
                            obj.PLAN_AT = $filter("date")(new Date(parseInt(obj.PLAN_AT) * 1000), "yyyy-MM-dd");
                            if(obj.ACTUAL_AT == null)
                                obj.ACTUAL_AT = '';
                            else
                                obj.ACTUAL_AT = $filter("date")(new Date(parseInt(obj.ACTUAL_AT) * 1000), "yyyy-MM-dd");

                            if(obj.RECEIVE_NUMBER==0)
                                obj.RECEIVE_NUMBER = obj.SHIPMENT_NUMBER;

                        });
                        $scope.gridOptions.data = datas.data;
                    }
                })
            }

            //初始化
            init();

            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                init();
            }

            //确认出库按钮
            $scope.palcing = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();

                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择需要操作的数据'));
                }

                var keepGoing = true;
                var checkHAVE_RECEIVE = true;

                var diff_organization = "",
                    diff_atwarehouse = "",
                    diff_etwarehouse = "",
                    is_same_organization = true,
                    is_same_atwarehouse = true,
                    is_same_etwarehouse = true,
                    is_actual_output = true;

                angular.forEach(rows, function (obj, index) {
                    if (keepGoing) {
                        if (obj.PLAN_STATE == 1) {
                            keepGoing = false;
                        }
                    }
                    if(obj.PRGANISATION_ID!=diff_organization && diff_organization){
                        is_same_organization = false;
                    }
                    if(obj.ATWAREHOUSE_ID != diff_atwarehouse && diff_atwarehouse){
                        is_same_atwarehouse = false;
                    }
                    if(obj.ETWAREHOUSE_ID != diff_etwarehouse && diff_etwarehouse){
                        is_same_etwarehouse = false;
                    }

                    diff_organization = obj.PRGANISATION_ID;
                    diff_atwarehouse = obj.ATWAREHOUSE_ID;
                    diff_etwarehouse = obj.ETWAREHOUSE_ID;
                });

                if (!keepGoing) {
                    return Notification.error(transervice.tran('已出库单据不能操作'));
                }

                if(is_same_organization == false){
                    return Notification.error(transervice.tran('选中的记录组织必须一致'));
                }

                if(is_same_atwarehouse == false){
                    return Notification.error(transervice.tran('选中的记录调出仓必须一致'));
                }

                if(is_same_etwarehouse == false){
                    return Notification.error(transervice.tran('选中的记录调入仓必须一致'));
                }

                var handledata = angular.copy(rows);
                angular.forEach(handledata, function (obj, index) {
                    var formatDate_PLAN_AT = new Date(obj.PLAN_AT.replace(/-/g, '/')).getTime();
                    obj.PLAN_AT = Math.round(formatDate_PLAN_AT / 1000);
                    if(obj.ACTUAL_AT){
                        var formatDate_ACTUAL_AT = new Date(obj.ACTUAL_AT.replace(/-/g, '/')).getTime();
                        obj.ACTUAL_AT = Math.round(formatDate_ACTUAL_AT / 1000);
                    }
                    //清除不需要更新的信息
                    delete obj.a_warehouse;
                    delete obj.e_warehouse;
                    delete obj.o_organisation;
                    delete obj.sk_allocation;
                    delete obj.u_user_info;
                });

                //校验库存是否足够
                var checkData = {
                    'batchMTC':handledata
                };

                //先保存数据
                httpService.httpHelper(httpService.webApi.api, "inventory/pendingde", "update", "POST", checkData).then(function (datas) {

                    var sku_arr = new Object();

                    angular.forEach(handledata, function (obj1, objIndex1) {
                        var sku = new Object();
                        sku['PSKU_ID'] = obj1.PSKU_ID;
                        sku['PSKU_CODE'] = obj1.PSKU_CODE;
                        sku['NUMBER'] = (-1) * obj1.RECEIVE_NUMBER;
                        sku['WAREHOUSE_ID'] = obj1.ETWAREHOUSE_ID;
                        sku_arr[objIndex1] = sku;
                    });

                    httpService.httpHelper(httpService.webApi.api, "inventory/placing", "checkskuinventory", "POST", sku_arr).then(function (datas) {
                        if(datas.data.flag == false) {
                            $confirm({ text: transervice.tran('选择的'+datas.data.sku+'库存不足，是否继续操作？') }).then(function () {
                                showDeliveryDialog(handledata);
                            });
                        }else{
                            showDeliveryDialog(handledata);
                        }
                    });
                });

                return false;
            };

            //搜索
            $scope.search = function(){
                init();
            };

            function showDeliveryDialog(datas){
                pskdeliveryDialogService.showDialog(datas).then(function(result){
                    init();
                });
            }


            //查看调拨计划详情
            $scope.openAllDetail = function(item){

                var dataSearch = {
                    "where":['and',
                        "sk_allocation.ALLOCATION_ID="+item.ALLOCATION_ID,
                        ],
                    "joinWith":["sk_allocation_detail","u_userinfoc"],
                    "distinct":true
                };
                var _index = $.inArray(item,$scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList = $scope.gridOptions.data.map(obj=>obj.ALLOCATION_ID);
                httpService.httpHelper(httpService.webApi.api, "inventory/allocation","view" , "POST", dataSearch).then(function (datas) {
                    if(datas.data.ESTIMATEDA_AT&&datas.data.ESTIMATED_AT){
                        datas.data.ESTIMATEDA_AT = $filter("date")(new Date(parseInt(datas.data.ESTIMATEDA_AT)*1000), "yyyy-MM-dd");
                        datas.data.ESTIMATED_AT = $filter("date")(new Date(parseInt(datas.data.ESTIMATED_AT)*1000), "yyyy-MM-dd");
                    }
                    skallocationEditService.showDialog(datas.data,_index,$scope.gridOptions.data.length,idList).then(function(data){
                        init();
                    });
                });
            };

            //取消出库
            $scope.cancelinven =function(){
                var rows = $scope.gridApi.selection.getSelectedRows();

                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择需要操作的数据'));
                }
                if(rows.length>1){
                    return Notification.error(transervice.tran('取消入库只能操作一条数据'));
                }

                var keepGoing = true;
                var saveData = new Array();

                angular.forEach(rows, function (obj, index) {
                    if (keepGoing) {
                        if (obj.PLAN_STATE != 1) {
                            keepGoing = false;
                        }
                    }
                    saveData.push(obj);
                });

                if (!keepGoing) {
                    return   Notification.error(transervice.tran('已出库单据才能操作'));
                }

                var DataRows={batchMTC:saveData,flag:true};

                httpService.httpHelper(httpService.webApi.api, "inventory/pendingde", "cancelinventory", "POST", DataRows).then(function (datas) {
                    Notification.success(transervice.tran(datas.message));
                    init();
                })

            };
        }]
});