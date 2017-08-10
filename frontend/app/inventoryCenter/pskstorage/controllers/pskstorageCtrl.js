/**
 * Created by Fable on 2017/6/7.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/directives/singleSelectDirt',
    'app/common/Services/gridDefaultOptionsService',
    "app/inventoryCenter/pskstorage/controllers/pskstprageDialogService",

    "app/inventoryCenter/pskstorage/controllers/shdisatchnoteDialogService",
    "app/inventoryCenter/skallocation/controllers/skallocationEditService",
    'app/common/directives/dialogPopupDirt',
    'app/common/Services/messageService',
    'app/common/Services/configService',
    "app/inventoryCenter/skallocation/controllers/goodsRejectedService"


],function(){
    return ['$scope', '$confirm', 'Notification', 'skallocationEditService','shdisatchnoteDialogService','commonService', 'httpService', '$filter','$q', '$interval', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService','pskstprageDialogService','configService',
        function($scope,$confirm,Notification,skallocationEditService,shdisatchnoteDialogService,commonService,httpService,$filter,$q, $interval,amHttp,transervice,uiGridConstants,gridDefaultOptionsService,pskstprageDialogService,configService){

            var selectFialls= new  Array();
            $scope.planlist = [{'VALUE':"",'NAME':'全部'},{'VALUE':1,'NAME':'未完成收货'},{'VALUE':2,'NAME':'已收货'}];

            $scope.PLAN_STATE = 1;

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'o_organisation.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('组织'),
                        enableCellEdit: false
                    },
                    {
                        field: 'NOTE_ID',
                        displayName: transervice.tran('发运单号/调拨计划单号'),
                        enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.openDetail(row.entity)">{{row.entity.ShowCD}}</a>',
                        width:180

                    },
                    {
                        field: 'PLAN_AT',
                        displayName: transervice.tran('预计收货日期'),
                        enableCellEdit: false
                    },
                    {
                        field: 'ACTUAL_AT',
                        width:120,
                        displayName: transervice.tran('实际收货日期'),                        
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.ACTUAL_AT"></div>',
                        cellEditableCondition:function(index){
                            var entity=$scope.gridOptions.data[index.rowRenderIndex];
                            if(entity.PLAN_STATE==2){
                                return false;
                            }else{
                                return true;
                            }
                        },
                    },
                    {
                        field: 'PSKU_CODE',
                        displayName: transervice.tran('SKU'),
                        enableCellEdit: false
                    },
                    {
                        field: 'SHIPMENT_NUMBER',
                        cellClass:'text-right',
                        displayName: transervice.tran('发运数量'),
                        enableCellEdit: false
                    },
                    {
                        field: 'RECEIVE_NUMBER',
                        cellClass:'text-right',
                        displayName: transervice.tran('已接收数量'),
                        enableCellEdit: false
                    },
                    {
                        field: 'ADJUSTMENT_NUMBER',
                        cellClass:'text-right',
                        displayName: transervice.tran('调整数量'),
                        enableCellEdit: false
                    },
                    {
                        field: 'THE_RECEIVE_NUMBERT',
                        cellClass:'text-right',
                        displayName: transervice.tran('本次接收数量'),
                        enableCellEdit: true,
                        editableCellTemplate: '<div><input type="text" numeric decimals="0" max="9999999999" min="0"   ui-grid-editor ng-model="row.entity.THE_RECEIVE_NUMBERT"></div>',
                        cellEditableCondition:function(index){
                            var entity=$scope.gridOptions.data[index.rowRenderIndex];
                            if(entity.PLAN_STATE==2){
                                return false;
                            }else{
                                return true;
                            }
                        },
                    },
                    {
                        field: 'e_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('调出仓库'),
                        enableCellEdit: false
                    },
                    {
                        field: 'a_warehouse.WAREHOUSE_NAME_CN',
                        displayName: transervice.tran('调入仓库'),
                        enableCellEdit: false
                    },
                    {
                        field: 'PLAN_STATE',
                        displayName: transervice.tran('状态'),
                        enableCellEdit: false,
                        cellTemplate: '<span ng-if="row.entity.PLAN_STATE==0">未收货</span>' +
                        '<span ng-if="row.entity.PLAN_STATE==1">正在收货</span>'+
                        '<span ng-if="row.entity.PLAN_STATE==2">已收货</span>'
                    },
                    {
                        field: 'u_user_info.u_staff_info.STAFF_NAME_CN',
                        displayName: transervice.tran('经手人'),
                        enableCellEdit: false
                    },

                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridOptions.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {

                        }
                    });
                     //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                init();
            }

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //初始化
            function init() {

                if ($scope.searchCondtion == undefined || $scope.searchCondtion == null) {
                    $scope.searchCondtion = "";
                }

                var anwhereCon = "";
                if($scope.PLAN_STATE){
                    if($scope.PLAN_STATE ==1){
                        anwhereCon = ['or',['=','sk_pending_storage.PLAN_STATE',0],['=','sk_pending_storage.PLAN_STATE',1]];
                    }else {
                        anwhereCon = ['and',['=','sk_pending_storage.PLAN_STATE',$scope.PLAN_STATE]];
                    }
                }

                var dataSearch = {
                    "where": ["or", ["like", "o_organisation.ORGANISATION_NAME_CN", $scope.searchCondtion],
                        ["like", "a.WAREHOUSE_NAME_CN", $scope.searchCondtion],
                        ["like", "e.WAREHOUSE_NAME_CN", $scope.searchCondtion],
                        ["like", "sk_pending_storage.NOTE_ID", $scope.searchCondtion],
                        ["like", "sk_allocation.ALLOCATION_CD", $scope.searchCondtion],
                        ["like", "sh_dispatch_note.KUKAI_NUMBER", $scope.searchCondtion]
                    ],
                    "andwhere":anwhereCon,
                    "joinWith": ["o_organisation", "a_warehouse as a","e_warehouse as e","u_user_info","sh_dispatch_note",'sk_allocation'],
                    'limit': $scope.gridOptions.paginationPageSize,
                    "orderby":"sk_pending_storage.PLAN_STATE asc,sk_pending_storage.CREATED_AT desc",

                };

                httpService.httpHelper(httpService.webApi.api, "inventory/pendingst", "index?page=" + $scope.gridOptions.paginationCurrentPage, "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data = [];
                    if (datas._meta.totalCount) {
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        angular.forEach(datas.data, function (obj, index) {
                            if(obj.IMPORT_STATE == 1){
                                obj.ShowCD = obj.sh_dispatch_note.KUKAI_NUMBER;
                            }else {
                                obj.ShowCD = obj.sk_allocation.ALLOCATION_CD;
                            }
                            obj.CREATED_AT = $filter("date")(new Date(parseInt(obj.CREATED_AT) * 1000), "yyyy-MM-dd HH:mm:ss");
                            obj.PLAN_AT = $filter("date")(new Date(parseInt(obj.PLAN_AT) * 1000), "yyyy-MM-dd");
                            if( obj.ACTUAL_AT == null){
                                obj.ACTUAL_AT = obj.PLAN_AT;
                            }else{
                                obj.ACTUAL_AT = $filter("date")(new Date(parseInt(obj.ACTUAL_AT) * 1000), "yyyy-MM-dd");
                            }
							obj.index = $scope.gridOptions.data.length;
                            if(obj.PLAN_STATE == 2){
                                obj.THE_RECEIVE_NUMBERT = 0;
                            }else{
                                obj.THE_RECEIVE_NUMBERT = parseInt(obj.SHIPMENT_NUMBER) - parseInt(obj.RECEIVE_NUMBER) - parseInt(obj.ADJUSTMENT_NUMBER);
                            }
                        });
                        $scope.gridOptions.data = datas.data;
                    }
                })
            }

            //初始化
            init();

            //确认入库按钮
            $scope.inventory = function(){
                var rows = $scope.gridApi.selection.getSelectedRows();

                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择需要操作的数据'));
                }

                var keepGoing = true;
                var checkHAVE_RECEIVE = true;
                var check_date = true;
                var check_num = true;

                angular.forEach(rows, function (obj, index) {
                    if (keepGoing) {
                        if (obj.PLAN_STATE == 2) {
                            keepGoing = false;
                        }
                        if(checkHAVE_RECEIVE){
                            if(obj.THE_RECEIVE_NUMBERT <= 0){
                                checkHAVE_RECEIVE = false;
                            }
                        }
                        if(check_date){
                            if(!obj.ACTUAL_AT){
                                check_date = false;
                            }
                        }

                        var num_check = parseInt(obj.SHIPMENT_NUMBER) - parseInt(obj.RECEIVE_NUMBER) - parseInt(obj.ADJUSTMENT_NUMBER);

                        if(obj.THE_RECEIVE_NUMBERT > num_check){
                            check_num = false;
                        }

                    }
                });

                if (!keepGoing) {
                    return Notification.error(transervice.tran('已收货单据不能操作'));
                }

                if(!checkHAVE_RECEIVE){
                    return Notification.error(transervice.tran('本次收货数量不得小于等于0'));
                }
                if(!check_date){
                    return Notification.error(transervice.tran('请选择实际收货日期'));
                }

                if(!check_num){
                    return Notification.error(transervice.tran('本次接收数量不得大于未收货数量'));
                }

                $scope.currentuser = configService.getUserInfo();

                var datas = angular.copy(rows);
               angular.forEach(datas, function (obj, index) {
                    var formatDate_PLAN_AT = new Date(obj.PLAN_AT.replace(/-/g, '/')).getTime();
                    obj.PLAN_AT = Math.round(formatDate_PLAN_AT / 1000);
                    var formatDate_ACTUAL_AT = new Date(obj.ACTUAL_AT.replace(/-/g, '/')).getTime();
                    obj.ACTUAL_AT = Math.round(formatDate_ACTUAL_AT / 1000);
                    var formatDate_CREATED_AT = new Date(obj.CREATED_AT.replace(/-/g, '/')).getTime();
                    obj.CREATED_AT = Math.round(formatDate_CREATED_AT / 1000);
                    obj.HANDLER_ID =  $scope.currentuser == null?"": $scope.currentuser.USER_INFO_ID;
                });

                //确认入库
                Confirminventory(datas);
            };

            //搜索
            $scope.search = function(){
                $scope.gridOptions.paginationCurrentPage = 1;
                init();
            };

            $scope.openDetail = function(item){

                if(item.IMPORT_STATE == 2){
                    var dataSearch = {
                        "where":['and',
                            "sk_allocation.ALLOCATION_ID="+item.NOTE_ID,
                        ],
                        "joinWith":["sk_allocation_detail","u_userinfoc"],
                        "distinct":true
                    };
                    httpService.httpHelper(httpService.webApi.api, "inventory/allocation","view" , "POST", dataSearch).then(function (datas) {
                        if(datas.data.ESTIMATEDA_AT&&datas.data.ESTIMATED_AT){
                            datas.data.ESTIMATEDA_AT = $filter("date")(new Date(parseInt(datas.data.ESTIMATEDA_AT)*1000), "yyyy-MM-dd");
                            datas.data.ESTIMATED_AT = $filter("date")(new Date(parseInt(datas.data.ESTIMATED_AT)*1000), "yyyy-MM-dd");
                        }
                        var idList = new Array();
                        var length= 0;
                        angular.forEach($scope.gridOptions.data,function(obj,index){
                           if(obj.IMPORT_STATE==2){
                               idList[length] = obj.NOTE_ID;
                               length++;
                           }
                        });
                        var _index = $.inArray(item.NOTE_ID,idList);

                        skallocationEditService.showDialog(datas.data,_index,length,idList).then(function(data){

                        });
                    });
                }else{
                    var _dataSearch ={
                        DISPATCH_NOTE_ID:item.NOTE_ID,
                    };
                    httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "dispatch_view", "POST",_dataSearch).then(function (datas) {
                        shdisatchnoteDialogService.showDialog(datas.data[0]).then(function(data){

                        });
                     });
                }
            };

            function Confirminventory(datas){
                var DataRows={batchMTC:datas,flag:true};

                httpService.httpHelper(httpService.webApi.api, "inventory/pendingst", "confirminventory", "POST", DataRows).then(function (datas) {
                    Notification.success(transervice.tran(datas.message));
                    init();
                })
            }

            //取消入库
            $scope.cancelinven =function(){
                var rows = $scope.gridApi.selection.getSelectedRows();

                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择需要操作的数据'));
                }
                if(rows.length>1){
                    return Notification.error(transervice.tran('取消入库只能操作一条数据'));
                }

                var keepGoing = true;

                angular.forEach(rows, function (obj, index) {
                    if (keepGoing) {
                        if (obj.PLAN_STATE == 0) {
                            keepGoing = false;
                        }
                    }
                });

                if (!keepGoing) {
                    return Notification.error(transervice.tran('已收货/正在收货 单据才能操作'));
                }

                $scope.showFiallocation(rows[0]);

            };
            //查看调拨单列表
            $scope.showFiallocation=function(rows){
                pskstprageDialogService.showDialog(rows).then(function(selectData){
                    if(typeof(selectData)!= "undefined" || selectData.length!=0){
                        selectFialls = selectData;
                        saveData = rows;
                        saveData.selectFiall = selectFialls;

                        var DataRows={batchMTC:saveData,flag:true};

                        httpService.httpHelper(httpService.webApi.api, "inventory/pendingst", "cancelinventory", "POST", DataRows).then(function (datas) {
                            Notification.success(transervice.tran(datas.message));
                            init();
                        })
                    }
                });
            };
        }]
});