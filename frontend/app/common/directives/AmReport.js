define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('amReport', function () {
        return {
            restrict: 'A',
            scope: {
                reportname: "=",
                flag: "="
            },
            link: function ($scope, element, attrs, ngModel) {
                if (!ngModel) {
                    alert("请为amReport绑定ngModel。");
                    return;
                }

                if (!attrs.amReport) {
                    alert("请为amReport指定要作为报表打印的表格Id。");
                    return;
                }

                if (!$scope.reportname) {
                    alert("请为amReport指定报表名称。");
                    return;
                }

                element.bind("click", function () {
                    element.attr("disabled");
                    var parentNode = angular.element(element[0].parentNode);
                    if (element.find(".reportForm").length == 0) {

                            parentNode.append('<form class="reportForm" method="post" action="api/CommonFile/parseReport" style="display:none"><input name="ReportData" type="text"/><input name="ReportHeader" type="text"/><input name="ReportBinding" type="text"/><input name="ReportName" type="text"/><input id="btnSubmit" type="submit"/></form>');


                    }

                    parentNode.find('.reportForm [name="ReportData"]').val(JSON.stringify(ngModel.$viewValue).replace(/\\/g,","));
                    var reportHeader = [];
                    var header = angular.element("#" + attrs.amReport).find("thead th")

                    for (var i = 0; i < header.length; i++) {
                        if (angular.element(header[i]).data("ignore") == "1") {
                            continue;
                        }
                        reportHeader.push(header[i].innerText);
                    }

                    parentNode.find('.reportForm [name="ReportHeader"]').val(JSON.stringify(reportHeader));

                    var reportBinding = [];
                    var tr = angular.element("#" + attrs.amReport).find(" tbody tr")[0];
                    var tds = $(tr).find("td");
                    for (var i = 0; i < tds.length; i++) {
                        if (angular.element(tds[i]).data("ignore") == "1") {
                            continue;
                        }
                        reportBinding.push(tds[i].attributes["ng-bind"].value);
                    }

                    parentNode.find('.reportForm [name="ReportBinding"]').val(JSON.stringify(reportBinding));

                    parentNode.find('.reportForm [name="ReportName"]').val($scope.reportname);

                    // parentNode.find(".reportForm #btnSubmit").click();
                    parentNode.find(".reportForm").submit();
                    element.removeAttr("disabled");
                });


            },
            require: "?ngModel",
        };
    });
})