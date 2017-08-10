define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/organisationsDirt',
        'app/common/directives/singleSelectDirt'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skfiallocationEditService',
            function ($q, $modal) {
                this.showDialog = function (model,index,count,idList,links) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skfiallocationEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skfiallocation/views/skfiallocation_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                },
                                index:function () {
                                    return index;
                                },
                                count:function () {
                                    return count;
                                },
                                idList:function () {
                                	return idList;
                                },
                                links:function () {
                                    return links;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skfiallocationEditCtrl", function ($scope, amHttp, $confirm, model, index, count, idList,links, $modalInstance, httpService, Notification, configService,transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService) {
            $scope.index = index;
            $scope.count = count;
            $scope.links = links;
            $scope.idList = idList;
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
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"><div single-select select-model="row.entity.ATSKU_CODE" options="row.entity.options" change="grid.appScope.selectRowChange(row)" row="row" style="width:98%"></div></div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
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
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.ALLOCATION_NUMBER"></form></div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
                    },
                    {
                        field: 'ETWAREHOUSE_ID', displayName: transervice.tran('调出仓库'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getWarehouseName(row.entity.ETWAREHOUSE_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "warehouseList",
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
                    },
                    {
                        field: 'ATWAREHOUSE_ID', displayName: transervice.tran('调入仓库'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getWarehouseName(row.entity.ATWAREHOUSE_ID)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "warehouseList",
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
                    },
                    {
                        field: 'ALLOCATION_REMARKS', displayName: transervice.tran('备注'),
                        editableCellTemplate:'<div><form><input type="text" maxlength="255" ui-grid-editor ng-model="row.entity.ALLOCATION_REMARKS"></form></div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
                    },
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
            $scope.warehouseList = [];
            $scope._warehouseList = [];
            (function () {
                var selectWhere = {"where":  ["=", "WAREHOUSE_STATE", 1],'limit':0};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                    $scope._warehouseList = result.data;
                    initWarehouse(model.ORGANISATION_ID);
                });
            })();

            function initWarehouse(organisationId) {
                angular.forEach($scope._warehouseList, function (obj, index) {
                    if (obj.ORGANISATION_ID == organisationId) {
                        $scope.warehouseList.push(obj);
                    }
                });
                $scope.ETWAREHOUSE_ID = model.ETWAREHOUSE_ID;
                $scope.ATWAREHOUSE_ID = model.ATWAREHOUSE_ID;
            }

            $scope.init = function () {
                //页面元素显示初始化
                $scope.FIALLOCATION_CD = model.FIALLOCATION_CD;
                if(model.ALLOCATION_STATE == 2) {
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = model.SYSTEM_GENERATION == 1?false:true;//系统自动生成的单据不能反审核
                    $scope.showSave = false;
                    $scope.isAuth = true;
                }else {
                    $scope.currentState = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                    $scope.isAuth = false;
                }

                $scope.CREATED_AT = $filter("date")(new Date(parseInt(model.CREATED_AT)*1000), "yyyy-MM-dd");
                $scope.CUSER_NAME =  model.u_userinfoc == null?"":model.u_userinfoc.u_staff_info.STAFF_NAME_CN;//制单人
                $scope.ALLOCATION_AT =  model.ALLOCATION_AT;
                $scope.ALLOCATION_REMARKS = model.ALLOCATION_REMARKS;
                //初始化组织列表
                $scope.orgoptions = {types:[4]};
                $scope.ORGANISATION_ID = model.ORGANISATION_ID;
                //初始化明细
                $scope.gridOptions.totalItems = model.sk_fiallocation_detail.length;
                $scope.gridOptions.data = model.sk_fiallocation_detail;
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    row.UNIT_NAME = row.b_unit == null?'':row.b_unit.UNIT_NAME_CN;
                    row.options = angular.copy($scope.options);
                    row.warehouseList = $scope.warehouseList;
                });
                refreshDetails();
            };

            //基本信息初始化
            $scope.init();

            //首单
            $scope.firstPage=function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery(0).then(function () {
                    $scope.index = 0;
                    $scope.nextBtnDisabled = false;
                });
            };

            //上一单
            $scope.prePage=function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.index-1).then(function () {
                    $scope.index -= 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //下一单
            $scope.nextPage=function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.index + 1).then(function () {
                    $scope.index += 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //尾单
            $scope.lastPage=function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.count - 1).then(function () {
                    $scope.index = $scope.count - 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //翻单查询
            function turnPageQuery(offset) {
                var dataSearch = {
                    "where":['and', ["=","sk_fiallocation.DELETED_STATE", 0]],
                    "joinWith":["sk_fiallocation_detail","u_userinfoc"],
                    "orderby":"ALLOCATION_STATE asc,FIALLOCATION_ID desc",
                    "distinct":true
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation", "view?id="+$scope.idList[offset], "POST",dataSearch).then(function (result){
                    model = result.data;
                    model.ALLOCATION_AT = $filter("date")(new Date(parseInt(model.ALLOCATION_AT)*1000), "yyyy-MM-dd");
                    $scope.ORGANISATION_ID = model.ORGANISATION_ID;
                    $scope.warehouseList = [];
                    initWarehouse(model.ORGANISATION_ID);
                    $scope.init();
                });
            }

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
                newItem.options.search.where.push(['or',["=","g_product_sku.ORGAN_ID_DEMAND",model.ORGANISATION_ID],["=","g_product_sku.ORGAN_ID_PURCHASE",model.ORGANISATION_ID]]);
                $scope.gridOptions.data.unshift(newItem);
                refreshDetails();
            };

            //刷新明细
            function refreshDetails() {
                gridDefaultOptionsService.refresh($scope.gridOptions,"ATSKU_CODE");
            }

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
                var delRows = rows.filter(e=>e.FIALLOCATION_DETAIL_ID);
                if(delRows.length) {
                    var data = $scope.gridOptions.data.filter(e=>e.FIALLOCATION_DETAIL_ID);
                    if(delRows.length == data.length){
                        return Notification.error(transervice.tran("明细必须保存一条实际存在的数据"));
                    }
                    return $confirm({ text:transervice.tran(messageService.confirm_del) }).then(function () {
                        httpService.httpHelper(httpService.webApi.api, "inventory/fiallocationdetail", "delete", "POST", {'batchMTC':delRows}).then(function (result) {
                            Notification.success(transervice.tran('操作成功'));
                            $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a,rows)==-1);
                        });
                    });
                }else {
                    $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a,rows)==-1);
                }
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //获取仓库名称
            $scope.getWarehouseName=function (warehouseId) {
                if($scope.warehouseList.length) {
                    var warehouse=$scope.warehouseList.filter(c=>c.WAREHOUSE_ID===warehouseId);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            };

            //校验基本信息
            function checkInfo() {
                if (!$scope.ETWAREHOUSE_ID||!$scope.ATWAREHOUSE_ID) {
                    Notification.error(transervice.tran('请选择调拨仓库'));
                    return false;
                }
                if ($scope.ETWAREHOUSE_ID === $scope.ATWAREHOUSE_ID) {
                    Notification.error(transervice.tran('调拨仓库不能为同一仓库'));
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

            //保存操作
            $scope.save = function () {
                if(!checkInfo()||!checkDetailInfo()){
                    return false;
                }
                var data = getInfo();
                httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation", "update?id="+ model.FIALLOCATION_ID, "POST", data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.cancel();
                });
            };

            //组装数据
            function getInfo() {
                var _data = {};
                _data.FIALLOCATION_ID = model.FIALLOCATION_ID;
                _data.FIALLOCATION_CD = model.FIALLOCATION_CD;
                _data.ORGANISATION_ID = model.ORGANISATION_ID;
                _data.ETWAREHOUSE_ID = $scope.ETWAREHOUSE_ID;
                _data.ATWAREHOUSE_ID = $scope.ATWAREHOUSE_ID;
                _data.ALLOCATION_REMARKS = $scope.ALLOCATION_REMARKS;
                _data.DETAIL_CODE = 1;
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    row.FIALLOCATION_ID = model.FIALLOCATION_ID;
                });
                _data.sk_fiallocation_detail = $scope.gridOptions.data;
                return _data;
            }

            //审核
            $scope.authSkfiallocation = function(){
                checkAuth(2,1);
            };

            //反审核
            $scope.resetAuthSkfiallocation = function(){
                if(model.SYSTEM_GENERATION == 1){
                    return Notification.error(transervice.tran(messageService.error_audit_s));
                }else {
                    checkAuth(1, 2);
                }
            };

            //校验确认审核
            function checkAuth(state, authFlag){
                if(!checkInfo()||!checkDetailInfo()){
                    return false;
                }
                var pSku = [];
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    var _pSku = {};
                    _pSku.PSKU_ID = row.PSKU_ID;
                    _pSku.PSKU_CODE = row.ATSKU_CODE;
                    _pSku.WAREHOUSE_ID = authFlag == 1?row.ETWAREHOUSE_ID:row.ATWAREHOUSE_ID;
                    _pSku.NUMBER = row.ALLOCATION_NUMBER * (-1);
                    pSku.push(_pSku);
                });
                var msg = authFlag == 1?messageService.confirm_audit:messageService.confirm_audit_f;
                $confirm({ text: transervice.tran(msg) }).then(function () {
                    httpService.httpHelper(httpService.webApi.api, "inventory/allocation","getinsnum", "POST", pSku).then(function (result) {
                        if(!result.data.flag) {
                            $confirm({ text: transervice.tran('选择的'+result.data.sku+'库存不足，是否继续操作？') }).then(function () {
                                updateSkState(state, authFlag);
                            });
                        } else {
                            updateSkState(state, authFlag);
                        }
                    });
                });
            }

            //更新出库单状态
            function updateSkState(state, authFlag) {
                var data = getInfo();
                data.ALLOCATION_AT = Math.round(new Date(model.ALLOCATION_AT.replace(/-/g,'/')).getTime()/1000);
                $scope.currentuser = configService.getUserInfo();//当前登陆者
                data.ALLOCATION_STATE = state;
                data.authFlag = authFlag;
                data.AUTITO_ID = $scope.currentuser == null?0: $scope.currentuser.USER_INFO_ID;
                data.AUTITO_AT =  Math.round(new Date().getTime()/1000);
                httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation","update?id="+model.FIALLOCATION_ID, "POST", data).then(function (datas) {
                    Notification.success(transervice.tran('操作成功'));
                    if(authFlag == 1) {
                        $scope.currentState = "已审核";
                        $scope.showAuth = false;
                        $scope.showResetAuth = model.SYSTEM_GENERATION == 1?false:true;//系统自动生成的单据不能反审核
                        $scope.showSave = false;
                        $scope.isAuth = true;
                    }else {
                        $scope.currentState = "未审核";
                        $scope.showAuth = true;
                        $scope.showResetAuth = false;
                        $scope.showSave = true;
                        $scope.isAuth = false;
                    }
                    refreshGrid();
                });
            }

            function refreshGrid() {
                if (!$scope.isAuth) {
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    $scope.gridOptions.gridApi.grid.refresh();
                } else {
                    var _data = $scope.gridOptions.data;
                    $scope.gridOptions.data = [];
                    setTimeout(function(){
                        $scope.gridOptions.data = _data;
                        $scope.gridOptions.gridApi.grid.refresh();
                    },10);
                }
            }
        });
    }
);