define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/dispatch/directives/h-grid-respond',


], function () {
    return   function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,messageService) {



        //表格配置
        $scope.gridOptions= {
            columnDefs: [
                // {
                //     field: 'JOURNAL_TIME',
                //     displayName: transervice.tran('操作时间'),
                //     enableCellEdit:false,
                // },
                // {
                //     field: 'u_user_info.u_staff_info.STAFF_NAME_CN',
                //     displayName: transervice.tran('操作人'),
                //     enableCellEdit:false,
                //
                // },
                // {
                //     field: 'JOURNAL_REMARKS',
                //     displayName: transervice.tran('操作内容'),
                //     enableCellEdit:false,
                // }, {
                //     field: 'JOURNAL_TYPE',
                //     displayName: transervice.tran('日志类型'),
                //     cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.JOURNAL_TYPE==1?"接口日志":row.entity.JOURNAL_TYPE}}</div>',
                //     enableCellEdit:false,
                // }, {
                //     field: 'VISIT_API',
                //     displayName: transervice.tran('访问的接口'),
                //     enableCellEdit:false,
                // },


            ],enableGridMenu: false, //是否使用菜单

        };
        gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

        //查询条件
             $scope.searchConditions={
                 search_time_start:"",
                 search_time_end:"",
                 search:"",
                 "joinwith": ["u_user_info"],
                 "where":["and",["=",'JOURNAL_TYPE',2]],
                 "orderBy": {
                     "JOURNAL_TIME": "DESC"
                 },
                 limit:$scope.gridOptions.paginationPageSize
             }

       function init(){
           $scope.searchConditions.limit=$scope.gridOptions.paginationPageSize;
           var search=angular.copy($scope.searchConditions);
           if(search.search_time_start){
               search.where.push([">=","JOURNAL_TIME",new Date(search.search_time_start).getTime()/1000])
           }
           if(search.search_time_end){
               search.where.push(["<=","JOURNAL_TIME",new Date(search.search_time_end).getTime()/1000])
           }
           search.andFilterWhere=["or",["like","JOURNAL_REMARKS",search.search],["like","staff.STAFF_NAME_CN",search.search]]
           delete search.search_time_start;
           delete search.search_time_end;
           delete search.search;

           httpService.httpHelper(httpService.webApi.api, "journal/journals", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST",search).then(
               function (result){
                   $scope.model=result.data;
                   result.data.forEach(a=>{
                       a.JOURNAL_TIME=$filter('date')(new Date(a.JOURNAL_TIME*1000),"yyyy-MM-dd HH:mm:dd");
                       var jsons=JSON.parse(a.JOURNAL_REMARKS);
                       a.description=jsons.description;
                       a.subList=[];
                       Object.keys(jsons.value).forEach(o=>{
                           var value='';
                           if(o.indexOf('日期')>=0||o.indexOf("时间")>=0){
                               var vas=jsons.value[o].split("=>");
                               if(vas[0]){
                                   value+=$filter("date")(new Date(vas[0]*1000),"yyyy-MM-dd");
                               }
                               value+="=>";
                               if(vas[1]){
                                   value+=$filter("date")(new Date(vas[1]*1000),"yyyy-MM-dd");
                               }
                           }
                           a.subList.push({
                               key:o,
                               value:value?value:jsons.value[o]
                           });
                       })
                   })
                   $scope.gridOptions.totalItems=result._meta.totalCount;
           });
       }


       init();

       $scope.search=function () {
           $scope.gridOptions.paginationCurrentPage=1;
           init();
       };

        $scope.gridOptions.getPage=function (pageNo,pageSize) {
            init();
        }


    }
});
