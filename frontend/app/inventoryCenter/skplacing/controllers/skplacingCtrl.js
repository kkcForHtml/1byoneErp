/**
 * Created by Administrator on 2017/5/18.
 */
define([
    "app/inventoryCenter/skplacing/controllers/skplacingAddService",
    "app/inventoryCenter/skplacing/controllers/skplacingEditService",
    'app/masterCenter/bchannel/controllers/partner_list_service',
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/configService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService'

], function () {
    return ['$scope', '$confirm', 'Notification','skplacingAddService','skplacingEditService','partner_list_service','commonService','configService', 'httpService','$filter', 'amHttp', 'transervice', 'uiGridConstants','gridDefaultOptionsService','messageService',
        function ($scope, $confirm, Notification, skplacingAddService,skplacingEditService,partner_list_service,commonService,configService,httpService,$filter, amHttp, transervice, uiGridConstants,gridDefaultOptionsService,messageService) {
            $scope.gridOptions = {
                columnDefs: [
                     { field: 'o_organisation.ORGANISATION_NAME_CN', displayName: transervice.tran('组织'),enableCellEdit: false},
                    { field: 'PLACING_CD', displayName: transervice.tran('出库单号'),enableCellEdit: false,cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.PLACING_CD}}</a>' },
                    { field: 'PLACING_AT', displayName: transervice.tran('出库日期'),enableCellEdit: false},
                    { field: 'b_warehouse.WAREHOUSE_NAME_CN', displayName: transervice.tran('出库仓库'),enableCellEdit: false},
                    { field: 'pa_partner.PARTNER_NAME_CN', displayName: transervice.tran('客户'),enableCellEdit: false},
                    { field: 'PLAN_STATE', displayName: transervice.tran('单据状态'),enableCellEdit: false,cellTemplate:
                    '<span ng-if="row.entity.PLAN_STATE==2">已审核</span>'+
                    '<span ng-if="row.entity.PLAN_STATE==1">未审核</span>'}

                ],

                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                        if(newPage) {
                            $scope.gridOptions.getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){

                        }
                    });
                }
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //初始化
            function init(currentPage, pageSize) {

                //当前登陆者
                $scope.currentuser = configService.getUserInfo();

                    if($scope.searchCondtion == undefined || $scope.searchCondtion == null) {
                        $scope.searchCondtion = "";
                    }
                    var dataSearch = {
                        "where":["and",["or" ,["like","o_organisation.ORGANISATION_NAME_CN",$scope.searchCondtion],
                                 ["like","b_warehouse.WAREHOUSE_NAME_CN",$scope.searchCondtion],
                                 ["like","sk_placing.PLACING_CD",$scope.searchCondtion]
                        ],"sk_placing.DELETED_STATE=0"],
                        "joinWith":["o_organisation","b_warehouse","pa_partner","sk_placing_detail","u_userinfo_a","u_userinfoc"],
                        "orderby":"PLAN_STATE asc,PLACING_AT asc,UPDATED_AT desc,CREATED_AT desc",                        "limit":  pageSize ? pageSize : $scope.gridOptions.paginationPageSize,
                        "distinct":true
                    };

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];

                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function(obj,index){
                            obj.PLACING_AT = $filter("date")(new Date(parseInt(obj.PLACING_AT)*1000), "yyyy-MM-dd");
                        });

                        $scope.gridOptions.data=datas.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }


                })
            }
            //初始化
            init();

            //搜索
            $scope.search = function(){
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            }
            //新增
            $scope.add = function(){
                skplacingAddService.showDialog().then(function(data){
                    $scope.gridOptions.paginationCurrentPage = 1;
                    init();
                });
            };
            //编辑页面
            $scope.openDetail = function(item){
                var _index = $.inArray(item,$scope.gridOptions.data);
                var index = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + _index;
                var idList = $scope.gridOptions.data.map(obj=>obj.PLACING_ID);
                skplacingEditService.showDialog(item,_index,$scope.gridOptions.data.length,idList).then(function(data){
                    init();
                });
            };
            //删除
            $scope.del = function(){

                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }

                var keepGoing = true;
                angular.forEach(rows, function(obj,index){
                    if (keepGoing) {
                        if (obj.PLAN_STATE == 2) {
                            keepGoing = false;
                        }
                    }

                });

                if (!keepGoing) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }

                $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function () {
                    debugger;
                    $scope.delArray = new Array();
                    angular.forEach(rows, function(obj,index){
                        $scope.rowObj = new Object();
                        $scope.rowObj.DELETED_STATE = 1;
                        $scope.rowObj.PLACING_ID = obj.PLACING_ID;
                        $scope.rowObj.PRGANISATION_ID = obj.PRGANISATION_ID;
                        $scope.rowObj.PPARTNER_ID = obj.PPARTNER_ID;
                        $scope.rowObj.PWAREHOUSE_ID = obj.PWAREHOUSE_ID;

                        $scope.delArray.push($scope.rowObj);
                    });

                    var updateRows = {
                        "batch":$scope.delArray
                    };


                    httpService.httpHelper(httpService.webApi.api, "inventory/placing","update", "POST", updateRows).then(function (datas) {

                            Notification.success(transervice.tran('删除成功'));
                            init();

                    });
                });
            };

            //审核
            $scope.auth = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }

                //校验会计期间和SKU库存
                var searchData = new Array();

                var keepGo = true;
                angular.forEach(rows, function(obj,index){
                    if(obj.PLAN_STATE==2){
                        keepGo = false;
                    }
                    var arr = new Object();
                    var formatDate = new Date(obj.PLACING_AT.replace(/-/g,'/')).getTime();
                    var placingAt = Math.round(formatDate/1000);
                    arr["ORGANISATION_ID"] = obj.PRGANISATION_ID;
                    arr["PRE_ORDER_AT"] = placingAt;
                    arr["PLACING_ID"] = obj.PLACING_ID;
                    arr["PLACING_CD"] = obj.PLACING_CD;
                    arr["orderclassify"] = 3;


                    searchData.push(arr);
                });

                if (!keepGo) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));
                }

                //确认审核
                confirmAuth(searchData,rows, 2, 1);


            };

            /**
             * 确认审核
             * @param arr
             */
            function confirmAuth(searchData,rows, planState, authFlag) {

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","checkskuinventory", "POST", searchData).then(function (datas) {

                    if(datas.data.flag == false) {
                        if(datas.data.type == 1) {
                            return Notification.error(transervice.tran(datas.data.PLACING_CD+'不在会计期间'));
                        } else {
                            $confirm({ text: transervice.tran('选择的'+datas.data.sku+'库存不足，是否继续操作？') }).then(function () {
                                //更新单据状态
                                updateSkPlanState(rows, planState, authFlag);
                            });
                        }

                    } else {
                        //更新单据状态
                        updateSkPlanState(rows, planState, authFlag);
                    }



                });
            }
            //反审核
            $scope.resetAuth = function(){

                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var keepGo = true;
                //校验会计期间和SKU库存
                var searchData = new Array();
                angular.forEach(rows, function(obj,index){
                    if(obj.PLAN_STATE==0 || obj.SYSTEM_GENERATION == 1){
                        keepGo = false;
                    }
                    var arr = new Object();
                    var formatDate = new Date(obj.PLACING_AT.replace(/-/g,'/')).getTime();
                    var placingAt = Math.round(formatDate/1000);
                    arr["ORGANISATION_ID"] = obj.PRGANISATION_ID;
                    arr["PRE_ORDER_AT"] = placingAt;
                    arr["PLACING_ID"] = obj.PLACING_ID;
                    arr["PLACING_CD"] = obj.PLACING_CD;
                    arr["orderclassify"] = 3;

                    searchData.push(arr);
                });

                if (!keepGo) {
                    return Notification.error(transervice.tran('未审核和系统自动生成的单据不能反审核'));
                }

                //确认反审核
                confirmAuth(searchData,rows, 1, 2);
            };


            $scope.gridOptions.getGridApi=function(gridApi){
                $scope.gridApi=gridApi;
            };
            //切换页码
            $scope.gridOptions.getPage=function(pageNo,pageSize){
                init(pageNo,pageSize);
            };

            //更新出库单状态
            function updateSkPlanState(rows, planState, authFlag) {

                $scope.postArray = new Array();
                angular.forEach(rows, function(obj,index){
                    $scope.rowArray = new Object();

                    $scope.rowArray.PLACING_ID = obj.PLACING_ID;
                    $scope.rowArray.PRGANISATION_ID = obj.PRGANISATION_ID;
                    $scope.rowArray.PPARTNER_ID = obj.PPARTNER_ID;
                    $scope.rowArray.PWAREHOUSE_ID = obj.PWAREHOUSE_ID;

                    $scope.rowArray.PLAN_STATE = planState;
                    $scope.rowArray.authFlag = authFlag;
                    $scope.rowArray.AUTITO_ID =  $scope.currentuser == null?"": $scope.currentuser.USER_INFO_ID;
                    $scope.rowArray.AUTITO_AT =  Math.round(new Date().getTime()/1000);
                    var formatDate = new Date(obj.PLACING_AT.replace(/-/g,'/')).getTime();
                    $scope.rowArray.PLACING_AT = Math.round(formatDate/1000);


                    $scope.postArray.push($scope.rowArray);

                });
                var dataSearch = {
                    "batch":$scope.postArray
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/placing","update", "POST", dataSearch).then(function (datas) {

                        Notification.success(transervice.tran('操作成功'));
                        init();

                })
            }

            //导出
            $scope.export=function () {
                var form=$("<form>");//定义一个form表单
                form.attr("style","display:none");
                form.attr("target","");
                form.attr("method","post");
                var input1=$("<input>");
                input1.attr("type","hidden");
                input1.attr("name","search");
                input1.attr("value",$scope.searchCondtion);
                form.append(input1);
                form.attr("action",httpService.webApi.api+"/inventory/placing/export");
                $("body").append(form);//将表单放置在web中
                form.submit();//表单提交
            }
        }]
});
