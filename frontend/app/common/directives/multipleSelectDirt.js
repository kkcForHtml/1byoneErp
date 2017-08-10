define(['angularAMD','app/common/Services/commonService'],function(angularAMD) {
    angularAMD.directive('multipleSelect', function ($q,commonService,httpService,transervice) {
        return {
            restrict: 'A',
            scope: {
                options: "=",
                selectModel:"=",
            },
            template:'<select kendo-multi-select k-options="mdicOptions" k-ng-model="selectModel"></select>',
            link: function ($scope, element, attrs, ngModel) {

                $scope.dataSource = {
                    transport: {
                        read: {
                            type: "POST",
                            url: $scope.options.url,
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            var search = {
                                "limit": 0
                            };
                            if($scope.options.search){
                                search=$scope.options.search;
                            }
                            if(!search.limit){
                                search.limit=0;
                            }
                            if (options.filter && options.filter.filters) {
                                search = commonService.getFilter(search, options.filter.filters, options.filter.logic);
                            }

                            return search;
                        }
                    },
                    schema: {
                        data: function (d) {
                            if($scope.options.dataFiled){
                                return d.data.map(a=>a[$scope.options.dataFiled]);
                            }
                            return d.data;
                        }
                    },
                    error: httpService.kendoErr,
                    serverFiltering: false,
                };

                $scope.mdicOptions = {
                    valuePrimitive: true,
                    autoBind: false,
                    dataSource: $scope.dataSource,
                    dataTextField: "D_NAME_CN",
                    dataValueField: "D_VALUE",
                    placeholder: transervice.tran('请选择')
                };

                angular.extend($scope.mdicOptions,$scope.options);

            },
        };
    });
})