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
        "app/common/Services/TranService",
        'app/common/Services/configService',
        'app/common/Services/messageService'
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
                            templateUrl: 'app/userCenter/staffManagement/views/staffInfo_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("staffInfo_add_Ctrl", function ($scope, amHttp,commonService,messageService, configService,model, $timeout,$filter,$modalInstance, Notification, transervice, httpService, $q, $interval) {
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            if(model){
                $scope.model = angular.copy(model);
                $scope.model.CUSER_CODE = $scope.userInfo?$scope.userInfo.USER_INFO_CODE:"";
                $scope.model.CUSER_CODE_NAME = ($scope.userInfo&&$scope.userInfo.u_staffinfo2)?$scope.userInfo.u_staffinfo2.STAFF_NAME_CN:"";
                $scope.model.STAFF_STATE = "1";
            }

            $scope.save = function(){
                if($scope.model.STAFF_CODE==null || $scope.model.STAFF_CODE.length==0){
                    return Notification.error(transervice.tran("请输入员工编号"));
                }
                if($scope.model.STAFF_NAME_CN==null|| $scope.model.STAFF_NAME_CN.length==0){
                    return Notification.error(transervice.tran("请输入员工姓名"));
                }
                if($scope.model.ORGANISATION_ID==null|| $scope.model.ORGANISATION_ID.length==0){
                    return Notification.error(transervice.tran("请输入所属组织"));
                }
                if($scope.model.STAFF_EMAIL!=null && $scope.model.STAFF_EMAIL.length>0){
                    var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
                    var isok= reg.test($scope.model.STAFF_EMAIL);
                    if (!isok) {
                        return Notification.error(transervice.tran("请输入有效邮箱！"));
                    }
                }
                if($scope.model.STAFF_PHONE!=null && $scope.model.STAFF_PHONE.length>0){
                    var re = /^[1-9]+[0-9]*]*$/;
                    if (!re.test($scope.model.STAFF_PHONE)) {
                        Notification.error(transervice.tran('请输入有效联系电话！'));
                        return;
                    }
                }
                if($scope.model.STAFF_TEL!=null && $scope.model.STAFF_TEL.length>0){
                    var reg = /^(0[1-9]{2})-\d{8}$|^(0[1-9]{3}-(\d{7,8}))$/;
                    var isok= reg.test($scope.model.STAFF_TEL);
                    if (!isok) {
                        return Notification.error(transervice.tran("请输入有效固定电话！如0755-1234567"));
                    }
                }
                var data = {
                    "STAFF_CODE":$scope.model.STAFF_CODE,
                    "ORGANISATION_ID":$scope.model.ORGANISATION_ID,
                    "STAFF_NAME_CN":$scope.model.STAFF_NAME_CN,
                    "STAFF_PHONE":$scope.model.STAFF_PHONE,
                    "STAFF_EMAIL":$scope.model.STAFF_EMAIL,
                    "STAFF_TEL":$scope.model.STAFF_TEL,
                    "STAFF_ADDRESS":$scope.model.STAFF_ADDRESS,
                    "STAFF_STATE":$scope.model.STAFF_STATE,
                    "STAFF_REMARKS":$scope.model.STAFF_REMARKS
                };
                return httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "create", "POST", data).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        //Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据

                })
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });
    });