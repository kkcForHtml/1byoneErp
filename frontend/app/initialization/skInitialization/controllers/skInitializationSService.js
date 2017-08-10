define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/organisationsDirt1'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'skInitializationSService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "skInitializationSCtrl",
                            backdrop: "static",
                            size: "ssm",//lg,sm,md,llg,ssm
                            templateUrl: 'app/initialization/skInitialization/views/skInitialization_s.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("skInitializationSCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService) {
            var p = $q.defer(),obj={};
            $scope.model = {};
            $scope.orgoptions = {
                types: [4],
                isInit : "0",
                change: function (ORGANISATION, entity) {
                    //组织列表选择change事件
                    if (ORGANISATION.ORGANISATION_ID) {
                        $scope.model.CHANNEL = '';
                        $scope.model.ATWAREHOUSE = '';                   	
                        p.promise.then(function () {
                	        obj = toObject($scope.model.org,'ORGANISATION_ID',ORGANISATION.ORGANISATION_ID);
                	        $scope.model.channelList = obj.b_channel;
                	        $scope.model.warehouseList = obj.user_warehouse;
                        	
                        });
                    }
                    
                },
                getList:function (data) {
                	$scope.model.org = data;
                	p.resolve();
                }
            }
			//初始化转对象
			function toObject (list,code,n) {
				for (var i = 0; i < list.length; i++) {
					if (list[i][code]==n) {
						return list[i];
					}
				}
			};
			//校验数据
			function checkInfo () {
				if (!$scope.ORGANISATION) {
					Notification.error(transervice.tran('请选择组织'));
					return false;
				}
				if (!$scope.model.CHANNEL) {
					Notification.error(transervice.tran('请选择平台'));
					return false;
				}
				if (!$scope.model.ATWAREHOUSE) {
					Notification.error(transervice.tran('请选择仓库'));
					return false;
				}
				return true;
				
			}
			//确认
			$scope.confirm = function () {
				checkInfo()&&$modalInstance.close({
								'WAREHOUSE_NAME_CN':$scope.model.ATWAREHOUSE.WAREHOUSE_NAME_CN,
								'CHANNEL_NAME_CN':$scope.model.CHANNEL.CHANNEL_NAME_CN,
								'ORGANISATION_NAME_CN':$scope.ORGANISATION.ORGANISATION_NAME_CN
							});
			}
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }
			
        });
    }
);