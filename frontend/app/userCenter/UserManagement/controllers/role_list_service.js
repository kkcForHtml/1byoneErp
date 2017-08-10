
/**
 * Created by Administrator on 2017/5/14.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'role_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "role_list_ctrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/userManagement/views/organisation_list.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("role_list_ctrl", function ($scope, amHttp, model, $timeout, $modalInstance,messageService, Notification, transervice, httpService, $q, $interval,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'ROLE_INFO_CODE',enableCellEdit: false,
                        displayName: transervice.tran('角色编码')
                    },
                    {field: 'ROLE_INFO_NAME_CN',enableCellEdit: false, displayName: transervice.tran('角色名称')}
                ],
                paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10,
                enableSelectAll: model.multiSelect?true:false,
                multiSelect: model.multiSelect?true:false,
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
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            $scope.name = "角色选择";
            $scope.placeholderName = "角色编码/名称";
            $scope.condition = model;
            $scope.model = model;
            $scope.init = function(currentPage, pageSize){
                var searchData = {
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if($scope.searchWhere){
                    $scope.searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                    searchData = $scope.searchWhere;
                }
                var dataSearch =null;
                if ($scope.condition) {
                    if($scope.condition.containId.length){
                        dataSearch = ["not in","ROLE_INFO_ID",$scope.condition.containId];
                    }
                    if($scope.condition.inId.length){
                        dataSearch = ["in","ROLE_INFO_ID",$scope.condition.inId];
                    }
                    if($scope.condition.inId.length && $scope.condition.containId.length){
                        dataSearch = ["and",["not in","ROLE_INFO_ID",$scope.condition.containId],["in","ROLE_INFO_ID",$scope.condition.inId]];
                    }
                }
                if(dataSearch!=null){
                    if($scope.searchWhere){
                        searchData.where = ["and",dataSearch,$scope.searchWhere.where];
                    }else{
                        //searchData.where.push(dataSearch);
                        searchData.where = dataSearch;
                    }
                }
                searchData.orderby = "u_role_info.UPDATED_AT desc ";
                searchData.distinct = true;
                httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.gridOptions.totalItems = result._meta.totalCount;
                            $scope.gridOptions.data = result.data;
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                        } else{
                            Notification.error({message: result.message, delay: 5000});
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
                $scope.model = [];
                angular.forEach(rows,function(obj){
                    $scope.model.push({
                        "ROLE_INFO_ID":obj.ROLE_INFO_ID,
                        "ROLE_INFO_CODE":obj.ROLE_INFO_CODE,
                        "ROLE_INFO_NAME_CN":obj.ROLE_INFO_NAME_CN
                    });
                });
                $modalInstance.close($scope.model);//返回数据
            };
            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondition){
                    var condition = ["or",["like","ROLE_INFO_CODE",$scope.searchCondition],["like","ROLE_INFO_NAME_CN",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where":condition
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


