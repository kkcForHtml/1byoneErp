define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.directive('clickShrink',
			function() {
				return {
					restrict : 'A',
					link : function(scope, element, attrs, controllers) {
						element.click(function (e) {
							var evt = e || event;
							if (evt.currentTarget!==evt.target) {
								var $i = $(evt.target)
								if(!$(attrs.tg).hasClass('collapsing')) return !$i.hasClass('fa-minus')?$i.addClass('fa-minus'):$i.removeClass('fa-minus');
							}
                        })
					}
				};
			}).directive('selectAll',function () {
				return {
					restrict: 'A',
					link:function (scope, element, attrs, controllers) {
						element.click(function (e) {
							$('.h-grid input[type="checkbox"]').prop('checked', element.prop('checked'));
						})
					}
				}
			}).directive('selectSelf',function () {
				return {
					restrict: 'A',
					link:function (scope, element, attrs, controllers) {
						element.click(function (e) {
							element.prop('checked')||$('.h-grid input[select-all]').prop('checked', false);
						})
					}
				}
			});
})