define(['angularAMD', 'angular-popups'],function(angularAMD) {
    angularAMD.directive('dialogPopup', function ($compile) {

        return {
            scope:{
                dialogModel:"=",
            },
            restrict: 'A',
            link: function ($scope, element, attrs, ngModel) {

                $scope.dialogCtr={
                    open:true
                }

                $scope.model=$scope.dialogModel;

                var templateHtml='';
                $.get(attrs.templateUrl,function (html) {
                    templateHtml=html;
                })

                var flag=true;

                $(element).on("mouseout",function () {
                    $scope.dialogCtr.open=false;
                    $scope.$apply();
                });

                $(element).on("mouseover",function () {
                    if(flag){
                        var dialog='<dialog  ng-if="dialogCtr.open" for="'+attrs.id+'"  align="top"><div dialog-content>';
                        if(templateHtml)
                            dialog+=templateHtml;
                        dialog+='</div></dialog>';
                        $compile(dialog)($scope);
                        flag=false;
                    }
                    $scope.dialogCtr.open=true;
                    $scope.$apply();
                })





            },
        };
    });
})