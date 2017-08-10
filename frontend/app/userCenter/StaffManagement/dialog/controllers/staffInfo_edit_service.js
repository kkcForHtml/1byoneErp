/**
 * Created by Administrator on 2017/5/16.
 */

define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService"
    ],
    function (angularAMD) {
        angularAMD.service(
            'staffInfo_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "staffInfo_edit_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/StaffManagement/dialog/views/staffInfo_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("staffInfo_edit_Ctrl", function ($scope, amHttp,commonService, model, $timeout,$filter,$modalInstance, Notification, transervice, httpService, $q, $interval) {
            if(model){
                $scope.model = angular.copy(model);
            }
            //保存
            $scope.save = function(){
                var errorMsg = "";
                if($scope.model.STAFF_CODE==null){
                    errorMsg = "角色编码为必填项!";
                }
                if($scope.model.STAFF_NAME_CN==null){
                    errorMsg = "角色名称为必填项!";
                }
                if($scope.model.ORGANISATION_CODE==null){
                    errorMsg = "所属组织为必填项!";
                }
                if(errorMsg.length>0){
                    Notification.error(transervice.tran(errorMsg));
                    return ;
                }

                httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "update?id=" + $scope.model.STAFF_ID, "POST", $scope.model).then(function (result) {
                    if (result != null && result.status == 200) {
                        Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据
                    }else{
                        Notification.error({message: result.message, delay: 5000});
                    }
                })
            };

            //审核audit
            $scope.audit = function(){
               var data = {
                   "AUDIT_STATE":1
               };
                httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "update", "POST", data).then(function (result) {
                    if (result != null && result.status == 200) {
                        $modalInstance.close($scope.model);//返回数据
                    }else{
                        Notification.error({message: result.message, delay: 5000});
                    }
                })

            };

            //反审核antiAudit
            $scope.antiAudit = function(){
                var data = {
                    "AUDIT_STATE":0
                };
                httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "update", "POST", data).then(function (result) {
                    if (result != null && result.status == 200) {
                        Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据
                    }else{
                        Notification.error({message: result.message, delay: 5000});
                    }
                })
            }


            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });
    });