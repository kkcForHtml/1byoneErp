define(['angularAMD','app/common/Services/commonService'],function(angularAMD) {
    angularAMD.directive('selectOrganisation', function ($q,commonService,httpService,configService) {
        return {
            restrict: 'A',
            scope: {
                options: "=",
                selectModel:"=",
                types:"=",
                model:"="
            },
             replace:true,
         //   require: "?ngModel",
            template:"<select   ng-model='model[selectModel]' class='form-control input-sm' ng-options='item.ORGANISATION_ID as item.ORGANISATION_NAME_CN for item in organizations' ng-change='change()'></select>",
            link: function ($scope, element, attrs, ngModel) {


                    var types=[4];
                    if($scope.types&&$scope.types.length){
                        types=$scope.types;
                    }else{
                        if($scope.options&&$scope.options.types){
                            types=$scope.options.types;
                        }
                    }

                configService.getOrganisationList(types).then(function (datas) {
                    $scope.organizations=datas;
                    if($scope.options&&$scope.options.getList){
                        $scope.options.getList($scope.organizations);
                    }
                })

                    $scope.change=function () {
                        var selectModel=$scope.model[$scope.selectModel];
                        if($scope.options&&$scope.options.change){
                            var os=$scope.organizations.filter(a=>a.ORGANISATION_ID==selectModel);
                            $scope.options.change(selectModel,os[0]);
                        }

                    }



            },
        };
    })
        .directive('selectOrganisationGrid', function ($q,commonService,httpService) {
        return {
            restrict: 'A',
            scope: {
                options: "=",
                selectModel:"=",
                types:"=",
                row:"="
            },
            replace:true,
            //   require: "?ngModel",ui-grid-edit-dropdown
            template: "<div><form><select ui-grid-edit-dropdown   ng-model='row.entity[selectModel]' class='form-control input-sm' ng-options='item.ORGANISATION_ID as item.ORGANISATION_NAME_CN for item in organizations' ng-change='change()'></select></form></div>",
            link: function ($scope, element, attrs, ngModel) {



                    // $(element).mousedown(function () {
                    //     var $parent=$(element).parent().parent();
                    //     var events=$._data($parent[0],"events");
                    //     if(events&& events["mousedown"] ){
                    //         $(element).click();
                    //     }
                    //     $parent.unbind("mousedown");
                    // })

                var dataSearch = {
                    "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1]],
                    limit:"0",
                    "joinwith":["o_organisationc"]
                };

                var types=[4];
                if($scope.types&&$scope.types.length){
                    types=$scope.types;
                }else{
                    if($scope.options&&$scope.options.types){
                        types=$scope.options.types;
                    }
                }
                configService.getOrganisationList(types).then(function (datas) {
                    $scope.organizations=datas;
                    if($scope.options&&$scope.options.getList){
                        $scope.options.getList($scope.organizations);
                    }
                })


                $scope.change=function () {
                    // $scope.row.grid.api.rowEdit.setRowsDirty([$scope.row.entity]);
                    // $scope.row.grid.refresh();
                    var selectModel=$scope.row.entity[$scope.selectModel];
                    if($scope.options&&$scope.options.change){
                        var os=$scope.organizations.filter(a=>a.ORGANISATION_ID==selectModel);
                        $scope.options.change(selectModel,os[0]);
                    }

                }



            },
        };
    });
})