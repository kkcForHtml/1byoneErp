define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/singleSelectDirt',
        'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'goodsRejectedService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "goodsRejectedCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skallocation/views/goodsRejected.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("goodsRejectedCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter, gridDefaultOptionsService, messageService) {
            //退货确认
            $scope.goodsRejectedOptions = {
                columnDefs: [
                    {
                        field: 'PSKU_NAME_CN', displayName: transervice.tran('产品名称'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.PSKU_NAME_CN}}</div>'
                    },
                    {
                        field: 'PU_PURCHASE_CD', displayName: transervice.tran('内部采购订单 '),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.PU_PURCHASE_CD}}</div>'
                    },
                    {
                        field: 'STORAGE_CD', displayName: transervice.tran('内部采购入库单 '),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.STORAGE_CD}}</div>'
                    },
                    {
                        field: 'STORAGE_AT_SHOW', displayName: transervice.tran('入库日期'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.STORAGE_AT_SHOW}}</div>'
                    },
                    {
                        field: 'STORAGE_DNUMBER', displayName: transervice.tran('入库数量'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.STORAGE_DNUMBER}}</div>'
                    },
                    {
                        field: 'GOREJECTED_NUMBER', displayName: transervice.tran('退货数量'),
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.GOREJECTED_NUMBER"></form></div>'
                    },
                    {
                        field: 'WAREHOUSING_PRICE', displayName: transervice.tran('入库单价'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.WAREHOUSING_PRICE|number:2}}</div>'
                    },
                    {
                        field: 'WAREHOUSING_AMOUNT', displayName: transervice.tran('退货金额'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.WAREHOUSING_AMOUNT|number:2}}</div>'
                    }
                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                enableRowHeaderSelection: false
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.goodsRejectedOptions);
            //---------------api---------------------
            $scope.goodsRejectedOptions.getGridApi=function(gridApi){
                $scope.gridApiGr = gridApi;
            };

            $scope.goodsRejectedOptions.afterCellEdit = function (rowEntity, colDef, newValue, oldValue){
                if(newValue == '' ||newValue == 0){
                    rowEntity.GOREJECTED_NUMBER = oldValue;
                    return Notification.error(transervice.tran('退货数量不能为空或0'));
                }
                if(newValue > rowEntity.STORAGE_DNUMBER){
                    rowEntity.GOREJECTED_NUMBER = oldValue;
                    return Notification.error(transervice.tran('退货数量不能大于入库数量'));
                }
                rowEntity.WAREHOUSING_AMOUNT =  newValue*rowEntity.WAREHOUSING_PRICE;
            };

            //内部交易
            $scope.insiderTradingOptions = {
                columnDefs: [
                    {
                        field: 'PSKU_NAME_CN', displayName: transervice.tran('产品名称'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.PSKU_NAME_CN}}</div>'
                    },
                    {
                        field: 'I_NUMBER', displayName: transervice.tran('数量'),
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.I_NUMBER"></form></div>'
                    },
                    {field: 'MONEY_ID', displayName: transervice.tran('币种'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getMoneyName(row.entity.MONEY_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'MONEY_ID',
                        editDropdownValueLabel: 'MONEY_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "moneys"
                    },
                    {
                        field: 'I_PRICE', displayName: transervice.tran('单价'),
                        cellClass:"text-right",
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.I_PRICE|number:2}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.I_PRICE"></form></div>'
                    },
                    {
                        field: 'I_AMOUNT', displayName: transervice.tran('金额'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.I_AMOUNT|number:2}}</div>'
                    }
                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                enableRowHeaderSelection: false
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.insiderTradingOptions);
            //---------------api---------------------
            $scope.insiderTradingOptions.getGridApi=function(gridApi){
                $scope.gridApiIt = gridApi;
            };

            $scope.insiderTradingOptions.afterCellEdit = function (rowEntity, colDef, newValue, oldValue){
                if(colDef.name === "I_NUMBER" || colDef.name === "I_PRICE"){
                    var temp = 0;
                    if(colDef.name === "I_NUMBER"){
                        if(newValue == '' || newValue == 0){
                            rowEntity.I_NUMBER = oldValue;
                            return Notification.error(transervice.tran('数量不能为空或0'));
                        }
                        temp = rowEntity.I_PRICE;
                    }else {
                        newValue = newValue == '' ? 0 : newValue;
                        temp = rowEntity.I_NUMBER;
                    }
                    rowEntity.I_AMOUNT =  newValue * temp;
                }
            };

            (function () {
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", {"limit":"*"}).then(function (datas) {
                    $scope.moneys = datas.data;
                    $scope.goodsRejectedInit();
                });
            })();

            //初始化
            $scope.goodsRejectedInit = function () {
                var _post = [];
                angular.forEach(model.sk_allocation_detail, function (row, index) {
                    var _gr = {};
                    _gr.ERGANISATION_ID = model.ERGANISATION_ID;
                    _gr.ATPSKU_ID = row.ATPSKU_ID;
                    _gr.ATSKU_CODE = row.ATSKU_CODE;
                    _gr.ALLOCATION_NUMBER = row.ALLOCATION_NUMBER;
                    _gr.TDRODUCT_DE = row.TDRODUCT_DE;
                    _post.push(_gr);
                });
                httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "rejected", "POST", _post).then(function (result) {
                    var _reFlag = [];
                    angular.forEach(result.data.rejected,function (obj ,index) {
                        if(obj.length>0){
                            angular.forEach(obj,function (row,i) {
                                row.STORAGE_AT_SHOW = $filter("date")(new Date(parseInt(row.STORAGE_AT)*1000), "yyyy-MM-dd");
                                row.GOREJECTED_NUMBER = !row.GOREJECTED_NUMBER?0:row.GOREJECTED_NUMBER;
                                row.WAREHOUSING_PRICE = !row.WAREHOUSING_PRICE?0:row.WAREHOUSING_PRICE;
                                row.WAREHOUSING_AMOUNT = row.WAREHOUSING_PRICE&&row.GOREJECTED_NUMBER?row.WAREHOUSING_PRICE*row.GOREJECTED_NUMBER:0;
                                _reFlag.push(row);
                            });
                        }
                    });
                    $scope.goodsRejectedOptions.data = _reFlag;
                    var _trFlag = [];
                    if(result.data.trading.length>0){
                        angular.forEach(result.data.trading ,function (row ,index) {
                            row.I_PRICE = !row.I_PRICE?0:row.I_PRICE;
                            row.I_NUMBER = !row.I_NUMBER?0:row.I_NUMBER;
                            row.I_AMOUNT = row.I_PRICE&&row.I_NUMBER?row.I_PRICE*row.I_NUMBER:0;
                            row.moneys = angular.copy($scope.moneys);
                            _trFlag.push(row);
                        });
                    }
                    $scope.insiderTradingOptions.data = _trFlag;
                });
            };

            //获取货币名称
            $scope.getMoneyName = function (moneyId) {
                if(!$scope.moneys){
                    return;
                }
                var items = $scope.moneys.filter(c=>c.MONEY_ID === moneyId);
                if(items.length){
                    return items[0].MONEY_NAME_CN;
                }
                return "";
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close(false);
            };

            //确定按钮
            $scope.confirm = function () {
                var flag = true;
                if($scope.insiderTradingOptions.data.length > 0){
                    angular.forEach($scope.insiderTradingOptions.data,function (row ,index) {
                        if(!row.MONEY_ID||row.MONEY_ID == ''){
                            Notification.error(transervice.tran('请选择币种'));
                            flag = false;
                            return;
                        }
                        if(!row.I_PRICE||row.I_PRICE == 0){
                            Notification.error(transervice.tran('请填写单价'));
                            flag = false;
                            return;
                        }
                    });
                }
                if(!flag){
                    return false;
                }
                model.sk_goods_rejected = $scope.goodsRejectedOptions.data;
                model.sk_insider_trading = $scope.insiderTradingOptions.data;
                angular.forEach(model.sk_allocation_detail,function (obj,index) {
                    var _num = 0;
                    var r_flag = false;
                    var i_flag = false;
                    if(model.sk_goods_rejected.length > 0){
                        r_flag = true;
                        angular.forEach(model.sk_goods_rejected,function (row ,i) {
                            if(obj.ATPSKU_ID === row.PSKU_ID){
                                row.ALLOCATION_DETAIL_ID = obj.ALLOCATION_DETAIL_ID;
                                _num += row.GOREJECTED_NUMBER;
                            }
                        });
                    }
                    if(model.sk_insider_trading.length > 0){
                        i_flag = true;
                        angular.forEach(model.sk_insider_trading,function (row ,i) {
                            if(obj.ATPSKU_ID === row.PSKU_ID){
                                row.ALLOCATION_DETAIL_ID = obj.ALLOCATION_DETAIL_ID;
                                _num += row.I_NUMBER;
                            }
                        });
                    }
                    obj.ALLOCATION_NUMBER = r_flag||i_flag ? _num : obj.ALLOCATION_NUMBER;
                });

                httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "authrej", "POST", model).then(function (result) {
                    $modalInstance.close(model.sk_allocation_detail);//返回数据
                });
            };

            //取消按钮
            $scope.exit = function () {
                $scope.cancel();
            };
        });
    }
);