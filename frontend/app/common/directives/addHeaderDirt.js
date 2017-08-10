define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('addHeader', function ($q,$compile) {
        return {

            restrict: 'A',
            link: function ($scope, element, attrs, ngModel) {

                waitData(function(){
                    var ds= $(element).find(".ui-grid ");
                    if(ds.length){
                        return true;
                    }
                    return false;
                },function(){
                    var headers= $(element).find(".ui-grid ").find(".ui-grid-render-container-body .ui-grid-header-cell-wrapper .ui-grid-header-cell");
                    var index=parseInt(attrs['colIndex']);
                    var header=$(headers[index]);
                    var $dom=header.find("div.ui-grid-cell-contents .ui-grid-header-cell-label")

                    var template=attrs.addHeader;
                    var com=$compile(template)($scope);
                    $dom.before(com);

                })


                function waitData(fn1,fn2){

                    setTimeout(function(){
                        if(fn1()){
                            fn2();
                        }else{
                            waitData(fn1,fn2);
                        }
                    },50)
                }







            },
        };
    });
})