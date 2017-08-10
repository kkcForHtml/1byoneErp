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
        'app/userCenter/RoleManagement/dialog/controllers/user_list_service',
        'app/common/Services/gridDefaultOptionsService'
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
                            templateUrl: 'app/userCenter/RoleManagement/dialog/views/roleInfo_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("roleInfo_add_Ctrl", function ($scope, amHttp,commonService, model, $timeout,$filter,$modalInstance,gridDefaultOptionsService, Notification, transervice, httpService, $q, $interval,user_list_service) {
            if(model){
                $scope.model = angular.copy(model);
            }
            //角色
            $scope.userGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                useExternalPagination: true,//是否使用分页按钮
                columnDefs: [
                    {field: 'USER_INFO_CODE', displayName: transervice.tran('用户编码')},
                    {field: 'STAFF_NAME_CN', displayName: transervice.tran('用户名称')},
                    {field: 'ROLE_USER_STATE', displayName: transervice.tran('是否启用'),cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'value',editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.ROLE_USER_STATE.list"}
                ],
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
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            var stateList = commonService.getDicList("STATE");
            var rowEntity = {
                "fieldDataObjectMap": {
                    "ROLE_USER_STATE": {
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


            //分组grid添加空行
            $scope.addGroup = function () {
                var exitUserList = [];
                if($scope.userGridOption.data){
                    angular.forEach($scope.userGridOption.data,function(obj){
                        exitUserList.push(obj.USER_INFO_ID);
                    })
                }
                user_list_service.showDialog(exitUserList).then(function(data){
                    $scope.gridChooseData = [];
                    angular.forEach(data,function(obj){
                        obj.ROLE_USER_STATE = "1";
                        obj.rowEntity = rowEntity;
                        $scope.gridChooseData.push(obj);
                    });
                    $scope.userGridOption.data = $scope.gridChooseData;
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
                    "ROLE_INFO_CODE":$scope.model.ROLE_INFO_CODE,
                    "ROLE_INFO_NAME_CN":$scope.model.ROLE_INFO_NAME_CN,
                    "ROLE_TYPE_ID":$scope.model.ROLE_TYPE_ID,
                    "CUSER_CODE":$scope.model.CUSER_CODE,
                    "USER_INFO_REMARKS":$scope.model.USER_INFO_REMARKS,
                    "UUSER_CODE":$scope.model.UUSER_CODE,
                    "USER_REMARKS":$scope.model.USER_REMARKS,
                    "u_role_user":userGrigList

                };
                httpService.httpHelper(httpService.webApi.api, "users/roleinfo", "create", "POST", data).then(function (result) {
                    if (result != null && result.status == 200) {
                        Notification.success({message: result.message, delay: 2000});
                        $modalInstance.close($scope.model);//返回数据
                    }else{
                        Notification.error({message: result.message, delay: 5000});
                    }
                })

            };

            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondtion && $scope.userGridOption.data.length>0){
                    var newData = [];
                    $scope.userGridOption.data.forEach(d=>{
                        if(d.USER_INFO_CODE.indexOf($scope.searchCondtion)!=-1 || d.STAFF_CODE.indexOf($scope.searchCondtion)!=-1){
                            newData.push(d);
                        }
                    });
                    $scope.userGridOption.data = newData;
                }else{
                    $scope.userGridOption.data = $scope.gridChooseData;
                }
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

        });
    });