/**
 * Created by Fable on 2017/6/29.
 */

define(
    [  'angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt'
    ],
    function(angularAMD) {

        angularAMD.service(
            'SaleorderChooseService',
            function($q, $modal) {
                this.showDialog = function(model) {
                    return $modal
                        .open({
                            animation : true,
                            controller : "saleorderChooseCtrl",
                            backdrop:"static",
                            size:"lg",//lg,sm,md,llg,ssm
                            templateUrl : 'app/inventoryCenter/common/views/saleorderlist.html?ver='+_version_,
                            resolve : {

                                model : function() {
                                    return model;
                                }

                            }
                        }).result;
                };


            }
        );
        angularAMD.controller("saleorderChooseCtrl",function( $scope,amHttp,model,$modalInstance,transervice,uiGridConstants,httpService,gridDefaultOptionsService,Notification ){

            $scope.gridOptions = {
                columnDefs: [
                    { field: 'cr_sales_order.SALES_ORDER_CD', displayName: transervice.tran('销售订单'),enableCellEdit: false},
                    { field: 'cr_sales_order.pa_partner.PARTNER_NAME_CN', displayName: transervice.tran('客户'),enableCellEdit: false},
                    { field: 'g_product_sku.PSKU_NAME_CN', displayName: transervice.tran('产品'),enableCellEdit: false},
                    { field: 'PURCHASE', displayName: transervice.tran('销售数量'),cellClass:'text-right',enableCellEdit: false}
                ],
//              enableSelectAll: false,
//              enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
//              multiSelect: false,
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

                var dataSearch = {"joinWith":["cr_sales_order","b_unit","g_product_sku"], "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize};

                if ($scope.searchCondtion) {

                    dataSearch = {
                        "where":["or" ,
                            ["like","cr_sales_order.SALES_ORDER_CD",$scope.searchCondtion],
                            ["like","cr_sales_order_detail.PSKU_CODE",$scope.searchCondtion],
                            ["like","cr_sales_order_detail.PSKU_NAME_CN",$scope.searchCondtion],
                            ["like","pa_partner.PARTNER_NAME_CN",$scope.searchCondtion]
                        ],
                        "joinWith":["cr_sales_order","b_unit","g_product_sku"],
                        "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize
                    };
                }

                httpService.httpHelper(httpService.webApi.api, "sales/salesorderdetail","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if(datas.data.length){
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
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
                $modalInstance.close(rows[0]);
            };

            $scope.gridOptions.getGridApi=function(gridApi){
                $scope.gridApi=gridApi;
            };

            $scope.gridOptions.getPage=function(pageNo,pageSize){
                init(pageNo,pageSize);
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }

        });


    })
