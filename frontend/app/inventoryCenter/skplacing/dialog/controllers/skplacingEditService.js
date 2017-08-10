define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        angularAMD.service(
            'skplacingEditService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skplacingEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skplacing/dialog/views/skplacing_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skplacingEditCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, Notification, configService,transervice, $http, $q, $interval, commonService,$filter,selectSupplier_service,gridDefaultOptionsService) {

            $scope.rowEntity = {warehouseList:[]};
            //初始化单据类型下拉框
            $scope.model = model;
            $scope.options = {
                autoBind: true,
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_CODE",
                optionLabel: "请输入SKU",
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search:{where:["and", ["=", "g_product_sku.DELETED_STATE", 0],["=", "g_product_sku.PSKU_STATE", 1]]
                    ,joinWith:["b_unit","g_product_sku_price"],andwhere:{PSKU_ID:0}
                }

            };

            $scope.gridOptions = {
                columnDefs: [
                    //{ field: 'SALES_ORDER', displayName: transervice.tran('销售订单')},
                    { field: 'PDSKU_CODE', displayName: transervice.tran('SKU'),cellTemplate:'<span>{{row.entity.PDSKU_CODE}}</span>',
                        editableCellTemplate:'<div single-select options="row.entity.options" select-model="row.entity.PDSKU_CODE" change="grid.appScope.selectRowChange(row)" row="row"></div>' },
                    { field: 'PRODUCT_DE', displayName: transervice.tran('产品名称'),enableCellEdit: false,},
                    { field: 'UNIT_CODE', displayName: transervice.tran('单位'),enableCellEdit: false,cellTemplate:'<span>{{row.entity.UNIT_NAME_CN}}</span>'},
                    { field: 'PDNUMBER', displayName: transervice.tran('数量')},
                    { field: 'UNIT_PRICE', displayName: transervice.tran('单价'),enableCellEdit: false},
                    { field: 'PDMONEY', displayName: transervice.tran('金额'),enableCellEdit: false,cellTemplate:'<span>{{grid.appScope.calMoney(row.entity)}}</span>'},
                    { field: 'PDWAREHOUSE_CODE', displayName: transervice.tran('出库仓库'),
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
            /*$scope.gridOptions.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {


            }*/

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //金额触发显示
            $scope.calMoney = function (entity) {
                //金额显示变化的控制
                entity.PDMONEY = (parseFloat(entity.UNIT_PRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);
                if(isNaN(entity.PDMONEY)){
                    return  0;
                }
                //计算总金额
                if($scope.model){
                    if($scope.model.PMONEY_CODE) {
                        calTotalMoney($scope.model.PMONEY_CODE);
                    }
                }

                return entity.PDMONEY;
            }

            //新增明细
            $scope.addDetail = function () {
                if (!$scope.model.PRGANISATION_CODE) {
                    return Notification.error(transervice.tran('请先选择组织！'));
                }
                var newData = {
                    //"SALES_ORDER": "",
                    "PDSKU_CODE": "",
                    "PRODUCT_DE": "",
                    "UNIT_CODE": "",
                    "PDNUMBER": "",
                    "UNIT_PRICE": "",
                    "PDMONEY": "",
                    "PDWAREHOUSE_CODE": $scope.model.PWAREHOUSE_CODE,
                    rowEntity:$scope.rowEntity,
                    options:angular.copy($scope.options),
                    "UNIT_NAME_CN":""
                };
                newData.options.search.andwhere={PSKU_ID:0};
                newData.options.search.where.push(["=","g_product_sku.ORGAN_CODE_DEMAND",$scope.model.PRGANISATION_CODE]);
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
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = true;
                }else {
                    $scope.currentState = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                }

                $scope.CUSER_NAME =  $scope.model.u_userinfoc == null?"":$scope.model.u_userinfoc.USERNAME;
                $scope.CREATED_AT = $filter("date")(new Date(parseInt($scope.model.CREATED_AT)*1000), "yyyy-MM-dd");
                $scope.PLACING_AT =  $scope.model.PLACING_AT;
                $scope.customerName = $scope.model.pa_partner.PARTNER_NAME_CN;

                $scope.typeList = [{"value":1,"name":"销售出库"},{"value":2,"name":"内部销售出库"},{"value":3,"name":"其他出库"}];
                $scope.model.ORDER_TYPE = parseInt($scope.model.ORDER_TYPE);
                $scope.PRGANISATION_CODE = $scope.model.PRGANISATION_CODE;

                //当前登陆者
                $scope.currentuser = configService.getUserInfo();
            };

            //初始化
            function init() {
                $scope.warehouseList = new Array();
                //页面元素显示初始化
                baseInfoInit();

                var selectWhere = {"where": ["and", ["=", "DELETED_STATE", 0]]};
                //初始化组织
                initOrg();

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

                $scope.gridOptions.totalItems = $scope.model.sk_placing_detail.length;
                $scope.gridOptions.data = $scope.model.sk_placing_detail;
                angular.forEach($scope.gridOptions.data, function (object, index) {
                    object.UNIT_NAME_CN = object.b_unit.UNIT_NAME_CN;
                    object.PSKU_NAME_CN = object.g_product_sku.PSKU_NAME_CN;
                    object.options =  {
                        autoBind: true,
                        dataTextField: "PSKU_CODE",
                        dataValueField: "PSKU_CODE",
                        optionLabel: "请输入SKU",
                        url:httpService.webApi.api+"/master/product/prodsku/index",
                        search:{where:["and", ["=", "g_product_sku.DELETED_STATE", 0],["=", "g_product_sku.PSKU_STATE", 1]]
                            ,joinWith:["b_unit","g_product_sku_price"],andwhere:{PSKU_ID:0}
                        }

                    };
                });
            }
            //金额信息初始化
            function pmoneyInit() {
                var conWhere = {"where": ["and", ["=", "DELETED_STATE", 0],["=", "MONEY_STATE", 1]]};
                //初始化币种列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", conWhere).then(
                    function (result) {
                        $scope.moneyCodeList = result.data;
                    }
                );
                //获取汇率信息
                var conRate = {"where": ["and", ["=", "DELETED_STATE", 0],["=", "EXCHANGE_RATE_STATE", 1]]};
                httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "index", "POST", conRate).then(
                    function (result) {
                        $scope.exchangerRateList = result.data;
                    }
                );
            }

            //基本信息和金额信息初始化
            init();
            pmoneyInit();


            //初始化组织列表
            function initOrg() {

                $scope.orgoptions={ types:[4],
                    change:function (PRGANISATION_CODE ,entity) {
                        //组织列表选择change事件
                        if(PRGANISATION_CODE) {
                            if($scope.model.PRGANISATION_CODE && $scope.gridOptions.data.length>0 && $scope.gridOptions.data[0]['PDSKU_CODE'] !="") {
                                $confirm({ text: transervice.tran('修改组织会把明细清空，是否继续？') }).then(function () {
                                    //清空明细
                                    $scope.gridOptions.data=[];
                                    //$scope.addDetail();

                                    $scope.model.PRGANISATION_CODE = PRGANISATION_CODE;
                                    $scope.warehouseList = new Array();
                                    angular.forEach($scope.warehouseTotalList, function (obj, index) {
                                        if (obj.ORGANIZE_CODE == PRGANISATION_CODE) {
                                            $scope.warehouseList.push(obj);
                                        }
                                    });


                                });
                            } else {
                                $scope.model.PRGANISATION_CODE = PRGANISATION_CODE;
                                $scope.warehouseList = new Array();
                                angular.forEach($scope.warehouseTotalList, function (obj, index) {
                                    if (obj.ORGANIZE_CODE == PRGANISATION_CODE) {
                                        $scope.warehouseList.push(obj);
                                    }
                                });
                            }

                        }

                    }
                }
            }



            //币种切换事件
            $scope.changePmoneyCode=function (pmoneycode) {
                if(pmoneycode) {
                    calTotalMoney(pmoneycode);
                }
            }
            //SKU行选择
            $scope.selectRowChange=function(row){  //选择

                var price = row.selectModel.g_product_sku_price;
                row.entity.UNIT_PRICE = price[0].UNIT_PRICE;
                row.entity.UNIT_NAME_CN = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_CODE = row.selectModel.b_unit.UNIT_CODE;

                row.entity.PRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.PDSKU_CODE = row.selectModel.PSKU_CODE;


                row.entity.PDNUMBER = 1;
                row.entity.PDMONEY = parseFloat(row.entity.UNIT_PRICE).toFixed(2);

                $scope.gridOptions.gridApi.grid.refresh();
                //计算总金额
                if($scope.model){
                    if($scope.model.PMONEY_CODE) {
                        calTotalMoney($scope.model.PMONEY_CODE);
                    }
                }
            };

            //计算总金额
            function calTotalMoney(pmoneycode) {

                $scope.model.PMONEY = 0;
                $scope.exchangeRate = 1;

                //累计金额
                angular.forEach($scope.gridOptions.data, function (row, i) {
                    angular.forEach($scope.exchangerRateList, function (obj, index) {
                        if (obj.TARGET_MONEY_CODE == pmoneycode && obj.MONEY_CODE == row['MONEY_CODE']) {
                            //获取汇率
                            $scope.exchangeRate = obj.EXCHANGE_RATE_ODDS;
                            $scope.model.PMONEY = parseFloat($scope.model.PMONEY) + parseFloat(row.PDMONEY)*parseFloat($scope.exchangeRate);
                        }
                    });

                });
                $scope.model.PMONEY = $scope.model.PMONEY.toFixed(2);
            }
            //查询客户
            $scope.searchPartner = function () {
                selectSupplier_service.showDialog([]).then(function (data) {
                    $scope.customerName = data.PARTNER_NAME_CN;
                    $scope.model.PPARTNER_CODE = data.PARTNER_CODE;

                });
            }


            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };




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

            //保存操作
            $scope.save = function () {
                //校验信息
                checkInfo();
                checkDetailInfo();
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
                if (!$scope.model) {
                    $scope.msg = "请选择组织";
                    return;
                }
                if (!$scope.model.PRGANISATION_CODE) {
                    $scope.msg = "请选择组织";
                    return;
                } else if (!$scope.model.ORDER_TYPE) {
                    $scope.msg = "请选择单据类型";
                    return;
                }else if (!$scope.model.PPARTNER_CODE) {
                    $scope.msg = "请选择供应商";
                    return;
                }else if (!$scope.model.PWAREHOUSE_CODE) {
                    $scope.msg = "请选择出库仓库";
                    return;
                }else if (!$scope.model.PMONEY_CODE) {
                    $scope.msg = "请选择金额信息-币种";
                    return;
                }

            }

            //校验明细信息
            function checkDetailInfo() {
                if($scope.msg.length>0){
                    return;
                }
                angular.forEach($scope.gridOptions.data, function (row, index) {

                    if (!row.PDSKU_CODE) {
                        $scope.msg = "请选择SKU";
                        return;
                    } else if (!row.PDWAREHOUSE_CODE) {
                        $scope.msg = "请选择出库明细的出库仓库";
                        return;
                    }
                });


            }

            //组装数据
            function getInfo() {
                //组装数据
                var formatDate = new Date($scope.PLACING_AT.replace(/-/g,'/')).getTime();
                $scope.model.PLACING_AT = Math.round(formatDate/1000);
                $scope.PRGANISATION_CODE = $scope.PRGANISATION_CODE;

                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        row['PLACING_ID'] = $scope.model.PLACING_ID;
                        row['PLACING_CD'] = $scope.model.PLACING_CD;
                    });


                //明细
                $scope.model.sk_placing_detail = $scope.gridOptions.data;
                //清除不需要更新的信息
                delete $scope.model.b_warehouse;
                delete $scope.model.o_organisation;
                delete $scope.model.pa_partner;
                delete $scope.model.u_userinfo_a;
                delete $scope.model.u_userinfoc;

            }

            //保存更新数据
            function saveinfo() {

                    var action = "update?id="+$scope.model.PLACING_ID;

                httpService.httpHelper(httpService.webApi.api, "inventory/placing", action, "POST", $scope.model).then(
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
                //校验信息
                checkInfo();
                checkDetailInfo();
                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                //组装数据
                getInfo();

                //校验SKU库存
                var arr = new Object();
                var searchData = new Array();



                arr["ORGANISATION_CODE"] = $scope.model.PRGANISATION_CODE;
                arr["PRE_ORDER_AT"] = $scope.model.PLACING_AT;
                arr["PLACING_ID"] = $scope.model.PLACING_ID;
                arr["PLACING_CD"] = $scope.model.PLACING_CD;
                arr["orderclassify"] = 3;
                searchData.push(arr);

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","checkskuinventory", "POST", searchData).then(function (datas) {

                    if(datas.data.flag == false) {
                        if(datas.data.type == 1){
                            return Notification.error(transervice.tran('出库日期不在会计期间！'));
                        } else {
                            $confirm({ text: transervice.tran('选择的'+datas.data.sku+'库存不足，是否继续操作？') }).then(function () {
                                //更新单据状态
                                updateSkState(planState, authFlag);
                            });
                        }

                    } else {
                        //更新单据状态
                        updateSkState(planState, authFlag);
                    }


                });
            }

            //更新出库单状态
            function updateSkState(planState, authFlag) {

                $scope.model.PLAN_STATE = planState;
                $scope.model.authFlag = authFlag;
                $scope.model.AUTITO_CODE = $scope.currentuser == null?"": $scope.currentuser.USER_INFO_CODE;
                $scope.model.AUTITO_AT =  Math.round(new Date().getTime()/1000);

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","update?id="+$scope.model.PLACING_ID, "POST", $scope.model).then(function (datas) {

                    Notification.success(transervice.tran('操作成功'));
                    afterAuth(authFlag);



                })
            }

            //审核和反审核后的处理
            function afterAuth(authFlag) {
                if (authFlag == 1) {
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = true;
                } else {
                    $scope.currentState = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                }
            }
        });
    })
