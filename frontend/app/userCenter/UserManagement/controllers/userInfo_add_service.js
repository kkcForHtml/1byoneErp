/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'bowerLibs/common/md5',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/userCenter/userManagement/controllers/organisation_list_service',
        'app/userCenter/userManagement/controllers/role_list_service',
        'app/userCenter/userManagement/controllers/category_list_service',
        'app/userCenter/userManagement/controllers/warehouse_list_service',
        "app/userCenter/roleManagement/controllers/roleInfo_add_service",
        'app/userCenter/userManagement/controllers/staff_list_service',
        'app/common/Services/configService',
        'app/common/Services/messageService'
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
                            size: "75%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/userManagement/views/userInfo_add.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("userInfo_add_Ctrl", function ($scope, commonService, configService, $confirm, messageService, amHttp, model, gridDefaultOptionsService, $timeout, $modalInstance, Notification, transervice, httpService, $http, organisation_list_service, role_list_service, category_list_service, roleInfo_add_service, staff_list_service, warehouse_list_service) {
            //组织
            $scope.orgGridOption = {
                columnDefs: [
                    {field: 'ORGANISATION_CODE', enableCellEdit: false, displayName: transervice.tran('组织编码')},
                    {field: 'ORGANISATION_NAME_CN', enableCellEdit: false, displayName: transervice.tran('组织')}
                ],
                paginationPageSizes: [10], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10 //每页显示个数
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.orgGridOption);
            $scope.orgGridOption.getGridApi = function (gridApi) {
                $scope.orggridApi = gridApi;
            };
            //分页
            $scope.orgData = [];
            $scope.orgGridOption.getPage = function (pageNo, pageSize) {
                $scope.orgGridOption.data = getSubList($scope.orgData, pageNo, pageSize);
            };
            //角色
            $scope.roleGridOption = {
                columnDefs: [
                    {field: 'ROLE_INFO_CODE', enableCellEdit: false, displayName: transervice.tran('角色编码')},
                    {field: 'ROLE_INFO_NAME_CN', enableCellEdit: false, displayName: transervice.tran('角色名称')}
                ],
                paginationPageSizes: [10], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10 //每页显示个数

            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.roleGridOption);
            $scope.roleGridOption.getGridApi = function (gridApi) {
                $scope.rolegridApi = gridApi;
            };

            $scope.roleData = [];
            //分页
            $scope.roleGridOption.getPage = function (pageNo, pageSize) {
                $scope.roleGridOption.data = getSubList($scope.roleData, pageNo, pageSize);
            };
            //品类CATEGORY
            $scope.categoryGridOption = {
                columnDefs: [
                    {field: 'SYSTEM_NAME_CN', enableCellEdit: false, displayName: transervice.tran('品类简称')},
                    {field: 'SYSTEM_NAMER_CN', enableCellEdit: false, displayName: transervice.tran('品类名称')}
                ],
                paginationPageSizes: [10], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10 //每页显示个数

            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.categoryGridOption);
            $scope.categoryGridOption.getGridApi = function (gridApi) {
                $scope.categorygridApi = gridApi;
            };
            $scope.categoryData = [];
            //分页
            $scope.categoryGridOption.getPage = function (pageNo, pageSize) {
                $scope.categoryGridOption.data = getSubList($scope.categoryData, pageNo, pageSize);
            };

            //仓库WAREHOUSE
            $scope.warehouseGridOption = {
                columnDefs: [
                    {field: 'WAREHOUSE_CODE', enableCellEdit: false, displayName: transervice.tran('仓库编码')},
                    {field: 'WAREHOUSE_NAME_CN', enableCellEdit: false, displayName: transervice.tran('仓库名称')},
                    {
                        field: 'USER_WAREHOUSE_STATE',
                        displayName: transervice.tran('有权'),
                        cellTemplate: '<input type="checkbox" class="styled" ng-model="row.entity.isSelected" id="{{row.entity.USER_WAREHOUSE_STATE}}" ng-change="grid.appScope.changeWarehouseState(row.entity)">',
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    }
                ],
                paginationPageSizes: [10], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10 //每页显示个数

            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.warehouseGridOption);
            $scope.warehouseGridOption.getGridApi = function (gridApi) {
                $scope.warehousegridApi = gridApi;
            };
            $scope.warehouseData = [];
            //分页
            $scope.warehouseGridOption.getPage = function (pageNo, pageSize) {
                $scope.warehouseGridOption.data = getSubList($scope.warehouseData, pageNo, pageSize);
            };

            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            if (model) {
                $scope.model = angular.copy(model);
                $scope.model.STAFF_STATE = "1";
                $scope.model.CUSER_CODE = $scope.userInfo ? $scope.userInfo.USER_INFO_CODE : "";
                $scope.model.CUSER_CODE_NAME = ($scope.userInfo&&$scope.userInfo.u_staffinfo2)?$scope.userInfo.u_staffinfo2.STAFF_NAME_CN:"";
            }
            $scope.model.o_grouping = [];
            $scope.model.org = "org";
            $scope.model.role = "role";
            $scope.model.category = "category";
            $scope.model.warehouse = "warehouse";
            //选择员工
            $scope.selectStaff = function () {
                staff_list_service.showDialog([]).then(function (data) {
                    if (data != null) {
                        $scope.model.u_staff_info = data;
                        $scope.model.STAFF_ID = data.STAFF_ID;
                        $scope.model.STAFF_NAME_CN = data.STAFF_NAME_CN;
                        $scope.model.USER_PHONE = data.STAFF_PHONE;
                        $scope.model.ORGANISATION_ID = data.ORGANISATION_ID;
                        $scope.model.USER_INFO_TYPE = "1";
                        for (var i = 0; i < $scope.model.businessOrgList.length; i++) {
                            var obj = $scope.model.businessOrgList[i];
                            if (obj.ORGANISATION_ID == $scope.model.ORGANISATION_ID) {
                                $scope.model.o_grouping = obj.o_grouping;
                                break;
                            }
                        }
                    }
                })
            };
            //行政职能和所属分组二级联动
            $scope.changeSelect = function (value) {
                for (var i = 0; i < $scope.model.businessOrgList.length; i++) {
                    var obj = $scope.model.businessOrgList[i];
                    if (obj.ORGANISATION_ID == $scope.model.ORGANISATION_ID) {
                        $scope.model.o_grouping = obj.o_grouping;
                        break;
                    }
                }
            };
            $scope.changeWare = function(value){

                $scope.model.isChecked = $scope.orgGridOption.data.length?true:false;
                if(!$scope.model.isChecked){
                    return Notification.error(transervice.tran(messageService.error_empty_org));
                }
            }

            //分组grid添加空行
            $scope.addGroup = function (value) {
                var newData = [];
                if (value == "org") {
                    if ($scope.orgGridOption.data.length > 0) {
                        angular.forEach($scope.orgData, function (obj) {
                            newData.push(obj.ORGANISATION_ID);
                        })
                    }
                    organisation_list_service.showDialog(newData).then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.orgData.unshift(obj);
                        });
                        $scope.orgGridOption.totalItems = $scope.orgData.length;
                        $scope.orgGridOption.getPage($scope.orgGridOption.paginationCurrentPage, $scope.orgGridOption.paginationPageSize)
                    });
                } else if (value == "role") {
                    if ($scope.roleGridOption.data.length > 0) {
                        angular.forEach($scope.roleData, function (obj) {
                            roleData.push(obj.ROLE_INFO_ID);
                        })
                    }
                    var roleData = [];
                    var inId = $scope.model.userRoleId;
                    var roleSel = {};
                    roleSel.containId = roleData;
                    roleSel.inId = inId;
                    role_list_service.showDialog(roleSel).then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.roleData.unshift(obj);
                        });
                        $scope.roleGridOption.totalItems = $scope.roleData.length;
                        $scope.roleGridOption.getPage($scope.roleGridOption.paginationCurrentPage, $scope.roleGridOption.paginationPageSize)
                    });
                } else if (value == "category") {
                    var categoryData = [];
                    if ($scope.categoryGridOption.data.length > 0) {
                        angular.forEach($scope.categoryData, function (obj) {
                            categoryData.push(obj.PRODUCT_TYPE_ID);
                        })
                    }
                    category_list_service.showDialog(categoryData).then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.categoryData.unshift(obj);
                        });
                        $scope.categoryGridOption.totalItems = $scope.categoryData.length;
                        $scope.categoryGridOption.getPage($scope.categoryGridOption.paginationCurrentPage, $scope.categoryGridOption.paginationPageSize)
                    });
                } else if (value == "warehouse") {
                    if(!$scope.orgData.length){
                        return Notification.error(transervice.tran(messageService.error_empty_org));
                    }
                    var newData = [];
                    angular.forEach($scope.orgData, function (obj) {
                        newData.push(obj.ORGANISATION_ID);
                    })
                    var warehouseData = [];
                    if ($scope.warehouseGridOption.data.length > 0) {
                        angular.forEach($scope.warehouseData, function (obj) {
                            warehouseData.push(obj.WAREHOUSE_ID);
                        })
                    }
                    var notInData = {};
                    notInData.orgId = newData;
                    notInData.warehouseId = warehouseData;
                    warehouse_list_service.showDialog(notInData).then(function (data) {
                        angular.forEach(data, function (obj) {
                            $scope.warehouseData.unshift(obj);
                        });
                        $scope.warehouseGridOption.totalItems = $scope.warehouseData.length;
                        $scope.warehouseGridOption.getPage($scope.warehouseGridOption.paginationCurrentPage, $scope.warehouseGridOption.paginationPageSize)
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
                } else if (value == "warehouse") {
                    rows = $scope.warehousegridApi.selection.getSelectedRows();
                }
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                if (value == "org") {
                    $scope.orgData = $scope.orgData.filter(a=>$.inArray(a, rows) == -1);
                    $scope.orgGridOption.data = $scope.orgData;
                    $scope.orgGridOption.totalItems = $scope.orgData.length;
                    $scope.orgGridOption.getPage($scope.orgGridOption.paginationCurrentPage, $scope.orgGridOption.paginationPageSize);
                    $scope.model['u_user_organization'] = $scope.orgData;
                    $scope.orggridApi.selection.getSelectedRows().length&&$scope.orggridApi.selection.clearSelectedRows();
                    var delOrgId = [];
                    rows.forEach(d=>{
                        delOrgId = $scope.warehouseData.filter(a=>{return a.ORGANISATION_ID == d.ORGANISATION_ID});
                    });
                    $scope.warehouseData = $scope.warehouseData.filter(a=>$.inArray(a, delOrgId) == -1);
                    $scope.warehouseGridOption.data = $scope.warehouseData;
                    $scope.warehouseGridOption.totalItems = $scope.warehouseData.length;
                    $scope.model['u_user_warehouse'] = $scope.warehouseData;
                    $scope.warehouseGridOption.getPage($scope.warehouseGridOption.paginationCurrentPage, $scope.warehouseGridOption.paginationPageSize)
                } else if (value == "role") {
                    $scope.roleData = $scope.roleData.filter(a=>$.inArray(a, rows) == -1);
                    $scope.roleGridOption.data = $scope.roleData;
                    $scope.roleGridOption.totalItems = $scope.roleData.length;
                    $scope.roleGridOption.getPage($scope.roleGridOption.paginationCurrentPage, $scope.roleGridOption.paginationPageSize);
                    $scope.model['u_role_user'] = $scope.roleData;
                    $scope.rolegridApi.selection.getSelectedRows().length&&$scope.rolegridApi.selection.clearSelectedRows();
                } else if (value == "category") {
                    $scope.categoryData = $scope.categoryData.filter(a=>$.inArray(a, rows) == -1);
                    $scope.categoryGridOption.data = $scope.categoryData;
                    $scope.categoryGridOption.totalItems = $scope.categoryData.length;
                    $scope.model['u_category'] = $scope.categoryData;
                    $scope.categoryGridOption.getPage($scope.categoryGridOption.paginationCurrentPage, $scope.categoryGridOption.paginationPageSize)
                    $scope.categorygridApi.selection.getSelectedRows().length&&$scope.categorygridApi.selection.clearSelectedRows();
                }
                else if (value == "warehouse") {
                    $scope.warehouseData = $scope.warehouseData.filter(a=>$.inArray(a, rows) == -1);
                    $scope.warehouseGridOption.data = $scope.warehouseData;
                    $scope.warehouseGridOption.totalItems = $scope.warehouseData.length;
                    $scope.model['u_user_warehouse'] = $scope.warehouseData;
                    $scope.warehouseGridOption.getPage($scope.warehouseGridOption.paginationCurrentPage, $scope.warehouseGridOption.paginationPageSize)
                    $scope.warehousegridApi.selection.getSelectedRows().length&&$scope.warehousegridApi.selection.clearSelectedRows();
                }

            };
            //设置角色
            $scope.setRole = function () {
                var roleTypeList = commonService.getDicList("ROLE_INFO");
                var model = {
                    "roleTypeList": roleTypeList
                };
                roleInfo_add_service.showDialog(model).then(function (data) {
                    var roleData = [];
                    var selectData = {
                        "where": ["=", "u_role_info.ROLE_INFO_CODE", data.ROLE_INFO_CODE],
                        //"joinwith":["u_roleUser"],
                        "limit": 0
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "index", "POST", selectData).then(function (result) {
                        $scope.roleGridOption.data.unshift({
                            "ROLE_INFO_ID": result.data[0].ROLE_INFO_ID,
                            "ROLE_INFO_CODE": result.data[0].ROLE_INFO_CODE,
                            "ROLE_INFO_NAME_CN": result.data[0].ROLE_INFO_NAME_CN
                        });
                        $scope.roleGridOption.totalItems = $scope.roleGridOption.data.length;
                    })
                });
            };
            $scope.changeType = function () {
                $scope.model.STAFF_NAME_CN = null;
                $scope.model.u_staff_info = {};
            }
            $scope.save = function () {
                if ($scope.model.USER_INFO_CODE == null || $scope.model.USER_INFO_CODE.length <= 0) {
                    return Notification.error(transervice.tran("请输入用户编码"));
                }
                if ($scope.model.USERNAME == null || $scope.model.USERNAME.length <= 0) {
                    return Notification.error(transervice.tran("请输入登录账号"));
                }
                if ($scope.model.ORGANISATION_ID == null || $scope.model.ORGANISATION_ID.length <= 0) {
                    return Notification.error(transervice.tran("请输入行政组织"));
                }
                if ($scope.model.PASSWORD == null || $scope.model.PASSWORD.length <= 0) {
                    return Notification.error(transervice.tran("请输入密码"));
                }
                if ($scope.model.STAFF_NAME_CN == null || $scope.model.STAFF_NAME_CN.length <= 0) {
                    $scope.model.USER_PHONE = null;
                    $scope.model.u_staff_info = null;
                    return Notification.error(transervice.tran("请输入用户实名"));
                }
                if ($scope.model.USER_PHONE != null && $scope.model.USER_PHONE.length > 0) {
                    var reg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
                    var isok = reg.test($scope.model.USER_PHONE);
                    if (!isok) {
                        return Notification.error(transervice.tran("请输入11位有效移动电话！"));
                    }
                }
                var password = angular.hex_md5($scope.model.PASSWORD);

                if ($scope.model.u_staff_info && $scope.model.STAFF_NAME_CN == $scope.model.u_staff_info.STAFF_NAME_CN) {
                    $scope.model.USER_INFO_TYPE = 1;
                } else {
                    $scope.model.USER_INFO_TYPE = 2;
                    $scope.model.STAFF_ID = $scope.model.STAFF_NAME_CN;
                }
                var orgGridList = [];
                if ($scope.orgData.length > 0) {
                    $scope.orgData.forEach(obj=> {
                        orgGridList.push({
                            "ORGANISATION_CODE": obj.ORGANISATION_CODE,
                            "ORGANISATION_ID": obj.ORGANISATION_ID
                        });
                    });
                }
                var roleGrigList = [];
                if ($scope.roleData.length > 0) {
                    $scope.roleData.forEach(obj=> {
                        roleGrigList.push({
                            "ROLE_INFO_ID": obj.ROLE_INFO_ID,
                            "ROLE_INFO_CODE": obj.ROLE_INFO_CODE,
                            "USER_INFO_CODE": $scope.model.USER_INFO_CODE
                        });
                    });
                }
                var categoryGridList = [];
                if ($scope.categoryData.length > 0) {
                    $scope.categoryData.forEach(obj=> {
                        categoryGridList.push({
                            "PRODUCT_TYPE_ID": obj.PRODUCT_TYPE_ID
                        });
                    });
                }
                var warehouseGridList = [];
                if ($scope.warehouseData.length > 0) {
                    $scope.warehouseData.forEach(obj=> {
                        warehouseGridList.push({
                            "WAREHOUSE_ID": obj.WAREHOUSE_ID,
                            "WAREHOUSE_CODE": obj.WAREHOUSE_CODE,
                            "USER_WAREHOUSE_STATE":obj.isSelected?1:0
                        });
                    });
                }
                var data = {
                    "USER_INFO_CODE": $scope.model.USER_INFO_CODE,
                    "USERNAME": $scope.model.USERNAME,
                    "ORGANISATION_ID": $scope.model.ORGANISATION_ID,
                    "GROUPING_ID": $scope.model.GROUPING_ID,
                    "PASSWORD": password,
                    "STAFF_ID": $scope.model.STAFF_ID,
                    "USER_INFO_TYPE": $scope.model.USER_INFO_TYPE,
                    "USER_PHONE": $scope.model.USER_PHONE,
                    "STAFF_STATE": $scope.model.STAFF_STATE,
                    "CUSER_CODE": $scope.model.CUSER_CODE,
                    "USER_REMARKS": $scope.model.USER_REMARKS,
                    "u_user_organization": orgGridList,
                    "u_role_user": roleGrigList,
                    "u_user_category": categoryGridList,
                    "u_user_warehouse": warehouseGridList
                };
                $scope.model.u_user_organization = $scope.orgGridOption.data;
                $scope.model.u_role_user = $scope.roleGridOption.data;
                $scope.model.u_category = $scope.categoryGridOption.data;
                return httpService.httpHelper(httpService.webApi.api, "users/userinfo", "create", "POST", data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close($scope.model);//返回数据
                })
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close($scope.model);//返回数据
                //$modalInstance.dismiss(false);
            };

            //前端分页
            function getSubList(datas, pageNo, pageSize) {
                datas = [].concat(datas);
                var from = (pageNo - 1) * pageSize;
                var to = from + pageSize;
                if (datas.size < (to + 1)) {
                    return datas.splice(from);
                }
                return datas.splice(from, pageSize);
            }

        });
    });