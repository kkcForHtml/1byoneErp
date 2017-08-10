/**
 * Created by Fable on 2017/8/4.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService'
], function () {
    return   function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,messageService) {

        var TYPE_STR_LIST = {'1':'库存拉取','2':'订单拉取','3':'payment','4':'其他'};
        var ERROR_TYPE_LIST = {'1':'匹配不到sku'};
        var MARK_STATUS_LIST = {'0':'无须处理','1':'待处理','2':'已处理'};

        //表格配置
        $scope.gridOptions= {
            columnDefs: [
                {
                    field: 'CREATE_AT',
                    displayName: transervice.tran('添加时间'),
                    enableCellEdit:false
                },
                {
                    field: 'TYPE',
                    displayName: transervice.tran('类型'),
                    enableCellEdit:false
                },
                {
                    field: 'ERROR_TYPE',
                    displayName: transervice.tran('错误类型'),
                    enableCellEdit:false
                }, {
                    field: 'ERROR_MESSAGE',
                    displayName: transervice.tran('错误信息'),
                    enableCellEdit:false
                }, {
                    field: 'MARK_STATUS',
                    displayName: transervice.tran('状态'),
                    enableCellEdit:false
                }
            ],
            // enablePagination: false, //是否分页，默认为true
            // enablePaginationControls: false, //使用默认的底部分页
            enableHorizontalScrollbar: 1 //grid水平滚动条是否显示, 0-不显示  1-显示

        };
        gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

        //查询条件
        $scope.searchConditions={
            search_time_start:"",
            search_time_end:"",
            search:"",
            "where":["and",["=",'ERROR_TYPE',1],["=",'MARK_STATUS',1]],
            "orderBy": {
                "CREATE_AT": "DESC"
            },
            limit:$scope.gridOptions.paginationPageSize
        };

        function init(){
            $scope.searchConditions.limit=$scope.gridOptions.paginationPageSize;
            var search=angular.copy($scope.searchConditions);
            if(search.search_time_start){
                search.where.push([">=","CREATE_AT",new Date(search.search_time_start).getTime()/1000]);
            }
            if(search.search_time_end){
                search.where.push(["<=","CREATE_AT",new Date(search.search_time_end).getTime()/1000]);
            }
            search.andFilterWhere=["or",["like","ERROR_MESSAGE",search.search]];
            delete search.search_time_start;
            delete search.search_time_end;
            delete search.search;

            httpService.httpHelper(httpService.webApi.api, "amazon/amazonlog", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST",search).then(
                function (result){
                    $scope.gridOptions.data=result.data||[];
                    angular.forEach($scope.gridOptions.data,function(obj,index){
                        obj.CREATE_AT = $filter('date')(new Date(obj.CREATE_AT*1000),"yyyy-MM-dd HH:mm:dd");
                        obj.TYPE  = TYPE_STR_LIST[obj.TYPE];
                        obj.ERROR_TYPE = ERROR_TYPE_LIST[obj.ERROR_TYPE];
                        obj.MARK_STATUS = MARK_STATUS_LIST[obj.MARK_STATUS];
                    });
                    $scope.gridOptions.totalItems=result._meta.totalCount;
                });
        }

        init();

        $scope.search=function () {
            $scope.gridOptions.paginationCurrentPage = 1;
            init();
        };

        $scope.gridOptions.getPage=function (pageNo,pageSize) {
            init();
        };

        //同步按钮
        $scope.synchronous = function(){
            httpService.httpHelper(httpService.webApi.api, "amazon/amazonlog", "synchronous", "POST",[]).then(
                function (result){
                    Notification.success(transervice.tran('同步成功'));
                    init();
                });
        };
    };
});