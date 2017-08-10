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
        'app/common/Services/messageService'
    ],
    function (angularAMD) {

        angularAMD.service(
            'purchase_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model,index,count,isLink,searchConditions,idList) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "purchase_edit_Ctrl",
                            backdrop: "static",
                            //size: "llg",//lg,sm,md,llg,ssm
                            size:"85%",
                            templateUrl: 'app/purchasingCenter/purchaseOrder/views/purchase_edit.html?ver='+_version_,
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
                                isLink:function(){
                                    return isLink;
                                },
                                searchConditions:function () {
                                    return searchConditions;
                                },
                                idList:function () {
                                    return idList;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("purchase_edit_Ctrl", function ($scope, $confirm, $filter, $timeout, amHttp, httpService, model,index,count,isLink,searchConditions,idList,$modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService,partner_list_service,messageService) {

             $scope.index=index;
             //$scope.count=count;
            if(idList)
            $scope.count=idList.length;
            $scope.isLink=isLink;
            $scope.listConditions=searchConditions;

            $scope.followUserOptions = {
                dataTextField: "STAFF_NAME_CN",
                dataValueField: "USER_INFO_ID",
                autoBind: true,
                url:httpService.webApi.api+"/users/userinfo/index",
                value:model.FUPUSER_ID,
                search:{
                    select:['staff.STAFF_NAME_CN','u_user_info.*'],
                    joinwith:['u_staffinfo2'],
                    distinct:1
                },
            };


            $scope.skuOptions = {
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_ID",
                autoBind: true,
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search:{where:["and",["=","g_product_sku.PSKU_STATE",1]],
                    joinwith:['b_unit','g_product_sku_fnsku','g_product_sku_price','g_product_sku_packing','g_next_cycle'],
                    distinct:1
                },
            };

            $scope.rowEntity = {channelList:[],accounts:[],suppliers:[],moneys:[],fnkSkus:[]};

            //获取结算方式
            $scope.payTypes=commonService.getDicList("PARTNER_SMETHOD");

            //订单类型:1采购订单 2内部采购订单'
            $scope.orderTypes=[{D_VALUE:"1",D_NAME_CN:'采购订单'},{D_VALUE:"2",D_NAME_CN:'内部采购订单'}];

            //获取结算方式
            $scope.payTypes=commonService.getDicList("PARTNER_SMETHOD");

            //采购订单类型
            $scope.purchaseTypes=commonService.getDicList("PLAN_TYPE");

            //付款状态
            $scope.payStates=commonService.getDicList("PAYMENT_STATE");


            var watchObject={};//构造观察对象
            //等待完成
            function waitModel(lable,fn) {
                setTimeout(function () {
                    if(watchObject[lable]){
                        fn();
                    }else{
                        waitModel(lable,fn);
                    }
                },100)
            }


            //平台列表
            (function () {
                var selectWhere = {limit:"0"};
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.channelList_all = result.data;
                            watchObject.channelList_all=result.data;
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
                (function () {
                    var dataSearch = {
                        "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
                        "joinwith":["o_organisationt"]
                    };

                    httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                        $scope.organizations_xuqiu=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);

                    });
                    var dataSearch1 =  {
                        "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",2]],
                        "joinwith":["o_organisationt"]
                    };

                    httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch1).then(function (datas) {
                        $scope.organizations_caigou=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);


                    });
                })();

            //获取账号
            (function (){

                var dataSearch = {
                    limit:"0"
                };

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index", "POST", dataSearch).then(function (datas) {
                    $scope.accounts_all=datas.data;
                    watchObject.accounts_all=datas.data;

                })

            })();



            function init() {
                var searchCoditions={

                    where:["and",["<>","pu_purchase.DELETED_STATE",1],["=","pu_purchase.PU_PURCHASE_ID",model.PU_PURCHASE_ID]],
                    distinct:1,
                    joinwith:["pa_partner","pu_purchase_detail_sum","b_channel","o_organisation","o_organisation_o","b_money","u_userinfo_g",'u_userinfo','u_userinfo_a'],
                }

                httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "index", "POST",searchCoditions).then(
                    function (result){
                        $scope.model= result.data[0];
                        model=angular.copy($scope.model);
                        $scope.copyModel=angular.copy($scope.model);

                        $scope.model.pu_purchase_detail=$scope.model.pu_purchase_detail_sum;
                        delete $scope.model.pu_purchase_detail_sum;
                        $scope.gridOptions_payment.getPage();
                        for(var i=0;i<$scope.model.pu_purchase_detail.length;i++){
                            var item=$scope.model.pu_purchase_detail[i];
                            item.index=i;
                        }
                        excuInit();
                    }
                );

            }


                init();

          //model查询出来的方法
         function excuInit() {
                 $scope.followUserOptions.search.andwhere = ["=", "u_user_info.USER_INFO_ID", $scope.model.FUPUSER_ID]
                 $scope.followUserOptions.value = $scope.model.FUPUSER_ID;
                 $scope.refreshFlower=false;

             //转换时间
             // $scope.model.PRE_ORDER_AT=$filter("date")(new Date($scope.model.PRE_ORDER_AT), "yyyy-MM-dd HH:mm:ss");
             $scope.model.PRE_ORDER_AT= $filter("date")(new Date($scope.model.PRE_ORDER_AT*1000),"yyyy-MM-dd");
             if($scope.model.AUTITO_AT)
                $scope.model.AUTITO_AT=$filter("date")(new Date($scope.model.AUTITO_AT*1000),"yyyy-MM-dd");

             //查找组织下的平台
             waitModel("channelList_all",function () {
                 if(! $scope.model.DORGANISATION_ID){
                     $scope.channels=[];
                 }else{
                     $scope.channels=$scope.channelList_all.filter(c=>c.ORGANISATION_ID==$scope.model.DORGANISATION_ID);

                     //查找组织平台下的账号
                     waitModel("accounts_all",function () {

                         var channels=$scope.channels.filter(c=>c.CHANNEL_ID==$scope.model.CHANNEL_ID);
                         if(channels.length){
                             $scope.model.CHANNEL_NAME_CN=channels[0].CHANNEL_NAME_CN;
                             $scope.model.b_channel=channels[0];

                             if($scope.model.pu_purchase_detail){
                                 $scope.model.pu_purchase_detail.forEach(d=>{

                                     d.CHANNEL_NAME_CN=$scope.model.CHANNEL_NAME_CN;
                                     d.rowEntity=angular.copy($scope.rowEntity);


                                    if(d.g_product_sku){
                                        var dfaultFnskus=d.g_product_sku.g_product_sku_fnsku1;

                                        if(dfaultFnskus){
                                            d.rowEntity.fnkSkus=dfaultFnskus;
                                            var accountIds=dfaultFnskus.map(a=>a.ACCOUNT_ID);
                                            d.rowEntity.accounts=$scope.accounts_all.filter(a=>accountIds.indexOf(a.ACCOUNT_ID)!=-1);
                                        }
                                        if(d.g_product_sku.g_product_sku_price){
                                            var prices=d.g_product_sku.g_product_sku_price.filter(p=>p.PARTNER_ID==$scope.model.PARTNER_ID);
                                            if(prices){
                                                d.rowEntity.prices=prices;
                                            }
                                        }

                                    }
                                     //转换税率
                                     if(d.TAX_RATE){
                                         d.TAX_RATE=(d.TAX_RATE*100);
                                     }
                                     //时间转换
                                     if(d.COMMI_PERIOD)
                                     d.COMMI_PERIOD=$filter("date")(new Date(d.COMMI_PERIOD*1000),"yyyy-MM-dd");
                                     if(d.DEMAND_AT)
                                     d.DEMAND_AT=$filter("date")(new Date(d.DEMAND_AT*1000),"yyyy-MM-dd");

                                     d.options=angular.copy($scope.skuOptions);
                                     d.options.value=d.PSKU_ID;
                                     d.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND",$scope.model.DORGANISATION_ID]);
                                     d.options.search.andwhere=["=","g_product_sku.PSKU_ID",d.PSKU_ID]
                                 })

                                 $scope.gridOptions_detail.data=$scope.model.pu_purchase_detail;
                                 $scope.gridOptions_detail.gridApi.grid.refresh();

                             }

                         }


                     })
                 }
             });
         }


            $scope.organizations_change=function () {

                var id=$scope.model.DORGANISATION_ID;
                if(!$scope.copyModel){
                    return;
                }
                if(!$scope.copyModel.DORGANISATION_ID){;
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
                        $scope.model={DORGANISATION_ID:id,
                                       PU_PURCHASE_CD:$scope.model.PU_PURCHASE_CD,
                                       PU_PURCHASE_ID:$scope.model.PU_PURCHASE_ID
                                     };
                        $scope.copyModel={DORGANISATION_ID:id};
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


                        $scope.model={PARTNER_ID:data.PARTNER_ID,
                            PARTER_NAME_CN:data.PARTNER_NAME_CN,
                            pa_partner:data,
                            PU_PURCHASE_CD:$scope.model.PU_PURCHASE_CD,
                            PU_PURCHASE_ID:$scope.model.PU_PURCHASE_ID
                        };
                        $scope.copyModel={PARTNER_ID:data.PARTNER_ID};
                        $scope.gridOptions_detail.data=[];
                        $scope.channels=[];
                        $scope.rowEntity.channelList=[];

                        $scope.refreshFlower=true;
                        setTimeout(function () {
                            $scope.refreshFlower=false;
                        },10)

                    });
                })
            }

            $scope.returnEntity={};
            $scope.followUserChange=function (item) {

                if(item.selectModel!=null){

                }
            }

            // 设置样式函数
            function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
                var entity=row.entity;
                if(entity.copyModel){
                    entity.copyModel=angular.copy(entity);
                    return "";
                }
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
                        enableCellEdit:false
                        //cellClass:cellClass

                    },{
                        field: 'PSKU_CODE',
                        displayName: transervice.tran('*SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions_detail.showDirt" id="f{{grid.appScope.gridOptions_detail.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_detail.columnDefs.indexOf(col.colDef)}}"><div  single-select options="row.entity.options" select-model="row.entity.PSKU_ID" change="grid.appScope.selectRowChange(row)" row="row"></div></div>',
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
                        width:170
                    },
                    {
                        field: 'PSKU_NAME_CN',
                        displayName: transervice.tran('产品名称'),
                        //editableCellTemplate:'<div><form><input type="text"  maxlength="5" ui-grid-editor ng-model="row.entity.PSKU_NAME_CN"></form></div>',
                        enableCellEdit:false,
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
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="0"  max="999999999" min="0" ui-grid-editor ng-model="row.entity.PURCHASE"></form></div>',
                        width:100,
                        cellClass:"text-right",
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
                    },
                    {
                        field: 'TAX_RATE',
                        displayName: transervice.tran('*税率'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_RATE}}%</div>',
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="2" max="9999999999" min="0" ui-grid-editor ng-model="row.entity.TAX_RATE"></form></div>',
                        width:100,
                        cellClass:"text-right",
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
                    },
                    {
                        field: 'TAX_UNITPRICE',
                        displayName: transervice.tran('*含税价格'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_UNITPRICE|number:2}}</div>',
                        editableCellTemplate:'<div><form><input formatting="false"  numeric decimals="2" max="9999999999"  min="0" ui-grid-editor ng-model="row.entity.TAX_UNITPRICE"></form></div>',
                        width:100,
                        cellClass:"text-right",
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
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
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
                        //type: 'date',
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate:'<div  id="f{{grid.appScope.gridOptions_detail.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_detail.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.COMMI_PERIOD"></div>',
                    },
                    {
                        field: 'DEMAND_AT',
                        displayName: transervice.tran('需求日期'),
                        width:130,
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
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
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },

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
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
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
                        width:100,
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
                    },
                    {
                        field: 'DETAIL_REMARKS',
                        displayName: transervice.tran('备注'),
                        width:100,
                        cellEditableCondition: function (row) {
                            return $scope.model.ORDER_STATE!=2;
                        },
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
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.RGOODS_AMOUNT|number:2}}</div>',
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
                    PSKU_CODE:"",
                    isNew:true,
                    DETAIL_REMARKS:"",
                    PLATFORM_SKU:"",
                    CHANNEL_NAME_CN:$scope.model.CHANNEL_NAME_CN,
                    RGOODS_NUMBER:0,
                    RGOODS_AMOUNT:0,
                    ACCOUNT_ID:"",
                    CHANNEL_ID:$scope.model.CHANNEL_ID,
                    FNSKU:"",
                    DEMAND_AT:"",
                    COMMI_PERIOD:"",
                    UPC_REMARKS:"",
                    DELETED_STATE:0,
                    index:$scope.gridOptions_detail.data.length,
                    options:angular.copy($scope.skuOptions),
                    rowEntity:$scope.rowEntity

                };
                newItem.options.search.where.push(["=","g_product_sku.ORGAN_ID_DEMAND",$scope.model.DORGANISATION_ID]);

                //获取组织税率
                if($scope.model.ORGANISATION_ID){
                    var ors=$scope.organizations_caigou&&$scope.organizations_caigou.filter(a=>a.ORGANISATION_ID==$scope.model.ORGANISATION_ID);
                    if(ors&&ors.length&&ors[0].TARIFF){
                        newItem.TAX_RATE=parseInt(ors[0].TARIFF*100);
                    }
                }

                $scope.gridOptions_detail.data.unshift(newItem);
                gridDefaultOptionsService.refresh($scope.gridOptions_detail,"PSKU_ID");
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
                //
                // },10);



            }


            $scope.delDetail=function () {
                var entitys=$scope.gridOptions_detail.gridApi.selection.getSelectedRows();
                if(!entitys.length){
                 return  Notification.error(transervice.tran("请选择需要操作的数据"));
                }

                var delRows=entitys.filter(e=>e.PURCHASE_DETAIL_ID);//要删除的有id的明细
                var allRows=$scope.gridOptions_detail.data.filter(e=>e.PURCHASE_DETAIL_ID);//全部有明细id

                if(delRows.length==allRows.length){
                    return  Notification.error(transervice.tran("已存在的明细至少要留有一条"));
                }

                return $confirm({ text: transervice.tran('是否确认删除?') })
                    .then(function () {

                        if(delRows.length){
                            //delRows=delRows.map(e=>e.PURCHASE_DETAIL_ID);
                            var postData={batch:delRows};

                            httpService.httpHelper(httpService.webApi.api, "purchase/purchasedetail", "delete", "POST", postData).then(function (datas) {
                                Notification.success(datas.message);
                                $scope.gridOptions_detail.data=$scope.gridOptions_detail.data.filter(a=>$.inArray(a,entitys)==-1);

                            });
                        }else{
                            $scope.gridOptions_detail.data=$scope.gridOptions_detail.data.filter(a=>$.inArray(a,entitys)==-1);
                        }


                    });

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
                return 0;
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
            };

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

            //未申付金额
            $scope.weishenfujine=function(entity){
                var heji= $scope.jiashuiheji(entity);
                if(!heji){
                    return 0;
                }
                var THIS_AMOUNT=entity.THIS_AMOUNT?entity.THIS_AMOUNT:0;
                return heji-THIS_AMOUNT;
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
                            var prices =selectModel.g_product_sku_price.filter(p=>p.PARTNER_ID==$scope.model.PARTNER_ID);
                            if(prices.length){
                                row.entity.rowEntity.prices=prices;
                                // row.entity.TAX_UNITPRICE=prices[0].UNIT_PRICE;
                            }

                        }

                    }

                    if(selectModel.g_product_sku_fnsku&&selectModel.g_product_sku_fnsku.length){
                        row.entity.rowEntity.fnkSkus=selectModel.g_product_sku_fnsku;
                        var dfaultFnskus=selectModel.g_product_sku_fnsku.filter(g=>g.DEFAULTS==1);

                        if(dfaultFnskus&&dfaultFnskus.length){
                            var def=dfaultFnskus[0];
                            if($scope.model.CHANNEL_ID&&$scope.model.b_channel.PLATFORM_TYPE_ID==2){
                                row.entity.PLATFORM_SKU=def.PLATFORM_SKU;
                                row.entity.FNSKU=def.FNSKU;
                                row.entity.ACCOUNT_ID=def.ACCOUNT_ID;
                            }
                        }else{
                            row.entity.PLATFORM_SKU="";
                            row.entity.FNSKU="";
                            row.entity.ACCOUNT_ID="";
                        }

                        var accountIds=selectModel.g_product_sku_fnsku.map(a=>a.ACCOUNT_ID);
                        row.entity.rowEntity.accounts=$scope.accounts_all.filter(a=>accountIds.indexOf(a.ACCOUNT_ID)!=-1);
                    }else{
                        row.entity.rowEntity.fnkSkus=[];
                        row.entity.rowEntity.accounts=[]
                        row.entity.PLATFORM_SKU="";
                        row.entity.FNSKU="";
                        row.entity.ACCOUNT_ID="";
                    }

                    //设置交期默认值
                    if(selectModel.g_next_cycle){
                        row.entity.COMMI_PERIOD=$filter("date")(new Date().getTime()+selectModel.g_next_cycle.DELIVERY*24*60*60*1000,"yyyy-MM-dd")
                    }







                }

            }


            //付款记录列表
            $scope.gridOptions_payment={
                columnDefs: [
                    {
                        field: 'index',
                        displayName: transervice.tran('序号'),
                        cellTemplate:'<div class=" ui-grid-cell-contents text-center">{{row.entity.index+1}}</div>',
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    },
                    {
                        field: 'pu_purchase_detail.PSKU_CODE',
                        displayName: transervice.tran('SKU'),
                        enableCellEdit: false,
                    },{
                        field: 'pu_purchase_detail.PSKU_NAME_CN',
                        displayName: transervice.tran('产品名称'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'pu_payment.PMONEY_ID',
                        displayName: transervice.tran('申请币种'),
                        cellTemplate:'<div class=" ui-grid-cell-contents">{{grid.appScope.getMoneyName(row.entity.pu_payment.PMONEY_ID)}}</div>',
                        enableCellEdit: false,
                    },{
                        field: 'THIS_AMOUNT',
                        displayName: transervice.tran('申付金额'),
                        cellTemplate:'<div class=" ui-grid-cell-contents text-right">{{row.entity.THIS_AMOUNT|number:2}}</div>',
                        enableCellEdit: false,
                    },{
                        field: 'pu_payment.PAYMENT_AT',
                        displayName: transervice.tran('申付日期'),
                        enableCellEdit: false,
                    },{
                        field: 'pu_payment.pa_user.u_staffinfo.STAFF_NAME_CN',
                        displayName: transervice.tran('申付人'),
                        enableCellEdit: false,
                    },{
                        field: 'pu_payment.PAYMENT_STATE',
                        displayName: transervice.tran('申付状态'),
                        cellTemplate:'<div class=" ui-grid-cell-contents" >{{grid.appScope.getPayStateName(row.entity.pu_payment.PAYMENT_STATE)}}</div>',
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    },{
                        field: 'pu_payment.PAMONEY_ID',
                        displayName: transervice.tran('实付币种'),
                        cellTemplate:'<div class=" ui-grid-cell-contents">{{grid.appScope.getMoneyName(row.entity.pu_payment.PAMONEY_ID)}}</div>',
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    },{
                        field: 'THIS_PAID_AMOUNT',
                        displayName: transervice.tran('实付金额'),
                        cellTemplate:'<div class=" ui-grid-cell-contents text-right">{{row.entity.THIS_PAID_AMOUNT|number:2}}</div>',
                        enableCellEdit: false,
                    },{
                        field: 'pu_payment.PAID_AT',
                        displayName: transervice.tran('实付日期'),
                        enableCellEdit: false,
                    },{
                        field: 'pu_payment.PAYMENT_REMARKS',
                        displayName: transervice.tran('备注'),
                        enableCellEdit: false,
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_payment);


            //付款记录初始化数据
            //翻页查询
            $scope.gridOptions_payment.getPage=function (pageNo,pageSize) {
                var searchCoditions={
                    limit: $scope.gridOptions_payment.paginationPageSize,
                    where:["=", "pu_payment_detail.PU_PURCHASE_CD", $scope.model.PU_PURCHASE_CD],
                    joinwith:["pu_purchase_detail","pu_payment"]
                }
                httpService.httpHelper(httpService.webApi.api, "purchase/paymentdetail", "index?page="+$scope.gridOptions_payment.paginationCurrentPage, "POST",searchCoditions).then(function (datas) {

                    for(var i=0;i<datas.data.length;i++){
                        var d=datas.data[i];
                        d.index=i;

                        if(d.pu_payment){
                            if(d.pu_payment.PAID_AT)
                                d.pu_payment.PAID_AT=$filter("date")(new Date(d.pu_payment.PAID_AT*1000),"yyyy-MM-dd");
                            if(d.pu_payment.PAYMENT_AT)
                                d.pu_payment.PAYMENT_AT=$filter("date")(new Date(d.pu_payment.PAYMENT_AT*1000),"yyyy-MM-dd");
                        }
                    }
                    $scope.gridOptions_payment.data=datas.data;
                    $scope.gridOptions_payment.totalItems=datas._meta.totalCount;

                    // $scope.gridOptions_supplier.gridApi.grid.refresh();

                })

            }



            //获取付款状态名称
            $scope.getPayStateName=function (id) {
                var states=$scope.payStates.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";

            }

            //获取货币名称
            $scope.getMoneyName=function (id) {
                if(!$scope.rowEntity.moneys){
                    return;
                }
                var items=$scope.rowEntity.moneys.filter(c=>c.MONEY_ID==id);
                if(items.length){
                    return items[0].MONEY_NAME_CN;
                }
                return "";
            }


            //审核
            $scope.audit=function () {

                var checkResult=checkModel();
                if(!checkResult){
                    return;
                }

                $confirm({ text: transervice.tran(messageService.confirm_audit)}).then(function(){
                    var auditModel=angular.copy($scope.model);
                    auditModel.edit_type=1;
                    auditModel.ORDER_STATE=2;

                    auditModel.pu_purchase_detail=angular.copy($scope.gridOptions_detail.data);


                    auditModel.pu_purchase_detail.forEach(a=>{
                        if(a.COMMI_PERIOD){
                            a.COMMI_PERIOD=new Date(a.COMMI_PERIOD).getTime()/1000;
                        }
                        if(a.DEMAND_AT){
                            a.DEMAND_AT=new Date(a.DEMAND_AT).getTime()/1000;
                        }
                        if(a.TAX_RATE){
                            a.TAX_RATE=(a.TAX_RATE/100);
                        }

                    })

                    auditModel.PRE_ORDER_AT=new Date(auditModel.PRE_ORDER_AT).getTime()/1000;
                    if($scope.model.AUTITO_AT)
                        auditModel.AUTITO_AT=new Date(auditModel.AUTITO_AT).getTime()/1000;

                    auditModel.ORDER_AMOUNT=$scope.zongjine();

                    var delData={batchMTC:[auditModel]};
                  httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "update", "POST",delData).then(
                        function (){
                            Notification.success(transervice.tran('审核成功！'));
                            init();
                        }
                    );
                })

            }


            //反审核
            $scope.notAudit=function () {
                $confirm({ text: transervice.tran(messageService.confirm_audit_f)}).then(function(){
                    var auditModel=angular.copy($scope.model);
                    auditModel.edit_type=3;
                    auditModel.ORDER_STATE=1;

                    auditModel.pu_purchase_detail.forEach(a=>{
                        if(a.COMMI_PERIOD){
                            a.COMMI_PERIOD=new Date(a.COMMI_PERIOD).getTime()/1000;
                        }
                        if(a.DEMAND_AT){
                            a.DEMAND_AT=new Date(a.DEMAND_AT).getTime()/1000;
                        }
                        if(a.TAX_RATE){
                            a.TAX_RATE=(a.TAX_RATE/100);
                        }

                    })
                    auditModel.PRE_ORDER_AT=new Date(auditModel.PRE_ORDER_AT).getTime()/1000;
                    if($scope.model.AUTITO_AT)
                        auditModel.AUTITO_AT=new Date(auditModel.AUTITO_AT).getTime()/1000;

                    var delData={batchMTC:[auditModel]};

                    return httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "update", "POST",delData).then(
                        function (){
                            Notification.success(transervice.tran('反审核成功！'));
                            init();
                        }
                    );
                })

            }

            //首单
            $scope.firstPage=function () {
                $scope.nextBtnDisabled=true;
                turnPageQuery(0).then(function () {
                    $scope.index=0;
                    $scope.nextBtnDisabled=false;
                })
            }
            //上一单
            $scope.prePage=function () {
                $scope.nextBtnDisabled=true;
                turnPageQuery($scope.index-1).then(function () {
                    $scope.index-=1;
                    $scope.nextBtnDisabled=false;
                })
            }

            //下一单
            $scope.nextPage=function () {
                $scope.nextBtnDisabled=true;
                turnPageQuery($scope.index+1).then(function () {
                    $scope.index+=1;
                    $scope.nextBtnDisabled=false;
                })

            }


            //尾单
            $scope.lastPage=function () {
                $scope.nextBtnDisabled=true;
                turnPageQuery($scope.count-1).then(function () {
                    $scope.index=$scope.count-1;
                    $scope.nextBtnDisabled=false;
                })
            }
            
            //翻单查询
            function turnPageQuery(offset) {
                    $scope.refreshFlower=true;
                    $scope.listConditions.joinwith=["pa_partner","pu_purchase_detail_sum","b_channel","o_organisation","o_organisation_o","b_money","u_userinfo_g",'u_userinfo','u_userinfo_a'];
                    // $scope.listConditions.offset=offset;

                //     var searchCoditions={
                //     where:["and",["<>","pu_purchase.DELETED_STATE",1]],
                //     distinct:1,
                //     joinwith:["pa_partner","pu_purchase_detail_sum","b_channel","o_organisation","o_organisation_o","b_money","u_userinfo_g",'u_userinfo','u_userinfo_a'],
                //     orderby:{"pu_purchase.ORDER_STATE":"ASC","pu_purchase.UPDATED_AT":"DESC"},
                //     offset:offset
                // }
                // $scope.listConditions.where=["and", ["<>", "pu_purchase.DELETED_STATE", 1], ["=", "pu_purchase.PU_PURCHASE_ID", idList[offset]]];


            return httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "view?id="+idList[offset], "POST",$scope.listConditions).then(
                    function (result){
                        $scope.model= result.data;
                        model=angular.copy($scope.model);
                        $scope.copyModel=angular.copy($scope.model);
                        $scope.model.pu_purchase_detail=$scope.model.pu_purchase_detail_sum||[];
                        delete $scope.model.pu_purchase_detail_sum;
                        $scope.gridOptions_payment.getPage();
                        for(var i=0;i<$scope.model.pu_purchase_detail.length;i++){
                            var item=$scope.model.pu_purchase_detail[i];
                            item.index=i;
                        }
                        excuInit();
                    }
                );
            }


            //检查必填项
            function checkModel() {

                if(!$scope.model.DORGANISATION_ID){
                     Notification.error(transervice.tran("请输入需求组织"));
                     return false;
                }
                if(!$scope.model.ORGANISATION_ID){
                     Notification.error(transervice.tran("请输入采购组织"));
                    return false;
                }
                if(!$scope.model.PRE_ORDER_AT){
                    Notification.error(transervice.tran("请输入下单时间"));
                    return false;
                }
                if(!$scope.model.DORGANISATION_ID){
                     Notification.error(transervice.tran("请输入需求组织"));
                    return false;
                }
                if(!$scope.model.PARTNER_ID){
                     Notification.error(transervice.tran("请选择供应商"));
                    return false;
                }
                if(!$scope.model.FUPUSER_ID){
                     Notification.error(transervice.tran("请输入采购跟进人"));
                    return false;
                }
                if(!$scope.model.MONEY_ID){
                    Notification.error(transervice.tran("请输入货币种类"));
                    return false;
                }
                if(!$scope.model.SMETHOD){
                     Notification.error(transervice.tran("请输入结算方式"));
                    return false;
                }
                if(!$scope.model.CHANNEL_ID){
                    Notification.error(transervice.tran("请输入平台"));
                    return false;
                }
                if(!$scope.model.ORDER_TYPE){
                    Notification.error(transervice.tran("请选择订单类型"));
                    return false;
                }
                return true;
            }


            //保存方法
            $scope.save=function(){
                var checkResult=checkModel();
                if(!checkResult){
                    return;
                }
                var saveModel=angular.copy($scope.model);
                saveModel.pu_purchase_detail=angular.copy($scope.gridOptions_detail.data);


                saveModel.pu_purchase_detail.forEach(a=>{
                    if(!a.COMMI_PERIOD || a.COMMI_PERIOD.length<=0){
                        return Notification.error(transervice.tran("请输入承诺交期"));
                    }else{
                        a.COMMI_PERIOD=new Date(a.COMMI_PERIOD).getTime()/1000;
                    }
                    
                    if(a.DEMAND_AT){
                        a.DEMAND_AT=new Date(a.DEMAND_AT).getTime()/1000;
                    }
                    if(a.TAX_RATE){
                        a.TAX_RATE=(a.TAX_RATE/100);
                    }

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
                if($scope.model.AUTITO_AT)
                saveModel.AUTITO_AT=new Date(saveModel.AUTITO_AT).getTime()/1000;
                saveModel.ORDER_AMOUNT=$scope.zongjine();
               return httpService.httpHelper(httpService.webApi.api, "purchase/purchase","update", "POST", saveModel).then(function (datas) {
                            Notification.success(transervice.tran("保存成功"))
                            $modalInstance.close();
                })


            }

            //取消
            $scope.cancel = function () {
                if(model.ORDER_STATE!=$scope.model.ORDER_STATE){
                    $modalInstance.close();
                }else{
                    $modalInstance.dismiss(false);
                }

            }

            $scope.printType=1;
            $scope.printTypes=[
                {id:1,name:'直采模板（中）'},
                {id:2,name:'直采模板（英）'},
                {id:3,name:'代采模板（中）'},
                {id:4,name:'代采模板（英）'}
            ]
            //打印
            $scope.print = function(){
                var datas=$scope.model.pu_purchase_detail.filter(a=>a.PURCHASE_DETAIL_ID);
                if(!datas.length){
                    return Notification.error(transervice.tran("没有查询到对应的采购明细，无法打印"));
                }
                var NOT_PRINT =1;//1浏览 2打印
                var _blank = '';
                if(NOT_PRINT==1){
                    _blank = "_blank";
                }
                var form=$("<form>");//定义一个form表单
                form.attr("style","display:none");
                form.attr("target",_blank);
                form.attr("method","post");
                var input1=$("<input>");
                input1.attr("type","hidden");
                input1.attr("name","PURCHASE_CD");
                input1.attr("value",$scope.model.PU_PURCHASE_CD);
                var input2=$("<input>");
                input2.attr("type","hidden");
                input2.attr("name","PDF_NUM");
                input2.attr("value",$scope.printType);//模板1or2
                var input3=$("<input>");
                input3.attr("type","hidden");
                input3.attr("name","NOT_PRINT");
                input3.attr("value",NOT_PRINT);//1浏览2打印
                form.append(input1,input2,input3);

                form.attr("action",httpService.webApi.api+"/purchase/purchase/export_pdf");
                $("body").append(form);//将表单放置在web中
                form.submit();//表单提交

            }
            





        });
    })