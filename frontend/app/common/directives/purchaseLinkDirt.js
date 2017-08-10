define(['angularAMD', 'app/purchasingCenter/purchaseOrder/controllers/purchase_edit_service','app/inventoryCenter/adjustment/controllers/adjustmentEditService'],function(angularAMD) {
    angularAMD.directive('pLink', function (purchase_edit_service,adjustmentEditService,transervice,Notification,httpService) {
        return {
            restrict: 'A',
            scope:{
                linkCode:"=",
                linkState:"=",
                refresh:"&"
            },
            link: function ($scope, element, attrs, ngModel) {

                   $(element).click(function(){
                       if(!$scope.linkCode||!$scope.linkState){
                           return  Notification.error(transervice.tran('请绑定订单的单号和数据来源！'));
                       }
                       if($scope.linkState==1){
                           var searchCoditions={

                               where:["and",["<>","pu_purchase.DELETED_STATE",1],["=","pu_purchase.PU_PURCHASE_CD",$scope.linkCode]],
                               distinct:1,
                           }
                           httpService.httpHelper(httpService.webApi.api, "purchase/purchase", "index", "POST",searchCoditions).then(
                               function (result){
                                   purchase_edit_service.showDialog(result.data[0],null,null,true).then(function () {
                                       if($scope.refresh){
                                           $scope.refresh();
                                       }
                                   },function(){
                                       if($scope.refresh){
                                           $scope.refresh();
                                       }
                                   });
                               })
                       }else{

                           //初始化组织架构数据
                           var dataSearch = {
                               "where": ["and", ["=", "o_organisation_relation_middle.ENTITY_STATE", 1],
                                   ["=", "o_organisation_relation_middle.FUNCTION_ID", 4]],
                               distinct:1,
                               limit:0,
                               "joinwith": ["o_organisationt"]
                           };
                           var organisation_list = new Array();
                           httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                               organisation_list = datas.data;


                               dataSearch = {
                                   "joinWith": ["o_organisation", "b_warehouse","u_user_info"],
                                   where:["and",["=", "sk_adjustment.ADJUSTMENT_CD",$scope.linkCode]],
                                   distinct:1
                               };

                               httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "index", "POST", dataSearch).then(function (datas) {
                                   var model=datas.data[0];
                                   model.organisation_list=organisation_list;
                                   adjustmentEditService.showDialog(datas.data[0]).then(function () {
                                       if($scope.refresh){
                                           $scope.refresh();
                                       }
                                   },function(){
                                       if($scope.refresh){
                                           $scope.refresh();
                                       }
                                   });

                               })
                           });

                       }



                   })



            },
        };
    });
})