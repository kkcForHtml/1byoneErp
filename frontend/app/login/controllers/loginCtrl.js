/*********************************************************
 * 开发人员：姚龙
 * 创建时间：2016-05-03
 * 描述说明：登陆页面
 * *******************************************************/
        define([
            'bowerLibs/common/dateFormat',
            'bowerLibs/common/md5',
            'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.css',
            'ngload!ui-notification',
            'ngload!ui.bootstrap',
            'app/common/Services/httpService',
            'app/common/Services/configService',
            'kendo-cultures',
            'kendo-messages',
            'kendo-angular',
            'app/common/directives/oneClick',
        ], function() {
            'use strict';
            return ['$scope', '$location', 'Notification', 'httpService', 'configService','transervice',
                function($scope, $location, Notification, httpService, configService,transervice) {

                //关闭弹出框
                    $(".modal-backdrop").remove();
                    $(".modal").remove();

                    var userStr = localStorage.getItem("USER");
                    if(userStr){
                        $scope.user=angular.fromJson(userStr);
                        if(!$scope.user.isRemember){
                            $scope.user={};
                        }
                    }



                    //传统登陆
                    $scope.login = function() {
                        if($scope.user.userName == undefined){
                            Notification.error(transervice.tran("请输入用户名"));
                            return;
                        }
                        if($scope.user.password == undefined ){
                            Notification.error(transervice.tran("请输入密码"));
                            return;
                        }

                        if ($scope.loginForm.$valid) {

                            var postModel = {
                                password: angular.hex_md5($scope.user.password),
                                username: $scope.user.userName,
                            }

                          return  httpService.httpHelper(httpService.webApi.api, "users/userinfo", "login", "POST", postModel).then(
                                    function(data) {

                                           var  selectData = {
                                                "joinwith":["u_staffinfo2",'u_role_user',"u_user_category","u_user_organization"]
                                            }

                                        httpService.httpHelper(httpService.webApi.api, "users/userinfo", "view?id="+data.data.USER_INFO_ID, "POST",selectData).then(function(datas){

                                            localStorage.setItem("USER", JSON.stringify($scope.user));
                                            localStorage.setItem("USERINFO", JSON.stringify(datas.data));
                                            localStorage.removeItem("DICTIONARY");
                                            configService.getDictionary();

                                            getMenuPermissions();
                                            getPagePermissions();
                                            httpService.waitData(function () {
                                                if(count==2){
                                                    return true;
                                                }
                                                return false;
                                            },function () {
                                                Notification.success({message: "登录成功", delay: 5000});
                                                $location.path('/main/index');
                                            })

                                        })


                                    });
                        } ;
                    }


                    var count=0
                    //缓存菜单权限
                    function getMenuPermissions(roleId) {
                        var search={
                            // ROLE_INFO_ID:roleId
                        }
                        httpService.httpHelper(httpService.webApi.api, "users/permission", "listmenuspermission", "POST",search).then(function(datas){
                            var menus=[]
                            if(datas.data&&datas.data.MENU_LIST){
                                menus=datas.data.MENU_LIST;
                                if(menus.length){
                                    menus=menus.filter(m=>m.IS_PERMISSION==1);
                                    sortMenu(menus);
                                    menus.forEach(m=>{
                                        m.SUB_MENUS=m.SUB_MENUS.filter(d=>d.IS_PERMISSION==1);
                                        sortMenu(m.SUB_MENUS);
                                    })
                                }
                            }
                            localStorage.setItem("MENUS", JSON.stringify(menus));
                            count++;  
                              
                        })

                        function sortMenu(datas){
                            datas.sort((a,b)=>(+a.MENUS_INDEX)-(+b.MENUS_INDEX));
                        }
                    }
                    
                    //缓存页面操作权限
                    function getPagePermissions() {
                        httpService.httpHelper(httpService.webApi.api, "common/base/rolemenus", "getoperation", "POST",{}).then(function(datas){
                            var permissions=datas.data;
                            localStorage.setItem("PERMISSIONS", JSON.stringify(permissions));
                            count++;

                        })
                    }


                }]
        });