define(['angularAMD','app/common/Services/commonService'],function(angularAMD) {
    angularAMD.directive('tinySelect', function ($q,commonService,httpService) {
        return {
            restrict: 'A',
            scope: {
                options: "=",
                selectModel:"="
            },
         //   require: "?ngModel",

            link: function ($scope, element, attrs, ngModel) {

                retval = [ { val: "-1" , text: "---" } ];

                $scope.options.dataParser=function (data,selectValue) {
                    var arr=[].concat(retval);
                    data.data.forEach(function(v){
                        v.val=v.D_VALUE;
                        v.text=v.D_NAME_CN;

                        arr.push(v);
                    });
                    return arr;
                }



                $(element).tinyselect($scope.options);


                $(element).on("change",function () {
                    $scope.selectModel=$(element).val();
                })

            },
        };
    });
})