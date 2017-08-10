define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/organisationsDirt1',
        'app/common/directives/singleSelectDirt'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skInitializationEditService',
            function ($q, $modal) {
                this.showDialog = function (model,index,count,idList,links) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skInitializationEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/initialization/skInitialization/views/skInitialization_edit.html?ver='+_version_,
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
                                idList:function(){
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
        angularAMD.controller("skInitializationEditCtrl", function ($scope, amHttp, $confirm, model, index, count,idList ,links, $modalInstance, httpService, Notification, configService,transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService,$timeout) {
            $scope.index = index;
            $scope.count = count;
            $scope.idList = idList;
            $scope.links = links;
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
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        },
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
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        },                        
                        editableCellTemplate: '<div><form><input formatting="true"  numeric decimals="0" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.PURCHASE" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>'
                    },
                    {
                        field: 'COPST_PRICE', displayName: transervice.tran('单位成本'),
                        cellClass:"text-right",
                         cellTemplate:'<div class="ui-grid-cell-contents" >{{row.entity.COPST_PRICE|number:2}}</div>',
                        cellEditableCondition: function() {
                            return $scope.isAuth == false;
                        },                         
                        editableCellTemplate: '<div><form><input formatting="true"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.COPST_PRICE" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>'
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
           	var p = $q.defer();	
            $scope.orgoptions = {
                types: [4],
                getList:function (or) {
                	$scope.model.org = or;
                    p.resolve();
                }
            }
			//初始化转对象
			function toObject (list,code,n) {
				for (var i = 0; i < list.length; i++) {
					if (list[i][code]==n) {
						return list[i];
					}
				}
			};
            $scope.init = function () {
                //页面元素显示初始化
                $scope.STOCK_INITIALISE_CD = model.STOCK_INITIALISE_CD;
                if(model.ORDER_STATE == 2) {
                    $scope.currentState = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = !(model.INIT_STATE*1);
                    $scope.showSave = false;
                    $scope.isAuth = true;
                    $scope.AUTITO_CODE = model.autito_user?model.autito_user.u_staffinfo2.STAFF_NAME_CN:'';
                }else {
                    $scope.currentState = "未审核";
                    $scope.AUTITO_CODE = '';
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                    $scope.isAuth = false;
                }
                
                //初始化仓库、平台、组织列表
                p.promise.then(function () {
                	$scope.ORGANISATION_CODE = toObject($scope.model.org,'ORGANISATION_ID',model.ORGANISATION_ID);
                	$scope.model.channelList = $scope.ORGANISATION_CODE.b_channel;
                	$scope.model.warehouseList = $scope.ORGANISATION_CODE.user_warehouse;
                    $scope.model.CHANNEL = toObject($scope.model.channelList,'CHANNEL_ID',model.CHANNEL_ID);
                    $scope.model.ATWAREHOUSE = toObject($scope.model.warehouseList,'WAREHOUSE_ID',model.WAREHOUSE_ID);                	                	
                }); 
                
                $scope.CREATED_AT = $filter("date")(new Date(parseInt(model.CREATED_AT)*1000), "yyyy-MM-dd");
                $scope.CUSER_NAME =  model.u_userinfo?model.u_userinfo.u_staffinfo.STAFF_NAME_CN:'';//制单人
                $scope.ALLOCATION_AT =  model.ALLOCATION_AT;
                $scope.ALLOCATION_REMARKS = model.ALLOCATION_REMARKS;

                //初始化明细
                $scope.gridOptions.totalItems = model.sk_stock_initialise_detail.length;
                $scope.gridOptions.data = model.sk_stock_initialise_detail;
                angular.forEach($scope.gridOptions.data, function (row, index) {
                    row.options = angular.copy($scope.options);
                    row.UNIT_NAME = row.g_product_sku.b_unit?row.g_product_sku.b_unit.UNIT_NAME_CN:'';
                    row.TDRODUCT_DE = row.g_product_sku.PSKU_NAME_CN;
                    row.TDMONEY = (row.COPST_PRICE*1)*(row.PURCHASE*1);
					row.options.search.where.push(["or",["=","g_product_sku.ORGAN_ID_PURCHASE",model.ORGANISATION_ID],["=","g_product_sku.ORGAN_ID_DEMAND",model.ORGANISATION_ID]]);                                   
                });
                gridDefaultOptionsService.refresh($scope.gridOptions,"PSKU_CODE");//刷新方法
                //refreshDetails();
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
                    "where":['and', ["=","sk_stock_initialise.DELETED_STATE", 0]],
                    "joinWith":["o_organisation", "b_channel", "b_warehouse", "u_userinfo", "autito_user", "sk_stock_initialise_detail"],
                    "orderby":{"sk_stock_initialise.ORDER_STATE": "ASC","sk_stock_initialise.UPDATED_AT": "DESC"},
                    "distinct":true
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise", "view?id="+$scope.idList[offset], "POST",dataSearch).then(function (result){
                    model = result.data;
                    $scope.init();
                });
            }

            //新增明细
            $scope.addDetail = function () {
//              if (!checkInfo()) {
//                  return false;
//              }
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
                if(rows.length>=$scope.gridOptions.data.length){
                	return Notification.error(transervice.tran(messageService.error_detail_delAll));
                }
                $confirm({text:transervice.tran('是否确定删除')}).then(function () {
	                    var addArray = [], myArray=[];
	                    rows.forEach((obj)=>{
	                    	!obj.STOCK_INITIALISE_DETAIL_ID?addArray.push(obj):myArray.push({
		                		"STOCK_INITIALISE_DETAIL_ID":obj.STOCK_INITIALISE_DETAIL_ID,
		                		"STOCK_INITIALISE_ID":model.STOCK_INITIALISE_ID,
		                		"STOCK_INITIALISE_CD":model.STOCK_INITIALISE_CD,
			                    "PSKU_CODE": obj.PSKU_CODE,
			                    "PSKU_ID": obj.PSKU_ID,
			                    "PURCHASE": obj.PURCHASE,
			                    "COPST_PRICE": obj.COPST_PRICE	                    
	                    		
	                    	});
	                    })
		                addArray.forEach((obj)=>{
		                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
		                })

                        
                        if(myArray.length > 0){
                            var deleteRowModel = {
                                "batch": myArray
                            };
                            httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialisedetail", "delete", "POST", deleteRowModel).then(
                                function (datas) {
	                                $scope.gridApi.selection.clearSelectedRows();
					                myArray.forEach((obj)=>{
					                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                                    })
                                    return Notification.success(transervice.tran(datas.message));                               
                                }
                            );
                        }
                    //    $scope.init();               	
                })
//              rows.forEach((obj)=>{
//              	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
//              });
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //获取仓库名称
            $scope.getWarehouseName=function (warehouseCode) {
                if(warehouseCode) {
                    var warehouse=$scope.warehouseList.filter(c=>c.WAREHOUSE_CODE==warehouseCode);
                    if(warehouse.length){
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            };
            //更改数量
            $scope.changeTotalmoney = function (row) {
                row.entity.TDMONEY = parseFloat((1*row.entity.PURCHASE) * (1*row.entity.COPST_PRICE));
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
                var data = getInfo(0,4);
                httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise", "update", "POST", data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                });
            };

            //组装数据
            function getInfo(state,authFlag) {
                var s_data = {};
                var ary = [];
//              s_data.ORGANISATION_CODE = $scope.ORGANISATION_CODE.ORGANISATION_CODE;
                s_data.ORGANISATION_ID = $scope.ORGANISATION_CODE.ORGANISATION_ID;
//              s_data.CHANNEL_CODE = $scope.model.CHANNEL.CHANNEL_CODE;
                s_data.CHANNEL_ID = $scope.model.CHANNEL.CHANNEL_ID;
//              s_data.WAREHOUSE_CODE = $scope.model.ATWAREHOUSE.WAREHOUSE_CODE;
                s_data.WAREHOUSE_ID = $scope.model.ATWAREHOUSE.WAREHOUSE_ID;
                
				s_data.STOCK_INITIALISE_ID = model.STOCK_INITIALISE_ID;
				s_data.STOCK_INITIALISE_CD = model.STOCK_INITIALISE_CD;
				s_data.CREATED_AT = model.CREATED_AT;
				s_data.UPDATED_AT = Math.round(new Date().getTime() / 1000);
				s_data.INIT_STATE = model.INIT_STATE;
				s_data.DELETED_STATE = model.DELETED_STATE;
				s_data.IMPORT_STATE = model.IMPORT_STATE;
				s_data.ORDER_STATE = state?state:$scope.state?$scope.state:model.ORDER_STATE;
				s_data.edit_type = authFlag;
//				s_data.UUSER_CODE = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_CODE;
				s_data.UUSER_ID = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_ID;
//				s_data.CUSER_CODE = model.CUSER_CODE;
				s_data.CUSER_ID = model.CUSER_ID;
				s_data.AUTITO_ID = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_ID;
//				s_data.AUTITO_CODE = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_CODE;
				s_data.AUTITO_AT = Math.round(new Date().getTime() / 1000);
                
                $scope.gridOptions.data.forEach(function (obj) {
                	ary.push({
                		"STOCK_INITIALISE_DETAIL_ID":obj.STOCK_INITIALISE_DETAIL_ID,
	                    "PSKU_CODE": obj.PSKU_CODE,
	                    "PSKU_ID": obj.PSKU_ID,
	                    "PURCHASE": obj.PURCHASE,
	                    "COPST_PRICE": obj.COPST_PRICE	                    
                	});
                });
                s_data.sk_stock_initialise_detail = ary;
                return s_data;
            }

            //审核
            $scope.authSkfiallocation = function(){
                checkAuth(2,1);
            };

            //反审核
            $scope.resetAuthSkfiallocation = function(){
                checkAuth(1, 2);
            };

            //校验确认审核
            function checkAuth(state, authFlag){
                if(!checkInfo()||!checkDetailInfo()){
                    return false;
                }
				var msg = authFlag == 1 ? messageService.confirm_audit : messageService.confirm_audit_f;
				$confirm({
					text: transervice.tran(msg)
				}).then(function() {
					updateSkState(state, authFlag);
				});
          }

            //更新出库单状态
            function updateSkState(state, authFlag) {
                var data = getInfo(state,authFlag);
                $scope.currentuser = configService.getUserInfo();//当前登陆者
                httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise","update", "POST", data).then(function (datas) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.state = state;
                    if(authFlag == 1) {
                        $scope.currentState = "已审核";
                        $scope.showAuth = false;
                        $scope.showResetAuth = true;
                        $scope.showSave = false;
                        $scope.isAuth = true;
                        $scope.AUTITO_CODE = $scope.currentuser.u_staffinfo2.STAFF_NAME_CN;
                    }else {
                        $scope.currentState = "未审核";
                        $scope.AUTITO_CODE = '';
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