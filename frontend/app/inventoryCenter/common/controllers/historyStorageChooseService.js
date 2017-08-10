define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'historyStorageChooseService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal.open({
                        animation: true,
                        controller: "historyStorageChooseCtrl",
                        backdrop: "static",
                        size: "lg",//lg,sm,md,llg,ssm
                        templateUrl: 'app/inventoryCenter/common/views/storageChooseList.html?ver=' + _version_,
                        resolve: {
                            model: function () {
                                return model;
                            }
                        }
                    }).result;
                };
            }
        );
        angularAMD.controller("historyStorageChooseCtrl", function ($scope, amHttp, model, $modalInstance, $filter, transervice, uiGridConstants, httpService, gridDefaultOptionsService, Notification, messageService) {
            if (model) {
                $scope.model = angular.copy(model);
            }
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'STORAGE_CD', displayName: transervice.tran('入库单'), enableCellEdit: false},
                    {field: 'PU_ORDER_CD', displayName: transervice.tran('采购订单'), enableCellEdit: false},
                    {field: 'STORAGE_AT', displayName: transervice.tran('入库日期'), enableCellEdit: false},
                    {field: 'PSKU_CODE', displayName: transervice.tran('产品SKU'), enableCellEdit: false},
                    {field: 'PSKU_NAME_CN', displayName: transervice.tran('产品'), enableCellEdit: false},
                    {
                        field: 'USERFUL_NUMBER',
                        displayName: transervice.tran('可用数量'),
                        cellClass: 'text-right',
                        enableCellEdit: false
                    }
                ],
                multiSelect: true,
                enableSelectAll: true,
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

            //初始化
            function init(currentPage, pageSize) {
                var dataSearch = {
                    "limit": pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                    "page": (currentPage ? currentPage : 1),
                    "searchCondtion": $scope.searchCondtion,
                    "existsID": $scope.model.EXISTS_DETAILID,
                    "partner": $scope.model.PARTNER_ID,
                    "organisation": $scope.model.ORGANISATION_ID
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/storagedetail", "historystorage", "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if (datas.data.length) {
                        angular.forEach(datas.data, function (obj, index) {
                            obj.STORAGE_AT = $filter("date")(new Date(parseInt(obj.STORAGE_AT) * 1000), "yyyy-MM-dd");
                        });
                        $scope.gridOptions.data = datas.data;
                        datas._meta.totalCount * 1 && ($scope.gridOptions.totalItems = datas._meta.totalCount);
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
                angular.forEach(row, function (obj, index) {
                    obj['RED_STORAGE_CD'] = obj['STORAGE_CD'];
                    obj['RED_STORAGE_DETAIL_ID'] = obj['STORAGE_DETAIL_ID'];
                    obj['STORAGE_DNUMBER'] = obj['USERFUL_NUMBER'] * -1;
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

            //切换页码
            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                init(pageNo, pageSize);
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }


        });


    })
