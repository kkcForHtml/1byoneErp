define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        'app/userCenter/userManagement/controllers/userInfo_edit_service',
        'app/userCenter/roleManagement/controllers/roleInfo_edit_service',
        'app/userCenter/organisation/controllers/organisation_edit_service'
    ],
    function (angularAMD) {

        angularAMD.service(
            'userPermissionService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "userPermissionListCtrl",
                            backdrop: "static",
                            size: "65%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/permissions/views/userpermissionlist.html?ver=' + _version_,
                            resolve: {

                                model: function () {
                                    return model;
                                }

                            }
                        }).result;
                };


            }
        );
        angularAMD.controller("userPermissionListCtrl", function ($scope, amHttp, $modalInstance, model, transervice, uiGridConstants, commonService, httpService, gridDefaultOptionsService, userInfo_edit_service, roleInfo_edit_service, organisation_edit_service) {

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'USERNAME',
                        width: 100,
                        displayName: transervice.tran('用户名称'),
                        enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.STAFF_NAME_CN}}</a>'
                    },
                    {field: 'SUBSYSTEM', displayName: transervice.tran('子系统'), enableCellEdit: false},
                    {field: 'FUNC_MODULE', displayName: transervice.tran('模块'), enableCellEdit: false},
                    {field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'), enableCellEdit: false},
                    {field: 'PERMISSION_NAME_CN', displayName: transervice.tran('权限名'), enableCellEdit: false},
                    {field: 'PERMISSIONR_REMARKS', displayName: transervice.tran('权限说明'), enableCellEdit: false},
                    {
                        field: 'STATE', displayName: transervice.tran('权限状态'), enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getStateName(row.entity.STATE)}}</div>'

                        /*cellTemplate:
                         '<label ng-if="row.entity.STATE==1">有权</label>'+
                         '<label ng-if="row.entity.STATE==0">无权</label>'*/
                    }

                ],
                paginationPageSize: 10, //每页显示个数
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {

                            //$modalInstance.close(row.entity);
                        }
                    });
                }

            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            $scope.userType = commonService.getDicList("USER_INFO");

            $scope.stateList = commonService.getDicList("STATE");

            $scope.permissionState = [{"D_VALUE": 1, "D_NAME_CN": "有权"}, {"D_VALUE": 0, "D_NAME_CN": "无权"}];


            if (model) {
                $scope.model = angular.copy(model);
                $scope.userName = $scope.model.USERNAME;
            }

            //初始化
            function init(currentPage, pageSize) {

                var userName = "";
                if ($scope.userName !== undefined) {
                    userName = $scope.userName;
                }
                var dataSearch = {
                    "USERNAME": userName,
                    "STATE": $scope.model.STATE,
                    "isAdmin":$scope.model.isAdmin,
                    "limit": pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                    "page": currentPage ? currentPage : 1
                };
                httpService.httpHelper(httpService.webApi.api, "users/personalr", "getuserpermission", "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if (datas.data.length) {
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        $scope.gridOptions.data = datas.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }

                    }
                });


            }

            //初始化
            init();
            getOrgData();

            $scope.getStateName = function (value) {
                var permissionState = $scope.permissionState.filter(t=>t.D_VALUE == value);
                if (permissionState.length) {
                    return permissionState[0].D_NAME_CN;
                }
                return "";
            }

            //查询行政职能
            function getOrgData() {
                var dataSearch = {
                    "where": ["and", ["=", "o_organisation_relation_middle.ENTITY_STATE", 1], ["=", "o_organisation_relation_middle.FUNCTION_ID", 1]],
                    "joinwith": ["o_organisationt"],
                    "limit": 0
                };
                return httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                    var poOrgList = datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
                    $scope.businessOrgList = poOrgList;
                });
            };
            //刷新查询
            $scope.searchUserPermission = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }

            $scope.gridOptions.getGridApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };

            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                init(pageNo, pageSize);
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }

            //编辑用户
            $scope.edit = function (item) {
                //查询用户信息
                var selectData = {
                    "where": ["=", "u_user_info.USER_INFO_ID", item.USER_INFO_ID],
                    "joinwith": ["u_userinfoc", "u_role_user", "o_grouping", "u_staffinfo", "o_organisation", "u_category", "u_user_organization"],
                };
                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "view", "POST", selectData).then(
                    function (result) {
                        var obj = result.data;
                        if (obj) {
                            obj.ORGANISATION_NAME_CN = obj.o_organisation != null ? obj.o_organisation.ORGANISATION_NAME_CN : "";
                            obj.ROLE_INFO_NAME_CN = obj.u_staffinfo != null ? obj.u_staffinfo.ROLE_INFO_NAME_CN : "";
                            if (obj.u_role_user != null) {
                                var roleCode = [];
                                var roleName = [];
                                obj.u_role_user.forEach(d=> {
                                    roleCode.push(d.ROLE_INFO_CODE);
                                    roleName.push(d.u_roleInfo == null ? "" : d.u_roleInfo.ROLE_INFO_NAME_CN);
                                });
                                obj.ROLE_INFO_CODE = roleCode.join(",");
                                obj.ROLE_INFO_NAME_CN = roleName.join(",");
                            }

                            obj['userType'] = $scope.userType;
                            obj['businessOrgList'] = $scope.businessOrgList;
                            obj['stateList'] = $scope.stateList;
                            userInfo_edit_service.showDialog(obj).then(function (data) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                                init();
                            });
                        }
                    })


            };


        });


    })
