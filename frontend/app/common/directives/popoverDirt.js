define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('popover', function () {

        return {
            scope:{
                templateUrl:"=",
                model:"=",
                lableText:"=",
                place:"="
            },
            restrict: 'A',
            template:'<span uib-popover-template="templateUrl"  popover-placement="{{place?place:\'top\'}}" popover-trigger="\'mouseenter\'" > {{lableText}}</span>',
            link: function ($scope, element, attrs, ngModel) {

                // $(element).on("mouseout",function () {
                //     // $(".ui-grid-viewport:last").css("overflow","scroll");
                //     console.log(new Date().getTime());
                // });
                //
                // $(element).on("mouseover",function () {
                //     // $(".ui-grid-viewport:last").css("overflow","inherit");
                //     console.log(new Date().getTime());
                // })

            },
        };
    });
})