/**
 * Created by Administrator on 2017/5/31.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/gridDefaultOptionsService',
        "app/masterCenter/bchannel/controllers/partner_list_service",
        'app/common/Services/configService',
        'app/purchasingCenter/purchaseOrder/controllers/purchase_edit_service',
        'app/masterCenter/product/controllers/productSKU_edit_service',
        'app/masterCenter/product/controllers/productSKU_add_service',
        'app/common/Services/messageService'
    ],
    function (angularAMD) {

        angularAMD.service(
            'paymentRequest_edit',
            function ($q, $modal) {
                this.showDialog = function (model,index,count,idList) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "payment_edit_Ctrl",
                            backdrop: "static",
                            size:"75%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/finance/paymentRequest/views/paymentRequest_edit.html',
                            resolve: {
                                model: function () {
                                    return model;
                                },
                                index:function () {
                                    return index;
                                },
                                count:function () {
                                    return count;
                                },
                                idList:function () {
                                    return idList;
                                }
                            }
                        }).result;
                };
            }
        );

        angularAMD.controller("payment_edit_Ctrl", function ($scope, model,$confirm,partner_list_service, $filter,index,count,idList, $timeout, amHttp,configService, $q, $interval, httpService, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService,purchase_edit_service,productSKU_edit_service,messageService) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'PU_PURCHASE_CD', enableCellEdit: false,cellClass: 'unedit', displayName: transervice.tran('采购单号'), width: 150,
                        cellTemplate: '<div><a class="btn btn-link" style="padding-top: 3px;" p-link link-code="row.entity.PU_PURCHASE_CD" link-state="\'1\'">{{row.entity.PU_PURCHASE_CD}}</a></div>',
                        //cellTemplate: '<a class="btn btn-link" style="padding-top: 3px;" ng-click="grid.appScope.editPoDetail(row.entity.PU_PURCHASE_CD)">{{row.entity.PU_PURCHASE_CD}}</a>'
                    },{
                        field: 'PSKU_CODE',
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        displayName: transervice.tran('SKU'),
                        width: 120,
                        cellTemplate:'<a class="btn btn-link" style="padding-top: 3px;" sku-link="row.entity.PSKU_ID">{{row.entity.PSKU_CODE}}</a>',
                        //cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.editPorduct(row.entity.PSKU_CODE)">{{row.entity.PSKU_CODE}}</a>'
                    }, {
                        field: 'PSKU_NAME_CN',
                        enableCellEdit: false,
                        cellClass: 'unedit',
                        displayName: transervice.tran('产品名称'),
                        width: 160
                    },{
                        field: 'PURCHASE',
                        enableCellEdit: false,
                        cellClass: 'unedit_num',
                        displayName: transervice.tran('订单数量'),
                        //cellClass: "text-right",
                        width: 120
                    },{
                        field: 'RGOODS_NUMBER',
                        cellClass: 'unedit_num',
                        //cellClass: "text-right",
                        enableCellEdit: false,
                        displayName: transervice.tran('已收货数量'),
                        width: 100
                    },{
                        field: 'SMETHOD',
                        width: 120,
                        cellClass: 'unedit',
                        enableCellEdit: false,
                        displayName: transervice.tran('付款方式'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getSmethodName(row.entity.SMETHOD)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'D_VALUE',
                        editDropdownValueLabel: 'D_NAME_CN',
                        editDropdownOptionsArray: $scope.smethodList

                    }, {
                        field: 'TAX_AMOUNT',
                        enableCellEdit: false,
                        cellClass: 'unedit_num',
                        displayName: transervice.tran('订单金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.TAX_AMOUNT|number:2}}</div>',
                        width: 120
                    }, {
                        field: 'RGOODS_AMOUNT',
                        enableCellEdit: false,
                        cellClass: 'unedit_num',
                        displayName: transervice.tran('已付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.RGOODS_AMOUNT|number:2}}</div>',
                        width: 120
                    }, {
                        field: 'UNTHIS_APPLY_AMOUNT',
                        enableCellEdit: false,
                        cellClass: 'unedit_num',
                        displayName: transervice.tran('未付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.UNTHIS_APPLY_AMOUNT|number:2}}</div>',
                        width: 120
                    }, {
                        field: 'THIS_AMOUNT',
                        enableCellEdit: false,
                        cellClass: 'unedit_num',
                        displayName: transervice.tran('本次申付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.THIS_AMOUNT|number:2}}</div>',
                        width: 120
                    },
                    {
                        field: 'PAID_MONEY',
                        displayName: transervice.tran('实付金额'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right" >{{row.entity.PAID_MONEY|number:2}}</div>',
                        width: 120,
                        cellEditableCondition: function($scope){
                            //return $scope.model.AUDIT_STATE !=1;
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].AUDIT_STATE != 1;
                        },
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if(row.entity.AUDIT_STATE!=1){
                                return 'canedit_num'
                            }else{
                                return 'unedit_num'
                            }
                        }
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //编辑实付金额
                        if (colDef.field == "PAID_MONEY") {
                            rowEntity.PAID_MONEY = rowEntity.PAID_MONEY?Number(rowEntity.PAID_MONEY):0;//实付金额
                            var aa = Number(0);
                            $scope.gridOptions.data.forEach(d=>{
                                var money = d.PAID_MONEY?Number(d.PAID_MONEY):0;
                                aa += money;
                            });
                            queryRate($scope.model.PMONEY_ID,$scope.model.PAMONEY_ID).then(function(){
                                $scope.model.PAID_MONEY = ($scope.exRates&&$scope.exRates[3])?aa*$scope.exRates[3]:aa;
                            });
                            //rowEntity.RGOODS_AMOUNT = toDecimal(Number(rowEntity.RGOODS_AMOUNT) -(oldValue?Number(oldValue):0)+Number(newValue));//已付金额
                            rowEntity.UNTHIS_APPLY_AMOUNT = Number(rowEntity.TAX_AMOUNT -rowEntity.RGOODS_AMOUNT);
                        }
                    });
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            $scope.poDetailData = [];
            //分页
            $scope.gridOptions.getPage=function(pageNo,pageSize){
                $scope.gridOptions.data = getSubList($scope.poDetailData,pageNo,pageSize);
            };
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };
            $scope.docStateList = commonService.getDicList("PU_PAYMENT"); //单据状态
            $scope.paymentStateList = commonService.getDicList("PAYMENT_STATE"); //付款状态
            $scope.smethodList = commonService.getDicList("PARTNER_SMETHOD"); //结算方式
            $scope.userInfo = configService.getUserInfo();
            $scope.index=index;
            //$scope.count=count;
            if(idList)
                $scope.count=idList.length;

            $scope.init = function(){
                if(model){
                    $scope.model = angular.copy(model);
                    $scope.poOrgList = $scope.model.poOrgList;
                    //审核状态
                    $scope.model.AUDIT_STATE_NAME = getDocStateName($scope.model.AUDIT_STATE);
                    //付款状态
                    $scope.model.PAYMENT_STATE_NAME =getPaymentStateName($scope.model.PAYMENT_STATE);
                    //实付日期
                    $scope.model.PAID_AT = ($scope.model.PAID_AT!=null&&$scope.model.PAID_AT.length>0)?$scope.model.PAID_AT:null;
                    //$scope.model.PAID_AT = ($scope.model.PAID_AT!=null&&$scope.model.PAID_AT.length>0) ? ($filter("date")($scope.model.PAID_AT*1000, "yyyy-MM-dd")) : null;
                    if($scope.model.AUDIT_STATE==2 && $scope.model.PAID_AT==null){
                        $scope.model.PAID_AT = $filter("date")((new Date().valueOf()), "yyyy-MM-dd");
                    }
                    if($scope.model.AUDIT_STATE==1){
                        //实付币种
                        $scope.model.PAMONEY_ID ="";
                        //实付金额
                        $scope.model.PAID_MONEY = 0;
                    }
                    if($scope.model.AUDIT_STATE==2 && $scope.model.PAYMENT_STATE!=1){
                        //实付币种
                        $scope.model.PAMONEY_ID = $scope.model.PMONEY_ID;
                        //实付金额
                        $scope.model.PAID_MONEY = $scope.model.PAYMENT_NUMBER;
                    }
                    if($scope.model.PAYMENT_STATE ==1){
                        //实付币种
                        $scope.model.PAMONEY_ID = $scope.model.PAMONEY_ID;
                        //实付金额
                        $scope.model.PAID_MONEY = $scope.model.PAID_MONEY;
                    }

                    /*//实付币种
                    $scope.model.PAMONEY_ID = $scope.model.PAMONEY_ID?$scope.model.PAMONEY_ID:$scope.model.PMONEY_ID;
                    //实付金额
                    $scope.model.PAID_MONEY = (Number($scope.model.PAID_MONEY)>0&&Number($scope.model.PAYMENT_NUMBER)>0)?$scope.model.PAID_MONEY:$scope.model.PAYMENT_NUMBER;
                    */$scope.model.confirm = $scope.model.PAYMENT_STATE == 0?1:4;
                    //所有币种
                    var selectWhere = {"where": ["=", "MONEY_STATE", 1]};
                    httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(function (result) {
                        $scope.moneyList = result.data;
                    });
                    if($scope.model.pu_payment_detail_1.length>0){
                        var data = angular.copy($scope.model.pu_payment_detail_1);
                        getPoDetail(data);
                    }
                    $scope.copyData = angular.copy($scope.model);
                }
            };
            $scope.init();
            function getPoDetail(data){
                var gridData = [];
                var paidMoney = Number(0);
                var pdMoney = Number(0);
                data.forEach(d=>{
                    if(d.pu_purchase_detail_1 && d.pu_purchase_detail_1.pu_purchase_1){
                        var poOrderDetail = angular.copy(d.pu_purchase_detail_1);
                        var poOrder = angular.copy(d.pu_purchase_detail_1.pu_purchase_1);
                        delete d['pu_purchase_detail_1'];
                        d.PURCHASE_DETAIL_ID = poOrderDetail.PURCHASE_DETAIL_ID;
                        //金额
                        d.TAX_AMOUNT = poOrderDetail.TAX_AMOUNT;
                        d.PU_PLAN_ID = poOrderDetail.PU_PLAN_ID;
                        d.PSKU_ID = poOrderDetail.PSKU_ID;
                        d.PSKU_CODE = poOrderDetail.PSKU_CODE;
                        d.PSKU_NAME_CN = poOrderDetail.PSKU_NAME_CN;
                        //已收货数量
                        d.RGOODS_NUMBER = poOrderDetail.RGOODS_NUMBER;
                        //数量
                        d.PURCHASE = +poOrderDetail.PURCHASE;
                        //含税单价
                        d.TAX_UNITPRICE = +poOrderDetail.TAX_UNITPRICE;
                        //不含税单价
                        d.NOT_TAX_UNITPRICE = +poOrderDetail.NOT_TAX_UNITPRICE;
                        //税率
                        d.TAX_RATE = +poOrderDetail.TAX_RATE;
                        //结算方式
                        d.SMETHOD = poOrder&&poOrder.SMETHOD?poOrder.SMETHOD:null;
                        //已付款金额
                        d.RGOODS_AMOUNT = +poOrderDetail.RGOODS_AMOUNT;
                        //未付款金额
                        d.UNTHIS_APPLY_AMOUNT = Number(d.TAX_AMOUNT)-Number(d.RGOODS_AMOUNT);
                        //本次申付金额
                        d.THIS_AMOUNT = (+d.THIS_AMOUNT);
                        //实付金额
                        d.PAID_MONEY = $scope.model.AUDIT_STATE!=1?(+d.THIS_AMOUNT):0;
                        d.PAID_MONEY = $scope.model.PAYMENT_STATE!=0?d.RGOODS_AMOUNT:d.PAID_MONEY;
                        //控制实付金额列编辑状态
                        d.AUDIT_STATE = $scope.model.PAYMENT_STATE==1?1:$scope.model.AUDIT_STATE;
                        paidMoney += Number(d.RGOODS_AMOUNT);
                        pdMoney +=Number(d.PAID_MONEY);
                        d.PU_PURCHASE_ID = poOrder.PU_PURCHASE_ID;
                        gridData.push(d);
                    }else{
                        paidMoney = $scope.model.PAID_MONEY;
                        pdMoney = $scope.model.PAID_MONEY;
                    }

                });
                //表外实付金额
                //$scope.model.PAID_MONEY = paidMoney!=0?toDecimal(paidMoney):$scope.model.PAYMENT_NUMBER;
                if(!$scope.model.PAID_MONEY){
                    $scope.model.PAID_MONEY = $scope.model.PAYMENT_STATE!=0?paidMoney:pdMoney;
                }
                $scope.poDetailData = gridData;
                $scope.gridOptions.getPage($scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                $scope.gridOptions.totalItems = gridData.length;
                $scope.gridDatas = angular.copy($scope.gridOptions.data);

               // $scope.gridOptions.data = gridData;
            }
            //保存
            $scope.save = function(){
                if($scope.model.PORGANISATION_ID==null ||$scope.model.PORGANISATION_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入组织'));
                }
                if(model.pa_partner.PARTNER_NAME_CN==null ||model.pa_partner.PARTNER_NAME_CN.length<=0 ){
                    return Notification.error(transervice.tran('请输入供应商'));
                }
                if($scope.model.PMONEY_ID==null ||$scope.model.PMONEY_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入申付币种'));
                }
                if($scope.model.PAYMENT_NUMBER==null ||$scope.model.PAYMENT_NUMBER.length<=0 ||$scope.model.PAYMENT_NUMBER==0 ){
                    return Notification.error(transervice.tran('请输入申付金额且申付金额必须大于0'));
                }
                if($scope.model.PAYMENT_AT==null ||$scope.model.PAYMENT_AT.length<=0 ){
                    return Notification.error(transervice.tran('请输入预计付款日期'));
                }
                var poOrder = [];
                if($scope.gridOptions.data && $scope.gridOptions.data.length>0){
                    var paidMoney = Number(0);
                    var pdMoney = Number(0);
                    $scope.gridOptions.data.forEach(d=>{
                        paidMoney += Number(d.THIS_AMOUNT);
                        var data = poOrder.length?poOrder.filter(v=>v.PU_PURCHASE_ID == d.PU_PURCHASE_ID):[];
                        if(data.length==0){
                            poOrder.push({
                                "PU_PURCHASE_ID": d.PU_PURCHASE_ID,
                                "PURCHASE_DETAIL_ID": d.PURCHASE_DETAIL_ID
                            });
                        }
                    });
                    $scope.model.PAYMENT_NUMBER = paidMoney;
                }
                var data = {
                    "PAYMENT_ID":$scope.model.PAYMENT_ID,
                    "PAYMENT_CD":$scope.model.PAYMENT_CD,
                    "EXCHANGERATE":($scope.exchangeRates&&$scope.exchangeRates[3])?$scope.exchangeRates[3]:1,
                    "PORGANISATION_ID":$scope.model.PORGANISATION_ID,
                    "PAYMENT_NUMBER":$scope.model.PAYMENT_NUMBER,
                    "PARTNER_ID":$scope.model.PARTNER_ID,
                    "PMONEY_ID":$scope.model.PMONEY_ID,
                    "PAYMENT_AT":$scope.formatDate(new Date($scope.model.PAYMENT_AT.replace(/-/g, "/"))),
                    "PAYMENT_REMARKS":$scope.model.PAYMENT_REMARKS,
                    "poOrder":poOrder
                };
                return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update?id="+$scope.model.PAYMENT_ID, "POST",data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $scope.copyData = angular.copy($scope.model);
                    $scope.gridDatas = angular.copy($scope.gridOptions.data);
                    $modalInstance.close($scope.model);//返回数据
                })
            };

            //审核
            $scope.audit = function(){
                if($scope.model.PORGANISATION_ID==null ||$scope.model.PORGANISATION_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入组织'));
                }
                if(model.pa_partner.PARTNER_NAME_CN==null ||model.pa_partner.PARTNER_NAME_CN.length<=0 ){
                    return Notification.error(transervice.tran('请输入供应商'));
                }
                if($scope.model.PMONEY_ID==null ||$scope.model.PMONEY_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入申付币种'));
                }
                if($scope.model.PAYMENT_NUMBER==null ||$scope.model.PAYMENT_NUMBER.length<=0 ||$scope.model.PAYMENT_NUMBER==0){
                    return Notification.error(transervice.tran('请输入申付金额且申付金额必须大于0'));
                }
                if($scope.model.PAYMENT_AT==null ||$scope.model.PAYMENT_AT.length<=0 ){
                    return Notification.error(transervice.tran('请输入预计付款日期'));
                }
                $confirm({ text: transervice.tran(messageService.confirm_audit)}).then(function(){
                    var poOrder = [];
                    if($scope.gridOptions.data && $scope.gridOptions.data.length>0){
                        var paidMoney = Number(0);
                        $scope.gridOptions.data.forEach(d=>{
                            paidMoney += Number(d.THIS_AMOUNT);
                            var data = poOrder.length?poOrder.filter(v=>v.PU_PURCHASE_ID == d.PU_PURCHASE_ID):[];
                            if(data.length==0){
                                poOrder.push({
                                    "PU_PURCHASE_ID": d.PU_PURCHASE_ID,
                                    "PURCHASE_DETAIL_ID": d.PURCHASE_DETAIL_ID
                                });
                            }
                        });
                        $scope.model.PAYMENT_NUMBER = paidMoney;
                    }
                    var data ={
                        "edit_type":1,
                        "PAYMENT_ID":$scope.model.PAYMENT_ID,
                        "EXCHANGERATE":($scope.exchangeRates&&$scope.exchangeRates[3])?$scope.exchangeRates[3]:1,
                        "PORGANISATION_ID":$scope.model.PORGANISATION_ID,
                        "PAYMENT_NUMBER":$scope.model.PAYMENT_NUMBER,
                        "PARTNER_ID":$scope.model.PARTNER_ID,
                        "PMONEY_ID":$scope.model.PMONEY_ID,
                        "PAYMENT_AT":$scope.formatDate(new Date($scope.model.PAYMENT_AT.replace(/-/g, "/"))),
                        "PAYMENT_REMARKS":$scope.model.PAYMENT_REMARKS,
                        "AUDIT_STATE":"2",     //审核状态修改为已审核（1未审核，2已审核）
                        "poOrder":poOrder
                    };
                    var gridData = angular.copy($scope.gridOptions.data);
                    return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update?id="+$scope.model.PAYMENT_ID, "POST", data).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        $scope.model.AUDIT_STATE = result.data.AUDIT_STATE;
                        //审核人
                        $scope.model.autit_user = $scope.userInfo;
                        /*$scope.model.AUTITOR = $scope.userInfo.USER_INFO_CODE;
                         $scope.model.AUTITOR_NAME_CN = $scope.userInfo.USERNAME;*/
                        $scope.model.AUTITO_AT =  $filter("date")((new Date().valueOf()), "yyyy-MM-dd");
                        $scope.model.PAID_AT = $scope.model.PAYMENT_AT;
                        $scope.model.AUDIT_STATE_NAME = getDocStateName($scope.model.AUDIT_STATE);
                        //实付金额
                        var paidMoney = Number(0);
                        if(gridData &&gridData.length>0){
                            gridData.forEach(d=>{
                                d.AUDIT_STATE = 2;
                                d.PAID_MONEY = d.THIS_AMOUNT;
                                paidMoney += Number(d.THIS_AMOUNT);
                            })
                        }
                        $scope.model.PAID_MONEY = (gridData&&gridData.length>0)?paidMoney:$scope.model.PAYMENT_NUMBER;
                        $scope.model.PAMONEY_ID = $scope.model.PMONEY_ID;
                        $scope.gridOptions.data = gridData;
                        $scope.model.confirm = 1;
                        $scope.copyData = angular.copy($scope.model);
                        $scope.gridDatas = angular.copy($scope.gridOptions.data);
                        $scope.exchangeRates = null;
                    });
                })
            };
            //反审核
            $scope.antiAudit = function(){
                var data = {
                    "edit_type":2,
                    "AUDIT_STATE":"1",
                    "PAYMENT_ID": $scope.model.PAYMENT_ID,
                    "PORGANISATION_ID": $scope.model.PORGANISATION_ID,
                    "PAYMENT_AT": $scope.formatDate(new Date($scope.model.PAYMENT_AT.replace(/-/g, "/"))),
                    "AUTITO_ID":null,
                    "AUTITO_AT":null
                };
                var gridData = angular.copy($scope.gridOptions.data);
                return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update?id="+$scope.model.PAYMENT_ID, "POST", data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $scope.model.poOrgList =  $scope.poOrgList;
                    $scope.model.AUDIT_STATE = result.data.AUDIT_STATE;
                    $scope.model.AUDIT_STATE_NAME = getDocStateName($scope.model.AUDIT_STATE);
                    //审核人
                    $scope.model.autit_user = null;
                    //审核日期
                    $scope.model.AUTITO_AT = null;
                    $scope.model.PAID_MONEY = $scope.model.PAYMENT_NUMBER;
                    $scope.model.PAMONEY_ID = "";
                    $scope.model.PAID_AT ="";
                    if(gridData &&gridData.length>0) {
                        gridData.forEach(d=> {
                            d.PAID_MONEY = Number(0);
                            d.AUDIT_STATE = 1;
                        });
                        $scope.model.PAID_MONEY = 0;
                    }

                    $scope.gridOptions.data = gridData;
                    $scope.model.confirm = 1;
                    $scope.copyData = angular.copy($scope.model);
                    $scope.gridDatas = angular.copy($scope.gridOptions.data);

                });
            };

            //确认付款
            $scope.confirmPayment = function(){
                if($scope.model.PAID_MONEY==null ||$scope.model.PAID_MONEY.length<=0 ||$scope.model.PAID_MONEY==0){
                    return Notification.error(transervice.tran('请输入实付金额且实付金额必须大于0'));
                }
                if($scope.model.PAMONEY_ID==null ||$scope.model.PAMONEY_ID.length<=0 ){
                    return Notification.error(transervice.tran('请输入实付币种'));
                }
                var gridData = angular.copy($scope.gridOptions.data);
                var updateGridData = [];
                var paidMoney = Number(0);
                if(gridData && gridData.length>0){
                    gridData.forEach(d=>{
                        paidMoney += Number(d.PAID_MONEY);
                        updateGridData.push({
                            "PAYMENT_DETAIL_ID": d.PAYMENT_DETAIL_ID,
                            "PURCHASE_DETAIL_ID": d.PURCHASE_DETAIL_ID,
                            "THIS_PAID_AMOUNT":  d.PAID_MONEY
                        });
                    });
                    if( $scope.exchangeRates&&$scope.exchangeRates[3]){
                        paidMoney = toDecimal(paidMoney* $scope.exchangeRates[3]);
                    }
                }else{
                    paidMoney = $scope.model.PAID_MONEY;
                }
                if(gridData && paidMoney!= $scope.model.PAID_MONEY) {
                    $confirm({text: transervice.tran(messageService.error_payment_notEquals)}).then(function () {
                        $scope.model.PAID_MONEY = paidMoney;
                        var updateData = {
                            "edit_type": 3,
                            "PAYMENT_STATE": 1,
                            "EXCHANGERATE":(($scope.model.PMONEY_ID!=$scope.model.PAMONEY_ID) && $scope.exchangeRates)?$scope.exchangeRates[3]:1,
                            "PAYMENT_ID": $scope.model.PAYMENT_ID,
                            "PAMONEY_ID": $scope.model.PAMONEY_ID,
                            "PAID_MONEY": $scope.model.PAID_MONEY,
                            "PAID_AT": $scope.formatDate(new Date($scope.model.PAID_AT.replace(/-/g, "/"))),
                            "PAYMENT_REMARKS": $scope.model.PAYMENT_REMARKS,
                            "pu_payment_detail": updateGridData
                        };
                        return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update?id=" + $scope.model.PAYMENT_ID, "POST", updateData).then(function (result) {
                            Notification.success(transervice.tran(result.message));
                            //$scope.model.PAID_AT = $filter("date")((new Date().valueOf()), "yyyy-MM-dd");
                            $scope.model.PAYMENT_STATE = result.data.PAYMENT_STATE.toString();
                            $scope.model.confirm = 2;
                            gridData.forEach(d=> {
                                d.AUDIT_STATE = 1;
                            });
                            gridData.forEach(d=> {
                                d.RGOODS_AMOUNT = Number(d.RGOODS_AMOUNT) + Number(d.PAID_MONEY);
                                d.UNTHIS_APPLY_AMOUNT = Number(d.TAX_AMOUNT) - Number(d.RGOODS_AMOUNT);
                            });
                            $scope.gridOptions.data = gridData;
                            $modalInstance.close($scope.model);//返回数据
                        })
                    })
                }else{
                    $scope.model.PAID_MONEY = paidMoney;
                    var updateData = {
                        "edit_type": 3,
                        "PAYMENT_STATE": 1,
                        "EXCHANGERATE":$scope.exchangeRates?$scope.exchangeRates[3]:1,
                        "PAYMENT_ID": $scope.model.PAYMENT_ID,
                        "PAMONEY_ID": $scope.model.PAMONEY_ID,
                        "PAID_MONEY": $scope.model.PAID_MONEY,
                        "PAID_AT": $scope.formatDate(new Date($scope.model.PAID_AT.replace(/-/g, "/"))),
                        "PAYMENT_REMARKS": $scope.model.PAYMENT_REMARKS,
                        "pu_payment_detail": updateGridData
                    };
                    return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update?id=" + $scope.model.PAYMENT_ID, "POST", updateData).then(function (result) {
                        Notification.success(transervice.tran(result.message));
                        $scope.model.PAID_AT = $filter("date")((new Date().valueOf()), "yyyy-MM-dd");
                        $scope.model.PAYMENT_STATE = result.data.PAYMENT_STATE.toString();
                        $scope.model.confirm = 2;
                        (gridData&&gridData.length)&&gridData.forEach(d=> {
                            d.AUDIT_STATE = 1;
                            d.RGOODS_AMOUNT = Number(d.RGOODS_AMOUNT) + Number(d.PAID_MONEY);
                            d.UNTHIS_APPLY_AMOUNT = Number(d.TAX_AMOUNT) - Number(d.RGOODS_AMOUNT);
                        });
                        $scope.gridOptions.data = gridData;
                        $modalInstance.close($scope.model);//返回数据
                    })
                }
            };

            //修改确认付款
            $scope.modifyPayment = function(){
                var gridData = angular.copy($scope.gridOptions.data);
                var updateGridData = [];
                if(gridData && gridData.length>0){
                    gridData.forEach(d=>{
                        updateGridData.push({
                            "PAYMENT_DETAIL_ID": d.PAYMENT_DETAIL_ID,
                            "PURCHASE_DETAIL_ID": d.PURCHASE_DETAIL_ID,
                            "THIS_PAID_AMOUNT": d.PAID_MONEY
                        });
                    });
                }
                var updateData ={
                    "edit_type":4,
                    "PAYMENT_STATE":0,
                    "PAYMENT_ID":$scope.model.PAYMENT_ID,
                    "PAMONEY_ID": null,
                    "PAID_MONEY": $scope.model.PAID_MONEY,
                    "PAID_AT":$scope.formatDate(new Date($scope.model.PAID_AT.replace(/-/g, "/"))),
                    "PAYMENT_REMARKS": $scope.model.PAYMENT_REMARKS,
                    "pu_payment_detail":updateGridData
                };
                return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "update?id="+$scope.model.PAYMENT_ID, "POST", updateData).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    //付款状态
                    $scope.model.PAYMENT_STATE = result.data.PAYMENT_STATE.toString();
                    //实付币种
                    $scope.model.PAMONEY_ID = $scope.model.PAMONEY_ID?$scope.model.PAMONEY_ID:$scope.model.PMONEY_ID;
                    //实付日期
                    $scope.model.PAID_AT = $scope.model.PAYMENT_AT;
                    $scope.model.confirm = 1;
                    var paidMoney = Number(0);
                    if(gridData && gridData.length>0){
                        gridData.forEach(d=>{
                            d.RGOODS_AMOUNT = Number(d.RGOODS_AMOUNT)- Number(d.PAID_MONEY);
                            d.UNTHIS_APPLY_AMOUNT = Number(d.TAX_AMOUNT) - Number(d.RGOODS_AMOUNT);
                            d.PAID_MONEY = d.THIS_AMOUNT;
                            paidMoney += Number(d.PAID_MONEY);
                            d.AUDIT_STATE = 2;
                        });
                        $scope.gridOptions.data = gridData;
                    }
                    //实付金额
                    $scope.model.PAID_MONEY = $scope.gridOptions.data.length>0?paidMoney:$scope.model.PAYMENT_NUMBER;
                })
            };

            //currencyString:当前币种字符串 account:待转币种对应金额字符串 currencyCode:当前币种编码
            $scope.exchangeRate = function(currencyString,account,currencyCode){
                $scope.exchangeRates = null;
                var currency = $scope.copyData[currencyString];
                var orderTime = $scope.formatDate(new Date($scope.model.CREATED_AT.replace(/-/g, "/")));
                var data = [];
                data[0]=[currency,currencyCode,orderTime];
                if(currency == currencyCode || $scope.model.PAMONEY_ID == $scope.model.PMONEY_ID){
                    $scope.model[account] = $scope.copyData[account];
                    if(currencyString == 'PMONEY_ID'){
                        $scope.gridOptions.data = $.extend(true,[],$scope.gridDatas);
                        var paidMoney = 0;
                        var thisAmonut = 0
                        $scope.gridOptions.data && $scope.gridOptions.data.forEach(d=>{
                            var PAID_MONEY = d.PAID_MONEY?d.PAID_MONEY:0;
                            paidMoney +=PAID_MONEY;
                            thisAmonut +=d.THIS_AMOUNT;
                        });
                        $scope.model.PAMONEY_ID = $scope.model.PMONEY_ID;
                        if($scope.gridOptions.data.length){
                            $scope.model.PAID_MONEY = $scope.model.AUDIT_STATE==1?thisAmonut:paidMoney;
                        }else{
                            $scope.model.PAID_MONEY = $scope.model.PAYMENT_NUMBER;
                        }
                   }
                    if(currencyString == 'PAMONEY_ID'){
                        $scope.model.PAID_MONEY = $scope.model.PAYMENT_NUMBER;
                    }
                }else{
                    httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", data).then(function (result) {
                        $scope.exchangeRates =  result.data[0];
                        if(!$scope.exchangeRates[3]){
                            $scope.model[currencyString] = $scope.exchangeRates[0];
                            $scope.model[account] = $scope.copyData[account];
                            if(currencyString == 'PMONEY_ID'){
                                //$scope.gridOptions.data = $scope.gridDatas;
                                $scope.gridOptions.data = $.extend(true,[],$scope.gridDatas);
                            }
                            return Notification.error(transervice.tran('无对应币种兑换汇率'));
                        }
                        //$scope.model[account] = $scope.model[account] * (+$scope.exchangeRates[3]);
                        var paidMoney = 0;
                        $scope.gridOptions.data && $scope.gridOptions.data.forEach(d=>{
                            var PAID_MONEY = d.PAID_MONEY?d.PAID_MONEY* (+$scope.exchangeRates[3]):0;
                            paidMoney +=PAID_MONEY;
                        });
                        if(currencyString == 'PMONEY_ID'){
                            var thisAmonut = 0;
                            $scope.gridOptions.data && $scope.gridOptions.data.forEach(d=>{
                                d.TAX_UNITPRICE = toDecimal(d.TAX_UNITPRICE* (+$scope.exchangeRates[3]));             //含税单价
                                d.NOT_TAX_UNITPRICE = toDecimal((+d.TAX_UNITPRICE)/(1+d.TAX_RATE));    //不含税单价
                                d.NOT_TAX_AMOUNT = (+d.NOT_TAX_UNITPRICE) * d.PURCHASE;              //不含税金额
                                d.TAX_AMOUNT = toDecimal((+d.TAX_UNITPRICE) *d.PURCHASE);                       //订单金额
                                d.RGOODS_AMOUNT = toDecimal(d.RGOODS_AMOUNT* (+$scope.exchangeRates[3]));           //已付金额
                                d.UNTHIS_APPLY_AMOUNT = d.TAX_AMOUNT - d.RGOODS_AMOUNT;                 //未付金额
                                d.THIS_AMOUNT = d.THIS_AMOUNT* (+$scope.exchangeRates[3]);
                                thisAmonut +=d.THIS_AMOUNT;//本次申付金额
                                d.PAID_MONEY = d.PAID_MONEY?d.PAID_MONEY* (+$scope.exchangeRates[3]):0;  //实付金额
                                paidMoney +=d.PAID_MONEY;
                            });
                            $scope.model.PAMONEY_ID = $scope.model.PMONEY_ID;
                            $scope.model.PAYMENT_NUMBER = thisAmonut>0?toDecimal(thisAmonut):$scope.model.PAYMENT_NUMBER* (+$scope.exchangeRates[3]);
                            if(thisAmonut==0&&paidMoney==0){
                                $scope.model.PAID_MONEY = $scope.model.PAYMENT_NUMBER;
                            }else{
                                $scope.model.PAID_MONEY = $scope.model.AUDIT_STATE==1?toDecimal(thisAmonut):toDecimal(paidMoney);
                            }
                        }
                        if(currencyString == 'PAMONEY_ID'){
                            $scope.model.PAID_MONEY = toDecimal($scope.model[account] * (+$scope.exchangeRates[3]));
                        }
                    });
                }
             };

            function queryRate(currency,currencyTo){
                var orderTime = $scope.formatDate(new Date($scope.model.CREATED_AT.replace(/-/g, "/")));
                var data = [];
                data[0]=[currency,currencyTo,orderTime];
                return httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "getexchangerate", "POST", data).then(function (result) {
                    $scope.exRates = result.data[0];
                    if (!$scope.exRates[3]) {
                        return Notification.error(transervice.tran('无对应币种兑换汇率'));
                    }
                })
            }

            function getSubList(datas,pageNo,pageSize){
                datas=[].concat(datas);
                var from=(pageNo-1)*pageSize;
                var to=from+pageSize;
                if(datas.size<(to+1)){
                    return datas.splice(from);
                }
                return datas.splice(from,pageSize);
            }


            //首单
            $scope.firstPage=function () {
                turnPageQuery(0).then(function () {
                    $scope.index=0;
                })
            };
            //上一单
            $scope.prePage=function () {
                turnPageQuery($scope.index-1).then(function () {
                    $scope.index-=1;
                })
            };

            //下一单
            $scope.nextPage=function () {
                turnPageQuery($scope.index+1).then(function () {
                    $scope.index+=1;
                })

            };

            //尾单
            $scope.lastPage=function () {
                turnPageQuery($scope.count-1).then(function () {
                    $scope.index=$scope.count-1;
                })
            };
            //翻单查询
            function turnPageQuery(offset) {
                var selectWhere = {};
                if($scope.model.searchWhere){
                    selectWhere =  $scope.model.searchWhere;
                }else{
                    selectWhere.where=["<>", "pu_payment.DELETED_STATE", 1];
                }
                selectWhere.joinwith = ["o_organisation","p_money","pa_money","pa_partner","pu_payment_detail_1","pa_user","autit_user"];
                selectWhere.distinct = true;
                return httpService.httpHelper(httpService.webApi.api, "purchase/payment", "view?id="+idList[offset], "POST",selectWhere).then(
                    function (result){
                        $scope.model = result.data;
                        $scope.model.CREATED_AT = $scope.model.CREATED_AT ? ($filter("date")($scope.model.CREATED_AT*1000, "yyyy-MM-dd")):null;
                        $scope.model.PAYMENT_AT = $scope.model.PAYMENT_AT != null ? ($filter("date")($scope.model.PAYMENT_AT*1000, "yyyy-MM-dd")) : null;
                        $scope.model.AUTITO_AT = $scope.model.AUTITO_AT != null ? ($filter("date")($scope.model.AUTITO_AT*1000, "yyyy-MM-dd")) : null;
                        $scope.model.PAID_AT = $scope.model.PAID_AT != null ? ($filter("date")($scope.model.PAID_AT*1000, "yyyy-MM-dd")) : null;
                        $scope.model.poOrgList = $scope.poOrgList;
                        $scope.model.APPLICANT_CODE_NAME = $scope.model.pa_user&&$scope.model.pa_user.u_staffinfo?$scope.model.pa_user.u_staffinfo.STAFF_NAME_CN:null;
                        $scope.model.AUDIT_STATE_NAME = getDocStateName($scope.model.AUDIT_STATE);
                        $scope.model.AUTITOR_NAME_CN = ($scope.model.autit_user&&$scope.model.autit_user.u_staffinfo2)?$scope.model.autit_user.u_staffinfo2.STAFF_NAME_CN:null;
                        $scope.model.moneyList = $scope.moneyList;
                        $scope.model.confirm = $scope.model.PAYMENT_STATE == 0?1:4;
                        $scope.model.PAMONEY_ID = $scope.model.PAMONEY_ID?$scope.model.PAMONEY_ID:$scope.model.PMONEY_ID;
                        var data = angular.copy($scope.model.pu_payment_detail_1);
                        getPoDetail(data);
                    }
                );
            }


            //选择供应商
            $scope.selectSupplier=function () {
                partner_list_service.showDialog([]).then(function (data) {
                    $scope.model.pa_partner=data;
                    $scope.model.PARTNER_ID=data.PARTNER_ID;
                    $scope.model.PARTER_NAME_CN=data.PARTNER_NAME_CN;
                })

                /*selectSupplier_service.showDialog([]).then(function (data) {
                    $scope.model.pa_partner=data;
                    $scope.model.PARTNER_ID=data.PARTNER_ID;
                    $scope.model.PARTER_NAME_CN=data.PARTNER_NAME_CN;
                })*/
            };

            //结算方式名称
            $scope.getSmethodName = function(value){
                var planType = $scope.smethodList.filter(t=>t.D_VALUE == value);
                if(planType.length){
                    return planType[0].name;
                }
                return "";
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close($scope.model);//返回数据
                //$modalInstance.dismiss(false);
            };
            //获取付款状态
             function getPaymentStateName(value) {
                var paymentState = $scope.paymentStateList.filter(c=>c.D_VALUE == value);
                if(paymentState.length){
                    return paymentState[0].D_NAME_CN;
                }
                return "";
            }
            //获取单据状态
            function getDocStateName(value) {
                var docState=$scope.docStateList.filter(c=>c.D_VALUE==value);
                if(docState.length){
                    return docState[0].D_NAME_CN;
                }
                return "";
            }
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
            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x*100)/100;
                var s = f.toString();
                var rs = s.indexOf('.');
                if (rs < 0) {
                    rs = s.length;
                    s += '.';
                }
                while (s.length <= rs + 2) {
                    s += '0';
                }
                return s;
            }

        });
    });