/**
 * Created by Administrator on 2017/5/24.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'ngFileUpload',
        'app/common/Services/commonService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'import_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "importPuPlanCtrl",
                            backdrop: "static",
                            size: "lg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/purchasingCenter/purchasingPlan/views/import_template.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("importPuPlanCtrl", function ($scope, amHttp, model, Upload,$timeout, $modalInstance, Notification, transervice, httpService,commonService) {
            $scope.uploadImg = '';

            //确认
            $scope.submit = function () {
                $scope.upload($scope.file);
            };
            $scope.upload = function (file) {
                $scope.fileInfo = file;
                Upload.upload({
                    //服务端接收
                    url: httpService.webApi.api+'/purchase/plan/importplan',
                    //上传的同时带的参数
                    data: {'fileName': $scope.fileInfo.name},
                    //上传的文件
                    file: file
                }).success(function (data, status, headers, config) {
                    //上传成功
                    Notification.success(transervice.tran(data.message));
                    $modalInstance.close();//返回数据

                }).error(function (data, status, headers, config) {
                    $scope.message = data.message;
                });
            };


            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        })
    });
