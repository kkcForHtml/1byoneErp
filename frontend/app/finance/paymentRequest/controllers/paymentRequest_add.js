/**
 * Created by Administrator on 2017/5/31.
 */
/**
 * Created by Administrator on 2017/5/31.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/gridDefaultOptionsService',
        "app/masterCenter/bchannel/controllers/partner_list_service",
        'app/common/Services/configService'
    ],
    function (angularAMD) {

        angularAMD.service(
            'paymentRequest_add',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "payment_add_Ctrl",
                            backdrop: "static",
                            size:"75%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/finance/paymentRequest/views/paymentRequest_add.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );

        angularAMD.controller("payment_add_Ctrl", function ($scope, model,$confirm, $filter,configService, $timeout, amHttp, httpService, $modalInstance, partner_list_service,Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService) {

            $scope.docStateList = commonService.getDicList("PU_PAYMENT"); //单据状态
            $scope.paymentStateList = commonService.getDicList("PAYMENT_STATE"); //付款状态
            $scope.smethodList = commonService.getDicList("PARTNER_SMETHOD"); //结算方式
            $scope.userInfo = configService.getUserInfo();

            function init(){
                if(model) {
                    $scope.model = angular.copy(model);
                    $scope.model.PORGANISATION_ID = "";
                    $scope.model.APPLICANT_CODE_NAME = $scope.model.u_staff_info ? $scope.model.u_staff_info.STAFF_NAME_CN : "";
                    $scope.model.userOrgCode = $scope.userInfo?$scope.userInfo.ORGANISATION_ID:"";
                    $scope.model.issave = false;
                    $scope.model.PAYMENT_STATE = '0';
                    $scope.model.AUDIT_STATE = '1';
                    //$scope.model.CREATED_AT = new Date();
                    $scope.model.CREATED_AT = $filter("date")((new Date().valueOf()), "yyyy-MM-dd");
                    var selectWhere = {"where": ["=", "MONEY_STATE", 1]};
                    return httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(function (result) {
                        $scope.model.moneyList=result.data;
                    });
                }
            }
            init();
            init().then(function(){
                getUserOrgCode();
            });

            //查询申请人所在部门
            function getUserOrgCode () {
                var dataSearch = {
                    "where":["and",["<>","ORGANISATION_STATE",0],["=","ORGANISATION_ID",$scope.model.userOrgCode]],
                    "limit":0
                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST", dataSearch).then(function (results) {
                    $scope.model.AUTITOR_ORG_NAME_CN = results.data[0].ORGANISATION_NAME_CN;
                });
            };
            $scope.save = function(){
                if($scope.model.PORGANISATION_ID==null ||$scope.model.PORGANISATION_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入组织'));
                }
                if(!$scope.model.pa_partner||$scope.model.pa_partner.PARTNER_NAME_CN==null ||$scope.model.pa_partner.PARTNER_NAME_CN.length<=0 ){
                    return Notification.error(transervice.tran('请输入供应商'));
                }
                if($scope.model.PMONEY_ID==null ||$scope.model.PMONEY_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入申付币种'));
                }
                if($scope.model.PAYMENT_NUMBER==null ||$scope.model.PAYMENT_NUMBER.length<=0 ||$scope.model.PAYMENT_NUMBER==0 ){
                    return Notification.error(transervice.tran('请输入申付金额且申付金额必须大于0'));
                }
                if($scope.model.PAYMENT_AT==null ||$scope.model.PAYMENT_AT.length<=0 ){
                    return Notification.error(transervice.tran('请输入预计付款日期'));
                }
                var data = {
                    "PORGANISATION_ID":$scope.model.PORGANISATION_ID,
                    "PAYMENT_NUMBER":$scope.model.PAYMENT_NUMBER,
                    "PARTNER_ID":$scope.model.PARTNER_ID,
                    "PMONEY_ID":$scope.model.PMONEY_ID,
                    "PAYMENT_AT":$scope.formatDate(new Date($scope.model.PAYMENT_AT.replace(/-/g, "/"))),
                    "PAYMENT_REMARKS":$scope.model.PAYMENT_REMARKS
                };
                return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "create", "POST", data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close($scope.model);//返回数据
                });
            };

            //选择供应商
            $scope.selectSupplier=function () {
                partner_list_service.showDialog([]).then(function (data) {
                    $scope.model.pa_partner=data;
                    $scope.model.PARTNER_ID=data.PARTNER_ID;
                    $scope.model.PARTER_NAME_CN=data.PARTNER_NAME_CN;
                })
            };

            //获取付款状态
            function getPaymentStateName(value) {
                var paymentState = $scope.paymentStateList.filter(c=>c.D_VALUE == value);
                if(paymentState.length){
                    return paymentState[0].D_NAME_CN;
                }
                return "";
            };
            //获取单据状态
            function getDocStateName(value) {
                var docState=$scope.docStateList.filter(c=>c.D_VALUE==value);
                if(docState.length){
                    return docState[0].D_NAME_CN;
                }
                return "";
            }
            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = Math.round((object) / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });

    })