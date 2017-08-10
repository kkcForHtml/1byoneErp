/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/userCenter/UserManagement/dialog/controllers/organisation_list_service',
        'app/userCenter/UserManagement/dialog/controllers/role_list_service',
        'app/userCenter/UserManagement/dialog/controllers/category_list_service',
        "app/userCenter/RoleManagement/dialog/controllers/roleInfo_add_service"
    ],
    function (angularAMD) {
        angularAMD.service(
            'userInfo_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "userInfo_add_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/UserManagement/dialog/views/userInfo_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("userInfo_add_Ctrl", function ($scope, commonService, amHttp, model, $timeout, $modalInstance, Notification, transervice, httpService,$http, organisation_list_service, role_list_service, category_list_service, roleInfo_add_service) {
            if (model) {
                $scope.model = angular.copy(model);
                $scope.model.STAFF_STATE = "1";
            }
            $scope.model.o_grouping = [];
            $scope.model.org = "org";
            $scope.model.role = "role";
            $scope.model.category = "category";
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

                }
            };
            //角色
            $scope.roleGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'ROLE_INFO_CODE', displayName: transervice.tran('角色编码') },
                    {field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色名称')}
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.rolegridApi = gridApi;

                }
            };
            //品类CATEGORY
            $scope.categoryGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'SYSTEM_NAME_CN', displayName: transervice.tran('品类简称')},
                    {field: 'SYSTEM_NAMER_CN', displayName: transervice.tran('品类名称')}
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


            //行政职能和所属分组二级联动
            $scope.changeSelect = function (value) {
                for (var i = 0; i < $scope.model.businessOrgList.length; i++) {
                    var obj = $scope.model.businessOrgList[i];
                    if (obj.ORGANISATION_CODE == $scope.model.ORGANISATION_CODE) {
                        $scope.model.o_grouping = obj.o_grouping;
                        break;
                    }
                }
            };
            //分组grid添加空行
            $scope.addGroup = function (value) {
                var newData = null;
                if (value == "org") {
                    var currentData = $scope.orgGridOption.data;
                    var condition = new Array();
                    if (currentData.length > 0) {
                        angular.forEach(currentData, function(obj, index){
                            condition.push(obj.ORGANISATION_ID);
                        })
                    }
                    organisation_list_service.showDialog(condition).then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.orgGridOption.data.unshift(obj);
                        });
                    });

                } else if (value == "role") {
                    role_list_service.showDialog().then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.roleGridOption.data.unshift(obj);
                        });
                    });
                } else if (value == "category") {
                    category_list_service.showDialog().then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.categoryGridOption.data.unshift(obj);
                        });
                    });
                }
            };
            //分组grid删除行
            $scope.moveGroup = function (value) {
                var rows = [];
                if (value == "org") {
                    rows = $scope.orggridApi.selection.getSelectedRows();
                } else if (value == "role") {
                    rows = $scope.rolegridApi.selection.getSelectedRows();
                } else if (value == "category") {
                    rows = $scope.categorygridApi.selection.getSelectedRows();
                }
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要删除的数据！'));
                }
                if (value == "org") {
                    $scope.orgGridOption.data = removeDuplicate($scope.orgGridOption.data, rows);
                    $scope.orggridApi.selection.clearSelectedRows();

                } else if (value == "role") {
                    $scope.roleGridOption.data = removeDuplicate($scope.roleGridOption.data, rows);
                    $scope.rolegridApi.selection.clearSelectedRows();

                } else if (value == "category") {
                    $scope.categoryGridOption.data = removeDuplicate($scope.categoryGridOption.data, rows);
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

            $scope.save = function () {
                var errorMsg = "";
                if ($scope.model.USER_INFO_CODE == null) {
                    errorMsg = "用户编码为必填项!";
                }
                if ($scope.model.USERNAME == null) {
                    errorMsg = "登录账号为必填项!";
                }
                if ($scope.model.ORGANISATION_CODE == null) {
                    errorMsg = "行政组织为必填项!";
                }
                if (errorMsg.length > 0) {
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                var orgGridList = [];
                if ($scope.orgGridOption.data.lenght > 0) {
                    angular.forEach($scope.orgGridOption.data, function (obj) {
                        orgGridList.push({
                            "ORGANISATION_CODE": obj.ORGANISATION_CODE
                        });
                    });
                }
                var roleGrigList = [];
                if ($scope.roleGridOption.data.length > 0) {
                    angular.forEach($scope.roleGridOption.data, function (obj) {
                        roleGrigList.push({
                            "ROLE_INFO_CODE": obj.ROLE_INFO_CODE,
                            "USER_INFO_CODE": $scope.model.USER_INFO_CODE
                        });
                    });
                }
                var categoryGridList = [];
                if ($scope.categoryGridOption.data.length > 0) {
                    angular.forEach($scope.categoryGridOption.data, function (obj) {
                        roleGrigList.push({
                            "PRODUCT_TYPE_CODE": obj.PRODUCT_TYPE_CODE
                        });
                    });
                }
                var data = {
                    "USER_INFO_CODE": $scope.model.USER_INFO_CODE,
                    "USERNAME": $scope.model.USERNAME,
                    "ORGANISATION_CODE": $scope.model.ORGANISATION_CODE,
                    "GROUPING_ID": $scope.model.GROUPING_ID,
                    "PASSWORD": $scope.model.PASSWORD,
                    "STAFF_CODE": $scope.model.STAFF_CODE,
                    "USER_INFO_TYPE": $scope.model.USER_INFO_TYPE,
                    "USER_PHONE": $scope.model.USER_PHONE,
                    "STAFF_STATE": $scope.model.STAFF_STATE,
                    "CUSER_CODE": $scope.model.CUSER_CODE,
                    "USER_REMARKS": $scope.model.USER_REMARKS,
                    "u_user_organization": orgGridList,
                    "u_role_user": roleGrigList,
                    "u_user_category": categoryGridList

                };
                $scope.model.u_user_organization = $scope.orgGridOption.data;
                $scope.model.u_role_user = $scope.roleGridOption.data;
                $scope.model.u_user_category = $scope.categoryGridOption.data;
                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "create", "POST", $scope.model).then(function (result) {
                    Notification.success({message: result.message, delay: 2000});
                    $modalInstance.close($scope.model);//返回数据

                })


            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

            //删除arr1中的出现在arr2的数据
            function removeDuplicate(arr1, arr2) {
                var data = [];
                var index = 0;
                for (var i = 0; i <= arr1.length; i++) {
                    var obj = arr1[i - index];
                    for (var j = 0; j < arr2.length; j++) {
                        var orgItem = arr2[j];
                        if (obj.ORGANISATION_CODE == orgItem.ORGANISATION_CODE) {
                            arr1.splice(i - index, 1);
                            arr2.splice(j, 1);
                            index++;
                            break;
                        }
                    }
                }
                return arr1;
            }

        });
    });