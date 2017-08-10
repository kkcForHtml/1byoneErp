/**
 * Created by Administrator on 2017/5/15.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    "app/userCenter/permissions/controllers/rolePermissionService",
    "app/userCenter/roleManagement/controllers/roleInfo_add_service",
    "app/userCenter/roleManagement/controllers/roleInfo_edit_service",
    "app/userCenter/roleManagement/controllers/role_permission_service",
    "app/userCenter/userManagement/controllers/set_permission",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
    'app/common/Services/configService',
    'app/userCenter/roleManagement/controllers/role_menu_permission_service'
], function () {
    return ['$scope', '$confirm','commonService', 'Notification', 'httpService','$filter', 'configService','amHttp','messageService', 'transervice', 'uiGridConstants','rolePermissionService','roleInfo_add_service','roleInfo_edit_service','role_permission_service','set_permission','gridDefaultOptionsService','role_menu_permission_service',
        function ($scope, $confirm,commonService, Notification, httpService, $filter,configService,amHttp,messageService, transervice, uiGridConstants,rolePermissionService,roleInfo_add_service,roleInfo_edit_service,role_permission_service,set_permission,gridDefaultOptionsService,role_menu_permission_service) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'ROLE_INFO_CODE',enableCellEdit: false, displayName: transervice.tran('角色编码'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ROLE_INFO_CODE}}</a>'},
                    { field: 'ROLE_INFO_NAME_CN',enableCellEdit: false, displayName: transervice.tran('角色名称')},
                    { field: 'PERSONAL_ROLE_ID',enableCellEdit: false, displayName: transervice.tran('权限'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.seePermission(row.entity)">查看</a>'},
                    { field: 'menu',enableCellEdit: false, displayName: transervice.tran('菜单权限'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.seeMenuPermission(row.entity)">查看</a>'},
                    { field: 'ROLE_TYPE_ID', enableCellEdit: false,displayName: transervice.tran('类型'), cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'value',editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.ROLE_TYPE_ID.list" },
                    { field: 'CUSER_ID',enableCellEdit: false, displayName: transervice.tran('创建人') ,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{(row.entity.u_userinfo&&row.entity.u_userinfo.u_staffinfo2)?row.entity.u_userinfo.u_staffinfo2.STAFF_NAME_CN:""}}</div>'
                    }
                ],
                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                        if(getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            $scope.roleTypeList = commonService.getDicList("ROLE_INFO");
            $scope.init = function(currentPage, pageSize){
                var rowEntity = {
                    "fieldDataObjectMap": {
                        "ROLE_TYPE_ID": {
                            "list": $scope.roleTypeList
                        }
                    }
                };
                var selectWhere = {};
                if($scope.searchWhere){
                    selectWhere = $scope.searchWhere;
                }
                selectWhere.joinwith = ["u_role_user","u_userinfo"];
                selectWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                selectWhere.orderby = "u_role_info.UPDATED_AT desc";
                selectWhere.distinct = true;

                httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "index?page=" + (currentPage ? currentPage : 1), "POST",selectWhere).then(
                    function (result){
                        if (result != null && result.status == 200){
                            result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                            $scope.gridOptions.data = result.data;
                            angular.forEach(result.data,function(obj){
                                obj.rowEntity = rowEntity;
                            });
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                        }else{
                        }
                    });
            };
            $scope.init();

            //新增
            $scope.add = function(){
                var model = {
                    "roleTypeList":$scope.roleTypeList
                };
                roleInfo_add_service.showDialog(model).then(function(data){
                    $scope.gridOptions.paginationCurrentPage=1;
                    $scope.init();
                });
            };
            //编辑
            $scope.edit = function(item){
                item["roleTypeList"] = $scope.roleTypeList;
                roleInfo_edit_service.showDialog(item).then(function(data){
                    $scope.gridOptions.paginationCurrentPage=1;
                    $scope.init();
                });
            };

            //删除数据
            $scope.del = function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function () {
                    var myArray=[];
                    for(var i=0;i<rows.length;i++){
                        myArray[i]=rows[i];
                    }
                    var deleteRowModel = {
                        "batch": myArray
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "delete", "POST",deleteRowModel).then(function(result){
                        Notification.success(transervice.tran(result.message));
                        $scope.init();
                    });
                },function(){
                    $scope.gridApi.selection.clearSelectedRows();
                });
            };

            //设置权限
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            $scope.setPermission = function(){
                var inId = [];
                $scope.userInfo.u_role_user&&$scope.userInfo.u_role_user.forEach(d=>{
                    if(d.u_roleInfo&&d.u_roleInfo.ROLE_TYPE_ID!=3){
                        inId.push(d.ROLE_INFO_ID)
                    }
                });
                var model = {
                    "userRoleId":inId
                }
                set_permission.showDialog(model);
            };



            /*//查看权限
             $scope.seePermission = function(entity){
             var model = {
             "ROLE_INFO_CODE":entity.ROLE_INFO_CODE
             };
             role_permission_service.showDialog(model)
             };
             */
            //查看权限
            $scope.seePermission = function(entity){
                var model = {
                    "ROLE_INFO_NAME_CN":entity.ROLE_INFO_NAME_CN
                };
                rolePermissionService.showDialog(model)
            };
            
            //查看菜单权限
            $scope.seeMenuPermission=function (entity) {
                var model = {
                    "ROLE_INFO_NAME_CN":entity.ROLE_INFO_NAME_CN
                };
                role_menu_permission_service.showDialog(model);
            }


            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondtion){
                    var serach =["or",["like","u_role_info.ROLE_INFO_CODE",$scope.searchCondtion],["like","u_role_info.ROLE_INFO_NAME_CN",$scope.searchCondtion],["like","u.USERNAME",$scope.searchCondtion]];
                    $scope.searchWhere ={
                        "where":serach,
                    };
                }else{
                    $scope.searchWhere = null;
                }
                $scope.init();
            };

            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init(currentPage,pageSize);
            }

        }]
});