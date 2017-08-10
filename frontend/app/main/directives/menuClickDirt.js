define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.directive('menuClick',
			function() {
				return {
					restrict : 'A',
					link : function(scope, element, attrs, controllers) {
						$(element).click(function () {

							var parent=$(element).parent().parent().parent().parent();
							var alist=parent.find(".treeview-menu a");
							for(var i=0;i<alist.length;i++){
								var $dom=$(alist[i]);
								$dom.removeClass("menu-active");
							}
                            $(element).addClass("menu-active");
                        })
					}
				};
			});
})
