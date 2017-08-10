define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',
        'app/common/directives/singleSelectDirt'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skallocationEditService',
            function ($q, $modal) {
                this.showDialog = function (model,index,count,idList,links) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skallocationEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skallocation/views/skallocation_edit.html?ver='+_version_,
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
                                links:function(){
                                    return links;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skallocationEditCtrl", function ($scope, amHttp, $confirm, model, index, count, idList,links, $modalInstance, httpService, Notification, configService,transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService,goodsRejectedService) {
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
                        field: 'ATSKU_CODE', displayName: transervice.tran('调出SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"><div single-select select-model="row.entity.ATSKU_CODE" options="row.entity.options" change="grid.appScope.selectSkuRowChange(row)" row="row" style="width:98%"></div></div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
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
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.ALLOCATION_NUMBER"></form></div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
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
                        cellTemplate:
                        '<div  ng-if="row.entity.ALLOCATIONS_STATE==0" class="ui-grid-cell-contents noEdit-color" >{{"未调拨"|translate}}</div>'+
                        '<div  ng-if="row.entity.ALLOCATIONS_STATE==1" class="ui-grid-cell-contents noEdit-color" >{{"已发货"|translate}}</div>'+
                        '<div  ng-if="row.entity.ALLOCATIONS_STATE==2" class="ui-grid-cell-contents noEdit-color" >{{"已收货"|translate}}</div>'
                    },
                    {
                        field: 'ALLOCATION_REMARKS', displayName: transervice.tran('备注'),
                        editableCellTemplate:'<div><form><input type="text" maxlength="255" ui-grid-editor ng-model="row.entity.ALLOCATION_REMARKS"></form></div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        }
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
                    $scope.ERGANISATION_ID = model.ERGANISATION_ID;
                    $scope.ARGANISATION_ID = model.ARGANISATION_ID;
                });
            })();

            //初始化仓库列表
            $scope.eWarehouseList = [];//调出仓库列表
            $scope.aWarehouseList = [];//调入仓库列表
            $scope._warehouseList = [];//仓库列表
            (function () {
                var selectWhere = {"where":["and",["=", "WAREHOUSE_STATE", 1],['in', 'WAREHOUSE_TYPE_ID', [2, 5, 8]]],'limit':0};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                    $scope._warehouseList = result.data;
                    angular.forEach($scope._warehouseList, function (obj, index) {
                        if (obj.ORGANISATION_ID === model.ERGANISATION_ID) {
                            $scope.eWarehouseList.push(obj);
                        }
                    });
                    angular.forEach($scope._warehouseList, function (obj, index) {
                        if (obj.ORGANISATION_ID === model.ARGANISATION_ID) {
                            $scope.aWarehouseList.push(obj);
                        }
                    });
                    $scope.ETWAREHOUSE_ID = model.ETWAREHOUSE_ID;
                    $scope.ATWAREHOUSE_ID = model.ATWAREHOUSE_ID;
                });
            })();

            $scope.init = function() {
                //页面元素显示初始化
                $scope.ALLOCATION_CD = model.ALLOCATION_CD;
                if(model.ALLOCATION_STATE === '2') {
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = true;
                    $scope.showSave = false;
                    $scope.isAuth = true;
                }else {
                    $scope.currentState = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                    $scope.isAuth = false;
                }
                $scope.CREATED_AT = $filter("date")(new Date(parseInt(model.CREATED_AT)*1000), "yyyy-MM-dd");//制单日期
                $scope.CUSER_NAME =  model.u_userinfoc == null?"":model.u_userinfoc.u_staff_info.STAFF_NAME_CN;//制单人
                $scope.ESTIMATEDA_AT = model.ESTIMATEDA_AT;
                $scope.ESTIMATED_AT = model.ESTIMATED_AT;
                $scope.ALLOCATION_REMARKS = model.ALLOCATION_REMARKS;
                //初始化明细
                $scope.gridOptions.totalItems = model.sk_allocation_detail.length;
                $scope.gridOptions.data = model.sk_allocation_detail;
                var _skd = [];
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    _skd.push(row.ALLOCATION_DETAIL_ID);
                    row.UNIT_NAME = row.b_unit == null ? '' : row.b_unit.UNIT_NAME_CN;
                    row.options = angular.copy($scope.options);
                });
                //实际出/入库数据、调拨状态
                httpService.httpHelper(httpService.webApi.api,"inventory/allocation","getalstatus", "POST", {'ALLOCATION_DETAIL_ID':_skd}).then(function (result) {
                    var _data = result.data;
                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        angular.forEach(_data,function (obj, _index){
                            if(obj.ALLOCATION_DETAIL_ID === row.ALLOCATION_DETAIL_ID){
                                row.ALLOCATIONS_STATE = obj.ALLOCATIONS_STATE;
                                row.ACTUALATW_NUMBER = obj.ACTUALATW_NUMBER;
                                row.ACTUALETW_NUMBER = obj.ACTUALETW_NUMBER;
                            }
                        });
                    });
                    refreshDetails();
                });
            };

            $scope.init();//初始化信息

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

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
                    "where":['and', ["=","sk_allocation.DELETED_STATE", 0]],
                    "joinWith":["sk_allocation_detail","u_userinfoc"],
                    "orderby":"ALLOCATION_STATE asc,ALLOCATION_ID desc",
                    "distinct":true
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "view?id="+$scope.idList[offset], "POST",dataSearch).then(function (result){
                    model = result.data;
                    model.ESTIMATEDA_AT = $filter("date")(new Date(parseInt(model.ESTIMATEDA_AT)*1000), "yyyy-MM-dd");
                    model.ESTIMATED_AT = $filter("date")(new Date(parseInt(model.ESTIMATED_AT)*1000), "yyyy-MM-dd");
                    $scope.ERGANISATION_ID = model.ERGANISATION_ID;
                    $scope.ARGANISATION_ID = model.ARGANISATION_ID;
                    $scope.eWarehouseList = [];//调出仓库列表
                    $scope.aWarehouseList = [];//调入仓库列表
                    angular.forEach($scope._warehouseList, function (obj, index) {
                        if (obj.ORGANISATION_ID === model.ERGANISATION_ID) {
                            $scope.eWarehouseList.push(obj);
                        }
                    });
                    angular.forEach($scope._warehouseList, function (obj, index) {
                        if (obj.ORGANISATION_ID === model.ARGANISATION_ID) {
                            $scope.aWarehouseList.push(obj);
                        }
                    });
                    $scope.ETWAREHOUSE_ID = model.ETWAREHOUSE_ID;
                    $scope.ATWAREHOUSE_ID = model.ATWAREHOUSE_ID;
                    $scope.init();
                });
            }

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
                newItem.options.search.where.push(['or',["=","g_product_sku.ORGAN_ID_DEMAND",model.ERGANISATION_ID],["=","g_product_sku.ORGAN_ID_PURCHASE",model.ERGANISATION_ID]]);
                $scope.gridOptions.data.unshift(newItem);
                refreshDetails();
            };

            //刷新明细
            function refreshDetails() {
                gridDefaultOptionsService.refresh($scope.gridOptions,"ATSKU_CODE");
            }

            //SKU
            $scope.selectSkuRowChange = function(row){
                row.entity.ATPSKU_ID = row.selectModel.PSKU_ID;
                row.entity.ATSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.TDRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.UNIT_NAME = row.selectModel.b_unit == null?'':row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit == null?0:row.selectModel.b_unit.UNIT_ID;
                //调入SKU
                if(model.ARGANISATION_ID === model.ERGANISATION_ID){
                    row.entity.ETPSKU_ID = row.selectModel.PSKU_ID;
                    row.entity.ETSKU_CODE = row.selectModel.PSKU_CODE;
                }else{
                    //获取调入sku
                    var post = {'ARGANISATION_ID':model.ARGANISATION_ID,'PSKU_ID':row.selectModel.PSKU_ID};
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
                var delRows = rows.filter(e=>e.ALLOCATION_DETAIL_ID);
                if(delRows.length) {
                    var data = $scope.gridOptions.data.filter(e=>e.ALLOCATION_DETAIL_ID);
                    if(delRows.length == data.length){
                        return Notification.error(transervice.tran("明细必须保存一条实际存在的数据"));
                    }
                    return $confirm({ text:transervice.tran(messageService.confirm_del) }).then(function () {
                        httpService.httpHelper(httpService.webApi.api, "inventory/allocationdetail", "delete", "POST", {'batchMTC':delRows}).then(function (result) {
                            Notification.success(transervice.tran('操作成功'));
                            $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a,rows)==-1);
                        });
                    });
                }else {
                    $scope.gridOptions.data = $scope.gridOptions.data.filter(a=>$.inArray(a,rows)==-1);
                }
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
                        Notification.error(transervice.tran("调出SKU不能为空"));
                        flag = false;
                        return ;
                    }
                    if(!row.ETSKU_CODE){
                        Notification.error(transervice.tran("调入SKU不能为空"));
                        flag = false;
                        return ;
                    }
                    if (!row.ALLOCATION_NUMBER || row.ALLOCATION_NUMBER == 0) {
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
                s_data.ALLOCATION_ID = model.ALLOCATION_ID;
                s_data.ERGANISATION_ID = $scope.ERGANISATION_ID;
                s_data.ETWAREHOUSE_ID = $scope.ETWAREHOUSE_ID;
                s_data.ESTIMATED_AT = formatDate($scope.ESTIMATED_AT);
                s_data.ARGANISATION_ID = $scope.ARGANISATION_ID;
                s_data.ATWAREHOUSE_ID = $scope.ATWAREHOUSE_ID;
                s_data.ESTIMATEDA_AT = formatDate($scope.ESTIMATEDA_AT);
                s_data.ALLOCATION_REMARKS = $scope.ALLOCATION_REMARKS;
                s_data.DETAIL_CODE = 1;
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    row.ALLOCATION_ID = model.ALLOCATION_ID;
                });
                s_data.sk_allocation_detail = $scope.gridOptions.data;
                httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "update?id="+model.ALLOCATION_ID, "POST", s_data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.cancel();
                });
            };

            //审核
            $scope.authSkallocation = function(){
                checkAuth(2);
            };

            //反审核
            $scope.resetAuthSkallocation = function(){
                checkAuth(1);
            };

            //确认审核/反审核
            function checkAuth(flag){
                if(!checkInfo()||!checkDetailInfo()){
                    return false;
                }
                $scope.initUser = configService.getUserInfo();//当前登陆者
                if(flag === 2){
                    var authData = {};
                    authData.ALLOCATION_ID = model.ALLOCATION_ID;
                    authData.ALLOCATION_STATE = flag;
                    authData.AUTITO_ID = $scope.initUser == null?0: $scope.initUser.USER_INFO_ID;
                    authData.AUTITO_AT =  Math.round(new Date().getTime()/1000);
                    authData.ETWAREHOUSE_ID = $scope.ETWAREHOUSE_ID;
                    authData.ESTIMATED_AT = formatDate($scope.ESTIMATED_AT);
                    authData.ATWAREHOUSE_ID = $scope.ATWAREHOUSE_ID;
                    authData.ESTIMATEDA_AT = formatDate($scope.ESTIMATEDA_AT);
                    authData.ALLOCATION_REMARKS = $scope.ALLOCATION_REMARKS;
                    authData.DETAIL_CODE = 1;

                    var pSku = [];
                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        row.ALLOCATION_ID = model.ALLOCATION_ID;
                        var _pSku = {};
                        _pSku.PSKU_ID = row.ATPSKU_ID;
                        _pSku.PSKU_CODE = row.ATSKU_CODE;
                        _pSku.WAREHOUSE_ID = $scope.ETWAREHOUSE_ID;
                        _pSku.NUMBER = row.ALLOCATION_NUMBER * (-1);
                        pSku.push(_pSku);
                    });
                    authData.sk_allocation_detail = $scope.gridOptions.data;
                    if($scope.ARGANISATION_ID !== $scope.ERGANISATION_ID){
                        authData.ERGANISATION_ID = $scope.ERGANISATION_ID;
                        $scope.goodsRejected(authData);
                        return false;
                    }
                    $confirm({ text: transervice.tran(messageService.confirm_audit) }).then(function () {
                        httpService.httpHelper(httpService.webApi.api, "inventory/allocation","getinsnum", "POST", pSku).then(function (result) {
                            var _auth = [];
                            _auth.push(authData);
                            if(!result.data.flag){
                                $confirm({ text: transervice.tran('选择的'+result.data.sku+'库存不足，是否继续操作？') }).then(function () {
                                    httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "auth", "POST", {'AUTH_CODE':flag,'batchMTC':_auth}).then(function (result) {
                                        Notification.success(transervice.tran('操作成功'));
                                        $scope.currentState = "已审核";
                                        $scope.showResetAuth = true;
                                        $scope.showSave = false;
                                        $scope.showAuth = false;
                                        $scope.isAuth = true;
                                        refreshGrid();
                                    });
                                });
                            }else {
                                httpService.httpHelper(httpService.webApi.api, "inventory/allocation", "auth", "POST", {'AUTH_CODE':flag,'batchMTC':_auth}).then(function (result) {
                                    Notification.success(transervice.tran('操作成功'));
                                    $scope.currentState = "已审核";
                                    $scope.showResetAuth = true;
                                    $scope.showSave = false;
                                    $scope.showAuth = false;
                                    $scope.isAuth = true;
                                    refreshGrid();
                                });
                            }
                        });
                    });
                }else {
                    var resetAuthData = {};
                    resetAuthData.ALLOCATION_ID = model.ALLOCATION_ID;
                    resetAuthData.ALLOCATION_STATE = flag;
                    resetAuthData.AUTITO_ID = $scope.initUser == null?0: $scope.initUser.USER_INFO_ID;
                    resetAuthData.AUTITO_AT =  Math.round(new Date().getTime()/1000);
                    var _reAuth = [];
                    _reAuth.push(resetAuthData);
                    $confirm({ text: transervice.tran(messageService.confirm_audit_f) }).then(function () {
                        httpService.httpHelper(httpService.webApi.api, "inventory/allocation","auth", "POST", {'AUTH_CODE':flag,'batchMTC':_reAuth}).then(function (result) {
                            Notification.success(transervice.tran('操作成功'));
                            $scope.currentState = "未审核";
                            $scope.showResetAuth = false;
                            $scope.showSave = true;
                            $scope.showAuth = true;
                            $scope.isAuth = false;
                            refreshGrid();
                        });
                    });
                }
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
            
            //退货确认(优先)/内部交易
            $scope.goodsRejected = function(authData){
                goodsRejectedService.showDialog(authData).then(function(result){
                    if(!result){
                        return false;
                    }else{
                        Notification.success(transervice.tran('操作成功'));
                        $scope.currentState = "已审核";
                        $scope.showResetAuth = true;
                        $scope.showSave = false;
                        $scope.showAuth = false;
                        $scope.isAuth = true;
                        $scope.gridOptions.data = result;
                        refreshGrid();
                    }
                });
            };
        });
    }
);