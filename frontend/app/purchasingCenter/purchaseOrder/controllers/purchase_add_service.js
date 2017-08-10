define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'css!bowerLibs/bootstrap-fileinput/css/fileinput.min.css',
        'fileinput-zh',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/gridDefaultOptionsService',
        // 'app/masterCenter/product/controllers/selectSupplier_service',
        "app/masterCenter/bchannel/controllers/partner_list_service",
        'app/common/directives/selectOrganisationDirt',
        'app/common/directives/singleSelectDirt',
        'app/common/directives/inputBlurDirt'
    ],
    function (angularAMD) {

        angularAMD.service(
            'purchase_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "purchase_add_Ctrl",
                            backdrop: "static",
                            //size: "llg",//lg,sm,md,llg,ssm
                            size:"85%",
                            templateUrl: 'app/purchasingCenter/purchaseOrder/views/purchase_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("purchase_add_Ctrl", function ($scope, $confirm, $filter, $timeout, amHttp, httpService, model, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService,partner_list_service) {



            $scope.followUserOptions = {
                dataTextField: "STAFF_NAME_CN",
                dataValueField: "USER_INFO_ID",
                autoBind: true,
                url:httpService.webApi.api+"/users/userinfo/index",
                search:{
                    select:['staff.STAFF_NAME_CN','u_user_info.*'],
                    joinwith:['u_staffinfo2'],
                    andwhere:["=",'USER_INFO_ID','0'],
                    distinct:1
                },
            };

            $scope.rowEntity = {channelList:[],accounts:[],suppliers:[],moneys:[],fnkSkus:[]};

            //获取结算方式
            $scope.payTypes=commonService.getDicList("PARTNER_SMETHOD");

            //获取平台类型
            $scope.channelTypes=commonService.getDicList("CHANNEL");

            //订单类型:1采购订单 2内部采购订单'
            $scope.orderTypes=[{D_VALUE:1,D_NAME_CN:'采购订单'},{D_VALUE:2,D_NAME_CN:'内部采购订单'}];

            //获取结算方式
            $scope.payTypes=commonService.getDicList("PARTNER_SMETHOD");

            //采购订单类型
            $scope.purchaseTypes=commonService.getDicList("PLAN_TYPE");


            //平台列表
            (function () {
                var selectWhere = {limit:"*"};
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.channelList_all = result.data;
                        }
                    }
                );
            })();


            //获取货币种类
            (function () {
                var selectWhere = {limit:"0"};

                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(function (datas) {
                    $scope.moneys=datas.data;
                    $scope.rowEntity.moneys=datas.data;

                })
            })();

            //获取需求组织，默认采购组织
            $scope.options_caigou={
                getList:function (orgList) {
                    $scope.organizations_caigou=orgList;
                }
            }

            $scope.options_xuqiu={
                types:[4],
                // getList:function (orgList) {
                //     $scope.orgList=orgList;
                // },
                change:function (id,selectModel) {
                    $scope.organizations_change(id,selectModel);
                }
            };

            //获取账号
            (function getAllAccounts() {

                var dataSearch = {
                    limit:"0"
                };

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index", "POST", dataSearch).then(function (datas) {
                    $scope.accounts_all=datas.data;

                })

            })();


            function init() {
                $scope.model = {
                    DORGANISATION_ID:"",
                    ORGANISATION_ID:"",
                    PSKU_NAME_CN:"",
                    PRE_ORDER_AT:$filter("date")(new Date(),"yyyy-MM-dd HH:mm:ss"),
                    PARTNER_ID:"",
                    FUPUSER_ID:"",
                    MONEY_ID:"",
                    SMETHOD:"",
                    ORDER_TYPE:"",
                    CHANNEL_ID:"",
                    PLAN_TYPE:"",
                    DELETED_STATE:0,
                    ORDER_STATE:1,
                    pu_purchase_detail:[],

                }
                $scope.copyModel=angular.copy($scope.model);

            }

                init();



            $scope.organizations_change=function (id) {
                var id=$scope.model.DORGANISATION_ID;
                if(!$scope.copyModel){
                    return;
                }
                if(!$scope.copyModel.DORGANISATION_ID){
                    $scope.model.DORGANISATION_ID=id;
                    $scope.copyModel.DORGANISATION_ID=id;
                    //获取需求组织下的平台
                    if(! $scope.model.DORGANISATION_ID){
                        $scope.channels=[];
                    }else{
                        $scope.channels=$scope.channelList_all.filter(c=>c.ORGANISATION_ID==$scope.model.DORGANISATION_ID);
                        $scope.rowEntity.channelList=$scope.channels;

                    }
                    return;

                }
                $confirm({ text: transervice.tran('切换组织会清空本单，是否确认?') })
                    .then(function () {
                       init();
                        $scope.model.DORGANISATION_ID=id;
                        $scope.copyModel.DORGANISATION_ID=id;
                        $scope.gridOptions_detail.data=[];
                        //获取需求组织下的平台
                        if(! $scope.model.DORGANISATION_ID){
                            $scope.channels=[];
                        }else{
                            $scope.channels=$scope.channelList_all.filter(c=>c.ORGANISATION_ID==$scope.model.DORGANISATION_ID);
                            $scope.rowEntity.channelList=$scope.channels;

                        }
                        $scope.refreshFlower=true;
                        setTimeout(function () {
                            $scope.followUserOptions.value="";
                            $scope.followUserOptions.search.andwhere=["=","u_user_info.USER_INFO_ID",0]
                            $scope.refreshFlower=false;
                            $scope.$apply();
                        },10)

                    },function () {
                        $scope.model.DORGANISATION_ID=$scope.copyModel.DORGANISATION_ID;

                    });



            }

            $scope.channel_change=function () {

                var channels=$scope.channels.filter(c=>c.CHANNEL_ID==$scope.model.CHANNEL_ID);
                // $scope.accounts=getAccount($scope.model);
                // $scope.rowEntity.accounts=$scope.accounts;
                    if(channels.length){
                        $scope.model.b_channel=channels[0];
                        $scope.model.CHANNEL_NAME_CN=channels[0].CHANNEL_NAME_CN;
                        // $scope.gridOptions_detail.data.forEach(d=>{
                        //     d.PLATFORM_SKU=$scope.model.CHANNEL_CODE;
                        //     d.CHANNEL_NAME_CN=$scope.model.CHANNEL_NAME_CN;
                        //     //d.rowEntity.accounts=$scope.accounts
                        // })
                    }

            }

            //根据平台需求组织获取账号
            function getAccount (entity) {

                var arr=[];
                if(entity.DORGANISATION_ID&&entity.CHANNEL_ID){
                    arr=$scope.accounts_all.filter(a=>a.CHANNEL_ID==$scope.model.CHANNEL_ID&&a.ORGANISATION_ID==$scope.model.DORGANISATION_ID);
                }
                return arr;

            }



            //选择供应商
            $scope.selectSupplier=function () {
                partner_list_service.showDialog([]).then(function (data) {
                    if(data.PARTNER_ID==$scope.model.PARTNER_ID){
                        return;
                    }
                    if(!$scope.copyModel.PARTNER_ID){
                        $scope.model.pa_partner=data;
                        $scope.model.PARTNER_ID=data.PARTNER_ID;
                        $scope.model.PARTER_NAME_CN=data.PARTNER_NAME_CN;
                        $scope.copyModel.PARTNER_ID=data.PARTNER_ID;
                        return;
                    }
                    $confirm({text:transervice.tran('切换供应商会清空本单，是否确认?')}).then(function(){

                        init();
                        $scope.model.pa_partner=data;
                        $scope.model.PARTNER_ID=data.PARTNER_ID;
                        $scope.model.PARTER_NAME_CN=data.PARTNER_NAME_CN;
                        $scope.copyModel.PARTNER_ID=data.PARTNER_ID;
                        $scope.gridOptions_detail.data=[];
                        $scope.channels=[];
                        $scope.rowEntity.channelList=[];

                    });



                })
            }

            $scope.returnEntity={};
            $scope.followUserChange=function (item) {

                if(item.selectModel!=null){

                }
            }




            $scope.skuOptions = {
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_ID",
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search:{where:["and",["=","g_product_sku.PSKU_STATE",1]],
                    joinwith:['b_unit','g_product_sku_fnsku','g_product_sku_price','g_product_sku_packing','g_next_cycle'],
                    distinct:1
                },
            };

            // 设置样式函数
            function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
                var entity=row.entity;
                var entitys=gridDefaultOptionsService.getDirtyRows($scope.gridOptions_detail.data,['PSKU_ID', 'PURCHASE', 'TAX_RATE', 'TAX_UNITPRICE', 'COMMI_PERIOD','DEMAND_AT','FNSKU','PLATFORM_SKU','ACCOUNT_ID','DETAIL_REMARKS'],"PU_PURCHASE_ID");
                if(entitys.indexOf(entity)!=-1){
                    grid.api.rowEdit.setRowsDirty([entity]);
                }

                return '';

            }

            //采购订单详情列表配置
            $scope.gridOptions_detail={
                columnDefs: [

                    {
                        field: 'xuhao',
                        displayName: transervice.tran('序号'),
                        cellTemplate:'<div class=" ui-grid-cell-contents text-center">{{row.entity.index+1}}</div>',
                        width:50,
                        //cellClass:cellClass

                    },{
                        field: 'PSKU_CODE',
                        displayName: transervice.tran('*SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions_detail.showDirt"  id="f{{grid.appScope.gridOptions_detail.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_detail.columnDefs.indexOf(col.colDef)}}" ><div  single-select options="row.entity.options" select-model="row.entity.PSKU_ID" change="grid.appScope.selectRowChange(row)" row="row"></div></div>',
                        width:170
                    },
                    {
                        field: 'PSKU_NAME_CN',
                        displayName: transervice.tran('产品名称'),
                        enableCellEdit:false,
                        //editableCellTemplate:'<div><form><input type="text"  maxlength="5" ui-grid-editor ng-model="row.entity.PSKU_NAME_CN"></form></div>',
                        width:100
                    },
                    {
                        field: 'b_unit.UNIT_NAME_CN',
                        displayName: transervice.tran('*计量单位'),
                        cellTemplate:'<div class=" ui-grid-cell-contents text-right">{{row.entity.b_unit.UNIT_NAME_CN}}</div>',
                        enableCellEdit:false,
                        width:100

                    },
                    {
                        field: 'PURCHASE',
                        displayName: transervice.tran('*数量'),
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="0" max="999999999" min="0" ui-grid-editor ng-model="row.entity.PURCHASE"></form></div>',
                        width:100,
                        cellClass:"text-right"
                    },
                    {
                        field: 'TAX_RATE',
                        displayName: transervice.tran('*税率'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_RATE?row.entity.TAX_RATE+"%":row.entity.TAX_RATE}}</div>',
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="2" max="9999999999" min="0" ui-grid-editor ng-model="row.entity.TAX_RATE"></form></div>',
                        width:100,
                        cellClass:"text-right"
                    },
                    {
                        field: 'TAX_UNITPRICE',
                        displayName: transervice.tran('*含税价格'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_UNITPRICE|number:2}}</div>',
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAX_UNITPRICE"></form></div>',
                        width:100,
                        cellClass:"text-right"
                    },
                    {
                        field: 'TAX_AMOUNT',
                        displayName: transervice.tran('价税合计'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.jiashuiheji(row.entity)|number:2}}</div>',
                        enableCellEdit:false,
                        width:100,
                        cellClass: 'text-right'
                    },
                    {
                        field: 'UPC_REMARKS',
                        displayName: transervice.tran('不含税价格'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.buhanshuijiage(row.entity)|number:2}}</div>',
                        enableCellEdit:false,
                        width:110,
                        cellClass: 'text-right'
                    },
                    {
                        field: 'UPC_REMARKS',
                        displayName: transervice.tran('不含税金额'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.buhanshuijine(row.entity)|number:2}}</div>',
                        enableCellEdit:false,
                        width:110,
                        cellClass: 'text-right'
                    },
                    {
                        field: 'COMMI_PERIOD',
                        displayName: transervice.tran('*承诺交期'),
                        width:130,
                        //type: 'date',
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions_detail.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_detail.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.COMMI_PERIOD"></div>',
                    },
                    {
                        field: 'DEMAND_AT',
                        displayName: transervice.tran('需求日期'),
                        width:130,
                        //type: 'date',
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions_detail.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_detail.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.DEMAND_AT"></div>',

                    },
                    {
                        field: 'FNSKU',
                        displayName: transervice.tran('产品条码'),
                        width:100,
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'FNSKU',
                        editDropdownValueLabel: 'FNSKU',
                        //editDropdownOptionsArray: $scope.accounts,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fnkSkus",

                    },
                    {
                        field: 'PLATFORM_SKU',
                        displayName: transervice.tran('平台SKU'),
                        width:100,
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'PLATFORM_SKU',
                        editDropdownValueLabel: 'PLATFORM_SKU',
                        //editDropdownOptionsArray: $scope.accounts,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fnkSkus",
                    },
                    {
                        field: 'ACCOUNT_ID',
                        displayName: transervice.tran('账号'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getAccountName(row.entity.ACCOUNT_ID)}}</div>',
                        //cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'ACCOUNT_ID',
                        editDropdownValueLabel: 'ACCOUNT',
                        //editDropdownOptionsArray: $scope.accounts,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.accounts",
                        width:100
                    },
                    {
                        field: 'DETAIL_REMARKS',
                        displayName: transervice.tran('备注'),
                        width:100
                    },
                    {
                        field: 'RGOODS_NUMBER',
                        displayName: transervice.tran('已收货数量'),
                        enableCellEdit:false,
                        width:110,
                        cellClass:"text-right"
                    },
                    {
                        field: 'RGOODS_NUMBER',
                        displayName: transervice.tran('未收货数量'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.weishouhuoshuliang(row.entity)}}</div>',
                        enableCellEdit:false,
                        width:110,
                    },
                    {
                        field: 'THIS_AMOUNT',
                        displayName: transervice.tran('已申付金额'),//待完善
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{(row.entity.THIS_AMOUNT?row.entity.THIS_AMOUNT:0)|number:2}}</div>',
                        enableCellEdit:false,
                        width:110,
                        cellClass:"text-right"
                    },
                    {
                        field: 'THIS_PAID_AMOUNT',
                        displayName: transervice.tran('未申付金额'),//待完善
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.weishenfujine(row.entity)|number:2}}</div>',
                        enableCellEdit:false,
                        width:110,
                        cellClass:"text-right"
                    },
                    {
                        field: 'RGOODS_AMOUNT',
                        displayName: transervice.tran('已付金额'),
                        enableCellEdit:false,
                        width:110,
                        cellClass:"text-right"
                    },
                    {
                        field: 'weifu',
                        displayName: transervice.tran('未付金额'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{grid.appScope.weifujine(row.entity)|number:2}}</div>',
                        enableCellEdit:false,
                        width:110,
                    }
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_detail);

            $scope.gridOptions_detail.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {
                if(newValue!=oldValue&&newValue) {
                    if (colDef.name == "PURCHASE") {
                         var prices=rowEntity.rowEntity.prices.filter(p=>p.MONEY_ID==$scope.model.MONEY_ID);
                         if(prices.length){
                             var count=0;
                             var price=null;
                             prices.forEach(p=>{
                                 if(newValue>=p.PRODUCT_SKU_MOQ&&p.UNIT_PRICE){
                                     if(p.PRODUCT_SKU_MOQ>count){
                                         count=p.PRODUCT_SKU_MOQ;
                                         price=p;
                                     }
                                 }
                             })
                             if(price){
                                 rowEntity.TAX_UNITPRICE=price.UNIT_PRICE;
                             }
                         }
                    }
                }

            }


            $scope.addDetail=function () {

                if(!$scope.model.DORGANISATION_ID){
                    Notification.error(transervice.tran('请选择需求组织！'))
                    return;
                }

                if(!$scope.model.PARTNER_ID){
                    Notification.error(transervice.tran('请选择供应商！'))
                    return;
                }

                var newItem={
                    PSKU_ID:"",
                    DETAIL_REMARKS:"",
                    PLATFORM_SKU:"",
                    CHANNEL_NAME_CN:$scope.model.CHANNEL_NAME_CN,
                    ACCOUNT_ID:"",
                    CHANNEL_ID:$scope.model.CHANNEL_ID,
                    FNSKU:"",
                    DEMAND_AT:"",
                    COMMI_PERIOD:"",
                    UPC_REMARKS:"",
                    DELETED_STATE:0,
                    RGOODS_AMOUNT:0,
                    RGOODS_NUMBER:0,
                    index:$scope.gridOptions_detail.data.length,
                    options:angular.copy($scope.skuOptions),
                    rowEntity:angular.copy($scope.rowEntity)

                }
                newItem.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND",$scope.model.DORGANISATION_ID]);

                //获取组织税率
                if($scope.model.ORGANISATION_ID){

                    var ors=$scope.organizations_caigou&&$scope.organizations_caigou.filter(a=>a.ORGANISATION_ID==$scope.model.ORGANISATION_ID);
                    if(ors && ors.length&&ors[0].TARIFF){
                        newItem.TAX_RATE=parseInt(ors[0].TARIFF*100);
                    }
                }
                $scope.gridOptions_detail.data.unshift(newItem);
                gridDefaultOptionsService.refresh($scope.gridOptions_detail,"PSKU_C");
                // $scope.gridOptions_detail.data.forEach(item=>{
                //     item.options=angular.copy($scope.skuOptions)
                //     var options=item.options;
                //     options.search.where.push(["=","g_product_sku.ORGAN_CODE_DEMAND",$scope.model.DORGANISATION_CODE]);
                //     if(item.PSKU_CODE){
                //         options.value=item.PSKU_CODE;
                //         options.search.andwhere=["=","g_product_sku.PSKU_ID",item.PSKU_ID];
                //     }else{
                //         options.value="";
                //         options.search.andwhere=["=","g_product_sku.PSKU_ID",0];
                //     }
                //
                // })
                //
                // var datas=$scope.gridOptions_detail.data;
                // $scope.gridOptions_detail.data=[];
                // $scope.addBtnDisabled=true;
                // setTimeout(function () {
                //     $scope.gridOptions_detail.data=datas;
                //     $scope.gridOptions_detail.gridApi.grid.refresh();
                //     $scope.addBtnDisabled=false;
                // },10);
            }


            $scope.delDetail=function () {
                var entitys=$scope.gridOptions_detail.gridApi.selection.getSelectedRows();
                if(!entitys.length){
                    return  Notification.error(transervice.tran("请选择需要操作的数据"));
                }
                $scope.gridOptions_detail.data=$scope.gridOptions_detail.data.filter(a=>$.inArray(a,entitys)==-1);
            }

            //获取账号名称
            $scope.getAccountName=function (accountId) {

                if(!$scope.accounts_all){
                    return "";
                }
                var arr=$scope.accounts_all.filter(c=>c.ACCOUNT_ID==accountId);
                if(arr.length){
                    return arr[0].ACCOUNT;
                }
                return "";
            }
            
            //价税合计
            $scope.jiashuiheji=function (entity) {
                if(entity.PURCHASE && entity.TAX_UNITPRICE){
                    var result=(entity.PURCHASE*entity.TAX_UNITPRICE).toFixed(2);
                    entity.TAX_AMOUNT=result;
                    return result;
                }
                return "";
            }
            //不含税价格
            $scope.buhanshuijiage=function (entity) {

                var TAX_RATE=entity.TAX_RATE?entity.TAX_RATE:0;
                var TAX_UNITPRICE=entity.TAX_UNITPRICE?entity.TAX_UNITPRICE:0;

                var result=(TAX_UNITPRICE/(1+((+TAX_RATE)/100))).toFixed(2);
                entity.NOT_TAX_UNITPRICE=result;
                return result;


            }
            
            //不含税金额
            $scope.buhanshuijine=function (entity) {
                var p=$scope.buhanshuijiage(entity);
                var result=0;
                if(entity.PURCHASE && p){
                    result=(entity.PURCHASE*p).toFixed(2);
                }
                entity.NOT_TAX_AMOUNT=result;
                return result;
            }

            //未申付金额
            $scope.weishenfujine=function(entity){
                var heji= $scope.jiashuiheji(entity);
                if(!heji){
                    return 0;
                }
                var THIS_AMOUNT=entity.THIS_AMOUNT?entity.THIS_AMOUNT:0;
                return heji-THIS_AMOUNT;
            }

            //总金额
            $scope.zongjine=function () {
                var count=0;
                if($scope.gridOptions_detail&&$scope.gridOptions_detail.data){
                    $scope.gridOptions_detail.data.forEach(d=>{
                        var co=$scope.jiashuiheji(d);
                        if(co){
                            count+=parseFloat(co);
                        }
                    })
                }

                if(count){
                    return count;
                }
                return 0;
            }

            //未收货数量
            $scope.weishouhuoshuliang=function(entity){
                if(!entity.PURCHASE){
                    return 0;
                }
                var RGOODS_NUMBER=entity.RGOODS_NUMBER?entity.RGOODS_NUMBER:0;
                return entity.PURCHASE-RGOODS_NUMBER;
            }

            //未付金额
            $scope.weifujine=function(entity){
               var heji= $scope.jiashuiheji(entity);
                if(!heji){
                    return 0;
                }
                var RGOODS_AMOUNT=entity.RGOODS_AMOUNT?entity.RGOODS_AMOUNT:0;
                return heji-RGOODS_AMOUNT;
            }





            $scope.selectRowChange= function (row) {
                if (row) {
                    row.isDirty = true;
                    row.isError = true;
                    $scope.gridOptions_detail.gridApi.grid.refresh();
                    var selectModel=row.selectModel;
                    row.entity.PSKU_NAME_CN=selectModel.PSKU_NAME_CN;
                    row.entity.PSKU_ID=selectModel.PSKU_ID;
                    row.entity.PSKU_CODE=selectModel.PSKU_CODE;
                    row.entity.b_unit=selectModel.b_unit;
                    row.entity.UNIT_ID=selectModel.b_unit.UNIT_ID;

                    if(selectModel.g_product_sku_packing){
                        row.entity.EACH_NUMBER=selectModel.g_product_sku_packing.PACKING_NUMBER;
                        row.entity.FCL_LONG=selectModel.g_product_sku_packing.PACKING_LONG;
                        row.entity.FCL_WIDE=selectModel.g_product_sku_packing.PACKING_WIDE;
                        row.entity.FCL_HIGH=selectModel.g_product_sku_packing.PACKING_HIGH;
                        row.entity.GROSS_WEIGHT=selectModel.g_product_sku_packing.GROSS_WEIGHT;
                        row.entity.FCL_NET_WEIGHT=selectModel.g_product_sku_packing.NET_WEIGHT;
                    }



                    if($scope.model.PARTNER_ID){ //获取供应商价格
                        row.entity.rowEntity.prices=[];
                        if(selectModel.g_product_sku_price && selectModel.g_product_sku_price.length){
                            // row.entity.rowEntity.prices=selectModel.g_product_sku_price;
                            var prices =selectModel.g_product_sku_price.filter(p=>p.PARTNER_ID==$scope.model.PARTNER_ID);
                            if(prices.length){
                                row.entity.rowEntity.prices=prices;
                            }
                              // row.entity.TAX_UNITPRICE=prices[0].UNIT_PRICE;
                        }

                    }
                    if(selectModel.g_product_sku_fnsku&&selectModel.g_product_sku_fnsku.length) {
                        row.entity.rowEntity.fnkSkus = selectModel.g_product_sku_fnsku;

                        var dfaultFnskus = selectModel.g_product_sku_fnsku.filter(g=>g.DEFAULTS == 1);

                        if (dfaultFnskus && dfaultFnskus.length) {
                            var def = dfaultFnskus[0];
                            if ($scope.model.CHANNEL_ID && $scope.model.b_channel.PLATFORM_TYPE_ID == 2) {
                                row.entity.PLATFORM_SKU = def.PLATFORM_SKU;
                                row.entity.FNSKU = def.FNSKU;
                                row.entity.ACCOUNT_ID = def.ACCOUNT_ID;
                            }
                        }
                    }

                    //设置交期默认值
                    if(selectModel.g_next_cycle){
                        row.entity.COMMI_PERIOD=$filter("date")(new Date().getTime()+selectModel.g_next_cycle.DELIVERY*24*60*60*1000,"yyyy-MM-dd")
                    }


                    var accountIds=selectModel.g_product_sku_fnsku.map(a=>a.ACCOUNT_ID);
                    row.entity.rowEntity.accounts=$scope.accounts_all.filter(a=>accountIds.indexOf(a.ACCOUNT_ID)!=-1);


                }

            }


            //付款记录列表
            $scope.gridOptions_payment={
                columnDefs: [
                    {
                        field: 'xuhao',
                        displayName: transervice.tran('序号'),
                        cellTemplate:'<span>1</span>',
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    },
                    {
                        field: 'PARTNER_NAME_CN',
                        displayName: transervice.tran('SKU'),
                        enableCellEdit: false,

                    },{
                        field: 'PARTNER_ANAME_EN',
                        displayName: transervice.tran('产品名称'),
                        enableCellEdit: false,

                    },
                    {
                        field: 'PMONEY_CODE',
                        displayName: transervice.tran('申请币种'),
                        enableCellEdit: false,
                    },{
                        field: 'PAYMENT_NUMBER',
                        displayName: transervice.tran('申付金额'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right" >{{row.entity.PAYMENT_NUMBER|number:2}}</div>',
                        enableCellEdit: false,

                    },{
                        field: 'PAYMENT_AT',
                        displayName: transervice.tran('申付日期'),
                        enableCellEdit: false,

                    },{
                        field: 'APPLICANT_CODE',
                        displayName: transervice.tran('申付人'),
                        enableCellEdit: false,
                    },{
                        field: 'AUDIT_STATE',
                        displayName: transervice.tran('申付状态'),
                        enableCellEdit: false,
                    },{
                        field: 'PAMONEY_CODE',
                        displayName: transervice.tran('实付币种'),
                        enableCellEdit: false,
                    },{
                        field: 'PAID_AT',
                        displayName: transervice.tran('实付日期'),
                        enableCellEdit: false,
                    },{
                        field: 'PAYMENT_REMARKS',
                        displayName: transervice.tran('备注'),
                        enableCellEdit: false,
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_payment);





            //保持方法
            $scope.save=function(){
               if(!$scope.model.DORGANISATION_ID){
                   return Notification.error(transervice.tran("请输入需求组织"));
               }
                if(!$scope.model.ORGANISATION_ID){
                    return Notification.error(transervice.tran("请输入采购组织"));
                }
                if(!$scope.model.PRE_ORDER_AT){
                    return Notification.error(transervice.tran("请输入下单时间"));
                }
                if(!$scope.model.DORGANISATION_ID){
                    return Notification.error(transervice.tran("请输入需求组织"));
                }
                if(!$scope.model.PARTNER_ID){
                    return Notification.error(transervice.tran("请选择供应商"));
                }
                if(!$scope.model.FUPUSER_ID){
                    return Notification.error(transervice.tran("请输入采购跟进人"));
                }
                if(!$scope.model.MONEY_ID){
                    return Notification.error(transervice.tran("请输入货币种类"));
                }
                if(!$scope.model.SMETHOD){
                    return Notification.error(transervice.tran("请输入结算方式"));
                }
                if(!$scope.model.CHANNEL_ID){
                    return Notification.error(transervice.tran("请输入平台"));
                }

                if(!$scope.model.ORDER_TYPE){
                    Notification.error(transervice.tran("请选择订单类型"));
                    return false;
                }

                var saveModel=angular.copy($scope.model);
                saveModel.pu_purchase_detail=angular.copy($scope.gridOptions_detail.data);
                if(!saveModel.pu_purchase_detail.length){
                    return Notification.error(transervice.tran("采购明细至少要有一条"));
                }
                for(var i = 0 ;i<saveModel.pu_purchase_detail.length;i++){
                    var a = saveModel.pu_purchase_detail[i];
                    if(!a.COMMI_PERIOD || a.COMMI_PERIOD.length<=0){
                        return Notification.error(transervice.tran("请输入承诺交期"));
                    }else{
                        a.COMMI_PERIOD=new Date(a.COMMI_PERIOD).getTime()/1000;
                    }
                    if(a.DEMAND_AT){
                        a.DEMAND_AT=new Date(a.DEMAND_AT).getTime()/1000;
                    }
                    //转换税率
                    if(a.TAX_RATE){
                        a.TAX_RATE=(a.TAX_RATE/100)
                    }

                }
                saveModel.pu_purchase_detail.forEach(a=>{
                    if(a.PURCHASE){
                        a.FCL_NUMBER=0;
                        a.TAILBOX_BNUMBER=0;
                        a.EACH_NUMBER=a.EACH_NUMBER&&+a.EACH_NUMBER?a.EACH_NUMBER:0;
                        a.TAILBOX_NUMBER=0;
                        //计算整箱箱数 等于 采购数量/ 每箱数量，得出数值后向下取整。 随着每箱数量的修改而实时变化
                         a.FCL_NUMBER= parseInt(a.PURCHASE/a.EACH_NUMBER);

                        //计算尾箱每箱数量 等于（采购数量 - 整箱数*每箱数量）
                        a.TAILBOX_BNUMBER=a.PURCHASE-(a.FCL_NUMBER*a.EACH_NUMBER);

                        //计算尾箱数 当尾箱每箱数量 >0时，为1  （采购部表示如有尾箱，只可能有一个）
                        if(a.TAILBOX_BNUMBER>0){
                            a.TAILBOX_NUMBER=1;
                        }
                    }

                })

                saveModel.PRE_ORDER_AT=new Date(saveModel.PRE_ORDER_AT).getTime()/1000;
                saveModel.ORDER_AMOUNT=$scope.zongjine();

                saveModel.IMPORT_STATE = 1;    

                return httpService.httpHelper(httpService.webApi.api, "purchase/purchase","update", "POST", saveModel).then(function (datas) {
                            Notification.success(transervice.tran("保存成功"))
                            $modalInstance.close();
                })


            }

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }

            //




        });
    })