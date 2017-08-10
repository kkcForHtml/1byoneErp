define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',

    ],
    function (angularAMD) {
        angularAMD.service(
            'adjustmentAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "adjustmentAddCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/adjustment/views/adjustment_add.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("adjustmentAddCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,configService) {

            $scope.model = model;
            $scope.rowEntity = {warehouseList:[],moneylist:[]};
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
                    /*{ field: 'SALES_ORDER', displayName: transervice.tran('销售订单')},*/
                    {
                        field: 'TDSKU_CODE', displayName: transervice.tran('SKU'),
                       // cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.TDSKU_CODE}}</div>    ',
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt" id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"><div single-select select-model="row.entity.TDSKU_CODE" options="row.entity.options" change="grid.appScope.selectRowChange(row)" row="row" style="width:98%"></div></div>',
                    },
                    { field: 'PSKU_NAME_CN', displayName: transervice.tran('产品名称'),enableCellEdit: false,},
                    {
                        field: 'UNIT_ID',
                        displayName: transervice.tran('单位'),
                        enableCellEdit: true,
                        cellClass:'text-right',
                        cellTemplate:'<span>{{grid.appScope.getUnitName(row.entity.UNIT_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'UNIT_ID',
                        editDropdownValueLabel: 'UNIT_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.unitList",
                    },
                    {
                        field: 'TDNUMBER',
                        displayName: transervice.tran('数量'),
                        cellClass:'text-right',
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="0" max="999999999" min="-999999" ui-grid-editor ng-model="row.entity.TDNUMBER" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>'
                    },
                    { field: 'MONEY_ID',
                        displayName: transervice.tran('币种'),
                        enableCellEdit:true,
                        cellClass:'text-right',
                        cellTemplate:'<span>{{grid.appScope.getMoneyName(row.entity.MONEY_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'MONEY_ID',
                        editDropdownValueLabel: 'MONEY_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.moneylist"
                    },
                    {
                    	field: 'UNIT_PRICE',
	                    displayName: transervice.tran('单价'),
	                    cellClass:'text-right',
	                    enableCellEdit: true,
	                    cellTemplate:'<div class="ui-grid-cell-contents" >{{row.entity.UNIT_PRICE|number:2}}</div>',
	                    editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="2" max="999999999" min="0" ui-grid-editor ng-model="row.entity.UNIT_PRICE" ng-change="grid.appScope.changeTotalmoney(row)" ></form></div>'
                    },

                    { field: 'TDMONEY',
                        displayName: transervice.tran('金额'),
                        cellClass:'text-right',
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TDMONEY|number:2}}</div>'
                    },
                    { field: 'TDAREHOUSE_ID', displayName: transervice.tran('调整仓库'),
                        cellTemplate:'<span>{{grid.appScope.getWarehouseName(row.entity.TDAREHOUSE_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.warehouseList"}

                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false//是否使用分页按钮

            };

            //翻页触发方法
            $scope.gridOptions.getPage=function (pageNo,pageSize) {

            }

            $scope.orgoptions={ types:[2],//不是必须
                getList:function (orgList) { //不是必须

                },
                change:function (PRGANISATION_ID ,entity) {  //不是必须
                    if(PRGANISATION_ID) {
                        $scope.model.PRGANISATION_ID = PRGANISATION_ID;
                        $scope.TDAREHOUSE_IDInput = new Array();
                        angular.forEach($scope.warehouseTotalList, function (obj, index) {
                            if (obj.ORGANISATION_ID == PRGANISATION_ID) {
                                $scope.warehouseListInput.push(obj);
                            }
                        });
                        $scope.rowEntity.warehouseList = $scope.warehouseListInput;
                    }
                }
            }

            //获取api
            $scope.gridOptions.getGridApi=function (api) {
                $scope.gridApi=api;
            }

            //勾选某一行
            $scope.gridOptions.selectRow=function (row) {

            }

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);


            //新增明细
            $scope.addDetail = function () {
                if (!$scope.model.PRGANISATION_ID) {
                    return Notification.error(transervice.tran("请先选择组织"));
                }
                if (!$scope.AWAREHOUSE_ID) {
                    return Notification.error(transervice.tran("请先选择仓库"));
                }

                var newData = {
                    //"SALES_ORDER": "",
                    "TDSKU_CODE": "",
                    "PSKU_ID" : "",
                    "TDRODUCT_DE": "",
                    "UNIT_CODE": "",
                    "TDNUMBER": "",
                    "UNIT_PRICE": "",
                    "TDMONEY": "",
                    "TDAREHOUSE_ID": $scope.AWAREHOUSE_ID,
                    rowEntity:$scope.rowEntity,
                    options: angular.copy($scope.options),
                    "UNIT_NAME":"",
                    "PSKU_NAME_CN":""
                };
                $scope.gridOptions.data.unshift(newData);
                gridDefaultOptionsService.refresh($scope.gridOptions,"PSKU_CODE");//刷新方法

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
                    return Notification.error(transervice.tran('请选择需要操作的数据'));
                }

                //移除数据
                rows.forEach((obj)=>{
                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                })

            }

            //初始化
            function init() {
                $scope.currentuser = configService.getUserInfo();

                $scope.organisation_list = new Array();
                $scope.warehouseList = new Array();
                //页面元素显示初始化
                $scope.PLAN_STATE = "草稿";
                $scope.CUSER_NAME =  $scope.currentuser == null?"": $scope.currentuser.u_staffinfo2.STAFF_NAME_CN;
                $scope.CUSER_CODE =  $scope.currentuser == null?"": $scope.currentuser.USER_INFO_CODE;
                $scope.showAuth = false;
                $scope.showResetAuth = false;
                $scope.skplacingId = 0;
                //时间日期初始化
                $scope.CREATED_AT = $filter("date")(new Date(), "yyyy-MM-dd");
                $scope.ADJUSTMENT_AT = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss");

                //调整原因
                $scope.reasonList = [{"value":'1',"name":"定期盘点"},{"value":'2',"name":"运输遗失"},{"value":'3',"name":"海关抽检"},{'value':'4','name':'入库差异调整'}];
                $scope.ADJUSTMENT_REASON = '1';



                initOrg();
                initWare();
                initMoneyList();
                //初始化单位
                initUnitlist();
            }

            //基本信息和金额信息初始化
            init();

            //初始化仓库
            function initWare(n,fn){
                if($scope.model.PRGANISATION_ID)
                    var selectWhere = {where:['=','ORGANISATION_ID',$scope.model.PRGANISATION_ID],limit:0};
                else
                    var selectWhere = {limit:0};

                //初始化出库仓库列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.warehouseTotalList = result.data;

                        fn&&fn(n);
                    }
                );
                $scope.gridOptions.data = [];
            }

            //初始化单位表
            function initUnitlist(){
                var selectWhere = {'where':['=','UNIT_STATE',1],limit: 0};

                //初始化单位列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.rowEntity.unitList = result.data;
                    }
                );
            }

            //初始化货币列表
            function initMoneyList(){
                var selectWhere = {limit:0};

                //初始化出库仓库列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.rowEntity.moneylist = result.data;
                    }
                );
            }


            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //获取调整仓库名称
            $scope.getWarehouseName=function (warehouseID) {

                if(warehouseID) {
                    var warehouse=$scope.rowEntity.warehouseList.filter(c=>c.WAREHOUSE_ID==warehouseID);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            }
			//获取币种名称
			$scope.getMoneyName = function (moneyID) {
				if (moneyID) {
                    var warehouse=$scope.rowEntity.moneylist.filter(c=>c.MONEY_ID==moneyID);
                    if(warehouse.length){
                        return warehouse[0].MONEY_NAME_CN;
                    }
				}
			}

            //获取单位名称
            $scope.getUnitName = function (unit_id) {
                if (unit_id) {
                    var unit=$scope.rowEntity.unitList.filter(c=>c.UNIT_ID==unit_id);
                    if($scope.rowEntity.unitList.length){
                        return unit[0].UNIT_NAME_CN;
                    }
                }
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
                if (!$scope.model) {
                    $scope.msg = "请选择组织";
                    return;
                }
                if (!$scope.model.PRGANISATION_ID) {
                    $scope.msg = "请选择组织";
                    return;
                }else if (!$scope.ADJUSTMENT_REASON) {
                    $scope.msg = "请选择调整理由";
                    return;
                }else if (!$scope.AWAREHOUSE_ID) {
                    $scope.msg = "请选择调整仓库";
                    return;
                }
                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    if (!obj.MONEY_ID) {
                        $scope.msg = '请选择币种';
                        return;
                    }
                });

            }

            //组装数据
            function getInfo() {
                //组装数据
                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g,'/')).getTime();
                $scope.model.ADJUSTMENT_AT = Math.round(formatDate/1000);
                var formatDate2 = new Date($scope.CREATED_AT.replace(/-/g,'/')).getTime();
                //$scope.model.CREATED_AT = Math.round(formatDate2/1000);
                $scope.model.AWAREHOUSE_ID = $scope.AWAREHOUSE_ID;
                $scope.model.ADJUSTMENT_REASON  = $scope.ADJUSTMENT_REASON;

                if ($scope.skplacingId >0) {
                    $scope.model.ADJUSTMENT_ID = $scope.skplacingId;
                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        row['ADJUSTMENT_ID'] = $scope.model.ADJUSTMENT_ID;
                    });
                }

                //明细
                $scope.model.sk_adjustment_detail = $scope.gridOptions.data;

            }

            //SKU行选择
            $scope.selectRowChange=function(row){  //选择
                var price = row.selectModel.g_product_sku_price;
                row.entity.UNIT_PRICE = 0.00;
                row.entity.UNIT_NAME = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit.UNIT_ID;

                row.entity.PSKU_NAME_CN = row.selectModel.PSKU_NAME_CN;
                row.entity.TDSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.TDRODUCT_DE = row.selectModel.PSKU_NAME_CN;
                row.entity.PSKU_ID = row.selectModel.PSKU_ID;
                row.entity.TDNUMBER = 0;
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE * row.entity.TDNUMBER).toFixed(2);
                $scope.gridOptions.gridApi.grid.refresh();
            };

            //更改数量
            $scope.changeTotalmoney=function(row){
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE * row.entity.TDNUMBER).toFixed(2);
            };



            //保存更新数据
            function saveinfo() {
                if ($scope.skplacingId ==0) {
                    var action = "create";
                    $scope.model.PLAN_STATE = 1;
                } else {
                    var action = "update?id="+$scope.skplacingId;
                }

                //检测明细是否有数据
                if($scope.gridOptions.data.length == 0){
                    return Notification.error(transervice.tran('请添加调整明细'));
                }
                var is_check_num = false;
                angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                    if(obj1.TDNUMBER == 0){
                        is_check_num = true;
                    }
                });

                if(is_check_num){
                    return Notification.error(transervice.tran('请输入调整数量'));
                }

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", action, "POST", $scope.model).then(
                    function (result) {
                        afterSave(result);
                        $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    }
                );
            }

            //保存后处理
            function afterSave(result){
                $scope.skplacingId = result.data.PLACING_ID;
                $scope.model.PLACING_CD = result.data.PLACING_CD;
                Notification.success(transervice.tran('保存成功'));
                $scope.currentState = "未审核";
                $scope.showAuth = true;
                $modalInstance.close();
            }
            //审核
            $scope.authSkplace = function(){

                //校验确认审核
                checkAuth(1, 1);
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

                var formatDate = new Date($scope.PLACING_AT.replace(/-/g,'/')).getTime();
                $scope.model.PLACING_AT = Math.round(formatDate/1000);

                var sku_arr = new Object();

                angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                    var sku = new Object();
                    sku['skuId'] = obj1.PSKU_ID;
                    sku['pSku'] = obj1.TDSKU_CODE;
                    sku['alNum'] = obj1.TDNUMBER;
                    sku['WAREHOUSE_ID'] = obj1.TDAREHOUSE_ID;
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
                var resultArr = new Array();
                $scope.model.PLAN_STATE = planState;
                $scope.model.authFlag = authFlag;
                resultArr.push($scope.model);
                var dataSearch = {
                    "batch":resultArr
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","update", "POST", dataSearch).then(function (datas) {

                    Notification.success(transervice.tran(datas.message));
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
            var c_PRGANISATION_ID;
            $scope.orgoptions = {
                types: [4],
                change: function (PRGANISATION_ID, entity) {
					var $p = $q.defer();
                    //组织列表选择change事件
                    if (PRGANISATION_ID) {
                        if ($scope.model.PRGANISATION_ID && $scope.gridOptions.data.length > 0 && $scope.gridOptions.data[0]['PSKU_CODE'] != "") {
                            $confirm({text: transervice.tran('修改组织会把明细清空，是否继续？')}).then(function () {
                                //清空明细
                                $scope.gridOptions.data = [];
                                //$scope.addDetail();

                                c_PRGANISATION_ID=$scope.model.PRGANISATION_ID = PRGANISATION_ID;
                                $p.resolve();
                                $scope.warehouseList = new Array();
                                angular.forEach($scope.warehouseTotalList, function (obj, index) {
                                    if (obj.ORGANISATION_ID == PRGANISATION_ID  && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
                                        $scope.warehouseList.push(obj);
                                    }
                                });
                                $scope.rowEntity.warehouseList = $scope.warehouseList;
                            },function () {
                            	$scope.model.PRGANISATION_ID = c_PRGANISATION_ID;

                            });
                        } else {
                            c_PRGANISATION_ID = $scope.model.PRGANISATION_ID;
                        	$p.resolve();
                            $scope.model.PRGANISATION_ID = PRGANISATION_ID;
                            $scope.warehouseList = new Array();
                            angular.forEach($scope.warehouseTotalList, function (obj, index) {
                                if (obj.ORGANISATION_ID == PRGANISATION_ID  && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
                                    $scope.warehouseList.push(obj);
                                }
                            });
                            $scope.rowEntity.warehouseList = $scope.warehouseList;
                        }

						$p.promise.then(function () {
                            $scope.sdkCondtion.where = ["and",["=", "g_product_sku.PSKU_STATE", 1],['or',['=','g_product_sku.ORGAN_ID_DEMAND',c_PRGANISATION_ID],['=','g_product_sku.ORGAN_ID_PURCHASE',c_PRGANISATION_ID]]];
						})

                    }

                }
            }
            //初始化组织列表
            function initOrg() {
                angular.forEach($scope.model.organisation_list, function (obj, index) {
                    $scope.organisation_list.push({'ORGANISATION_ID':obj.ORGANISATION_ID,'ORGANISATION_NAME_CN':obj.o_organisationt.ORGANISATION_NAME_CN});
                });
            }
        });
    })
