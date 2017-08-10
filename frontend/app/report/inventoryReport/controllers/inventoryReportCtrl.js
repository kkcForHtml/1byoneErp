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
    "app/initialization/skInitialization/controllers/skInitializationEditService",
    'app/common/Services/messageService'
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp', 'configService', 'transervice', 'uiGridConstants', '$q', '$interval', 'gridDefaultOptionsService', 'skstorageEditService', 'skplacingEditService', 'adjustmentEditService', 'skfiallocationEditService','skInitializationEditService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp, configService, transervice, uiGridConstants, $q, $interval, gridDefaultOptionsService, skstorageEditService, skplacingEditService, adjustmentEditService, skfiallocationEditService,skInitializationEditService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'ORGANISATION_ID',
                        enableCellEdit: false,
                        displayName: transervice.tran('组织'),
                        width: 200
                    },
                    {
                        field: 'WAREHOUSE_NAME',
                        enableCellEdit: false,
                        width: 180,
                        displayName: transervice.tran('仓库')
                    },
                    {
                        field: 'SMALLPLA_NAME',
                        width: 150,
                        enableCellEdit: false,
                        displayName: transervice.tran('小分类')
                    },
                    {
                        field: 'PSKU_CODE',
                        width: 150,
                        enableCellEdit: false,
                        displayName: transervice.tran('SKU')
                    },
                    {
                        field: 'ORDER_TYPE',
                        enableCellEdit: false,
                        width: 150,
                        displayName: transervice.tran('交易类型'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getTypeName(row.entity.ORDER_TYPE)}}</div>'
                    },
                    {
                        field: 'ORDER_CD',
                        enableCellEdit: false,
                        width: 180,
                        displayName: transervice.tran('交易单号'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ORDER_CD}}</a>'
                    },
                    {
                        field: 'ORDER_AT', width: 150, displayName: '日期', type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",
                        enableCellEdit: false
                    },
                    {
                        field: 'NUMBERS',
                        width: 150,
                        cellClass:'text-right',
                        displayName: transervice.tran('数量')
                    },
                    {field: 'UNIT_ID', width: 150, displayName: transervice.tran('单位')},
                    /*{field: '', width: 100, displayName: transervice.tran('单据状态')},*/
                    {field: 'CHANNEL_NAME', width: 150, displayName: transervice.tran('平台')}
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
            //组织下平台
            $scope.orgBchannelList = new Array();
            //用户组织
            $scope.userOrgList = new Array();
            //用户仓库
            $scope.userWarehouseList = new Array();
            //用户分类
            $scope.productTypeList = [];
            //用户sku
            $scope.productCodeList = [];
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
            var saleTypeList = commonService.getDicList("INVENTORYREPORT");
            $scope.saleTypeList = [];
            if (saleTypeList.length > 0) {
                saleTypeList.forEach(d=> {
                    $scope.saleTypeList.push({
                        "id": d.D_VALUE,
                        "text": d.D_NAME_CN
                    })
                })
            }
            $scope.saleTypeOptions = {
                data: $scope.saleTypeList,
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
                $scope.init()
            });

            $scope.init = function (currentPage, pageSize) {
                var searchWhere = {};
                if ($scope.selectWhere != null) {
                    searchWhere = $scope.selectWhere;
                }else{
                    searchWhere = {"isInit":1};
                }
                searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchWhere.page = (currentPage ? currentPage : 1);
                httpService.httpHelper(httpService.webApi.api, "finance/libraryrecord", "indexcustom", "POST", searchWhere).then(
                    function (result) {
                        result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                        $scope.gridOptions.data = result.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    });
            };

            $scope.edit = function (entity) {
                //入库单
                if (entity.ORDER_TYPE == 1) {
                    var dataSearch = {
                        "where": ["=", "sk_storage.STORAGE_CD", entity.ORDER_CD],
                        "joinWith": ["o_organisation", "b_warehouse", "pa_partner", "u_userinfoc"],
                        "distinct": true,
                        "orderby": "STORAGE_AT desc"
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/storage", "view", "POST", dataSearch).then(function (datas) {
                        if (datas.data) {
                            datas.data.isLink = 2;
                            skstorageEditService.showDialog(datas.data).then(function (data) {
                                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                            });
                        }
                    })
                }
                //出库单
                if (entity.ORDER_TYPE == 2) {
                    var dataSearch = {
                        "where": ["=", "sk_placing.PLACING_CD", entity.ORDER_CD],
                        "joinWith":["o_organisation","b_warehouse","pa_partner","sk_placing_detail","u_userinfo_a","u_userinfoc"],
                        "orderby":"PLAN_STATE asc,PLACING_AT asc,UPDATED_AT desc,CREATED_AT desc",
                        "distinct":true
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/placing", "view", "POST", dataSearch).then(function (datas) {
                        if (datas.data) {
                            datas.data.isLink = 2;
                            datas.data.PLACING_AT = datas.data.PLACING_AT?$filter("date")(new Date(parseInt(datas.data.PLACING_AT) * 1000), "yyyy-MM-dd"):null;
                            skplacingEditService.showDialog(datas.data).then(function (data) {
                                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                            });
                        }
                    })
                }
                //库存调整单
                if (entity.ORDER_TYPE == 3) {
                    var dataSearch = {
                        "where": ["=", "sk_adjustment.ADJUSTMENT_CD", entity.ORDER_CD],
                        "joinWith": ["o_organisation", "b_warehouse","u_user_info"]
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "view", "POST", dataSearch).then(function (datas) {
                        if (datas.data) {
                            datas.data.isLink = 2;
                            adjustmentEditService.showDialog(datas.data).then(function (data) {
                                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                            });
                        }
                    })
                }
                //调拨单
                if (entity.ORDER_TYPE == 4 || entity.ORDER_TYPE == 5) {
                    var dataSearch = {
                        "where": ["=", "sk_fiallocation.FIALLOCATION_CD", entity.ORDER_CD],
                        "joinWith":["sk_fiallocation_detail","u_userinfoc"],
                        "distinct":true
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation", "view", "POST", dataSearch).then(function (datas) {
                        if (datas.data) {
                            datas.data.isLink = true;
                            datas.data.ALLOCATION_AT = $filter("date")(new Date(parseInt(datas.data.ALLOCATION_AT)*1000), "yyyy-MM-dd");
                            skfiallocationEditService.showDialog(datas.data,0,0,true).then(function (data) {
                                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                            });
                        }
                    })
                }
                //库存初始化
                if(entity.ORDER_TYPE == 99){
                    var dataSearch = {
                        "where": ["=", "sk_stock_initialise.STOCK_INITIALISE_CD", entity.ORDER_CD],
                        "joinWith": ["o_organisation", "b_channel", "b_warehouse", "u_userinfo", "autito_user", "sk_stock_initialise_detail"],
                        "distinct":true
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise", "view", "POST", dataSearch).then(function(datas) {
                        skInitializationEditService.showDialog(datas.data, 0, 0,[],true).then(function(data) {
                            $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                        });
                    })
                }
            };

            /*//组织--仓库平台二级联动
            $scope.changOrg = function (organization) {
                var channelData = $scope.orgBchannelList.filter(d=> {
                    return d.ORGANIZE_CODE == organization;
                });
                $scope.userChannelOptions = {
                    data: channelData
                };
                var warehouseData = $scope.userWarehouseList.filter(d=> {
                    return d.ORGANIZE_CODE == organization;
                });
                $scope.userWarehouseOptions = {
                    data: warehouseData
                };
            };
            //仓库-平台二级联动
            $scope.changWarehouse = function (warehouseType) {
                var channel = $scope.userWarehouseList.filter(d=> {
                    return d.id == warehouseType;
                });
                var channelCode = null;
                if (channel.length > 0) {
                    channelCode = channel[0].CHANNEL_ID;
                }
                var channelData = $scope.orgBchannelList.filter(d=> {
                    return d.id == channelCode;
                });
                $scope.userChannelOptions = {
                    data: channelData
                };
            };
            //小分类SKU
            $scope.changSmallType = function (smallType) {
                var proCode = $scope.productCodeList.filter(d=> {
                    return d.PRODUCT_TYPE_ID == smallType;
                });
                $scope.userProductOptions = {
                    data: proCode
                };
            };*/

            $scope.getTypeName = function (value) {
                var data = $scope.saleTypeList.filter(d=> {
                    return d.id == value;
                })
                if (data.length > 0) {
                    return data[0].text
                }
                return "";
            }
            //导出
            $scope.export = function () {
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
                var timeFrom = $scope.timeFrom ? $scope.formatDate(new Date($scope.timeFrom.replace(/-/g, "/"))) : "";
                var timeTo = $scope.timeTo ? $scope.formatDate(new Date($scope.timeTo.replace(/-/g, "/"))) : "";
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
                form.attr("action", httpService.webApi.api + "/finance/libraryrecord/exportpi");
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
                    } else {
                        $this.removeClass('cur');
                    }
                } else {
                    $this.removeClass('cur');
                }

            };

            //模糊搜索
            $scope.search = function () {
                $scope.selectWhere = {};
                var timeFrom = $scope.timeFrom ? $scope.formatDate(new Date($scope.timeFrom.replace(/-/g, "/"))) : "";
                var timeTo = $scope.timeTo ? $scope.formatDate(new Date($scope.timeTo.replace(/-/g, "/"))) : "";
                $scope.selectWhere = {
                    "isInit":2,
                    "timeFrom": timeFrom,
                    "timeTo": timeTo,
                    "organization": $scope.organization,
                    "smallType": $scope.smallType,
                    "sku": $scope.sku,
                    "warehouseType": $scope.warehouseType,
                    "channel": $scope.channel,
                    "orderType": $scope.orderType
                };
                $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                //$scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
            }

            //数组去重
            function removeExit(arr) {
                var result = [];
                var orgCode = null;
                for (var i = 0; i < arr.length; i++) {
                    var obj = arr[i].o_organisation.ba_areas.AREA_CODE;
                    if (i == 0) {
                        orgCode = obj;
                        result.push(arr[i]);
                    }
                    if (i != 0 && orgCode != obj) {
                        result.push(arr[i]);
                        orgCode = arr[i].o_organisation.ba_areas.AREA_CODE;
                    }
                }
                return result;
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
