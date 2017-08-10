/**
 * Created by Administrator on 2017/5/18.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        "app/userCenter/permissions/dialog/controllers/userChooseService",
        "app/userCenter/permissions/dialog/controllers/roleChooseService",
        "app/userCenter/permissions/dialog/controllers/systemChooseService"
    ],
    function (angularAMD) {

        angularAMD.service(
            'set_permission',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "set_permission_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/UserManagement/dialog/views/set_permission.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("set_permission_Ctrl", function ($scope,model, amHttp, $modalInstance, transervice,Notification, uiGridConstants, httpService,userChooseService,roleChooseService,systemChooseService) {
            //业务系统
            $scope.gridSystemsOptions = {
                columnDefs: [
                    { field: 'SUBSYSTEM', displayName: transervice.tran('子系统'),enableCellEdit: false},
                    { field: 'FUNC_MODULE', displayName: transervice.tran('模块') ,enableCellEdit: false},
                    { field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'), enableCellEdit: false }

                ],
                enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                enableRowHeaderSelection : true, //是否显示选中checkbox框 ,默认为true
                enableRowSelection : true, // 行选择是否可用，默认为true;
                multiSelect: false ,// 是否可以选择多个,默认为true;
                onRegisterApi: function(gridApi) {
                    $scope.gridSystemApi = gridApi;

                    //行选中事件
                    $scope.gridSystemApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){
                            if(row.entity.BUSINESS_OBJECT_ID) {
                                $scope.rowpermissionarray.length = 0;
                                /**
                                 * 取出对应业务对象的权限组数据显示
                                 */
                                angular.forEach($scope.permissionarray,function(obj,index){
                                    if (obj.BUSINESS_OBJECT_ID == row.entity.BUSINESS_OBJECT_ID) {
                                        $scope.rowpermissionarray.push(obj);
                                    }
                                });
                                $scope.gridPermissionsOptions.totalItems = $scope.rowpermissionarray.length;
                                $scope.gridPermissionsOptions.data=$scope.rowpermissionarray;
                            }
                        }
                    });
                }
            };
            //权限列表
            $scope.gridPermissionsOptions = {
                columnDefs: [
                    { field: 'PERMISSION_NAME_CN', displayName: transervice.tran('权限项'), cellClass: 'red', enableCellEdit: false },
                    { field: 'PERMISSIONR_REMARKS', displayName: transervice.tran('权限说明'), cellClass: 'red', enableCellEdit: false },
                    { field: 'STATE', displayName: transervice.tran('有权'), enableCellEdit: false, cellTemplate:
                    '<input type="checkbox" class="styled" ng-model="stateFlag"  ng-if="row.entity.STATE==1" ng-checked=true></input>'+
                    '<input type="checkbox" class="styled" ng-model="stateFlag"  ng-if="row.entity.STATE==0" ng-checked=false></input>'}

                ],

                enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;

                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){
                            if (row.entity.STATE == 1){
                                row.entity.STATE = 0;
                            } else {
                                row.entity.STATE = 1;
                            }
                            //改变对应的权限数组的信息值
                            angular.forEach($scope.permissionarray, function(obj, index) {
                                if (obj.PERMISSION_GROUPS_ID == row.PERMISSION_GROUPS_ID) {

                                    obj.STATE = row.entity.STATE;

                                }

                            });


                        }
                    });
                }


            };
            //所有权限组信息
            $scope.permissionarray = new Array();
            //单个子系统对应的权限组信息
            $scope.rowpermissionarray = new Array();
            $scope.userSearchTag = true;
            //搜索用户
            $scope.searchUsers = function () {
                userChooseService.showDialog().then(function(data){
                    $scope.permissionarray.length = 0;
                    $scope.userInputName = data.USERNAME;
                    $scope.userCode = data.USER_INFO_CODE;
                    var dataSearch = {
                        "USER_INFO_CODE": $scope.userCode
                    };
                    searchSystems(dataSearch);
                })
            };
            //搜索角色
            $scope.searchRoles = function () {

                roleChooseService.showDialog().then(function(data){
                    $scope.permissionarray.length = 0;
                    $scope.roleInputName =data.ROLE_INFO_NAME_CN;
                    $scope.roleCode = data.ROLE_INFO_CODE;
                    var dataSearch = {
                        "ROLE_INFO_CODE": $scope.roleCode
                    };
                    searchSystems(dataSearch);
                });

            }
            /**
             * 查询子系统
             * @param where
             */
            function searchSystems(where) {
                httpService.httpHelper(httpService.webApi.api, "users/busines","getbusiniesbyuserorrole", "POST", where).then(function (datas) {
                    $scope.gridSystemsOptions.data = [];
                    if(datas.data.length>0){
                        $scope.gridSystemsOptions.totalItems = datas.data.length;
                        $scope.gridSystemsOptions.data=datas.data;

                        //获取子系统的权限组
                        getEachPermissions(datas.data);
                    }
                })
            }
            /**
             * 获取子系统的权限组
             */
            function getEachPermissions(systems){
                angular.forEach(systems, function(obj, index) {
                    if($scope.userCode) {
                        var conditon = {"USER_INFO_CODE":$scope.userCode,
                            "BUSINESS_OBJECT_ID":obj.BUSINESS_OBJECT_ID};
                    } else {
                        var conditon = {"ROLE_INFO_CODE":$scope.roleCode,
                            "BUSINESS_OBJECT_ID":obj.BUSINESS_OBJECT_ID};
                    }
                    //查询封装相应子系统的权限组
                    searchPermissinBySystem(conditon);

                });
            }
            /**
             * 查询封装相应子系统的权限组
             */
            function searchPermissinBySystem(where) {

                httpService.httpHelper(httpService.webApi.api, "users/permissg","permissionsearch", "POST", where).then(function (datas) {

                    if(datas.data.length){
                        $scope.gridPermissionsOptions.data = datas.data;
                        angular.forEach(datas.data, function(obj, index) {
                            $scope.permissionarray.push(obj);
                        })

                    }

                })
            }

            /**
             * 授予角色和用户切换事件
             */
            $scope.changeValue = function() {
                if ($scope.choosetype == 1) {
                    //授予角色
                    $scope.userSearchTag = true;
                    $scope.roleSearchTag = false;
                    if ($scope.userInputName != undefined && $scope.userInputName != "") {
                        $scope.userInputName = "";
                        $scope.userCode = "";
                        //清理页面信息
                        clear();
                    }
                }
                else if ($scope.choosetype == 2) {
                    //授予用户
                    $scope.userSearchTag = false;
                    $scope.roleSearchTag = true;
                    if ($scope.roleInputName != undefined && $scope.roleInputName != "") {
                        $scope.roleInputName = "";
                        $scope.roleCode = "";
                        //清理页面信息
                        clear();
                    }
                }
            }
            /**
             * 清理页面信息
             */
            function clear() {
                $scope.gridSystemsOptions.data = [];
                $scope.gridPermissionsOptions.data = [];

                $scope.permissionarray.length = 0;
                $scope.rowpermissionarray.length = 0;

            }
            /**
             * 添加子系统
             */
            $scope.addSystem = function(){
                if (check()){
                    var currentData = $scope.gridSystemsOptions.data;
                    var condition = new Array();
                    if (currentData.length > 0) {
                        angular.forEach(currentData, function(obj, index){
                            condition.push(obj.BUSINESS_SYSTEM_ID);
                        })
                    }
                    systemChooseService.showDialog(condition).then(function(data){
                            var newData = {
                                "SUBSYSTEMID":data.SUBSYSTEMID,
                                "FUNC_MODULE_ID":data.FUNC_MODULE_ID,
                                "BUSINESS_OBJECT_ID":data.BUSINESS_OBJECT_ID,
                                "SUBSYSTEM":data.SUBSYSTEM,
                                "FUNC_MODULE":data.FUNC_MODULE,
                                "BUSINESS_OBJECT":data.BUSINESS_OBJECT

                            };
                            $scope.gridSystemsOptions.data.unshift(newData);


                        //获取子系统的权限组
                        var arr = new Array();
                        arr.push(data);
                        getEachPermissions(arr);

                    })


                } else {
                    Notification.error({message: "请先选择用户或者角色", delay: 5000});
                }


            }

            /**
             * 删除子系统
             */
            $scope.delSystem = function(){

                var rows = $scope.gridSystemApi.selection.getSelectedRows();
                var dataRow = $scope.gridSystemsOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择要删除的子系统权限！'));
                }

                //移除数据
                $scope.gridSystemsOptions.data.splice($scope.gridSystemsOptions.data.lastIndexOf(rows[0]), 1);

                var resultArray = new Array();
                angular.forEach($scope.permissionarray, function(obj, index){
                    if (rows[0].BUSINESS_OBJECT_ID !== obj.BUSINESS_OBJECT_ID) {
                        resultArray.push(obj);

                    }
                });
                //清空权限grid数据
                $scope.permissionarray = resultArray;
                $scope.gridPermissionsOptions.data = [];
                $scope.rowpermissionarray.length = 0;

            }
            /**
             * 授权
             */
            $scope.authority = function(){
                if(!check()) {
                    return Notification.error(transervice.tran('请选择要授权的角色或者用户'));
                }
                if($scope.userCode != undefined && $scope.userCode.length>0) {
                    var param = {"USER_INFO_CODE":$scope.userCode,
                        "PERMISSION_INFO":$scope.permissionarray};
                } else if ($scope.roleCode != undefined && $scope.roleCode.length>0){
                    var param = {"ROLE_INFO_CODE":$scope.roleCode,
                        "PERMISSION_INFO":$scope.permissionarray};
                }
                //调用授权接口
                httpService.httpHelper(httpService.webApi.api, "users/permissg","authority", "POST", param).then(function (datas) {

                    if(null != datas && datas.status == 200){

                        Notification.success(transervice.tran('授权成功'))
                    }
                })
            }
            /**
             * 校验是否选择了角色或者用户
             * @returns {boolean}
             */
            function check() {
                if (($scope.userInputName != undefined &&  $scope.userInputName.length>0) ||
                    ($scope.roleInputName != undefined &&  $scope.roleInputName.length>0)){
                    return true;
                }
                return false;
            }
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });
    });
