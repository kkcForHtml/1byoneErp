/**
 * Created by Administrator on 2017/5/19.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/common/Services/commonService',
        'app/common/Services/configService',
        'app/common/Services/messageService'
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
                            size: "75%",
                            templateUrl: 'app/purchasingCenter/purchasingTracking/views/generateRequestPayment.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("requestPaymentCtrl", function ($scope, $filter, amHttp, model, $timeout, $q, messageService,$interval,$modalInstance, Notification,configService, transervice, httpService, commonService, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'PU_PURCHASE_CD', cellClass: 'unedit',enableCellEdit: false, displayName: transervice.tran('采购单号'), width: 150},
                    {
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        displayName: transervice.tran('SKU'),
                        width: 160
                    }, {
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('产品名称'),
                        width: 180
                    }, {
                        field: 'TAX_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('采购金额'),
                        width: 140,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TAX_AMOUNT|number:2}}</div>'
                    },{
                        field: 'RGOODS_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('已付金额'),
                        width: 140,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.RGOODS_AMOUNT|number:2}}</div>'
                    }, {
                        field: 'UNRGOODS_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('未付金额'),
                        width: 140,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNRGOODS_AMOUNT|number:2}}</div>'
                    }, {
                        field: 'THIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('已申付金额'),
                        width: 140,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.THIS_APPLY_AMOUNT|number:2}}</div>'
                    }, {
                        field: 'UNTHIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        displayName: transervice.tran('未申付金额'),
                        width: 140,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNTHIS_APPLY_AMOUNT|number:2}}</div>',
                    }, {
                        field: 'THIS_AMOUNT',
                        enableCellEdit: true,
                        displayName: transervice.tran('本次申付金额'),
                        width: 140,
                        cellClass: 'canedit_num_def',
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.THIS_AMOUNT|number:2}}</div>'
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
                $scope.model.APPLICANT_ID = $scope.userInfo?$scope.userInfo.USER_INFO_ID:null;
                $scope.model.APPLICANT_NAME_CN = ($scope.userInfo && $scope.userInfo.u_staffinfo2)?$scope.userInfo.u_staffinfo2.STAFF_NAME_CN:$scope.userInfo.STAFF_CODE;
                $scope.model.PAYMENT_AT = $filter("date")((new Date().valueOf()), "yyyy-MM-dd");
                $scope.model.PORGANISATION_ID = $scope.model[0].pu_purchase.o_organisation.ORGANISATION_ID;
                $scope.model.PORGANISATION_CODE = $scope.model[0].pu_purchase.o_organisation.ORGANISATION_CODE;
                $scope.model.PORGANISATION_NAME_CN = $scope.model[0].pu_purchase.o_organisation.ORGANISATION_NAME_CN;
                $scope.model.PMONEY_ID = $scope.model[0].pu_purchase.b_money.MONEY_ID;
                $scope.model.PMONEY_CODE = $scope.model[0].pu_purchase.b_money.MONEY_CODE;
                $scope.model.PMONEY_NAME_CN = $scope.model[0].pu_purchase.b_money.MONEY_NAME_CN;
                $scope.model.PARTNER_ID = $scope.model[0].pu_purchase.pa_partner.PARTNER_ID;
                $scope.model.PARTNER_NAME_CN = $scope.model[0].pu_purchase.pa_partner.PARTNER_CODE+"_"+$scope.model[0].pu_purchase.pa_partner.PARTNER_ANAME_CN;
                $scope.model.PAYMENT_NUMBER = Number(0);
                $scope.model.forEach(d=>{
                    $scope.model.PAYMENT_NUMBER += Number(d.UNTHIS_APPLY_AMOUNT);
                    d.THIS_AMOUNT =toDecimal(d.UNTHIS_APPLY_AMOUNT) ;
                });
                $scope.gridOptions.data = $scope.model;
                $timeout(function() {
                    if($scope.gridApi.selection.selectRow){
                        $scope.gridApi.selection.selectAllRows();
                    }
                });


            };


            $scope.generatePaymentRequest = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                if(!$scope.model.PAYMENT_NUMBER ||$scope.model.PAYMENT_NUMBER.length==0 ||$scope.model.PAYMENT_NUMBER==0){
                    return Notification.error(transervice.tran("申付金额必须大于0"));
                }
                var data = {
                    "PORGANISATION_ID":$scope.model.PORGANISATION_ID,
                    "PAYMENT_NUMBER":$scope.model.PAYMENT_NUMBER,
                    "PARTNER_ID":$scope.model.PARTNER_ID,
                    "PMONEY_ID":$scope.model.PMONEY_ID,
                    "PAYMENT_AT":$scope.formatDate(new Date($scope.model.PAYMENT_AT.replace(/-/g, "/"))),
                    "PAYMENT_REMARKS":$scope.model.PAYMENT_REMARKS,
                    "pu_payment_detail":angular.copy(rows)
                };
                httpService.httpHelper(httpService.webApi.api, "purchase/payment", "create" , "POST", data).then(function(result) {
                    Notification.success(transervice.tran(result.message));
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



