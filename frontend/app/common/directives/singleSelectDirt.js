define(['angularAMD','app/common/Services/commonService'],function(angularAMD) {
    angularAMD.directive('singleSelect', function ($q,commonService,httpService) {
        return {
            restrict: 'A',
            scope: {
                options: "=",
                selectModel:"=",
                change:"&",
                row:"="
            },

            link: function ($scope, element, attrs, ngModel) {

                //单选下拉框
                $scope.dicDataSource = {
                    transport: {
                        read: {
                            type: "POST",
                            url: $scope.options.url,
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            //用户列表的显示，包括查询
                            var search = {
                                "limit": 0
                            };
                            if($scope.options.search){
                                search=$scope.options.search;
                            }
                            if(!search.limit){
                                search.limit=0;
                            }
                            search=angular.copy(search);
                            delete $scope.options.search.andwhere;
                            if (options.filter && options.filter.filters) {
                                search = commonService.getFilter(search, options.filter.filters, options.filter.logic);
                            }
                            return search;
                        }
                    },
                    schema: {
                        data: function (d) {
                            // var list = new Array();
                            // angular.forEach(d.data, function (obj) {
                            //     list.push({ "D_NAME_CN": obj.D_NAME_CN, "D_VALUE": obj.D_VALUE });
                            // });
                            // return list; //响应到页面的数据
                            return d.data;
                        }
                    },
                    error: httpService.kendoErr,
                    serverFiltering: true,
                };
                var opts = {
                    filter: "contains",
                    autoBind: true,
                    dataSource: $scope.options.dataSource?$scope.options.dataSource:$scope.dicDataSource,
                    dataTextField: "D_NAME_CN",
                    dataValueField: "D_VALUE",
                    optionLabel: "请选择",
                    value:$scope.selectModel,
                    delay:1000,
                    change:function (e) {
                        // e.sender.dataItem(e.item)[e.sender.options.dataValueField] == ""
                        // e.sender.dataItem(e.item)[e.sender.options.dataTextField] == e.sender.options.optionLabel
                        // console.log(e.sender.dataItem(e.item));

                        $scope.entity=e.sender.dataItem(e.item);
                        $scope.selectModel=$scope.entity[$scope.options.dataValueField];
                        $scope.$apply();

                        var row={};
                        if($scope.row){
                            row=$scope.row;
                        }
                        row.selectModel=$scope.entity;
                        $scope.$apply();

                        if($scope.change){
                            if($scope.entity)
                                $scope.change(row);
                        }

                          if($scope.options.o_change && $scope.entity){
                                $scope.options.o_change(row);
                           }


                    },
                    select:function (dataItem) {
                        // var parent=$(dataItem.item).parent();
                        // var doms=parent.find("li");
                        // var entity=null;
                        // for(var i=0;i<doms.length;i++){
                        //     var $dom=$(doms[i]);
                        //
                        //     if($dom.hasClass("k-state-hover")){
                        //         var index=i;
                        //         $scope.entity=dataItem.sender.dataSource._data[index];
                        //         $scope.selectModel=dataItem.sender.dataSource._data[index][$scope.options.dataValueField];
                        //         $scope.$apply();
                        //         break;
                        //     }
                        // }

                        return true;
                    },
                    filtering :function (e) {
                        //get filter descriptor
                        var filter = e.filter;

                        if (!filter||!filter.value) {
                            //prevent filtering if the filter does not value
                            e.preventDefault();
                        }else{

                        }
                        // handle the event
                    }

                };

                angular.extend(opts,$scope.options);
                // angular.extend($scope.options,opts);

                $(element).kendoDropDownList(opts);






            },
        };
    });
})