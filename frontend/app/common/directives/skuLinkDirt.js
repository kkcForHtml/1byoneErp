define(['angularAMD', 'app/masterCenter/product/controllers/productSKU_edit_service','app/masterCenter/product/controllers/productSKU_add_service'],function(angularAMD) {
    angularAMD.directive('skuLink', function (productSKU_edit_service,transervice,Notification,httpService) {
        return {
            restrict: 'A',
            scope:{
                skuLink:"=",
                refresh:"&"
            },
            link: function ($scope, element, attrs, ngModel) {

                   $(element).click(function(){
                       if(!$scope.skuLink){
                           return  Notification.error(transervice.tran('请绑定产品SKU的ID！'));
                       }
                       httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "view?id="+$scope.skuLink, "POST",{}).then(
                           function (result){

                               productSKU_edit_service.showDialog(result.data,true).then(function () {
                                   if($scope.refresh){
                                       $scope.refresh();
                                   }
                               });
                           })
                   })
            },
        };
    });
})