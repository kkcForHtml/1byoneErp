/**
 * Created by Administrator on 2017/5/15.
 */
/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/userCenter/roleManagement/controllers/user_list_service',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/configService',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'roleInfo_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "roleInfo_add_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/roleManagement/views/roleInfo_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("roleInfo_add_Ctrl", function ($scope, amHttp,commonService,configService, $confirm,model,messageService, $timeout,$filter,$modalInstance,gridDefaultOptionsService, Notification, transervice, httpService, $q, $interval,user_list_service) {
            //角色
            $scope.userGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'USER_INFO_CODE',enableCellEdit: false, displayName: transervice.tran('用户编码')},
                    {field: 'USERNAME', enableCellEdit: false,displayName: transervice.tran('用户名称'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.u_userInfo.u_staffinfo.STAFF_NAME_CN}}</div>'}
                ],
                paginationPageSizes: [10,20,50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10//每页显示个数
                //---------------api---------------------
                /*onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }*/
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.userGridOption);
            $scope.userGridOption.getGridApi=function(gridApi){
                $scope.gridApi = gridApi;
                $scope.gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
            };
            $scope.userData=[];
            //分页
            $scope.userGridOption.getPage=function(pageNo,pageSize){
                $scope.userGridOption.data=getSubList($scope.userData,pageNo,pageSize);
            };
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            if(model){
                $scope.model = angular.copy(model);
                $scope.model.CUSER_CODE_NAME =($scope.userInfo&&$scope.userInfo.u_staffinfo2)?$scope.userInfo.u_staffinfo2.STAFF_NAME_CN:"";
            }
            var stateList = commonService.getDicList("STATE");
            var rowEntity = {
                "fieldDataObjectMap": {
                    "STAFF_STATE": {
                        "list": stateList
                    }
                }
            };

            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            $scope.gridData = $scope.userGridOption.data?angular.copy($scope.userGridOption.data):[];
            //分组grid添加空行
            $scope.addGroup = function () {
                var exitUserList = [];
                if($scope.userGridOption.data.length>0){
                    $scope.userData.forEach(d=>{
                        exitUserList.push(d.u_userInfo.USER_INFO_ID);
                    });
                }
                var model ={
                    "exitUserList":exitUserList
                };
                user_list_service.showDialog(model).then(function(data){
                    angular.forEach(data,function(obj){
                        obj.ROLE_USER_STATE = "1";
                        obj.rowEntity = rowEntity;
                        $scope.gridData.push(obj);
                        $scope.userData.unshift(obj);
                        //$scope.userGridOption.data.unshift(obj);
                    });
                    $scope.userGridOption.totalItems = $scope.userData.length;
                    $scope.userGridOption.getPage($scope.userGridOption.paginationCurrentPage,$scope.userGridOption.paginationPageSize)

                });
            };
            //分组grid删除行
            $scope.moveGroup = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                $scope.userData = $scope.userData.filter(a=>$.inArray(a, rows) == -1);
                $scope.userGridOption.data = $scope.userData;
                $scope.userGridOption.totalItems = $scope.userData.length;
                $scope.model['u_role_user'] = $scope.userData;
                $scope.userGridOption.getPage($scope.userGridOption.paginationCurrentPage,$scope.userGridOption.paginationPageSize)
                $scope.gridApi.selection.clearSelectedRows();
            };

            $scope.save = function(){
                var errorMsg = "";
                if($scope.model.ROLE_INFO_CODE==null){
                    errorMsg = "请输入角色编码";
                }
                if($scope.model.ROLE_INFO_NAME_CN==null){
                    errorMsg = "请输入角色名称";
                }
                if(errorMsg.length>0){
                    Notification.error(transervice.tran(errorMsg));
                    return ;
                }
                $scope.model.userGrigList = [];
                if($scope.userGridOption.data.length>0){
                    angular.forEach($scope.userData,function(obj){
                        $scope.model.userGrigList.push({
                            "USER_INFO_ID":obj.USER_INFO_ID,
                            "USER_INFO_CODE":obj.USER_INFO_CODE,
                            "ROLE_INFO_CODE":$scope.model.ROLE_INFO_CODE,
                            "ROLE_USER_STATE":obj.ROLE_USER_STATE
                        });
                    });
                }
                var data = {
                    "ROLE_INFO_CODE":$scope.model.ROLE_INFO_CODE,
                    "ROLE_INFO_NAME_CN":$scope.model.ROLE_INFO_NAME_CN,
                    "ROLE_TYPE_ID":$scope.model.ROLE_TYPE_ID,
                    "CUSER_CODE":$scope.model.CUSER_CODE,
                    "USER_INFO_REMARKS":$scope.model.USER_INFO_REMARKS,
                    "UUSER_CODE":$scope.model.UUSER_CODE,
                    "u_role_user":$scope.model.userGrigList
                };
                return httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "create", "POST", data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close($scope.model);//返回数据
                })
            };

            //模糊搜索
            $scope.search = function(){
                var data = angular.copy($scope.userGridOption.data);
                var newData = [];
                if($scope.searchCondtion) {
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        if ((obj.USER_INFO_CODE && obj.USER_INFO_CODE.indexOf($scope.searchCondtion)!=-1) || (obj.USERNAME && obj.USERNAME.indexOf($scope.searchCondtion)!=-1)) {
                            newData.push(obj);
                        }
                    }
                    $scope.userGridOption.data = angular.copy(newData);
                }else{
                    $scope.userGridOption.data = $scope.gridData;
                    $scope.userGridOption.totalItems = $scope.userGridOption.data.length;
                }
            };

            //取消
            $scope.cancel = function () {
                //$modalInstance.dismiss(false);
                $modalInstance.close($scope.model);//返回数据
            };
            function getSubList(datas,pageNo,pageSize){
                datas=[].concat(datas);
                var from=(pageNo-1)*pageSize;
                var to=from+pageSize;
                if(datas.size<(to+1)){
                    return datas.splice(from);
                }
                return datas.splice(from,pageSize);
            }

        });
    });