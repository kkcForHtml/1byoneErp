/**
 * Created by Administrator on 2017/5/15.
 */
/**
 * Created by Administrator on 2017/5/15.
 */
/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService"
    ],
    function (angularAMD) {
        angularAMD.service(
            'staffInfo_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "staffInfo_add_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/StaffManagement/dialog/views/staffInfo_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("staffInfo_add_Ctrl", function ($scope, amHttp,commonService, model, $timeout,$filter,$modalInstance, Notification, transervice, httpService, $q, $interval) {
            if(model){
                $scope.model = angular.copy(model);
                $scope.model.STAFF_STATE = "1";
            }

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
                var data = {
                    "STAFF_CODE":$scope.model.STAFF_CODE,
                    "ORGANISATION_CODE":$scope.model.ORGANISATION_CODE,
                    "STAFF_NAME_CN":$scope.model.STAFF_NAME_CN,
                    "STAFF_PHONE":$scope.model.STAFF_PHONE,
                    "STAFF_EMAIL":$scope.model.STAFF_EMAIL,
                    "STAFF_TEL":$scope.model.STAFF_TEL,
                    "STAFF_ADDRESS":$scope.model.STAFF_ADDRESS,
                    "STAFF_REMARKS":$scope.model.STAFF_REMARKS
                };
                httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "create", "POST", data).then(function (result) {
                    if (result != null && result.status == 200) {
                        Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据
                    }else{
                        Notification.error({message: result.message, delay: 5000});
                    }
                })
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });
    });