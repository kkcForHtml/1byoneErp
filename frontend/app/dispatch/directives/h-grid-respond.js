define(['angularAMD'], function(angularAMD) {
	angularAMD.directive('clickShrink',
		function() {
			return {
				restrict: 'A',
				link: function(scope, element, attrs, controllers) {
					element.click(function(e) {
						var evt = e || event;
						if(evt.currentTarget !== evt.target) {
							var $i = $(evt.target)
							if(!$(attrs.tg).hasClass('collapsing')) return !$i.hasClass('fa-minus') ? $i.addClass('fa-minus') : $i.removeClass('fa-minus');
						}
					})
				}
			};
		}).directive('selectAll', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs, controllers) {
				element.click(function(e) {
					var flag = element.prop('checked');
					$('.h-grid input[type="checkbox"]').prop('checked', flag);
					flag ? $('tbody tr').addClass('active') : $('tbody tr').removeClass('active');
				})
			}
		}
	}).directive('selectSelf', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs, controllers) {
				element.click(function(e) {
					if(!element.prop('checked')) {
						$('.h-grid input[select-all]').prop('checked', false);
						element.parents('tr').removeClass('active');
						return;
					}
					element.parents('tr').addClass('active');
				})
			}
		}
	}).directive('editGrid', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs, controllers) {
				var $span = element.find('.span'),
					$next = $span.next(),
					$input = element.find('input[type="text"]'),
					$select = element.find('select'),
					$number = element.find('input[type="number"]'),
					$tr = element.parent();
				element.click(function(e) {
					var evt = e || event
					if($next.css('display') == 'none' && evt.target.tagName == "SPAN") {
						$span.hide();
						$next.show().focus();
						$next.select();
						$input.focus();
						$select.trigger("mousedown");
					}
				});
				$input.blur(function() {
					$span.show();
					$next.hide();					
				});
				$number.blur(function() {
					$span.show();
					$next.hide();
				})
				$select.blur(function() {
					$span.show();
					$next.hide();
				});
				$select.change(function() {
					$span.show().html($(this).find("option:selected").text());
					$next.hide();
					$tr.addClass('edit');
				});
				$input.change(function() {
					$tr.addClass('edit');
				});
				$number.change(function() {
					$tr.addClass('edit');
				})

			}
		}
	}).directive('selectTr', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs, controllers) {
				element.click(function(e) {
					var evt = e || event;
					element.parents('table').children('tbody').children('tr').removeClass('active');
					if(evt.target.type == 'checkbox') {
						element.find('input[type="checkbox"]').prop('checked') && element.removeClass('active');
						return;
					}
					element.addClass('active');
				})
			}
		}
	});
})