define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
    'app/common/directives/singleSelectDirt',

], function () {
    return   function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,messageService,configService) {

        //是否紧急状态
        $scope.urgents=commonService.getDicList("URGENT_ORDER");


        //运输方式
        $scope.transports=commonService.getDicList("TRANSPORTS");
        $scope.transports_search=[{D_VALUE:"",D_NAME_CN:'全部'}].concat($scope.transports);

        //获取质检状态
        $scope.inspectionStates=commonService.getDicList("INSPECTION_STATE");

        //获取发运单状态
        $scope.dispatchStates=[{D_VALUE:"",D_NAME_CN:'全部'}].concat(commonService.getDicList("PU_DISPATCH_NOTE"));

        //初始化搜索条件
        $scope.searchConditions={
            search:"",
            PLAN_STATE:"1",
            TRANSPORT_MODE:"",
            ORGANISATION_ID:'',
            p_shipm_time_start:'',
            p_shipm_time_end:'',
            a_shipm_time_start:'',
            a_shipm_time_end:'',
        }

        //亚马逊尺寸
        $scope.amazonSizes=commonService.getDicList("PRODUCT_SKU");

        $scope.rowEntity = {fnkSkus:[],moneys:[],organizations:[]};

        //获取货币种类
        (function () {
            var selectWhere = {limit:"0"};

            httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(function (datas) {
                $scope.moneys=datas.data;
                $scope.rowEntity.moneys=datas.data;

            })
        })();

        //获取汇率
        (function () {

            var dateTimes=new Date($filter("date")(new Date(),'yyyy-MM-dd')).getTime()/1000;
            var search={
                where:["=","EXCHANGE_RATE_STATE",1],
                andwhere:["and",["<=","EFFECTIVE_START_DATE",dateTimes],[">=",'EFFECTIVE_END_DATE',dateTimes]]
            }
            httpService.httpHelper(httpService.webApi.api, "master/basics/exchanger", "index", "POST", search).then(function (datas) {
                $scope.exchangeRates=datas.data;

            })
        })();



        // 获取需求组织
        (function () {
            // var dataSearch = {
            //     "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
            //     "joinwith":["o_organisationt"]
            // };
            //
            // httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
            //     $scope.rowEntity.organizations=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
            //     $scope.organizations=$scope.rowEntity.organizations;
            //
            //     //搜索组织下拉框
            //     $scope.organizations_search=[{ORGANISATION_CODE:"",ORGANISATION_NAME_CN:"全部"}].concat($scope.organizations)
            //
            // });

            configService.getOrganisationList([4]).then(function (datas) {
                $scope.rowEntity.organizations=datas;
                $scope.organizations=$scope.rowEntity.organizations;

                //搜索组织下拉框
                $scope.organizations_search=[{ORGANISATION_ID:"",ORGANISATION_NAME_CN:"全部"}].concat($scope.organizations)
            })

        })();


        $scope.skuOptions = {
            autoBind: true,
            dataTextField: "PSKU_CODE",
            dataValueField: "PSKU_ID",
            url: httpService.webApi.api + "/master/product/prodsku/index",
            search: {
                where: ["and", ["=", "g_product_sku.PSKU_STATE", 1]],
                joinwith: ['b_unit', 'g_product_sku_fnsku', 'g_product_sku_price', 'g_product_sku_packing'],
                distinct: 1,
            },
            o_change: $scope.selectRowChange
        }

        $scope.selectRowChange= function (row) {
            // $scope.gridApi.core.getVisibleRows()
            if (row) {
                row.isDirty = true;
                row.isError = true;
                $scope.gridOptions.gridApi.grid.refresh();

                var selectModel= row.selectModel;
                row.entity.DEMANDSKU_ID=selectModel.PSKU_ID;
                row.entity.DEMANDSKU_CODE=selectModel.PSKU_CODE;
                row.entity.PSKU_NAME_CN=selectModel.PSKU_NAME_CN;

                //初始化平台条形码
                if(selectModel.g_product_sku_fnsku&&selectModel.g_product_sku_fnsku.length){
                    row.entity.rowEntity.fnkSkus=selectModel.g_product_sku_fnsku;
                    var dfaultFnskus=selectModel.g_product_sku_fnsku.filter(g=>g.DEFAULTS==1);

                    if(dfaultFnskus&&dfaultFnskus.length){
                        var def=dfaultFnskus[0];
                        row.entity.FNSKU=def.FNSKU;
                    }
                }else{
                    row.entity.rowEntity.fnkSkus=[];
                    row.entity.FNSKU="";
                }

            }
        }
        $scope.skuOptions.o_change=$scope.selectRowChange;


        // 设置样式函数
        function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
            var entity=row.entity;
            // if(!row.entity.copyModel){
            //     row.entity.copyModel=angular.copy(row.entity);
            // }
            // var name=col.colDef.name;
            // if(entity[name]!=entity.copyModel[name]){
            //     row.grid.api.rowEdit.setRowsDirty([entity]);
            // }
            var classStr='';
            if(entity.URGENT_ORDER==1){
                classStr+="color-red ";
            }
            if(entity.PLAN_STATE==2){
                classStr+="noEdit-color ";
            }
            return classStr;

        }

        //表格配置
        $scope.gridOptions= {
            columnDefs: [
                {
                    field: 'ORGANISATION_ID',
                    displayName: transervice.tran('需求组织'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color " >{{grid.appScope.getOrganizationName(row.entity.ORGANISATION_ID)}}</div>',
                    width:150,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'CHANNEL_NAME_CN',
                    displayName: transervice.tran('平台'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.CHANNEL_NAME_CN}}</div>',
                    width:150,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'WAREHOUSE_NAME',
                    displayName: transervice.tran('目的仓'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.WAREHOUSE_NAME_CN}}</div>',
                    width:150,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'TRANSPORT_MODE',
                    displayName: transervice.tran('*运输方式'),
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'D_VALUE',
                    editDropdownValueLabel: 'D_NAME_CN',
                    editDropdownOptionsArray: $scope.transports,
                    width:100,
                    cellTemplate:'<div class="ui-grid-cell-contents " ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{grid.appScope.getStateName(grid.appScope.transports,row.entity.TRANSPORT_MODE)}}</div>',

                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {   field: 'PlAN_SHIPMENT_AT',
                    displayName: transervice.tran('计划发运日期'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{row.entity.PlAN_SHIPMENT_AT}}</div>',
                    width:120,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'KUKAI_NUMBER',
                    displayName: transervice.tran('*空运次数'),
                    width:100,
                    cellTemplate:'<div class="ui-grid-cell-contents " ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.KUKAI_NUMBER}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {   field: 'AMAZON_SIZE_ID',
                    displayName: transervice.tran('亚马逊尺寸'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{grid.appScope.getStateName(grid.appScope.amazonSizes,row.entity.AMAZON_SIZE_ID)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'PARTNER_NAME_CN',
                    displayName: transervice.tran('供应商'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{row.entity.PARTNER_NAME_CN}}</div>',
                    width:150,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'ORDER_CD',
                    displayName: transervice.tran('采购订单'),
                    // cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{row.entity.ORDER_CD}}</div>',
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" ><a class="btn btn-link"  p-link link-code="row.entity.ORDER_CD" link-state="row.entity.IMPORT_STATE" refresh="grid.appScope.refreshOrder()">{{row.entity.ORDER_CD}}</a></div>',

                    width:170,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'PSKU_CODE',
                    displayName: transervice.tran('采购单SKU'),
                    // cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{row.entity.PSKU_CODE}}</div>',
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" ><a class="btn btn-link"  sku-link="row.entity.PSKU_ID" refresh="grid.appScope.refreshSKU()">{{row.entity.PSKU_CODE}}</a></div>',

                    width:150,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'DEMANDSKU_CODE',
                    displayName: transervice.tran('*需求国SKU'),
                    editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.DEMANDSKU_ID"  row="row"></div></div>',
                    width:150,
                    cellTemplate:'<div class="ui-grid-cell-contents " ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.DEMANDSKU_CODE}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {   field: 'PSKU_NAME_CN',
                    displayName: transervice.tran('产品中文名称'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{row.entity.PSKU_NAME_CN}}</div>',
                    width:150,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'PSKU_NAME_EN',
                    displayName: transervice.tran('产品英文名称'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color">{{row.entity.PSKU_NAME_EN}}</div>',
                    width:120,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'PLA_QUANTITY',
                    displayName: transervice.tran('计划发运数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.PLA_QUANTITY}}</div>',
                    width:120,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'ACTUAL_SHIPM_NUM',
                    displayName: transervice.tran('*实际发运数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents text-right" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.ACTUAL_SHIPM_NUM}}</div>',
                    editableCellTemplate:'<div ><form><input formatting="false"  numeric decimals="0" max="999999999"  min="0" ui-grid-editor ng-model="row.entity.ACTUAL_SHIPM_NUM"></form></div>',
                    width:130,
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {   field: 'PACKING_NUMBER',
                    displayName: transervice.tran('每箱数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.PACKING_NUMBER}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_NUM',
                    displayName: transervice.tran('整箱数量'),//{{grid.appScope.getZXS(row.entity)}}
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getZXS(row.entity)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'LAST_NUM',
                    displayName: transervice.tran('尾箱数量'),//{{grid.appScope.getWXS(row.entity)}}
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getWXS(row.entity)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'PRICE',
                    displayName: transervice.tran('采购单价'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.PRICE|number:2}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'SO_MONEY_ID',
                    displayName: transervice.tran('采购币种'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-center">{{grid.appScope.getMoneyName(row.entity.SO_MONEY_ID)}}</div>',//只有code，没有名称
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'AMOUNT',
                    displayName: transervice.tran('总金额'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.AMOUNT|number:2}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_LONG',
                    displayName: transervice.tran('长(CM)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.FCL_LONG}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_WIDE',
                    displayName: transervice.tran('宽(CM)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.FCL_WIDE}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_HIGH',
                    displayName: transervice.tran('高(CM)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.FCL_HIGH}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'GROSS_WEIGHT',
                    displayName: transervice.tran('毛重(KG)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.GROSS_WEIGHT}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_NET_WEIGHT',
                    displayName: transervice.tran('净重(KG)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{row.entity.FCL_NET_WEIGHT}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_LONG',
                    displayName: transervice.tran('长(in)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{(row.entity.FCL_LONG?row.entity.FCL_LONG/2.54:0).toFixed(2)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_WIDE',
                    displayName: transervice.tran('宽(in)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{(row.entity.FCL_WIDE?row.entity.FCL_WIDE/2.54:0).toFixed(2)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_HIGH',
                    displayName: transervice.tran('高(in)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{(row.entity.FCL_HIGH?row.entity.FCL_HIGH/2.54:0).toFixed(2)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'GROSS_WEIGHT',
                    displayName: transervice.tran('毛重(LB)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{(row.entity.GROSS_WEIGHT?row.entity.GROSS_WEIGHT/0.45:0).toFixed(2)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'FCL_NET_WEIGHT',
                    displayName: transervice.tran('净重(LB)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{(row.entity.FCL_NET_WEIGHT?row.entity.FCL_NET_WEIGHT/0.45:0).toFixed(2)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'NET_WEIGHT',
                    displayName: transervice.tran('总体积(CBM)'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getZTJ(row.entity)}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'NET_WEIGHT',
                    displayName: transervice.tran('体积重'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getTijizhong(row.entity)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {   field: 'NET_WEIGHT',
                    displayName: transervice.tran('计费重'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getJiFeiZhong(row.entity)}}</div>',
                    width:100,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'DELIVER_WARCODE',
                    displayName: transervice.tran('发货仓库'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.DELIVER_WAREHOUSE_NAME?row.entity.DELIVER_WAREHOUSE_NAME:"供应商仓"}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'INSPECTION_STATE',
                    displayName: transervice.tran('最新验货状态'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-center" >{{grid.appScope.getStateName(grid.appScope.inspectionStates,row.entity.INSPECTION_STATE)}}</div>',
                    width:120,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'DELIVERY_AT',
                    displayName: transervice.tran('好货日期'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.DELIVERY_AT}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'PAYMENT_TERM',
                    displayName: transervice.tran('Payment term'),
                    width:120,
                    cellTemplate:'<div class="ui-grid-cell-contents" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.PAYMENT_TERM}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'FBA_ID',
                    displayName: transervice.tran('FBA ID'),
                    width:80,
                    cellTemplate:'<div class="ui-grid-cell-contents" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.FBA_ID}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {   field: 'ACTUAL_SHIPM_AT',
                    displayName: transervice.tran('*实际发运日期'),
                    cellFilter: "dirtyFilter:row:col",
                    editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.ACTUAL_SHIPM_AT"></div>',
                    width:130,
                    // cellTemplate:'<div class="ui-grid-cell-contents" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.ACTUAL_SHIPM_AT}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'CUSTOMS_NAME',
                    displayName: transervice.tran('报关品名'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.CUSTOMS_NAME}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'UNIT_NAME',
                    displayName: transervice.tran('报关单位'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.UNIT_NAME}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'REPORTING_ELEMENTS',
                    displayName: transervice.tran('申报要素'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.REPORTING_ELEMENTS}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'CUSTOMS_CODE',
                    displayName: transervice.tran('海关编码'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.CUSTOMS_CODE}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'MONEY_ID',
                    displayName: transervice.tran('*报关币种'),
                    cellTemplate:'<div class="ui-grid-cell-contents" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{grid.appScope.getMoneyName(row.entity.MONEY_ID)}}</div>',
                    // cellFilter: 'gridFieldFilter:row:col',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'MONEY_ID',
                    editDropdownValueLabel: 'MONEY_NAME_CN',
                    //editDropdownOptionsArray: $scope.moneys,
                    editDropdownRowEntityOptionsArrayPath: "rowEntity.moneys",
                    width:80,
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'MARKUP_RATIO',
                    displayName: transervice.tran('加价比例'),
                    cellTemplate:'<div class="ui-grid-cell-contents  text-right" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}">{{row.entity.MARKUP_RATIO}}%</div>',
                    width:80,
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'CUSTOMS_PRICE',
                    displayName: transervice.tran('*报关价格'),//报关币种默认都是USD，加价比例默认25，报关价格=采购价格 * （1 + 加价比例 / 100），然后按照汇率转为报关币种的价格。报关金额 = 报关价格 * 实际发运数量
                    cellTemplate:'<div class="ui-grid-cell-contents  text-right" >{{row.entity.CUSTOMS_PRICE|number:2}}</div>',
                    width:130,
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'baoguanjine',
                    displayName: transervice.tran('报关金额'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color  text-right" >{{grid.appScope.getBaoGuanJinE(row.entity)|number:2}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'TARIFF',
                    displayName: transervice.tran('关税'),
                    width:80,
                    cellTemplate:'<div class="ui-grid-cell-contents text-right" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}" >{{row.entity.TARIFF}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'VALUE_ADDED_TAX',
                    displayName: transervice.tran('增值税'),
                    width:80,
                    cellTemplate:'<div class="ui-grid-cell-contents text-right" ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}" >{{row.entity.VALUE_ADDED_TAX}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {   field: 'EXPECTED_SERVICE_AT',
                    displayName: transervice.tran('*预计送达日期'),
                    cellFilter: "dirtyFilter:row:col",
                    editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.EXPECTED_SERVICE_AT"></div>',
                    width:130,
                    // cellTemplate:'<div class="ui-grid-cell-contents " ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}" >{{row.entity.EXPECTED_SERVICE_AT}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'PLAN_STATE',
                    displayName: transervice.tran('状态'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{grid.appScope.getStateName(grid.appScope.dispatchStates,row.entity.PLAN_STATE)}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'PURCHASING_WAREHOUSING_CD',
                    displayName: transervice.tran('采购入库单'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.PURCHASING_WAREHOUSING_CD}}</div>',
                    width:120,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'INTERNAL_SALES_CD',
                    displayName: transervice.tran('内部销售订单'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.INTERNAL_SALES_CD}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'INTERNAL_PURCHASING_CD',
                    displayName: transervice.tran('内部采购订单'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.INTERNAL_PURCHASING_CD}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'INTERNAL_SALESTH_CD',
                    displayName: transervice.tran('内部销售出库单'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.INTERNAL_SALESTH_CD}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'INTERNAL_PURCHASINGST_CD',
                    displayName: transervice.tran('内部采购入库单'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.INTERNAL_PURCHASINGST_CD}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'ALLOCATION_ONTHEWAY_CD',
                    displayName: transervice.tran('调拨单(在途)号'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.ALLOCATION_ONTHEWAY_CD}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'ALLOCATION_GOAL_CD',
                    displayName: transervice.tran('调拨单(目的)号'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.ALLOCATION_GOAL_CD}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'SO_FNSKU',
                    displayName: transervice.tran('原采购产品条码'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.SO_FNSKU}}</div>',
                    width:130,
                    enableCellEdit:false,
                    cellClass: cellClass
                },
                {
                    field: 'FNSKU',
                    displayName: transervice.tran('产品条码'),
                    width:130,
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'FNSKU',
                    editDropdownValueLabel: 'FNSKU',
                    //editDropdownOptionsArray: $scope.accounts,
                    editDropdownRowEntityOptionsArrayPath: "rowEntity.fnkSkus",
                    cellTemplate:'<div class="ui-grid-cell-contents " ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}" >{{row.entity.FNSKU}}</div>',
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'PO_NUMBER',
                    displayName: transervice.tran('PO号'),
                    cellTemplate:'<div class="ui-grid-cell-contents " ng-class="{\'noEdit-color\':row.entity.PLAN_STATE==2}" >{{row.entity.PO_NUMBER}}</div>',
                    width:80,
                    cellEditableCondition:function(index){
                        var entity=$scope.gridOptions.data[index.rowRenderIndex];
                        if(entity.PLAN_STATE==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    cellClass: cellClass
                },
                {
                    field: 'DISPATCH_REMARKS',
                    displayName: transervice.tran('备注'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.DISPATCH_REMARKS}}</div>',
                    width:80,
                    enableCellEdit:false,
                    cellClass: cellClass
                },




            ],
            enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

        };
        gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

        function init(){
            $scope.searchConditions.offset=$scope.gridOptions.paginationCurrentPage;
            $scope.searchConditions.limit=$scope.gridOptions.paginationPageSize;
            httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "dispatch_view", "POST",$scope.searchConditions).then(
                function (result){

                    httpService.waitData(function () {
                        if($scope.exchangeRates&&$scope.moneys){
                            return true;
                        }
                        return false;
                    },function () {

                        for (var i=0;i<result.data.length;i++){
                            var d=result.data[i];
                            d.rowEntity=angular.copy($scope.rowEntity);

                            //计划发运日期
                            d.PlAN_SHIPMENT_AT=d.PlAN_SHIPMENT_AT?$filter("date")(new Date(d.PlAN_SHIPMENT_AT*1000),"yyyy-MM-dd"):"";

                            //好货日期
                            d.DELIVERY_AT=d.DELIVERY_AT?$filter("date")(new Date(d.DELIVERY_AT*1000),"yyyy-MM-dd"):"";


                            d.ACTUAL_SHIPM_AT=d.ACTUAL_SHIPM_AT?$filter("date")(new Date(d.ACTUAL_SHIPM_AT*1000),"yyyy-MM-dd"):"";


                            d.EXPECTED_SERVICE_AT=d.EXPECTED_SERVICE_AT?$filter("date")(new Date(d.EXPECTED_SERVICE_AT*1000),"yyyy-MM-dd"):"";

                            //默认实际发运数等于计划发运数
                            d.ACTUAL_SHIPM_NUM= d.ACTUAL_SHIPM_NUM&&(+d.ACTUAL_SHIPM_NUM)?d.ACTUAL_SHIPM_NUM:d.PLA_QUANTITY;

                            //报关币种默认美元，加价比例默认25，填写了加价比例后需要自动计算报关价格，修改报关价格和实际发运数量系统需要自动计算报关金额
                            var money=d.rowEntity.moneys.filter(m=>m.MONEY_NAME_CN.indexOf("美元")>=0);
                            if(money.length){
                                d.MONEY_ID=d.MONEY_ID?d.MONEY_ID:money[0].MONEY_ID;
                            }
                            d.MARKUP_RATIO=d.MARKUP_RATIO?d.MARKUP_RATIO:25;


                            d.DEMANDSKU_CODE= d.DEMANDSKU_CODE?d.DEMANDSKU_CODE:d.PSKU_CODE;
                            d.DEMANDSKU_ID=d.DEMANDSKU_ID?d.DEMANDSKU_ID:d.PSKU_ID;
                            d.FNSKU=d.FNSKU?d.FNSKU:d.SO_FNSKU;
                            d.options=angular.copy($scope.skuOptions);
                            d.options.search.andwhere=["=","g_product_sku.PSKU_ID", d.DEMANDSKU_ID? d.DEMANDSKU_ID:"0"];
                            d.options.value=d.DEMANDSKU_ID;

                            d.copyObject=angular.copy(d);

                        }

                        //查询所有sku的平台条码
                        var ids=result.data.map(a=>a.DEMANDSKU_ID);
                        var searchCoditions={
                            where:["in","g_product_sku.PSKU_ID",ids],
                            joinwith:["g_product_sku_fnsku"],
                        }
                        httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "index", "POST",searchCoditions).then(function (datas) {
                            var pskus=datas.data;
                            for (var i=0;i<result.data.length;i++) {
                                var d = result.data[i];
                                var skus=pskus.filter(s=>s.PSKU_ID==d.DEMANDSKU_ID);
                                if(skus.length){
                                    d.rowEntity.fnkSkus= skus[0].g_product_sku_fnsku;
                                }

                                if(!d.CUSTOMS_PRICE||!+d.CUSTOMS_PRICE){
                                    d.CUSTOMS_PRICE=(d.PRICE*(1+d.MARKUP_RATIO/100)).toFixed(2);
                                    if(d.MONEY_ID!=d.SO_MONEY_ID){
                                        var rates=$scope.exchangeRates.filter(a=>a.MONEY_ID==d.SO_MONEY_ID&&a.TARGET_MONEY_ID==d.MONEY_ID);
                                        if(rates.length){
                                            var rate=rates[0];
                                            d.CUSTOMS_PRICE=d.CUSTOMS_PRICE*rate.EXCHANGE_RATE_ODDS;

                                        }
                                    }
                                }
                            }
                        })

                    })

                    $scope.gridOptions.data=result.data;
                    $scope.gridOptions.totalItems=result._meta.totalCount;

                })
        }

        init();

        $scope.search=function () {
            $scope.gridOptions.paginationCurrentPage=1;
            init();
        }


        //获取状态名称
        $scope.getStateName=function (states,id) {
            var states=states.filter(c=>c.D_VALUE==id);
            if(states.length){
                return states[0].D_NAME_CN;
            }
            return "";
        };
        ////获取货币名称
        $scope.getMoneyName=function (id) {
            if(!$scope.moneys){
                return "";
            }
            var items=$scope.moneys.filter(c=>c.MONEY_ID==id);
            if(items.length){
                return items[0].MONEY_NAME_CN;
            }
            return "";
        }




        //获取需求组织名称
        $scope.getOrganizationName=function (id) {
            if($scope.organizations){
                var ors= $scope.organizations.filter(o=>o.ORGANISATION_ID==id);
                if(ors.length){
                    return ors[0].ORGANISATION_NAME_CN;
                }
            }
            return "";
        };




        //获取总体积（CBM）
        $scope.getZTJ=function(entity){
            var l=entity.FCL_LONG?(+entity.FCL_LONG):0;
            var w=entity.FCL_WIDE?(+entity.FCL_WIDE):0;
            var h=entity.FCL_HIGH?(+entity.FCL_HIGH):0;
            return (l*w*h/1000000).toFixed(2);
        }

        //获取体积重
        $scope.getTijizhong=function(entity){
            var l=entity.FCL_LONG?entity.FCL_LONG:0;
            var w=entity.FCL_WIDE?entity.FCL_WIDE:0;
            var h=entity.FCL_HIGH?entity.FCL_HIGH:0;
            if(entity.TRANSPORT_MODE==1){ //海运
                return (l*w*h/6000).toFixed(2);
            }else{//空运
                return (l*w*h/5000).toFixed(2);
            }
        }

        //获取计费重
        $scope.getJiFeiZhong=function(entity){
            var tijiz=$scope.getTijizhong(entity);
            var maoz=(+entity.GROSS_WEIGHT)?entity.GROSS_WEIGHT:0;
            if(!(+entity.PACKING_NUMBER)){
                return 0;
            }
            if(tijiz>maoz){
                return  (tijiz/entity.PACKING_NUMBER).toFixed(4);
            }
            return  (maoz/entity.PACKING_NUMBER).toFixed(4);
        }


        //获取报关金额
        $scope.getBaoGuanJinE=function(entity){
            //报关币种默认都是USD，加价比例默认25，报关价格=采购价格 * （1 + 加价比例 / 100），然后按照汇率转为报关币种的价格。报关金额 = 报关价格 * 实际发运数量
            if(!(+entity.CUSTOMS_PRICE)||!(+entity.ACTUAL_SHIPM_NUM)){
                return 0;
            }
            return entity.CUSTOMS_PRICE*entity.ACTUAL_SHIPM_NUM
        }

        //获取整箱数
        $scope.getZXS=function(entity){

            if(!(+entity.PACKING_NUMBER)||!(+entity.ACTUAL_SHIPM_NUM)){
                entity.FCL_NUM=0;
                return 0;
            }
            var result=parseInt(entity.ACTUAL_SHIPM_NUM/entity.PACKING_NUMBER);
            entity.FCL_NUM=result;
            return result;
        }

        //获取尾箱数
        $scope.getWXS=function(entity){
            if(!(+entity.PACKING_NUMBER)||!(+entity.ACTUAL_SHIPM_NUM)){
                entity.LAST_NUM=0
                return 0;
            }
            var yus=entity.ACTUAL_SHIPM_NUM%entity.PACKING_NUMBER;
            if(yus>0){
                entity.LAST_NUM=1;
                return 1;
            }
            entity.LAST_NUM=0;
            return 0;
        }

        //头部统计栏
        $scope.zongxiangshu=0;
        $scope.zongtiji=0;
        $scope.zongmaozhong=0;
        $scope.zongjingzhong=0;
        $scope.zongtiji_cuin=0;
        $scope.zongmaozhong_lb=0;
        $scope.zongjingzhong_lb=0;

        $scope.toji=function(){
            $scope.zongxiangshu=0;
            $scope.zongtiji=0;
            $scope.zongmaozhong=0;
            $scope.zongjingzhong=0;
            $scope.zongtiji_cuin=0;
            $scope.zongmaozhong_lb=0;
            $scope.zongjingzhong_lb=0;
            if($scope.gridOptions.gridApi){
                var datas=$scope.gridOptions.gridApi.selection.getSelectedRows();
                if(!datas.length){

                }else{
                    datas.forEach(d=>{
                        $scope.zongxiangshu+=($scope.getZXS(d)+(d.LAST_NUM?d.LAST_NUM:0));
                        $scope.zongtiji+=(+$scope.getZTJ(d));
                        $scope.zongtiji_cuin+=($scope.getZTJ(d)/2.54/2.54/2.54)
                        if(+d.GROSS_WEIGHT){
                            $scope.zongmaozhong+=(+d.GROSS_WEIGHT);
                            $scope.zongmaozhong_lb+=(d.GROSS_WEIGHT/0.45)
                        }

                        if(+d.FCL_NET_WEIGHT){
                            $scope.zongjingzhong+=(+d.FCL_NET_WEIGHT);
                            $scope.zongjingzhong_lb+=(d.FCL_NET_WEIGHT/0.45)
                        }

                         //加上尾箱体积 'TAILBOX_HIGH',TAILBOX_LONG TAILBOX_WIDE

                        if(d.TAILBOX_HIGH&&d.TAILBOX_LONG&&d.TAILBOX_WIDE){
                            var tiji=d.TAILBOX_HIGH*d.TAILBOX_LONG*d.TAILBOX_WIDE/1000000;
                            $scope.zongtiji+=tiji;
                            $scope.zongtiji_cuin+=(tiji/2.54/2.54/2.54);
                        }

                    })
                }

            }


            $scope.zongtiji=(+$scope.zongtiji).toFixed(2);
            $scope.zongmaozhong=(+$scope.zongmaozhong).toFixed(2);
            $scope.zongjingzhong=(+$scope.zongjingzhong).toFixed(2);
            $scope.zongtiji_cuin=(+$scope.zongtiji_cuin).toFixed(2);
            $scope.zongmaozhong_lb=(+$scope.zongmaozhong_lb).toFixed(2);
            $scope.zongjingzhong_lb=(+$scope.zongjingzhong_lb).toFixed(2);

            return $scope.zongxiangshu;
        }

        $scope.gridOptions.getPage=function(pageNo,pageSize){
            $scope.gridOptions.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
            $scope.gridOptions.gridApi.selection.clearSelectedRows();
            init();
        }

        //行选中事件
        $scope.gridOptions.getGridApi=function(api){
            //api.selection.on.rowSelectionChanged($scope,function(row,event){
            //    toji();
            //
            //});
            //api.selection.on.rowSelectionChangedBatch($scope,function(rows){
            //    toji();
            //});
        }






        //编辑后触发
        $scope.gridOptions.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {
            if(newValue!=oldValue){
                if(colDef.name=="MONEY_ID"){
                    //币种改变 重新计算报关金额
                    rowEntity.CUSTOMS_PRICE=(rowEntity.PRICE*(1+rowEntity.MARKUP_RATIO/100)).toFixed(2);
                    if(newValue!=rowEntity.SO_MONEY_ID){
                        var rates=$scope.exchangeRates.filter(a=>(a.MONEY_ID==rowEntity.SO_MONEY_ID&&a.TARGET_MONEY_ID==rowEntity.MONEY_ID));
                        if(rates.length){
                            var rate=rates[0];
                            rowEntity.CUSTOMS_PRICE=rowEntity.CUSTOMS_PRICE*rate.EXCHANGE_RATE_ODDS;

                        }
                    }
                }
                if(colDef.name=='MARKUP_RATIO'){
                    rowEntity.CUSTOMS_PRICE=(rowEntity.PRICE*(1+rowEntity.MARKUP_RATIO/100)).toFixed(2);
                    if(rowEntity.MONEY_ID!=rowEntity.SO_MONEY_ID){
                        var rates=$scope.exchangeRates.filter(a=>(a.MONEY_ID==rowEntity.SO_MONEY_ID&&a.TARGET_MONEY_ID==rowEntity.MONEY_ID));
                        if(rates.length){
                            var rate=rates[0];
                            rowEntity.CUSTOMS_PRICE=rowEntity.CUSTOMS_PRICE*rate.EXCHANGE_RATE_ODDS;
                        }
                    }
                }


            }

        }




        function checkSaveDatas(datas){
            for(var i=0;i<datas.length;i++){
                var a=datas[i];
                if(!a.TRANSPORT_MODE){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c1));
                    return false;
                }

                if(!a.KUKAI_NUMBER){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c2));
                    return false;
                }
                if(!a.DEMANDSKU_CODE){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c3));
                    return false;
                }


                if(!a.ACTUAL_SHIPM_NUM||!(+a.ACTUAL_SHIPM_NUM)){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c4));
                    return false;
                }

                if(!a.ACTUAL_SHIPM_AT){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c5));
                    return false;
                }

                if(!a.MONEY_ID){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c6));
                    return false;
                }

                if(!a.CUSTOMS_PRICE){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c7));
                    return false;
                }

                if(!a.EXPECTED_SERVICE_AT){
                    Notification.error(transervice.tran(messageService.dispatchOrder_c8));
                    return false;
                }

            }
            return true;
        }

        //保存方法
        $scope.save=function(){
            var vaFileds=['TRANSPORT_MODE','KUKAI_NUMBER','DEMANDSKU_CODE','DEMANDSKU_CODE','ACTUAL_SHIPM_NUM','PAYMENT_TERM','FBA_ID','VALUE_ADDED_TAX','TARIFF','CUSTOMS_PRICE','MARKUP_RATIO','MONEY_ID','ACTUAL_SHIPM_AT','EXPECTED_SERVICE_AT','FNSKU'];

            // var rows=getDirtyRows($scope.gridOptions.data,vaFileds);
            var rows=$scope.gridOptions.gridApi.rowEdit.getDirtyRows();
            rows=rows.map(r=>r.entity);

            if(!rows.length){
                return  Notification.error(transervice.tran(messageService.error_choose_n));
            }
            // if(!checkSaveDatas(rows)){
            //     return;
            // }
            rows=angular.copy(rows);
            return  save(rows);

        }

        function save( rows,isShenHe){
            rows=angular.copy(rows);
            rows.forEach(r=>{
                if(r.ACTUAL_SHIPM_AT)
                    r.ACTUAL_SHIPM_AT=new Date(r.ACTUAL_SHIPM_AT).getTime()/1000;
                if(r.EXPECTED_SERVICE_AT)
                    r.EXPECTED_SERVICE_AT=new Date(r.EXPECTED_SERVICE_AT).getTime()/1000;
                if(r.DELIVERY_AT)
                    r.DELIVERY_AT=new Date(r.DELIVERY_AT).getTime()/1000;
                if(r.PlAN_SHIPMENT_AT)
                    r.PlAN_SHIPMENT_AT=new Date(r.PlAN_SHIPMENT_AT).getTime()/1000;

            })

            var saveRows={batchMTC:rows};

            return   httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "update", "POST",saveRows).then(
                function (result){
                    Notification.success(result.message);
                    if(!isShenHe){
                        $scope.gridOptions.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        $scope.gridOptions.gridApi.selection.clearSelectedRows();
                        init();
                    }


                })
        }

        //删除方法
        $scope.del=function(){

            var rows=$scope.gridOptions.gridApi.selection.getSelectedRows();
            if(!rows.length){
                return  Notification.error(transervice.tran(messageService.error_empty));
            }

            return $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function(){
                rows=angular.copy(rows);
                var saveModels=[];
                rows.forEach(r=>{
                    saveModels.push({
                        DISPATCH_NOTE_ID: r.DISPATCH_NOTE_ID,
                        DELETED_STATE:1,
                        edit_type:3
                    })
                })

                var saveModels={batchMTC:saveModels};

                httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "update", "POST",saveModels).then(
                    function (result){
                        Notification.success(result.message);
                        $scope.gridOptions.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        $scope.gridOptions.gridApi.selection.clearSelectedRows();
                        init();

                    })
            })


        }

        //发运通知
        $scope.printNote=function(){
            var entitys= $scope.gridOptions.gridApi.selection.getSelectedRows();

            if(!entitys.length){
                return  Notification.error(transervice.tran(messageService.error_empty));
            }

            var saveModels=entitys.map(a=>a.DISPATCH_NOTE_ID);
            var form=$("<form>");//定义一个form表单
            form.attr("style","display:none");
            form.attr("target","");
            form.attr("method","post");

            var input1=$("<input>");
            input1.attr("type","hidden");
            input1.attr("name","search");
            input1.attr("value",$scope.searchConditions.search);

            var input2=$("<input>");
            input2.attr("type","hidden");
            input2.attr("name","ORGANISATION_ID");
            input2.attr("value",$scope.searchConditions.ORGANISATION_ID);

            var input3=$("<input>");
            input3.attr("type","hidden");
            input3.attr("name","TRANSPORT_MODE");
            input3.attr("value",$scope.searchConditions.TRANSPORT_MODE);

            var input4=$("<input>");
            input4.attr("type","hidden");
            input4.attr("name","p_shipm_time_start");
            input4.attr("value",$scope.searchConditions.p_shipm_time_start);

            var input5=$("<input>");
            input5.attr("type","hidden");
            input5.attr("name","p_shipm_time_end");
            input5.attr("value",$scope.searchConditions.p_shipm_time_end);

            var input6=$("<input>");
            input6.attr("type","hidden");
            input6.attr("name","a_shipm_time_start");
            input6.attr("value",$scope.searchConditions.a_shipm_time_start);

            var input7=$("<input>");
            input7.attr("type","hidden");
            input7.attr("name","a_shipm_time_end");
            input7.attr("value",$scope.searchConditions.a_shipm_time_end);

            var input8=$("<input>");
            input8.attr("type","hidden");
            input8.attr("name","batchMTC");
            input8.attr("value",saveModels.toString());

            form.append(input1,input2,input3,input4,input5,input6,input7,input8);
            form.attr("action",httpService.webApi.api+"/shipment/dispatchnote/print_note");
            $("body").append(form);//将表单放置在web中
            form.submit();//表单提交
        }


        //审核
        $scope.audit=function(){
            var entitys= $scope.gridOptions.gridApi.selection.getSelectedRows();
            if(!entitys.length){
                return  Notification.error(transervice.tran(messageService.error_empty));  //判断是否选择了数据
            }
            var vails=entitys.filter(a=>a.PLAN_STATE==2);
            if(vails.length){
                return  Notification.error(transervice.tran(messageService.error_audit_a)); //判断是否包含已审核数据
            }

            if(!checkSaveDatas(entitys)){
                return;
            }

            $confirm({ text: transervice.tran(messageService.confirm_audit) }).then(function(){ //确认是否要审核
                var vaFileds=['TRANSPORT_MODE','KUKAI_NUMBER','DEMANDSKU_CODE','DEMANDSKU_CODE','ACTUAL_SHIPM_NUM','PAYMENT_TERM','FBA_ID','VALUE_ADDED_TAX','TARIFF','CUSTOMS_PRICE','MARKUP_RATIO','MONEY_ID','ACTUAL_SHIPM_AT','EXPECTED_SERVICE_AT','FNSKU'];
                var dirtyRows=getDirtyRows($scope.gridOptions.data,vaFileds);
                var needSaveRows=[];
                if(dirtyRows.length){
                    needSaveRows=entitys.filter(a=>dirtyRows.indexOf(a)!=-1);
                }

                //如果包含有修改过的数据，先保存
                if(needSaveRows.length){
                    needSaveRows=angular.copy(needSaveRows);
                    needSaveRows.forEach(r=>{
                        if(r.ACTUAL_SHIPM_AT)
                            r.ACTUAL_SHIPM_AT=new Date(r.ACTUAL_SHIPM_AT).getTime()/1000;
                        if(r.EXPECTED_SERVICE_AT)
                            r.EXPECTED_SERVICE_AT=new Date(r.EXPECTED_SERVICE_AT).getTime()/1000;
                        if(r.DELIVERY_AT)
                            r.DELIVERY_AT=new Date(r.DELIVERY_AT).getTime()/1000;
                        if(r.PlAN_SHIPMENT_AT)
                            r.PlAN_SHIPMENT_AT=new Date(r.PlAN_SHIPMENT_AT).getTime()/1000;
                    })

                    var saveRows={batchMTC:needSaveRows};

                    return   httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "update", "POST",saveRows).then( //保存
                        function (result){
                            var  saveModel=[];
                            entitys.forEach(a=>{
                                saveModel.push({
                                    DISPATCH_NOTE_ID: a.DISPATCH_NOTE_ID,
                                    PLAN_STATE: 2
                                })
                            });
                            saveModel={batchMTC:saveModel};

                            httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "to_examine", "POST",saveModel).then( //审核
                                function (result){
                                    Notification.success(result.message);
                                    $scope.gridOptions.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                                    $scope.gridOptions.gridApi.selection.clearSelectedRows();
                                    init();

                                })

                        })

                }else{
                    var  saveModel=[];
                    entitys.forEach(a=>{
                        saveModel.push({
                            DISPATCH_NOTE_ID: a.DISPATCH_NOTE_ID,
                            PLAN_STATE: 2
                        })
                    });
                    saveModel={batchMTC:saveModel};

                    httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "to_examine", "POST",saveModel).then(
                        function (result){
                            Notification.success(result.message);
                            $scope.gridOptions.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                            $scope.gridOptions.gridApi.selection.clearSelectedRows();
                            init();

                        })
                }
            });


        }

        //反审核
        $scope.notAudit=function(){
            var entitys= $scope.gridOptions.gridApi.selection.getSelectedRows();
            if(!entitys.length){
                return  Notification.error(transervice.tran(messageService.error_empty));//是否选择了数据
            }
            var vails=entitys.filter(a=>a.PLAN_STATE==1);
            if(vails.length){
                return  Notification.error(transervice.tran(messageService.error_audit_n)); //是否包含了未审核数据
            }
            $confirm({ text: transervice.tran(messageService.confirm_audit_f) }).then(function() {
                var saveModel = [];
                entitys.forEach(a=> {
                    saveModel.push({
                        edit_type: 2,
                        DISPATCH_NOTE_ID: a.DISPATCH_NOTE_ID,
                        PLAN_STATE: 1,
                    })
                });
                saveModel = {batchMTC: saveModel};

                httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "update", "POST", saveModel).then(
                    function (result) {
                        Notification.success(result.message);
                        $scope.gridOptions.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        $scope.gridOptions.gridApi.selection.clearSelectedRows();
                        init();

                    })
            })
        }



        //获取修改过的实体
        function getDirtyRows(datas,fileds,idtext) {
            var result=[];

            datas.forEach(d=>{
                var flag=getEqualResult(d,fileds);
                if(!flag){
                    result.push(d);
                }

            })
            return result;

            function getEqualResult(data,fields) {
                var copyData=data.copyObject;
                for(var i=0;i<fields.length;i++){
                    var f=fields[i];
                    if(copyData[f]!=data[f]){
                        return false;

                    }

                }
                return true;
            }
        }

    }
});
