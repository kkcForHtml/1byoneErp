/**
 * Created by Fable on 2017/6/16.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',
    ],
    function (angularAMD) {
        angularAMD.service(
            'pskdeliveryDialogService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "pskdeliveryDialogCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/pskdelivery/views/pskdelivery_dialog.html',
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("pskdeliveryDialogCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService) {

            var rows = model;
            var detail = new Object();
            $scope.model = model;
            rows.detail = new Object();
            rows.detail.ALLOUT_AT = '';
            rows.detail.TRACK_NO = '';
            rows.detail.LOAD_MONEY_ID = '';
            rows.detail.LOAD_MONEY = '';
            rows.detail.FREIGHT_MONEY_ID = '';
            rows.detail.FREIGHT_MONEY = '';
            rows.detail.INCIDEN_MONEY_ID = '';
            rows.detail.INCIDEN_MONEY = '';

            //初始化
            function init() {
                var Condition = {"where":{'MONEY_STATE':1}};
                //获取币种列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", Condition).then(function (datas) {
                       $scope.moneyslist = datas.data;
                });
            };

            //初始化
            init();

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };


            //点击确定
            $scope.savedelivery = function() {
                if(!$scope.ACTUAL_AT)
                    return Notification.error('实际发货时间不能为空');

                if(!$scope.TRACK_NO)
                    return Notification.error('跟踪单号不能为空');

                if(!$scope.LOAD_MONEY_ID)
                    return Notification.error('请选择装卸币种');

                if($scope.LOAD_MONEY==null || $scope.LOAD_MONEY == "")
                    return Notification.error('装卸费不能为空');

                if(!$scope.FREIGHT_MONEY_ID)
                    return Notification.error('请选择运费币种');

                if($scope.FREIGHT_MONEY == null || $scope.FREIGHT_MONEY == "")
                    return Notification.error('运费不能为空');

                if(!$scope.INCIDEN_MONEY_ID)
                    return Notification.error('请选择杂费币种');

                if($scope.INCIDEN_MONEY == null || $scope.INCIDEN_MONEY == "")
                    return Notification.error('杂费不能为空');

                var ACTUAL_AT = $scope.ACTUAL_AT;
                var formatDate = new Date(ACTUAL_AT.replace(/-/,'/')).getTime();

                angular.forEach(rows,function(row,index){
                    row.ACTUAL_AT =  Math.round(formatDate/1000);

                    delete row.a_warehouse;
                    delete row.e_warehouse;
                    delete row.o_organisation;
                });

                detail.ALLOUT_AT = Math.round(formatDate/1000);
                detail.TRACK_NO = $scope.TRACK_NO;
                detail.LOAD_MONEY_ID = $scope.LOAD_MONEY_ID;
                detail.LOAD_MONEY = $scope.LOAD_MONEY;
                detail.FREIGHT_MONEY_ID = $scope.FREIGHT_MONEY_ID;
                detail.FREIGHT_MONEY = $scope.FREIGHT_MONEY;
                detail.INCIDEN_MONEY_ID = $scope.INCIDEN_MONEY_ID;
                detail.INCIDEN_MONEY = $scope.INCIDEN_MONEY;

                Confirmdelivery(rows,detail);
            };

            function Confirmdelivery(datas,detail){
                var DataRows={batchMTC:datas,detail:detail};

                httpService.httpHelper(httpService.webApi.api, "inventory/pendingde", "ensurependde", "POST", DataRows).then(function (datas) {
                    Notification.success(transervice.tran(datas.message));
                    $modalInstance.close();
                })
            }
        });
    })
