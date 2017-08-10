/**
 * Created by Fable on 2017/6/6.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'bowerLibs/common/md5',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        angularAMD.service(
            'change_password_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "change_passwordCtrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/main/views/change_password.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("change_passwordCtrl", function ($scope, amHttp, model, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, $location) {
            $scope.model = model;

            $scope.save = function () {
                var USERINFO = localStorage.getItem('USERINFO');
                USERINFO = angular.fromJson(USERINFO);


                if (!$scope.oldPassword) {
                    return Notification.error(transervice.tran('原密码不能为空'));
                }
                if (!$scope.newPassword) {
                    return Notification.error(transervice.tran('新密码不能为空'));
                }
                if (!$scope.confirmPassword) {
                    return Notification.error(transervice.tran('确认密码不能为空'));
                }
                if ($scope.newPassword != $scope.confirmPassword) {
                    return Notification.error(transervice.tran('两次输入的密码不匹配'));
                }

                var updatedata = new Object();

                updatedata['USER_INFO_ID'] = USERINFO.USER_INFO_ID;
                updatedata['oldPassword'] = angular.hex_md5($scope.oldPassword);
                updatedata['PASSWORD'] = angular.hex_md5($scope.newPassword);
                updatedata['USERNAME'] = USERINFO.USERNAME;
                updatedata['USER_INFO_CODE'] = USERINFO.USER_INFO_CODE;

                //请求接口 修改密码
                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "checkpwd", "POST", updatedata).then(function (datas) {
                    var datau = {
                        "batch": updatedata
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/userinfo", "update", "POST", datau).then(
                        function (datas) {
                            $scope.cancel();
                            Notification.success({message: "修改密码成功,请重新登陆！", delay: 2000});
                            localStorage.setItem('lastbrowse', $location.url());
                            localStorage.removeItem("USERINFO");
                            localStorage.removeItem("USERROLEINFO");
                            $location.path('/login');
                        }
                    );
                });
            }

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };
        });
    });