define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        'app/common/Services/gridDefaultOptionsService'
    ],
    function (angularAMD) {

        angularAMD.service(
            'role_menu_permission_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "role_menu_permissionList_Ctrl",
                            backdrop: "static",
                            size: "lg", //lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/roleManagement/views/roleMenuPermissionlist.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }

                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("role_menu_permissionList_Ctrl", function ($scope, model, amHttp, $modalInstance, gridDefaultOptionsService, transervice, uiGridConstants, httpService) {

            $scope.gridOptions = {
                columnDefs: [
                    { field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色'), enableCellEdit: false },
                    { field: 'MENUS_NAME_CN', displayName: transervice.tran('菜单'), enableCellEdit: false },
                    { field: 'IS_PERMISSION', displayName: transervice.tran('权限状态'), enableCellEdit: false, cellTemplate: '<div class="ui-grid-cell-contents">{{(+row.entity.IS_PERMISSION)?"有权":"无权"}}</div>' }
                ],
                paginationPageSize: 10,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                }

            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);


            if (model) {
                $scope.roleName = model.ROLE_INFO_NAME_CN;
            }

            var dataTotals = [], paginationPageSize = 10;
            $scope.init = function (num) {

                var dataSearch = {
                    "ROLE_INFO_NAME_CN": $scope.roleName
                };
                httpService.httpHelper(httpService.webApi.api, "users/permission", "checkmenuspermission", "POST", dataSearch).then(function (datas) {
                    if (datas.data.length) {
                        dataTotals = datas.data;
                        $scope.gridOptions.totalItems = dataTotals.length;
                        $scope.gridOptions.paginationCurrentPage = 1;
                        $scope.gridOptions.data = selectArray(dataTotals, 0, $scope.gridOptions.paginationPageSize);
                    }

                });
            };
            $scope.init();

            $scope.gridOptions.getPage = function (newPage, pageSize) {
                var start = (newPage - 1) * pageSize, end = newPage * pageSize, totals = dataTotals.length;
                if (paginationPageSize == pageSize) {
                    $scope.gridOptions.data = selectArray(dataTotals, start, end > totals ? totals : end);
                } else {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.gridOptions.data = selectArray(dataTotals, 0, pageSize);
                }
                paginationPageSize = pageSize;
            }
            $scope.$watch('$scope.gridOptions.paginationPageSize', function () {
                console.log(1);
            })
            function selectArray(arr, start, end) {
                return arr.filter(function (obj, index) {
                    return index >= start && index < end;
                })
            }
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }



        });


    })