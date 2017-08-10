/**
 * Created by Administrator on 2017/5/31.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/directives/singleSelectDirt',
    'app/finance/paymentRequest/controllers/paymentRequest_add',
    'app/finance/paymentRequest/controllers/paymentRequest_edit',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
    'app/common/Services/configService'
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp', 'transervice','configService', 'uiGridConstants', '$q', '$interval', 'messageService', 'paymentRequest_add', 'paymentRequest_edit', 'gridDefaultOptionsService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp, transervice,configService, uiGridConstants, $q, $interval, messageService, paymentRequest_add, paymentRequest_edit, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    /*{
                        field: 'caozuo',
                        enableCellEdit: false,
                        displayName: transervice.tran('操作'),
                        width: 80,
                        cellClass: 'text-center',
                        cellTemplate: '<button type="button" class="btn btn-sm btn-link" ng-click="grid.appScope.edit(row.entity)"><i class="fa fa-fw fa-pencil"></i></button>'
                    },*/
                    {
                        field: 'PORGANISATION_ID',
                        width: 90,
                        enableCellEdit: false,
                        displayName: transervice.tran('组织'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.o_organisation?row.entity.o_organisation.ORGANISATION_NAME_CN:""}}</div>'
                    },
                    {
                        field: 'CREATED_AT',
                        width: 100,
                        displayName: transervice.tran('申请日期'),
                        /*type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",*/
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.CREATED_AT"></div>',
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'PAYMENT_CD',
                        width: 150,
                        enableCellEdit: false,
                        displayName: transervice.tran('付款申请单号'),
                        cellTemplate: '<a class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.PAYMENT_CD}}</a>'
                    },
                    {
                        field: 'AUDIT_STATE',
                        width: 120,
                        enableCellEdit: false,
                        displayName: transervice.tran('审核状态'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getDocStateName(row.entity.AUDIT_STATE)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'D_VALUE',
                        editDropdownValueLabel: 'D_NAME_CN',
                        editDropdownOptionsArray: $scope.docStateList
                    },
                    {
                        field: 'PARTNER_ID',
                        displayName: transervice.tran('供应商'),
                        width: 120,
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.pa_partner?(row.entity.pa_partner.PARTNER_ID+"_"+row.entity.pa_partner.PARTNER_ANAME_CN):""}}</div>'
                    },
                    {
                        field: 'PMONEY_ID',
                        displayName: transervice.tran('申付币种'),
                        enableCellEdit: false,
                        width: 100,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.p_money?row.entity.p_money.MONEY_NAME_CN:""}}</div>'
                    },
                    {
                        field: 'PAYMENT_NUMBER',
                        displayName: transervice.tran('申付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.PAYMENT_NUMBER|number:2}}</div>',
                        enableCellEdit: false,
                        width: 100
                    },
                    {
                        field: 'PAYMENT_AT',
                        width: 100,
                        displayName: transervice.tran('申请付款日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'ORGANISATION_NAME_CN',
                        displayName: transervice.tran('申请部门'),
                        enableCellEdit: false,
                        width: 100,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{(row.entity.pa_user&&row.entity.pa_user.o_organisation)?row.entity.pa_user.o_organisation.ORGANISATION_NAME_CN:""}}</div>'

                    },
                    {
                        field: 'CUSER_ID',
                        displayName: transervice.tran('申请人'),
                        enableCellEdit: false,
                        width: 100,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{(row.entity.pa_user&&row.entity.pa_user.u_staffinfo)?row.entity.pa_user.u_staffinfo.STAFF_NAME_CN:""}}</div>'
                    },
                    {
                        field: 'PAYMENT_STATE',
                        width: 120,
                        /*enableCellEdit: false,*/
                        displayName: transervice.tran('付款状态'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getPaymentStateName(row.entity.PAYMENT_STATE)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'D_VALUE',
                        editDropdownValueLabel: 'D_NAME_CN',
                        editDropdownOptionsArray: $scope.paymentStateList

                    },
                    {
                        field: 'PAMONEY_ID',
                        displayName: transervice.tran('实付币种'),
                        enableCellEdit: false,
                        width: 100,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.pa_money?row.entity.pa_money.MONEY_NAME_CN:""}}</div>'
                    },
                    {
                        field: 'PAID_MONEY',
                        displayName: transervice.tran('实付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.PAID_MONEY|number:2}}</div>',
                        enableCellEdit: false,
                        width: 100
                    },
                    {
                        field: 'PAID_AT',
                        width: 100,
                        displayName: transervice.tran('实付日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'AUTITOR',
                        displayName: transervice.tran('审核人'),
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.autit_user?row.entity.autit_user.u_staffinfo2.STAFF_NAME_CN:""}}</div>',
                        width: 100
                    },
                    {
                        field: 'AUTITO_AT',
                        width: 120,
                        displayName: transervice.tran('审核日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",
                        cellEditableCondition: function ($scope) {
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].PLAN_STATE != 2;
                        }
                    },
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示


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

            $scope.docStateList = [{"D_VALUE": "", "D_NAME_CN": "请选择"}];
            $scope.docStateList = $scope.docStateList.concat(commonService.getDicList("PU_PAYMENT")); //单据状态
            $scope.paymentStateList = [{"D_VALUE": "", "D_NAME_CN": "请选择"}];
            $scope.paymentStateList = $scope.paymentStateList.concat(commonService.getDicList("PAYMENT_STATE")); //付款状态

            //查询
            function getAllPartner() {
                //查询采购职能树
                configService.getOrganisationList([2]).then(function (datas) {
                    $scope.poOrgList = [{"ORGANISATION_ID": "", "ORGANISATION_NAME_CN": "请选择"}];
                    datas && datas.forEach(d=> {
                        $scope.poOrgList.push({
                            "ORGANISATION_ID": d.ORGANISATION_ID,
                            "ORGANISATION_NAME_CN": d.ORGANISATION_NAME_CN
                        });
                    });
                    //所有供应商
                    var dataSearch = {
                        "where": ["<>", "PARTNER_STATE", 0],
                        "limit": 0
                    };
                    httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "index", "POST", dataSearch).then(function (datas) {
                        var partnerList = datas.data;
                        $scope.partnerList = [{"PARTNER_ID": "", "PARTNER_NAME": "请选择"}];
                        partnerList.forEach(d=> {
                            $scope.partnerList.push({
                                "PARTNER_ID": d.PARTNER_ID,
                                "PARTNER_NAME": d.PARTNER_ID + "_" + d.PARTNER_ANAME_CN
                            });
                        });
                        $scope.init();
                    });
                });
            };
            getAllPartner();

            $scope.PORGANISATION_ID = '';
            $scope.PARTNER_ID = "";
            $scope.AUDIT_STATE = "";
            $scope.PAYMENT_STATE = "";
            $scope.init = function (currentPage, pageSize) {
                var selectWhere = {
                    "where": ["<>", "pu_payment.DELETED_STATE", 1]};
                if ($scope.searchWhere) {
                    selectWhere = $scope.searchWhere;
                }
                selectWhere.joinwith = ["o_organisation", "p_money", "pa_money", "pa_partner", "pu_payment_detail_1", "pa_user", "autit_user"];
                selectWhere.orderby = "pu_payment.AUDIT_STATE,pu_payment.PAYMENT_STATE ,pu_payment.CREATED_AT DESC ";
                selectWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                selectWhere.distinct = true;

                httpService.httpHelper(httpService.webApi.api, "purchase/payment", "index?page=" + (currentPage ? currentPage : 1), "POST", selectWhere).then(
                    function (result) {
                        $scope.gridOptions.totalItems = result._meta.totalCount;
                        var data = result.data;
                        data.forEach(d=> {
                            /*d.CREATED_AT = d.CREATED_AT ? new Date(d.CREATED_AT * 1000) : null;
                            d.PAYMENT_AT = d.PAYMENT_AT != null ? new Date(d.PAYMENT_AT * 1000) : null;
                             d.AUTITO_AT = d.AUTITO_AT != null ? new Date(d.AUTITO_AT * 1000) : null;
                             d.PAID_AT = d.PAID_AT != null ? new Date(d.PAID_AT * 1000) : null;*/
                            d.CREATED_AT = d.CREATED_AT ? ($filter("date")(d.CREATED_AT*1000, "yyyy-MM-dd")):null;
                            d.PAYMENT_AT = d.PAYMENT_AT != null ? ($filter("date")(d.PAYMENT_AT*1000, "yyyy-MM-dd")) : null;
                            d.AUTITO_AT = d.AUTITO_AT != null ? ($filter("date")(d.AUTITO_AT*1000, "yyyy-MM-dd")) : null;
                            d.PAID_AT = d.PAID_AT != null ? ($filter("date")(d.PAID_AT*1000, "yyyy-MM-dd")) : null;
                        });
                        $scope.gridOptions.data = data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                        if ($scope.gridApi.selection.getSelectedRows().length) {
                            $scope.clearAll();
                        }

                    });
            };

            //删除
            $scope.del = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择要操作的数据！'));
                }
                return $confirm({text: transervice.tran('是否确认删除?')})
                    .then(function () {
                        var delRows = rows.filter(e=>e.PAYMENT_ID);
                        if (delRows.length) {
                            var myArray = [];
                            for (var i = 0; i < delRows.length; i++) {
                                var obj = delRows[i];
                                if (obj.AUDIT_STATE == 2) {
                                    return Notification.error(transervice.tran('选择的数据中包含已审核的数据，请重新选择！'));
                                } else {
                                    //myArray.push(obj.PAYMENT_ID);
                                    obj.edit_type = '5';
                                    obj.DELETED_STATE = 1;
                                    myArray.push(obj);
                                    delRows.forEach(e=>e.DELETED_STATE = 1);
                                }
                                obj.CREATED_AT = obj.CREATED_AT ? $scope.formatDate(new Date(obj.CREATED_AT.replace(/-/g, "/"))): null;
                                obj.PAYMENT_AT = obj.PAYMENT_AT ? $scope.formatDate(new Date(obj.PAYMENT_AT.replace(/-/g, "/"))): null;
                                obj.PAID_AT = obj.PAID_AT ? $scope.formatDate(new Date(obj.PAID_AT.replace(/-/g, "/"))): null;
                                delete obj['autit_user'];
                                delete obj['o_organisation'];
                                delete obj['p_money'];
                                delete obj['pa_money'];
                                delete obj['pa_partner'];
                                delete obj['pa_user'];
                                delete obj['pu_payment_detail_1'];
                                delete obj['copyModel'];
                            }
                            var delData = {
                                "batchMTC": myArray
                            };
                            return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update", "POST", delData).then(function (result) {
                                Notification.success(transervice.tran(result.message));
                                $scope.gridApi.selection.clearSelectedRows();
                                $scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                            }, function (result) {
                                Notification.error(transervice.tran(result.message));
                            });
                        } else {
                            $scope.init($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                        }
                    })
            };
            //审核
            $scope.batchAudit = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));//判断是否选择了数据
                }
                var valiRows = rows.filter(a=>a.AUDIT_STATE == 2);
                if (valiRows.length > 0) {
                    return Notification.error(transervice.tran(messageService.error_audit_a));//是否包含了已审核数据
                }
                valiRows = rows.filter(a=>a.PAYMENT_STATE == 1);
                if (valiRows.length) {
                    return Notification.error(transervice.tran(messageService.error_pay_y));//判断是否包含已付款数据
                }
                return $confirm({text: transervice.tran(messageService.confirm_audit_c)}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        var obj = rows[i];
                        delete obj['autit_user'];
                        delete obj['o_organisation'];
                        delete obj['p_money'];
                        delete obj['pa_money'];
                        delete obj['pa_partner'];
                        delete obj['pa_user'];
                        delete obj['pu_payment_detail_1'];
                        obj.AUDIT_STATE = 2;
                        obj.edit_type = 1;
                        /*obj.CREATED_AT = obj.CREATED_AT ? $scope.formatDate(obj.CREATED_AT) : null;
                        obj.PAYMENT_AT = obj.PAYMENT_AT ? $scope.formatDate(obj.PAYMENT_AT) : null;
                        obj.PAID_AT = obj.PAID_AT ? $scope.formatDate(obj.PAID_AT) : null;*/
                        obj.CREATED_AT = obj.CREATED_AT ? $scope.formatDate(new Date(obj.CREATED_AT.replace(/-/g, "/"))): null;
                        obj.PAYMENT_AT = obj.PAYMENT_AT ? $scope.formatDate(new Date(obj.PAYMENT_AT.replace(/-/g, "/"))): null;
                        obj.PAID_AT = obj.PAID_AT ? $scope.formatDate(new Date(obj.PAID_AT.replace(/-/g, "/"))): null;
                        myArray.push(obj);
                    }
                    var updateData = {
                        "batchMTC": myArray
                    };
                    return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update", "POST", updateData).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        $scope.gridApi.selection.clearSelectedRows();
                        $scope.search();
                    });
                });
            };
            //反审核
            $scope.batchAntiAudit = function () {
                var rows = angular.copy($scope.gridApi.selection.getSelectedRows());
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));//判断是否选择了数据
                }
                var valiRows = rows.filter(a=>a.AUDIT_STATE == 1);
                if (valiRows.length) {
                    return Notification.error(transervice.tran(messageService.error_audit_n));//判断是否包含未审核数据
                }
                valiRows = rows.filter(a=>a.PAYMENT_STATE == 1);
                if (valiRows.length) {
                    return Notification.error(transervice.tran(messageService.error_pay_y));//判断是否包含已付款数据
                }
                return $confirm({text: transervice.tran(messageService.confirm_audit_f)}).then(function () {
                    var myArray = [];
                    for (var i = 0; i < rows.length; i++) {
                        var obj = rows[i];
                        delete obj['pu_payment_detail'];
                        obj.AUDIT_STATE = 1;
                        obj.edit_type = 2;
                        /*obj.CREATED_AT = obj.CREATED_AT ? $scope.formatDate(obj.CREATED_AT) : null;
                        obj.PAYMENT_AT = obj.PAYMENT_AT ? $scope.formatDate(obj.PAYMENT_AT) : null;
                        obj.PAID_AT = obj.PAID_AT ? $scope.formatDate(obj.PAID_AT) : null;*/
                        obj.CREATED_AT = obj.CREATED_AT ? $scope.formatDate(new Date(obj.CREATED_AT.replace(/-/g, "/"))): null;
                        obj.PAYMENT_AT = obj.PAYMENT_AT ? $scope.formatDate(new Date(obj.PAYMENT_AT.replace(/-/g, "/"))): null;
                        obj.PAID_AT = obj.PAID_AT ? $scope.formatDate(new Date(obj.PAID_AT.replace(/-/g, "/"))): null;
                        obj.AUTITO_AT = null;
                        obj.AUTITO_ID = null;
                        delete obj['autit_user'];
                        delete obj['o_organisation'];
                        delete obj['p_money'];
                        delete obj['pa_money'];
                        delete obj['pa_partner'];
                        delete obj['pa_user'];
                        delete obj['pu_payment_detail_1'];
                        myArray.push(obj);
                    }
                    var updateData = {
                        "batchMTC": myArray
                    };
                    return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update", "POST", updateData).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        $scope.search();
                    });
                });
            };

            //编辑
            $scope.edit = function (row) {
                var index = $.inArray(row, $scope.gridOptions.data);
                var ind = ($scope.gridOptions.paginationCurrentPage - 1) * $scope.gridOptions.paginationPageSize + index;
                row.poOrgList = $scope.poOrgList;
                row.searchWhere = $scope.searchWhere;
                var idList=$scope.gridOptions.data.map(d=>d.PAYMENT_ID);
                paymentRequest_edit.showDialog(row, ind, $scope.gridOptions.totalItems,idList).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.search();
                });
            }
            //新增
            $scope.add = function () {
                var model = {
                    "poOrgList": $scope.poOrgList
                }
                paymentRequest_add.showDialog(model).then(function (data) {
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.search();
                });
            };

            //模糊搜索
            $scope.search = function () {
                $scope.searchWhere = {"where": ["and", ["<>", "pu_payment.DELETED_STATE", 1], ["=", "pu_payment.AUDIT_STATE", $scope.AUDIT_STATE], ["=", "pu_payment.PAYMENT_STATE", $scope.PAYMENT_STATE]]};
                if ($scope.AUDIT_STATE.length == 0) {
                    $scope.searchWhere = {"where": ["and", ["<>", "pu_payment.DELETED_STATE", 1], ["=", "pu_payment.PAYMENT_STATE", $scope.PAYMENT_STATE]]};
                }
                if ($scope.PAYMENT_STATE.length == 0) {
                    $scope.searchWhere = {"where": ["and", ["<>", "pu_payment.DELETED_STATE", 1], ["=", "pu_payment.AUDIT_STATE", $scope.AUDIT_STATE]]};
                }
                if ($scope.AUDIT_STATE.length == 0 && $scope.PAYMENT_STATE.length == 0) {
                    $scope.searchWhere = {"where": ["<>", "pu_payment.DELETED_STATE", 1]};
                }
                if ($scope.PORGANISATION_ID.length > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push(["=", "pu_payment.PORGANISATION_ID", $scope.PORGANISATION_ID]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push(["=", "pu_payment.PORGANISATION_ID", $scope.PORGANISATION_ID]);
                    }
                }
                if ($scope.PARTNER_ID.length > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push(["=", "pu_payment.PARTNER_ID", $scope.PARTNER_ID]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push(["=", "pu_payment.PARTNER_ID", $scope.PARTNER_ID]);
                    }
                }
                var ptimeFrom = $scope.ptimeFrom ? $scope.formatDate(new Date($scope.ptimeFrom.replace(/-/g, "/"))) : "";
                if (ptimeFrom > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push([">=", "pu_payment.CREATED_AT", ptimeFrom]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push([">=", "pu_payment.CREATED_AT", ptimeFrom]);
                    }
                }
                var ptimeTo = $scope.ptimeTo ? $scope.formatDate(new Date($scope.ptimeTo.replace(/-/g, "/"))) : "";
                if (ptimeTo > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push(["<=", "pu_payment.CREATED_AT", ptimeTo]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push(["<=", "pu_payment.CREATED_AT", ptimeTo]);
                    }
                }
                var paytimeFrom = $scope.paytimeFrom ? $scope.formatDate(new Date($scope.paytimeFrom.replace(/-/g, "/"))) : "";
                if (paytimeFrom > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push([">=", "pu_payment.PAID_AT", paytimeFrom]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push([">=", "pu_payment.PAID_AT", paytimeFrom]);
                    }
                }
                var paytimeTo = $scope.paytimeTo ? $scope.formatDate(new Date($scope.paytimeTo.replace(/-/g, "/"))) : "";
                if (paytimeTo > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push(["<=", "pu_payment.PAID_AT", paytimeTo]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push(["<=", "pu_payment.PAID_AT", paytimeTo]);
                    }
                }
                if ($scope.searchCondtion && $scope.searchCondtion.length > 0) {
                    var containAnd = $scope.searchWhere.where.includes("and");
                    if(containAnd){
                        $scope.searchWhere.where.push(["like", "pu_payment.PAYMENT_CD", $scope.searchCondtion]);
                    }else{
                        $scope.searchWhere = {"where": ["and", $scope.searchWhere.where]};
                        $scope.searchWhere.where.push(["like", "pu_payment.PAYMENT_CD", $scope.searchCondtion]);
                    }
                }
                $scope.init();
                this.showMore(false);

            };

            //展开更多条件
            $scope.showMore = function (n) {
                var $this = $('.carett');
                if (n) {
                    if (!$this.hasClass('cur')) {
                        $this.addClass('cur');
                    } else {
                        $this.removeClass('cur');
                    }
                } else {
                    $this.removeClass('cur');
                }

            };

            //审核状态stateSearch
            $scope.stateSearch = function () {
                if ($scope.PAYMENT_STATE == 1) {
                    $scope.AUDIT_STATE = "2";
                }else{
                    $scope.AUDIT_STATE = ""; 
                }
            }

            //获取付款状态
            $scope.getPaymentStateName = function (value) {
                var paymentState = $scope.paymentStateList.filter(c=>c.D_VALUE == value);
                if (paymentState.length) {
                    return paymentState[0].D_NAME_CN;
                }
                return "";
            };
            //获取单据状态
            $scope.getDocStateName = function (value) {
                var docState = $scope.docStateList.filter(c=>c.D_VALUE == value);
                if (docState.length) {
                    return docState[0].D_NAME_CN;
                }
                return "";
            };


            $scope.clearAll = function () {
                $scope.gridApi.selection.clearSelectedRows();
            };

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = Math.round((object) / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };
            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }


        }]
});
