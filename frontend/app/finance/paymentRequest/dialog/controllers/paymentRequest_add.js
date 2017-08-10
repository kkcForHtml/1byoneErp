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
    ],
    function (angularAMD) {

        angularAMD.service(
            'paymentRequestAdd',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "payment_add_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/finance/paymentRequest/dialog/views/paymentRequest_add.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );

        angularAMD.controller("payment_add_Ctrl", function ($scope, model,$confirm, $filter, $timeout, amHttp, httpService, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService) {

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });

    })