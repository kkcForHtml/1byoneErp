define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'app/common/Services/TranService',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/cooperativePartner/buddyList/controllers/Buddylist_edit',
    'app/common/Services/gridDefaultOptionsService',
], function () {
    return ['$scope', '$confirm', 'httpService', 'Notification', 'amHttp', 'transervice', '$filter', 'Buddylist_edit', 'uiGridConstants', 'commonService', 'gridDefaultOptionsService',
        function ($scope, $confirm, httpService, Notification, amHttp, transervice, $filter, Buddylist_edit, uiGridConstants, commonService, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        name: 'edit',
                        displayName: transervice.tran('操作'),
                        cellTemplate: '<button type="button" class="btn btn-sm btn-link" ng-click="grid.appScope.editsave(row.entity)"><i class="fa fa-fw fa-pencil"></i></button>',
                        'width': 70,
                        enableCellEdit: false
                    },
                    {
                        field: 'pa_partner_classify.CLASSIFY_NAME_CN',
                        displayName: transervice.tran('伙伴分类'),
                        enableCellEdit: false
                    },
                    {field: 'PARTNER_CODE', displayName: transervice.tran('伙伴编码'), enableCellEdit: false},
                    {field: 'PARTNER_NAME_CN', displayName: transervice.tran('伙伴公司名称'), enableCellEdit: false},
                    {field: 'PARTNER_ANAME_CN', displayName: transervice.tran('简称'), enableCellEdit: false},
                    {field: 'b_money.MONEY_NAME_CN', displayName: transervice.tran('默认币种'), enableCellEdit: false},
                    {field: 'PARTNER_LEGAL', displayName: transervice.tran('法人代表'), enableCellEdit: false},
                    {field: 'PARTNER_ADDRESS', displayName: transervice.tran('地址'), enableCellEdit: false},
                    {
                        field: 'PARTNER_STATE', displayName: '是否启用',
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PARTNER_STATE.list",
                        enableCellEdit: false
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
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                }
            };

            $scope.partent_class_list = [];

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //被删除的组织编码
            // $scope.organisation_codes=[];
            //模拟新增的models
            $scope.addModels = [];
            /**查询分页数据  start **/
            $scope.init = function () {
                var searchData = $scope.searchCondition;
                var searchCondition_class = '';

                if($scope.searchCondition_class != 'all')
                        searchCondition_class = $scope.searchCondition_class;
                else
                    $scope.searchCondition_class = 'all';

                //下拉框数据    start
                var stateList = commonService.getDicList("STATE");
                var rowEntity = {
                    "fieldDataObjectMap": {
                        "PARTNER_STATE": {
                            "list": stateList
                        }
                    }
                };
                $scope.rowEntity = rowEntity;
                // 下拉框数据    end
                var datam = {};
                if (searchData != null) {
                    datam = {
                        "joinwith": ["pa_partner_classify", "b_money"],
                        "having": ["or",['like','pa_partner.PARTNER_CODE',searchData], ["like", "pa_partner.PARTNER_NAME_EN", searchData], ["like", "pa_partner.PARTNER_NAME_CN", searchData]],

                    };
                } else {
                    datam = {
                        "joinwith": ["pa_partner_classify", "b_money"],
                    };
                }

                if(searchCondition_class){
                    datam.where = ["=","pa_partner.CLASSIFY_ID",searchCondition_class];
                }
                datam.limit =  $scope.gridOptions.paginationPageSize;
                datam.orderby="pa_partner.UPDATED_AT desc";

                httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "index?page=" + $scope.gridOptions.paginationCurrentPage, "POST", datam).then(
                    function (datas) {
                        datase = $scope.addModels.concat(datas.data);
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        $scope.gridOptions.data = datas.data;
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            object.rowEntity = $scope.rowEntity;
                        });
                    },
                    function (data) {
                        Notification.error({message: data.message, delay: 5000});
                    }
                );

                if($scope.partent_class_list.length==0){
                    //伙伴分类列表
                    var selectPartnerWhere = {"where": ["and", ["=", "CLASSIFY_STATE", 1]]};
                    httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "index", "POST", selectPartnerWhere).then(
                        function (result) {
                            var allobj = new Object();
                            allobj.CLASSIFY_ID = 'all';
                            allobj.CLASSIFY_NAME_CN = '全部';
                            result.data.unshift(allobj);
                            if (result != null && result.status == 200) {
                                $scope.areaList = result.data;
                                console.log($scope.areaList);
                                $scope.partent_class_list = result.data
                                $scope.searchCondition_class = 'all';
                            }
                        });
                }
                //server 结束
            };
            $scope.init();
            /**新增/编辑窗口  开始**/
            $scope.editsave = function (item) {
                Buddylist_edit.showDialog(item).then(function (data) {
                    /*if(item){
                     angular.copy(data,item);
                     }else{
                     $scope.addModels.push(data);
                     }*/
                    $scope.init();
                });
            };
            /**新增/编辑窗口 结束**/
            /**删除数据  start**/
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({text: transervice.tran('是否确认删除')})
                    .then(function () {
                        var myArray = new Array()
                        for (var i = 0; i < rows.length; i++) {
                            myArray[i] = rows[i];
                        }
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                if (datas.status == 200) {
                                    $scope.init();
                                    $scope.gridApi.selection.clearSelectedRows();
                                    Notification.success({message: transervice.tran(datas.message), delay: 5000});
                                } else {
                                    Notification.error({message: datas.message, delay: 5000});
                                }
                            }
                        );
                        $scope.init();
                    });
            };
            /**删除   end **/

                //设置组织隶属关系
            $scope.search = function () {
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            };
            function getSubList(datas) {
                var pageNo = $scope.gridOptions.paginationCurrentPage;
                var pageSize = $scope.gridOptions.paginationPageSize;
                var from = (pageNo - 1) * pageSize;
                var to = from + pageSize;
                if (datas.size < (to + 1)) {
                    return datas.splice(from);
                }
                return datas.splice(from, pageSize);
            }

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init();
            }
        }]
});
