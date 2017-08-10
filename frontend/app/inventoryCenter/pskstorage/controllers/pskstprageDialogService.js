define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',
    ],
    function (angularAMD) {
        angularAMD.service(
            'pskstprageDialogService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "pskstprageDialogCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/pskstorage/views/pskstprage_dialog.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("pskstprageDialogCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService) {

            $scope.model = model;
            $scope.rowEntity = {warehouseList:[]};
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'sk_fiallocation_detail.ATSKU_CODE', displayName: transervice.tran('SKU'),enableCellEdit: false},
                    { field: 'sk_fiallocation_detail.ALLOCATION_NUMBER',cellCall:'text-right', displayName: transervice.tran('调拨数量'),enableCellEdit: false},
                    { field: 'o_organisation.ORGANISATION_NAME_CN', displayName: transervice.tran('组织'),enableCellEdit: false},
                    { field: 'sk_fiallocation.FIALLOCATION_CD', displayName: transervice.tran('调拨单号'),enableCellEdit: false},
                    { field: 'sk_fiallocation.ALLOCATION_AT', displayName: transervice.tran('调拨日期'),enableCellEdit: false},
                    { field: 'e_warehouse.WAREHOUSE_NAME_CN', displayName: transervice.tran('调出仓库'),enableCellEdit: false},
                    { field: 'a_warehouse.WAREHOUSE_NAME_CN', displayName: transervice.tran('调入仓库'),enableCellEdit: false}
                ],
                enablePagination: false,         //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false     //是否使用分页按钮

            };

            //翻页触发方法
            $scope.gridOptions.getPage=function (pageNo,pageSize) {

            }

            //获取api
            $scope.gridOptions.getGridApi=function (api) {
                $scope.gridApi=api;
            };

            var selectData = new Array();
                //勾选某一行
            $scope.gridOptions.selectRow=function (row) {
                var arr_data = new  Array();
                if(!selectData[row.entity.STORAGE_RELATION_ID]){
                    arr_data['STORAGE_RELATION_ID']  = row.STORAGE_RELATION_ID;
                    arr_data['sk_fiallocation_detail'] = row.sk_fiallocation_detail;
                    arr_data['sk_fiallocation'] = row.sk_fiallocation;
                    selectData[row.entity.STORAGE_RELATION_ID] = arr_data;
                }
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //初始化
            function init() {

                $scope.gridOptions.data = [];

                var dataSearch = {
                    "where": {"sk_pending_stroage_relation.PENDING_STORAGE_ID":$scope.model.PENDING_STORAGE_ID},
                    "joinWith": ["sk_fiallocation", "sk_fiallocation_detail","sk_pending_storage","a_warehouse as a","e_warehouse as e",'o_organisation'],
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/pendingstra", "index", "POST", dataSearch).then(function (datas) {
                        angular.forEach(datas.data, function (obj, index) {
                            obj.sk_fiallocation.ALLOCATION_AT = $filter("date")(new Date(parseInt(obj.sk_fiallocation.ALLOCATION_AT) * 1000), "yyyy-MM-dd");
                        });

                        $scope.gridOptions.data = datas.data;
                });
            };

            //基本信息和金额信息初始化
            init();

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //点击确定
            $scope.ensure = function(){
                var selectData = new Array();

                var rows = $scope.gridApi.selection.getSelectedRows();

                angular.forEach(rows,function(obj,index){
                    var arr_data = new Object();
                    arr_data.STORAGE_RELATION_ID  = obj.STORAGE_RELATION_ID;
                    arr_data.PENDING_STORAGE_ID  = obj.PENDING_STORAGE_ID;
                    arr_data.sk_fiallocation_detail = obj.sk_fiallocation_detail;
                    arr_data.sk_fiallocation = obj.sk_fiallocation;
                    selectData.push(arr_data);
                });

                if(typeof(selectData) == "undefined" || selectData.length==0){
                    return Notification.error(transervice.tran('请选择待入库记录中的调拨单'));
                }

                $modalInstance.close(selectData);
            }
        });
    })
