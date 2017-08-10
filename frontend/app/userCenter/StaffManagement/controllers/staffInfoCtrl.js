/**
 * Created by Administrator on 2017/5/12.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/userCenter/staffManagement/controllers/staffInfo_add_service",
    "app/userCenter/staffManagement/controllers/staffInfo_edit_service",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
    'app/common/Services/configService',

], function () {
    return ['$scope', '$confirm', 'Notification','commonService', 'httpService', 'amHttp','configService', 'transervice','messageService', 'uiGridConstants', 'staffInfo_add_service','staffInfo_edit_service','gridDefaultOptionsService',
        function ($scope, $confirm, Notification,commonService, httpService, amHttp,configService, transervice, messageService,uiGridConstants, staffInfo_add_service,staffInfo_edit_service,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'STAFF_CODE',enableCellEdit: false, displayName: transervice.tran('员工编码'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.STAFF_CODE}}</a>'},
                    { field: 'STAFF_NAME_CN', enableCellEdit: false,displayName: transervice.tran('员工姓名'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.STAFF_NAME_CN}}</div>'},
                    { field: 'STAFF_PHONE',enableCellEdit: false, displayName: transervice.tran('移动电话')},
                    { field: 'STAFF_TEL',enableCellEdit: false, displayName: transervice.tran('固定电话')},
                    { field: 'STAFF_EMAIL',enableCellEdit: false, displayName: transervice.tran('E-mail')},
                    { field: 'CUSER_CODE',enableCellEdit: false, displayName: transervice.tran('创建人'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{(row.entity.u_userinfoc&&row.entity.u_userinfoc.u_staffinfo)?row.entity.u_userinfoc.u_staffinfo.STAFF_NAME_CN:""}}</div>'},
                    { field: 'ORGANISATION_ID',enableCellEdit: false, displayName: transervice.tran('所属组织'),
                        cellTemplate: '<div class="ui-grid-cell-contents ">{{row.entity.o_organisation?row.entity.o_organisation.ORGANISATION_NAME_CN:null}}</div>'},
                    { field: 'STAFF_STATE',enableCellEdit: false, displayName: transervice.tran('是否启用') ,
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getStaffStateName(row.entity.STAFF_STATE)}}</div>'}
                ],
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
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            //查询行政职能
            function getOrgData () {
                configService.getOrganisationList([1]).then(function (datas) {
                    var res_list = new Array();
                    datas && datas.forEach(d=> {
                        res_list.push(d);
                    });
                    $scope.businessOrgList = res_list;
                    $scope.init();
                })
            }
            getOrgData();
            $scope.approvalList = commonService.getDicList("APPROVAL");
            $scope.isusedList = commonService.getDicList("STATE");

            $scope.init = function(currentPage, pageSize){
                //所有用户
                var selectData = null;
                if($scope.searchWhere){
                    $scope.searchWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                    selectData = $scope.searchWhere;
                }else{
                    selectData = {
                        "where":["<>","u_staff_info.STAFF_STATE",0],
                        "joinwith":["o_organisation","u_userinfoc"],
                        "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize),
                        "orderby":"u_staff_info.STAFF_STATE desc,u_staff_info.UPDATED_AT desc ",
                        "distinct": true
                    };
                }
                selectData.joinwith = ["o_organisation","u_userinfoc"];
                selectData.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                selectData.orderby = "u_staff_info.STAFF_STATE desc,u_staff_info.UPDATED_AT desc ";
                selectData.distinct = true;
                httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "index?page=" + (currentPage ? currentPage : 1), "POST",selectData).then(
                    function (result){
                        result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                        $scope.gridOptions.data = result.data;
                        angular.forEach(result.data,function(obj){
                            if(obj.o_organisation!=null){
                                obj.ORGANISATION_NAME_CN = obj.o_organisation.ORGANISATION_NAME_CN;
                            }
                            for(var i=0;i<$scope.isusedList.length;i++){
                                if(obj.STAFF_STATE == $scope.isusedList[i].value){
                                    obj.STAFF_STATE_NAME = $scope.isusedList[i].name;
                                }
                            }
                        });
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    });
            };
            $scope.init();
            //新增
            $scope.add = function(){
                var model = {
                    "approvalList":$scope.approvalList,
                    "businessOrgList":$scope.businessOrgList,
                    "isusedList":$scope.isusedList
                };
                staffInfo_add_service.showDialog(model).then(function(data){
                    $scope.gridOptions.paginationCurrentPage=1;
                    $scope.init();
                });
            };
            //编辑
            $scope.edit = function(item){
                item['approvalList'] =  $scope.approvalList;
                item['businessOrgList'] = $scope.businessOrgList;
                item['isusedList'] = $scope.isusedList;
                staffInfo_edit_service.showDialog(item).then(function(data){
                    $scope.gridOptions.paginationCurrentPage=1;
                    $scope.init();
                });
            };
            //删除数据
            $scope.del = function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function () {
                    var myArray=[];
                    for(var i=0;i<rows.length;i++){
                        myArray[i]=rows[i];
                    }
                    var deleteRowModel = {
                        "batch": myArray
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "delete", "POST",deleteRowModel).then(function(result){
                        Notification.success(transervice.tran(result.message));
                        $scope.init();

                    });
                },function(){
                    $scope.gridApi.selection.clearSelectedRows();
                });
            };

            $scope.getStaffStateName = function(value){
                var initState = $scope.isusedList.filter(c=>c.D_VALUE == value);
                if (initState.length) {
                    return initState[0].D_NAME_CN;
                }
                return null;
            };

            //审核audit
            $scope.batchAudit = function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要审核的数据！'));
                }
                return $confirm({ text: transervice.tran('是否确认审核') }).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["STAFF_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"STAFF_ID": myArray}},
                        "edit": {"AUDIT_STATE": 1}
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "update", "POST", datadel).then(function (result) {
                        if (result != null && result.status == 200) {
                            $scope.init();
                        } else {
                            Notification.error({message: result.message, delay: 5000});
                        }
                    })
                })
            };

            //反审核antiAudit
            $scope.batchAntiAudit = function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要反审核的数据！'));
                }
                return $confirm({ text: transervice.tran('是否确认反审核') }).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["STAFF_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"STAFF_ID": myArray}},
                        "edit": {"AUDIT_STATE": 0}
                    };
                    httpService.httpHelper(httpService.webApi.api, "users/staffinfo", "update", "POST", datadel).then(function (result) {
                        if (result != null && result.status == 200) {
                            $scope.init();
                        } else {
                            Notification.error({message: result.message, delay: 5000});
                        }
                    })
                })
            };
            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondtion){
                    var serach =["or",["like","u_staff_info.STAFF_CODE",$scope.searchCondtion],["like","u_staff_info.STAFF_NAME_CN",$scope.searchCondtion],["like","u_staff_info.STAFF_PHONE",$scope.searchCondtion]];
                    $scope.searchWhere ={
                        "where":["and",["<>","u_staff_info.STAFF_STATE",0],serach]
                    };
                    if($scope.ctDisableCode){
                        $scope.searchWhere = {
                            "where": serach
                        }
                    }
                }else if($scope.ctDisableCode){
                    $scope.searchWhere = {
                        "joinwith":["o_organisation","u_userinfoc"]
                    }
                }else{
                    $scope.searchWhere = null;
                }
                $scope.gridOptions.paginationCurrentPage=1;
                $scope.init();
            };
            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init(currentPage,pageSize);
            }
        }]
});
