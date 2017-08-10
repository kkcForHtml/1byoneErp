/**
 * Created by Administrator on 2017/5/19.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/common/Services/commonService',
        'app/common/Services/configService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'generate_requestPayment_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "requestPaymentCtrl",
                            backdrop: "static",
                            //size: "llg",//lg,sm,md,llg,ssm
                            size: "1100px",
                            templateUrl: 'app/purchasingCenter/purchasingTracking/dialog/views/generateRequestPayment.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("requestPaymentCtrl", function ($scope, $filter, amHttp, model, $timeout, $q, $interval,$modalInstance, Notification,configService, transervice, httpService, commonService, gridDefaultOptionsService) {
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
                    }, {
                        field: 'TAX_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('采购金额'),
                        width: 110
                    }, {
                        field: 'THIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('已申付金额'),
                        width: 110
                    }, {
                        field: 'UNTHIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('未申付金额'),
                        width: 110
                    }, {
                        field: 'THIS_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('本次申付金额'),
                        width: 110
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                        if (colDef.field == "THIS_AMOUNT") {
                            var a = rowEntity.THIS_AMOUNT;
                            $scope.model.PAYMENT_NUMBER = toDecimal(Number($scope.model.PAYMENT_NUMBER) - Number(oldValue) + Number(newValue));
                            rowEntity.UNTHIS_APPLY_AMOUNT = toDecimal(Number(rowEntity.UNTHIS_APPLY_AMOUNT)- Number(newValue)+(oldValue!=rowEntity.UNTHIS_APPLY_AMOUNT?Number(oldValue):0));
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);

                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };
            $scope.userInfo = configService.getUserInfo();
            if(model){
                $scope.model = angular.copy(model);
                $scope.model.APPLICANT_CODE = $scope.userInfo.USER_INFO_CODE;
                $scope.model.APPLICANT_NAME_CN = $scope.userInfo.USERNAME;
                $scope.model.PAYMENT_AT = new Date();
                $scope.model.PORGANISATION_CODE = $scope.model[0].pu_purchase.o_organisation.ORGANISATION_CODE;
                $scope.model.PORGANISATION_NAME_CN = $scope.model[0].pu_purchase.o_organisation.ORGANISATION_NAME_CN;
                $scope.model.PMONEY_CODE = $scope.model[0].pu_purchase.b_money.MONEY_CODE;
                $scope.model.PMONEY_NAME_CN = $scope.model[0].pu_purchase.b_money.MONEY_NAME_CN;
                $scope.model.PARTNER_CODE = $scope.model[0].pu_purchase.pa_partner.PARTNER_CODE;
                $scope.model.PARTNER_NAME_CN = $scope.model[0].PARTNER_ANAME_CN;
                $scope.model.PAYMENT_NUMBER = Number(0);
                $scope.model.forEach(d=>{
                    $scope.model.PAYMENT_NUMBER += Number(d.UNTHIS_APPLY_AMOUNT);
                    d.THIS_AMOUNT =toDecimal(d.UNTHIS_APPLY_AMOUNT) ;
                });
                $scope.gridOptions.data = $scope.model;
            };


            $scope.generatePaymentRequest = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                var data = {
                    "PORGANISATION_CODE":$scope.model.PORGANISATION_CODE ,
                    "PAYMENT_NUMBER":$scope.model.PAYMENT_NUMBER,
                    "PARTNER_CODE":$scope.model.PARTNER_CODE,
                    "PMONEY_CODE":$scope.model.PMONEY_CODE,
                    "PAYMENT_AT":$scope.formatDate($scope.model.PAYMENT_AT),
                    "pu_payment_detail":angular.copy(rows)
                };
                httpService.httpHelper(httpService.webApi.api, "purchase/payment", "create" , "POST", data).then(function(result) {
                    Notification.success({message: result.message, delay: 2000});
                    $modalInstance.close($scope.model);//返回数据
                });
            };


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


            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (angular.isDate(object)) {
                    object = Math.round((object).valueOf() / 1000);
                } else {
                    object = Math.round((object) / 1000);
                }
                return object;
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close();
                //$modalInstance.dismiss(false);

            };

        })
    });



