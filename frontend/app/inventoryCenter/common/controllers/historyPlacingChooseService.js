/**
 * Created by Fable on 2017/6/29.
 */
define(
    [  'angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        'app/common/Services/messageService'
    ],
    function(angularAMD) {

        angularAMD.service(
            'historyPlacingChooseService',
            function($q, $modal) {
                this.showDialog = function(model) {
                    return $modal
                        .open({
                            animation : true,
                            controller : "historyPlacingChooseCtrl",
                            backdrop:"static",
                            size:"lg",//lg,sm,md,llg,ssm
                            templateUrl : 'app/inventoryCenter/common/views/placingChooseList.html?ver='+_version_,
                            resolve : {

                                model : function() {
                                    return model;
                                }

                            }
                        }).result;
                };


            }
        );
        angularAMD.controller("historyPlacingChooseCtrl",function( $scope,amHttp,model,$modalInstance,$filter,transervice,uiGridConstants,httpService,gridDefaultOptionsService,Notification,messageService ){

            if (model) {
                $scope.model = angular.copy(model.model);
                $scope.model.PLACING_AT = model.PLACING_AT;
            }

            $scope.PPARTNER_CODE = model.PPARTNER_CODE;
            $scope.PRGANISATION_CODE = model.model.PRGANISATION_CODE;



            $scope.gridOptions = {
                columnDefs: [
                    { field: 'PLACING_CD', displayName: transervice.tran('出库单'), enableCellEdit: false},
                    { field: 'SALES_ORDER', displayName: transervice.tran('销售订单'), enableCellEdit: false},
                    { field: 'sk_placing.PLACING_AT', displayName: transervice.tran('出库日期'),enableCellEdit: false},
                    { field: 'g_product_sku.PSKU_CODE', displayName: transervice.tran('SKU'),enableCellEdit: false},

                    { field: 'g_product_sku.PSKU_NAME_CN', displayName: transervice.tran('产品名称'),enableCellEdit: false},
                    { field: 'psd_num', displayName: transervice.tran('可用数量'),cellClass:'text-right',enableCellEdit: false}
                ],
//              enableSelectAll: false,
//              enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                multiSelect: true,
                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                        if(newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){

                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            //初始化
            function init(currentPage, pageSize) {


                if (!$scope.searchCondtion) {
                    $scope.searchCondtion = "";
                }

                var dataSearch = {
                    "where":["or" ,["like","sk_placing.PLACING_CD",$scope.searchCondtion],
                        ["like","sk_placing_detail.SALES_ORDER",$scope.searchCondtion],
                        ["like","g_product_sku.PSKU_NAME_CN",$scope.searchCondtion],
                        ["like","g_product_sku.PSKU_CODE",$scope.searchCondtion]
                    ],
                    "andwhere":['and',
                        ['=','sk_placing.PLAN_STATE','2'],
                    ],
                    "joinWith":["sk_placing","b_unit","g_product_sku"],
                    "orderby":"sk_placing.PLACING_AT desc",
                    "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize
                };
                /*
                httpService.httpHelper(httpService.webApi.api, "inventory/placingdetail","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if(datas.data.length){
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function(obj,index){
                            obj.PLAN_AT = $filter("date")(new Date(parseInt(obj.sk_placing.PLAN_AT)*1000), "yyyy-MM-dd HH:mm:ss");
                        });
                        $scope.gridOptions.data=datas.data;

                    }
                })
                */
                var postdata = {
                                'search':$scope.searchCondtion,
                                'pagesize':pageSize ? pageSize : $scope.gridOptions.paginationPageSize,'page':currentPage ? currentPage : 1,
                                'where' :{'PPARTNER_CODE':$scope.PPARTNER_CODE,'PRGANISATION_CODE':$scope.PRGANISATION_CODE},
                                "existsID": $scope.model.EXISTS_DETAILID,
                                };
                httpService.httpHelper(httpService.webApi.api, "inventory/placingdetail","queryplacingchoose", "POST", postdata).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if(datas.data.length){
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function(obj,index){
                            obj.sk_placing.PLACING_AT = $filter("date")(new Date(parseInt(obj.sk_placing.PLACING_AT)*1000), "yyyy-MM-dd");
                        });
                        $scope.gridOptions.data=datas.data;

                    }
                })
            }
            //初始化
            init();
            //搜索
            $scope.search = function(){
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            };

            //确定
            $scope.confirm = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要添加的数据'));
                }
                checkExchangeRate(rows);
            };


            function checkExchangeRate(data) {
                var temp = [];
                angular.forEach(data,function(obj,index){
                    var tempp = [];
                    tempp.push(obj['sk_placing']["PMONEY_CODE"]);
                    tempp.push($scope.model.PMONEY_CODE);
                    tempp.push($scope.model.PLACING_AT);
                    temp.push(tempp);
                });
                $modalInstance.close(data);
                return ;
                httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", temp).then(function (datas) {
                    var flag = true;
                    angular.forEach(datas.data, function (row, i) {
                        if (row['3'] == null) {
                            flag = false;
                        } else {
                            data[i]["TAX_UNITPRICE"] = Number(data[i]["TAX_UNITPRICE"]) * row["3"];
                            data[i]["NOT_TAX_UNITPRICE"] = Number(data[i]["NOT_TAX_UNITPRICE"]) * row["3"];
                        }
                    });
                    if (flag) {
                        $modalInstance.close(data);
                    } else {
                        return Notification.error(transervice.tran(messageService.error_exchange_rate));
                    }
                });
            }


            $scope.gridOptions.getGridApi=function(gridApi){
                $scope.gridApi=gridApi;
            };

            //切换页码
            $scope.gridOptions.getPage=function(pageNo,pageSize){
                init(pageNo,pageSize);
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }




        });


    })
