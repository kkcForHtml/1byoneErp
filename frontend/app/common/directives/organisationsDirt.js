define(['angularAMD','app/common/Services/commonService'],function(angularAMD) {
    "use strict";
    angularAMD.directive('organisationsDirt', function ($q,commonService,httpService,configService) {
        return {
            restrict: 'A',
            scope: {
                options: "=",
                selectModel:"=",
                types:"=",
                model:"="
            },
            replace:true,
            template:"<select ng-model='selectModel' class='form-control input-sm' ng-options='item.ORGANISATION_ID as item.ORGANISATION_NAME_CN for item in organizations' ng-change='change(selectModel)'></select>",
            link: function ($scope, element, attrs, ngModel) {
                var types=[4], isInit = $scope.options.isInit;
                if($scope.types && $scope.types.length){
                    types = $scope.types;
                }else{
                    if($scope.options && $scope.options.types){
                        types = $scope.options.types;
                    }
                }
                configService.getOrganisationList(types,isInit).then(function (datas) {
                    $scope.organizations = datas;
                    if($scope.options&&$scope.options.getList){
                        $scope.options.getList($scope.organizations);
                    }
                });
                $scope.change = function (selectModel) {
                    if($scope.options && $scope.options.change){
                        var os = $scope.organizations.filter(a=>a.ORGANISATION_ID == selectModel);
                        $scope.options.change(selectModel,os[0]);
                    }
                };
            },
        };
    });
});