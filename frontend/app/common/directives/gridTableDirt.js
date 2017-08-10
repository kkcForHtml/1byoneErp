define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('gridTable', function ($q) {
        return {
            restrict: 'A',
            // scope: {
            //     gridOptions: "=",
            // },
            template:
                     '<div ui-grid="gridOptions"   ui-grid-edit ui-grid-pagination ui-grid-selection ui-grid-exporter ui-grid-row-edit ui-grid-resize-columns ui-grid-auto-resize></div>',
            link: function ($scope, element, attrs, ngModel) {
                var gridOptions = {
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
                    enablePagination: true, //是否分页，默认为true
                    enablePaginationControls: true, //使用默认的底部分页
                    paginationPageSizes: [5, 10, 20], //每页显示个数可选项
                    paginationCurrentPage: 1, //当前页码
                    paginationPageSize: 5, //每页显示个数
                    //paginationTemplate:"<div></div>", //自定义底部分页代码
                    useExternalPagination: true,//是否使用分页按钮
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
                    onRegisterApi: function(gridApi) {
                        $scope.gridApi = gridApi;
                        if($scope.gridOptions.getGridApi){
                            $scope.gridOptions.getGridApi(gridApi);
                        }
                        //分页按钮事件
                        gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                            if($scope.gridOptions.getPage) {
                                $scope.gridOptions.getPage(newPage, pageSize);
                            }
                        });
                        //行选中事件
                        $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                            if(row){
                                $scope.testRow = row.entity;
                            }
                        });

                        //编辑行dirty
                        gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                            var promise = $q.defer();
                            $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                            promise.reject();
                        });
                    }
                };

                if($scope.gridOptions){
                    angular.extend(gridOptions,$scope.gridOptions);
                    angular.extend($scope.gridOptions,gridOptions);
                }





            },
        };
    });
})