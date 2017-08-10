/**
 * Created by Administrator on 2017/4/25.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/messageService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'warehouse_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "warehouse_edit_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/bwarehouse/views/warehouse_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("warehouse_edit_Ctrl", function ($scope, amHttp, model, httpService, $modalInstance, Notification, transervice,messageService) {
            if (model) {
                $scope.model = angular.copy(model);
                $scope.model.SPACE_INVENTORY = $scope.model.SPACE_INVENTORY?$scope.model.SPACE_INVENTORY:Number(0);
                $scope.model.THEORY_INVENTORY = $scope.model.THEORY_INVENTORY?$scope.model.THEORY_INVENTORY:Number(0);
                //$scope.model.INVENTORY_PROP = INVENTORY_PROP;
                if ($scope.model.orgList) {
                    for (var i = 0; i < $scope.model.orgList.length; i++) {
                        var obj = $scope.model.orgList[i];
                        if (obj.ORGANISATION_ID == $scope.model.ORGANISATION_ID) {
                            $scope.model.b_channel = obj.b_channel;
                            break;
                        }
                    }
                }
            }
            $scope.changeSpace = function(){
                if($scope.model.SPACE_INVENTORY ||$scope.model.SPACE_INVENTORY.length>0){
                    $scope.model.INVENTORY_PROP = toDecimal($scope.model.THEORY_INVENTORY/$scope.model.SPACE_INVENTORY*100);
                }
            }
            //取消
            $scope.cancel = function () {
                $modalInstance.close($scope.model);//返回数据
                //$modalInstance.dismiss(false);
            };
            //所属组织与平台二级联动
            $scope.changeSelect = function (value) {
                if(!value){
                    $scope.model.CHANNEL_ID = "";
                    $scope.model.b_channel = [{"CHANNEL_ID":"","CHANNEL_NAME_CN":"请选择"}];
                }
                for (var i = 0; i < $scope.model.orgList.length; i++) {
                    var obj = $scope.model.orgList[i];
                    if (obj.ORGANISATION_ID == value) {
                        $scope.model.b_channel = [{"CHANNEL_ID":"","CHANNEL_NAME_CN":"请选择"}].concat(obj.b_channel);
                        $scope.model.CHANNEL_ID = "";
                        break;
                    }
                }
            };

            //保存
            $scope.save = function () {
                if ($scope.model.WAREHOUSE_CODE == null || $scope.model.WAREHOUSE_CODE.length==0) {
                    Notification.error(transervice.tran('请输入仓库编码'));
                    return;
                }
                if ($scope.model.WAREHOUSE_NAME_CN == null || $scope.model.WAREHOUSE_NAME_CN.length==0) {
                    Notification.error(transervice.tran('请输入仓库名称'));
                    return;
                }
                if ($scope.model.ORGANISATION_ID == null|| $scope.model.ORGANISATION_ID.length==0) {
                    Notification.error(transervice.tran('请输入所属组织'));
                    return;
                }
                if ($scope.model.CHANNEL_ID == null|| $scope.model.CHANNEL_ID.length==0) {
                    Notification.error(transervice.tran('请输入平台'));
                    return;
                }
                if ($scope.model.WAREHOUSE_TYPE_ID == null || $scope.model.WAREHOUSE_TYPE_ID.length == 0) {
                    Notification.error(transervice.tran('请输入仓库分类'));
                    return;
                }
                var data = {
                    "WAREHOUSE_ID":$scope.model.WAREHOUSE_ID,
                    "WAREHOUSE_CODE":$scope.model.WAREHOUSE_CODE,
                    "WAREHOUSE_NAME_CN":$scope.model.WAREHOUSE_NAME_CN,
                    "ORGANISATION_ID":$scope.model.ORGANISATION_ID,
                    "CHANNEL_ID":$scope.model.CHANNEL_ID,
                    "WAREHOUSE_TYPE_ID":$scope.model.WAREHOUSE_TYPE_ID,
                    "WAREHOUSE_STATE":$scope.model.WAREHOUSE_STATE,
                    "SPACE_INVENTORY":$scope.model.SPACE_INVENTORY,
                    "WAREHOUSE_AREA_ID":$scope.model.WAREHOUSE_AREA_ID,
                    "WAREHOUSE_ADDRESS":$scope.model.WAREHOUSE_ADDRESS
                }
               // $scope.model.WAREHOUSE_ADDRESS = $scope.model.WAREHOUSE_AREA_CODE+$scope.model.WAREHOUSE_ADDRESS_DETAIL;
                return httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "update?id=" + $scope.model.WAREHOUSE_ID, "POST", data).then(function (result) {
                    Notification.success(transervice.tran("操作成功！"));
                    $modalInstance.close($scope.model);//返回数据
                })

        };

            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x * 100) / 100;
                if (f == x) {
                    return x;
                }
                var s = f.toString();
                var rs = s.indexOf('.');
                if (rs < 0) {
                    rs = s.length;
                    s += '.';
                }
                while (s.length <= rs + 2) {
                    s += '0';
                }
                return s;
            }
    });


})
;
