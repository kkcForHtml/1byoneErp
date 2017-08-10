/**
 * Created by Administrator on 2017/6/12.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/configService'
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp', 'configService', 'transervice', 'uiGridConstants', '$q', '$interval', 'gridDefaultOptionsService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp, configService, transervice, uiGridConstants, $q, $interval, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PLAN_AT',
                        enableCellEdit: false,
                        displayName: transervice.tran('计划发运日期'),
                        width: 120
                    },
                    {
                        field: 'PLANDATE',
                        enableCellEdit: false,
                        width: 100,
                        displayName: transervice.tran('计划天数'),

                    },
                    {
                        field: 'ACTUAL_SHIPM_AT',
                        width: 120,
                        enableCellEdit: false,
                        displayName: transervice.tran('实际发运日期')
                    },
                    {
                        field: 'TRANSPORTDATE',
                        width: 100,
                        enableCellEdit: false,
                        displayName: transervice.tran('运输天数')
                    },
                    {
                        field: 'EXPECTED_SERVICE_AT',
                        enableCellEdit: false,
                        width: 120,
                        displayName: transervice.tran('预计送达日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"

                    },
                    {
                        field: 'ACTUALS_ERVICE_AT',
                        width: 120,
                        displayName: transervice.tran('实际送达日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'"

                    },
                    {field: 'LOGISTICSDATE', width: 120, displayName: transervice.tran('物流总天数')},
                    {field: 'CHANNEL_NAME_CN', width: 100, displayName: transervice.tran('平台')},
                    {field: 'ORGANISATION_NAME_CN', width: 100, displayName: transervice.tran('组织')},
                    {field: 'ACCOUNT', width: 100, displayName: '账号', enableCellEdit: false},
                    {
                        field: 'TRANSPORT_MODE', width: 100, displayName: '运输方式', enableCellEdit: false,
                    },
                    /*{field: 'TRANSPORT_MODE',width: 100, displayName: '运输方式', enableCellEdit: false,
                     cellClass: 'text-center',
                     cellTemplate: '<span>{{grid.appScope.getTransportModeName(row.entity.ORDER_STATE)}}</span>'},*/
                    {field: 'WAREHOUSETO', width: 100, displayName: '目的仓', enableCellEdit: false},
                    {field: 'CNUMBER', width: 100, displayName: '空海次数', enableCellEdit: false},
                    {field: 'AMAZON_SIZE_NAME', width: 100, displayName: '亚马逊尺寸', enableCellEdit: false},
                    {field: 'SYSTEM_NAME_CN', width: 100, displayName: '产品分类', enableCellEdit: false},
                    {field: 'PU_ORDER_CD', width: 100, displayName: '采购单号', enableCellEdit: false},
                    {field: 'PSKU_CODE', width: 100, displayName: 'SKU', enableCellEdit: false},
                    {field: 'GOODS_DESCRIBE', width: 100, displayName: '货描', enableCellEdit: false},
                    {field: 'SHIPMENT_NUMBER', width: 100, displayName: '出运数量', enableCellEdit: false},
                    {field: 'GNUMBER', width: 100, displayName: '箱数', enableCellEdit: false},
                    {field: 'INSPECTION_NAME', width: 100, displayName: '验货状态', enableCellEdit: false},
                    {
                        field: 'COMMI_PERIOD',
                        width: 100,
                        displayName: '交货日期',
                        cellFilter: "date:'yyyy-MM-dd'",
                        enableCellEdit: false
                    },
                    {field: 'WAREHOUSEFROM', width: 100, displayName: '发货仓库', enableCellEdit: false},
                    {field: 'SHIPMENT_NAME', width: 100, displayName: '发运状态', enableCellEdit: false},
                    {field: 'OLDFNSKU', width: 100, displayName: '原条码', enableCellEdit: false},
                    {field: 'NEWFNSKU', width: 100, displayName: '最终条码', enableCellEdit: false},
                    {field: 'DETAIL_REMARKS', width: 100, displayName: '备注', enableCellEdit: false}

                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                /*  paginationPageSizes: [3, 5, 8], //每页显示个数可选项
                 paginationCurrentPage: 1, //当前页码
                 paginationPageSize: 3, //每页显示个数*/

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
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            $scope.isAdmin = false;
            var data = $scope.userInfo.u_role_user.filter(e=>e.ROLE_INFO_ID);
            if(data.filter(d=>{return d.u_roleInfo.ROLE_TYPE_ID==3})&&data.filter(d=>{return d.u_roleInfo.ROLE_TYPE_ID==3}).length>0){
                $scope.isAdmin = true;
            };
            //获取库存组织&用户分配的组织
            function getOrgList() {
                //库存组织&用户分配的组织
                return configService.getOrganisationList([4]).then(function (datas) {
                    $scope.orgList = [];
                    $scope.orgList.push({
                        "ORGANISATION_ID": "",
                        "ORGANISATION_NAME_CN":  "请选择"
                    });
                    if(!$scope.isAdmin){
                        datas&&datas.forEach(d=> {
                            if($scope.userInfo.u_user_organization.length>0){
                                var data = $scope.userInfo.u_user_organization.filter(v=>v.ORGANISATION_ID==d.ORGANISATION_ID);
                                if(data.length>0){
                                    $scope.orgList.push(data[0].o_organisation);
                                }
                            }
                        });
                    }else{
                        $scope.orgList = $scope.orgList.concat(datas);
                    }

                });
            };
            getOrgList().then(function(){
                $scope.countryList = $scope.orgList;
                var productTypeList = $scope.userInfo.u_user_category ? $scope.userInfo.u_user_category : null;
                $scope.productTypeList = [{"PRODUCT_TYPE_ID": "",
                    "SYSTEM_NAME_CN": "请选择"}];
                //用户sku
                $scope.productCodeList = [{"PSKU_ID": "",
                    "PSKU_CODE": "请选择","PRODUCT_TYPE_ID":""}];
                if(productTypeList.length>0) {
                    productTypeList.forEach(v=> {
                        if (v.p_category != null) {
                            if (v.p_category.g_product_types_1.length > 0) {
                                if (v.p_category.g_product_types_1.length > 0) {
                                    v.p_category.g_product_types_1.forEach(s=> {
                                        $scope.productTypeList.push({
                                            "PRODUCT_TYPE_ID": s.PRODUCT_TYPE_ID,
                                            "SYSTEM_NAME_CN": s.SYSTEM_NAME_CN
                                        })
                                        s.product && s.product.forEach(p=> {
                                            $scope.productCodeList.push({
                                                "PSKU_ID": p.PSKU_ID,
                                                "PSKU_CODE": p.PSKU_CODE,
                                                "PRODUCT_TYPE_ID": p.PRODUCT_TYPE_ID
                                            })
                                        })
                                    })
                                }
                            }
                        }
                    })
                }
                $scope.productList = angular.copy($scope.productCodeList);
                $scope.searchOrganization = "";
                $scope.searchShipType = "";
                $scope.searchSmallType = "";
                $scope.searchSKU = "";
                $scope.init();
            });
            $scope.transportStyleList = [];
            $scope.transportStyleList.push({
                "D_VALUE": "",
                "D_NAME_CN": "请选择"
            });
            var data = commonService.getDicList("TRANSPORTS");
            $scope.transportStyleList = $scope.transportStyleList.concat(data); //运输方式
            $scope.inspectionStateList = commonService.getDicList("INSPECTION_STATE"); //验货状态
            $scope.puTrackStateList = commonService.getDicList("PU_TRACKING"); //发货状态
            $scope.init = function (currentPage, pageSize) {
                var searchWhere = {};
                if($scope.selectWhere ==null){
                    searchWhere = {
                        "isInit":1,
                        "planFrom": "",//计划日期
                        "planTo": "",
                        "searchOrganization": "",//国家
                        "searchShipType": "",//运输方式
                        "searchCNumber": "",//次数
                        "searchActualShipFrom": "",//实际发运日期
                        "searchActualShipTo": "",
                        "searchExpectedServiceFrom": "",//预计送达日期
                        "searchExpectedServiceTo": "",
                        "searchAutualServiceFrom": "",//实际送达日期
                        "searchAutualServiceTo": "",
                        "searchCabinetNo": "",//柜号
                        "searchTrackNo": "",//提单号/追踪号
                        "searchPurchaseCD": "",//采购订单
                        "searchSKU": "",//SKU
                        "searchSmallType": ""//小分类
                    }
                }else{
                    searchWhere = $scope.selectWhere;
                }
                searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchWhere.page = (currentPage ? currentPage : 1);

                httpService.httpHelper(httpService.webApi.api, "shipment/trackingdetail", "indexcustom", "POST", searchWhere).then(
                    function (result) {
                        if (result.data) {
                            $scope.gridOptions.totalItems = result._meta.totalCount;
                            $scope.gridOptions.data = result.data;
                        }
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    });
            };
            //$scope.init();

            $scope.changeType = function(){
                if($scope.searchSmallType.length>0){
                    $scope.searchSKU ="";
                    $scope.productCodeList = [{"PSKU_ID": "",
                        "PSKU_CODE": "请选择","PRODUCT_TYPE_ID":""}].concat($scope.productList.filter(d=>{return d.PRODUCT_TYPE_ID == $scope.searchSmallType}))
                }else{
                    $scope.searchSKU ="";
                    $scope.productCodeList = $scope.productList;
                }
            }

            //导出
            $scope.export = function () {
                var form = $("<form>"); //定义一个form表单
                form.attr("style", "display:none");
                form.attr("target", "");
                form.attr("method", "post");
                var input1 = $("<input>");
                input1.attr("type", "hidden");
                input1.attr("name", "planFrom"); //计划日期
                input1.attr("value", $scope.planFrom);
                form.append(input1);
                var input2 = $("<input>");
                input2.attr("type", "hidden");
                input2.attr("name", "planTo");
                input2.attr("value", $scope.planTo);
                form.append(input2);
                var input3 = $("<input>");
                input3.attr("type", "hidden");
                input3.attr("name", "searchOrganization"); //组织
                input3.attr("value", $scope.searchOrganization);
                form.append(input3);
                var input4 = $("<input>");
                input4.attr("type", "hidden");
                input4.attr("name", "searchShipType");//运输方式
                input4.attr("value", $scope.searchShipType);
                form.append(input4);
                var input5 = $("<input>");
                input5.attr("type", "hidden");
                input5.attr("name", "searchCNumber");//次数
                input5.attr("value", $scope.searchCNumber);
                form.append(input5);
                var input6 = $("<input>");
                input6.attr("type", "hidden");
                input6.attr("name", "searchActualShipFrom");//实际发运日期
                input6.attr("value", $scope.formatDate($scope.searchActualShipFrom));
                form.append(input6);
                var input7 = $("<input>");
                input7.attr("type", "hidden");
                input7.attr("name", "searchActualShipTo");
                input7.attr("value", $scope.formatDate($scope.searchActualShipTo));
                form.append(input7);
                var input8 = $("<input>");
                input8.attr("type", "hidden");
                input8.attr("name", "searchExpectedServiceFrom");//预计送达日期
                input8.attr("value", $scope.formatDate($scope.searchExpectedServiceFrom));
                form.append(input8);
                var input9 = $("<input>");
                input9.attr("type", "hidden");
                input9.attr("name", "searchExpectedServiceTo");
                input9.attr("value", $scope.formatDate($scope.searchExpectedServiceTo));
                form.append(input9);
                var input10 = $("<input>");
                input10.attr("type", "hidden");
                input10.attr("name", "searchAutualServiceFrom");//实际送达日期
                input10.attr("value", $scope.formatDate($scope.searchAutualServiceFrom));
                form.append(input10);
                var input11 = $("<input>");
                input11.attr("type", "hidden");
                input11.attr("name", "searchAutualServiceTo");
                input11.attr("value", $scope.formatDate($scope.searchAutualServiceTo));
                form.append(input11);
                var input12 = $("<input>");
                input12.attr("type", "hidden");
                input12.attr("name", "searchCabinetNo");//柜号
                input12.attr("value", $scope.searchCabinetNo);
                form.append(input12);
                var input13 = $("<input>");
                input13.attr("type", "hidden");
                input13.attr("name", "searchTrackNo");//提单号/追踪号
                input13.attr("value", $scope.searchTrackNo);
                form.append(input13);
                var input14 = $("<input>");
                input14.attr("type", "hidden");
                input14.attr("name", "searchPurchaseCD");//采购订单
                input14.attr("value", $scope.searchPurchaseCD);
                form.append(input14);
                var input15 = $("<input>");
                input15.attr("type", "hidden");
                input15.attr("name", "searchSKU");//SKU
                input15.attr("value", $scope.searchShipType);
                form.append(input15);
                var input16 = $("<input>");
                input16.attr("type", "hidden");
                input16.attr("name", "searchSmallType");//小分类
                input16.attr("value", $scope.searchSmallType);
                form.append(input16);
                form.attr("action", httpService.webApi.api + "/shipment/trackingdetail/exportpi");
                $("body").append(form); //将表单放置在web中
                form.submit(); //表单提交
            };

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
            //清除
            $scope.clearSearch = function () {
                $scope.planFrom = null;
                $scope.planTo = null;
                $scope.searchActualShipTo = null;
                $scope.searchActualShipFrom = null;
                $scope.searchExpectedServiceFrom = null;
                $scope.searchExpectedServiceTo = null;
                $scope.searchAutualServiceFrom = null;
                $scope.searchOrganization = null;
                $scope.searchShipType = null;
                $scope.searchSmallType = null;
                $scope.searchCNumber = null;
                $scope.searchCabinetNo = null;
                $scope.searchTrackNo = null;
                $scope.searchPurchaseCD = null;
                $scope.searchSKU = null;

                //this.showMore(false);
            };
            //模糊搜索
            $scope.search = function () {
                $scope.selectWhere = {};
                var planFrom = $scope.planFrom ? $scope.formatDate(new Date($scope.planFrom.replace(/-/g, "/"))) : "";
                var planTo = $scope.planTo ? $scope.formatDate(new Date($scope.planTo.replace(/-/g, "/"))) : "";
                var searchActualShipFrom = $scope.searchActualShipFrom ? $scope.formatDate(new Date($scope.searchActualShipFrom.replace(/-/g, "/"))) : "";
                var searchActualShipTo = $scope.searchActualShipTo ? $scope.formatDate(new Date($scope.searchActualShipTo.replace(/-/g, "/"))) : "";
                var searchExpectedServiceFrom = $scope.searchExpectedServiceFrom ? $scope.formatDate(new Date($scope.searchExpectedServiceFrom.replace(/-/g, "/"))) : "";
                var searchExpectedServiceTo = $scope.searchExpectedServiceTo ? $scope.formatDate(new Date($scope.searchExpectedServiceTo.replace(/-/g, "/"))) : "";
                var searchAutualServiceFrom = $scope.searchAutualServiceFrom ? $scope.formatDate(new Date($scope.searchAutualServiceFrom.replace(/-/g, "/"))) : "";
                var searchAutualServiceTo = $scope.searchAutualServiceTo ? $scope.formatDate(new Date($scope.searchAutualServiceTo.replace(/-/g, "/"))) : "";
                $scope.selectWhere = {
                    "isInit":2,
                    "planFrom": planFrom,//计划日期
                    "planTo": planTo,
                    "searchOrganization": $scope.searchOrganization,//国家
                    "searchShipType": $scope.searchShipType,//运输方式
                    "searchCNumber": $scope.searchCNumber,//次数
                    "searchActualShipFrom": searchActualShipFrom,//实际发运日期
                    "searchActualShipTo": searchActualShipTo,
                    "searchExpectedServiceFrom": searchExpectedServiceFrom,//预计送达日期
                    "searchExpectedServiceTo": searchExpectedServiceTo,
                    "searchAutualServiceFrom": searchAutualServiceFrom,//实际送达日期
                    "searchAutualServiceTo": searchAutualServiceTo,
                    "searchCabinetNo": $scope.searchCabinetNo,//柜号
                    "searchTrackNo": $scope.searchTrackNo,//提单号/追踪号
                    "searchPurchaseCD": $scope.searchPurchaseCD,//采购订单
                    "searchSKU": $scope.searchSKU,//SKU
                    "searchSmallType": $scope.searchSmallType,//小分类,
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
