define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'purchaseChooseService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal.open({
                        animation: true,
                        controller: "purchaseChooseCtrl",
                        backdrop: "static",
                        size: "lg",//lg,sm,md,llg,ssm
                        templateUrl: 'app/inventoryCenter/common/views/purchaselist.html?ver=' + _version_,
                        resolve: {
                            model: function () {
                                return model;
                            }
                        }
                    }).result;
                };
            }
        );
        angularAMD.controller("purchaseChooseCtrl", function ($scope, amHttp, model, $modalInstance, transervice, uiGridConstants, httpService, gridDefaultOptionsService, Notification, messageService) {
            if (model) {
                $scope.model = angular.copy(model);
            }
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'PU_PURCHASE_CD', displayName: transervice.tran('采购订单'), enableCellEdit: false},
                    {
                        field: 'pu_purchase.pa_partner.PARTNER_NAME_CN',
                        displayName: transervice.tran('供应商'),
                        enableCellEdit: false
                    },
                    {field: 'PSKU_CODE', displayName: transervice.tran('产品SKU'), enableCellEdit: false},
                    {field: 'PSKU_NAME_CN', displayName: transervice.tran('产品'), enableCellEdit: false},
                    {
                        field: 'NOT_RGOODS_NUMBER',
                        displayName: transervice.tran('未收货数量'),
                        cellClass: 'text-right',
                        enableCellEdit: false
                    }

                ],
                enableSelectAll: true,
//					enableFullRowSelection : false, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                multiSelect: true,
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
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

            function searchCondition(pageSize) {
                var modelTemp = angular.copy(model);
                var dataSearch = new Object();
                dataSearch.limit = pageSize ? pageSize : $scope.gridOptions.paginationPageSize;
                dataSearch.joinWith = ["pu_purchase", "b_unit"];
                dataSearch.where = ['and', ['=', 'pu_purchase.ORDER_STATE', 2]];
                dataSearch.orderby = 'UPDATED_AT desc';
                dataSearch.distinct = true;
                if ($scope.searchCondtion) {
                    dataSearch.where.push(["or", ["like", "pu_purchase_detail.PU_PURCHASE_CD", $scope.searchCondtion],
                        ["like", "pu_purchase_detail.PSKU_NAME_CN", $scope.searchCondtion],
                        ["like", "pa_partner.PARTNER_NAME_CN", $scope.searchCondtion],
                        ["like", "pu_purchase_detail.PSKU_CODE", $scope.searchCondtion]
                    ]);
                }
                if (modelTemp) {
                    dataSearch.andwhere = ["and", ['=', 'pu_purchase.ORGANISATION_ID', modelTemp.ORGANISATION_ID],
                        ['=', 'pa_partner.PARTNER_ID', modelTemp.PARTNER_ID],
                        ['>', '(pu_purchase_detail.PURCHASE - pu_purchase_detail.RGOODS_NUMBER)', 0],
                        ['not in','pu_purchase_detail.PURCHASE_DETAIL_ID',modelTemp.EXISTS_DETAILID]];
                }
                return dataSearch;
            }


            //初始化
            function init(currentPage, pageSize) {

                var dataSearch = searchCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "purchase/purchasedetail", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if (datas.data.length) {
                        datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                        $scope.gridOptions.data = datas.data;
                        angular.forEach(datas.data, function (obj, index) {
                            obj.NOT_RGOODS_NUMBER = obj.PURCHASE - obj.RGOODS_NUMBER;
                        });

                    }
                })
            }

            //初始化
            init();
            //搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            };

            function formatData(rows) {
                var row = angular.copy(rows);
                angular.forEach(row,function(obj,index){
                    obj['RED_STORAGE_CD'] = "";
                    obj['RED_STORAGE_DETAIL_ID'] = "";
                    obj['STORAGE_DNUMBER'] = obj['NOT_RGOODS_NUMBER'];
                    obj['MONEY_CODE'] = obj['pu_purchase']['MONEY_CODE'];
                    obj['PU_ORDER_CD'] = obj['PU_PURCHASE_CD'];
                    obj['UNIT_PRICE'] = obj['TAX_UNITPRICE'];
                    obj['UNIT_NAME_CN'] = obj['b_unit']['UNIT_NAME_CN'];
                });
                return row;
            }

            function checkExchangeRate(data) {
                var temp = [];
                angular.forEach(data,function(obj,index){
                    var tempp = [];
                    tempp.push(obj["MONEY_CODE"]);
                    tempp.push($scope.model.MONEY_CODE);
                    tempp.push($scope.model.STORAGE_AT);
                    temp.push(tempp);
                });
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

            //确定
            $scope.confirm = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var data = formatData(rows);
                checkExchangeRate(data);
            };

            $scope.gridOptions.getGridApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };

            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                init(pageNo, pageSize);
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }
        });
    })
