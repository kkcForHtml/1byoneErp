define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',
        'app/inventoryCenter/common/controllers/SaleorderChooseService',
        'app/inventoryCenter/common/controllers/historyPlacingChooseService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'skplacingAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skplacingAddCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/skplacing/views/skplacing_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skplacingAddCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,partner_list_service,SaleorderChooseService,historyPlacingChooseService,gridDefaultOptionsService,messageService,$timeout) {

            $scope.rowEntity = {warehouseList:[]};
            $scope.warehouseTypeArr = new Array(1,2,5,8);
            $scope.needSaleOrder = true;
            $scope.model = {};
            $scope.TARIFF = 0.00;  //组织税率
            $scope.isSelectSku  = 0 ;
            $scope.isChoosePlacing = 0 ;

            $scope.sdkCondtion = {where:["and",["=", "g_product_sku.PSKU_STATE", 1]],joinWith:["b_unit","g_product_sku_price"]};
            $scope.options = {
                filter: "contains",
                autoBind: true,
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_CODE",
                optionLabel: "请输入SKU名称",
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search: $scope.sdkCondtion

            };

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'SALES_ORDER',
                        displayName: transervice.tran('销售订单'),
                        enableCellEdit: true,
                        //cellTemplate: '<div type="button" class="ui-grid-cell-contents ng-binding ng-scope" ng-click="grid.appScope.searchSaleOrder(row.entity)" style="width:100%;">{{row.entity.SALES_ORDER}}</div>'
                        editableCellTemplate:'<div><form><input type="text" maxlength="255" ui-grid-editor ng-model="row.entity.SALES_ORDER"></form></div>'
                    },
                    {
                        field: 'RED_PLACING_CD',
                        displayName: transervice.tran('红字出库单号'),
                        enableCellEdit: false,
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents ng-binding ng-scope" ng-click="grid.appScope.searchPlacingOrder(row.entity)" style="width:100%;">{{row.entity.RED_PLACING_CD}}</div>',
                        cellEditableCondition: function () {
                            return  $scope.isSelectSku != 1;
                        }
                    },
                    {
                        field: 'PDSKU_CODE',
                        width:110,
                        displayName: transervice.tran('SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.PSKU_ID" change="grid.appScope.selectRowChange(row)" row="row"></div></div>',                        //enableCellEdit: true,
                        cellEditableCondition: function () {
                            return  $scope.isChoosePlacing != 1;
                        }
                    },
                    {field: 'PRODUCT_DE', displayName: transervice.tran('产品说明'), enableCellEdit: false},
                    {
                        field: 'UNIT_ID',
                        displayName: transervice.tran('单位'),
                        enableCellEdit: false,
                        cellClass:'text-right',
                        cellTemplate: '<span>{{row.entity.UNIT_NAME}}</span>'
                    },
                    {
                        field: 'PDNUMBER',
                        displayName: transervice.tran('数量'),
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="9999999999" min="-999999999"   ui-grid-editor ng-model="row.entity.PDNUMBER" ng-change="changenumCalMoney(row)"></form></div>',
                        cellClass: "text-right"
                    },{
                        field: 'TAX_RATE',
                        displayName: transervice.tran('税率'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_RATE?row.entity.TAX_RATE*100+"%":row.entity.TAX_RATE}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999999" min="0"   ui-grid-editor ng-model="row.entity.TAX_RATE"></form></div>',
                        enableCellEdit: true,
                        cellClass: "text-right"
                    },
                    {
                        field: 'NOT_TAX_UNITPRICE',
                        displayName: transervice.tran('税前单价'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{grid.appScope.changeNotTaxPRICE(row.entity)|number:2}}</div>'
                    },{
                        field: 'UNIT_PRICE',
                        displayName: transervice.tran('含税单价'),
                        enableCellEdit: true,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNIT_PRICE|number:2}}</div>',
                        editableCellTemplate:'<div><form><input type="text" numeric decimals="2" min="0" max="9999999999" ui-grid-editor ng-model="row.entity.UNIT_PRICE"></form></div>'
                    },
                    {
                        field: 'NOT_TAX_AMOUNT',
                        displayName: transervice.tran('税前金额'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" ><span>{{grid.appScope.calNotTaxMoney(row.entity)|number:2}}</span></div>'
                    },{
                        field: 'PDMONEY',
                        displayName: transervice.tran('税价合计'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" ><span>{{grid.appScope.calMoney(row.entity)|number:2}}</span></div>'
                    },
                    {
                        field: 'PDWAREHOUSE_ID', displayName: transervice.tran('出库仓库'),
                        cellTemplate: '<span>{{grid.appScope.getWarehouseName(row.entity.PDWAREHOUSE_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.warehouseList"
                    }

                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false//是否使用分页按钮

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
           /*
            $scope.gridOptions.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {

            }
            */



            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);


            //税后金额触发显示
            $scope.calMoney = function (entity) {
                //金额显示变化的控制
                entity.PDMONEY = (parseFloat(entity.UNIT_PRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);
                if(isNaN(entity.PDMONEY)){
                    return  0;
                }
                //计算总金额
                if($scope.model){
                    if($scope.model.PMONEY_ID) {
                        calcTotal();
                    }
                }

                return entity.PDMONEY;
            }

            $scope.changenumCalMoney = function(entity){
                //金额显示变化的控制
                entity.PDMONEY = (parseFloat(entity.UNIT_PRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);
                if(isNaN(entity.PDMONEY)){
                    return  0;
                }

                return entity.PDMONEY;
            }

            //税前金额触发显示
            $scope.calNotTaxMoney = function (entity) {
                //金额显示变化的控制
                entity.NOT_TAX_AMOUNT = (parseFloat(entity.NOT_TAX_UNITPRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);
                if(isNaN(entity.NOT_TAX_AMOUNT)){
                    return  0;
                }
                return entity.NOT_TAX_AMOUNT;
            };

            //计算税前单价
            $scope.changeNotTaxPRICE = function(entity){
                entity.NOT_TAX_UNITPRICE = (parseFloat(entity.UNIT_PRICE) / (1 + parseFloat(entity.TAX_RATE))).toFixed(2);
                if(isNaN(entity.NOT_TAX_UNITPRICE)){
                    return  0;
                }
                return entity.NOT_TAX_UNITPRICE;
            };

            //新增明细
            $scope.addDetail = function (index) {

               if (!$scope.model || !$scope.model.PRGANISATION_ID) {
                    return Notification.error(transervice.tran('请先选择组织'));
                }
               if (!$scope.PWAREHOUSE_ID) {
                    return Notification.error(transervice.tran('请先选择仓库'));
                }
                if (!$scope.customerName) {
                    return Notification.error(transervice.tran('请选择客户'));
                }

                if (!$scope.model.PMONEY_ID) {
                    return Notification.error(transervice.tran('请选择金额信息-币种'));
                }

                var newData = {
                    //"SALES_ORDER": "",
                    "PDSKU_CODE": "",
                    "PSKU_ID" : "",
                    "PRODUCT_DE": "",
                    "UNIT_OD": "",
                    "PDNUMBER": "",
                    "UNIT_PRICE": "",
                    "TAX_RATE": "",
                    "NOT_TAX_UNITPRICE": "",
                    "NOT_TAX_AMOUNT": "",
                    "PDMONEY": "",
                    "PDWAREHOUSE_ID": $scope.PWAREHOUSE_ID,
                    rowEntity:$scope.rowEntity,
                    options:angular.copy($scope.options),
                    "UNIT_NAME":"",
                    'isEdit' : 1,
                };
                // newData.options.search.where.push(["=","g_product_sku.ORGAN_CODE_DEMAND",$scope.PRGANISATION_CODE]);
                if (index) {
                    $scope.gridOptions.data.splice(index, 0, newData);
                } else {
                    $scope.gridOptions.data.unshift(newData);
                }

                gridDefaultOptionsService.refresh($scope.gridOptions,"PDSKU_CODE");//刷新方法
//              var datas=$scope.gridOptions.data;
//              $scope.gridOptions.data=[];
//              setTimeout(function(){
//                  datas.forEach(a=>{
//                      a.options.value= a.ATSKU_CODE;
//                  if(a.PSKU_ID){
//                      a.options.search.andwhere=["=","g_product_sku.PSKU_ID", a.PSKU_ID];
//                  }else{
//                      a.options.search.andwhere=["=","g_product_sku.PSKU_ID","0"];
//                  }
//              });
//                  $scope.gridOptions.data=datas;
//                  $scope.$apply();
//              },10);
            };

            //行删除
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }

                //移除数据
                rows.forEach((obj)=>{
                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                });
            }

            //SKU行选择
            $scope.selectRowChange=function(row){  //选择
                var price = row.selectModel.g_product_sku_price;

                row.entity.PDSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.isSKUEdit = true;
                row.entity.UNIT_PRICE = 0.00;
                row.entity.UNIT_NAME = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit.UNIT_ID;

                row.entity.TAX_RATE = $scope.TARIFF;
                row.entity.PSKU_NAME_CN = row.selectModel.PSKU_NAME_CN;
                row.entity.PRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.PSKU_ID = row.selectModel.PSKU_ID;
                row.entity.PDNUMBER = 0;
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE * row.entity.PDNUMBER).toFixed(2);
                $scope.isSelectSku = 1;
                 $scope.gridOptions.gridApi.grid.refresh();
            };

            //初始化
            function init() {

                //页面元素显示初始化
                $scope.currentuser = configService.getUserInfo();
                $scope.currentState = "草稿";
                $scope.CUSER_NAME =  $scope.currentuser == null?"": $scope.currentuser.u_staffinfo2.STAFF_NAME_CN;
                $scope.CUSER_CODE =  $scope.currentuser == null?"": $scope.currentuser.USER_INFO_CODE;
                $scope.showAuth = false;
                $scope.showResetAuth = false;
                $scope.skplacingId = 0;
                $scope.PMONEY = "0.00";
                //时间日期初始化
                $scope.CREATED_AT = $filter("date")(new Date(), "yyyy-MM-dd");
                $scope.PLACING_AT = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss");

                //初始化单据类型下拉框
                $scope.typeList = [{"value":1,"name":"销售出库"},{"value":2,"name":"内部销售出库"},{"value":3,"name":"其他出库"}];

                $scope.model.ORDER_TYPE = 1;
        
                //初始化组织列表
                var selectWhere = {"where":["=", "WAREHOUSE_STATE", 1],'limit':0};
				var c_PRGANISATION_ID;
                $scope.orgoptions={ types:[4],
                    change:function (PRGANISATION_ID ,entity) {
                    	var $p = $q.defer();
                        if(!$scope.model) {
                            $scope.model = new Object();
                        }
                        	
                            //组织列表选择change事件
                            if(PRGANISATION_ID) {
                                if($scope.model.PRGANISATION_ID && $scope.gridOptions.data.length>0) {
                                    $confirm({ text: transervice.tran('修改组织会把明细清空，是否继续？') }).then(function () {
                                        //清空明细
                                        $scope.gridOptions.data=[];
                                        $scope.gridOptions.gridApi.grid.refresh();
                                        //$scope.addDetail();
                                        $scope.customerName = "";
										c_PRGANISATION_ID = $scope.model.PRGANISATION_ID = PRGANISATION_ID;
										$p.resolve();
                                        orgChangeWarehouse(PRGANISATION_ID);
                                    },function () {                                    
                                    	$scope.model.PRGANISATION_ID = c_PRGANISATION_ID;
                                    });
                                } else {
                                    $scope.customerName = "";
                                    c_PRGANISATION_ID = $scope.model.PRGANISATION_ID;
                                    $p.resolve();
                                    orgChangeWarehouse(PRGANISATION_ID);
                                }

								$p.promise.then(function () {
	                                var  orgWhere = {"where":['=','ORGANISATION_ID',c_PRGANISATION_ID]};
	
	                                //获取组织信息
	                                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "view", "POST", orgWhere).then(
	                                    function(result){
	                                        $scope.TARIFF =  result.data.TARIFF;
	                                    }
	                                )
									
		                            $scope.sdkCondtion.where = ["and",["=", "g_product_sku.PSKU_STATE", 1],['or',['=','g_product_sku.ORGAN_ID_DEMAND',c_PRGANISATION_ID||''],['=','g_product_sku.ORGAN_ID_PURCHASE',c_PRGANISATION_ID||'']]];
								})
                            }
                    }
                }

                //初始化出库仓库列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.warehouseTotalList = result.data;
                        $scope.rowEntity.warehouseList = result.data;
                    }
                );

                $scope.gridOptions.data = [];
               // $scope.addDetail();
            }

            //选择组织 更改仓库
            function orgChangeWarehouse(ORGANISATION_ID) {
                $scope.model.PRGANISATION_ID = ORGANISATION_ID;
                $scope.model.warehouseList = new Array();
                angular.forEach($scope.warehouseTotalList, function (obj, index) {
                    if (obj.ORGANISATION_ID == ORGANISATION_ID && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
                        $scope.model.warehouseList.push(obj);
                    }
                });
                $scope.rowEntity.warehouseList = $scope.model.warehouseList;
                $scope.warehouseList = $scope.model.warehouseList;
            }

            //金额信息初始化
            function pmoneyInit() {
                var conWhere = {"where": ["=", "MONEY_STATE", 1]};
                //初始化币种列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", conWhere).then(
                    function (result) {
                        $scope.moneyCodeList = result.data;
                    }
                );
                //获取汇率信息
                var conRate = {"where": ["=", "EXCHANGE_RATE_STATE", 1]};
                httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "index", "POST", conRate).then(
                    function (result) {
                        $scope.exchangerRateList = result.data;
                    }
                );
            }

            //基本信息和金额信息初始化
            init();
            pmoneyInit();

            //币种切换事件
            $scope.changePmoneyCode=function (pmoneyID) {
                if(pmoneyID) {
                    calTotalMoney(pmoneyID, $scope.PLACING_AT);
                }
            }

            //计算总金额
            function calTotalMoney(pmoneyID, moneyTime) {
                var timeTemp = angular.copy(moneyTime);
                timeTemp = new Date(timeTemp.replace(/-/g, '/')).getTime();
                timeTemp = Math.round((timeTemp).valueOf() / 1000);
                //单价 金额改变
                var exchangeTemp = [];

                //新建sku计算金额
                if($scope.isSelectSku==1){
                    $scope.PMONEY = 0;
                    angular.forEach($scope.gridOptions.data, function (row, i) {
                        row.PDMONEY = (parseFloat(row.UNIT_PRICE) * parseFloat(row.PDNUMBER)).toFixed(2);
                        $scope.PMONEY =parseFloat($scope.PMONEY) + parseFloat(row.PDMONEY);
                    });

                }else {
                    angular.forEach($scope.gridOptions.data, function (row, i) {
                        var temp = [];
                        temp.push(row.MONEY_ID);
                        temp.push(pmoneyID);
                        temp.push(timeTemp);
                        exchangeTemp.push(temp);
                    });

                    if (exchangeTemp.length) {
                        httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", exchangeTemp).then(function (datas) {
                            var flag = checkExchangeRate(datas.data);
                            if (flag) {
                                $scope.model.MONEY_ID_TEMP = $scope.model.PMONEY_ID;
                                changeExchangeRate(datas.data);
                            } else {
                                Notification.error(transervice.tran(messageService.error_exchange_rate));
                                $scope.model.PMONEY_ID = $scope.model.MONEY_ID_TEMP;
                            }
                        });
                    }
                }
            }

            //校验汇率是否可用
            function checkExchangeRate(data) {
                var flag = true;
                angular.forEach(data, function (row, i) {
                    if (row['3'] == null) {
                        flag = false;
                    }
                });
                return flag;
            }

            function changeExchangeRate(data) {
                angular.forEach(data, function (row, i) {
                    $scope.gridOptions.data[i].MONEY_ID = row['1']
                    $scope.gridOptions.data[i].NOT_TAX_UNITPRICE = $scope.gridOptions.data[i].NOT_TAX_UNITPRICE * row['3'];
                    $scope.gridOptions.data[i].UNIT_PRICE = $scope.gridOptions.data[i].UNIT_PRICE * row['3'];
                    $scope.gridOptions.data[i].PDMONEY = (parseFloat($scope.gridOptions.data[i].UNIT_PRICE) * parseFloat($scope.gridOptions.data[i].STORAGE_DNUMBER)).toFixed(2);               //含税总价
                    $scope.gridOptions.data[i].NOT_TAX_AMOUNT = (parseFloat($scope.gridOptions.data[i].NOT_TAX_UNITPRICE) * parseFloat($scope.gridOptions.data[i].STORAGE_DNUMBER)).toFixed(2);     //不含税总价
                });
                calcTotal();
            }

            function calcTotal() {
                $scope.PMONEY = 0;
                if ($scope.model.PMONEY_ID) {
                    angular.forEach($scope.gridOptions.data, function (obj, index) {
                        if(obj.PDMONEY == 'NaN'){
                            obj.PDMONEY = 0;
                        }

                        $scope.PMONEY += Number(obj.PDMONEY);
                    });
                }
                $scope.PMONEY = $scope.PMONEY.toFixed(2);
            }

            //查询客户
            $scope.searchPartner = function () {

                partner_list_service.showDialog([]).then(function (data) {

                    if($scope.gridOptions.data.length >0){
                        $confirm({text: transervice.tran('修改供应商会把明细清空，是否继续？')}).then(function () {
                            //清空明细
                            $scope.gridOptions.data = [];
                            $scope.model.needPurchase = 0;
                            $scope.model.STORAGE_MONEY = 0.00;
                            $scope.customerName = data.PARTNER_NAME_CN;
                            $scope.PARTNER_ID = data.PARTNER_ID;
                        });
                    }else{
                        $scope.customerName = data.PARTNER_NAME_CN;
                        $scope.PPARTNER_ID = data.PARTNER_ID;
                    }
                });
            }
            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };



            //获取出库仓库名称
            $scope.getWarehouseName=function (warehouseId) {

                if(warehouseId) {
                    var warehouse=$scope.rowEntity.warehouseList.filter(c=>c.WAREHOUSE_ID==warehouseId);
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
                if (!$scope.model.PRGANISATION_ID) {
                    $scope.msg = "请选择组织";
                    return;
                } else if (!$scope.model.ORDER_TYPE) {
                    $scope.msg = "请选择单据类型";
                    return;
                }else if (!$scope.PPARTNER_ID) {
                    $scope.msg = "请选择客户";
                    return;
                }else if (!$scope.PWAREHOUSE_ID) {
                    $scope.msg = "请选择出库仓库";
                    return;
                }else if (!$scope.model.PMONEY_ID) {
                    $scope.msg = "请选择金额信息-币种";
                    return;
                }
                else if($scope.gridOptions.data.length <=0){
                    $scope.msg = "请添加出库明细";
                    return;
                }
            }

            //校验明细信息
            function checkDetailInfo() {
                $scope.msg = "";
                angular.forEach($scope.gridOptions.data, function (row, index) {

                     if (!row.PDWAREHOUSE_ID) {
                        $scope.msg = "请选择出库明细的出库仓库";
                        return;
                    }else if (!row.PDNUMBER) {
                        $scope.msg = "请填写SKU的数量";
                        return;
                    }
                });


            }

            //组装数据
            function getInfo() {
                //组装数据
                var formatDate = new Date($scope.PLACING_AT.replace(/-/g,'/')).getTime();
                $scope.model.PLACING_AT = Math.round(formatDate/1000);
                $scope.model.PPARTNER_ID = $scope.PPARTNER_ID;
                $scope.model.PWAREHOUSE_ID = $scope.PWAREHOUSE_ID;
                $scope.model.PMONEY = $scope.PMONEY;
                if ($scope.skplacingId >0) {
                    $scope.model.PLACING_ID = $scope.skplacingId;
                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        row['PLACING_ID'] = $scope.skplacingId;
                        row['PLACING_CD'] = $scope.model.PLACING_CD;
                    });
                }

                //明细
                $scope.model.sk_placing_detail = $scope.gridOptions.data;

            }

            //保存更新数据
            function saveinfo() {
                if ($scope.skplacingId ==0) {
                    $scope.model.PLAN_STATE = 1;
                    var action = "create";
                } else {
                    var action = "update?id="+$scope.skplacingId;
                }
                httpService.httpHelper(httpService.webApi.api, "inventory/placing", action, "POST", $scope.model).then(
                    function (result) {
                        afterSave(result);
                    }
                );
            }

            //保存后处理
            function afterSave(result){
                $scope.skplacingId = result.data.PLACING_ID;
                $scope.model.PLACING_CD = result.data.PLACING_CD;
                setTimeout(function () {
                    $modalInstance.close($scope.model);//返回数据
                },50);
                Notification.success(transervice.tran('保存成功'));
                $scope.currentState = "未审核";
                $scope.showAuth = true;
            }
            //审核
            $scope.authSkplace = function(){

                //校验确认审核
                checkAuth(2, 1);
            }

            //反审核
            $scope.resetAuthSkplace = function(){
                //校验确认反审核
                checkAuth(1, 2);
            }

            function searchPlacingData() {
                $scope.model.EXISTS_DETAILID = [];
                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    if (obj.RED_PLACING_DETAIL_ID) {
                        $scope.model.EXISTS_DETAILID.push(obj.RED_PLACING_DETAIL_ID);
                    }
                });
            }

            //查询销售订单
            $scope.searchSaleOrder = function (entity) {
                if (!$scope.needSaleOrder) {
                    return;
                }
                if (!$scope.model.PRGANISATION_ID) {
                    return Notification.error(transervice.tran("请先选择组织"));
                }
                if (!$scope.customerName) {
                    return Notification.error(transervice.tran("请先选择客户"));
                }
                SaleorderChooseService.showDialog().then(function (data) {
                    entity.isEdit = 2;
                    entity.SALES_ORDER = data.cr_sales_order.SALES_ORDER_CD;
                    entity.PLACING_CD = '';
                    entity.PDSKU_CODE = data.PSKU_CODE;
                    entity.PSKU_ID = data.g_product_sku.PSKU_ID;
                    entity.PRODUCT_DE = '';
                    entity.MONEY_ID = data.cr_sales_order.MONEY_ID;
                    entity.UNIT_ID = data.UNIT_ID;
                    entity.UNIT_NAME = data.b_unit.UNIT_NAME_CN;
                    entity.TAX_RATE = data.TAX_RATE;
                    entity.PDNUMBER = data.PURCHASE;
                    entity.UNIT_PRICE = data.TAX_UNITPRICE == null ? 0 : data.TAX_UNITPRICE;
                    entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE==null?0:data.NOT_TAX_UNITPRICE;

                    entity.PMONEY = (parseFloat(entity.UNIT_PRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);               //含税总价

                    entity.NOT_TAX_AMOUNT = (parseFloat(entity.NOT_TAX_UNITPRICE) * parseFloat(entity.PDNUMBER)).toFixed(2);     //不含税总价

                    entity.PDMONEY =  entity.PMONEY;

                    $scope.gridOptions.gridApi.grid.refresh();

                    //计算总金额
                    if ($scope.model) {
                        if ($scope.model.PMONEY_ID) {
                            calTotalMoney($scope.model.PMONEY_ID, $scope.PLACING_AT);
                        }
                    }
                });
            }

            //查询出库订单
            $scope.searchPlacingOrder=function(entity){

                if($scope.isSelectSku==1){
                    return;
                }

                if (!$scope.needSaleOrder) {
                    return;
                }
                if (!$scope.model.PRGANISATION_ID) {
                    return Notification.error(transervice.tran("请先选择组织"));
                }
                if (!$scope.customerName) {
                    return Notification.error(transervice.tran("请先选择客户"));
                }

                searchPlacingData();

                historyPlacingChooseService.showDialog($scope).then(function (data) {
                    formatSelectData(entity, data, 2);
                });
            }



            function formatSelectData(entity, dataArray, flag) {
                var data = dataArray['0'];
                var index = $.inArray(entity,$scope.gridOptions.data);
                entity.isEdit = 2;
                entity.SALES_ORDER = data.SALES_ORDER;
                entity.RED_PLACING_CD = data.PLACING_CD;
                entity.RED_PLACING_DETAIL_ID = data.PLACING_DETAIL_ID;
                entity.PDSKU_CODE = data.PDSKU_CODE;
                entity.PSKU_ID = data.g_product_sku.PSKU_ID;
                entity.PRODUCT_DE = data.PRODUCT_DE;
                entity.UNIT_ID = data.UNIT_ID;
                entity.UNIT_NAME = data.b_unit.UNIT_NAME_CN;
                entity.TAX_RATE = data.TAX_RATE;
                entity.PDNUMBER = (-1) * data.psd_num;
                entity.MONEY_ID = data.sk_placing.PMONEY_ID;
                entity.PMONEY_ID = data.sk_placing.PMONEY_ID;
                entity.UNIT_PRICE = data.UNIT_PRICE == null ? 0 : data.UNIT_PRICE;
                entity.NOT_TAX_UNITPRICE = data.NOT_TAX_UNITPRICE==null?0:data.NOT_TAX_UNITPRICE;
                entity.NOT_TAX_AMOUNT = data.NOT_TAX_AMOUNT==null?0:data.NOT_TAX_AMOUNT;

                entity.PDMONEY = data.PDMONEY;
                $scope.gridOptions.gridApi.grid.refresh();
                $scope.isChoosePlacing = 1;

                $scope.gridOptions.gridApi.grid.refresh();
                dataArray.splice(0, 1);
                if (dataArray.length > 0) {
                    $scope.addDetail(++index);
                    formatSelectData($scope.gridOptions.data[index], dataArray, flag);
                }
                //计算总金额
                if ($scope.model) {
                    if ($scope.model.PMONEY_ID) {
                        calTotalMoney($scope.model.PMONEY_ID, $scope.PLACING_AT);
                    }
                }
            }

            //校验确认审核
            function checkAuth(planState, authFlag){
                //校验信息
                checkInfo();
                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                checkDetailInfo();
                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                //组装数据
                getInfo();

                //校验SKU库存
                var sku_arr = new Object();

                angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                    var sku = new Object();
                    sku['PSKU_ID'] = obj1.PSKU_ID;
                    sku['PSKU_CODE'] = obj1.PDSKU_CODE;
                    sku['NUMBER'] = obj1.PDNUMBER;
                    sku['WAREHOUSE_ID'] = obj1.PDWAREHOUSE_ID;
                    sku_arr[objIndex1] = sku;
                });

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","checkskuinventory", "POST", sku_arr).then(function (datas) {

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

            //更新出库单状态
            function updateSkState(planState, authFlag) {

                $scope.model.PLAN_STATE = planState;
                $scope.model.authFlag = authFlag;
                $scope.model.AUTITO_ID = $scope.currentuser == null?"": $scope.currentuser.USER_INFO_ID;
                $scope.model.AUTITO_AT =  Math.round(new Date().getTime()/1000);

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","update?id="+$scope.skplacingId, "POST", $scope.model).then(function (datas) {

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
