/**
 * Created by Administrator on 2017/5/11.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/angular.treeview',
        'app/common/Services/gridDefaultOptionsService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'organisation_business_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "organisation_business_ctrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/organisation/views/organisation_business.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("organisation_business_ctrl", function ($scope, amHttp, model, $modalInstance, Notification,gridDefaultOptionsService, transervice, httpService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'ORGANISATION_CODE',enableCellEdit: false,
                        displayName: transervice.tran('组织编码')
                    },
                    {field: 'ORGANISATION_NAME_CN',enableCellEdit: false, displayName: transervice.tran('组织名称')}
                ],
                paginationPageSizes: [10, 20, 50],
                paginationPageSize: 10,
                enableSelectAll: false,
                multiSelect: false,
                /*paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10, //每页显示个数
                enableSelectAll: false,
                enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                multiSelect: false,
                useExternalPagination: true,//是否使用分页按钮*/

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
                            $scope.selectedRow = row.entity;
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            if(model){
                $scope.busOrgList = model.busOrgList;
                $scope.ORGANISATION_BUSINESS = model.FUNCTION_ID;
            }
            $scope.init = function (currentPage, pageSize) {
                var searchData = null;
                if($scope.searchWhere!=null){
                    $scope.searchWhere.limit = pageSize ? pageSize : $scope.gridOptions.paginationPageSize;
                    searchData = $scope.searchWhere;
                }else{
                    searchData = {
                        "where": ["and", ["<>","ORGANISATION_STATE",0],["like","ORGANISATION_ACCOUNTING",3]],
                        "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                    };
                }
                searchData.page = (currentPage ? currentPage : 1);
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "get_organisationrm", "POST", searchData).then(
                    function (result) {
                        $scope.gridOptions.totalItems=result._meta.totalCount;
                        $scope.gridOptions.data = result.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    });
            };
            $scope.init();

            $scope.EFFECTIVE_TIME = null;
            $scope.END_TIME = null;
            $scope.ORGANISATION_FORM_ID = null;
            //确定
            $scope.confirm = function () {
                var selectWhere = {
                    "where": ["and",["<>","o_organisation_relation.ORGANISATION_STATE",0], ["=", "o_organisation_relation.FUNCTION_ID", $scope.ORGANISATION_BUSINESS], ["=", "o_organisation_relation.ORGANISATION_ID", $scope.selectedRow.ORGANISATION_ID]],
                    //"andwhere":["<>","o_organisation.ORGANISATION_STATE",0],
                    "joinWith": ["o_organisationrm"]
                };
                $scope.exitOrgList = [];
                httpService.httpHelper(httpService.webApi.api, "organization/organisationr", "index", "POST", selectWhere).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            var data = result.data;
                            var treeList = [];
                            if(data.length!=0){
                                angular.forEach(data[0].o_organisationrm, function (obj) {
                                    $scope.exitOrgList.push(obj.o_organisationt.ORGANISATION_ID);
                                    var newData = {
                                        "ids": obj.ORGANISATION_CODES,
                                        "id": obj.ORGANISATION_CODE,
                                        "name": obj.o_organisationt.ORGANISATION_NAME_CN
                                    };
                                    treeList.push(newData);
                                });
                                $scope.ORGANISATION_RELATION_ID = data[0].ORGANISATION_RELATION_ID;
                                $scope.EFFECTIVE_TIME = data[0].EFFECTIVE_TIME;
                                $scope.END_TIME = data[0].END_TIME;
                                $scope.ORGANISATION_FORM_ID = data[0].ORGANISATION_FORM_ID;
                                $scope.RELATION_REMARKS = data[0].RELATION_REMARKS;
                            }
                            //一维数组转换为树形结构
                            var treeData = [];
                            treeData = loopData(treeList);
                            $scope.model = {
                                "ORGANISATION_RELATION_ID":$scope.ORGANISATION_RELATION_ID?$scope.ORGANISATION_RELATION_ID:null,
                                "ORGANISATION_ID":$scope.selectedRow.ORGANISATION_ID,
                                "ORGANISATION_CODE": $scope.selectedRow.ORGANISATION_CODE,
                                "ORGANISATION_NAME_CN": $scope.selectedRow.ORGANISATION_NAME_CN,
                                "FUNCTION_ID": $scope.ORGANISATION_BUSINESS,
                                "ORGANISATION_BUSINESS_NAME":$scope.selectedRow.ORGANISATION_BUSINESS_NAME,
                                "EFFECTIVE_TIME":$scope.EFFECTIVE_TIME?$scope.EFFECTIVE_TIME:null,
                                "END_TIME":$scope.END_TIME?$scope.END_TIME:null,
                                "ORGANISATION_FORM_ID":$scope.ORGANISATION_FORM_ID?$scope.ORGANISATION_FORM_ID:null,
                                "RELATION_REMARKS":$scope.RELATION_REMARKS,
                                "exitOrgList":$scope.exitOrgList,
                                "treeData": treeData
                            };
                            $modalInstance.close($scope.model);//返回数据
                        }
                    });

            };

            //一维数组转换为树形结构
            function loopData(arr) {
                var children = [];
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    var tempArr = findChilds(arr, item);
                    item.children = tempArr;
                    children = children.concat(tempArr);
                }
                arr = arr.filter(a=>$.inArray(a, children) == -1);
                return arr;
            }

            function findChilds(arr, item) {
                var tempArr = [];
                arr.forEach(a=> {
                    if (a.ids == item.id) {
                        tempArr.push(a);
                    }
                });
                return tempArr;
            }

            //模糊搜索
            $scope.searchOrganisation = function(){
                if($scope.searchCondition){
                    var seleteLike = ["or",["like","ORGANISATION_CODE",$scope.searchCondition],["like","ORGANISATION_NAME_CN",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where": ["and",["<>","ORGANISATION_STATE",0],["like","ORGANISATION_BUSINESS",$scope.ORGANISATION_BUSINESS],seleteLike]
                    }
                }else{
                    $scope.searchWhere = null;
                }
                $scope.init();
            };

            //下面取消按钮
            $scope.exit = function () {
                $modalInstance.dismiss(false);
            };
            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

        });
    });