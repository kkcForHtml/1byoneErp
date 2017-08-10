
/**
 * Created by Administrator on 2017/6/12.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'css!bowerLibs/select2/css/select2',
    'css!bowerLibs/select2/css/select2-bootstrap.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/configService',
    'app/common/directives/select2-directive',
    "app/inventoryCenter/common/controllers/purchaseChooseService",
    'app/masterCenter/bchannel/controllers/partner_list_service',
    'app/masterCenter/product/controllers/selectSupplier_service',
    "app/inventoryCenter/skstorage/controllers/skstorageEditService",
    "app/inventoryCenter/skplacing/controllers/skplacingEditService",
    "app/inventoryCenter/adjustment/controllers/adjustmentEditService",
    "app/inventoryCenter/skfiallocation/controllers/skfiallocationEditService",
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp','configService', 'transervice', 'uiGridConstants', '$q', '$interval',  'gridDefaultOptionsService','skstorageEditService','skplacingEditService','adjustmentEditService','skfiallocationEditService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp,configService, transervice, uiGridConstants, $q, $interval,gridDefaultOptionsService,skstorageEditService,skplacingEditService,adjustmentEditService,skfiallocationEditService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PERIOD',
                        enableCellEdit: false,
                        displayName: transervice.tran('期间'),
                        width: 200
                    },
                    {
                        field: 'ORGANISATION_NAME_CN',
                        width: 200,
                        enableCellEdit: false,
                        displayName: transervice.tran('组织')
                    },
                    {
                        field: 'CSKU_CODE',
                        enableCellEdit: false,
                        width: 200,
                        displayName: transervice.tran('通用SKU')
                    },
                    {
                        field: 'PSKU_CODE',
                        width: 200,
                        enableCellEdit: false,
                        displayName: transervice.tran('SKU')
                    },
                    {
                        field: 'INITIAL_QUANTITY',
                        width: 200,
                        cellClass:'text-right',
                        enableCellEdit: false,
                        displayName: transervice.tran('期初结余库存')
                    },
                    {
                        field: 'CWAREHOUSING_QUANTITY',
                        width: 200,
                        cellClass:'text-right',
                        displayName: transervice.tran('本期入库数量')
                    },
                    {field: 'QWAREHOUSING_QUANTITY', width: 200, enableCellEdit: false, cellClass:'text-right',displayName: transervice.tran('本期出库数量')},
                    /*{field: '', width: 100, displayName: transervice.tran('单据状态')},*/
                    { field: 'CBALANCE_NUMBER',width: 200,enableCellEdit: false,cellClass:'text-right', displayName: transervice.tran('期末结余数量') }
                ],
                /*  paginationPageSizes: [3, 5, 8], //每页显示个数可选项
                 paginationCurrentPage: 1, //当前页码
                 paginationPageSize: 3, //每页显示个数*/
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;

                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                }
            };

            //获取年份
            !function (num) {
                var currentYears = new Date().getFullYear(),currentMonth = new Date().getMonth()+1,arr=[];
                $scope.year=currentYears+'';
                $scope.period = currentMonth<10?'0'+currentMonth:currentMonth;
                for (var i=0; i<num; i++) {
                    arr.push(currentYears-i);
                }
                $scope.years = arr;
            }(5);

           /* //获取年份
            !function (num) {
                var currentYears = new Date().getFullYear(), arr = [];
                for (var i = 0; i < num; i++) {
                    arr.push(currentYears - i);
                }
                $scope.years = arr;
            }(3);*/

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //当前登录用户
            $scope.userInfo = configService.getUserInfo();

            $scope.orgList = $scope.userInfo.u_user_organization?$scope.userInfo.u_user_organization:[];
            //组织下平台
            $scope.orgBchannelList = new Array();
            //用户组织
            $scope.userOrgList = new Array();
            //用户仓库
            $scope.userWarehouseList = new Array();
            //用户小分类
            $scope.productTypeList = new Array();
            //用户小分类下的sku
            $scope.productCodeList = new Array();
            $scope.userOrgOptions = {
                data: $scope.userOrgList
            };
            $scope.userChannelOptions = {
                data: $scope.orgBchannelList
            };
            $scope.userWarehouseOptions = {
                data: $scope.userWarehouseList
            };
            $scope.productTypeOptions = {
                data: $scope.productTypeList
            };
            $scope.userProductOptions = {
                data: $scope.productCodeList
            };
            $scope.isAdmin = false;
            var data = $scope.userInfo.u_role_user.filter(e=>e.ROLE_INFO_ID);
			data.forEach(obj => {
				if (obj.u_roleInfo.ROLE_TYPE_ID==3) {
					$scope.isAdmin = true;
					return
				}
			});
            function getOrgList() {
                //库存组织&用户分配的组织
                return configService.getOrganisationList([4]).then(function (datas) {
                    $scope.orgList = [];
                    if(!$scope.isAdmin){
                        datas && datas.forEach(d=> {
                            if ($scope.userInfo.u_user_organization.length > 0) {
                                var data = $scope.userInfo.u_user_organization.filter(v=>v.ORGANISATION_ID == d.ORGANISATION_ID);
                                if (data.length > 0) {
                                    $scope.orgList.push(data[0].o_organisation);
                                }
                            }
                        });
                    }else{
                        $scope.orgList = $scope.orgList.concat(datas);
                    }
                });
            };
            getOrgList().then(function () {
                $scope.orgList.length && $scope.orgList.forEach(v=> {
                        $scope.userOrgList.push({
                            id: v.ORGANISATION_ID,
                            text: v.ORGANISATION_NAME_CN
                        });

                        v.b_channel.length && v.b_channel.forEach(c=> {
                            $scope.orgBchannelList.push({
                                "id": c.CHANNEL_ID,
                                "text": c.CHANNEL_NAME_CN,
                                "ORGANISATION_ID": c.ORGANISATION_ID
                            });
                        });
                        v.user_warehouse.length && v.user_warehouse.forEach(w=> {
                            $scope.userWarehouseList.push({
                                "CHANNEL_ID": w.CHANNEL_ID,
                                "id": w.WAREHOUSE_ID,
                                "text": w.WAREHOUSE_NAME_CN,
                                "ORGANISATION_ID": w.ORGANISATION_ID
                            });
                        })

                });

                //用户小分类
                var productTypeList = $scope.userInfo.u_user_category ? $scope.userInfo.u_user_category : [];
                productTypeList && productTypeList.forEach(v=> {
                    if (v.p_category != null) {
                        if (v.p_category.g_product_types_1.length > 0) {
                            if (v.p_category.g_product_types_1.length > 0) {
                                v.p_category.g_product_types_1.forEach(s=> {
                                    $scope.productTypeList.push({
                                        "id": s.PRODUCT_TYPE_ID,
                                        "text": s.SYSTEM_NAME_CN,
                                        "HIERARCHICAL_PATH": s.HIERARCHICAL_PATH
                                    });
                                    s.product && s.product.forEach(p=> {
                                        $scope.productCodeList.push({
                                            "id": p.PSKU_CODE,
                                            "text": p.PSKU_CODE,
                                            "PRODUCT_TYPE_ID": p.PRODUCT_TYPE_ID
                                        })
                                    })

                                })
                            }
                        }
                    }
                });
                $scope.init()
            });

            $scope.init = function (currentPage, pageSize) {
                var searchWhere = {};
                if($scope.selectWhere!=null){
                    searchWhere = $scope.selectWhere;
                }else{
                    searchWhere.isInit = 1;
                }
                searchWhere.years = $scope.year;
                searchWhere.accountingPeriod = $scope.period;
                searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchWhere.page = (currentPage ? currentPage : 1);
                httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "indexcustom", "POST", searchWhere).then(
                    function (result) {
                        result._meta.totalCount * 1 && ($scope.gridOptions.totalItems = result._meta.totalCount);
                        $scope.gridOptions.data = result.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    });
            };
            //$scope.init();


            //导出
            $scope.export = function() {
                var form = $("<form>"); //定义一个form表单
                form.attr("style", "display:none");
                form.attr("target", "");
                form.attr("method", "post");
                var input1 = $("<input>");
                input1.attr("type", "hidden");
                input1.attr("name", "organization");//组织
                input1.attr("value", $scope.organization);
                form.append(input1);
                var input2 = $("<input>");
                input2.attr("type", "hidden");
                input2.attr("name", "warehouseType");//仓库类型
                input2.attr("value", $scope.warehouseType);
                form.append(input2);
                var input3 = $("<input>");
                input3.attr("type", "hidden");
                input3.attr("name", "smallType"); //小分类
                input3.attr("value", $scope.smallType);
                form.append(input3);
                var input4 = $("<input>");
                input4.attr("type", "hidden");
                input4.attr("name", "sku");//sku
                input4.attr("value", $scope.sku);
                form.append(input4);
                var input5 = $("<input>");
                input5.attr("type", "hidden");
                input5.attr("name", "orderType");//交易类型
                input5.attr("value", $scope.orderType);
                form.append(input5);
                var timeFrom = $scope.timeFrom?$scope.formatDate(new Date($scope.timeFrom.replace(/-/g,"/"))):"";
                var timeTo = $scope.timeTo?$scope.formatDate(new Date($scope.timeTo.replace(/-/g,"/"))):"";
                var input7 = $("<input>");
                input7.attr("type", "hidden");
                input7.attr("name", "timeFrom");//日期
                input7.attr("value", timeFrom);
                form.append(input7);
                var input8 = $("<input>");
                input8.attr("type", "hidden");
                input8.attr("name", "timeTo");//截止日期
                input8.attr("value", timeTo);
                form.append(input8);
                var input9 = $("<input>");
                input9.attr("type", "hidden");
                input9.attr("name", "channel");
                input9.attr("value", $scope.channel);
                form.append(input9);
                var input9 = $("<input>");
                input9.attr("type", "hidden");
                input9.attr("name", "years");
                input9.attr("value", $scope.year);
                form.append(input9);
                var input9 = $("<input>");
                input9.attr("type", "hidden");
                input9.attr("name", "accountingPeriod");
                input9.attr("value", $scope.period);
                form.append(input9);
                form.attr("action", httpService.webApi.api + "/finance/accountingperiod/exportpi");
                $("body").append(form); //将表单放置在web中
                form.submit(); //表单提交
                form.remove();
            };

            //展开更多条件
            $scope.showMore = function (n) {
                var $this = $('.carett');
                if (n) {
                    if (!$this.hasClass('cur')) {
                        $this.addClass('cur');
                    }else{
                        $this.removeClass('cur');
                    }
                }else{
                    $this.removeClass('cur');
                }

            };

            //模糊搜索
            $scope.search = function(){
                $scope.selectWhere = {};
                var timeFrom = $scope.timeFrom?$scope.formatDate(new Date($scope.timeFrom.replace(/-/g,"/"))):"";
                var timeTo = $scope.timeTo?$scope.formatDate(new Date($scope.timeTo.replace(/-/g,"/"))):"";
                $scope.selectWhere = {
                    "isInit":2,
                    "years":$scope.year,
                    "accountingPeriod":$scope.period,
                    "organization":$scope.organization,
                    "smallType":$scope.smallType,
                    "sku":$scope.sku,
                    "warehouse":$scope.warehouse,
                    "channel":$scope.channel
                };
                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                //$scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
            }

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = Math.round((object) / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };
            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }
        }]
});
