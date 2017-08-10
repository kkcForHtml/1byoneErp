// MultiSelectBox, Kendo Plugin
// -----------------------------------------------------------
(function ($) {
    var MultiSelectBox = window.kendo.ui.DropDownList.extend({

        init: function (element, options) {
            var me = this;
            // create drop down UI
            window.kendo.ui.DropDownList.fn.init.call(me, element, options);
        },

        options: {
            name: "MultiSelectBox"
        },

        _select: function (li) { }, // kills highlighting behavior
        _blur: function () { }, // kills popup-close-on-click behavior
    });

    window.kendo.ui.plugin(MultiSelectBox);

})(jQuery);