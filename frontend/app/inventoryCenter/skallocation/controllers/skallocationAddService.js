define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skallocationAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skallocationAddCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skallocation/views/skallocation_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skallocationAddCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService) {
            $scope.options = {
                filter: "contains",
                autoBind: true,
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_CODE",
                optionLabel: "请输入SKU",
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search:{where:["and",["=", "g_product_sku.PSKU_STATE", 1]],joinWith:["b_unit","g_product_sku_price"]}
            };
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'ATSKU_CODE', displayName: transervice.tran('调出SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"><div single-select select-model="row.entity.ATSKU_CODE" options="row.entity.options" change="grid.appScope.selectSkuRowChange(row)" row="row" style="width:98%"></div></div>'
                    },
                    {
                        field: 'ETSKU_CODE', displayName: transervice.tran('调入SKU'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.ETSKU_CODE}}</div>'
                    },
                    {
                        field: 'TDRODUCT_DE', displayName: transervice.tran('产品名称'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.TDRODUCT_DE}}</div>'
                    },
                    {
                        field: 'UNIT_NAME', displayName: transervice.tran('单位'),
                        enableCellEdit: false,
                        cellClass:'text-right',
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.UNIT_NAME}}</div>'
                    },
                    {
                        field: 'ALLOCATION_NUMBER', displayName: transervice.tran('调拨数量'),
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.ALLOCATION_NUMBER"></form></div>'
                    },
                    {
                        field: 'ACTUALATW_NUMBER', displayName: transervice.tran('实际出库数量'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.ACTUALATW_NUMBER}}</div>'
                    },
                    {
                        field: 'ACTUALETW_NUMBER', displayName: transervice.tran('实际入库数量'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.ACTUALETW_NUMBER}}</div>'
                    },
                    {
                        field: 'ALLOCATIONS_STATE', displayName: transervice.tran('调拨状态'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{"未调拨"|translate}}</div>'
                    },
                    {
                        field: 'ALLOCATION_REMARKS', displayName: transervice.tran('备注'),
                        editableCellTemplate:'<div><form><input type="text" maxlength="255" ui-grid-editor ng-model="row.entity.ALLOCATION_REMARKS"></form></div>'
                    }
                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
            };

            //获取api
            $scope.gridOptions.getGridApi=function (api) {
                $scope.gridApi=api;
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //初始化组织列表
            $scope.organizations = [];
            (function () {
                var dataSearch = {
                    "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
                    "joinwith":["o_organisationt"]
                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (result) {
                    $scope.organizations = result.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
                });
            })();

            //组织列表 change事件
            var _tempErg;
            var _tempArg;
            $scope.oChange = function (flag,selectModel) {
                if(flag === 1){
                    if($scope.ERGANISATION_ID && $scope.gridOptions.data.length > 0) {
                        $confirm({ text: transervice.tran('修改组织会把明细清空，是否继续？') }).then(function () {
                            $scope.ERGANISATION_ID = selectModel;
                            $scope.gridOptions.data=[];
                            $scope.eWarehouseList = [];
                            angular.forEach($scope._warehouseList, function (obj, index) {
                                if (obj.ORGANISATION_ID === selectModel) {
                                    $scope.eWarehouseList.push(obj);
                                }
                            });
                        },function () {
                            $scope.ERGANISATION_ID = _tempErg;
                            return false;
                        });
                    } else {
                        _tempErg = $scope.ERGANISATION_ID;
                        $scope.ERGANISATION_ID = selectModel;
                        $scope.eWarehouseList = [];
                        angular.forEach($scope._warehouseList, function (obj, index) {
                            if (obj.ORGANISATION_ID === selectModel) {
                                $scope.eWarehouseList.push(obj);
                            }
                        });
                    }
                }else {
                    if($scope.ARGANISATION_ID && $scope.gridOptions.data.length > 0) {
                        $confirm({ text: transervice.tran('修改组织会把明细清空，是否继续？') }).then(function () {
                            $scope.ARGANISATION_ID = selectModel;
                            $scope.gridOptions.data=[];
                            $scope.aWarehouseList = [];
                            angular.forEach($scope._warehouseList, function (obj, index) {
                                if (obj.ORGANISATION_ID === selectModel) {
                                    $scope.aWarehouseList.push(obj);
                                }
                            });
                        },function () {
                            $scope.ARGANISATION_ID = _tempArg;
                            return false;
                        });
                    } else {
                        _tempArg = $scope.ARGANISATION_ID;
                        $scope.ARGANISATION_ID = selectModel;
                        $scope.aWarehouseList = [];
                        angular.forEach($scope._warehouseList, function (obj, index) {
                            if (obj.ORGANISATION_ID === selectModel) {
                                $scope.aWarehouseList.push(obj);
                            }
                        });
                    }
                }
            };

            //初始化仓库列表
            $scope._warehouseList = [];
            (function () {
                var selectWhere = {"where":["and",["=", "WAREHOUSE_STATE", 1],['in', 'WAREHOUSE_TYPE_ID', [2, 5, 8]]],'limit':0};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                    $scope.eWarehouseList = [];//调出仓库列表
                    $scope.aWarehouseList = [];//调入仓库列表
                    $scope._warehouseList = result.data;
                });
            })();

            $scope.init = function() {
                //页面元素显示初始化
                $scope.currentState = "草稿";//单据状态
                $scope.initDate = $filter("date")(new Date(), "yyyy-MM-dd");//制单日期
                $scope.initUser = configService.getUserInfo();//制单人信息
                $scope.initUserName =  $scope.initUser == null?"":$scope.initUser.u_staffinfo2.STAFF_NAME_CN;//制单人
                //初始化明细
                $scope.gridOptions.data = [];
            };

            $scope.init();//初始化信息

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //添加明细
            $scope.addDetail = function () {
                if (!checkInfo()) {
                    return false;
                }
                var newItem = {
                    "ATSKU_CODE": "",
                    "ETSKU_CODE": "",
                    "TDRODUCT_DE": "",
                    "UNIT_NAME": "",
                    "ALLOCATION_NUMBER": "",
                    "ACTUALATW_NUMBER": 0,
                    "ACTUALETW_NUMBER": 0,
                    "ALLOCATIONS_STATE": 0,
                    "ALLOCATION_REMARKS":"",
                    options:angular.copy($scope.options)
                };
                newItem.options.search.where.push(['or',["=","g_product_sku.ORGAN_ID_DEMAND",$scope.ERGANISATION_ID],["=","g_product_sku.ORGAN_ID_PURCHASE",$scope.ERGANISATION_ID]]);
                $scope.gridOptions.data.unshift(newItem);
                gridDefaultOptionsService.refresh($scope.gridOptions,"ATSKU_CODE");
            };

            //SKU
            $scope.selectSkuRowChange = function(row){
                row.entity.ATPSKU_ID = row.selectModel.PSKU_ID;
                row.entity.ATSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.TDRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.UNIT_NAME = row.selectModel.b_unit == null?'':row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit == null?0:row.selectModel.b_unit.UNIT_ID;
                //调入SKU
                if($scope.ARGANISATION_ID === $scope.ERGANISATION_ID){
                    row.entity.ETPSKU_ID = row.selectModel.PSKU_ID;
                    row.entity.ETSKU_CODE = row.selectModel.PSKU_CODE;
                }else{
                    //获取调入sku
                    var post = {'ARGANISATION_ID':$scope.ARGANISATION_ID,'PSKU_ID':row.selectModel.PSKU_ID};
                    httpService.httpHelper(httpService.webApi.api, "inventory/allocation","getetsku", "POST", post).then(function (result) {
                        row.entity.ETPSKU_ID = result.data.PSKU_ID;
                        row.entity.ETSKU_CODE = result.data.PSKU_CODE;
                    });
                }
                $scope.gridOptions.gridApi.grid.refresh();
            };

            //删除明细
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a,rows)==-1);
            };

            //校验基本信息
            function checkInfo() {
                if (!$scope.ARGANISATION_ID||!$scope.ERGANISATION_ID) {
                    Notification.error(transervice.tran('请选择调拨组织'));
                    return false;
                }
                if (!$scope.ETWAREHOUSE_ID||!$scope.ATWAREHOUSE_ID) {
                    Notification.error(transervice.tran('请选择调拨仓库'));
                    return false;
                }
                if ($scope.ETWAREHOUSE_ID === $scope.ATWAREHOUSE_ID) {
                    Notification.error(transervice.tran('调拨仓库不能为同一仓库'));
                    return false;
                }
                if (!$scope.ESTIMATED_AT||$scope.ESTIMATED_AT === ''||!$scope.ESTIMATEDA_AT||$scope.ESTIMATEDA_AT === '') {
                    Notification.error(transervice.tran('请选择调拨日期'));
                    return false;
                }
                if(formatDate($scope.ESTIMATED_AT)>formatDate($scope.ESTIMATEDA_AT)){
                    Notification.error(transervice.tran('调出日期不能大于调入日期'));
                    return false;
                }
                return true;
            }

            //校验明细信息
            function checkDetailInfo() {
                if(!$scope.gridOptions.data.length){
                    Notification.error(transervice.tran('请添加调拨明细'));
                    return false;
                }
                var flag = true;
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    if(!row.ATSKU_CODE){
                        Notification.error(transervice.tran("调出SKU不能为空"));
                        flag = false;
                        return ;
                    }
                    if(!row.ETSKU_CODE){
                        Notification.error(transervice.tran("调入SKU不能为空"));
                        flag = false;
                        return ;
                    }
                    if (!row.ALLOCATION_NUMBER||row.ALLOCATION_NUMBER == 0) {
                        Notification.error(transervice.tran("请填写调拨数量"));
                        flag = false;
                        return ;
                    }
                });
                return flag;
            }

            function formatDate(dateValue) {
                if(angular.isUndefined(dateValue)||dateValue === ''){
                    return 0;
                }
                var _formatDate = new Date(dateValue.replace(/-/g,'/')).getTime();
                return Math.round(_formatDate/1000);
            }

            //保存操作
            $scope.save = function () {
                if(!checkInfo()||!checkDetailInfo()){
                    return false;
                }
                var s_data = {};
                s_data.ERGANISATION_ID = $scope.ERGANISATION_ID;
                s_data.ETWAREHOUSE_ID = $scope.ETWAREHOUSE_ID;
                s_data.ESTIMATED_AT = formatDate($scope.ESTIMATED_AT);
                s_data.ARGANISATION_ID = $scope.ARGANISATION_ID;
                s_data.ATWAREHOUSE_ID = $scope.ATWAREHOUSE_ID;
                s_data.ESTIMATEDA_AT = formatDate($scope.ESTIMATEDA_AT);
                s_data.ALLOCATION_REMARKS = $scope.ALLOCATION_REMARKS;
                s_data.sk_allocation_detail = $scope.gridOptions.data;
                httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "create", "POST", s_data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.cancel();
                });
            };
        });
    }
);