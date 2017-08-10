define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/userCenter/organisation/controllers/organisation_add_service",
    "app/userCenter/organisation/controllers/organisation_edit_service",
    "app/userCenter/organisation/controllers/organisation_subjection_service",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
], function () {
    return ['$scope', '$confirm', 'Notification', 'commonService','i18nService', '$filter', 'amHttp', 'httpService', 'messageService','transervice', 'uiGridConstants', 'organisation_add_service', 'organisation_edit_service', 'organisation_subjection_service', 'gridDefaultOptionsService',
        function ($scope, $confirm, Notification, commonService,i18nService, $filter, amHttp, httpService, messageService,transervice, uiGridConstants, organisation_add_service, organisation_edit_service, organisation_subjection_service, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'ORGANISATION_CODE', enableCellEdit: false, displayName: transervice.tran('组织编码'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.ORGANISATION_CODE}}</a>'
                    },
                    {
                        name: 'ORGANISATION_NAME_CN',
                        enableCellEdit: false,
                        displayName: transervice.tran('组织名称')
                    },
                    {field: 'ORGANISATION_FORM_NAME', enableCellEdit: false, displayName: transervice.tran('组织形态')},
                    /*{ field: 'AUDIT_STATE_NAME', displayName: transervice.tran('审核状态') },*/
                    {field: 'AREA_ID', enableCellEdit: false, displayName: transervice.tran('地区'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.ba_area.AREA_NAME_CN}}</div>'
                    },
                    {field: 'COUNTRY_ID', enableCellEdit: false, displayName: transervice.tran('国家'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.ba_areas.AREA_NAME_CN}}</div>'
                    },
                    {field: 'CONTACT', enableCellEdit: false, displayName: transervice.tran('联系人')},
                    {field: 'PHONE', enableCellEdit: false, displayName: transervice.tran('联系电话')},
                    {field: 'INIT_STATE', enableCellEdit: false, displayName: transervice.tran('初始化状态'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getInitStateName(row.entity.INIT_STATE)}}</div>'
                    },
                    {
                        field: 'STARTUP_TIME',
                        enableCellEdit: false,
                        displayName: transervice.tran('启用日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM'",
                    },
                    {field: 'ORGANISATION_STATE', enableCellEdit: false, displayName: transervice.tran('是否启用'),
                        cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{grid.appScope.getStateName(row.entity.ORGANISATION_STATE)}}</div>'
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

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            //查询区域
            function getArea() {
                var selectWhere = {
                    "where": ["and", ["<>", "b_area.AREA_STATE", 0], ["=", "b_area.AREA_FID", "0"]],
                    "joinwith": ["b_areas"],
                    "limit": 0
                };
                return httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST", selectWhere).then(function (result) {
                    $scope.addressList =[{"AREA_FID":"","AREA_ID":"","AREA_NAME_CN":"请选择","b_areas":[{"AREA_ID":"","AREA_NAME_CN":"请选择"}]}].concat(result.data);
                    /*var selectWhere = {
                        "where": ["<>", "ORGANISATION_STATE", 0],
                        "andwhere": ["like", "ORGANISATION_ACCOUNTING", "1"],
                        "limit": 0
                    };
                    httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST", selectWhere).then(function (result) {
                        $scope.legalList = [{"ORGANISATION_ID":"","ORGANISATION_NAME_CN":"请选择"}].concat(result.data);
                    });*/
                });

            };
            getArea().then(function(){
                $scope.init();
            });

            $scope.orgClassList = commonService.getDicList("ORGANISATION");
            $scope.orgFormList = commonService.getDicList("ORGANISATION_Z"); //组织形态
            $scope.approvalList = commonService.getDicList("APPROVAL");   //审核状态
            $scope.stateList = commonService.getDicList("STATE");        //禁用状态
            $scope.initStateList = commonService.getDicList("INITSTATEOFORG");
            $scope.isRoot = true;
            $scope.init = function (currentPage, pageSize) {
                $scope.accOrgList = [];//核算组织
                $scope.busOrgList = [];//业务组织
                angular.forEach($scope.orgClassList, function (obj) {
                    if (obj.D_PID == 2) {
                        $scope.accOrgList.push(obj);
                    }
                    if (obj.D_PID == 1) {
                        $scope.busOrgList.push(obj);
                    }
                });
                var searchData = null;
                if ($scope.searchWhere) {
                    searchData = $scope.searchWhere;
                } else {
                    searchData = {
                        "where": ["<>", "o_organisation.ORGANISATION_STATE", 0]
                    };
                }
                searchData.joinwith = ["o_grouping", "ba_area", "ba_areas", "pa_partner"];
                searchData.orderby = "o_organisation.ORGANISATION_STATE desc,o_organisation.UPDATED_AT desc";
                searchData.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchData.distinct = true;
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                            $scope.gridOptions.data = result.data;
                            angular.forEach(result.data, function (object, index) {
                                object.STARTUP_TIME = object.STARTUP_TIME ? new Date(object.STARTUP_TIME * 1000) : null;
                                object.TARIFF = (Number(object.TARIFF) * 100).toFixed(2);
                                object.TARIFF = object.TARIFF ? object.TARIFF + "%" : null;
                                var areaList = [];
                                var areaList = $scope.addressList.filter(d=> {
                                    return d.AREA_ID == object.AREA_ID;
                                });
                                object.AREA_ID = areaList.length > 0 ? areaList[0].AREA_ID : null;
                                object.AREA_NAME = areaList.length > 0 ? areaList[0].AREA_NAME_CN : null;
                                $scope.addressList2 = areaList.length > 0 ? areaList[0].b_areas : [];
                                var countryCode = [];
                                if ($scope.addressList2.length > 0) {
                                    countryCode = $scope.addressList2.filter(d=> {
                                        return d.AREA_ID == object.COUNTRY_ID;
                                    });
                                }
                                object.COUNTRY_ID = countryCode.length > 0 ? countryCode[0].AREA_ID : null;
                                object.COUNTRY_NAME = countryCode.length > 0 ? countryCode[0].AREA_NAME_CN : null;
                                object.addressList = $scope.addressList != null ? $scope.addressList : null;
                                object.accOrgList = $scope.accOrgList != null ? $scope.accOrgList : null;
                                object.busOrgList = $scope.busOrgList != null ? $scope.busOrgList : null;
                                if ($scope.orgFormList != null) {
                                    for (var i = 0; i < $scope.orgFormList.length; i++) {
                                        var obj = $scope.orgFormList[i];
                                        if (obj.D_VALUE == object.ORGANISATION_FORM_ID) {
                                            object.ORGANISATION_FORM_NAME = obj.D_NAME_CN;
                                            break;
                                        }
                                    }
                                    object.orgFormList = $scope.orgFormList;
                                }
                                if ($scope.approvalList != null) {
                                    for (var i = 0; i < $scope.approvalList.length; i++) {
                                        var obj = $scope.approvalList[i];
                                        if (obj.D_VALUE == object.AUDIT_STATE) {
                                            object.AUDIT_STATE_NAME = obj.D_NAME_CN;
                                            break;
                                        }
                                    }
                                    object.approvalList = $scope.approvalList;
                                }
                            });
                            $scope.isRootArry = $scope.gridOptions.data.filter(d=>{
                                if(d.ORGANISATION_ACCOUNTING){return d.ORGANISATION_ACCOUNTING.indexOf(3)!=-1}
                            });
                            $scope.isRoot = $scope.isRootArry.length?true:false;
                            $scope.orgRootId = $scope.isRootArry.length?$scope.isRootArry[0].ORGANISATION_ID:"";
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                        } else {
                            Notification.error({message: result.message, delay: 5000});
                        }
                    });
            };
            //$scope.init();

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }

            //新增
            $scope.add = function () {
                var model = {
                    "accOrgList": $scope.accOrgList,
                    "busOrgList": $scope.busOrgList,
                    "orgFormList": $scope.orgFormList,
                    "approvalList": $scope.approvalList,
                    "stateList": $scope.stateList,
                    "addressList": $scope.addressList,
                   // "legalList": $scope.legalList,
                    "isRoot":$scope.isRoot
                };
                organisation_add_service.showDialog(model).then(function (data) {
                    //$scope.gridOptions.paginationCurrentPage = 1;
                    $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                });

            };

            //编辑方法
            $scope.edit = function (item) {
                var model;
                if (item != null) {
                    model = item;
                    //model.legalList = $scope.legalList;
                    model.stateList = $scope.stateList;
                    model.initStateList = $scope.initStateList;
                    model.isRoot = $scope.isRoot;
                    model.orgRootId = $scope.orgRootId;
                }
                organisation_edit_service.showDialog(model).then(function (data) {
                    $scope.init($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize);
                });
            };

            $scope.getInitStateName = function(value){
                var initState = $scope.initStateList.filter(c=>c.D_VALUE == value);
                if (initState.length) {
                    return initState[0].D_NAME_CN;
                }
                return null;
            };
            $scope.getStateName = function(value){
                var initState = $scope.stateList.filter(c=>c.D_VALUE == value);
                if (initState.length) {
                    return initState[0].D_NAME_CN;
                }
                return null;
            };

            //设置组织隶属关系
            $scope.setSubjection = function () {
                var model = null;
                model = {
                    "stateList": $scope.stateList
                };
                organisation_subjection_service.showDialog(model);
            };

            //删除数据
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = rows[i];
                    }
                    var deleteRowModel = {
                        "batch": myArray
                    };
                    return httpService.httpHelper(httpService.webApi.api, "organization/organisation", "delete", "POST", deleteRowModel).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        $scope.init();
                    });
                });
            };

            //模糊搜索
            $scope.search = function () {
                if ($scope.searchCondition) {
                    var seleteLike = ["or", ["like", "o_organisation.ORGANISATION_CODE", $scope.searchCondition], ["like", "o_organisation.ORGANISATION_NAME_CN", $scope.searchCondition], ["like", "o_organisation.CONTACT", $scope.searchCondition]];
                    $scope.searchWhere = {
                        "where": ["and", ["<>", "o_organisation.ORGANISATION_STATE", 0], seleteLike]
                    };
                    if ($scope.ctDisableCode) {
                        $scope.searchWhere = {
                            "where": seleteLike
                        }
                    }
                } else if ($scope.ctDisableCode) {
                    $scope.searchWhere = {
                        "joinwith": ["o_grouping", "ba_area", "ba_areas", "pa_partner"]
                    }
                } else {
                    $scope.searchWhere = null;
                }
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            }

            //审核
            $scope.batchAudit = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要审核的数据！'));
                }
                return $confirm({text: transervice.tran('是否确认审核')}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["ORGANISATION_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"ORGANISATION_ID": myArray}},
                        "edit": {"AUDIT_STATE": "1"}
                    };
                    httpService.httpHelper(httpService.webApi.api, "organization/organisation", "update", "POST", datadel).then(function (result) {
                        if (result != null && result.status == 200) {
                            Notification.success(transervice.tran(result.message));
                            $scope.init();
                        }
                    });
                });
            };
            //反审核
            $scope.batchAntiAudit = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({text: transervice.tran('是否确认反审核')}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["ORGANISATION_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"ORGANISATION_ID": myArray}},
                        "edit": {"AUDIT_STATE": "0"}
                    };
                    httpService.httpHelper(httpService.webApi.api, "organization/organisation", "update", "POST", datadel).then(function (result) {
                        if (result != null && result.status == 200) {
                            Notification.success(transervice.tran(result.message));
                            $scope.init();

                        }
                    });
                });
            };
            //禁用
            $scope.batchDisable = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({text: transervice.tran('是否确认删除')}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["ORGANISATION_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"ORGANISATION_ID": myArray}},
                        "edit": {"ORGANISATION_STATE": "0"}
                    };
                    httpService.httpHelper(httpService.webApi.api, "organization/organisation", "update", "POST", datadel).then(function (result) {
                        if (result != null && result.status == 200) {
                            $scope.init();
                            Notification.success({message: result.message, delay: 2000});
                        } else {
                            Notification.error({message: result.message, delay: 5000});
                        }
                    });
                });
            };
            //启用
            $scope.batchEnable = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({text: transervice.tran('是否确认删除')}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        myArray[i] = Number(rows[i]["ORGANISATION_ID"]);
                    }
                    var datadel = {
                        "condition": {"where": {"ORGANISATION_ID": myArray}},
                        "edit": {"ORGANISATION_STATE": "1"}
                    };
                    httpService.httpHelper(httpService.webApi.api, "organization/organisation", "update", "POST", datadel).then(function (result) {
                        if (result != null && result.status == 200) {
                            $scope.init();
                            Notification.success({message: result.message, delay: 2000});
                        } else {
                            Notification.error({message: result.message, delay: 5000});
                        }
                    });
                });
            };


        }]
});
