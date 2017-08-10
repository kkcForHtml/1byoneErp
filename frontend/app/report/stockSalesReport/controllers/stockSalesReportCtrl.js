define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/multipleSelectDirt',
    'app/reportQuery/inventorySales/controllers/poDetail_list_service',
    'app/reportQuery/inventorySales/controllers/dispatchOrder_list_service',
    'app/reportQuery/inventorySales/controllers/salesOrder_list_service',
    'app/common/directives/select2-directive',
    'css!bowerLibs/select2/css/select2',
    'css!bowerLibs/select2/css/select2-bootstrap.css',


], function () {
    return   function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,messageService,poDetail_list_service,dispatchOrder_list_service,salesOrder_list_service) {

      //组织多选
      //   $scope.optionsZuzhi={
      //       dataTextField: "ORGANISATION_NAME_CN",
      //       dataValueField: "ORGANISATION_CODE",
      //       url:httpService.webApi.api+"/organization/organisationrm/index",
      //       search:{"where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
      //              "joinwith":["o_organisationt"]},
      //       dataFiled:"o_organisationt"
      //   }

        // //小分类多选
        // $scope.optionsSmallType={
        //     dataTextField: "SYSTEM_NAME_CN",
        //     dataValueField: "PRODUCT_TYPE_ID",
        //     url:httpService.webApi.api+"/master/product/prodskut/product_type_all",
        //     search:{"where": ["and",["=", "g_product_type.PRODUCT_TYPE_STATE", 1],["<>","g_product_type.PRODUCTOT_TYPE_ID","0"]],
        //            }
        // }

        //sku多选
        // $scope.optionsSKU={
        //     dataTextField: "PSKU_CODE",
        //     dataValueField: "PSKU_CODE",
        //     url:httpService.webApi.api+"/master/product/prodsku/index",
        //     search:{where:["and",["=","g_product_sku.PSKU_STATE",1]],
        //         distinct:1
        //     },
        // }

        $scope.orgOptions={data:[]};
        //获取组织
        (function () {
            var search={"where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
                "joinwith":["o_organisationt"],distinct:1,limit:0};
            httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST",search).then(
                function (result){
                    $scope.orgs=result.data.map(o=>o.o_organisationt);
                    $scope.orgs.forEach(a=>{
                         $scope.orgOptions.data.push({
                             "id": a.ORGANISATION_ID,
                             "text": a.ORGANISATION_NAME_CN,
                         })
                     })
                })

        })();

        //小分类
        $scope.typeOptions={data:[]};
        (function () {
            var search={"where": ["and",["=", "g_product_type.PRODUCT_TYPE_STATE", 1],["<>","g_product_type.PRODUCTOT_TYPE_ID","0"]],
                        distinct:1,
                        limit:0
                    }
            httpService.httpHelper(httpService.webApi.api, "master/product/prodskut", "product_type_all", "POST",search).then(
                function (result){
                    result.data.forEach(a=>{
                        $scope.typeOptions.data.push({
                            "id": a.PRODUCT_TYPE_ID,
                            "text": a.SYSTEM_NAME_CN,
                        })
                    })
                })

        })();

        //sku
        $scope.skuOptions={data:[]};
        (function () {
            var search={where:["and",["=","g_product_sku.PSKU_STATE",1]],
                distinct:1,
                limit:0
            }
            httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "index", "POST",search).then(
                function (result){
                    result.data.forEach(a=>{
                        $scope.skuOptions.data.push({
                            "id": a.PSKU_ID,
                            "text": a.PSKU_CODE,
                        })
                    })
                })
        })();

        //表格配置
        $scope.gridOptions= {
            columnDefs: [
                {
                    field: 'SKU_TYPE_SMALL',
                    displayName: transervice.tran('产品分类'),
                    enableCellEdit:false,
                    width:80
                },
                {
                    field: 'ORGANISATION_NAME',
                    displayName: transervice.tran('需求组织'),
                    enableCellEdit:false,
                    width:120

                },
                {
                    field: 'PSKU_CODE',
                    displayName: transervice.tran('SKU'),
                    enableCellEdit:false,
                    width:120
                }, {
                    field: 'PSKU_NAME_CN',
                    displayName: transervice.tran('产品名称'),
                    enableCellEdit:false,
                    width:120
                }, {
                    field: 'UNIT_NAME_CN',
                    displayName: transervice.tran('计量单位'),
                    enableCellEdit:false,
                    width:80
                },
                {
                    field: 'MANUFACTOR_INPRODUCTION',
                    displayName: transervice.tran('厂家在产'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.purchaseQuery(row.entity,1)">{{row.entity.MANUFACTOR_INPRODUCTION}}</a> </div>',
                    enableCellEdit:false,
                    width:80,
                    cellClass:"text-right"
                },
                {
                    field: 'MANUFACTOR_HAVE',
                    displayName: transervice.tran('厂家好货(已检)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.purchaseQuery(row.entity,2)">{{row.entity.MANUFACTOR_HAVE}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'DOMESTIC_WAREHOUSE',
                    displayName: transervice.tran('国内仓'),
                    // cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.purchaseQuery(row.entity)">{{row.entity.DOMESTIC_WAREHOUSE}}</a> </div>',
                    enableCellEdit:false,
                    width:80,
                    cellClass:'text-right'
                },
                {   field: 'FBA_AIRLIFT',
                    displayName: transervice.tran('空运在途(FBA)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.dispatchQuery(row.entity,1)">{{row.entity.FBA_AIRLIFT}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'FBA_SHIPPING',
                    displayName: transervice.tran('海运在途(FBA)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.dispatchQuery(row.entity,2)">{{row.entity.FBA_SHIPPING}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'PROP_AIRLIFT',
                    displayName: transervice.tran('空运在途(自营)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.dispatchQuery(row.entity,3)">{{row.entity.PROP_AIRLIFT}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'PROP_SHIPPING',
                    displayName: transervice.tran('海运在途(自营)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.dispatchQuery(row.entity,4)">{{row.entity.PROP_SHIPPING}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'PROP_LOCAL',
                    displayName: transervice.tran('当地自营仓'),
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'FBA_ALLOCATION',
                    displayName: transervice.tran('调拨在途(往FBA)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.trackQuery(row.entity,1)">{{row.entity.FBA_ALLOCATION}}</a> </div>',
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {   field: 'PROP_ALLOCATION',
                    displayName: transervice.tran('调拨在途(往自营)'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.trackQuery(row.entity,2)">{{row.entity.PROP_ALLOCATION}}</a> </div>',
                    enableCellEdit:false,
                    width:150,
                    cellClass:"text-right"
                },
                {   field: 'PROP_FBA_WAREHOUSE',
                    displayName: transervice.tran('当地FBA托管仓'),
                    enableCellEdit:false,
                    width:150,
                    cellClass:"text-right"

                },
                {   field: 'keshoukucun',
                    displayName: transervice.tran('可售库存'),//计算
                    enableCellEdit:false,
                    width:80,
                    cellClass:"text-right"
                },
                {   field: 'zongkucun',
                    displayName: transervice.tran('总库存'),//计算
                    enableCellEdit:false,
                    width:80,
                    cellClass:"text-right"
                },
                {   field: 'THREE_AVERAGE_SALES',
                    displayName: transervice.tran('3天平均销量'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.salesQuery(row.entity,3)">{{row.entity.THREE_AVERAGE_SALES}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {   field: 'SEVEN_AVERAGE_SALES',
                    displayName: transervice.tran('7天平均销量'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.salesQuery(row.entity,7)">{{row.entity.SEVEN_AVERAGE_SALES}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {
                    field: 'THIRTY_AVERAGE_SALES',
                    displayName: transervice.tran('30天平均销量'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.salesQuery(row.entity,30)">{{row.entity.THIRTY_AVERAGE_SALES}}</a> </div>',
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {
                    field: 'DAY_FBA_WAREHOUSE',
                    displayName: transervice.tran('日平均销量'),
                    cellTemplate:'<div> <a class="btn btn-link " ng-click="grid.appScope.salesQuery(row.entity,1)">{{row.entity.DAY_FBA_WAREHOUSE}}</a> </div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {
                    field: '测算日均销量',
                    displayName: transervice.tran('测算日均销量'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents  text-right"></div>',
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {    field: 'budanshuliang',
                    displayName: transervice.tran('补单数量'),//计算
                    enableCellEdit:false,
                    width:80,
                    cellClass:"text-right"
                },
                {    field: 'PLAN_NUMBER',
                    displayName: transervice.tran('已计划的补单数量'),
                    enableCellEdit:false,
                    width:150,
                    cellClass:"text-right"
                },
                {    field: 'diaobobuhuo',
                    displayName: transervice.tran('调拨补货FBA数量'),//计算
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {    field: 'kongyunbuhuo_fba',
                    displayName: transervice.tran('空运补货BFA数量'),//计算
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {    field: 'haiyunbuhuo_fba',
                    displayName: transervice.tran('海运补货FBA数量'),//计算
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {    field: 'kongyunbuhuo',
                    displayName: transervice.tran('空运补货自营数量'),//计算
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {    field: 'haiyunbuhuo',
                    displayName: transervice.tran('海运补货自营数量'),//计算
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {    field: '补单日期和天数',
                    displayName: transervice.tran('补单日期和天数'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.tianshu}}<br>{{row.entity.budanriqi}}</div>',
                    enableCellEdit:false,
                    width:140,
                    cellClass:"text-right"
                },
                {    field: '所有补货计划+自营空海运+自营库存+可售库存可售天数,日期',
                    displayName: transervice.tran('所有补货计划+自营空海运+自营库存+可售库存可售天数,日期'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.suoyoutianshu_ziying}}<br>{{row.entity.suoyouriqi_ziying}}</div>',
                    enableCellEdit:false,
                    width:410,
                    cellClass:"text-right"
                },
                {    field: '空海补货FBA可售库存可售天数,日期',
                    displayName: transervice.tran('空海补货FBA可售库存可售天数,日期'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.konghaitianshu_fba}}<br>{{row.entity.konghairiqi_fba}}</div>',
                    enableCellEdit:false,
                    width:300,
                    cellClass:"text-right"
                },
                {    field: '调拨+空+海运+FBA库存可售天数,日期',
                    displayName: transervice.tran('调拨+空+海运+FBA库存可售天数,日期'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.diaobotianshu_fba}}<br>{{row.entity.diaoboriqi_fba}}</div>',
                    enableCellEdit:false,
                    width:300,
                    cellClass:"text-right"
                },
                {    field: '调拨+空运+FBA库存可售天数,日期',
                    displayName: transervice.tran('调拨+空运+FBA库存可售天数,日期'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.diaobotianshu_fba_kong}}<br>{{row.entity.diaoboriqi_fba_kong}}</div>',
                    enableCellEdit:false,
                    width:250,
                    cellClass:"text-right"
                },
                {    field: 'FBA库存可售天数',
                    displayName: transervice.tran('FBA库存可售天数,日期'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.fbatianshu_fba_o}}<br>{{row.entity.fbariqi_fba_o}}</div>',
                    enableCellEdit:false,
                    width:190,
                    cellClass:"text-right"
                },
                {    field: '所有库存可售天数,日期',
                    displayName: transervice.tran('所有库存可售天数,日期'),//计算
                    cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.suoyoutianshu}}<br>{{row.entity.suoyouriqi}}</div>',
                    enableCellEdit:false,
                    width:200,
                    cellClass:"text-right"
                },
                {    field: 'NEXT_CYCLE',
                    displayName: transervice.tran('下单周期'),
                    enableCellEdit:false,
                    width:80,
                    cellClass:"text-right"
                },
                {    field: 'anquankucun',
                    displayName: transervice.tran('安全库存'),//计算
                    enableCellEdit:false,
                    width:80,
                    cellClass:"text-right"
                },
                {    field: 'kongyunkucun_min',
                    displayName: transervice.tran('空运最小库存'),//计算
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {    field: 'haiyunkucun_min',
                    displayName: transervice.tran('海运最小库存'),//计算
                    enableCellEdit:false,
                    width:120,
                    cellClass:"text-right"
                },
                {    field: 'diaobokucun_min',
                    displayName: transervice.tran('调拨最小库存'),//计算
                    enableCellEdit:false,
                    width:150,
                    cellClass:"text-right"
                }
            ],
            // enablePagination: false, //是否分页，默认为true
            // enablePaginationControls: false, //使用默认的底部分页
            enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

        };
        gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

        //查询条件
             $scope.searchConditions={
                 sku:"",
                 organization:"",
                 small_type:"",
                 // page:$scope.gridOptions.paginationCurrentPage||1,
                 limit:$scope.gridOptions.paginationPageSize||15
             }

       function init(){
           $scope.searchConditions.limit=$scope.gridOptions.paginationPageSize||15;
           var search=angular.copy($scope.searchConditions);
           if(search.sku)
               search.sku=search.sku.split(",");
           else
               search.sku=[];

           if(search.organization)
               search.organization=search.organization.split(",");
           else
               search.organization=[];

           if(search.small_type)
               search.small_type=search.small_type.split(",");
           else
               search.small_type=[];

           httpService.httpHelper(httpService.webApi.api, "report/inventorysales", "salesindex?page="+$scope.gridOptions.paginationCurrentPage, "POST",search).then(
               function (result){

                   $scope.gridOptions.data=result.data||[];
                   $scope.gridOptions.totalItems=result._meta.totalCount;
                   $scope.gridOptions.data.forEach(entity=>{
                       keshoukucun(entity);
                       zongkucun(entity);
                       cesuanrijunxiaoliang(entity);
                       budanshuliang(entity);
                       diaobobuhuo(entity);
                       kongyunbuhuo_fba(entity);
                       haiyunbuhuo_fba(entity);
                       kongyunbuhuo(entity);
                       haiyunbuhuo(entity);
                       budanriqi_tianshu(entity);
                       suoyouriqi_tianshu_ziying(entity);
                       konghairiqi_tianshu_fba(entity);
                       diaoboriqi_tianshu_fba(entity);
                       diaoboriqi_tianshu_fba_kong(entity);
                       fbariqi_tianshu_fba_o(entity);
                       suoyouriqi_tianshu(entity);
                       anquankucun(entity);
                       kongyunkucun_min(entity);
                       haiyunkucun_min(entity);
                       diaobokucun_min(entity);

                   })


           });
       }


       init();

       $scope.search=function () {
           $scope.gridOptions.paginationCurrentPage=1;
           init();
       };

        $scope.gridOptions.getPage=function (pageNo,pageSize) {
            init();
        }


       //查看采购跟踪情况 'PSKU_NAME_CN',PSKU_CODE
        $scope.purchaseQuery=function (entity,value) {
            var model = {
                "PSKU_CODE": entity.PSKU_CODE,
                "sku":entity.PSKU_ID,
                 PSKU_NAME_CN:entity.PSKU_NAME_CN,
                "organisation": entity.ORGANISATION_ID,
                "value":value
            }
            poDetail_list_service.showDialog(model)
        }

        //查看发运跟踪情况
        $scope.dispatchQuery=function (entity,num) {
            var model = {
                "PSKU_CODE": entity.PSKU_CODE,
                "sku":entity.PSKU_ID,
                PSKU_NAME_CN:entity.PSKU_NAME_CN,
                "organisation": entity.ORGANISATION_ID,
                "transportMode": [],
                "inWarehouseType": ''
            }
            if(num==1){
                model.transportMode=[1,4,5];
                model.inWarehouseType=5;
            }
            if(num==2){
                model.transportMode=[2,3];
                model.inWarehouseType=5;
            }
            if(num==3){
                model.transportMode=[1,4,5];
                model.inWarehouseType=2;
            }
            if(num==4){
                model.transportMode=[2,3];
                model.inWarehouseType=2;
            }
            dispatchOrder_list_service.showDialog(model);

        }
        
        //查看调拨跟踪情况
        $scope.trackQuery=function (entity,num) {
            var model = {
                "PSKU_CODE": entity.PSKU_CODE,
                "sku":entity.PSKU_ID,
                PSKU_NAME_CN:entity.PSKU_NAME_CN,
                "organisation": entity.ORGANISATION_ID,
                'transportMode':6,
                "inWarehouseType": ''
            }
            if(num==1){
                model.inWarehouseType=5;
            }
            if(num==2){
                model.inWarehouseType=2;
            }
            dispatchOrder_list_service.showDialog(model);
        }

        //查看销售情况
        $scope.salesQuery=function(entity,num){
            salesOrder_list_service.showDialog(entity.PSKU_CODE,entity.PSKU_NAME_CN,num);
        }


           //计算可售库存  空运在途（fba）+海运在途（fba）+调拨在途（往fba）+当地fba托管仓
        function keshoukucun(entity) {
           var FBA_AIRLIFT=(entity.FBA_AIRLIFT&&+entity.FBA_AIRLIFT)?entity.FBA_AIRLIFT:0;
            var FBA_SHIPPING=(entity.FBA_SHIPPING&&+entity.FBA_SHIPPING)?entity.FBA_SHIPPING:0;
            var FBA_ALLOCATION=(entity.FBA_ALLOCATION&&+entity.FBA_ALLOCATION)?entity.FBA_ALLOCATION:0;
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;

            entity.keshoukucun=FBA_AIRLIFT+FBA_SHIPPING+FBA_ALLOCATION+PROP_FBA_WAREHOUSE;
            return entity.keshoukucun;
        }

        //总库存  厂家在产+厂家好货+国内仓+空运在途fba+海运在途fba+调拨在途（往fba）+空运在途（自营）+海运在途（自营）+当地自营藏+调拨在途（往fba）+调拨在途（往自营）+当地fba托管仓
        function zongkucun(entity) {
            var MANUFACTOR_INPRODUCTION=(entity.MANUFACTOR_INPRODUCTION&&+entity.MANUFACTOR_INPRODUCTION)?entity.MANUFACTOR_INPRODUCTION:0;
            var MANUFACTOR_HAVE=(entity.MANUFACTOR_HAVE&&+entity.MANUFACTOR_HAVE)?entity.MANUFACTOR_HAVE:0;
            var DOMESTIC_WAREHOUSE=(entity.DOMESTIC_WAREHOUSE&&+entity.DOMESTIC_WAREHOUSE)?entity.DOMESTIC_WAREHOUSE:0;
            var FBA_AIRLIFT=(entity.FBA_AIRLIFT&&+entity.FBA_AIRLIFT)?entity.FBA_AIRLIFT:0;
            var FBA_SHIPPING=(entity.FBA_SHIPPING&&+entity.FBA_SHIPPING)?entity.FBA_SHIPPING:0;
            var PROP_AIRLIFT=(entity.PROP_AIRLIFT&&+entity.PROP_AIRLIFT)?entity.PROP_AIRLIFT:0;
            var PROP_SHIPPING=(entity.PROP_SHIPPING&&+entity.PROP_SHIPPING)?entity.PROP_SHIPPING:0;
            var PROP_LOCAL=(entity.PROP_LOCAL&&+entity.PROP_LOCAL)?entity.PROP_LOCAL:0;
            var FBA_ALLOCATION=(entity.FBA_ALLOCATION&&+entity.FBA_ALLOCATION)?entity.FBA_ALLOCATION:0;
            var PROP_ALLOCATION=(entity.PROP_ALLOCATION&&+entity.PROP_ALLOCATION)?entity.PROP_ALLOCATION:0;
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;

            entity.zongkucun=MANUFACTOR_INPRODUCTION+MANUFACTOR_HAVE+DOMESTIC_WAREHOUSE+FBA_AIRLIFT+FBA_SHIPPING+PROP_AIRLIFT+PROP_SHIPPING+PROP_LOCAL+FBA_ALLOCATION+PROP_ALLOCATION+PROP_FBA_WAREHOUSE;

            return entity.zongkucun;
        }

        //测算日均销量
        function cesuanrijunxiaoliang(entity) {


            entity.cesuanrijunxiaoliang=0;
        }

        //补单数量  安全库存-总库存
        function budanshuliang(entity) {

            entity.budanshuliang=anquankucun(entity)-zongkucun(entity);
            return entity.budanshuliang;
        }

        //调拨补货FBA数量  调拨最小库存-当地fba托管仓
        function diaobobuhuo(entity) {
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;
            entity.diaobobuhuo=diaobokucun_min(entity)-PROP_FBA_WAREHOUSE;
            return entity.diaobobuhuo;
        }

        //空运补货BFA数量  空运最小库存-当地fba托管仓
        function kongyunbuhuo_fba(entity) {
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;
            entity.kongyunbuhuo_fba=kongyunkucun_min(entity)-PROP_FBA_WAREHOUSE;
            return entity.kongyunbuhuo_fba;
        }

        //海运补货BFA数量  海运最小库存-当地fba托管仓
        function haiyunbuhuo_fba(entity) {
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;
            entity.haiyunbuhuo_fba=haiyunkucun_min(entity)-PROP_FBA_WAREHOUSE;
            return entity.haiyunbuhuo_fba;
        }

        //空运补货自营数量  空运最小库存-当地自营仓
        function kongyunbuhuo(entity) {
            var PROP_LOCAL=(entity.PROP_LOCAL&&+entity.PROP_LOCAL)?entity.PROP_LOCAL:0;
            entity.kongyunbuhuo=kongyunkucun_min(entity)-PROP_LOCAL;
            return entity.kongyunbuhuo;
        }

        //海补货自营数量  海运最小库存-当地自营仓
        function haiyunbuhuo(entity) {
            var PROP_LOCAL=(entity.PROP_LOCAL&&+entity.PROP_LOCAL)?entity.PROP_LOCAL:0;
            entity.haiyunbuhuo=haiyunkucun_min(entity)-PROP_LOCAL;
            return entity.haiyunbuhuo;
        }

        //补单日期和天数  所有库存可售天数之和   日期-下单周期
        function budanriqi_tianshu(entity) {
            entity.tianshu=0;
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.tianshu=zongkucun(entity)/DAY_FBA_WAREHOUSE;
            }
            entity.budanriqi= $filter("date")(new Date(new Date().getTime()+entity.tianshu*24*60*60*1000),"yy/MM/dd");

        }

        //所有补货计划+自营空海运+自营库存+可售库存可售天数，日期
        function suoyouriqi_tianshu_ziying(entity) {
            entity.suoyoutianshu_ziying=0;
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;
            var PROP_AIRLIFT=(entity.PROP_AIRLIFT&&+entity.PROP_AIRLIFT)?entity.PROP_AIRLIFT:0;
            var PROP_SHIPPING=(entity.PROP_SHIPPING&&+entity.PROP_SHIPPING)?entity.PROP_SHIPPING:0;
            var keshoukucun1=keshoukucun(entity);
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.suoyoutianshu_ziying=(PROP_FBA_WAREHOUSE+PROP_AIRLIFT+PROP_SHIPPING+keshoukucun1)/DAY_FBA_WAREHOUSE;
            }
            entity.suoyouriqi_ziying= $filter("date")(new Date(new Date().getTime()+entity.suoyoutianshu_ziying*24*60*60*1000),"yy/MM/dd");

        }

        //空海运FBA补货+可售库存的可售天数，日期
        function konghairiqi_tianshu_fba(entity) {
            entity.konghaitianshu_fba=0;
            var kongyunbuhuo_fba1=kongyunbuhuo_fba(entity);
            var haiyunbuhuo_fba1=haiyunbuhuo_fba(entity)
            var keshoukucun1=keshoukucun(entity);
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.konghaitianshu_fba=(kongyunbuhuo_fba1+haiyunbuhuo_fba1+keshoukucun1)/DAY_FBA_WAREHOUSE;
            }
            entity.konghairiqi_fba= $filter("date")(new Date(new Date().getTime()+entity.konghaitianshu_fba*24*60*60*1000),"yy/MM/dd");

        }

        //调拨+空+海运+FBA库存可售天数，日期
        function diaoboriqi_tianshu_fba(entity) {
            entity.diaobotianshu_fba=0;
            var keshoukucun1=keshoukucun(entity);
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.diaobotianshu_fba=keshoukucun1/DAY_FBA_WAREHOUSE;
            }
            entity.diaoboriqi_fba= $filter("date")(new Date(new Date().getTime()+entity.diaobotianshu_fba*24*60*60*1000),"yy/MM/dd");


        }

        //调拨+空+FBA库存可售天数，日期
        function diaoboriqi_tianshu_fba_kong(entity) {
            entity.diaobotianshu_fba_kong=0;
            var FBA_AIRLIFT=(entity.FBA_AIRLIFT&&+entity.FBA_AIRLIFT)?entity.FBA_AIRLIFT:0;
            var FBA_ALLOCATION=(entity.FBA_ALLOCATION&&+entity.FBA_ALLOCATION)?entity.FBA_ALLOCATION:0;
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.diaobotianshu_fba_kong=(FBA_AIRLIFT+FBA_ALLOCATION+PROP_FBA_WAREHOUSE)/DAY_FBA_WAREHOUSE;
            }
            entity.diaoboriqi_fba_kong= $filter("date")(new Date(new Date().getTime()+entity.diaobotianshu_fba_kong*24*60*60*1000),"yy/MM/dd");

        }

        //FBA库存可售天数，日期   当地fba托管仓/日均销量
        function fbariqi_tianshu_fba_o(entity) {
            entity.fbatianshu_fba_o=0;
            var PROP_FBA_WAREHOUSE=(entity.PROP_FBA_WAREHOUSE&&+entity.PROP_FBA_WAREHOUSE)?entity.PROP_FBA_WAREHOUSE:0;
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.fbatianshu_fba_o=PROP_FBA_WAREHOUSE/DAY_FBA_WAREHOUSE;
            }
            entity.fbariqi_fba_o=$filter("date")(new Date(new Date().getTime()+entity.fbatianshu_fba_o*24*60*60*1000),"yy/MM/dd")
        }

        //所有库存可售天数，日期
        function suoyouriqi_tianshu(entity) {
            entity.suoyoutianshu=0;
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            if(DAY_FBA_WAREHOUSE){
                entity.suoyoutianshu=zongkucun(entity)/DAY_FBA_WAREHOUSE;
            }
            entity.suoyouriqi=$filter("date")(new Date(new Date().getTime()+entity.suoyoutianshu*24*60*60*1000),"yy/MM/dd")
        }

        //安全库存  日均销量*下单周期
        function anquankucun(entity) {
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            var NEXT_CYCLE=(entity.NEXT_CYCLE&&+entity.NEXT_CYCLE)?entity.NEXT_CYCLE:0;
            entity.anquankucun=DAY_FBA_WAREHOUSE*NEXT_CYCLE;
            return entity.anquankucun;
        }

        //空运最小库存 日均销量*60天
        function kongyunkucun_min(entity) {
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;

            entity.kongyunkucun_min=DAY_FBA_WAREHOUSE*60;
            return entity.kongyunkucun_min;
        }

        //海运最小库存 日均销量*90天
        function haiyunkucun_min(entity) {
            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            entity.haiyunkucun_min=DAY_FBA_WAREHOUSE*90;
            return entity.haiyunkucun_min;
        }

        //调拨最小库存 日均销量*30天
        function diaobokucun_min(entity) {

            var DAY_FBA_WAREHOUSE=(entity.DAY_FBA_WAREHOUSE&&+entity.DAY_FBA_WAREHOUSE)?entity.DAY_FBA_WAREHOUSE:0;
            entity.diaobokucun_min=DAY_FBA_WAREHOUSE*30;
            return entity.diaobokucun_min;
        }



    }
});
