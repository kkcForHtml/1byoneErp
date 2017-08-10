/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/userCenter/roleManagement/controllers/user_list_service',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'roleInfo_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "roleInfo_edit_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/roleManagement/views/roleInfo_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("roleInfo_edit_Ctrl", function ($scope, amHttp,commonService,$confirm, model,messageService, $timeout,$filter,gridDefaultOptionsService,$modalInstance, Notification, transervice, httpService, $q, $interval,user_list_service) {
            //用户选择
            $scope.userGridOption = {
                columnDefs: [
                    {field: 'USER_INFO_CODE', enableCellEdit: false,displayName: transervice.tran('用户编码'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.u_userInfo?row.entity.u_userInfo.USER_INFO_CODE:row.entity.u_userinfo.USER_INFO_CODE}}</div>'
                    },
                    {field: 'STAFF_NAME_CN', enableCellEdit: false,displayName: transervice.tran('用户名称'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{(row.entity.u_userInfo && row.entity.u_userInfo.u_staffinfo)?row.entity.u_userInfo.u_staffinfo.STAFF_NAME_CN:row.entity.u_userinfo.STAFF_CODE}}</div>'
                    }
                ],
                paginationPageSizes: [10,20,50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10,//每页显示个数
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
            $scope.userData = [];
            //分页
            $scope.userGridOption.getPage=function(pageNo,pageSize){
                $scope.userGridOption.data=getSubList($scope.userData,pageNo,pageSize);
            };

            var stateList = commonService.getDicList("STATE");
            var rowEntity = {
                "fieldDataObjectMap": {
                    "ROLE_USER_STATE": {
                        "list": stateList
                    }
                }
            };
            if(model){
                $scope.model = angular.copy(model);
                $scope.model.CUSER_CODE_NAME = ($scope.model.u_userinfo&&$scope.model.u_userinfo.u_staffinfo2)?$scope.model.u_userinfo.u_staffinfo2.STAFF_NAME_CN:null;
                if($scope.model.u_role_user && $scope.model.u_role_user.length>0){
                    angular.forEach($scope.model.u_role_user,function(obj){
                        obj.rowEntity = rowEntity;
                    });
                    $scope.userData = $scope.model.u_role_user;
                    $scope.userGridOption.getPage($scope.userGridOption.paginationCurrentPage,$scope.userGridOption.paginationPageSize);
                    $scope.userGridOption.totalItems = $scope.model.u_role_user.length;
                    var aa = $scope.userGridOption.data
                }
            }


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
                var delData = rows.filter(e=>e.ROLE_USER_ID);
                if(delData.length>0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        delData.forEach(d=> {
                            delData.push({
                                "ROLE_USER_ID": d.ROLE_USER_ID
                            })
                        });
                        postData = {batch: delData};
                        httpService.httpHelper(httpService.webApi.api, "users/roleuser", "delete", "POST", postData).then(function (datas) {
                            Notification.success(datas.message);
                            $scope.userData = $scope.userData.filter(a=>$.inArray(a, rows) == -1);
                            $scope.userGridOption.data = $scope.userData;
                            $scope.userGridOption.totalItems = $scope.userData.length;
                            $scope.model['u_role_user'] = $scope.userData;
                            $scope.userGridOption.getPage($scope.userGridOption.paginationCurrentPage,$scope.userGridOption.paginationPageSize)
                            $scope.gridApi.selection.clearSelectedRows();
                        })
                    })
                }else{
                    $scope.userData = $scope.userData.filter(a=>$.inArray(a, rows) == -1);
                    $scope.userGridOption.data = $scope.userData;
                    $scope.userGridOption.totalItems = $scope.userData.length;
                    $scope.model['u_role_user'] = $scope.userData;
                    $scope.userGridOption.getPage($scope.userGridOption.paginationCurrentPage,$scope.userGridOption.paginationPageSize)
                    $scope.gridApi.selection.clearSelectedRows();
                }
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
                var userGrigList = [];
                if($scope.userGridOption.data.length>0){
                    angular.forEach($scope.userData,function(obj){
                        userGrigList.push({
                            "USER_INFO_ID":obj.USER_INFO_ID,
                            "USER_INFO_CODE":obj.USER_INFO_CODE,
                            "ROLE_INFO_ID":$scope.model.ROLE_INFO_ID,
                            "ROLE_INFO_CODE":$scope.model.ROLE_INFO_CODE
                        });
                    });
                }
                var data = {
                    "ROLE_INFO_ID":$scope.model.ROLE_INFO_ID,
                    "ROLE_INFO_CODE":$scope.model.ROLE_INFO_CODE,
                    "ROLE_INFO_NAME_CN":$scope.model.ROLE_INFO_NAME_CN,
                    "ROLE_TYPE_ID":$scope.model.ROLE_TYPE_ID,
                    "CUSER_CODE":$scope.model.CUSER_CODE,
                    "USER_INFO_REMARKS":$scope.model.USER_INFO_REMARKS,
                    "UUSER_CODE":$scope.model.UUSER_CODE,
                    "edit_type":"1",
                    "u_role_user":userGrigList
                };
                return httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "update?ROLE_INFO_ID="+$scope.model.ROLE_INFO_ID, "POST", data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close($scope.model);//返回数据
                })
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close($scope.model);//返回数据
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