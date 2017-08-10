define(['angularAMD','app/common/Services/commonService'],function(angularAMD) {
    angularAMD.directive('btnPer', function (commonService) {
        return {
            restrict: 'A',
            // scope:{
            //     btnPer:"=",
            // },
            link: function ($scope, element, attrs, controllers) {
                $scope.btnPer=eval("("+attrs.btnPer+")");
                if(!$scope.btnPer||!$scope.btnPer.id||!$scope.btnPer.name){
                    return;
                }
                var names=commonService.getPermissions($scope.btnPer.id);

                var flag=false;

                names.forEach(n=>{
                    if(n.indexOf($scope.btnPer.name)!=-1){
                        flag=true;
                    }
                })
                if(!flag){
                    // element.attr('disabled', true);
                    setTimeout(function () {
                        element.remove();
                    },100)
                }else{
                    if(element[0].tagName=="LI"){
                        setTimeout(function () {
                            element.parent().find("li:first a").click();
                        },100)

                    }
                }
            }
        };
    });
})