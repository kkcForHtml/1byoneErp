define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/singleSelectDirt',
    'ngFileUpload',
    'angular-js-xlsx'

], function () {
    return   function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,$state,$compile,messageService,configService) {

        //是否紧急状态
        $scope.urgents=commonService.getDicList("URGENT_ORDER");


        //运输方式
        $scope.transports=commonService.getDicList("TRANSPORTS");

        //获取质检状态
        $scope.inspectionStates=commonService.getDicList("INSPECTION_STATE");

        //搜索质检状态
        $scope.inspectionStates_search=[{D_VALUE:"",D_NAME_CN:"全部"}].concat($scope.inspectionStates);

        $scope.rowEntity = {channels:[],organizations:[],wareHouses:[]};


        //获取所有仓库
        (function () {
            searchData = {
                "where":["and",["or",["=","b_warehouse.WAREHOUSE_TYPE_ID","5"],["=","b_warehouse.WAREHOUSE_TYPE_ID","2"]]],
                "joinwith":["organisation","allBchannel"],
                "limit":"0",
                "distinct": 1
            };

            httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index" , "POST",searchData).then(
                function (result) {
                    $scope.wareHouses_all=result.data;
                })
        })();



        //获取需求组织
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

        //平台列表
        (function () {
            var selectWhere = {"limit":"*"};
            httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(
                function (result) {
                    $scope.channels_all = result.data;

                }
            );
        })();


        $scope.dicOptions = {
            filter: "contains",
            autoBind: true,
            dataTextField: "PSKU_CODE",
            dataValueField: "PSKU_ID",
            optionLabel: "请选择",
            url:httpService.webApi.api+"/master/product/prodsku/index",
            search:{where:["and",["=","g_product_sku.PSKU_STATE",1]]},
            o_change:$scope.selectRowChange
            ,

        };

        $scope.selectRowChange= function (row) {
            // $scope.gridApi.core.getVisibleRows()
            if (row) {
                row.isDirty = true;
                row.isError = true;
                $scope.gridApi.grid.refresh();
                var model= row.selectModel;
                row.entity.DEMANDSKU_ID=model.PSKU_ID;
                row.entity.DEMANDSKU_CODE=model.PSKU_CODE;
                row.entity.ORGAN_ID_DEMAND=model.ORGAN_ID_DEMAND;

                row.entity.CHANNEL_ID="";



                //row.entity.ACCOUNT_ID="";
                //row.entity.rowEntity.accounts=getAccount(row.entity);
                //row.entity.rowEntity.channelList=getChannelByorg(row.entity);
            }

        }

        // 检索条件有需求组织/采购订单/供应商/原采购订单SKU/质检状态/交货日期
        $scope.searchConditions={
            ORGANISATION_ID:"",
            search:"",
            INSPECTION_STATE:"",
            search_time_start:"",
            search_time_end:""
        }


        //等待数据
        function waitData(fn1,fn2){
            setTimeout(function () {
                if(!fn1()){
                    waitData(fn1,fn2);
                }else{
                    fn2();
                }
            },50)
        };

        function init(){
            httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "dispatch_index", "POST",$scope.searchConditions).then(
                function (result){
                    for (var i=0;i<result.data.length;i++){
                        var d=result.data[i];
                        d.URGENT_ORDER="2";

                        d.DEMANDSKU_CODE= d.PSKU_CODE;
                        d.DEMANDSKU_ID=d.PSKU_ID;

                        d.SUWHSEPLA_NUM=d.SUWHSEPLA_NUM?d.SUWHSEPLA_NUM:0;
                        d.ITSWHSEPLA_NUM=d.ITSWHSEPLA_NUM?d.ITSWHSEPLA_NUM:0;
                        //初始化sku控件
                        d.options=angular.copy($scope.dicOptions);
                        d.options.value=d.PSKU_CODE;
                        d.options.search.andwhere=["=","g_product_sku.PSKU_CODE",d.PSKU_CODE];
                        d.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND", d.ORGANISATION_ID]);

                        d.PRE_ORDER_AT=d.PRE_ORDER_AT?$filter("date")(new Date(d.PRE_ORDER_AT*1000),"yyyy-MM-dd"):"";
                        d.DELIVERY_AT=d.DELIVERY_AT?$filter("date")(new Date(d.DELIVERY_AT*1000),"yyyy-MM-dd"):"";
                        d.DELIVERY_AT_PLAN=$filter("date")(new Date(),"yyyy-MM-dd");
                        d.rowEntity=angular.copy($scope.rowEntity);
                    }

                    waitData(function () {
                        if($scope.organizations){
                            return true;
                        }
                        return false;
                    },function () {

                        waitData(function () {
                            if(!$scope.channels_all){
                                return false;
                            }
                            return true;
                        },function () {
                            //获取组织下的平台
                            result.data.forEach(d=>{
                                d.rowEntity.channels=getChannels(d);
                            })

                        })

                        waitData(function () {
                            if(!$scope.wareHouses_all){
                                return false;
                            }
                            return true;
                        },function () {
                            result.data.forEach(d=>{
                                //查找组织 平台下的仓库 WAREHOUSE_CODE  目的仓，默认记录对应的采购订单或调整单的组织和平台下的类型5的仓库，用户可以手工修改。
                                d.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==d.ORGANISATION_ID&&w.CHANNEL_ID==d.CHANNEL_ID&&(w.WAREHOUSE_TYPE_ID==5||w.WAREHOUSE_TYPE_ID==2));
                                var ws=d.rowEntity.wareHouses.filter(w=>w.WAREHOUSE_TYPE_ID==5);
                                if(ws.length){
                                    d.WAREHOUSE_ID=ws[0].WAREHOUSE_ID;
                                }

                            })

                            $scope.tableDatas=result.data;
                            $scope.gridOptions.data=getSubList($scope.tableDatas,$scope.gridOptions.paginationCurrentPage,$scope.gridOptions.paginationPageSize);
                            $scope.gridOptions.totalItems=$scope.tableDatas.length;
                            $scope.gridOptions.gridApi.grid.refresh();


                        })
                    })




                }
            );
        }

        init();

        $scope.search=function () {
            init();
        }


        $scope.dicOptions.o_change=$scope.selectRowChange;

        //设置样式函数
        function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
            var entity=row.entity;
            if(entity.ITSWHSEPLA_NUM>$scope.getZhongzhuancangkucun(entity)){
                return 'color-red';
            }
            if(entity.SUWHSEPLA_NUM>$scope.getGongyingshangkucun(entity)){
                return 'color-red';
            }
            return '';
            // if (grid.getCellValue(row,col) === 'Velity') {
            //     return 'blue';
            // }
        }

        //表格配置
        $scope.gridOptions= {
            columnDefs: [
                {
                    field: 'URGENT_ORDER',
                    displayName: transervice.tran('紧急订单'),
                    cellTemplate:'<div class="ui-grid-cell-contents " >{{grid.appScope.getStateName(grid.appScope.urgents,row.entity.URGENT_ORDER)|dirtyFilter:row:col}}</div>',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'D_VALUE',
                    editDropdownValueLabel: 'D_NAME_CN',
                    editDropdownOptionsArray: $scope.urgents,
                    width:80,
                    cellClass: "text-center"
                },
                {
                    field: 'ORGANISATION_ID',
                    displayName: transervice.tran('需求组织'),
                    cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getOrganizationName(row.entity.ORGANISATION_ID)|dirtyFilter:row:col}}</div>',
                    editableCellTemplate:'<div><form ><select ui-grid-edit-dropdown  ng-model="row.entity.ORGANISATION_ID" ng-options="item.ORGANISATION_ID as item.ORGANISATION_NAME_CN for item in row.entity.rowEntity.organizations" ng-change="grid.appScope.zuzhiChange(row.entity)"></select></form></div>',
                    // cellFilter: 'gridFieldFilter:row:col',
                    //editableCellTemplate: 'ui-grid/dropdownEditor',
                    //editDropdownIdLabel:'ORGANISATION_CODE',
                    //editDropdownValueLabel: 'ORGANISATION_NAME_CN',
                    //editDropdownRowEntityOptionsArrayPath: "rowEntity.organizations",
                    width:120,
                    cellClass: cellClass
                },
                {
                    field: 'CHANNEL_ID',
                    displayName: transervice.tran('平台'),
                    cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getChannelName(row.entity.CHANNEL_ID)|dirtyFilter:row:col}}</div>',
                    //cellFilter: 'gridFieldFilter:row:col',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'CHANNEL_ID',
                    editDropdownValueLabel: 'CHANNEL_NAME_CN',
                    // editDropdownOptionsArray: $scope.channelList
                    editDropdownRowEntityOptionsArrayPath: "rowEntity.channels",
                    width:120,
                    cellClass: cellClass
                }, {
                    field: 'ORDER_CD',
                    displayName: transervice.tran('采购/调整单号'),
                    //cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.ORDER_CD}}</div>',
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" ><a class="btn btn-link"  p-link link-code="row.entity.ORDER_CD" link-state="row.entity.IMPORT_STATE" refresh="grid.appScope.refreshOrder()">{{row.entity.ORDER_CD}}</a></div>',
                    enableCellEdit:false,
                    width:170,
                    cellClass: cellClass
                }, {
                    field: 'PARTNER_NAME_CN',
                    displayName: transervice.tran('供应商名称'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.PARTNER_NAME_CN}}</div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass: cellClass
                },
                {
                    field: 'PSKU_CODE',
                    displayName: transervice.tran('原采购订单SKU'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" ><a class="btn btn-link"  sku-link="row.entity.PSKU_ID" refresh="grid.appScope.refreshSKU()">{{row.entity.PSKU_CODE}}</a></div>',
                    enableCellEdit:false,
                    width:150,
                    cellClass: cellClass
                },
                {
                    field: 'DEMANDSKU_CODE',
                    displayName: transervice.tran('实际发运SKU'),
                    editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions.showDirt"  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.DEMANDSKU_ID"  row="row"></div></div>',
                    width:170,
                    cellClass: cellClass
                },
                {   field: 'PRE_ORDER_AT',
                    displayName: transervice.tran('下单日期'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.PRE_ORDER_AT}}</div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass: cellClass
                },
                {   field: 'DELIVERY_AT',//待定
                    displayName: transervice.tran('最新验货日期'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{row.entity.DELIVERY_AT}}</div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass: cellClass
                },
                {   field: 'INSPECTION_STATE',//待定
                    displayName: transervice.tran('质检状态'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-center" >{{grid.appScope.getStateName(grid.appScope.inspectionStates,row.entity.INSPECTION_STATE)}}</div>',
                    enableCellEdit:false,
                    width:80,
                    cellClass: cellClass
                },
                {   field: 'PURCHASE',
                    displayName: transervice.tran('翻单数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.PURCHASE}}</div>',
                    enableCellEdit:false,
                    width:80,
                    cellClass: cellClass
                },
                {   field: 'ALREADY_GGOODS_NUM',
                    displayName: transervice.tran('已好货数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.ALREADY_GGOODS_NUM}}</div>',
                    enableCellEdit:false,
                    width:90,
                    cellClass: cellClass
                },
                {   field: 'PLA_QUANTITY',
                    displayName: transervice.tran('计划中数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.PLA_QUANTITY}}</div>',
                    enableCellEdit:false,
                    width:90,
                    cellClass: cellClass
                },
                {   field: 'SHIPPED_QUANTITY',
                    displayName: transervice.tran('已发货数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.SHIPPED_QUANTITY}}</div>',
                    enableCellEdit:false,
                    width:100,
                    cellClass: cellClass
                },
                {   field: 'DELIVERY_AT_PLAN',
                    displayName: transervice.tran('计划发运日期'),
                    //type: 'date',
                    cellFilter: "dirtyFilter:row:col",
                    editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions.data.indexOf(row.entity)}}{{grid.appScope.gridOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.DELIVERY_AT_PLAN"></div>',

                    width:120,
                    cellClass: cellClass
                },
                {   field: 'QUANTITY_RECEIVED',
                    displayName: transervice.tran('已收货数量'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{row.entity.QUANTITY_RECEIVED}}</div>',
                    enableCellEdit:false,
                    width:100,
                    cellClass: cellClass
                },
                {   field: 'zhongzhuancangkucun',
                    displayName: transervice.tran('中转仓库存'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right" >{{grid.appScope.getZhongzhuancangkucun(row.entity)}}</div>',
                    enableCellEdit:false,
                    width:100,
                    cellClass: cellClass
                },
                {   field: 'ITSWHSEPLA_NUM',
                    displayName: transervice.tran('中转仓出货数量'),
                    width:120,
                    editableCellTemplate:'<div><form><input type="number" max="999999999" min="0" ui-grid-editor ng-model="row.entity.ITSWHSEPLA_NUM"></form></div>',
                    cellClass: "text-right"
                },
                {   field: 'gongyingshangkucun',
                    displayName: transervice.tran('供应商库存'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color" >{{grid.appScope.getGongyingshangkucun(row.entity)}}</div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass: "text-right"
                },
                {   field: 'SUWHSEPLA_NUM',
                    displayName: transervice.tran('供应商出货数量'),
                    editableCellTemplate:'<div><form><input type="number" max="999999999" min="0" ui-grid-editor ng-model="row.entity.SUWHSEPLA_NUM"></form></div>',
                    width:120,
                    cellClass: "text-right"
                },
                {
                    field: 'TRANSPORT',
                    displayName: transervice.tran('运输方式'),
                    cellTemplate:'<div class="ui-grid-cell-contents text-center">{{grid.appScope.getStateName(grid.appScope.transports,row.entity.TRANSPORT)}}</div>',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'D_VALUE',
                    editDropdownValueLabel: 'D_NAME_CN',
                    editDropdownOptionsArray: $scope.transports,
                    width:80,
                    cellClass: cellClass
                },
                {
                    field: 'WAREHOUSE_ID',
                    displayName: transervice.tran('目的仓'),
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{grid.appScope.getWarhouseName(row.entity.WAREHOUSE_ID)}}</div>',
                    //cellFilter: 'gridFieldFilter:row:col',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel:'WAREHOUSE_ID',
                    editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                    // editDropdownOptionsArray: $scope.channelList
                    editDropdownRowEntityOptionsArrayPath: "rowEntity.wareHouses",
                    width:130,
                    cellClass: cellClass
                },
                {
                    field: 'DISPATCH_REMARKS',
                    displayName: transervice.tran('备注'),
                    width:80,
                    cellFilter:"dirtyFilter:row:col",
                    cellClass: cellClass
                },
                {    field: 'FCL_NUM',
                    displayName: transervice.tran('整箱数'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getZhengxiangshu(row.entity)}}</div>',
                    enableCellEdit:false,
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'FCL_LONG',
                    displayName: transervice.tran('整箱长'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right " >{{row.entity.FCL_LONG}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="2"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.FCL_LONG"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'FCL_WIDE',
                    displayName: transervice.tran('整箱宽'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right "  >{{row.entity.FCL_WIDE}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="2"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.FCL_WIDE"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'FCL_HIGH',
                    displayName: transervice.tran('整箱高'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right " >{{row.entity.FCL_HIGH}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="2"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.FCL_HIGH"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'GROSS_WEIGHT',
                    displayName: transervice.tran('整箱毛重'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right ">{{row.entity.GROSS_WEIGHT}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="4"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.GROSS_WEIGHT"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'FCL_NET_WEIGHT',
                    displayName: transervice.tran('整箱净重'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right "  >{{row.entity.FCL_NET_WEIGHT}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="4"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.FCL_NET_WEIGHT"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'LAST_NUM',
                    displayName: transervice.tran('尾箱数'),
                    cellTemplate:'<div class="ui-grid-cell-contents noEdit-color text-right">{{grid.appScope.getWeixiangshu(row.entity)}}</div>',
                    enableCellEdit:false,
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'TAILBOX_LONG',
                    displayName: transervice.tran('尾箱长'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right "  >{{(+row.entity.TAILBOX_LONG||0).toFixed(2)}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="2"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.TAILBOX_LONG"></form></div>',

                    //cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                    //    if(row.entity.IMPORT_STATE==1){
                    //        return "noEdit-color"
                    //    }
                    //},
                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80
                },
                {    field: 'TAILBOX_WIDE',
                    displayName: transervice.tran('尾箱宽'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right " >{{(+row.entity.TAILBOX_WIDE||0).toFixed(2)}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="2"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.TAILBOX_WIDE"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'TAILBOX_HIGH',
                    displayName: transervice.tran('尾箱高'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right "  >{{(+row.entity.TAILBOX_HIGH||0).toFixed(2)}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="2"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.TAILBOX_HIGH"></form></div>',
                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'TAILBOX_NETWEIGHT',
                    displayName: transervice.tran('尾箱毛重'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right "  >{{(+row.entity.TAILBOX_NETWEIGHT||0).toFixed(4)}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="4"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.TAILBOX_NETWEIGHT"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:80,
                    cellClass: cellClass
                },
                {    field: 'TAILBOX_WEIGHT',
                    displayName: transervice.tran('尾箱净重'),
                    cellTemplate:'<div  class="ui-grid-cell-contents  text-right "  >{{(+row.entity.TAILBOX_WEIGHT||0).toFixed(4)}}</div>',
                    editableCellTemplate:'<div><form> <input type="text" formatting="false" ui-grid-editor  numeric  decimals="4"  min="0" max="9999999999" class="form-control"  ng-model="row.entity.TAILBOX_WEIGHT"></form></div>',

                    //cellEditableCondition:function(index){
                    //    var entity=$scope.gridOptions.data[index.rowRenderIndex];
                    //    if(entity.IMPORT_STATE==2){
                    //        return true;
                    //    }else{
                    //        return false;
                    //    }
                    //},
                    width:120,
                    cellClass: cellClass
                },



            ],
            enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

        };
        gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

        //链接过去刷新页面
        $scope.refreshOrder=function () {

        }

        $scope.refreshSKU=function () {

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

        $scope.gridOptions.getPage=function (pageNo,pageSize) {
            $scope.gridOptions.data=getSubList($scope.tableDatas,pageNo,pageSize);
        }


        //需求组织变化时
        $scope.zuzhiChange=function(rowEntity){
            rowEntity.rowEntity.channels=$scope.channels_all.filter(c=>c.ORGANISATION_ID==rowEntity.ORGANISATION_ID);
            rowEntity.CHANNEL_ID="";
            //清空仓库
            rowEntity.rowEntity.wareHouses=[];
            rowEntity.WAREHOUSE_ID="";

            rowEntity.options=angular.copy($scope.dicOptions);
            //rowEntity.options.value="";
            rowEntity.DEMANDSKU_CODE="";
            rowEntity.DEMANDSKU_ID="";
            //查找原采购sku中通用sku，在该组织下的sku
            var searchCoditions={
                where:["and",["=","g_product_sku.ORGAN_ID_DEMAND",rowEntity.ORGANISATION_ID],["=","g_product_sku.CSKU_ID",rowEntity.CSKU_ID]],
            }

            httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST",searchCoditions).then(
                function (result){
                    if(result.data.length){
                        rowEntity.DEMANDSKU_CODE=result.data[0].PSKU_CODE;
                        rowEntity.DEMANDSKU_ID=result.data[0].PSKU_ID;
                        rowEntity.options.value=result.data[0].PSKU_ID;
                        rowEntity.options.search.andwhere=["=","g_product_sku.PSKU_ID",result.data[0].PSKU_ID];
                        rowEntity.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND", rowEntity.ORGANISATION_ID]);
                        // refresh();
                        gridDefaultOptionsService.refresh($scope.gridOptions,'PSKU_ID');
                    }else{
                        rowEntity.options.value='';
                        rowEntity.options.search.andwhere=["=","g_product_sku.PSKU_ID",0];
                        rowEntity.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND", rowEntity.ORGANISATION_ID]);
                    }

                })



        }


        function refresh(){
            var datas=$scope.gridOptions.data;
            $scope.gridOptions.data=[];
            setTimeout(function(){
                $scope.gridOptions.data=datas;
                $scope.gridOptions.gridApi.grid.refresh();
            },10)
        }




        //获取状态名称
        $scope.getStateName=function (states,id) {
            var states=states.filter(c=>c.D_VALUE==id);
            if(states.length){
                return states[0].D_NAME_CN;
            }
            return "";
        };

        //获取中转仓库存
        $scope.getZhongzhuancangkucun=function (entity) {
            var result=0;
            if(!entity)
                return 0;

            if(entity.IMPORT_STATE==1){  // 采购订单 ，等于已收货数量 - 已发运数量-自营仓计划中数量，如果计算结果小于0则显示0
                if(!entity.QUANTITY_RECEIVED) return 0;
                var SHIPPED_QUANTITY=entity.SHIPPED_QUANTITY?entity.SHIPPED_QUANTITY:0;
                var ITSWHSEPLA_QUANTITY=entity.ITSWHSEPLA_QUANTITY?entity.ITSWHSEPLA_QUANTITY:0;
                result=entity.QUANTITY_RECEIVED-SHIPPED_QUANTITY-ITSWHSEPLA_QUANTITY;
            }else if(entity.IMPORT_STATE==2){// 调整单 ，等于翻单数量-计划中数量-已发运数量，如果计算结果小于0则显示0
                if(!entity.PURCHASE) return 0;
                var PLA_QUANTITY=entity.PLA_QUANTITY?entity.PLA_QUANTITY:0;
                var SHIPPED_QUANTITY=entity.SHIPPED_QUANTITY?entity.SHIPPED_QUANTITY:0;
                result=entity.PURCHASE-PLA_QUANTITY-SHIPPED_QUANTITY;
            }

            if(result<0){
                result=0;
            }
            return result;

        }

        //获取供应商库存  等于已好货数量-已收货数量-供应商计划中数量，如果计算结果小于0则显示0
        $scope.getGongyingshangkucun=function (entity) {
            if(!entity||!entity.PURCHASE)
                return 0;
            var QUANTITY_RECEIVED=(+entity.QUANTITY_RECEIVED)?entity.QUANTITY_RECEIVED:0;
            var SUWHSEPLA_QUANTITY =(+entity.SUWHSEPLA_QUANTITY) ?entity.SUWHSEPLA_QUANTITY :0;

            var result=entity.PURCHASE-QUANTITY_RECEIVED-SUWHSEPLA_QUANTITY;
            if(result<0){
                result=0;
            }
            return result;
        }

        //获取整箱数 等于（供应商出货数+中转仓出货数）/ 实际发运SKU主数据中的每箱数量，得出数值后向下取整。
        $scope.getZhengxiangshu=function (entity) {
            if(!entity){
                entity.FCL_NUM=0;
                return 0;
            }
            var ITSWHSEPLA_NUM=(+entity.ITSWHSEPLA_NUM)?(+entity.ITSWHSEPLA_NUM):0;
            var SUWHSEPLA_NUM=(+entity.SUWHSEPLA_NUM)?(+entity.SUWHSEPLA_NUM):0;
            var PACKING_NUMBER=(+entity.PACKING_NUMBER)?(+entity.PACKING_NUMBER):0;
            result=0;
            if(PACKING_NUMBER){
                result=parseInt((ITSWHSEPLA_NUM+SUWHSEPLA_NUM)/PACKING_NUMBER);
            }
            entity.FCL_NUM=result;
            return result;

        }

        //获取尾箱数量
        $scope.getWeixiangshu=function(entity){
            if(!entity){
                return 0;
            }
            var ITSWHSEPLA_NUM=(+entity.ITSWHSEPLA_NUM)?(+entity.ITSWHSEPLA_NUM):0;
            var SUWHSEPLA_NUM=(+entity.SUWHSEPLA_NUM)?(+entity.SUWHSEPLA_NUM):0;
            var PACKING_NUMBER=(+entity.PACKING_NUMBER)?(+entity.PACKING_NUMBER):0;
            result=0;
            if(PACKING_NUMBER){
                var ll=(ITSWHSEPLA_NUM+SUWHSEPLA_NUM)%PACKING_NUMBER;
                if(ll>0){
                    result=1;
                }
            }
            entity.LAST_NUM=result;
            return result;
        }

        //获取目的仓名称
        $scope.getWarhouseName=function (id) {
            var hous=$scope.wareHouses_all.filter(w=>w.WAREHOUSE_ID==id);
            if(hous.length){
                return hous[0].WAREHOUSE_NAME_CN;
            }
            return "";
        }

        //获取需求组织名称
        $scope.getOrganizationName=function (id) {
            var ors= $scope.organizations.filter(o=>o.ORGANISATION_ID==id);
            if(ors.length){
                return ors[0].ORGANISATION_NAME_CN;
            }
            return "";
        };

        //获取平台名称
        $scope.getChannelName=function (id) {
            if(!$scope.channels_all){
                return "";
            }
            var channels=$scope.channels_all.filter(c=>c.CHANNEL_ID==id);
            if(channels.length){
                return channels[0].CHANNEL_NAME_CN;
            }
            return "";
        }

        //获取组织下的平台
        function getChannels(entity) {
            return $scope.channels_all.filter(c=>c.ORGANISATION_ID==entity.ORGANISATION_id);
        }

        //编辑后触发
        $scope.gridOptions.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {
            if(newValue!=oldValue){

                if("CHANNEL_ID"==colDef.name){
                    rowEntity.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==rowEntity.ORGANISATION_ID&&w.CHANNEL_ID==rowEntity.CHANNEL_ID);
                    var ws=rowEntity.rowEntity.wareHouses.filter(w=>w.WAREHOUSE_TYPE_ID==5);
                    if(ws.length){
                        rowEntity.WAREHOUSE_ID=ws[0].WAREHOUSE_ID;
                    }else{
                        rowEntity.WAREHOUSE_ID="";
                    }
                }
                if(colDef.name=="ITSWHSEPLA_NUM"){//中转 如果大于中转仓库存弹出消息
                    var kuchu=$scope.getZhongzhuancangkucun(rowEntity);
                    if(newValue&& (+newValue>kuchu)){
                        $confirm({ text: transervice.tran(messageService.dispatchPlan_n)}).then(function(){

                        },function(){
                            rowEntity.ITSWHSEPLA_NUM=oldValue;
                        })
                    }
                }

                if(colDef.name=="SUWHSEPLA_NUM"){//中转 如果大于中转仓库存弹出消息
                    var kuchu=$scope.getGongyingshangkucun(rowEntity);
                    if(newValue&& (+newValue>kuchu)){
                        $confirm({ text: transervice.tran(messageService.dispatchPlan_m)}).then(function(){

                        },function(){
                            rowEntity.SUWHSEPLA_NUM=oldValue;
                        })
                    }

                }
            }

        }


        //统计
        $scope.zongxiangshu=function () {
            var zongxiangshu=0;
            if($scope.gridOptions.gridApi&&$scope.gridOptions.gridApi.selection) {
                var datas = $scope.gridOptions.gridApi.selection.getSelectedRows();
                datas.forEach(a => {
                    var zs = $scope.getZhengxiangshu(a);
                    if (zs) {
                        zongxiangshu += zs;
                    }
                    zongxiangshu+=a.LAST_NUM
                })
            }
            return zongxiangshu;
        };

        $scope.zongtiji= function (){
            var zongtiji=0
            if($scope.gridOptions.gridApi&&$scope.gridOptions.gridApi.selection){
                var datas=$scope.gridOptions.gridApi.selection.getSelectedRows();
                datas.forEach(a=>{
                    // 体积(CBM) =  长（cm） * 宽（cm） * 高（cm）/ 1000000 FCL_LONG  FCL_HIGH FCL_WIDE
                    if((a.FCL_LONG&&(+a.FCL_LONG))&&(a.FCL_HIGH&&(+a.FCL_HIGH))&&(a.FCL_WIDE&&(+a.FCL_WIDE))){

                        var tiji=a.FCL_LONG*a.FCL_HIGH*a.FCL_WIDE/1000000;
                        zongtiji+=tiji;
                    }

                    //加上尾箱体积 'TAILBOX_HIGH',TAILBOX_LONG TAILBOX_WIDE

                    if(a.TAILBOX_HIGH&&a.TAILBOX_LONG&&a.TAILBOX_WIDE){
                        var tiji=a.TAILBOX_HIGH*a.TAILBOX_LONG*a.TAILBOX_WIDE/1000000;
                        zongtiji+=tiji;
                    }


                })
            }
            return zongtiji.toFixed(2);
        }



        //行选中事件
        $scope.gridOptions.getGridApi=function(gridApi){
            $scope.gridApi=gridApi;
            // gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
            //     toji();
            //
            // });
            // gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
            //     toji();
            // });
        };

        //生产发运单
        $scope.createDispatchOrder=function () {
            var selectEntitys= $scope.gridOptions.gridApi.selection.getSelectedRows();

            if(!selectEntitys.length){
                return  Notification.error(transervice.tran(messageService.error_empty));
            }
            selectEntitys=angular.copy(selectEntitys);
            var models=[];
            for(var i=0;i<selectEntitys.length;i++){
                var item=selectEntitys[i];

                //检查发运数量总和是否大于已好数量
                var fahuoshuliang=(item.ITSWHSEPLA_NUM?item.ITSWHSEPLA_NUM:0)+(item.SUWHSEPLA_NUM?item.SUWHSEPLA_NUM:0);
                if(fahuoshuliang>item.PURCHASE){
                    return  Notification.error(transervice.tran(messageService.dispatchPlan_c1));
                }
                if(!item.ORGANISATION_ID){
                    return  Notification.error(transervice.tran(messageService.dispatchPlan_c2));
                }
                if(!item.DELIVERY_AT_PLAN){
                    return  Notification.error(transervice.tran(messageService.dispatchPlan_c3));
                }
                if(!item.WAREHOUSE_ID){
                    return  Notification.error(transervice.tran(messageService.dispatchPlan_c4));
                }

                if(!item.CHANNEL_ID){
                    return  Notification.error(transervice.tran(messageService.dispatchPlan_c5));
                }

                var  ITSWHSEPLA_NUM=item.ITSWHSEPLA_NUM?(+item.ITSWHSEPLA_NUM):0;
                var SUWHSEPLA_NUM=item.SUWHSEPLA_NUM?(+item.SUWHSEPLA_NUM):0;
                if(!ITSWHSEPLA_NUM&&!SUWHSEPLA_NUM){
                    return  Notification.error(transervice.tran(messageService.dispatchPlan_c6));
                }
                if(item.PRE_ORDER_AT){
                    item.PRE_ORDER_AT=new Date(item.PRE_ORDER_AT).getTime()/1000;
                }
                item.DELIVERY_AT_PLAN=new Date(item.DELIVERY_AT_PLAN).getTime()/1000;
                item.DISPATCH_REMARKS= item.DISPATCH_REMARKS?item.DISPATCH_REMARKS:'',
                    item.SUWHSEPLA_NUM=item.SUWHSEPLA_NUM?item.SUWHSEPLA_NUM:0;
                item.ITSWHSEPLA_NUM=item.ITSWHSEPLA_NUM?item.ITSWHSEPLA_NUM:0;

                //统计尾箱每箱数量
                item.TAILBOX_BNUMBER=item.ALREADY_GGOODS_NUM-item.FCL_NUM*item.PACKING_NUMBER;

                //var model={
                //    ORGANISATION_CODE:item.ORGANISATION_CODE,
                //    DELIVERY_AT:item.DELIVERY_AT_PLAN?new Date(item.DELIVERY_AT_PLAN).getTime()/1000:"",
                //    PSKU_CODE:item.PSKU_CODE,
                //    PARTNER_CODE:item.PARTNER_CODE,
                //    PU_ORDER_ID:item.PU_ORDER_ID,
                //    IMPORT_STATE:item.IMPORT_STATE,
                //    CHANNEL_CODE:item.CHANNEL_CODE,
                //    ITSWHSEPLA_NUM:item.ITSWHSEPLA_NUM?item.ITSWHSEPLA_NUM:0,
                //    SUWHSEPLA_NUM:item.SUWHSEPLA_NUM?item.SUWHSEPLA_NUM:0,
                //    URGENT_ORDER:item.URGENT_ORDER,
                //    TRANSPORT_MODE:item.TRANSPORT,
                //    WAREHOUSE_CODE:item.WAREHOUSE_CODE,
                //    DISPATCH_REMARKS:item.DISPATCH_REMARKS?item.DISPATCH_REMARKS:'',
                //    CGORGANISATION_CODE:item.CGORGANISATION_CODE
                //}
                //models.push(model);
            }

            var saveData={batchMTC:selectEntitys};

            return  httpService.httpHelper(httpService.webApi.api, "shipment/dispatchnote", "make_dispatch", "POST",saveData).then(
                function (result){
                    Notification.success(transervice.tran(result.message));
                    init();
                })

        }



        //Excel导入
        $scope.import = function ($file) {
            $("input[type=file]").click();
        }
        $scope.read = function (workbook) {
            var sheet_name_list = workbook.SheetNames;
            var notMatchRows=[];
            var matchRows=[];

            sheet_name_list.forEach(function(y) { /* iterate through sheets */
                var worksheet = workbook.Sheets[y];
                var rows = XLSX.utils.sheet_to_row_object_array(worksheet);

                // var json_object = JSON.stringify(XL_row_object);
                for(var i=0;i<rows.length;i++){
                    var row=rows[i];
                    formateRow(row);
                    var sku=row['实际SKU型号'];
                    var orderNo=row['采购单号']
                    var os=$scope.gridOptions.data.filter(d=>d.PSKU_CODE==sku && d.ORDER_CD==orderNo);
                    if(!os.length){
                        notMatchRows.push(i+1);
                        continue;
                    }
                    matchRows.push(i+1);


                    if(os.length){
                        var dObj=os[0];

                        //1） 计划时间 填入 到计划发运日期
                        dObj.DELIVERY_AT_PLAN=$filter("date")(new Date(row['计划时间']),"yyyy-MM-dd");

                        //2）存货仓库如果是 自营仓，则将出运数量填到 中转仓出货数，如果是 供应商，则将出运数量填到 供应商出货数。
                        if(row['存货仓库']=='自营仓'){
                            dObj.ITSWHSEPLA_NUM=row['出运数量'];
                        }else if(row['存货仓库']=='供应商'){
                            dObj.SUWHSEPLA_NUM=row['出运数量'];
                        }

                        //3）海外目的仓是FBA 或者万邑通或者isure100，则 目的仓 默认填入对应组织和平台下的托管仓（仓库类型5），如果是自营，则默认填入对应平台的海外自营仓（仓库类型2）。
                        if(row['海外目的仓']=='FBA'||row['海外目的仓']=='万邑通'||row['海外目的仓']=='isure100'){
                            var ws=dObj.rowEntity.wareHouses.filter(w=>w.WAREHOUSE_TYPE_ID==5);
                            if(ws.length){
                                dObj.WAREHOUSE_ID=ws[0].WAREHOUSE_ID;
                            }
                        }else if(row['海外目的仓']=='自营'){
                            var ws=dObj.rowEntity.wareHouses.filter(w=>w.WAREHOUSE_TYPE_ID==2);
                            if(ws.length){
                                dObj.WAREHOUSE_ID=ws[0].WAREHOUSE_ID;
                            }
                        }

                        //6）将备注和改后贴标合并放入备注栏位。
                        dObj.DISPATCH_REMARKS=row['备注']+' '+row['改后贴标'];

                        $scope.gridOptions.gridApi.rowEdit.setRowsDirty([dObj]);

                    }

                }

            });


            Notification.error(transervice.tran('匹配不成功行:'+notMatchRows.toString()+"</br>"+"匹配成功行："+matchRows.toString()));


            function formateRow(row){
                for(var key in row){
                    var str="";
                    for(var i=0;i<key.length;i++){
                        if(key[i]!=false){
                            str+=key[i];
                        }
                    }
                    row[str]=row[key];

                }
            }
        }

        //$scope.error = function (e) {
        //    /* DO SOMETHING WHEN ERROR IS THROWN */
        //    console.log(e);
        //}







    }
});
