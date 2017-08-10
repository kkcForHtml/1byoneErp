define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.directive('amMenu',
			function() {
				return {
					restrict : 'A',
					link : function(scope, element, attrs, controllers) {
						element.parent().find("li").addClass("ng-hide");
						element.bind('click', function(e) {
							element.parent().find("li").toggleClass("ng-hide");
							var flage = element.parent().find("span").hasClass(
									"glyphicon-chevron-right");
							if (flage) {
								element.parent().find("span").removeClass(
										"glyphicon-chevron-right").addClass(
										"glyphicon-chevron-down");
							} else {
								element.parent().find("span").removeClass(
										"glyphicon-chevron-down").addClass(
										"glyphicon-chevron-right");
							}
							return false;
						});

						function updateMenuDisp() {
							var hideCount = element.parent().find(
									"li.permission-hide").length;
							var liCount = element.parent().find("li").length;
							if (hideCount == liCount) {
								element.parent().addClass("permission-hide");
							} else {
								element.parent().removeClass("permission-hide")
							}
						}

						// 用户信息变更时更新显示
						scope.$on("permission_stage_changed", function() {
							updateMenuDisp();
						});
					}
				};
			});
})
