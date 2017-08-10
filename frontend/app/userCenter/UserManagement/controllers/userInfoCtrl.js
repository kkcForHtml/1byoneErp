/**
 * Created by Administrator on 2017/5/12.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/userCenter/userManagement/controllers/userInfo_add_service",
    "app/userCenter/userManagement/controllers/userInfo_edit_service",
    "app/userCenter/permissions/controllers/userPermissionService",
    "app/userCenter/userManagement/controllers/set_permission",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
    'app/common/Services/configService',
], function () {
    return ['$scope', '$confirm', 'Notification','commonService', 'httpService','amHttp', 'transervice', 'configService','messageService','uiGridConstants', 'userInfo_add_service','userInfo_edit_service','userPermissionService','set_permission','gridDefaultOptionsService',
        function ($scope, $confirm, Notification, commonService,httpService, amHttp, transervice,configService, messageService,uiGridConstants, userInfo_add_service,userInfo_edit_service,userPermissionService,set_permission,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'USER_INFO_CODE',enableCellEdit: false, displayName: transervice.tran('用户编码'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.USER_INFO_CODE}}</a>'},
                    { field: 'STAFF_ID', displayName: transervice.tran('用户实名'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.u_staffinfo.STAFF_NAME_CN}}</div>'},
                    { field: 'ORGANISATION_ID',enableCellEdit: false, displayName: transervice.tran('组织编码'),
                        cellTemplate: '<div class="ui-grid-cell-contents ">{{row.entity.o_organisation.ORGANISATION_CODE}}</div>'},
                    { field: 'ORGANISATION_ID',enableCellEdit: false, displayName: transervice.tran('组织名称'),
                        cellTemplate: '<div class="ui-grid-cell-contents ">{{row.entity.o_organisation.ORGANISATION_NAME_CN}}</div>'},
                    { field: 'ROLE_INFO_CODE', enableCellEdit: false,displayName: transervice.tran('角色编码')},
                    { field: 'ROLE_INFO_NAME_CN',enableCellEdit: false, displayName: transervice.tran('角色名称')},
                    { field: 'PERSONAL_ROLE_ID',enableCellEdit: false, displayName: transervice.tran('权限'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.seePermission(row.entity)">查看</a>'},
                    { field: 'STAFF_STATE', enableCellEdit: false,displayName: transervice.tran('是否启用'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getStateName(row.entity.STAFF_STATE)}}</div>' }
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

            //查询行政职能
            function getOrgData() {
                configService.getOrganisationList([1]).then(function (datas) {
                    var res_list = new Array();
                    datas&&datas.forEach(d=> {
                        res_list.push(d);
                    });
                    $scope.businessOrgList = res_list;
                    init();
                })

            }
            getOrgData();
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            $scope.userId = $scope.userInfo.USER_INFO_ID;
            $scope.userRoleId = [];
            $scope.userType = commonService.getDicList("USER_INFO");
            $scope.stateList = commonService.getDicList("STATE");
            function init(currentPage, pageSize){
                //所有用户
                var selectData = {};
                if($scope.searchWhere){
                    selectData = $scope.searchWhere;
                }else{
                    selectData = {
                        "where":["<>","u_user_info.STAFF_STATE",0]
                    }
                }
                selectData.joinwith = ["u_userinfoc","u_role_user","o_grouping","u_staffinfo","o_organisation","u_category","u_user_organization","u_user_warehouse"];
                selectData.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                selectData.orderby = "u_user_info.STAFF_STATE desc,u_user_info.UPDATED_AT desc ";
                selectData.distinct = true;
                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "index?page=" + (currentPage ? currentPage : 1), "POST",selectData).then(
                    function (result){
                        result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                        $scope.gridOptions.data = result.data;
                        angular.forEach(result.data,function(obj){
                            obj.ORGANISATION_NAME_CN =obj.o_organisation!=null? obj.o_organisation.ORGANISATION_NAME_CN:"";
                            obj.ROLE_INFO_NAME_CN =obj.u_staffinfo!=null? obj.u_staffinfo.ROLE_INFO_NAME_CN:"";
                            if(obj.u_role_user.length>0){
                                var roleId = [];
                                var roleCode = [];
                                var roleName = [];
                                obj.u_role_user.forEach(d=>{
                                    if(d.u_roleInfo!=null){
                                        roleId.push(d.ROLE_INFO_ID);
                                        roleCode.push(d.u_roleInfo.ROLE_INFO_CODE);
                                        roleName.push(d.u_roleInfo.ROLE_INFO_NAME_CN);
                                    }
                                });
                                obj.roleId = roleId;
                                obj.ROLE_INFO_CODE = roleCode.join(",");
                                obj.ROLE_INFO_NAME_CN = roleName.join(",");
                            }
                        });
                        $scope.userInfo.u_role_user&&$scope.userInfo.u_role_user.forEach(d=>{
                            if(d.u_roleInfo&&d.u_roleInfo.ROLE_TYPE_ID!=3){
                                var data = $scope.gridOptions.data?$scope.gridOptions.data.filter(d=>{return (d.USER_INFO_ID == $scope.userId && d.USER_INFO_ID!=1)}):[];
                                if(data.length){
                                    $scope.userRoleId = data[0].roleId;
                                }
                            }
                        });

                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }

                    });
            };
            //$scope.init();
            //新增
            $scope.add = function(){
                var model = {
                    "userType":$scope.userType,
                    "businessOrgList":$scope.businessOrgList,
                    "stateList":$scope.stateList,
                    'userRoleId': $scope.userRoleId
                };
                userInfo_add_service.showDialog(model).then(function(data){
                    $scope.gridOptions.paginationCurrentPage=1;
                    init();
                });
            };

            //编辑
            $scope.edit = function(item){
                item['userType'] =  $scope.userType;
                item['businessOrgList'] = $scope.businessOrgList;
                item['stateList'] = $scope.stateList;
                item['userRoleId'] = $scope.userRoleId;
                userInfo_edit_service.showDialog(item).then(function(data){
                    init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
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
                        //myArray[i]=Number(rows[i]["USER_INFO_ID"]);
                        myArray[i]=rows[i];
                    }
                    var deleteRowModel = {
                        "batch":myArray
                    }
                    httpService.httpHelper(httpService.webApi.api, "users/userinfo", "delete", "POST",deleteRowModel).then(function(result){
                        Notification.success(transervice.tran(result.message));
                        init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                    });
                },function(){
                    $scope.gridApi.selection.clearSelectedRows();
                });
            };
            //设置权限
            $scope.setPermission = function(){
                var model = {
                    "userRoleId":$scope.userRoleId
                }
                set_permission.showDialog(model);
            };

            //查看权限
            $scope.seePermission = function(entity){
                $scope.isAdmin = 2;
                var data = $scope.userInfo.u_role_user.filter(e=>e.ROLE_INFO_ID);
                data = data.filter(d=>{return d.u_roleInfo.ROLE_TYPE_ID==3});
                if(data.length>0){
                    $scope.isAdmin = 1;
                };
                var model = {
                    "USER_INFO_CODE":entity.USER_INFO_CODE,
                    "USERNAME":entity.u_staffinfo.STAFF_NAME_CN,
                    "STATE":3,
                    "isAdmin":6
                };
                userPermissionService.showDialog(model)
            };

            //重置密码
            $scope.resetPassword = function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({ text: transervice.tran(messageService.confirm_reset_password) }).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["USER_INFO_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"USER_INFO_ID": myArray}},
                        "edit": {"PASSWORD": angular.hex_md5("654321")}
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/userinfo", "update", "POST", datadel).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        init();
                    })
                })
            };

            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondtion){
                    var serach =["or",["like","u_user_info.USER_INFO_CODE",$scope.searchCondtion],["like","u_user_info.USERNAME",$scope.searchCondtion]];
                    $scope.searchWhere ={
                        "where":["and",["<>","u_user_info.STAFF_STATE",0],serach],
                        "joinwith":["o_grouping","u_staffinfo","o_organisation","u_user_organization"]
                    };
                    if($scope.ctDisableCode){
                        $scope.searchWhere = {
                            "where": serach,
                            "joinwith":["o_grouping","u_staffinfo","o_organisation","u_user_organization"]
                        }
                    }
                }else if($scope.ctDisableCode){
                    $scope.searchWhere = {
                        "joinwith":["o_grouping","u_staffinfo","o_organisation","u_user_organization"]
                    }
                }else{
                    $scope.searchWhere = null;
                }
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            };

            //获取状态名称
            $scope.getStateName = function(value) {
                var docState=$scope.stateList.filter(c=>c.D_VALUE==value);
                if(docState.length){
                    return docState[0].D_NAME_CN;
                }
                return "";
            };

            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                init(currentPage,pageSize);
            }
        }]
});
