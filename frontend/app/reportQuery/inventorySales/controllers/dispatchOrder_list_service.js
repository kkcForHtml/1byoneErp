/**
 * Created by Administrator on 2017/6/16.
 */
/**
 * Created by Administrator on 2017/6/16.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/gridDefaultOptionsService',
        'app/reportQuery/inventorySales/controllers/dispatch_query_service',
        'app/inventoryCenter/skallocation/controllers/skallocationEditService',
        "app/inventoryCenter/skallocation/controllers/goodsRejectedService"

    ],
    function (angularAMD) {

        angularAMD.service(
            'dispatchOrder_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "dispatchOrderListCtrl",
                            backdrop: "static",
                            size: "65%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/reportQuery/inventorySales/views/dispatchOrder_list_service.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }

                            }
                        }).result;
                };


            }
        );
        angularAMD.controller("dispatchOrderListCtrl", function ($scope, amHttp, $modalInstance,$filter, model, transervice, uiGridConstants, commonService, httpService, gridDefaultOptionsService, dispatch_query_service,skallocationEditService,goodsRejectedService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'TRANSPORT_MODE',
                        width: 100,
                        displayName: transervice.tran('类型'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getTransportTypeName(row.entity.TRANSPORT_MODE)}}</div>',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center">合计</div>'
                    },
                    {
                        field: 'NUMBERCD',
                        width: 180,
                        displayName: transervice.tran('空海次数/调拨计划单'),
                        enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.NUMBERCD}}</a>'
                    },
                    {
                        field: 'DISPATCH_TIME',
                        width: 120,
                        type: 'date',cellFilter: "date:'yyyy-MM-dd'" ,
                        displayName: transervice.tran('预计发货日期'),
                        enableCellEdit: false
                    },
                    {
                        field: 'EXPECTED_ARRIVED_TIME',
                        width: 120,
                        type: 'date',cellFilter: "date:'yyyy-MM-dd'" ,
                        displayName: transervice.tran('预计到达日期'),
                        enableCellEdit: false
                    },
                    {
                        field: 'OUT_WAREHOUSE_ID',
                        width: 120,
                        displayName: transervice.tran('发货仓库'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getWarehouseName(row.entity.OUT_WAREHOUSE_ID)}}</div>',
                        enableCellEdit: false
                    },
                    {
                        field: 'IN_WAREHOUSE_ID',
                        width: 120,
                        displayName: transervice.tran('目的仓库'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getWarehouseName(row.entity.IN_WAREHOUSE_ID)}}</div>',
                        enableCellEdit: false
                    },
                    {
                        field: 'SHIPMENT_NUMBER',
                        width: 150,
                        displayName: transervice.tran('实际发运数量'),
                        enableCellEdit: false,
                        cellClass:'text-right',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalAcShipNum}}</div>'
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    },
                    {
                        field: 'ARECIPIENT_NUM',
                        width: 150,
                        displayName: transervice.tran('已收货数量'),
                        enableCellEdit: false,
                        cellClass:'text-right',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalRgoodsNum}}</div>'
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    },
                    {
                        field: 'ADJUSTMENT_NUMBER',
                        enableCellEdit: false,
                        displayName: transervice.tran('调整数量'),
                        width: 120,
                        cellClass:'text-right',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalAdjustNum}}</div>'
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                /*enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false,*/
                enableGridMenu: false,   //是否使用菜单
                //showColumnFooter: true,
                //---------------api---------------------
                /*onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                }*/
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            $scope.gridOptions.getGridApi=function(gridApi){
                $scope.gridApi = gridApi;
            };
            $scope.gridData = [];
            //分页
            $scope.gridOptions.getPage=function(pageNo,pageSize){
                $scope.gridOptions.data = getSubList($scope.gridData,pageNo,pageSize);
            };
            $scope.transportTypeList = commonService.getDicList("TRANSPORTS"); //运输方式
            $scope.transportTypeList.push({
                "D_VALUE":6,
                "D_NAME_CN":"调拨"
            });
            function getWarehouseList(){
                var selectWhere = {
                    "select":["WAREHOUSE_ID","WAREHOUSE_NAME_CN","WAREHOUSE_CODE"],
                    "where":["<>","WAREHOUSE_STATE",0],
                    "limit":0
                }
                return httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST",selectWhere).then(
                    function (result){
                        $scope.warehouseList = result.data;
                        $scope.warehouseList.push({
                            "WAREHOUSE_ID":"",
                            "WAREHOUSE_NAME_CN":'供应商仓'
                        })
                    })
            }
            getWarehouseList().then(function(){
                
                $scope.init();
            })

            if (model) {
                $scope.model = angular.copy(model);
            }
            $scope.init = function () {
                var selectWhere = $scope.model;
                httpService.httpHelper(httpService.webApi.api, "report/inventorysales", "trackallocation", "POST", selectWhere).then(
                    function (result) {
                        var data = result.data;
                        $scope.totalAcShipNum = 0;
                        $scope.totalRgoodsNum = 0;
                        $scope.totalAdjustNum = 0;
                        data.forEach(d=>{
                            $scope.totalAcShipNum +=(+d.SHIPMENT_NUMBER);
                            $scope.totalRgoodsNum +=(+d.ARECIPIENT_NUM);
                            $scope.totalAdjustNum += (+d.ADJUSTMENT_NUMBER);
                            d.DISPATCH_TIME = d.DISPATCH_TIME?new Date(d.DISPATCH_TIME*1000):null;
                            d.EXPECTED_ARRIVED_TIME = d.EXPECTED_ARRIVED_TIME?new Date(d.EXPECTED_ARRIVED_TIME*1000):null;
                            d.OUT_WAREHOUSE_ID = d.OUT_WAREHOUSE_ID?d.OUT_WAREHOUSE_ID:"";
                        });
                        /*$scope.totalAcShipNum = toDecimal($scope.totalAcShipNum);
                        $scope.totalRgoodsNum = toDecimal($scope.totalRgoodsNum);
                        $scope.totalAdjustNum = toDecimal($scope.totalAdjustNum);*/
                        $scope.gridData = data;
                        $scope.gridOptions.getPage($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                        $scope.gridOptions.totalItems = data.length;
                    })
            };
            //$scope.init();

            $scope.edit = function (rowEntity) {
                if (rowEntity.TRANSPORT_MODE == '6') {
                    var dataSearch = {
                        "where":  ["=", "sk_allocation.ALLOCATION_CD", rowEntity.NUMBERCD],
                        "joinWith":["sk_allocation_detail","u_userinfoc"],
                        "distinct":true
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/allocation","view" , "POST", dataSearch).then(function (datas) {
                        if(datas.data.ESTIMATEDA_AT&&datas.data.ESTIMATED_AT){
                            datas.data.ESTIMATEDA_AT = $filter("date")(new Date(parseInt(datas.data.ESTIMATEDA_AT)*1000), "yyyy-MM-dd");
                            datas.data.ESTIMATED_AT = $filter("date")(new Date(parseInt(datas.data.ESTIMATED_AT)*1000), "yyyy-MM-dd");
                        }
                        skallocationEditService.showDialog(datas.data,0,0,true).then(function(data){
                            $scope.init();
                        });
                    });
                } else {
                    var dataSearch = {
                        "searchCNumber": rowEntity.NUMBERCD,
                        "isInit":2,
                    }
                    dispatch_query_service.showDialog(dataSearch).then(function (data) {
                        $scope.init();
                    });
                    /*httpService.httpHelper(httpService.webApi.api, "shipment/trackingdetail", "indexcustom", "POST", dataSearch).then(
                        function (result) {
                            if (result.data) {
                                dispatch_query_service.showDialog(result.data[0]).then(function (data) {
                                    $scope.init();
                                });
                            }

                        });*/
                }

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

            function getSubList(datas,pageNo,pageSize){
                datas=[].concat(datas);
                var from=(pageNo-1)*pageSize;
                var to=from+pageSize;
                if(datas.size<(to+1)){
                    return datas.splice(from);
                }
                return datas.splice(from,pageSize);
            }

            //仓库名称
            $scope.getWarehouseName = function (value) {
                var type = $scope.warehouseList.filter(t=>t.WAREHOUSE_ID == value);
                if (type.length) {
                    return type[0].WAREHOUSE_NAME_CN;
                }
                return "";
            };

            //类型名称
            $scope.getTransportTypeName = function (value) {
                var type = $scope.transportTypeList.filter(t=>t.D_VALUE == value);
                if (type.length) {
                    return type[0].D_NAME_CN;
                }
                return "";
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });
    })
