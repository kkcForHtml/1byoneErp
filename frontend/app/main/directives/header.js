define(['angularAMD',
    'kendo-cultures',
    'kendo-messages',
    'kendo-angular'
    ], function (angularAMD) {
    'use strict';
    angularAMD.directive('header',
            function () {
                return {
                    restrict: 'A',
                    templateUrl: './app/main/views/header.html?ver='+_version_,
                    transclude: true,
                    replace: true,
                    //require: "ngModel",
                    link: function ($scope,$element,$attrs){

                        $.get("./app/i18n/langugesData.json").then(function (datas) {
                            $scope.langugeList = angular.fromJson(datas);
                        });
                        $scope.lang = window.localStorage.lang;
                        $scope.switching = function(lang){
                            window.localStorage.lang=lang;
                            kendo.culture(window.localStorage.lang || 'zh-CN');
                            location.reload();
                        };
                    }
                };
            })
})