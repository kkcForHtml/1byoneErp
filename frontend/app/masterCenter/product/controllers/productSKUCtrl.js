define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/masterCenter/product/controllers/productSKU_edit_service',
    'app/masterCenter/product/controllers/productSKU_add_service',
    'app/common/Services/AmNumeric',
    'app/common/Services/gridDefaultOptionsService',


], function () {
    return ['$scope', '$confirm', 'Notification', '$filter', 'httpService', 'transervice', 'uiGridConstants', 'commonService', 'productSKU_edit_service', 'productSKU_add_service', 'gridDefaultOptionsService', '$q',
        function ($scope, $confirm, Notification, $filter, httpService, transervice, uiGridConstants, commonService, productSKU_edit_service, productSKU_add_service, gridDefaultOptionsService, $q) {

            //亚马逊尺寸
            $scope.amazonSizes = commonService.getDicList("PRODUCT_SKU"); //其中"PRODUCT_SKU"是字典表里的分组名

            $scope.gridOptions = {
                columnDefs: [
                    { field: 'g_currency_sku.CSKU_CODE', enableCellEdit: false, displayName: transervice.tran('通用SKU'), width: 120 },
                    { field: 'PSKU_CODE', enableCellEdit: false, displayName: '产品SKU',width: 120, cellTemplate: '<button type="button" class="btn  btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.PSKU_CODE}}</button>' },
                    { field: 'PSKU_NAME_CN', enableCellEdit: false, displayName: '中文名称',width: 170,},
                    { field: 'g_organisation.ORGANISATION_NAME_CN', enableCellEdit: false, displayName: transervice.tran('需求组织') ,width: 150,},
                    { field: 'g_organisationp.ORGANISATION_NAME_CN', enableCellEdit: false, displayName: transervice.tran('默认采购组织'),width: 150, },
                    { field: 'PRODUCT_TYPE_PATH', enableCellEdit: false, displayName: transervice.tran('大分类'),width: 120, cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.bigType?row.entity.bigType.SYSTEM_NAME_CN:""}}</div>' },
                    { field: 'PRODUCT_TYPE_PATH', enableCellEdit: false, displayName: transervice.tran('小分类'),width: 120, cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.smallType?row.entity.smallType.SYSTEM_NAME_CN:""}}</div>' },
                    { field: 'UNIT_ID', enableCellEdit: false, displayName: transervice.tran('单位'),width: 80, cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.b_unit?row.entity.b_unit.UNIT_NAME_CN:""}}</div>' },
                    { field: 'PSKU_MOQ', enableCellEdit: false, displayName: transervice.tran('最小起订量'),width: 100, cellClass: 'text-right' },
                    { field: 'AMAZON_SIZE_Value', enableCellEdit: false, displayName: transervice.tran('亚马逊尺寸'),width: 120, },
                    { field: 'AMAZON_SIZE_ID', enableCellEdit: false, displayName: transervice.tran('装箱长度(CM)'),width: 120, cellClass: 'text-right', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.g_product_sku_packing?row.entity.g_product_sku_packing.PACKING_LONG:""}}</div>' },
                    { field: 'AMAZON_SIZE_ID', enableCellEdit: false, displayName: transervice.tran('装箱宽度(CM)'),width: 120, cellClass: 'text-right', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.g_product_sku_packing?row.entity.g_product_sku_packing.PACKING_WIDE:""}}</div>' },
                    { field: 'AMAZON_SIZE_ID', enableCellEdit: false, displayName: transervice.tran('装箱高度(CM)'),width: 120, cellClass: 'text-right', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.g_product_sku_packing?row.entity.g_product_sku_packing.PACKING_HIGH:""}}</div>' },
                    { field: 'AMAZON_SIZE_ID', enableCellEdit: false, displayName: transervice.tran('装箱体积(M³)'),width: 120, cellClass: 'text-right', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.g_product_sku_packing?row.entity.g_product_sku_packing.volume:""}}</div>' },
                    { field: 'AMAZON_SIZE_ID', enableCellEdit: false, displayName: transervice.tran('每箱数量'),width: 120, cellClass: 'text-right', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.g_product_sku_packing?row.entity.g_product_sku_packing.PACKING_NUMBER:""}}</div>' },

                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            $scope.gridOptions.getPage = function (pageNo, pageSize) {
                $scope.init();
            };

            $scope.gridOptions.getGridApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };
            $scope.name = "";

            $scope.init = function () {


                var searchCoditions = {
                    distinct: 1,
                    orderby: "g_product_sku.UPDATED_AT DESC",
                    limit: $scope.gridOptions.paginationPageSize,
                    goodsType: $scope.name,
                    andFilterWhere: ["or", ["like", "g_product_sku.PSKU_CODE", $scope.name], ["like", "g_product_sku.PSKU_NAME_CN", $scope.name]],
                    joinwith: ["g_product_sku_packing", "g_organisation", "g_organisationp", 'b_unit','g_currency_sku'],
                }

                httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "index?page=" + $scope.gridOptions.paginationCurrentPage, "POST", searchCoditions).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.gridOptions.totalItems = result._meta.totalCount;
                            $scope.gridOptions.data = result.data;
                            result.data.forEach(p => {
                                if (p.g_product_sku_packing && p.g_product_sku_packing.PACKING_WIDE && p.g_product_sku_packing.PACKING_LONG * p.g_product_sku_packing.PACKING_HIGH) {
                                    p.g_product_sku_packing.volume = (p.g_product_sku_packing.PACKING_WIDE * p.g_product_sku_packing.PACKING_LONG * p.g_product_sku_packing.PACKING_HIGH / 1000000).toFixed(6);
                                }
                                var arr = $scope.amazonSizes.filter(a => a.D_VALUE == p.AMAZON_SIZE_ID);
                                if (arr.length) {
                                    p.AMAZON_SIZE_Value = arr[0].D_NAME_CN;
                                }
                            });

                        } else {
                            Notification.error({ message: result.message, delay: 5000 });
                        }
                    }
                );

            };

            $scope.init();




            //新增
            $scope.add = function () {

                productSKU_add_service.showDialog().then(function (data) {
                    $scope.search();
                })



            };


            //编辑方法
            $scope.edit = function (item) {
                productSKU_edit_service.showDialog(item).then(function (data) {
                    $scope.search();
                })
                // var selectWhere = {
                //     "where":["<>","DELETED_STATE",1]
                // };
                // httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST",selectWhere).then(
                //     function (result){
                //         commonSKU_edit_service.showDialog(result.data,item.CSKU_ID).then(function (data) {
                //             $scope.search();
                //         })
                //
                //     });
            };



            //删除数据
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                var def = $q.defer();
                $confirm({ text: transervice.tran('确认要删除所选择的数据吗？') }).then(function () {
                    var copyRows = angular.copy(rows);
                    //copyRows.forEach(r=>r.DELETED_STATE=1);
                    angular.forEach(copyRows, function (obj, indexObj) {
                        delete obj['b_unit'];
                        delete obj['g_next_cycle'];
                        delete obj['g_organisation'];
                        delete obj['g_organisationp'];
                        delete obj['g_product_sku_declare'];
                        delete obj['g_product_sku_price'];
                        delete obj['g_product_sku_supplier'];
                        delete obj['g_product_sku_fnsku'];
                        delete obj['g_product_sku_upc'];
                        delete obj['g_product_sku_declare'];
                        delete obj['g_product_sku_packing'];
                    });
                    var deleteRowModel = {
                        "batch": copyRows
                    };
                    httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "delete", "POST", deleteRowModel, def).then(
                        function () {
                            Notification.success(transervice.tran('删除成功!'));
                            $scope.search();
                        }
                    );
                },function () {
                    def.resolve();
                });
                return def.promise;
            };


            //模糊搜索
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            }

        }]
});
