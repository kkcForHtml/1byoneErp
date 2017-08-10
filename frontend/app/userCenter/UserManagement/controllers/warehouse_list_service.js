/**
 * Created by Administrator on 2017/7/21.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'warehouse_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "warehouse_list_ctrl",
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
        angularAMD.controller("warehouse_list_ctrl", function ($scope, amHttp, model, $timeout, $modalInstance,messageService, Notification,gridDefaultOptionsService, transervice, httpService, $q, $interval) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'WAREHOUSE_CODE',enableCellEdit: false,
                        displayName: transervice.tran('仓库编码')
                    },
                    {field: 'WAREHOUSE_NAME_CN',enableCellEdit: false, displayName: transervice.tran('仓库名称')}
                ],
                paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10,
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
                            /*$scope.clearAll();
                             $scope.selectedRow = row.entity;
                             row.isSelected = true;*/
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            $scope.name = "仓库选择";
            $scope.placeholderName = "仓库编码/名称";
            $scope.condition = model;
            $scope.init = function(currentPage, pageSize){
                var searchData = {
                    "where":["=","WAREHOUSE_STATE",1],
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if( $scope.searchWhere!=null){
                    $scope.searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                    searchData = $scope.searchWhere;
                }
                var dataSearch =null;
                if ($scope.condition) {
                    if($scope.condition.orgId.length){
                        dataSearch = ["in","ORGANISATION_ID",$scope.condition.orgId];
                    }
                    if($scope.condition.warehouseId.length){
                        dataSearch = ["not in","WAREHOUSE_ID",$scope.condition.warehouseId];
                    }
                    if($scope.condition.warehouseId.length&&$scope.condition.orgId.length){
                        dataSearch = ["and",["in","ORGANISATION_ID",$scope.condition.orgId],["not in","WAREHOUSE_ID",$scope.condition.warehouseId]];
                    }
                }
                if(dataSearch!=null ){
                    if($scope.searchWhere!=null || searchData.where.length>3){
                        searchData.where.push(dataSearch);
                    }else{
                        searchData.where = ["and",["=","WAREHOUSE_STATE",1],dataSearch]
                    }
                }
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
                    function (result) {

                        $scope.gridOptions.totalItems=result._meta.totalCount;
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
                $scope.model = [];
                angular.forEach(rows,function(obj){
                    $scope.model.push({
                        "WAREHOUSE_ID":obj.WAREHOUSE_ID,
                        "WAREHOUSE_CODE":obj.WAREHOUSE_CODE,
                        "WAREHOUSE_NAME_CN":obj.WAREHOUSE_NAME_CN,
                        "ORGANISATION_ID":obj.ORGANISATION_ID,
                        "USER_WAREHOUSE_STATE":1,
                        "isSelected":true
                    });
                });
                $modalInstance.close($scope.model);//返回数据
            };
            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondition){
                    var condition = ["or",["like","WAREHOUSE_CODE",$scope.searchCondition],["like","WAREHOUSE_NAME_CN",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where":["and", ["=","WAREHOUSE_STATE",1],condition]
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


