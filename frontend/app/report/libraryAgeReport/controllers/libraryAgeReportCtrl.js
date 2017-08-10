/**
 * Created by Administrator on 2017/5/18.
 */
define([
	'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
	'css!bowerLibs/select2/css/select2',
	'css!bowerLibs/select2/css/select2-bootstrap.css',
	'ngload!ui-notification',
	'ngload!ui.bootstrap',
	'angular-confirm',
	'app/common/Services/commonService',
	'app/common/Services/configService',
	'app/common/directives/singleSelectDirt',
	'app/common/Services/gridDefaultOptionsService',
	'app/common/directives/select2-directive'

], function () {
	return ['$scope', '$confirm', 'Notification', 'commonService', 'configService', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService',
		function ($scope, $confirm, Notification, commonService, configService, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService) {
			$scope.gridOptions = {
				columnDefs: [{
					field: 'ORGANISATION_NAME_CN',
					displayName: transervice.tran('组织'),
					enableCellEdit: false
				},
				{
					field: 'CSKU_CODE',
					displayName: transervice.tran('通用SKU'),
					enableCellEdit: false
				},
				{
					field: 'SYSTEM_NAME_CN',
					displayName: transervice.tran('小分类'),
					enableCellEdit: false
				},
				{
					field: 'PSKU_CODE',
					displayName: transervice.tran('SKU'),
					enableCellEdit: false
				},
				{
					field: '90',
					displayName: transervice.tran('0-90天'),
					enableCellEdit: false,
					cellClass: 'text-right'
				},
				{
					field: '180',
					displayName: transervice.tran('91-180天'),
					enableCellEdit: false,
					cellClass: 'text-right'
				},
				{
					field: '270',
					displayName: transervice.tran('181-270天'),
					enableCellEdit: false,
					cellClass: 'text-right'
				},
				{
					field: '365',
					displayName: transervice.tran('271-365天'),
					enableCellEdit: false,
					cellClass: 'text-right'
				},
				{
					field: '730',
					displayName: transervice.tran('366-730天'),
					enableCellEdit: false,
					cellClass: 'text-right'
				},
				{
					field: '999999',
					displayName: transervice.tran('731天以上'),
					enableCellEdit: false,
					cellClass: 'text-right'
				}

				],
				//---------------api---------------------
				onRegisterApi: function (gridApi) {
					$scope.gridApi = gridApi;
					//分页按钮事件
					gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
						if (getPage) {
							getPage(newPage, pageSize);
						}
					});
					//行选中事件
					//					$scope.gridApi.selection.on.rowSelectionChanged($scope, function(row, event) {
					//						if(row) {
					//
					//						}
					//					});
				}
			};
			gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
			//初始化搜索条件
			var searchInit = {
				organizationList: '',
				platFormList: '',
				minorClassificationList: ''
			};
			$scope.search = {
				organization: '',
				sku: '',
				minorClassification: '',
				platForm: '',
				times: getYTT(0)
			}
			//获取组织 平台
			$scope.organizationList = { data: [] };
			$scope.platFormList = { data: [] };
			//获取小分类  SKU
			$scope.minorClassificationList = { data: [] };
			$scope.skuList = { data: [] };
			//当前登录用户
			$scope.userInfo = configService.getUserInfo();

			$scope.orgList = $scope.userInfo.u_user_organization ? $scope.userInfo.u_user_organization : [];
			$scope.isAdmin = false;
			$scope.userInfo.u_role_user.filter(e => e.ROLE_INFO_ID).forEach(obj => {
				if (obj.u_roleInfo.ROLE_TYPE_ID == 3) {
					$scope.isAdmin = true;
					return
				}
			});
			function getOrgList() {
				//库存组织&用户分配的组织
				return configService.getOrganisationList([4]).then(function (datas) {
					$scope.orgList = [];
					if (!$scope.isAdmin) {
						datas && datas.forEach(d => {
							if ($scope.userInfo.u_user_organization.length > 0) {
								var data = $scope.userInfo.u_user_organization.filter(v => v.ORGANISATION_ID == d.ORGANISATION_ID);
								if (data.length > 0) {
									$scope.orgList.push(data[0].o_organisation);
								}
							}
						});

					} else {
						$scope.orgList = datas;
					}
				});
			};
			
			getOrgList().then(function () {
				$scope.orgList.length && $scope.orgList.forEach(v => {
					if (v) {
						searchInit.organizationList += v.ORGANISATION_ID + ',';
						$scope.organizationList.data.push({
							id: v.ORGANISATION_ID,
							text: v.ORGANISATION_NAME_CN
						});

						v.b_channel.length && v.b_channel.forEach(c => {
							searchInit.platFormList += c.CHANNEL_ID + ',';
							$scope.platFormList.data.push({
								"id": c.CHANNEL_ID,
								"text": c.CHANNEL_NAME_CN,
								"ORGANISATION_ID": c.ORGANISATION_ID
							});
						});
					}
				});

				//用户小分类
				var productTypeList = $scope.userInfo.u_user_category ? $scope.userInfo.u_user_category : [];
				productTypeList && productTypeList.forEach(v => {
					if (v.p_category != null) {
						if (v.p_category.g_product_types_1.length > 0) {
							if (v.p_category.g_product_types_1.length > 0) {
								v.p_category.g_product_types_1.forEach(s => {
									searchInit.minorClassificationList += s.PRODUCT_TYPE_ID + ',';
									$scope.minorClassificationList.data.push({
										"id": s.PRODUCT_TYPE_ID,
										"text": s.SYSTEM_NAME_CN,
										"HIERARCHICAL_PATH": s.HIERARCHICAL_PATH
									});
									s.product && s.product.forEach(p => {
										$scope.skuList.data.push({
											"id": p.PSKU_ID,
											"text": p.PSKU_CODE,
											"PRODUCT_TYPE_ID": p.PRODUCT_TYPE_ID
										})
									})

								})
							}
						}
					}
				});
			});
			function trimStr(str) {
				return typeof str == "string" ? str.substring(0, str.length - 1) : str;
			}
			$scope.init = function (currentPage, pageSize) {
				var sT = $scope.search.times;
				var pageTotals = pageSize || 15;
				var selectWhere = {
					"page": currentPage || 1,
					"limit": pageTotals,
					"timeTo": sT ? sT : '',
					"organization":$scope.search.organization,
					"sku": $scope.search.sku,
					"smallType":$scope.search.minorClassification,
					"channel":$scope.search.platForm,
					"ageArea": []
				};
				httpService.httpHelper(httpService.webApi.api, "finance/libraryrecord", "getlibage", "POST", selectWhere).then(
					function (result) {
						var data = result.data;
						if ($scope.gridOptions.totalItems || result._meta.totalCount * 1) {
							$scope.gridOptions.totalItems = result._meta.totalCount;
						}
						$scope.gridOptions.data = data;
						//						if (!data.length) {
						//							return Notification.error(transervice.tran('暂无数据!'))
						//						}
					})

			};
			//$scope.init();
			//搜索
			$scope.searching = function () {
				$scope.gridOptions.paginationCurrentPage = 1;
				this.init();
			}
			//页码改变时触发方法
			function getPage(currentPage, pageSize) {
				$scope.init(currentPage, pageSize);
			}
			//导出
			function exp() {
				var html_txt = [
					'<form id="form" style="display:none" target="" method="post" action="' + httpService.webApi.api + '/finance/libraryrecord/excellibage">',
					'<input type="hidden" name="timeTo" value=' + $scope.search.times + '>',
					'<input type="hidden" name="organization" value=' + ($scope.search.organization) + '>',
					'<input type="hidden" name="sku" value=' + $scope.search.sku + '>',
					'<input type="hidden" name="smallType" value=' + ($scope.search.minorClassification) + '>',
					'<input type="hidden" name="channel" value=' + ($scope.search.platForm) + '>',
					'<input type="hidden" name="ageArea" value=' + [] + '>',
					'</form>'
				].join('');
				$('body').append($(html_txt));
				$("#form").submit();
				$("#form").remove();
			}
			$scope.export = exp;
			//获取距离今天天数年月日
			function getYTT(AddDayCount) {
				var dd = new Date();
				dd.setDate(dd.getDate() + AddDayCount);
				var y = dd.getFullYear();
				var m = dd.getMonth() + 1;
				var d = dd.getDate();
				return y + "-" + m + "-" + d;
			}

			//展开更多条件
			$scope.showMore = function (n) {
				var $this = $('.carett');
				if (n) {
					if (!$this.hasClass('cur')) {
						$this.addClass('cur');
					} else {
						$this.removeClass('cur');
					}
				} else {
					$this.removeClass('cur');
				}

			}
		}
	]
});