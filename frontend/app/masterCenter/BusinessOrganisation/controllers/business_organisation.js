/**
 * Created by Administrator on 2017/5/11.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    "app/userCenter/organisation/controllers/organisation_subjection_service"
], function () {
    return ['$scope', '$confirm', 'Notification','amHttp','httpService', 'transervice', 'uiGridConstants','organisation_subjection_service',
        function ($scope, $confirm, Notification, amHttp,httpService, transervice, uiGridConstants,organisation_subjection_service) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'edit', displayName: transervice.tran('操作'), cellTemplate: '<button type="button" class="btn btn-link" ng-click="grid.appScope.choose(row.entity)">{{"选择" | translate}}</button>' },
                    { name: 'ORGANISATION_CODE', displayName: transervice.tran('组织编码'), cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ORGANISATION_NAME_CN}}</a>' },
                    { field: 'ORGANISATION_NAME_CN', displayName: transervice.tran('组织名称'), cellClass: 'red' },
                    { field: 'ORGANISATION_BUSINESS_NAME', displayName: transervice.tran('组织业务属性'), cellClass: 'red' }
                ],
                paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 20, //每页显示个数

                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                        if(getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };
            $scope.init = function(currentPage,pageSize){
                var selectWhere = {
                    "where":["=","D_GROUP","ORGANISATION"]
                };
                var busOrgList = [];
                httpService.httpHelper(httpService.webApi.api, "common/base/dictionary", "index", "POST",selectWhere).then(
                    function (result){
                        if(result!= null && result.status == 200){
                            var data = result.data;
                            angular.forEach(data,function(obj,index){
                                if(obj.D_GROUP=="ORGANISATION"){
                                    if(obj.D_PID==1){
                                        busOrgList.push(obj)
                                    }
                                }
                            });
                            $scope.busOrgList = busOrgList;
                        }else{

                        }
                    });
                var searchData = {
                    "where":["and",["<>","ORGANISATION_BUSINESS"," "],["<>","DELETED_STATE",1]]

                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index?page=" + (currentPage ? currentPage : 1), "POST",searchData).then(
                    function (result){
                        if (result != null && result.status == 200) {
                            var orgClass=[];
                            angular.forEach(result.data,function(obj){
                                angular.forEach($scope.busOrgList,function(item){
                                    if(obj.ORGANISATION_BUSINESS.indexOf(item.D_PID)!= -1 ){
                                            var newData = {
                                                "ORGANISATION_CODE":obj.ORGANISATION_CODE,
                                                "ORGANISATION_NAME_CN":obj.ORGANISATION_NAME_CN,
                                                "ORGANISATION_BUSINESS_NAME":item.D_NAME_CN
                                            };
                                            orgClass.push(newData);
                                    }
                                });
                            });
                            $scope.gridOptions.data = orgClass;
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                        }else{
                            Notification.error({ message: result.message, delay: 5000 });
                        }
                    });
            };
            $scope.init();
            $scope.choose = function(row){
                var model = row;
                organisation_subjection_service.showDialog(model);
            }



            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init(currentPage,pageSize);
            }

        }]
});