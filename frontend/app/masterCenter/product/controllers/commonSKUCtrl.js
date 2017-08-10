define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/masterCenter/product/controllers/commonSKU_add_service',
    'app/masterCenter/product/controllers/commonSKU_edit_service',
    'app/common/Services/gridDefaultOptionsService',

], function () {
    return  function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonSKU_add_service,commonSKU_edit_service,gridDefaultOptionsService,$q) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'CSKU_CODE',enableCellEdit: false, displayName: transervice.tran('通用SKU'), cellTemplate: '<button type="button" class="btn  btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.CSKU_CODE}}</button>' },
                    { field: 'CSKU_NAME_CN',enableCellEdit: false, displayName: transervice.tran('中文名称') },
                    { field: 'AUDIT_STATE_NAME',enableCellEdit: false, displayName: transervice.tran('大分类'),cellTemplate: '<span>{{row.entity.bigType?row.entity.bigType.SYSTEM_NAME_CN:""}}</span>'},
                    { field: 'AUDIT_STATE_NAME',enableCellEdit: false, displayName: transervice.tran('小分类'),cellTemplate: '<span>{{row.entity.smallType?row.entity.smallType.SYSTEM_NAME_CN:""}}</span>' },
                    { field: 'CSKU_STATE',enableCellEdit: false, displayName: transervice.tran('是否启用'),   cellTemplate: '<span>{{(row.entity.CSKU_STATE==0?"N":"Y")}}</span>' },
                ],
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            $scope.gridOptions.getPage=function(pageNo,pageSize){
                $scope.init();
            };

            $scope.gridOptions.getGridApi=function(gridApi){
                 $scope.gridApi=gridApi;
            };
            $scope.name="";

            $scope.init=function(){

                var searchCoditions={
                    orderby:{"g_currency_sku.CSKU_STATE":"desc","g_currency_sku.CSKU_CODE":"ASC"},
                    limit: $scope.gridOptions.paginationPageSize,
                    andFilterWhere:["or",["like","g_currency_sku.CSKU_CODE",$scope.name],["like","g_currency_sku.CSKU_NAME_CN",$scope.name]],
                    goodsType:$scope.name
                }

            return httpService.httpHelper(httpService.webApi.api, "master/product/currensku", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST",searchCoditions).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.gridOptions.totalItems = result._meta.totalCount;
                            $scope.gridOptions.data = result.data;
                        }
                    }
                );

            };

            $scope.init();



            //新增
            $scope.add = function(){

                commonSKU_add_service.showDialog().then(function (data) {
                    $scope.search();
                })



            };


            //编辑方法
            $scope.edit=function(item){

                commonSKU_edit_service.showDialog(item.CSKU_ID).then(function (data) {
                    $scope.search();
                })

            };



            //删除数据
            $scope.del=function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                   return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                var def=$q.defer();
                 $confirm({ text: transervice.tran('删除通用SKU将连同各产品SKU一同被删除，请确认是否删除？') }).then(function () {
                    var copyRows=angular.copy(rows);
                    copyRows.forEach(r=>r.DELETED_STATE=1);
                    var saveData={batch:copyRows};

                    httpService.httpHelper(httpService.webApi.api, "master/product/currensku", "delete", "POST",saveData,def).then(
                        function (){
                            Notification.success(transervice.tran('操作成功！'));
                            $scope.search();
                        }
                    );
                },function () {
                     def.resolve();
                 });
                return def.promise;
            };


            //模糊搜索
            $scope.search=function(){
                $scope.gridOptions.paginationCurrentPage=1;
                return $scope.init();

            }

        }
});
