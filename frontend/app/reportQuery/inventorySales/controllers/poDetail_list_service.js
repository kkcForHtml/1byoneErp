/**
 * Created by Administrator on 2017/6/16.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/gridDefaultOptionsService',
        'app/purchasingCenter/purchaseOrder/controllers/purchase_edit_service'
    ],
    function (angularAMD) {

        angularAMD.service(
            'poDetail_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "poDetailListCtrl",
                            backdrop: "static",
                            size: "75%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/reportQuery/inventorySales/views/poDetail_list_service.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }

                            }
                        }).result;
                };


            }
        );
        angularAMD.controller("poDetailListCtrl", function ($scope, amHttp, $modalInstance, model, transervice, uiGridConstants, commonService, httpService, gridDefaultOptionsService, purchase_edit_service) {

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PU_PURCHASE_CD',
                        width: 180,
                        displayName: transervice.tran('采购订单'),
                        enableCellEdit: false,
                        cellTemplate: '<div><a class="btn btn-link" style="padding-top: 3px;" p-link link-code="row.entity.PU_PURCHASE_CD" link-state="\'1\'">{{row.entity.PU_PURCHASE_CD}}</a></div>',
                        //cellTemplate: '<button type="button" class="btn btn-link" ng-click="grid.appScope.editPo(row.entity)">{{row.entity.PU_PURCHASE_CD}}</button>',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center">合计</div>'
                    },
                    {
                        field: 'PARTNER_CODE_NAME',
                        width: 100,
                        displayName: transervice.tran('供应商'),
                        enableCellEdit: false
                    },
                    {
                        field: 'CREATED_AT',
                        width: 150,
                        displayName: transervice.tran('下单日期'),
                        enableCellEdit: false,
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    },
                    {
                        field: 'COMMI_PERIOD',
                        width: 100,
                        displayName: transervice.tran('交货日期'),
                        enableCellEdit: false,
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"
                    },
                    {
                        field: 'PURCHASE',
                        width: 100,
                        displayName: transervice.tran('订单数量'),
                        enableCellEdit: false,
                        cellClass: "text-right",
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalPurchase}}</div>'
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    },
                    {
                        field: 'PRO_NUMBER',
                        width: 100,
                        displayName: transervice.tran('在产数量'),
                        enableCellEdit: false,
                        cellClass: "text-right",
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalProNumber}}</div>'
                        // aggregationType:addSum
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    },
                    {
                        field: 'GOODPRO_NUMBER',
                        width: 130,
                        displayName: transervice.tran('厂家好货数量'),
                        enableCellEdit: false,
                        cellClass: "text-right",
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalGProNumber}}</div>'
                        //  aggregationType:addSum
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    },
                    {
                        field: 'RGOODS_NUMBER',
                        width: 130,
                        displayName: transervice.tran('国内仓(已收货)'),
                        enableCellEdit: false,
                        cellClass: "text-right",
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.totalRGoodNumber}}</div>'
                        // aggregationType:addSum
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    },
                    {
                        field: 'TAX_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('订单金额'),
                        width: 130,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TAX_AMOUNT|number:2}}</div>',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.sumTaxAmount|number:2}}</div>'
                        // aggregationType:addSum
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    }, {
                        field: 'THIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('已申付金额'),
                        width: 130,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.THIS_APPLY_AMOUNT|number:2}}</div>',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.sumThisApAmount|number:2}}</div>'
                        //  aggregationType:addSum
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    }, {
                        field: 'UNTHIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('未申付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNTHIS_APPLY_AMOUNT|number:2}}</div>',
                        //footerCellTemplate: '<div class="ui-grid-cell-contents text-right">{{grid.appScope.sumUnThisApAmount|number:2}}</div>',
                        width: 130,
                        // aggregationType:addSum
                        //aggregationType: uiGridConstants.aggregationTypes.sum
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                //showColumnFooter: true,
                paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10,//每页显示个数
                /*enablePagination: false, //是否分页，默认为true
                 enablePaginationControls: false,*/
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
            $scope.gridOptions.getGridApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };
            $scope.gridData = [];
            //分页
            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                $scope.gridOptions.data = getSubList($scope.gridData, pageNo, pageSize);
            };
            if (model) {
                $scope.model = angular.copy(model);
            }
            $scope.init = function () {
                var selectWhere = {
                    "where": ["and", ["=", "b_channel.PLATFORM_TYPE_ID", "2"], ["=", "pu_purchase.ORDER_TYPE", 1], ["=", "pu_purchase.ORDER_STATE", 2], ["=", "pu_purchase.DORGANISATION_ID", $scope.model.organisation], ["=", "pu_purchase_detail.PSKU_ID", $scope.model.sku]],
                    "joinwith": ["purchase_partner_channel"],
                    "distinct":true
                };
                if($scope.model.value==1){
                    selectWhere.andWhere = [">", "(pu_purchase_detail.PURCHASE-pu_purchase_detail.INSPECTION_NUMBER)", "0"];
                }else{
                    selectWhere.andWhere = [">", "(pu_purchase_detail.INSPECTION_NUMBER-pu_purchase_detail.RGOODS_NUMBER)", "0"];
                }
                httpService.httpHelper(httpService.webApi.api, "purchase/purchasedetail", "index", "POST", selectWhere).then(
                    function (result) {
                        var data = result.data;
                        $scope.totalPurchase = 0;
                        $scope.totalProNumber = 0;
                        $scope.totalGProNumber = 0;
                        $scope.totalRGoodNumber = 0;
                        $scope.sumTaxAmount = 0;
                        $scope.sumThisApAmount = 0;
                        $scope.sumUnThisApAmount = 0;
                        data.forEach(d=> {
                            d.CREATED_AT = new Date(d.CREATED_AT * 1000);
                            d.COMMI_PERIOD = new Date(d.COMMI_PERIOD * 1000);
                            //供应商
                            d.PARTNER_CODE_NAME = d.purchase_partner_channel.pa_partner.PARTNER_CODE + "_" + d.purchase_partner_channel.pa_partner.PARTNER_ANAME_CN;
                            //在产数量
                            d.PRO_NUMBER = Number(d.PURCHASE) - Number(d.INSPECTION_NUMBER);//采购数量-已验货数量
                            //厂家好货数量
                            d.GOODPRO_NUMBER = (Number(d.INSPECTION_NUMBER) - Number(d.RGOODS_NUMBER) > 0) ? Number(d.INSPECTION_NUMBER) - Number(d.RGOODS_NUMBER) : 0;//已验货-已收货
                            d.UNTHIS_APPLY_AMOUNT = (+d.TAX_AMOUNT) - (+d.THIS_APPLY_AMOUNT);
                            $scope.totalPurchase += (+d.PURCHASE);
                            +d.PRO_NUMBER > 0 && ($scope.totalProNumber += (+d.PRO_NUMBER));
                            +d.GOODPRO_NUMBER > 0 && ($scope.totalGProNumber += (+d.GOODPRO_NUMBER));
                            $scope.totalRGoodNumber += (+d.RGOODS_NUMBER);
                            $scope.sumTaxAmount += (+d.TAX_AMOUNT);
                            $scope.sumThisApAmount += (+d.THIS_APPLY_AMOUNT);
                            $scope.sumUnThisApAmount += (+d.UNTHIS_APPLY_AMOUNT);
                        });
                        /*$scope.totalPurchase = toDecimal($scope.totalPurchase);
                         $scope.totalProNumber = toDecimal($scope.totalProNumber);
                         $scope.totalGProNumber =toDecimal($scope.totalGProNumber);
                         $scope.totalRGoodNumber = toDecimal($scope.totalRGoodNumber);*/
                        $scope.sumTaxAmount = toDecimal($scope.sumTaxAmount);
                        $scope.sumThisApAmount = toDecimal($scope.sumThisApAmount);
                        $scope.sumUnThisApAmount = toDecimal($scope.sumUnThisApAmount);
                        $scope.gridData = data;
                        $scope.gridOptions.getPage($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                        $scope.gridOptions.totalItems = data.length;

                    })

            };
            $scope.init();

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

            function getSubList(datas, pageNo, pageSize) {
                datas = [].concat(datas);
                var from = (pageNo - 1) * pageSize;
                var to = from + pageSize;
                if (datas.size < (to + 1)) {
                    return datas.splice(from);
                }
                return datas.splice(from, pageSize);
            }


            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };


        });


    })
