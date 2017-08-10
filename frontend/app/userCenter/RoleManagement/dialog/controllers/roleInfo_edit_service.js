/**
 * Created by Administrator on 2017/5/12.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/userCenter/RoleManagement/dialog/controllers/user_list_service',
        'app/common/Services/gridDefaultOptionsService'
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
                            templateUrl: 'app/userCenter/RoleManagement/dialog/views/roleInfo_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("roleInfo_edit_Ctrl", function ($scope, amHttp,commonService, model, $timeout,$filter,gridDefaultOptionsService,$modalInstance, Notification, transervice, httpService, $q, $interval,user_list_service) {
            //用户选择
            $scope.userGridOption = {
                columnDefs: [
                    {field: 'USER_INFO_CODE', displayName: transervice.tran('用户编码')},
                    {field: 'STAFF_NAME_CN', displayName: transervice.tran('用户名称')},
                    {field: 'ROLE_USER_STATE', displayName: transervice.tran('是否启用'),cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'value',editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.ROLE_USER_STATE.list"}
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.userGridOption);
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
                if($scope.model.u_role_user.length>0){
                    angular.forEach($scope.model.u_role_user,function(obj){
                        obj.USERNAME = obj.u_userInfo ?obj.u_userInfo.USERNAME:"";
                        obj.rowEntity = rowEntity;
                    });
                    $scope.userGridOption.data = $scope.model.u_role_user;
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
            $scope.addGroup = function (value) {
                var exitUserList = [];
                if($scope.userGridOption.data.length>0){
                    exitUserList = $scope.userGridOption.data;
                }
                var model ={
                    "exitUserList":exitUserList
                };

                user_list_service.showDialog(model).then(function(data){
                    angular.forEach(data,function(obj){
                        obj.ROLE_USER_STATE = "1";
                        obj.rowEntity = rowEntity;
                        $scope.gridData.push(obj);
                        $scope.userGridOption.data.unshift(obj);
                    });
                });
            };
            //分组grid删除行
            $scope.moveGroup = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要删除的数据！'));
                }
                $scope.userGridOption.data = removeDuplicate($scope.userGridOption.data,rows);
                $scope.gridApi.selection.clearSelectedRows();

            };

            $scope.save = function(){
                var errorMsg = "";
                if($scope.model.ROLE_INFO_CODE==null){
                    errorMsg = "角色编码为必填项!";
                }
                if($scope.model.ROLE_INFO_NAME_CN==null){
                    errorMsg = "角色名称为必填项!";
                }
                if(errorMsg.length>0){
                    Notification.error(transervice.tran(errorMsg));
                    return ;
                }
                var userGrigList = [];
                if($scope.userGridOption.data.length>0){
                    angular.forEach($scope.userGridOption.data,function(obj){
                        userGrigList.push({
                            "USER_INFO_CODE":obj.USER_INFO_CODE,
                            "ROLE_INFO_CODE":$scope.model.ROLE_INFO_CODE,
                            "ROLE_USER_STATE":obj.ROLE_USER_STATE
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
                    "USER_REMARKS":$scope.model.USER_REMARKS,
                    "edit_type":"1",
                    "u_role_user":userGrigList

                };
                httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "update?ROLE_INFO_ID="+$scope.model.ROLE_INFO_ID, "POST", data).then(function (result) {
                    if (result != null && result.status == 200) {
                        Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据
                    }else{
                        Notification.error({message: result.message, delay: 5000});
                    }
                })


            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };
            //模糊搜索
            $scope.search = function(){
                var data = angular.copy($scope.userGridOption.data);
                var newData = [];
                if($scope.searchCondition) {
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        if (obj.USER_INFO_CODE.indexOf($scope.searchCondition)!=-1 || obj.USERNAME.indexOf($scope.searchCondition)!=-1) {
                            newData.push(obj);
                        }
                    }
                    $scope.userGridOption.data = angular.copy(newData);
                }else{
                    $scope.userGridOption.data = $scope.gridData;
                }
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

        });
    });