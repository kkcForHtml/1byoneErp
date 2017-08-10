define(
    [  'angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt'
    ],
    function(angularAMD) {

        angularAMD.service(
            'role_permission_service',
            function($q, $modal) {
                this.showDialog = function(model) {
                    return $modal
                        .open({
                            animation : true,
                            controller : "role_permissionList_Ctrl",
                            backdrop:"static",
                            size:"lg",//lg,sm,md,llg,ssm
                            templateUrl : 'app/userCenter/permissions/dialog/views/rolepermissionlist.html?ver='+_version_,
                            resolve : {

                                model : function() {
                                    return model;
                                }

                            }
                        }).result;
                };


            }
        );
        angularAMD.controller("role_permissionList_Ctrl",function( $scope,model,amHttp,$modalInstance,transervice,uiGridConstants,httpService ){


            $scope.gridOptions = {
                columnDefs: [
                    { field: 'ROLE_INFO_NAME_CN', displayName: transervice.tran('角色'), enableCellEdit: false,cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ROLE_INFO_NAME_CN}}</a>' },
                    { field: 'SUBSYSTEM', displayName: transervice.tran('子系统'),enableCellEdit: false },
                    { field: 'FUNC_MODULE', displayName: transervice.tran('模块'), enableCellEdit: false},
                    { field: 'BUSINESS_OBJECT', displayName: transervice.tran('业务对象'),  enableCellEdit: false },
                    {field: 'PERMISSION_NAME_CN', displayName: transervice.tran('权限名'), enableCellEdit: false},
                    { field: 'AUTHORISATION_STATE', displayName: transervice.tran('权限状态'),  enableCellEdit: false }
                ],
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 5 //每页显示个数
            };

            if(model){
                $scope.roleName = model.ROLE_INFO_CODE;
            }
            var roleName = "";
            if ($scope.roleName !== undefined) {
                roleName = $scope.roleName;
            }
            var dataSearch = {
                "ROLE_INFO_CODE": roleName
            };
            httpService.httpHelper(httpService.webApi.api, "users/roleinfo","getrolepermissioninfo", "POST", dataSearch).then(function (datas) {
                $scope.gridOptions.data = [];
                if(datas.data.length){
                    $scope.gridOptions.totalItems = datas.data.length;
                    $scope.gridOptions.data=datas.data;
                }
            });

           /* //刷新查询
            $scope.searchRole = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }

            $scope.gridOptions.getGridApi=function(gridApi){
                $scope.gridApi=gridApi;
            };

            //切换页码
            $scope.gridOptions.getPage=function(pageNo,pageSize){
                init();
            };*/

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }



        });


    })
