/**
 * Created by Administrator on 2017/5/14.
 */
/**
 * Created by Administrator on 2017/5/14.
 */
/**
 * Created by Administrator on 2017/5/14.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp'
    ],
    function (angularAMD) {
        angularAMD.service(
            'category_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "category_list_ctrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/UserManagement/dialog/views/organisation_list.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("category_list_ctrl", function ($scope, amHttp, model, $timeout, $modalInstance, Notification,gridDefaultOptionsService, transervice, httpService, $q, $interval) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'SYSTEM_NAME_CN',
                        displayName: transervice.tran('品类简称')
                    },
                    {field: 'SYSTEM_NAMER_CN', displayName: transervice.tran('品类全称')}
                ],

                enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
               /* paginationPageSizes: [20, 50, 100], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 20, //每页显示个数
                enableSelectAll: false,
                useExternalPagination: true,//是否使用分页按钮*/

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
            $scope.name = "品类选择";
            $scope.condition = model;
            $scope.init = function(currentPage, pageSize){
                var searchData = {
                    "where":["and", ["<>", "DELETED_STATE",1],["=","PRODUCTOT_TYPE_ID",0]],
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if( $scope.searchWhere!=null){
                    $scope.searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                    searchData = $scope.searchWhere;
                }
                var dataSearch =null;
                if ($scope.condition && $scope.condition.length>0) {
                    dataSearch = ["not in","PRODUCT_TYPE_ID",$scope.condition];
                }
                if(dataSearch!=null){
                    searchData.where.push(dataSearch);
                    //searchData.where=["and", ["<>", "DELETED_STATE",1],dataSearch];
                }
                httpService.httpHelper(httpService.webApi.api, "master/product/prodskut", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.gridOptions.totalItems=result._meta.totalCount;
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
                    return Notification.error(transervice.tran('请选择要添加的数据！'));
                }
                $scope.model = [];
                angular.forEach(rows,function(obj){
                    $scope.model.push({
                        "PRODUCT_TYPE_ID":obj.PRODUCT_TYPE_ID,
                        "SYSTEM_NAME_CN":obj.SYSTEM_NAME_CN,
                        "SYSTEM_NAMER_CN":obj.SYSTEM_NAMER_CN
                    });
                });
                $modalInstance.close($scope.model);//返回数据
            };
            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondition){
                    var condition = ["or",["like","SYSTEM_NAME_CN",$scope.searchCondition],["like","SYSTEM_NAME_EN",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where":["and", ["<>", "DELETED_STATE",1],["=","PRODUCTOT_TYPE_ID",0],condition]
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


