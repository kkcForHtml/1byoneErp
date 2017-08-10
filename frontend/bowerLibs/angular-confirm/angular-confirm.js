

define(['angular'], function (ng) {
    angular.module('angular-confirm', ['ui.bootstrap'])
        .controller('ConfirmModalController', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
            data.text = data.text.split('<br>');
            //                    data.text = '';
            //                    for (var i = 0; i < data.data.length; i++) {
            //                        data.text += "{{data.data[" + i + "]}}<br>";
            //                    }
            $scope.data = angular.copy(data);

            $scope.ok = function () {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        }])
        //  spriteicon warn<i class="iconfont">&#xe65e;</i>
        .value('$confirmModalDefaults', {
            template: '<div id="window-title" class="modal-header">{{data.title | translate}}<div class="detail-close pull-right" ng-click="cancel()" ng-show="!data.unCancle"><i class="fa fa-times"></i></div></div>' +
            '<div class="modal-body confirm" style="text-align:left"><img ng-if="data.img" alt="image" style="margin:0 8px 8px 0;" class="img-circle" ng-src="/frontend/images/{{data.img}}"><span ng-repeat="t in data.text">{{t}}<br></span></div>' +
            '<div class="modal-footer" style="text-align:center">' +
            '<button class="btn btn-success btn-rounded" ng-click="ok()">{{data.ok | translate}}</button>' +
            '<button class="btn btn-default btn-rounded" ng-click="cancel()" ng-show="!data.unShowCancle">{{data.cancel | translate}}</button>' +
            '</div>',
            controller: 'ConfirmModalController',
            backdrop: 'static',
            animation: false,
            keyboard: true,
            defaultLabels: {
                title: '消息确认',
                ok: '确认',
                cancel: '取消',
                img: 'yiwenhao.png',
            }
        })
        .factory('$confirm', ['$modal', '$confirmModalDefaults', function ($modal, $confirmModalDefaults) {
            return function (data, settings) {
                settings = angular.extend($confirmModalDefaults, (settings || {}));

                data = angular.extend({}, settings.defaultLabels, data || {});

                if ('templateUrl' in settings && 'template' in settings) {
                    delete settings.template;
                }

                if (data.keyboard !== undefined && data.keyboard !== settings.keyboard) {
                    settings.keyboard = data.keyboard;
                }

                settings.resolve = {
                    data: function () {
                        return data;
                    }
                };

                return $modal.open(settings).result;
            };
        }])
        .directive('confirm', ['$confirm', function ($confirm) {
            return {
                priority: 1,
                restrict: 'A',
                scope: {
                    confirmIf: "=",
                    ngClick: '&',
                    confirm: '@',
                    confirmSettings: "=",
                    confirmTitle: '@',
                    confirmOk: '@',
                    confirmCancel: '@'
                },
                link: function (scope, element, attrs) {


                    element.unbind("click").bind("click", function ($event) {

                        $event.preventDefault();

                        if (angular.isUndefined(scope.confirmIf) || scope.confirmIf) {

                            var data = { text: scope.confirm };
                            if (scope.confirmTitle) {
                                data.title = scope.confirmTitle;
                            }
                            if (scope.confirmOk) {
                                data.ok = scope.confirmOk;
                            }
                            if (scope.confirmCancel) {
                                data.cancel = scope.confirmCancel;
                            }
                            $confirm(data, scope.confirmSettings || {}).then(scope.ngClick);
                        } else {

                            scope.$apply(scope.ngClick);
                        }
                    });

                }
            }
        }]);
});
