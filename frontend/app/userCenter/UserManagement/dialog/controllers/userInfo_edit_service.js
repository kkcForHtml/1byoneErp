/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/userCenter/UserManagement/dialog/controllers/organisation_list_service',
        'app/userCenter/UserManagement/dialog/controllers/role_list_service',
        'app/userCenter/UserManagement/dialog/controllers/category_list_service',
        "app/userCenter/RoleManagement/dialog/controllers/roleInfo_add_service"
    ],
    function (angularAMD) {
        angularAMD.service(
            'userInfo_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "userInfo_edit_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/UserManagement/dialog/views/userInfo_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("userInfo_edit_Ctrl", function ($scope, amHttp, model, $timeout, $modalInstance, Notification, transervice, httpService,organisation_list_service,role_list_service,category_list_service,roleInfo_add_service) {
            //组织
            $scope.orgGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'ORGANISATION_CODE', displayName: transervice.tran('组织编码')},
                    {field: 'ORGANISATION_NAME_CN', displayName: transervice.tran('组织')}
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.orggridApi = gridApi;
                    //行选中事件
                    $scope.orggridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };
            //角色
            $scope.roleGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'ROLE_INFO_CODE', displayName: transervice.tran('角色编码')},
                    {field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色名称')}
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.rolegridApi = gridApi;
                    //行选中事件
                    $scope.rolegridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                }
            };
            //品类CATEGORY
            $scope.categoryGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'SYSTEM_NAME_CN', displayName: transervice.tran('品类名称')},
                    {field: 'SYSTEM_NAMER_CN', displayName: transervice.tran('品类全称')}
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.categorygridApi = gridApi;
                    //行选中事件
                    $scope.categorygridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                }
            };

            if(model){
                $scope.model = angular.copy(model);
                $scope.model.org = "org";
                $scope.model.role = "role";
                $scope.model.category = "category";
                if($scope.model.businessOrgList!=null){
                    for (var i = 0; i < $scope.model.businessOrgList.length; i++){
                        var obj = $scope.model.businessOrgList[i];
                        if (obj.ORGANISATION_CODE == $scope.model.ORGANISATION_CODE) {
                            $scope.model.o_grouping = obj.o_grouping;
                            break;
                        }
                    }
                }
                if(model.u_user_organization!=null){
                    var orgDta = [];
                    model.u_user_organization.forEach(d=>{
                        orgDta.push({
                            "ORGANISATION_ID" :d.o_organisation.ORGANISATION_ID,
                            "ORGANISATION_CODE": d.ORGANISATION_CODE,
                            "ORGANISATION_NAME_CN": d.o_organisation.ORGANISATION_NAME_CN
                        });
                    });
                    $scope.orgGridOption.data = orgDta;
                }
                if(model.u_role_user!=null){
                    var roleData = [];
                    model.u_role_user.forEach(d=> {
                        roleData.push({
                            "ROLE_INFO_ID":d.u_roleInfo.ROLE_INFO_ID,
                            "ROLE_INFO_CODE": d.ROLE_INFO_CODE,
                            "ROLE_INFO_NAME_CN": d.u_roleInfo.ROLE_INFO_NAME_CN
                        });
                    });
                    $scope.roleGridOption.data = roleData;
                }
                if(model.u_user_category!=null){
                    var categoryData = [];
                    model.u_user_category.forEach(d=> {
                        categoryData.push({
                            "PRODUCT_TYPE_ID": d.PRODUCT_TYPE_ID,
                            "SYSTEM_NAME_CN": d.p_category.SYSTEM_NAME_CN,
                            "SYSTEM_NAMER_CN":d.p_category.SYSTEM_NAMER_CN
                        });
                    });
                    $scope.categoryGridOption.data = categoryData;
                }
            }

            //行政职能和所属分组二级联动
            $scope.changeSelect = function (value) {
                for (var i = 0; i < $scope.model.businessOrgList.length; i++){
                    var obj = $scope.model.businessOrgList[i];
                    if (obj.ORGANISATION_CODE == $scope.model.ORGANISATION_CODE) {
                        $scope.model.o_grouping = obj.o_grouping;
                        break;
                    }
                }
            };
            //分组grid添加空行
            $scope.addGroup = function (value) {
                var newData =[];
                if(value=="org"){
                    if($scope.orgGridOption.data.length>0){
                        angular.forEach($scope.orgGridOption.data,function(obj){
                            newData.push(obj.ORGANISATION_ID);
                        })
                    }
                    organisation_list_service.showDialog(newData).then(function(data){
                        angular.forEach(data,function(obj){
                            $scope.orgGridOption.data.unshift(obj);
                        });
                    });

                }else if(value=="role"){
                    var roleData = [];
                    if($scope.roleGridOption.data.length>0){
                        angular.forEach($scope.roleGridOption.data,function(obj){
                            roleData.push(obj.ROLE_INFO_ID);
                        })
                    }
                    role_list_service.showDialog(roleData).then(function(data){
                        angular.forEach(data,function(obj){
                            $scope.roleGridOption.data.unshift(obj);
                        });
                    });
                }else if(value=="category"){
                    var categoryData = [];
                    if($scope.categoryGridOption.data.length>0){
                        angular.forEach($scope.categoryGridOption.data,function(obj){
                            categoryData.push(obj.PRODUCT_TYPE_ID);
                        })
                    }
                    category_list_service.showDialog(categoryData).then(function(data){
                        angular.forEach(data,function(obj){
                            $scope.categoryGridOption.data.unshift(obj);
                        });
                    });
                }
            };
            //分组grid删除行
            $scope.moveGroup = function (value) {
                var rows=[];
                if(value=="org"){
                    rows = $scope.orggridApi.selection.getSelectedRows();
                }else if(value=="role"){
                    rows = $scope.rolegridApi.selection.getSelectedRows();
                }else if(value=="category"){
                    rows = $scope.categorygridApi.selection.getSelectedRows();
                }
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要删除的数据！'));
                }
                if(value=="org"){
                    $scope.orgGridOption.data = removeDuplicate($scope.orgGridOption.data,rows);
                    $scope.model['u_user_organization'] = $scope.orgGridOption.data;
                    $scope.orggridApi.selection.clearSelectedRows();

                }else if(value=="role"){
                    $scope.roleGridOption.data = removeDuplicate($scope.roleGridOption.data,rows);
                    $scope.model['u_role_user'] = $scope.roleGridOption.data;
                    $scope.rolegridApi.selection.clearSelectedRows();

                }else if(value=="category"){
                    $scope.categoryGridOption.data = removeDuplicate($scope.categoryGridOption.data,rows);
                    $scope.model['u_user_category'] = $scope.categoryGridOption.data;
                    $scope.categorygridApi.selection.clearSelectedRows();
                }
            };
            //设置角色
            $scope.setRole = function () {
                var roleTypeList = commonService.getDicList("ROLE_INFO");
                var model = {
                    "roleTypeList": roleTypeList
                };
                roleInfo_add_service.showDialog(model);
            };
            $scope.save = function(){
                var errorMsg = "";
                if($scope.model.USER_INFO_CODE==null){
                    errorMsg = "用户编码为必填项!";
                }
                if($scope.model.USERNAME==null){
                    errorMsg = "登录账号为必填项!";
                }
                if ($scope.model.ORGANISATION_CODE == null) {
                    errorMsg = "行政组织为必填项!";
                }
                if(errorMsg.length>0){
                    Notification.error(transervice.tran(errorMsg));
                    return ;
                }
                var orgGridList= []
                if($scope.orgGridOption.data.lenght>0){
                    angular.forEach($scope.orgGridOption.data,function(obj){
                        orgGridList.push({
                            "ORGANISATION_CODE":obj.ORGANISATION_CODE
                        });
                    });
                }
                var roleGrigList = [];
                if($scope.roleGridOption.data.length>0){
                    angular.forEach($scope.roleGridOption.data,function(obj){
                        roleGrigList.push({
                            "ROLE_INFO_CODE":obj.ROLE_INFO_CODE,
                            "USER_INFO_CODE":$scope.model.USER_INFO_CODE
                        });
                    });
                }
                var categoryGridList = [];
                if($scope.categoryGridOption.data.length>0){
                    angular.forEach($scope.categoryGridOption.data,function(obj){
                        categoryGridList.push({
                            "PRODUCT_TYPE_ID":obj.PRODUCT_TYPE_ID
                        });
                    });
                }
                var data = {
                    "USER_INFO_ID":$scope.model.USER_INFO_ID,
                    "USER_INFO_CODE":$scope.model.USER_INFO_CODE,
                    "USERNAME":$scope.model.USERNAME,
                    "ORGANISATION_CODE":$scope.model.ORGANISATION_CODE,
                    "GROUPING_ID":$scope.model.GROUPING_ID,
                    "PASSWORD":$scope.model.PASSWORD,
                    "STAFF_CODE":$scope.model.STAFF_CODE,
                    "USER_INFO_TYPE":$scope.model.USER_INFO_TYPE,
                    "USER_PHONE":$scope.model.USER_PHONE,
                    "STAFF_STATE":$scope.model.STAFF_STATE,
                    "CUSER_CODE":$scope.model.CUSER_CODE,
                    "USER_REMARKS":$scope.model.USER_REMARKS,
                    "u_user_organization":orgGridList,
                    "u_role_user":roleGrigList,
                    "u_user_category":categoryGridList

                };
                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "update?id=" + $scope.model.USER_INFO_ID, "POST", data).then(function (result) {
                        Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据

                })
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }

            //删除arr1中的出现在arr2的数据
            function removeDuplicate(arr1, arr2){
                var data = [];
                var index = 0;
                for (var i = 0 ; i <= arr1.length ; i ++ ){
                    var obj = arr1[i-index];
                    for(var j = 0 ; j < arr2.length ; j ++ ){
                        var orgItem = arr2[j];
                        if (obj.ORGANISATION_CODE == orgItem.ORGANISATION_CODE){
                            arr1.splice(i-index,1);
                            arr2.splice(j,1);
                            index++;
                            break;
                        }
                    }
                }
                return arr1;
            }


        });
    });