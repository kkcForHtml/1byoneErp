define(['angularAMD', 'kendoMultiSelectBox'], function (angularAMD) {
    angularAMD.directive('dropdownmutiselect', function () {
        return {
            restrict: 'AE',
            scope: {
                'options': "=",
                "model": "="
            },
            // template:,
            link: function ($scope, element, attrs, ngModel) {
                $scope.options.template = function (ele) {
                    return kendo.format('<input type="checkbox" name="{0}" value="{1}" />&nbsp;<label for="{0}">{2}</label>',
                        ele.id + "_option_" + ele[$scope.options.dataValueField],
                        ele[$scope.options.dataValueField],
                        ele[$scope.options.dataTextField]
                    );
                }

                $scope.options.dataBound = function (e) {
                    var checkboxes = e.sender.ul.find("input[type='checkbox']");
                    if ($scope.model.length > 0) {
                        checkboxes.each(function () {
                            var flag = false;
                            var value = this.value;
                            angular.forEach($scope.model, function (obj) {
                                if (obj == value) {
                                    flag = true;
                                    return;
                                }
                            });
                            this.checked = flag;
                        });
                        $scope.setText(e);
                    }
                }

                $scope.setText = function (e) {
                    var text = e.sender.ul.find(":checked")
                        .map(function () { return $(this).siblings("label").text(); })
                        .toArray();
                    if (text.length === 0 && e.sender.options.optionLabel)
                        e.sender.text(e.sender.options.optionLabel);
                    else
                        e.sender.text(text.join(','));

                }

                $scope.options.close = function (e) {
                    var values = e.sender.ul.find(":checked")
                        .map(function () { return this.value; }).toArray();
                    // check for array inequality
                    if (values < $scope.model || values > $scope.model) {
                        $scope.setText(e);
                        $scope.model = values;
                        $scope.$apply();
                    }
                }

                $scope.options.filtering = function (e) {
                    //get filter descriptor
                    var filter = e.filter;
                    if (!filter.value) {
                        //prevent filtering if the filter does not value
                        e.preventDefault();
                    }
                    // handle the event
                }

                $scope.options.autobind = false;

                $scope.options.delay = 2000;

                element.kendoMultiSelectBox($scope.options);

            },
            require: "?ngModel",
        };
    });
})