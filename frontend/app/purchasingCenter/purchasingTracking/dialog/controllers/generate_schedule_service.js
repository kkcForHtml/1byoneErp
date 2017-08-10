/**
 * Created by Administrator on 2017/5/19.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/common/Services/commonService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'generate_schedule_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "generateScheduleCtrl",
                            backdrop: "static",
                            //size: "llg",//lg,sm,md,llg,ssm
                            size:"1100px",
                            templateUrl: 'app/purchasingCenter/purchasingTracking/dialog/views/generateSchedule.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("generateScheduleCtrl", function ($scope,$filter, amHttp, model, $timeout, $modalInstance, Notification, transervice, httpService, commonService,$q, $interval) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'PU_PURCHASE_CD', enableCellEdit: false, displayName: transervice.tran('采购单号'), width: 200},
                    {
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        displayName: transervice.tran('SKU'),
                        width: 130
                    },{
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('产品名称'),
                        width: 150
                    },{
                        field: 'PURCHASE',
                        enableCellEdit: false,
                        displayName: transervice.tran('采购数量'),
                        width: 110
                    },{
                        field: 'INSPECTION_NUMBER',
                        enableCellEdit: false,
                        displayName: transervice.tran('已验数量'),
                        width: 110
                    },{
                        field: 'SCHEDULING_NUMBER',
                        enableCellEdit: false,
                        displayName: transervice.tran('已排程数量'),
                        width: 110
                    },{
                        field: 'UNINSPECTION_NUMBER',
                        enableCellEdit: false,
                        displayName: transervice.tran('未验数量'),
                        width: 110
                    },{
                        field: 'THIS_INSPECTION_NUMBER',
                        enableCellEdit: true,
                        displayName: transervice.tran('本次排程数量'),
                        width: 110
                    }
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
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            $scope.init = function(){
                var data = angular.copy(model);
                data.forEach(d => {
                    d.THIS_INSPECTION_NUMBER = d.UNINSPECTION_NUMBER;
            });
                $scope.gridOptions.data = data;
                $scope.gridOptions.totalItems =data,length;
            };
            $scope.init();
            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x*100)/100;
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

            //加入排程
            $scope.confirm = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要加入排程的数据！'));
                }
                var data = [];
                for(var i =0 ;i<rows.length;i++) {
                    var value = rows[i];
                    if (value.PU_PURCHASE_CD == null) {
                        return Notification.error(transervice.tran('采购单号为必填项！'));
                    }
                    if (value.PSKU_CODE == null) {
                        return Notification.error(transervice.tran('SKU为必填项！'));
                    }
                    if (value.PURCHASE == null) {
                        return Notification.error(transervice.tran('采购数量为必填项！'));
                    }
                    if (value.INSPECTION_NUMBER == null) {
                        return Notification.error(transervice.tran('已验数量为必填项！'));
                    }
                    if (value.SCHEDULING_NUMBER == null) {
                        return Notification.error(transervice.tran('已排程数量为必填项！'));
                    }
                    if (value.UNINSPECTION_NUMBER == null) {
                        return Notification.error(transervice.tran('未验数量为必填项！'));
                    }
                    if (value.THIS_INSPECTION_NUMBER == null || value.THIS_INSPECTION_NUMBER == "") {
                        if(value.THIS_INSPECTION_NUMBER<0){
                            return Notification.error(transervice.tran('本次排程数量必须大于0！'));
                        }else{
                            return Notification.error(transervice.tran('本次排程数量为必填项！'));
                        }
                    }
                    data[i] = {
                        'PURCHASE_DETAIL_ID' : value.PURCHASE_DETAIL_ID,
                        'TCHEDULING_NUMBER':value.THIS_INSPECTION_NUMBER
                    }
                };
                httpService.httpHelper(httpService.webApi.api, "purchase/ptrack","uppqc" ,"POST", data).then(function (result) {
                    Notification.success(transervice.tran('操作成功!'));
                    $modalInstance.close();
                })
            };

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (angular.isDate(object)) {
                    object = Math.round((object).valueOf() / 1000);
                } else {
                    object = Math.round((object) / 1000);
                }
                return object;
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close();
                //$modalInstance.dismiss(false);

            };

        })
    });



