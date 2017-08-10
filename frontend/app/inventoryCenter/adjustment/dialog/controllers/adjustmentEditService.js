define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
       // 'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        angularAMD.service(
            'adjustmentEditService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "adjustmentEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/adjustment/dialog/views/adjustment_edit.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("adjustmentEditCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService) {

            $scope.rowEntity = {warehouseList:[]};

            //初始化单据类型下拉框
            $scope.model = model;
            $scope.options = {
                filter: "contains",
                autoBind: true,
                dataTextField: "PSKU_NAME_CN",
                dataValueField: "PSKU_CODE",
                optionLabel: "请输入SKU名称",
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search:{where:["and", ["=", "g_product_sku.DELETED_STATE", 0],["=", "g_product_sku.PSKU_STATE", 1]]
                    ,joinWith:["b_unit","g_product_sku_price"],andwhere:{PSKU_ID:0}
                }

            };

            $scope.gridOptions = {
                columnDefs: [
                    { field: 'TDSKU_CODE', displayName: transervice.tran('SKU'),cellTemplate:'<span>{{row.entity.PSKU_NAME_CN}}</span>',
                        editableCellTemplate:'<div single-select options="row.entity.options" select-model="row.entity.PDSKU_CODE" change="grid.appScope.selectRowChange(row)" row="row"></div>'},
                    { field: 'TDRODUCT_DE', displayName: transervice.tran('产品说明')},
                    { field: 'UNIT_CODE', displayName: transervice.tran('单位'),enableCellEdit: false,cellTemplate:'<span>{{row.entity.UNIT_NAME_CN}}</span>'},
                    { field: 'TDNUMBER', displayName: transervice.tran('数量')},
                    { field: 'UNIT_PRICE', displayName: transervice.tran('单价'),enableCellEdit: false},
                    { field: 'TDMONEY', displayName: transervice.tran('金额'),enableCellEdit: false},
                    { field: 'TDAREHOUSE_CODE', displayName: transervice.tran('调整仓库'),
                        cellTemplate:'<span>{{grid.appScope.getWarehouseName(row.entity.PDWAREHOUSE_CODE)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_CODE',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.warehouseList"}
                ],
                enablePagination: true, //是否分页，默认为true
                enablePaginationControls: true, //使用默认的底部分页
                useExternalPagination: true//是否使用分页按钮

            };

            //翻页触发方法
            $scope.gridOptions.getPage=function (pageNo,pageSize) {

            }

            //获取api
            $scope.gridOptions.getGridApi=function (api) {
                $scope.gridApi=api;
            }

            //勾选某一行
            $scope.gridOptions.selectRow=function (row) {

            }

            //编辑后触发
            $scope.gridOptions.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {
                if(colDef.field == "PDNUMBER" && newValue != oldValue) {
                    //金额显示变化的控制
                    if(isNaN(newValue)){
                        newValue = 0;
                        rowEntity.PDNUMBER = 1;
                    }
                    rowEntity.PDMONEY = (rowEntity.UNIT_PRICE * newValue).toFixed(2);
                    //计算总金额
                    if($scope.model){
                        if($scope.model.PMONEY_CODE) {
                            calTotalMoney($scope.model.PMONEY_CODE);
                        }
                    }
                }

            }

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);


            //新增明细
            $scope.addDetail = function () {
                var newData = {
                    //"SALES_ORDER": "",
                    "TDSKU_CODE": "",
                    "TDRODUCT_DE": "",
                    "UNIT_CODE": "",
                    "TDNUMBER": "",
                    "UNIT_PRICE": "",
                    "TDMONEY": "",
                    "TDAREHOUSE_CODE": $scope.TDAREHOUSE_CODE,
                    rowEntity:$scope.rowEntity,
                    options:$scope.options,
                    "UNIT_NAME":"",
                    "PSKU_NAME_CN":""
                };
                $scope.gridOptions.data.unshift(newData);
            };

            //行删除
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择要删除行！'));
                }

                //移除数据
                $scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(rows[0]), 1);
            }

            //页面元素显示初始化
            function baseInfoInit(){
                //页面元素显示初始化
                if($scope.model.PLAN_STATE == 1) {
                    $scope.PLAN_STATE = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = true;
                }else {
                    $scope.PLAN_STATE = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                }

                $scope.CUSER_NAME = "admin";
                $scope.CREATED_AT = $filter("date")(new Date(parseInt($scope.model.CREATED_AT)*1000), "yyyy-MM-dd");
                //调整原因
                $scope.reasonList = [{"value":'1',"name":"定期盘点"},{"value":'2',"name":"运输遗失"},{"value":'3',"name":"海关抽检"},{'value':'4','name':'入库差异调整'}];

                $scope.ADJUSTMENT_AT = $scope.model.ADJUSTMENT_AT;
                $scope.ADJUSTMENT_REASON = $scope.model.ADJUSTMENT_REASON;
                $scope.AWAREHOUSE_CODE = $scope.model.AWAREHOUSE_CODE;
                $scope.model.ORDER_TYPE = parseInt($scope.model.ORDER_TYPE);
                $scope.model.PRGANISATION_CODE = $scope.model.PRGANISATION_CODE;
            };

            //初始化
            function init() {
                $scope.warehouseList = new Array();
                $scope.organisation_list = new Array();
                //页面元素显示初始化
                baseInfoInit();

                var selectWhere = {"where": ["and", ["=", "DELETED_STATE", 0]]};
                //初始化组织
                initOrg();

                $scope.PRGANISATION_CODE = $scope.model.PRGANISATION_CODE;

                //初始化出库仓库列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.warehouseTotalList = result.data;
                        $scope.rowEntity.warehouseList = result.data;
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            object.rowEntity = $scope.rowEntity;
                        });
                        angular.forEach(result.data, function (obj, index) {
                            //初始化出库仓库列表
                            if (obj.ORGANIZE_CODE == $scope.model.PRGANISATION_CODE) {
                                $scope.warehouseList.push(obj);
                            }
                            //获取完仓库列表后绑定初始值
                            $scope.model.PWAREHOUSE_CODE = $scope.model.PWAREHOUSE_CODE;
                        });
                    }
                );
                //初始化明细
                getskuDetail();
            }

            //初始化明细获取
            function getskuDetail(){
                var dataSearch = {
                    "where":["=","ADJUSTMENT_ID",$scope.model.ADJUSTMENT_ID],
                    "joinWith":["b_unit","g_product_sku"]
                }
                httpService.httpHelper(httpService.webApi.api, "/inventory/adjustdetail", "index", "POST", dataSearch).then(
                    function (result) {
                        $scope.gridOptions.totalItems = result.data.length;
                        $scope.gridOptions.data = result.data;
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            object.UNIT_NAME_CN = object.b_unit.UNIT_NAME_CN;
                            object.PSKU_NAME_CN = object.g_product_sku.PSKU_NAME_CN;
                        });
                    }
                );
            }
            //基本信息和金额信息初始化
            init();

            //初始化组织列表
            function initOrg() {
                angular.forEach($scope.model.organisation_list, function (obj, index) {
                        $scope.organisation_list.push({'ORGANISATION_CODE':obj.ORGANISATION_CODE,'ORGANISATION_NAME_CN':obj.o_organisationt.ORGANISATION_NAME_CN});

                });
            }

            //SKU行选择
            $scope.selectRowChange=function(row){  //选择

                var price = row.selectModel.g_product_sku_price;
                row.entity.UNIT_PRICE = price[0].UNIT_PRICE;
                row.entity.UNIT_NAME = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_CODE = row.selectModel.b_unit.UNIT_CODE;

                row.entity.PSKU_NAME_CN = row.selectModel.PSKU_NAME_CN;
                row.entity.TDSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.TDNUMBER = 1;
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE).toFixed(2);
            };


            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //组织列表选择change事件
            $scope.ochange =function(PRGANISATION_CODE,entity){
                console.log(PRGANISATION_CODE);
                console.log(entity);
                if(PRGANISATION_CODE) {
                    $scope.model.PRGANISATION_CODE = PRGANISATION_CODE;
                    $scope.warehouseList = new Array();
                    angular.forEach($scope.warehouseTotalList, function (obj, index) {
                        if (obj.ORGANIZE_CODE == PRGANISATION_CODE) {
                            $scope.warehouseList.push(obj);
                        }
                    });
                }
            };

            //获取调整仓库名称
            $scope.getWarehouseName=function (warehouseCode) {
                if(warehouseCode) {
                    var warehouse=$scope.rowEntity.warehouseList.filter(c=>c.WAREHOUSE_CODE==warehouseCode);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            }

            //保存操作
            $scope.save = function () {
                //校验信息
                checkInfo();

                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                //组装数据
                getInfo();
                //保存更新数据
                saveinfo();
            };

            //校验信息
            function checkInfo() {
                $scope.msg = "";
                if($scope.model.PLAN_STATE == 1){
                    $scope.msg = "已审核单据不能修改";
                    return;
                }
                if (!$scope.model) {
                    $scope.msg = "请选择组织";
                    return;
                }
                if (!$scope.PRGANISATION_CODE) {
                    $scope.msg = "请选择组织";
                    return;
                } else if (!$scope.model.ADJUSTMENT_CD) {
                    $scope.msg = "请填写调整单号";
                    return;
                }else if (!$scope.ADJUSTMENT_REASON) {
                    $scope.msg = "请选择调整理由";
                    return;
                }else if (!$scope.AWAREHOUSE_CODE) {
                    $scope.msg = "请选择调整仓库";
                    return;
                }
            }

            //组装数据
            function getInfo() {
                //组装数据
                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g,'/')).getTime();
                $scope.model.ADJUSTMENT_AT = Math.round(formatDate/1000);
                var formatDate2 = new Date($scope.CREATED_AT.replace(/-/g,'/')).getTime();
                $scope.model.CREATED_AT = Math.round(formatDate2/1000);
                $scope.model.AWAREHOUSE_CODE = $scope.AWAREHOUSE_CODE;
                $scope.model.ADJUSTMENT_REASON  = $scope.ADJUSTMENT_REASON;
                $scope.model.PRGANISATION_CODE = $scope.PRGANISATION_CODE;
                $scope.model.PLAN_STATE = 0;

                if ($scope.model.ADJUSTMENT_ID >0) {
                    $scope.model.ADJUSTMENT_ID = $scope.model.ADJUSTMENT_ID;
                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        row['ADJUSTMENT_ID'] = $scope.model.ADJUSTMENT_ID;
                    });
                }

                //明细
                $scope.model.sk_adjustment_detail = $scope.gridOptions.data;
                //清除不需要更新的信息
                delete $scope.model.b_warehouse;
                delete $scope.model.o_organisation;

            }

            //保存更新数据
            function saveinfo() {

                if ($scope.model.ADJUSTMENT_ID ==0) {
                    var action = "create";
                } else {
                    var action = "update?id="+$scope.model.ADJUSTMENT_ID;
                }

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", action, "POST", $scope.model).then(
                    function (result) {
                        Notification.success(transervice.tran('保存成功'));
                    }
                );
            }


            //审核
            $scope.authSkplace = function(){

                checkAuth(1,1);
            }

            //反审核
            $scope.resetAuthSkplace = function(){
                //校验确认审核
                checkAuth(0, 2);
            }

            //校验确认审核
            function checkAuth(planState, authFlag){
                //校验SKU库存
                var arr = new Object();
                var searchData = new Array();

                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g,'/')).getTime();
                $scope.model.ADJUSTMENT_AT = Math.round(formatDate/1000);

                arr["PRGANISATION_CODE"] = $scope.model.PRGANISATION_CODE;
                arr["ADJUSTMENT_AT"] = $scope.model.ADJUSTMENT_AT;
                arr["ADJUSTMENT_ID"] = $scope.model.ADJUSTMENT_ID;
                arr["ADJUSTMENT_CD"] = $scope.model.ADJUSTMENT_CD;
                arr['planState'] = planState;
                arr['authFlag'] = authFlag;
                searchData.push(arr);
                //检查及时库存是否够
                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment","checkadjustment?XDEBUG_SESSION_START=1", "POST", searchData).then(function (datas) {
                    if(datas.data.flag == false) {

                            $confirm({ text: transervice.tran('选择的'+datas.data.sku+'库存不足，是否继续操作？') }).then(function () {
                                //更新单据状态
                                updateSkState(planState, authFlag);
                            });
                    } else {
                        //更新单据状态
                        updateSkState(planState, authFlag);
                    }
                });
            }

            //更新库存调整单状态
            function updateSkState(planState, authFlag) {
                var resultArr = new Array();
                //获取当前登陆人信息
                var USERINFO = localStorage.getItem('USERINFO');
                USERINFO = angular.fromJson(USERINFO);

                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g,'/')).getTime();
                $scope.model.AUTITO_AT = Math.round(formatDate/1000);
                $scope.model.AUTITO_CODE = USERINFO.USERNAME;
                $scope.model.PLAN_STATE = planState;
                $scope.model.authFlag = authFlag;

                resultArr.push($scope.model);

                var dataSearch = {
                    "batchMTC":resultArr
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment","update?XDEBUG_SESSION_START=1", "POST", dataSearch).then(function (datas) {

                    Notification.success(transervice.tran('操作成功'));
                    afterAuth(authFlag);

                })
            }

            //审核和反审核后的处理
            function afterAuth(authFlag) {
                if (authFlag == 1) {
                    $scope.PLAN_STATE = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = true;
                } else {
                    $scope.PLAN_STATE = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                }
            }
        });
    })
