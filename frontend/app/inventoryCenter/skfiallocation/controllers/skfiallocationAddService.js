define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skfiallocationAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skfiallocationAddCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skfiallocation/views/skfiallocation_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skfiallocationAddCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService) {
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
                        field: 'ATSKU_CODE', displayName: transervice.tran('SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"><div single-select select-model="row.entity.ATSKU_CODE" options="row.entity.options" change="grid.appScope.selectRowChange(row)" row="row" style="width:98%"></div></div>'
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
                        cellClass:"text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.ALLOCATION_NUMBER"></form></div>'
                    },
                    {
                        field: 'ETWAREHOUSE_ID', displayName: transervice.tran('调出仓库'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getWarehouseName(row.entity.ETWAREHOUSE_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "warehouseList"
                    },
                    {
                        field: 'ATWAREHOUSE_ID', displayName: transervice.tran('调入仓库'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getWarehouseName(row.entity.ATWAREHOUSE_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "warehouseList"
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

            //组织列表选择change事件
            var _tempOrg;
            $scope.oChange = function (selectModel) {
                if ($scope.ORGANISATION_ID && $scope.gridOptions.data.length > 0) {
                    $confirm({text: transervice.tran('修改组织会把明细清空，是否继续？')}).then(function () {
                        $scope.ORGANISATION_ID = selectModel;
                        $scope.gridOptions.data = [];
                        $scope.warehouseList = [];
                        angular.forEach($scope._warehouseList, function (obj, index) {
                            if (obj.ORGANISATION_ID == selectModel) {
                                $scope.warehouseList.push(obj);
                            }
                        });
                    },function () {
                        $scope.ORGANISATION_ID = _tempOrg;
                        return false;
                    });
                } else {
                    _tempOrg = $scope.ORGANISATION_ID;
                    $scope.ORGANISATION_ID = selectModel;
                    $scope.warehouseList = [];
                    angular.forEach($scope._warehouseList, function (obj, index) {
                        if (obj.ORGANISATION_ID == selectModel) {
                            $scope.warehouseList.push(obj);
                        }
                    });
                }
            };

            //初始化仓库列表
            $scope._warehouseList = [];
            (function () {
                var selectWhere = {"where": ["=", "WAREHOUSE_STATE", 1],'limit':0};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                    $scope.warehouseList = [];
                    $scope._warehouseList = result.data;
                });
            })();

            function init() {
                //页面元素显示初始化
                $scope.currentState = "草稿";
                $scope.initDate = $filter("date")(new Date(), "yyyy-MM-dd");
                $scope.currentuser = configService.getUserInfo();
                $scope.initUserName =  $scope.currentuser == null?"": $scope.currentuser.u_staffinfo2.STAFF_NAME_CN;
                //初始化明细
                $scope.gridOptions.data = [];
            }

            init();//基本信息初始化

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
                    "ATSKU_CODE": "",
                    "TDRODUCT_DE": "",
                    "UNIT_NAME": "",
                    "ALLOCATION_NUMBER": "",
                    "ETWAREHOUSE_ID": $scope.ETWAREHOUSE_ID,
                    "ATWAREHOUSE_ID": $scope.ATWAREHOUSE_ID,
                    "ALLOCATION_REMARKS":"",
                    options:angular.copy($scope.options),
                    warehouseList: angular.copy($scope.warehouseList)
                };
                newItem.options.search.where.push(['or',["=","g_product_sku.ORGAN_ID_DEMAND",$scope.ORGANISATION_ID],["=","g_product_sku.ORGAN_ID_PURCHASE",$scope.ORGANISATION_ID]]);
                $scope.gridOptions.data.unshift(newItem);
                gridDefaultOptionsService.refresh($scope.gridOptions,"ATSKU_CODE");
            };

            //SKU行选择
            $scope.selectRowChange=function(row){
                row.entity.PSKU_ID = row.selectModel.PSKU_ID;
                row.entity.ATSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.TDRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.UNIT_NAME = row.selectModel.b_unit == null?'':row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit == null?0:row.selectModel.b_unit.UNIT_ID;
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
            $scope.getWarehouseName=function (warehouseId) {
                if($scope.warehouseList.length) {
                    var warehouse = $scope.warehouseList.filter(c=>c.WAREHOUSE_ID===warehouseId);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            };

            //校验基本信息
            function checkInfo() {
                if (!$scope.ORGANISATION_ID) {
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
                if (!$scope.ALLOCATION_AT||$scope.ALLOCATION_AT==='') {
                    Notification.error(transervice.tran('请选择调拨日期'));
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
                        Notification.error(transervice.tran("调拨SKU不能为空"));
                        flag = false;
                        return ;
                    }
                    if(!row.ATWAREHOUSE_ID){
                        Notification.error(transervice.tran("请选择调拨明细的调入仓库"));
                        flag = false;
                        return ;
                    }
                    if(!row.ETWAREHOUSE_ID){
                        Notification.error(transervice.tran("请选择调拨明细的调出仓库"));
                        flag = false;
                        return ;
                    }
                    if (row.ETWAREHOUSE_ID === row.ATWAREHOUSE_ID) {
                        Notification.error(transervice.tran('调拨明细的调拨仓库不能为同一仓库'));
                        return false;
                    }
                    if (!row.ALLOCATION_NUMBER||row.ALLOCATION_NUMBER == 0) {
                        Notification.error(transervice.tran("请填写调拨数量"));
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
                s_data.ORGANISATION_ID = $scope.ORGANISATION_ID;
                s_data.ETWAREHOUSE_ID = $scope.ETWAREHOUSE_ID;
                s_data.ATWAREHOUSE_ID = $scope.ATWAREHOUSE_ID;
                s_data.ALLOCATION_AT = Math.round(new Date($scope.ALLOCATION_AT.replace(/-/g,'/')).getTime()/1000);
                s_data.ALLOCATION_REMARKS = $scope.ALLOCATION_REMARKS;
                s_data.sk_fiallocation_detail = $scope.gridOptions.data;
                httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation", "create", "POST", s_data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.cancel();
                });
            };
        });
    }
);