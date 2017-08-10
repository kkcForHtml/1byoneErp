define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/AmNumeric',
    'app/common/Services/gridDefaultOptionsService',
    'app/purchasingCenter/purchaseOrder/controllers/purchase_add_service',
    'app/purchasingCenter/purchaseOrder/controllers/purchase_edit_service',
    'app/common/Services/messageService',
    'app/common/directives/formatDateFilter'


], function () {
    return ['$scope', '$confirm', 'Notification', '$filter','httpService', 'transervice', 'uiGridConstants','commonService','gridDefaultOptionsService','purchase_add_service','purchase_edit_service','messageService','$q',
        function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,purchase_add_service,purchase_edit_service,messageService,$q) {

            //订单状态
            $scope.orderStates=commonService.getDicList("PU_PURCHASE"); //其中"PRODUCT_SKU"是字典表里的分组名

          $scope.gridOptions = {
                columnDefs: [
                    // { field: 'caozuo',enableCellEdit: false, displayName: transervice.tran('操作'), cellClass: 'text-center' },
                    { field: 'o_organisation.ORGANISATION_NAME_CN',enableCellEdit: false, displayName: transervice.tran('采购组织')},
                    { field: 'PU_PURCHASE_CD',enableCellEdit: false, displayName: transervice.tran('采购订单号'),cellTemplate: '<button type="button" class="btn  btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.PU_PURCHASE_CD}}</button>'},
                    { field: 'ORDER_STATE',enableCellEdit: false,cellClass:'text-center', displayName: transervice.tran('审核状态'),cellTemplate: '<span>{{grid.appScope.getStateName(row.entity.ORDER_STATE)}}</span>'},
                    { field: 'PRE_ORDER_AT',cellFilter:'formatDateFilter:"yyyy-MM-dd"',enableCellEdit: false, displayName: transervice.tran('下单日期')},
                    { field: 'pa_partner.PARTNER_NAME_CN',enableCellEdit: false, displayName: transervice.tran('供应商')},
                    { field: 'b_money.MONEY_NAME_CN',enableCellEdit: false, displayName: transervice.tran('币种') },
                    { field: 'ORDER_AMOUNT',enableCellEdit: false,cellTemplate:'<div class="ui-grid-cell-contents text-right" >{{grid.appScope.zongjine(row.entity)|number:2}}</div>', displayName: transervice.tran('订单金额')},
                    { field: 'u_userinfo_g.STAFF_NAME_CN',enableCellEdit: false, displayName: transervice.tran('采购跟进人')},
                ],

            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            $scope.gridOptions.getPage=function(pageNo,pageSize){
                $scope.init();
            };

            $scope.gridOptions.getGridApi=function(gridApi){
                 $scope.gridApi=gridApi;
            };
            $scope.name="";

            $scope.init=function(){


                var searchCoditions={
                    limit: $scope.gridOptions.paginationPageSize,
                    where:["<>","pu_purchase.DELETED_STATE",1],
                    andFilterWhere:["or",["like","pu_purchase.PU_PURCHASE_CD",$scope.name],["like","o_organisation.ORGANISATION_NAME_CN",$scope.name]],
                    distinct:1,
                    select:["pu_purchase.UPDATED_AT","pu_purchase.PU_PURCHASE_ID","pu_purchase.PRE_ORDER_AT","pu_purchase.PU_PURCHASE_CD","pu_purchase.ORDER_STATE","pu_purchase.PARTNER_ID","pu_purchase.ORGANISATION_ID","pu_purchase.MONEY_ID","pu_purchase.ORDER_AMOUNT","pu_purchase.FUPUSER_ID","pu_purchase.IMPORT_STATE"],
                    joinwith:["o_organisation","pa_partner","b_money","u_userinfo_g","pu_purchase_detail"],
                    orderby:{"pu_purchase.ORDER_STATE":"ASC","pu_purchase.UPDATED_AT":"DESC"}
                }

                httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST",searchCoditions).then(
                    function (result){
                            $scope.gridOptions.totalItems=result._meta.totalCount;
                            $scope.gridOptions.data = result.data;
                            result.data.forEach(d=>{
                                d.zongjine=$scope.zongjine(d);
                            })
                    }
                );

            };

            $scope.init();

            //订单金额
            $scope.zongjine=function (entity) {

                var count=0;
                if(entity.pu_purchase_detail){
                    entity.pu_purchase_detail.forEach(d=>{

                        var co=0;

                        if(d.PURCHASE && d.TAX_UNITPRICE){
                            co= (d.PURCHASE*d.TAX_UNITPRICE).toFixed(2);
                        }
                        if(co){
                            count+=(+co);
                        }
                    })
                }

                if(count){
                    return +count;

                }
                return "";
            }

        //获取审核状态名称
         $scope.getStateName=function (state) {
            var  states=$scope.orderStates.filter(o=>o.D_VALUE==state);
            if(states.length){
                return states[0].D_NAME_CN;
            }
         }


            //新增
            $scope.add = function(){

                purchase_add_service.showDialog().then(function (data) {
                            $scope.search();
                })



            };


            //编辑方法
            $scope.edit=function(item){
                var searchCoditions={
                    where:["and",["<>","pu_purchase.DELETED_STATE",1]],
                    andFilterWhere:["or",["like","pu_purchase.PU_PURCHASE_CD",$scope.name],["like","o_organisation.ORGANISATION_NAME_CN",$scope.name]],
                    distinct:1,
                    joinwith:["o_organisation","pa_partner","b_money","u_userinfo_g","pu_purchase_detail"],
                    orderby:{"pu_purchase.ORDER_STATE":"ASC","pu_purchase.UPDATED_AT":"DESC"}
                }
                var index=$.inArray(item,$scope.gridOptions.data);
                var ind=($scope.gridOptions.paginationCurrentPage-1)*$scope.gridOptions.paginationPageSize+index;
                var idList=$scope.gridOptions.data.map(d=>d.PU_PURCHASE_ID);
                purchase_edit_service.showDialog(item,index,$scope.gridOptions.totalItems,false,searchCoditions,idList).then(function (data) {
                    $scope.search();
                },function (data) {
                    $scope.search();
                })

            };



            //审核
            $scope.audit=function () {
                var def=$q.defer();
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran(messageService.error_empty));//判断是否选择了数据
                }
                var valiRows=rows.filter(a=>a.ORDER_STATE==2);
                if(valiRows.length){
                    return  Notification.error(transervice.tran(messageService.error_audit_a));//是否包含了已审核数据
                }

                $confirm({text:transervice.tran(messageService.confirm_audit_c)}).then(function(){
                    var copyRows=angular.copy(rows);
                    copyRows.forEach(a=>{
                        a.edit_type = 1
                        a.ORDER_STATE=2;
                    });

                    var delData={batchMTC:copyRows};
                    httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "update", "POST",delData,def).then(
                        function (result){
                            Notification.success(transervice.tran(result.message));
                            $scope.init();
                        }
                    );
                },function () {
                    def.resolve();
                })

                return def.promise;

            }


            //反审核
            $scope.notAudit=function () {
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran(messageService.error_empty));//判断是否选择了数据
                }

                var valiRows=rows.filter(a=>a.ORDER_STATE==1);
                if(valiRows.length){
                    return  Notification.error(transervice.tran(messageService.error_audit_n));//判断是否包含未审核数据
                }
                $confirm({ text: transervice.tran(messageService.confirm_audit_f)}).then(function() {
                    var copyRows = angular.copy(rows);
                    copyRows.forEach(a=> {
                        a.edit_type = 3
                        a.ORDER_STATE = 1;
                    });
                    var delData = {batchMTC: copyRows};
                     httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "update", "POST", delData).then(
                        function (result) {
                            Notification.success(transervice.tran(result.message));
                            $scope.init();
                        }
                    );
                })
            }



            //删除数据
            $scope.del=function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                   return  Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({ text: transervice.tran('确认要删除所选择的数据吗？') }).then(function () {
                    var copyRows=angular.copy(rows);
                    copyRows.forEach(r=>{
                        r.DELETED_STATE=1;
                        r.edit_type=2;
                        delete r.b_money;
                        delete r.o_organisation;
                        delete r.pa_partner;
                        delete r.pu_purchase_detail;
                        delete r.u_userinfo_g;

                    });
                    var delData={batchMTC:copyRows};
                   return httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "update", "POST",delData).then(
                        function (){
                            Notification.success(transervice.tran('删除成功！'));
                            $scope.search();
                        }
                    );
                });
            };

            //导出
            $scope.export=function () {
                var entitys= $scope.gridOptions.gridApi.selection.getSelectedRows();
                var saveModels=entitys.map(a=>a.PU_PURCHASE_ID);
                var form=$("<form>");//定义一个form表单
                form.attr("style","display:none");
                form.attr("target","");
                form.attr("method","post");
                var input1=$("<input>");
                input1.attr("type","hidden");
                input1.attr("name","search");
                input1.attr("value",$scope.name);
                var input2=$("<input>");
                input2.attr("type","hidden");
                input2.attr("name","PURCHASE_ID");
                input2.attr("value",saveModels.toString());
                form.append(input1,input2);
                form.attr("action",httpService.webApi.api+"/purchase/purchase/export_purchase");
                $("body").append(form);//将表单放置在web中
                form.submit();//表单提交
            }


            //模糊搜索
            $scope.search=function(){
                $scope.gridOptions.paginationCurrentPage=1;
                $scope.init();
            }

        }]
});
