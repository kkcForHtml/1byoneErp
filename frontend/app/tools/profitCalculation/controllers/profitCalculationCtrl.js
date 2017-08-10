define([
	'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
	'ngload!ui-notification',
	'ngload!ui.bootstrap',
	'angular-confirm',
	'app/common/Services/gridDefaultOptionsService',
	'app/common/Services/commonService',
	"app/common/Services/TranService",
	'app/common/Services/configService',
	'app/common/directives/singleSelectDirt',
	'app/common/Services/messageService',
	'app/common/directives/dialogPopupDirt',
	'ngFileUpload',
	'app/tools/profitCalculation/controllers/profitCalculationAddService',
	'app/tools/profitCalculation/controllers/profitCalculationEditService'
	
], function() {
	"use strict";
	return ['$scope', '$confirm', 'Notification', 'profitCalculationAddService','profitCalculationEditService', 'Upload', 'commonService', 'configService', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService', 'messageService', '$q',
		function($scope, $confirm, Notification, profitCalculationAddService,profitCalculationEditService, Upload, commonService, configService, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService, messageService, $q) {
			$scope.gridOptions = {
				columnDefs: [{
						field: 'edit',
						displayName: transervice.tran('操作'),
						enableCellEdit: false,
						cellClass: 'text-center',
						width: 70,
						cellTemplate: '<button style="vertical-align: middle;" type="button" class="btn btn-sm btn-link" ng-click="grid.appScope.openDetail(row.entity)"><i class="fa fa-fw fa-pencil"></i></button><span style="display:inline-block;vertical-align: middle;width:0;height:100%;padding:0px"></span>'
					},
					{
						field: 'MAIN_IMAGE_URL',
						displayName: transervice.tran('图片'),
						width: 170,
						cellTemplate: '<div style="height:100%; padding:5px"><div style="border:1px solid #ccc;height:100%"><img src={{row.entity.MAIN_IMAGE_URL}} style="width:157px; height:97px"></div></div>',
						enableCellEdit: false
					},
					{
						field: 'STOCK_INITIALISE_CD',
						displayName: transervice.tran('基本资料'),
						width: 230,
						cellTemplate: `<div class='pt-base-information'>
                                        <p><strong>{{'平台'|translate}}:</strong>{{row.entity.b_channel.CHANNEL_NAME_CN}}</p>
                                        <p><strong>{{'SKU'|translate}}:</strong>{{row.entity.g_product_sku.PSKU_CODE}}</p>
                                        <p title={{row.entity.CHANNEL_REMARKS}}><strong>{{'描述'|translate}}:</strong>{{row.entity.CHANNEL_REMARKS}}</p>
                                        <p><strong>{{'ASIN'|translate}}:</strong>{{row.entity.ASIN}}</p>                                                                                                                        
                                    </div>`,
						enableCellEdit: false
					},
					{
						field: 'SALE_PRICE',
						displayName: transervice.tran('售价'),
						width: 180,
						cellTemplate: `<div><div class="pt-price pt-border"><strong>{{'售价'|translate}}:</strong>{{row.entity.SALE_PRICE}}</div>
                                    <div class="pt-price"><strong>{{'测试售价'|translate}}:</strong><input type='text' ng-model='fff' /></div></div>`,
						enableCellEdit: true,
						editableCellTemplate: `<div class="pt-price pt-border"><strong>{{'售价'|translate}}:</strong>{{row.entity.SALE_PRICE}}</div>
                                    <div class="pt-price"><strong>{{'测试售价'|translate}}:</strong><input type='text' formatting="true"  numeric decimals="2" max="9999999999"  min="0"  ng-model='row.entity.priceNew' ng-change="grid.appScope.changeTotalmoney(row)" /></div></div>`
					},
					{
						field: 'OCEANFRE_TEST',
						cellTemplate: `<div class="pt-price pt-border">{{row.entity.express_diff}}({{row.entity.express_pre}})</div>
                                    <div ng-if="row.entity.isChange==1" class="pt-price pt-price-new">{{row.entity.express_diff_test}}({{row.entity.express_pre_test}})</div>
                                    <div ng-if="row.entity.isChange!==1"></div>`,

						displayName: transervice.tran('快递'),
						enableCellEdit: false
					},
					{
						field: 'AIREX_TEST',
						displayName: transervice.tran('空运'),
						cellTemplate: `<div class="pt-price pt-border">{{row.entity.air_diff}}({{row.entity.air_pre}})</div>
                                    <div ng-if="row.entity.isChange==1" class="pt-price pt-price-new">{{row.entity.air_diff_test}}({{row.entity.air_pre_test}})</div>
                                    <div ng-if="row.entity.isChange!==1"></div>`,
						enableCellEdit: false
					},
					{
						field: 'AIRSHIP_TEST',
						displayName: transervice.tran('海运'),
						cellTemplate: `<div class="pt-price pt-border">{{row.entity.ship_diff}}({{row.entity.ship_pre}})</div>
                                    <div ng-if="row.entity.isChange==1" class="pt-price pt-price-new">{{row.entity.ship_diff_test}}({{row.entity.ship_pre_test}})</div>
                                    <div ng-if="row.entity.isChange!==1"></div>`,
						enableCellEdit: false
					},
					{
						field: 'DRAGONSHIP_TEST',
						displayName: transervice.tran('龙舟海运'),
						cellTemplate: `<div class="pt-price pt-border">{{row.entity.dship_diff}}({{row.entity.dship_pre}})</div>
                                    <div ng-if="row.entity.isChange==1" class="pt-price pt-price-new">{{row.entity.dship_diff_test}}({{row.entity.dship_pre_test}})</div>
                                    <div ng-if="row.entity.isChange!==1"></div>`,
						enableCellEdit: false,
					},
					{
						field: 'LANDSHIP_TEST',
						displayName: transervice.tran('陆运'),
						cellTemplate: `<div class="pt-price pt-border">{{row.entity.land_diff}}({{row.entity.land_pre}})</div>
                                    <div ng-if="row.entity.isChange==1" class="pt-price pt-price-new">{{row.entity.land_diff_test}}({{row.entity.land_pre_test}})</div>
                                    <div ng-if="row.entity.isChange!==1"></div>`,
						enableCellEdit: false,
					}

				],
				enableSorting: false,
				//, ["<>", "sk_stock_initialise.INIT_STATE", 1]
				//---------------api---------------------
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;
					//分页按钮事件
					gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
						if(newPage) {
							$scope.gridOptions.getPage(newPage, pageSize);
						}
					});
				}
			};

			gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

			$scope.gridOptions.getGridApi = function(gridApi) {
				$scope.gridApi = gridApi;
			};

			//切换页码
			$scope.gridOptions.getPage = function(pageNo, pageSize) {
				$scope.init(pageNo, pageSize);
			};
			$scope.gridOptions.rowHeight = 110;
			var $p = $q.defer()
			$scope.search = {
				isInit: '',
				searchReceipt: '',
				filterwhere: ''
			}
			//初始化

			//初始化目标币种是美元的汇率列表
			var rateUsa = '';
			(function() {
				var dataSearch = [
					[2, 1, parseInt(new Date().getTime() / 1000)]
				]
				httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", dataSearch).then(function(datas) {
					console.log(datas);
					rateUsa = datas.data[0][3]
					$p.resolve();
				})
			})()
			$scope.init = function(currentPage, pageSize) {
				$scope.currentuser = configService.getUserInfo(); //当前登陆者
				if($scope.searchCondition == undefined || $scope.searchCondition == null) {
					$scope.searchCondition = "";
				}
				var dataSearch = {
					"joinWith": ["b_channel", "g_product_sku", "g_product_sku_purchasing_price"],
					"limit": pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
					"distinct": true,
					'andfilterwhere': [
						"and", [
							'or', ["like", "b_channel.CHANNEL_NAME_CN", $scope.search.filterwhere],
							["like", "g_product_sku.PSKU_CODE", $scope.search.filterwhere]
						]
					]
				};
				httpService.httpHelper(httpService.webApi.api, "tools/platformdata", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function(datas) {
					$scope.gridOptions.data = [];
					($scope.gridOptions.totalItems || datas._meta.totalCount * 1) && ($scope.gridOptions.totalItems = datas._meta.totalCount);
					if(datas.data.length) {
						if(!currentPage) {
							$scope.gridOptions.paginationCurrentPage = 1;
						}
						$p.promise.then(function() {
							datas.data.forEach(function(obj) {
								//美化数据
								var ary = [];
								obj.g_product_sku_purchasing_price.forEach(function(ob) {
									ary.push(ob.UNIT_PRICE * 1 * rateUsa);
								})
                                obj.COST = Math.max(...ary).toFixed(2); //成本
                                //运费转美元
								obj.b_channel.EXPRESS_PRICE = obj.b_channel.EXPRESS_PRICE * rateUsa;
								obj.b_channel.AIR_FREIGHT_PRICE = obj.b_channel.AIR_FREIGHT_PRICE * rateUsa;
								obj.b_channel.SEABORNE_PRICE = obj.b_channel.SEABORNE_PRICE * rateUsa;
								obj.b_channel.SHIPPING_PRICE = obj.b_channel.SHIPPING_PRICE * rateUsa;
								obj.b_channel.LAND_CARRIAGE_PRICE = obj.b_channel.LAND_CARRIAGE_PRICE * rateUsa;
                                //单位统一成（kg，cm）
                                obj.OUT_PACKAGE_WEIGHT = obj.OUT_PACKAGE_WEIGHT*column.changeWeightUnit(obj.OUT_PACKAGE_WEIGHT_UNIT);
                                obj.ITEM_HEIGHT = obj.ITEM_HEIGHT*column.changeLengthUnit(obj.ITEM_LENGTH_UNIT);
                                obj.ITEM_LENGTH = obj.ITEM_LENGTH*column.changeLengthUnit(obj.ITEM_LENGTH_UNIT);
                                obj.ITEM_WIDTH = obj.ITEM_WIDTH*column.changeLengthUnit(obj.ITEM_LENGTH_UNIT);
                                obj.OUT_PACKAGE_HEIGHT = obj.OUT_PACKAGE_HEIGHT*column.changeLengthUnit(obj.OUT_PACKAGE_LENGTH_UNIT);
                                obj.OUT_PACKAGE_WIDTH = obj.OUT_PACKAGE_WIDTH*column.changeLengthUnit(obj.OUT_PACKAGE_LENGTH_UNIT);                                                                                                
                                obj.OUT_PACKAGE_LENGTH = obj.OUT_PACKAGE_LENGTH*column.changeLengthUnit(obj.OUT_PACKAGE_LENGTH_UNIT);                                                                                                                                                                                                                               
								//计算利润
								var dif_obj = column.columnDiff(obj, true);
								$.each(dif_obj, function(key, value) {;
									obj[key] = dif_obj[key];
								});
							});
							$scope.gridOptions.data = datas.data;

						})
					}
				});
			};

			//初始化
            $scope.init();
            
			class Column {
                constructor (params){
                    this.params = params;
                }
                //计算利润
                columnDiff (params, flag){
                    var [express_diff, air_diff, ship_diff, dship_diff, land_diff] = [0, 0, 0, 0, 0], [express_pre, air_pre, ship_pre, dship_pre, land_pre] = ['', '', '', '', ''];
                    var price = flag ? params.SALE_PRICE : params.priceNew;
                    //快递
                    express_diff = params.b_channel.EXPRESS_PRICE*1?(price - price * params.b_channel.AMAZON_COMMISSION - params.COST - params.b_channel.EXPRESS_PRICE * this.colunmMax(params) / params.QUANTITY_OF_PACKAGE).toFixed(2):0;
                    express_pre = this.columnPre(express_diff, params.COST);
                    //空运
                    air_diff = params.b_channel.AIR_FREIGHT_PRICE*1?(price - price * params.b_channel.AMAZON_COMMISSION - params.COST - params.b_channel.AIR_FREIGHT_PRICE * this.colunmMax(params) / params.QUANTITY_OF_PACKAGE).toFixed(2):0;
                    air_pre = this.columnPre(air_diff, params.COST);
                    //海运
                    ship_diff = params.b_channel.SEABORNE_PRICE*1?(price - price * params.b_channel.AMAZON_COMMISSION - params.COST - params.b_channel.SEABORNE_PRICE * this.outPackageVol(params) / params.QUANTITY_OF_PACKAGE).toFixed(2):0;
                    ship_pre = this.columnPre(ship_diff, params.COST);
                    //龙舟海运
                    dship_diff = params.b_channel.SHIPPING_PRICE*1?(price - price * params.b_channel.AMAZON_COMMISSION - params.COST - (params.b_channel.SHIPPING_PRICE * this.outPackageVol(params) + params.OUT_PACKAGE_WEIGHT * params.b_channel.FBA_FREIGHT) / params.QUANTITY_OF_PACKAGE).toFixed(2):0;
                    dship_pre = this.columnPre(dship_diff, params.COST);
                    //陆运
                    land_diff = params.b_channel.LAND_CARRIAGE_PRICE*1?(price - price * params.b_channel.AMAZON_COMMISSION - params.COST - params.b_channel.LAND_CARRIAGE_PRICE * this.colunmMax(params) / params.QUANTITY_OF_PACKAGE).toFixed(2):0;
                    land_pre = this.columnPre(land_diff, params.COST);

                    return flag ? {
                        express_diff: express_diff,
                        express_pre: express_pre,
                        air_diff: air_diff,
                        air_pre: air_pre,
                        ship_diff: ship_diff,
                        ship_pre: ship_pre,
                        dship_diff: dship_diff,
                        dship_pre: dship_pre,
                        land_diff: land_diff,
                        land_pre: land_pre
                    } : {
                        express_diff_test: express_diff,
                        express_pre_test: express_pre,
                        air_diff_test: air_diff,
                        air_pre_test: air_pre,
                        ship_diff_test: ship_diff,
                        ship_pre_test: ship_pre,
                        dship_diff_test: dship_diff,
                        dship_pre_test: dship_pre,
                        land_diff_test: land_diff,
                        land_pre_test: land_pre
                    }                        
                }

                //计算百分比
                columnPre(diff, cost) {
                    return (diff*1?(100 * (diff * 1 + cost * 1) / cost - 100).toFixed(2):0) + '%';
                }
                
                //计算体积重和装箱重最大值
                colunmMax(params) {
                    var v_weight = params.ITEM_HEIGHT * params.ITEM_WIDTH * params.ITEM_LENGTH / (params.k_acc || 5000);
                    return v_weight > params.OUT_PACKAGE_WEIGHT ? v_weight : params.OUT_PACKAGE_WEIGHT;
                }

                //计算体积
                outPackageVol(parms) {
                    return parms.OUT_PACKAGE_HEIGHT * parms.OUT_PACKAGE_LENGTH * parms.OUT_PACKAGE_WIDTH / 1000000;
                }
                
                //换算长度单位
                changeLengthUnit(n){
                    var num = 0;
                    switch (n) {
                        case '1':
                            num = 1;
                            break;
                        case '2':
                            num = 30.48;
                            break;
                        case '3':
                            num = 2.54;
                            break;
                        case '4':
                            num = 100;
                            break;
                        case '5':
                            num = 0.1;
                            break;
                    
                        default:
                            num
                            break;
                    }
                    return num;
                    
                }

                //换算重量单位
                changeWeightUnit(n){
                    var num = 0;
                    switch (n) {
                        case '1':
                            num = 0.001
                            break;
                        case '2':
                            num = 1
                            break;
                        case '3':
                            num = 0.4536
                            break;
                        case '4':
                            num = 0.02835
                            break;
                        
                        default:
                            break;
                    }
                    return num; 
                }
                
            }
            var column = new Column();
            
			//搜索
			$scope.searching = function() {
				$scope.gridOptions.paginationCurrentPage = 1;
				$scope.init();
			};

			//新增
			$scope.add = function() {
				profitCalculationAddService.showDialog().then(function(data) {
					$scope.gridOptions.paginationCurrentPage = 1;
					$scope.init();
				});
			};

			//编辑页面
			$scope.openDetail = function(item) {
				profitCalculationEditService.showDialog(item).then(function(data) {
					$scope.gridOptions.paginationCurrentPage = 1;
					$scope.init();
				});
			};

			//删除
			$scope.del = function() {
				var rows = $scope.gridApi.selection.getSelectedRows();
				$confirm({
					text: transervice.tran(messageService.confirm_del)
				}).then(function() {
					var dataSearch = {
						"batchMTC": postArray
					};
					httpService.httpHelper(httpService.webApi.api, "tools/platformdata", "update", "POST", dataSearch).then(function(datas) {
						Notification.success(transervice.tran('操作成功'));
						$scope.init();
					});

				});
			};
			$scope.changeTotalmoney = function(row) {
				if(row.entity.priceNew == '') {
					row.entity.isChange = 0;
					return
				}
				var dif_obj = column.columnDiff(row.entity);
				row.entity.isChange = 1;
				$.each(dif_obj, function(key, value) {
					row.entity[key] = dif_obj[key];
				});

			}

		}
	];
});