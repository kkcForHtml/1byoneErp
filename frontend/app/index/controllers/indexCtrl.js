
define([
	'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
	'css!bowerLibs/select2/css/select2',
	'css!bowerLibs/select2/css/select2-bootstrap.css',
	'ngload!ui-notification',
	'ngload!ui.bootstrap',
	'angular-confirm',
	'app/common/Services/commonService',
	'app/common/Services/configService',
	'app/common/directives/singleSelectDirt',
	'app/common/Services/gridDefaultOptionsService',
	'app/common/directives/select2-directive',
	'app/index/toDoList/controllers/toDoListCtrl'

], function() {
	return ['$scope', '$confirm', 'Notification', 'commonService', 'configService', 'httpService', '$filter', 'amHttp', 'transervice', 'uiGridConstants', 'gridDefaultOptionsService',
		function($scope, $confirm, Notification, commonService, configService, httpService, $filter, amHttp, transervice, uiGridConstants, gridDefaultOptionsService) {
		
		}
	]
});