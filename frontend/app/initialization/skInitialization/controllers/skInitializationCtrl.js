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
    'app/initialization/skInitialization/controllers/import_service',
    "app/initialization/skInitialization/controllers/skInitializationAddService",
    "app/initialization/skInitialization/controllers/skInitializationSService",
    "app/initialization/skInitialization/controllers/skInitializationEditService"
], function() {
    "use strict";
    return ['$scope', '$confirm', 'Notification', 'Upload', 'import_service', 'skInitializationAddService', 'skInitializationEditService', 'skInitializationSService', 'commonService', 'configService', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService', 'messageService',
        function($scope, $confirm, Notification, Upload, import_service, skInitializationAddService, skInitializationEditService, skInitializationSService, commonService, configService, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService, messageService) {
            $scope.gridOptions = {
                columnDefs: [

                    {
                        field: 'o_organisation.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('组织'),
                        enableCellEdit: false
                    },
                    {
                        field: 'STOCK_INITIALISE_CD',
                        displayName: transervice.tran('初始化单号编号'),
                        cellTemplate: '<div style="overflow:hidden;" class="ui-grid-cell-contents"><a type="button" style="padding:0;" class="btn btn-link" btn-per="{id:48,name:\'编辑\'}" ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.STOCK_INITIALISE_CD}}</a><div>{{row.entity.STOCK_INITIALISE_CD}}</div></div>',
                        enableCellEdit: false
                    },
                    {
                        field: 'b_channel.CHANNEL_NAME_CN',
                        displayName: transervice.tran('平台'),
                        enableCellEdit: false
                    },
                    {
                        field: 'b_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('仓库'),
                        enableCellEdit: false
                    },
                    {
                        field: 'u_userinfo.u_staffinfo.STAFF_NAME_CN',
                        displayName: transervice.tran('制单人'),
                        enableCellEdit: false
                    },
                    {
                        field: 'autito_user.u_staffinfo2.STAFF_NAME_CN',
                        displayName: transervice.tran('审核人'),
                        enableCellEdit: false
                    },
                    {
                        field: 'INIT_STATE',
                        displayName: transervice.tran('初始化状态'),
                        enableCellEdit: false,
                        cellTemplate: '<span ng-if="row.entity.INIT_STATE==1">已初始化</span>' +
                            '<span ng-if="row.entity.INIT_STATE==0">未初始化</span>'

                    },
                    {
                        field: 'ORDER_STATE',
                        displayName: transervice.tran('单据状态'),
                        enableCellEdit: false,
                        cellTemplate: '<span ng-if="row.entity.ORDER_STATE==2">已审核</span>' +
                            '<span ng-if="row.entity.ORDER_STATE==1">未审核</span>'
                    }


                ],
                enableSorting: false,
                //, ["<>", "sk_stock_initialise.INIT_STATE", 1]
                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
                        if (newPage) {
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
            $scope.search = {
                isInit: '',
                searchReceipt: '',
                filterwhere: ''
            }    
                //初始化
            $scope.init = function(currentPage, pageSize) {
                $scope.currentuser = configService.getUserInfo(); //当前登陆者
                if ($scope.searchCondition == undefined || $scope.searchCondition == null) {
                    $scope.searchCondition = "";
                }
                var dataSearch = {
                    "where": ["and", ["<>", "sk_stock_initialise.DELETED_STATE", 1]],
                    "joinWith": ["o_organisation", "b_channel", "b_warehouse", "u_userinfo", "autito_user", "sk_stock_initialise_detail"],
                    "orderby": { "sk_stock_initialise.ORDER_STATE": "ASC", "sk_stock_initialise.UPDATED_AT": "DESC" },
                    "limit": pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                    "distinct": true,
                    'andfilterwhere': [
                        "and", [
                            'or', ["like", "b_warehouse.WAREHOUSE_NAME_CN", $scope.search.filterwhere],
                            ["like", "o_organisation.ORGANISATION_NAME_CN", $scope.search.filterwhere]
                        ],
                        [
                            'and', ["=", "sk_stock_initialise.ORDER_STATE", $scope.search.searchReceipt],
                            ["=", "sk_stock_initialise.INIT_STATE", $scope.search.isInit]
                        ]
                    ]
                };
                httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function(datas) {
                    $scope.gridOptions.data = [];
                    ($scope.gridOptions.totalItems||datas._meta.totalCount * 1) && ($scope.gridOptions.totalItems = datas._meta.totalCount);
                    if (datas.data.length) {
                        $scope.gridOptions.data = datas.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    }
                });
            };

            //初始化
            $scope.init();

            //搜索
            $scope.searching = function() {
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            };

            //新增
            $scope.add = function() {
                skInitializationAddService.showDialog().then(function(data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.init();
                });
            };

            //编辑页面
            $scope.openDetail = function(item) {
                var _index = $.inArray(item, $scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList = $scope.gridOptions.data.map(obj => obj.STOCK_INITIALISE_ID);
                skInitializationEditService.showDialog(item, _index, $scope.gridOptions.data.length, idList).then(function(data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.init();
                });
            };

            //删除
            $scope.del = function() {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var flag = true;
                angular.forEach(rows, function(obj, index) {
                    if (obj.ORDER_STATE == 2) {
                        flag = false;
                        return;
                    }
                });
                if (!flag) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }
                $confirm({
                    text: transervice.tran(messageService.confirm_del)
                }).then(function() {
                    //					var delArray = [];
                    //					angular.forEach(rows, function(obj, index) {
                    //						var rowObj = {};
                    //						rowObj.FIALLOCATION_ID = obj.FIALLOCATION_ID;
                    //						rowObj.DELETED_STATE = 1;
                    //						rowObj.DETAIL_CODE = 1;
                    //						delArray.push(rowObj);
                    //					});
                    //					var updateRows = {
                    //						"batchMTC": delArray
                    //					};
                    //					httpService.httpHelper(httpService.webApi.api, "inventory/fiallocation", "update", "POST", updateRows).then(function(datas) {
                    //						Notification.success(transervice.tran('删除成功'));
                    //						$scope.init();
                    //					});
                    updateSkfiaState(rows, 0, 3);
                });
            };

            //审核
            $scope.auth = function() {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var s_flag = true;
                angular.forEach(rows, function(obj, index) {
                    if (obj.ORDER_STATE == 2) {
                        s_flag = false;
                        return;
                    }
                });
                if (!s_flag) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }
                //确认审核
                confirmAuth(rows, 2, 1);
            };

            //反审核
            $scope.resetAuth = function() {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var s_flag = true;
                var g_flag = true;
                angular.forEach(rows, function(obj, index) {
                    if (obj.ORDER_STATE == 1) {
                        s_flag = false;
                        return;
                    }
                });
                angular.forEach(rows, function(obj, index) {
                    if (obj.INIT_STATE == 1) {
                        g_flag = false;
                        return;
                    }
                });

                if (!s_flag) {
                    return Notification.error(transervice.tran(messageService.error_audit_n));
                }
                if (!g_flag) {
                    return Notification.error(transervice.tran('包含已初始化数据不能反审核！'));
                }

                //确认反审核
                confirmAuth(rows, 1, 2);
            };

            //确认审核
            function confirmAuth(rows, state, authFlag) {
                var msg = authFlag == 1 ? messageService.confirm_audit_c : messageService.confirm_audit_f;
                $confirm({
                    text: transervice.tran(msg)
                }).then(function() {
                    updateSkfiaState(rows, state, authFlag);
                });
            }

            //更新调拨单状态
            function updateSkfiaState(rows, state, authFlag) {
                var postArray = [];
                angular.forEach(rows, function(obj, index) {
                    var rowArray = {};
                    rowArray.sk_stock_initialise_detail = [];
                    rowArray.STOCK_INITIALISE_ID = obj.STOCK_INITIALISE_ID;
                    rowArray.STOCK_INITIALISE_CD = obj.STOCK_INITIALISE_CD;
                    //					rowArray.ORGANISATION_CODE = obj.ORGANISATION_CODE;
                    rowArray.ORGANISATION_ID = obj.ORGANISATION_ID;
                    //					rowArray.CHANNEL_CODE = obj.CHANNEL_CODE;
                    rowArray.CHANNEL_ID = obj.CHANNEL_ID;
                    //					rowArray.WAREHOUSE_CODE = obj.WAREHOUSE_CODE;
                    rowArray.WAREHOUSE_ID = obj.WAREHOUSE_ID;
                    rowArray.CREATED_AT = obj.CREATED_AT;
                    rowArray.UPDATED_AT = Math.round(new Date().getTime() / 1000);
                    rowArray.INIT_STATE = obj.INIT_STATE;
                    rowArray.DELETED_STATE = obj.DELETED_STATE;
                    rowArray.IMPORT_STATE = obj.IMPORT_STATE;
                    rowArray.ORDER_STATE = state ? state : obj.ORDER_STATE;
                    rowArray.edit_type = authFlag;
                    //					rowArray.UUSER_CODE = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_CODE;
                    rowArray.UUSER_ID = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_ID;
                    //					rowArray.CUSER_CODE = obj.CUSER_CODE;
                    rowArray.CUSER_ID = obj.CUSER_ID;
                    rowArray.AUTITO_ID = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_ID;
                    //					rowArray.AUTITO_CODE = $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_CODE;
                    rowArray.AUTITO_AT = Math.round(new Date().getTime() / 1000);
                    obj.sk_stock_initialise_detail.forEach(function(ob) {
                        rowArray.sk_stock_initialise_detail.push({
                            "STOCK_INITIALISE_DETAIL_ID": ob.STOCK_INITIALISE_DETAIL_ID,
                            "STOCK_INITIALISE_ID": ob.STOCK_INITIALISE_ID,
                            "PSKU_ID": ob.PSKU_ID,
                            "PSKU_CODE": ob.PSKU_CODE,
                            "PURCHASE": ob.PURCHASE,
                            "COPST_PRICE": ob.COPST_PRICE,
                            "UPDATED_AT": Math.round(new Date().getTime() / 1000),
                            //							"UUSER_CODE":$scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_CODE,
                            "UUSER_ID": $scope.currentuser == null ? "" : $scope.currentuser.USER_INFO_ID,
                            //							"CUSER_CODE":ob.CUSER_CODE,
                            "CUSER_ID": ob.CUSER_ID
                        })
                    })
                    postArray.push(rowArray);
                });
                var dataSearch = {
                    "batchMTC": postArray
                };
                httpService.httpHelper(httpService.webApi.api, "inventory/stockinitialise", "update", "POST", dataSearch).then(function(datas) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.init();
                });
            }

            class Guide {
                //导出模板
                out() {
                        skInitializationSService.showDialog().then(function(data) {
                            let html_txt = [
                                '<form id="form" style="display:none" target="" method="post" action="' + httpService.webApi.api + '/inventory/stockinitialise/exporttemplate">',
                                '<input type="hidden" name="WAREHOUSE_NAME_CN" value=' + data.WAREHOUSE_NAME_CN + '>',
                                '<input type="hidden" name="CHANNEL_NAME_CN" value=' + data.CHANNEL_NAME_CN + '>',
                                '<input type="hidden" name="ORGANISATION_NAME_CN" value=' + data.ORGANISATION_NAME_CN + '>',
                                '</form>'
                            ].join('');
                            $('body').append($(html_txt));
                            $("#form").submit();
                            $('#form').remove();

                        })
                    }
                    //导入模板
                    in () {
                        //	                import_service.showDialog().then(function (data) {
                        //	                    $scope.gridOptions.paginationCurrentPage = 1;
                        //	                    $scope.init();
                        //	                });					
                        let file = $scope.file;

                        file && Upload.upload({
                            //服务端接收
                            url: httpService.webApi.api + '/inventory/stockinitialise/importdata',
                            //上传的同时带的参数
                            data: { 'fileName': file.name },
                            //上传的文件
                            file: file
                        }).success(function(data, status, headers, config) {
                            //上传成功	                    
                            if (data.status == 200) {
                                Notification.success(transervice.tran(data.message));
                                $scope.gridOptions.paginationCurrentPage = 1;
                                $scope.init();
                                return;
                            }
                            Notification.error(transervice.tran(data.message));
                        }).error(function(data, status, headers, config) {
                            Notification.error(transervice.tran(data.message));
                        });

                    }
            }
            //实例化类
            var guide = new Guide();
            $scope.export = guide.out;
            $scope.import = guide.in;
        }
    ];
});