define(['angularAMD'], function (angularAMD) {
    'use strict';
    angularAMD.directive('mainSidebar',
            function () {
                return {
                    restrict: 'A',
                    templateUrl: './app/main/views/main-sidebar.html?ver='+_version_,
                    transclude: true,
                    replace: false,
                    require: "ngModel",
                    controller: function ($scope)
                    {
                        var str = localStorage.getItem("MENUS");
                        $scope.menus = angular.fromJson(str);
                    }
                };
            });
})