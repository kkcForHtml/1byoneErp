define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('inputBlur', function ($q) {
        return {

            restrict: 'A',

            link: function ($scope, element, attrs, ngModel) {

              $(element).focus(function(){
                  $(element).attr("readonly",'true');
              })

              $(element).blur(function(){
                  $(element).removeAttr("readonly");
                  $(element).parent().removeClass("k-state-focused")
              })
//				element.on('keydown',function () {
//					return false;
//				})




            },
        };
    });
})