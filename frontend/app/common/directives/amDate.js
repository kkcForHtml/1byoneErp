define(['angularAMD'],function(angularAMD){
    angularAMD.directive('amDate', function () {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs, ngModel) {
                if (!ngModel) {
                    alert("请为amKindDate绑定ngModel");
                    return;
                }

                element.attr('type', 'input');

                //element.attr("readonly", "");

                element.datetimepicker({
                    locale: 'zh-cn',
                    format: 'YYYY-MM-DD',
                    dayViewHeaderFormat: 'YYYY MMMM',
                    enabledHours: false,
                    showTodayButton: true,
                    showClear: true,
                    showClose: true,
                    tooltips: {
                        today: '选择今天',
                        clear: '清除选择日期',
                        close: '关闭',
                        selectMonth: '选择月份',
                        prevMonth: '上一月',
                        nextMonth: '下一月',
                        selectYear: '选择年份',
                        prevYear: '上一年',
                        nextYear: '下一年',
                    }
                });

                element.bind("click", function () {
                    element.data("DateTimePicker").show();
                });



                //绑定控件渲染事件
                ngModel.$render = function () {
                    if (ngModel.$viewValue) {
                        //element.val(ngModel.$viewValue);
                        element.data("DateTimePicker").date(new Date(ngModel.$viewValue));
                    }
                    else {
                        //element.val(null);
                        element.data("DateTimePicker").date(null)
                    }

                    // element.val(date.format('YYYY-MM-DD'));
                };

                element.bind("blur", function () {
                    if (element.val()) {
                        var date = element.data("DateTimePicker").date().toDate();
                        ngModel.$setViewValue(date);
                    }
                    else {
                        ngModel.$setViewValue(null);
                    }

                });

            },
            require: "?ngModel"
        };
    });
})