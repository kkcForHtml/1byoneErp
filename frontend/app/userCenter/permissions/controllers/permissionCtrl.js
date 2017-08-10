define([
    "app/userCenter/permissions/controllers/rolePermissionService",
    "app/userCenter/permissions/controllers/userPermissionService",
    "app/userCenter/permissions/controllers/userChooseService",
    "app/userCenter/permissions/controllers/roleChooseService",
    "app/userCenter/permissions/controllers/systemChooseService",
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'css!styles/css/angular.treeview.css',
    'css!bowerLibs/angular-tree-dnd/dist/ng-tree-dnd.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/directives/angular.treeview',
    'app/common/Services/gridDefaultOptionsService',
    'app/userCenter/userManagement/controllers/role_list_service',
    'app/common/Services/configService',
], function () {
    return ['$scope', '$confirm', 'Notification', 'configService','rolePermissionService', 'userPermissionService','userChooseService','roleChooseService', 'systemChooseService','transervice', 'amHttp','httpService', 'uiGridConstants',  '$q','gridDefaultOptionsService','role_list_service',
        function ($scope, $confirm, Notification,configService, rolePermissionService, userPermissionService,userChooseService,roleChooseService,systemChooseService, transervice, amHttp, httpService, uiGridConstants,  $q,gridDefaultOptionsService,role_list_service) {

            //所有权限组信息
            $scope.permissionarray = new Array();
            //单个子系统对应的权限组信息
            $scope.rowpermissionarray = new Array();
            //初始化
            $scope.userSearchTag = true;


            $scope.gridSystemsOptions = {
                columnDefs: [
                    { field: 'SUBSYSTEM', displayName: transervice.tran('子系统'),enableCellEdit: false},
                    { field: 'FUNC_MODULE', displayName: transervice.tran('模块') ,enableCellEdit: false},
                    { field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'), enableCellEdit: false }

                ],
                enableSelectAll: false,
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                enableFullRowSelection : false, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                multiSelect: false,
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
                                })


                                $scope.gridPermissionsOptions.totalItems = $scope.rowpermissionarray.length;
                                $scope.gridPermissionsOptions.data=$scope.rowpermissionarray;
                            }


                        }
                    });

                }

            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridSystemsOptions);



            $scope.gridPermissionsOptions = {
                columnDefs: [
                    { field: 'PERMISSION_NAME_CN', displayName: transervice.tran('权限项'), enableCellEdit: false },
                    { field: 'PERMISSIONR_REMARKS', displayName: transervice.tran('权限说明'),  enableCellEdit: false },
                    { field: 'STATE', displayName: transervice.tran('有权'), enableCellEdit: false, cellTemplate:
                        '<input type="checkbox" class="styled" ng-model="stateFlag"  ng-if="row.entity.STATE==1" ng-checked=true></input>'+
                        '<input type="checkbox" class="styled" ng-model="stateFlag"  ng-if="row.entity.STATE==0" ng-checked=false></input>'}

                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                enableRowHeaderSelection: false, //是否显示选中checkbox框 ,默认为true
                enableSelectAll: false, // 选择所有checkbox是否可用，默认为true;
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
                            var containNotChoose = $scope.gridPermissionsOptions.data.filter(d=>{return d.STATE==0});
                            $scope.isSelectAll = containNotChoose.length?false:true;
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

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridPermissionsOptions);
            $scope.tips = function(){
                if($scope.isSelectAll){
                    $scope.gridPermissionsOptions.data.length&&$scope.gridPermissionsOptions.data.forEach(d=>{d.STATE=1})
                }
            }

            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            $scope.userId = $scope.userInfo.USER_INFO_ID;
            $scope.isAdmin = 2;
            //查询当前登录用户和角色分配的业务系统权限
            $scope.exitBSystemsId = [];
            function init() {
                var data = $scope.userInfo.u_role_user.filter(e=>e.ROLE_INFO_ID);
                data = data.filter(d=>{return d.u_roleInfo.ROLE_TYPE_ID==3});
                if(data.length>0){
                    $scope.isAdmin = 1;
                };
                var dataSearch = {
                    "USER_INFO_ID": $scope.userId
                };
                httpService.httpHelper(httpService.webApi.api, "users/busines", "getbusiniesbyuserorrole", "POST", dataSearch).then(function (datas) {
                    $scope.gridSystemsOptions.data = [];
                    datas.data.length && datas.data.forEach(d=> {
                        $scope.exitBSystemsId.push(d.BUSINESS_OBJECT_ID)
                    })
                });
            }
            init();


            //查询角色权限
            $scope.searchRolePermission = function () {
                rolePermissionService.showDialog();
            }

            //查询用户权限
            $scope.searchUserPermission = function () {
                var model = {
                    "isAdmin":$scope.isAdmin,
                    "STATE":3
                }
                userPermissionService.showDialog(model);
            }

            //搜索用户
            $scope.searchUsers = function () {
                var model = {"multiSelect":false};
                userChooseService.showDialog(model).then(function(data){

                    $scope.permissionarray.length = 0;
                    $scope.userInputName = data.u_staffinfo.STAFF_NAME_CN;
                    $scope.userCode = data.USER_INFO_ID;
                    var dataSearch = {
                        "USER_INFO_ID": $scope.userCode,
                        "isAdmin":$scope.isAdmin
                    };

                    searchSystems(dataSearch);
                })


            }

            //搜索角色
            $scope.searchRoles = function () {
                var inId = [];
                $scope.userInfo.u_role_user&&$scope.userInfo.u_role_user.forEach(d=>{
                    if(d.u_roleInfo&&d.u_roleInfo.ROLE_TYPE_ID!=3){
                        inId.push(d.ROLE_INFO_ID)
                    }
                });
                var roleSel = {};
                roleSel.containId = [];
                roleSel.inId = inId;
                role_list_service.showDialog(roleSel).then(function(data){
                    data=data[0];
                    $scope.permissionarray.length = 0;
                    $scope.roleInputName = data.ROLE_INFO_NAME_CN;
                    $scope.roleId = data.ROLE_INFO_ID;
                    $scope.roleCode = data.ROLE_INFO_ID;
                    var dataSearch = {
                        "ROLE_INFO_ID": $scope.roleCode
                    };

                    searchSystems(dataSearch);
                });

            }

            /**
             * 查询子系统
             * @param where
             */
            $scope.exitBSystemsId = [];
            function searchSystems(where) {

                httpService.httpHelper(httpService.webApi.api, "users/busines","getbusiniesbyuserorrole", "POST", where).then(function (datas) {
                    $scope.gridSystemsOptions.data = [];
                    if(datas.data.length>0){
                        $scope.gridSystemsOptions.totalItems = datas.data.length;
                        $scope.gridSystemsOptions.data=datas.data;

                        //获取子系统的权限组
                        getEachPermissions(datas.data,$scope.isAdmin);
                    } else {
                        $scope.isAdmin = 6;
                        //清除权限组列表
                        $scope.gridPermissionsOptions.data = [];
                    }
                })
            }

            /**
             * 获取子系统的权限组
             */
            function getEachPermissions(systems,isAdmin){

                var businessArray = new Array();
                angular.forEach(systems, function(obj, index) {
                    businessArray.push(obj.BUSINESS_OBJECT_ID);
                });

                if($scope.userCode) {
                    var conditon = {"USER_INFO_ID":$scope.userCode,
                        "BUSINESS_OBJECT_ID":businessArray,
                    "isAdmin":$scope.isAdmin};
                } else {
                    var conditon = {"ROLE_INFO_ID":$scope.roleCode,
                        "BUSINESS_OBJECT_ID":businessArray};
                }
                if($scope.isAdmin!=1&& $scope.isAdmin!=6){
                    conditon.STATE = 0;
                }else{
                    conditon.STATE = 3;
                }
                conditon.isAdmin = $scope.isAdmin;

                //查询封装相应子系统的权限组
                searchPermissinBySystem(conditon);

            }


            /**
             * 查询封装相应子系统的权限组
             */
            function searchPermissinBySystem(where) {

                httpService.httpHelper(httpService.webApi.api, "users/permissg","permissionsearch", "POST", where).then(function (datas) {

                    if(datas.data.length){
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
                            condition.push(obj.BUSINESS_OBJECT_ID);
                        })
                    }
                    var notCantain = {
                        "notInId":condition,
                        "inId":$scope.exitBSystemsId
                    };
                    systemChooseService.showDialog(notCantain).then(function(datas){
                        angular.forEach(datas, function(data, index){
                            var newData = {
                                "SUBSYSTEMID":data.SUBSYSTEMID,
                                "FUNC_MODULE_ID":data.FUNC_MODULE_ID,
                                "BUSINESS_OBJECT_ID":data.BUSINESS_OBJECT_ID,
                                "SUBSYSTEM":data.SUBSYSTEM,
                                "FUNC_MODULE":data.FUNC_MODULE,
                                "BUSINESS_OBJECT":data.BUSINESS_OBJECT
                            };
                            $scope.gridSystemsOptions.data.unshift(newData);
                        });
                        //获取子系统的权限组
                        getEachPermissions(datas);

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
                    return Notification.error(transervice.tran('请选择要操作的子系统权限！'));
                }

                var objectArray = new Array();
                angular.forEach(rows, function(obj, index){
                    debugger;
                    $scope.gridSystemsOptions.data.splice($scope.gridSystemsOptions.data.lastIndexOf(obj), 1);
                    objectArray.push(obj.BUSINESS_OBJECT_ID);
                });
                //移除数据
                //$scope.gridSystemsOptions.data.splice($scope.gridSystemsOptions.data.lastIndexOf(rows[0]), 1);

                var resultArray = new Array();
                angular.forEach($scope.permissionarray, function(obj, index){
                    if(objectArray.indexOf(obj.BUSINESS_OBJECT_ID) == -1){
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
                    var param = {"USER_INFO_ID":$scope.userCode,
                        "PERMISSION_INFO":$scope.permissionarray};
                } else if ($scope.roleCode != undefined && $scope.roleCode.length>0){
                    var param = {"ROLE_INFO_ID":$scope.roleCode,
                        "PERMISSION_INFO":$scope.permissionarray};
                }

                //调用授权接口
                httpService.httpHelper(httpService.webApi.api, "users/permissg","authority", "POST", param).then(function (datas) {

                    Notification.success(transervice.tran(datas.message));
                       // Notification.success(transervice.tran('授权成功'));


                })


            }
            /**
             * 刷新
             */
            $scope.refreshCurrent= function(){
                 $scope.userInputName = "";
                 $scope.userCode = "";
                 $scope.roleInputName = "";
                 $scope.roleCode = "";
                 clear();
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

        }]
});
