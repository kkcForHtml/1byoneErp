/**
 * Created by Administrator on 2017/5/14.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/messageService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'staff_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "staff_list_ctrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/userManagement/views/staff_list.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("staff_list_ctrl", function ($scope, amHttp, model, $timeout, $modalInstance,messageService, Notification, transervice, httpService, $q, $interval,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'STAFF_CODE',
                        enableCellEdit: false,
                        displayName: transervice.tran('员工编码')
                    },
                    {field: 'STAFF_NAME_CN',enableCellEdit: false, displayName: transervice.tran('员工姓名')},
                    {field: 'ORGANISATION_CODE',enableCellEdit: false, displayName: transervice.tran('所属组织'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.o_organisation?row.entity.o_organisation.ORGANISATION_NAME_CN:""}}</div>'
                    }
                ],


                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            /* $scope.clearAll();
                             $scope.selectedRow = row.entity;
                             row.isSelected = true;*/
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            $scope.init = function(currentPage, pageSize){
                var searchData = {
                    "where":["and",["<>","u_staff_info.STAFF_STATE",0]],
                    "joinwith":["o_organisation"],
                    "distinct": true,
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if($scope.searchWhere){
                    $scope.searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                    searchData = $scope.searchWhere;
                }
                httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
                    function (result) {
                        $scope.gridOptions.totalItems = result._meta.totalCount;
                        $scope.gridOptions.data = result.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    });
            }
            $scope.init();

            //确定
            $scope.confirm = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                $scope.model = rows[0];
                $modalInstance.close($scope.model);//返回数据
            };
            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondition){
                    var condition = ["or",["like","u_staff_info.STAFF_CODE",$scope.searchCondition],["like","u_staff_info.STAFF_NAME_CN",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where":["and", ["<>","u_staff_info.STAFF_STATE",0],condition],
                        "joinwith":["o_organisation"],
                        "distinct": true
                    };
                }else{
                    $scope.searchWhere = null;
                }
                $scope.init();
            };

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }
            $scope.clearAll = function() {
                $scope.gridApi.selection.clearSelectedRows();
            };
            //取消
            $scope.exit = function () {
                $modalInstance.dismiss(false);
            };
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };


        });
    });


