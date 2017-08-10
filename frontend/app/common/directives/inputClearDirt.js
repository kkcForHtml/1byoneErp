define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('inputClear', function ($q) {
        return {

            restrict: 'A',

            link: function ($scope, element, attrs, ngModel) {
                $(element).css("position","relative");
                $(element).next("span").find("button").css("margin-right","0");
                setTimeout(function () {

                    waitData(()=>{
                        if(element.parent()[0].clientHeight){
                            return true;
                        }
                        return false;
                    },()=>{
                        var left=element.attr('kendo-date-time-picker')==undefined?(element[0].offsetLeft+element[0].clientWidth-16)+'px':'none';
                        var right =element.attr('kendo-date-time-picker')==undefined?'none':(parseInt(element.parent().css('padding-right'))+2)+'px';
                        var top = (element.parent()[0].clientHeight/2 - 10)+'px';
                        var $cdom=$('<span class="clear" style="display: inline-block;position: absolute; cursor: pointer; width: 16px;left:'+left+';right:'+right+';top: '+top+';z-index: 1000; height: 16px;background: url(images/clear.png);"></span>');
                        $cdom.hide();
                        $cdom.mousedown(function () {
                            eval("$scope."+attrs["ngModel"]+"=''");
                            $scope.$apply();
                            $cdom.hide();
                            element.parents('td').length&&element.parents('tr').addClass('edit');
                            $(element).focus();
                        })
                        $(element).before($cdom);

                        if (!element.parents('td').length) {
                            // element.focus(function () {
                            //     element.val()&&$cdom.show();
                            // })
                            // element.blur(function () {
                            //     $cdom.hide();
                            // })
                        }
                        $scope.$watch(attrs["ngModel"],function (newValue,oldValue) {
                            if(newValue){
                                $cdom.css("display","inline-block");
                            }else{
                                $cdom.css("display","none");
                            }
                        })
                    })

                },100)


                function waitData(fn1,fn2){

                    setTimeout(function(){
                        if(fn1()){
                            fn2();
                        }else{
                            waitData(fn1,fn2);
                        }
                    },500)
                }


            },
        };
    });
})