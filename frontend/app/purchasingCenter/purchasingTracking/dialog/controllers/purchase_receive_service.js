/**
 * Created by Administrator on 2017/5/19.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/common/Services/TranService",
        'app/common/Services/commonService',
        'app/common/Services/configService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'purchase_receive_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "purchaseReceiveCtrl",
                            backdrop: "static",
                            //size: "llg",//lg,sm,md,llg,ssm
                            size:"1100px",
                            templateUrl: 'app/purchasingCenter/purchasingTracking/dialog/views/purchasingReceive.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("purchaseReceiveCtrl", function ($scope,$filter, amHttp, model, $timeout, $modalInstance, Notification, transervice, httpService, commonService,$q, $interval,configService) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'PU_ORDER_CD', enableCellEdit: false, displayName: transervice.tran('采购单号'), width: 170},
                    {
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        displayName: transervice.tran('SKU'),
                        width: 130
                    },{
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('产品名称'),
                        width: 180
                    },{
                        field: 'UNIT_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('单位'),
                        width: 75
                    },{
                        field: 'STORAGE_DNUMBER',
                        enableCellEdit: true,
                        displayName: transervice.tran('未收货数量'),
                        width: 90
                    },{
                        field: 'TAX_UNITPRICE',
                        enableCellEdit: false,
                        displayName: transervice.tran('单价'),
                        width: 90
                    },{
                        field: 'STORAGE_DMONEY',
                        enableCellEdit: false,
                        displayName: transervice.tran('金额'),
                        width: 120
                    },{
                        field: 'SWAREHOUSE_CODE', displayName: transervice.tran('入库仓库'),
                        cellTemplate:'<span>{{grid.appScope.getWarehouseName(row.entity.SWAREHOUSE_CODE)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_CODE',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        width: 110,
                        enableCellEdit: false,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.warehouseList"}
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

                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //编辑平台
                        if (colDef.field == "STORAGE_DNUMBER") {
                            calTotalMoney();
                        }
                    });

                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };

            //监听区域列表变更国家列表
            $scope.$watch('model.WAREHOUSE_CODE', function (n, o) {
                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    obj.SWAREHOUSE_CODE = n;
                });
            })

            //计算总金额
            function calTotalMoney() {
                $scope.model.STORAGE_MONEY = 0;
                //累计金额
                angular.forEach($scope.gridOptions.data, function (row, i) {
                     row.STORAGE_DMONEY = parseFloat(row.STORAGE_DNUMBER) * parseFloat(row.TAX_UNITPRICE);
                     $scope.model.STORAGE_MONEY = parseFloat($scope.model.STORAGE_MONEY) + parseFloat(row.STORAGE_DMONEY);
                });
            }

            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            $scope.userInfo = configService.getUserInfo();
            $scope.init = function(){
                var data = angular.copy(model);
                $scope.model = new Object();
                $scope.model.ORGANISATION_CODE = data['0'].pu_purchase.DORGANISATION_CODE;
                $scope.model.ORGANISATION_NAME_CN = data['0'].pu_purchase.o_organisation_o.ORGANISATION_NAME_CN;
                $scope.CREATED_AT = $filter("date")(new Date(), "yyyy-MM-dd");
                $scope.STORAGE_AT = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss");
                $scope.model.ORDER_TYPE = "1";
                $scope.model.PARTNER_NAME_CN = data['0'].PARTNER_ANAME_CN;
                $scope.model.PARTNER_CODE = data['0'].PARTNER_CODE;
                $scope.model.UUSER_CODE = $scope.userInfo.USER_INFO_CODE;
                $scope.model.USERNAME = $scope.userInfo.USERNAME;
                $scope.model.ORDER_STATE = "1";
                $scope.model.MONEY_CODE = data['0'].pu_purchase.MONEY_CODE;
                $scope.model.MONEY_NAME_CN = data['0'].MONEY_NAME_CN;
                var totalAccount = 0;
                var gridData = [];
                angular.forEach(data, function (ob, index) {
                    var temp = [];
                    temp['PU_ORDER_CD']=ob.PU_PURCHASE_CD;
                    temp['PSKU_CODE']=ob.PSKU_CODE;
                    temp['PSKU_NAME_CN']=ob.PSKU_NAME_CN;
                    temp['UNIT_NAME_CN']=ob.UNIT_NAME_CN;
                    temp['UNIT_CODE']=ob.b_unit.UNIT_CODE;
                    temp['TAX_UNITPRICE']=ob.TAX_UNITPRICE;
                    temp['STORAGE_DNUMBER']=ob.UNINSPECTION_NUMBER;
                    temp['STORAGE_DMONEY']=parseFloat(ob.TAX_UNITPRICE) * parseFloat(ob.UNINSPECTION_NUMBER);
                    gridData.push(temp);
                    totalAccount = parseFloat(totalAccount)+parseFloat(ob.STORAGE_DMONEY);
                })
                $scope.model.STORAGE_MONEY = totalAccount;
                $scope.gridOptions.data = gridData;
                $scope.gridOptions.totalItems =gridData.length;
                $scope.warehouseList = new Array();
                //默认当前组织下和大陆中转仓
                var selectWhere = {"where": ["and", ["=", "DELETED_STATE", 0], ["=", "ORGANIZE_CODE", $scope.model.ORGANISATION_CODE], ["=", "WAREHOUSE_TYPE_ID", "1"]]};
                //初始化出库仓库列表
                $scope.rowEntity = {};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.rowEntity.warehouseList = result.data;

                        angular.forEach(result.data, function (obj, index) {
                            //初始化出库仓库列表
                            $scope.warehouseList.push(obj);
                            //获取完仓库列表后绑定初始值
                            $scope.model.WAREHOUSE_CODE = obj.WAREHOUSE_CODE;
                        });
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            object.rowEntity = $scope.rowEntity;
                            object.SWAREHOUSE_CODE = $scope.model.WAREHOUSE_CODE ;
                        });
                    }
                );
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

            //获取出库仓库名称
            $scope.getWarehouseName=function (warehouseCode) {
                if(warehouseCode) {
                    var warehouse=$scope.rowEntity.warehouseList.filter(c=>c.WAREHOUSE_CODE==warehouseCode);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            }
            //确定
            $scope.save = function () {
                var errorMsg = "";
                if (!$scope.model.ORGANISATION_CODE) {
                    errorMsg = "请选择组织";
                } else if (!$scope.model.ORDER_TYPE) {
                    errorMsg = "请选择单据类型";
                }else if (!$scope.model.PARTNER_CODE) {
                    errorMsg = "请选择供应商";
                }else if (!$scope.model.WAREHOUSE_CODE) {
                    errorMsg = "请选择入库仓库";
                }else if (!$scope.model.MONEY_CODE) {
                    errorMsg = "请选择金额信息-币种";
                }
                if (errorMsg != "") {
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                var formatDate = new Date($scope.STORAGE_AT.replace(/-/g,'/')).getTime();
                $scope.model.STORAGE_AT = Math.round(formatDate/1000);
                //明细
                $scope.model.sk_storage_detail = [];
                var formatDate = new Date($scope.STORAGE_AT.replace(/-/g,'/')).getTime();
                //$scope.model.PLACING_AT = Math.round(formatDate/1000);
                formatDate = angular.copy(formatDate)/1000;
                $scope.gridOptions.data.forEach(d => {
                    $scope.model.sk_storage_detail.push({
                    "PU_ORDER_CD": d.PU_ORDER_CD,
                    "PSKU_CODE": d.PSKU_CODE,
                    "PSKU_NAME_CN": d.PSKU_NAME_CN,
                    "UNIT_CODE": d.UNIT_CODE,
                    "STORAGE_DNUMBER": d.STORAGE_DNUMBER,
                    "UNIT_PRICE": d.TAX_UNITPRICE,
                    "STORAGE_DMONEY": d.STORAGE_DMONEY,
                    "STORAGE_AT": formatDate,
                    "SWAREHOUSE_CODE": d.SWAREHOUSE_CODE
                });
                });
                httpService.httpHelper(httpService.webApi.api, "inventory/storage", "create", "POST", $scope.model).then(function (result) {
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



