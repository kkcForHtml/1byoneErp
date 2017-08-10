define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.directive('triggerClick',
			function() {
				return {
					restrict : 'A',
					link : function(scope, element, attrs, controllers) {
						$(element).click(function () {
							var con = $(this).parents('.box-solid').find('.box-title').html();
							$('.treeview').removeClass('active');
							$('.treeview-menu').removeClass('menu-open').hide().find('a').removeClass('menu-active');							
							$('.treeview-menu li a:contains('+con+')').parents('.treeview-menu').prev().trigger('click');
							$('.treeview-menu li a:contains('+con+')').trigger('click');
                        })
					}
				};
			});
})
