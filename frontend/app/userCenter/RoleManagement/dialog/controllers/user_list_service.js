/**
 * Created by Administrator on 2017/5/15.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp'
    ],
    function (angularAMD) {
        angularAMD.service(
            'user_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "user_list_ctrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/RoleManagement/dialog/views/user_list.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("user_list_ctrl", function ($scope, amHttp, model, $filter,$timeout, $modalInstance, Notification, transervice, httpService, $q, $interval) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'USER_INFO_CODE', displayName: transervice.tran('用户编码')},
                    {field: 'STAFF_NAME_CN', displayName: transervice.tran('用户名称'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.u_staffinfo?row.entity.u_staffinfo.STAFF_NAME_CN:""}}</div>'}

                ],
                paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10, //每页显示个数
                useExternalPagination: true,//是否使用分页按钮

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
            if(model){
                $scope.exitData = model.exitUserList;
            }
            $scope.name = "用户选择";
            $scope.condition = model;
            $scope.init = function(currentPage, pageSize){
                var searchData = {
                    "where":["and", ["<>", "u_user_info.DELETED_STATE",1],["=","u_user_info.STAFF_STATE",1]],
                    "joinwith":["u_staffinfo"],
                    "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                };
                if( $scope.searchWhere!=null){
                    $scope.searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                    searchData = $scope.searchWhere;
                }
                var dataSearch =null;
                if ($scope.condition.length>0) {
                    dataSearch = ["not in","USER_INFO_ID",$scope.condition];
                }
                if(dataSearch!=null){
                    searchData.where.push(dataSearch);
                }

                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
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
            };
            $scope.init();

            //确定
            $scope.confirm = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return Notification.error(transervice.tran('请选择您要删除的数据！'));
                }
                $scope.model = [];

                angular.forEach(rows,function(obj){
                    $scope.model.push({
                        "USER_INFO_ID":obj.USER_INFO_ID,
                        "USER_INFO_CODE":obj.USER_INFO_CODE,
                        "STAFF_NAME_CN":obj.u_staffinfo.STAFF_NAME_CN,
                        "STAFF_CODE":obj.STAFF_CODE
                    })
                });

                $modalInstance.close($scope.model);//返回数据
            };

            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondition){
                    var condition = ["or",["like","u_user_info.USER_INFO_CODE",$scope.searchCondition],["like","u_user_info.STAFF_CODE",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where":["and", ["<>", "u_user_info.DELETED_STATE",1],["=","u_user_info.STAFF_STATE",1],condition],
                        "joinwith":["u_staffinfo"],
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

            //删除arr1中的出现在arr2的数据
            function removeDuplicate(arr1, arr2){
                var data = [];
                var index = 0;
                for (var i = 0 ; i <= arr1.length ; i ++ ){
                    var obj = arr1[i-index];
                    for(var j = 0 ; j < arr2.length ; j ++ ){
                        var orgItem = arr2[j];
                        if (obj.USER_INFO_CODE == orgItem.USER_INFO_CODE){
                            arr1.splice(i-index,1);
                            arr2.splice(j,1);
                            index++;
                            break;
                        }
                    }
                }
                return arr1;
            }

        })
    });


