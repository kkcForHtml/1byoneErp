/**
 * Created by Administrator on 2017/5/31.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/gridDefaultOptionsService'
    ],
    function (angularAMD) {

        angularAMD.service(
            'paymentRequestEdit',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "payment_edit_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/finance/paymentRequest/dialog/views/paymentRequest_edit.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );

        angularAMD.controller("payment_edit_Ctrl", function ($scope, model,$confirm, $filter, $timeout, amHttp, httpService, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'PU_PURCHASE_CD', enableCellEdit: false, displayName: transervice.tran('采购单号'), width: 200},
                    {
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        displayName: transervice.tran('SKU'),
                        width: 150
                    }, {
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('产品名称'),
                        width: 220
                    },{
                        field: 'TAX_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('订单数量'),
                        width: 110
                    },{
                        field: 'TAX_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('已收货数量'),
                        width: 110
                    }, {
                        field: 'COMMI_PERIOD',
                        width: 100,
                        displayName: transervice.tran('收货日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    },{
                        field: 'COMMI_PERIOD',
                        width: 100,
                        displayName: transervice.tran('付款方式'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    }, {
                        field: 'TAX_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('订单金额'),
                        width: 110
                    }, {
                        field: 'THIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('已付金额'),
                        width: 110
                    }, {
                        field: 'UNTHIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('未付金额'),
                        width: 110
                    }, {
                        field: 'THIS_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('本次申付金额'),
                        width: 110
                    },
                    {
                        field: 'THIS_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('实付金额'),
                        width: 110
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

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
                            $scope.testRow = row.entity;
                        }
                    });

                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);


            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };


        });

    })