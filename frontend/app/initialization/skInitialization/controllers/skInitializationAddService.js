define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/organisationsDirt1'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skInitializationAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skInitializationAddCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/initialization/skInitialization/views/skInitialization_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skInitializationAddCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService) {
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
                        field: 'PSKU_CODE', displayName: transervice.tran('SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"><div single-select select-model="row.entity.PSKU_CODE" options="row.entity.options" change="grid.appScope.selectRowChange(row)" row="row" style="width:98%"></div></div>'
                    },
                    {
                        field: 'TDRODUCT_DE', displayName: transervice.tran('产品名称'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.TDRODUCT_DE}}</div>'
                    },
                    {
                        field: 'UNIT_ID', displayName: transervice.tran('计量单位'),
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.UNIT_NAME}}</div>'
                    },
                    {
                        field: 'PURCHASE', displayName: transervice.tran('数量'),
                        cellClass:"text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.PURCHASE" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>'
                    },
                    {
                        field: 'COPST_PRICE', displayName: transervice.tran('单位成本'),
                        cellClass:"text-right",
                         cellTemplate:'<div class="ui-grid-cell-contents" >{{row.entity.COPST_PRICE|number:2}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.COPST_PRICE" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>'
                    },
                    {
                        field: 'TDMONEY', displayName: transervice.tran('金额'),
                        cellClass:"text-right",
                        enableCellEdit: false,
                        cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.TDMONEY|number:2}}</div>'
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

            //初始化
            $scope.model = {};
            $scope.orgoptions = {
                types: [4],
                isInit : "0",
                change: function (ORGANISATION_CODE, entity) {
                    //组织列表选择change事件
                    if (ORGANISATION_CODE.ORGANISATION_ID) {
                    	var	c_ORGANISATION_ID = $scope.ORGANISATION_CODE;
                        if ($scope.ORGANISATION_CODE && $scope.gridOptions.data.length > 0 ) {
                            $confirm({text: transervice.tran('修改组织会把明细清空，是否继续？')}).then(function () {
                                $scope.gridOptions.data = [];
                                $scope.model.CHANNEL = '';
                                $scope.model.ATWAREHOUSE = '';
                                orgChangeWarehouse(ORGANISATION_CODE.ORGANISATION_ID);
                                return;
                            },function () {
                            	$scope.ORGANISATION_CODE = c_ORGANISATION_ID;
                            	return;
                            });
                        }else if(c_ORGANISATION_ID){
                        	orgChangeWarehouse(ORGANISATION_CODE.ORGANISATION_ID)
                        };
                        !c_ORGANISATION_ID&&orgChangeWarehouse(ORGANISATION_CODE.ORGANISATION_ID);                        
                    }
                }
            }

            function orgChangeWarehouse(ORGANISATION_CODE) {
                $scope.model.warehouseList = new Array();
                $scope.model.channelList = new Array();
                angular.forEach($scope.model.warehouseTotalList, function (obj, index) {
                    if (obj.ORGANISATION_ID == ORGANISATION_CODE) {
                        $scope.model.warehouseList.push(obj);
                    }
                });
                angular.forEach($scope.model.channelTotalList, function (obj, index) {
                    if (obj.ORGANISATION_ID == ORGANISATION_CODE) {
                        $scope.model.channelList.push(obj);
                    }
                });
                
            }

            
            function init() {
                //页面元素显示初始化
                $scope.currentState = "草稿";
                $scope.initDate = $filter("date")(new Date(), "yyyy-MM-dd");
                $scope.currentuser = configService.getUserInfo();
                $scope.initUserName =  $scope.currentuser == null?"Admin": $scope.currentuser.u_staffinfo2.STAFF_NAME_CN;
                //初始化仓库列表
                var selectWhere = {"where": ["=", "WAREHOUSE_STATE", 1], 'limit': 0};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                    $scope.model.warehouseTotalList = result.data;
                });
                //初始化平台列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", {}).then(function (result) {
                    $scope.model.channelTotalList = result.data;
                });				
                
                //初始化明细
                $scope.gridOptions.data = [];
            }

            init();//基本信息初始化
            //更改数量
            $scope.changeTotalmoney = function (row) {
                row.entity.TDMONEY = parseFloat((1*row.entity.PURCHASE) * (1*row.entity.COPST_PRICE));
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //新增明细
            $scope.addDetail = function () {
                if (!checkInfo()) {
                    return false;
                }
                var newItem = {
                    "PSKU_CODE": "",
                    "TDRODUCT_DE": "",
                    "UNIT_ID": "",
                    "PURCHASE": "",
                    "COPST_PRICE": '',
                    "TDMONEY":"",
                    options:angular.copy($scope.options),
                    warehouseList: angular.copy($scope.warehouseList)
                };
                newItem.options.search.where.push(["or",["=","g_product_sku.ORGAN_ID_PURCHASE",$scope.ORGANISATION_CODE.ORGANISATION_ID],["=","g_product_sku.ORGAN_ID_DEMAND",$scope.ORGANISATION_CODE.ORGANISATION_ID]]);
                $scope.gridOptions.data.unshift(newItem);
                gridDefaultOptionsService.refresh($scope.gridOptions,"PSKU_CODE");//刷新方法
            };

            //SKU行选择
            $scope.selectRowChange=function(row){
                if (!$scope.ORGANISATION_CODE) {
                    return Notification.error(transervice.tran("请先选择组织"));
                }
                row.entity.PSKU_ID = row.selectModel.PSKU_ID;
                row.entity.PSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.TDRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.UNIT_NAME = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit.UNIT_ID;
                $scope.gridOptions.gridApi.grid.refresh();
            };

            //行删除
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                rows.forEach((obj)=>{
                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                });
            };

            //获取仓库名称
            $scope.getWarehouseName=function (warehouseCode) {
                if(warehouseCode) {
                    var warehouse = $scope.warehouseList.filter(c=>c.WAREHOUSE_CODE==warehouseCode);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            };

            //校验基本信息
            function checkInfo() {
                if (angular.isUndefined($scope.ORGANISATION_CODE)||!$scope.ORGANISATION_CODE) {
                    Notification.error(transervice.tran('请选择组织'));
                    return false;
                }
                if (angular.isUndefined($scope.model.CHANNEL)||!$scope.model.CHANNEL) {
                    Notification.error(transervice.tran('请选择平台'));
                    return false;
                }
                if (angular.isUndefined($scope.model.ATWAREHOUSE)||!$scope.model.ATWAREHOUSE) {
                    Notification.error(transervice.tran('请选择仓库'));
                    return false;
                }
                return true;
            }

            //校验明细信息
            function checkDetailInfo() {
                if(angular.isUndefined($scope.gridOptions.data)||!$scope.gridOptions.data.length){
                    Notification.error(transervice.tran('请填写初始化明细'));
                    return false;
                }
                var flag = true;
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    if(!row.PSKU_CODE){
                        Notification.error(transervice.tran("SKU不能为空"));
                        flag = false;
                        return ;
                    }
                    if (!row.PURCHASE||row.PURCHASE == 0) {
                        Notification.error(transervice.tran("请填写数量"));
                        flag = false;
                        return ;
                    }                    
                });
                return flag;
            }

            //保存操作
            $scope.save = function () {
                if(!checkInfo()||!checkDetailInfo()){
                    return false;
                }
                var s_data = {};
                var ary = [];
//              s_data.ORGANISATION_CODE = $scope.ORGANISATION_CODE.ORGANISATION_CODE;
                s_data.ORGANISATION_ID = $scope.ORGANISATION_CODE.ORGANISATION_ID;
//              s_data.CHANNEL_CODE = $scope.model.CHANNEL.CHANNEL_CODE;
                s_data.CHANNEL_ID = $scope.model.CHANNEL.CHANNEL_ID;
//              s_data.WAREHOUSE_CODE = $scope.model.ATWAREHOUSE.WAREHOUSE_CODE;
                s_data.WAREHOUSE_ID = $scope.model.ATWAREHOUSE.WAREHOUSE_ID;
                s_data.IMPORT_STATE = 1;
                $scope.gridOptions.data.forEach(function (obj) {
                	ary.push({
	                    "PSKU_CODE": obj.PSKU_CODE,
	                    "PSKU_ID": obj.PSKU_ID,
	                    "PURCHASE": obj.PURCHASE,
	                    "COPST_PRICE": obj.COPST_PRICE             		
                	});
                });
                s_data.sk_stock_initialise_detail = ary;
                httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise", "create", "POST", s_data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.cancel();
                });
            };
        });
    }
);