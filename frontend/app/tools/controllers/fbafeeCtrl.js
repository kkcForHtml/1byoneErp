/**
 * Created by Administrator on 2017/4/25.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm'
], function () {
    return ['$scope', '$confirm', 'Notification', 'httpService', 'amHttp', 'transervice', 'uiGridConstants',
        function ($scope, $confirm, Notification, httpService, amHttp, transervice, uiGridConstants) {
            $scope.isQuery = false;
            /*$scope.gridOptions = {
                columnDefs: [
                    { field: 'country', displayName: transervice.tran('国家'), width: 60, cellClass: 'red' },
                    { field: 'FBA_PackageType', displayName: transervice.tran('FBA Packaging Type') ,cellClass: 'red'},
                    { field: 'fee9', displayName: transervice.tran('January-September'), cellClass: 'red' },
                    { field: 'fee10', displayName: transervice.tran('October-December'), cellClass: 'red' },
                    { field: 'MCF_PackageType', displayName: transervice.tran('MCF Packaging Type'), cellClass: 'red' },
                    { field: 'shipping', displayName: transervice.tran('Standard Shipping'), cellClass: 'red' },
                    { field: 'expedited', displayName: transervice.tran('Expedited'), cellClass: 'red' },
                    { field: 'priority', displayName: transervice.tran('Priority'), cellClass: 'red' },
                    { field: 'minventoryFee9', displayName: transervice.tran('January-September'), cellClass: 'red' },
                    { field: 'minventoryFee10', displayName: transervice.tran('October-December'), cellClass: 'red' },
                    { field: 'longtimeFee6', displayName: transervice.tran('6 to 12 Months'), cellClass: 'red' },
                    { field: 'longtimeFee12', displayName: transervice.tran('12 months or more'), cellClass: 'red' }
                ],
                enableColumnMoving: false,
                showGroupPanel: false,
                saveFocus: false,
                saveScroll: false,
                saveGroupingExpandedStates: false,
                showColumnFooter: false,
                exporterMenuCsv: true,
                enableFiltering: false,
                enableSorting: false, //是否排序
                useExternalSorting: false, //是否使用自定义排序规则
                enableGridMenu: false, //是否显示grid 菜单
                showGridFooter: false, //是否显示grid footer
                enableHorizontalScrollbar: 0, //grid水平滚动条是否显示, 0-不显示  1-显示
                enableVerticalScrollbar: 0, //grid垂直滚动条是否显示, 0-不显示  1-显示

                //-------- 分页属性 ----------------
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                paginationPageSizes: [2, 4, 6], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 6, //每页显示个数
                //paginationTemplate:"<div></div>", //自定义底部分页代码
                totalItems: 6, // 总数量
                useExternalPagination: false,//是否使用分页按钮
                //----------- 选中 ----------------------
                enableFooterTotalSelected: false, // 是否显示选中的总数，默认为true, 如果显示，showGridFooter 必须为true
                enableFullRowSelection: false, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                enableRowHeaderSelection: true, //是否显示选中checkbox框 ,默认为true
                enableRowSelection: true, // 行选择是否可用，默认为true;
                enableSelectAll: true, // 选择所有checkbox是否可用，默认为true;
                enableSelectionBatchEvent: true, //默认true
                // isRowSelectable: function (row) { //GridRow
                //     if (row.entity.age > 45) {
                //         row.grid.api.selection.selectRow(row.entity); // 选中行
                //     }
                // },
                modifierKeysToMultiSelect: false,//默认false,为true时只能 按ctrl或shift键进行多选, multiSelect 必须为true;
                multiSelect: true,// 是否可以选择多个,默认为true;
                noUnselect: false,//默认false,选中后是否可以取消选中
                selectionRowHeaderWidth: 30,//默认30 ，设置选择列的宽度；
                rowHeight: 30,

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
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };*/
            $scope.query = function () {
                var data = {
                    "length": $scope.length,
                    "width": $scope.width,
                    "height": $scope.height,
                    "weight": $scope.weight
                };
                if ($scope.length == null || $scope.width == null || $scope.height == null || $scope.weight == null) {
                    Notification.error(transervice.tran('带*号的为必选项！请填写！'));
                } else {
                    httpService.httpHelper(httpService.webApi.api, "tools/fbafee", "getfee", "POST", data).then(
                        function (result) {
                            if (result != null && result.status == 200) {
                                $scope.isQuery = true;
                                $scope.dataList = result.data;
                               // $scope.gridOptions.data = getSubList(data);
                                Notification.success({ message: result.message, delay: 2000 });
                            } else {
                                Notification.error({ message: result.message, delay: 5000 });
                            }
                        })

                }
            }

        }]
});
