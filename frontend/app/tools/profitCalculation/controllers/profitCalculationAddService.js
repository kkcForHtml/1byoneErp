define(
    ['angularAMD',
        'css!bowerLibs/select2/css/select2',
        'css!bowerLibs/select2/css/select2-bootstrap.css',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/select2-directive'
    ],
    function (angularAMD) {
        "use strict";
        angularAMD.service(
            'profitCalculationAddService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "profitCalculationAddService",
                            backdrop: "static",
                            size: "84%", //lg,sm,md,llg,ssm
                            templateUrl: 'app/tools/profitCalculation/views/profitCalculationAdd.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("profitCalculationAddService", function ($scope, amHttp, $confirm, model, $modalInstance, configService, httpService, Notification, transervice, $http, $q, $interval, commonService, $filter, gridDefaultOptionsService, messageService, $timeout) {
            //初始化默认数据
            $scope.model = {
                channelTotalList: {
                    data: []
                },
                skuTotalList: {
                    data: []
                },
                minorClassificationList: {
                    data: []
                },
                ITEM_LENGTH: '',
                ITEM_WIDTH: '',
                ITEM_HEIGHT: '',
                ITEM_VOLUMES: 0,
                PACKAGE_WIDTH: '',
                PACKAGE_LENGTH: '',
                PACKAGE_HEIGHT: '',
                PACKAGE_VOLUMES: 0,
                OUT_PACKAGE_WIDTH: '',
                OUT_PACKAGE_LENGTH: '',
                OUT_PACKAGE_HEIGHT: '',
                OUT_PACKAGE_VOLUMES: 0,
                ITEM_WEIGHT_UNIT:'2',
                ITEM_LENGTH_UNIT:'1',
                PACKAGE_WEIGHT_UNIT:'2',
                PACKAGE_LENGTH_UNIT:'1',
                OUT_PACKAGE_WEIGHT_UNIT:'2',
                OUT_PACKAGE_LENGTH_UNIT:'1',
                TEMPLATE_ID:'1',
                ITEM_STATUS:'1',
                EXTERNAL_PRODUCT_ID_TYPE:'1',
                FULFILLMENT_CENTER_ID:'1',
                CONDITION_TYPE:'1',
                UPDATE_DELETE:'1',
                PARENT_CHILD:'1'               

            };
            var $p = $q.defer();
            // $scope.model.channel = 70;
            //当前登录用户
            $scope.userInfo = configService.getUserInfo();
            $scope.orgList = $scope.userInfo.u_user_organization ? $scope.userInfo.u_user_organization : [];
            $scope.isAdmin = false;
            var data = $scope.userInfo.u_role_user.filter(e => e.ROLE_INFO_ID);
            data.forEach(obj => {
                if (obj.u_roleInfo.ROLE_TYPE_ID == 3) {
                    $scope.isAdmin = true;
                    return
                }
            });

            function getOrgList() {
                //库存组织&用户分配的组织
                return configService.getOrganisationList([4]).then(function (datas) {
                    $scope.orgList = [];
                    if (!$scope.isAdmin) {
                        datas && datas.forEach(d => {
                            if ($scope.userInfo.u_user_organization.length > 0) {
                                var data = $scope.userInfo.u_user_organization.filter(v => v.ORGANISATION_ID == d.ORGANISATION_ID);
                                if (data.length > 0) {
                                    $scope.orgList.push(data[0].o_organisation);
                                }
                            }
                        });
                    } else {
                        $scope.orgList = $scope.orgList.concat(datas);
                    }

                });
            };
            getOrgList().then(function () {
                $scope.orgList.length && $scope.orgList.forEach(v => {
                    if (v) {
                        v.b_channel.length && v.b_channel.forEach(c => {
                            $scope.model.channelTotalList.data.push({
                                "id": c.CHANNEL_ID,
                                "text": c.CHANNEL_NAME_CN
                            });
                        });
                    }
                });

                //用户小分类
                var productTypeList = $scope.userInfo.u_user_category ? $scope.userInfo.u_user_category : [];
                productTypeList && productTypeList.forEach(v => {
                    if (v.p_category != null) {
                        if (v.p_category.g_product_types_1.length > 0) {
                            if (v.p_category.g_product_types_1.length > 0) {
                                v.p_category.g_product_types_1.forEach(s => {
                                    $scope.model.minorClassificationList.data.push({
                                        "id": s.PRODUCT_TYPE_ID,
                                        "text": s.SYSTEM_NAME_CN
                                    });
                                    s.product && s.product.forEach(p => {
                                        $scope.model.skuTotalList.data.push({
                                            "id": p.PSKU_ID,
                                            "text": p.PSKU_CODE
                                        })
                                    })

                                })
                            }
                        }
                    }
                });
                $p.resolve();
            });
            //基本信息
            //预览图片
            $scope.imgSrc = '';
            $scope.changeImgUrl = function (params) {
                $scope.imgSrc = params;
            }

            //平台信息

            //包装信息
            $scope.cv = {
                changeItemVolume: function () {
                    $scope.model.ITEM_VOLUMES = $scope.model.ITEM_LENGTH * $scope.model.ITEM_WIDTH * $scope.model.ITEM_HEIGHT;
                },
                changePackageVolume: function () {
                    $scope.model.PACKAGE_VOLUMES = $scope.model.PACKAGE_LENGTH * $scope.model.PACKAGE_WIDTH * $scope.model.PACKAGE_HEIGHT;
                },
                changeOutPackageVolume: function () {
                    $scope.model.OUT_PACKAGE_VOLUMES = $scope.model.OUT_PACKAGE_LENGTH * $scope.model.OUT_PACKAGE_WIDTH * $scope.model.OUT_PACKAGE_HEIGHT;
                }
            }

            //A+信息
            
            //更改数量
            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //校验基本信息
            function checkInfo() {
            	var ary = Array.prototype.slice.apply(arguments);
            	var flag = true;
                if (angular.isUndefined($scope.model.CHANNEL_ID) || !$scope.model.CHANNEL_ID) {
                    Notification.error(transervice.tran('请选择平台'));
                    return false;
                }
                if (angular.isUndefined($scope.model.PSKU_ID) || !$scope.model.PSKU_ID) {
                    Notification.error(transervice.tran('请选择SKU'));
                    return false;
                }
                if (angular.isUndefined($scope.model.CHANNEL_REMARKS) || !$scope.model.CHANNEL_REMARKS) {
                    Notification.error(transervice.tran('描述不能为空'));
                    return false;
                }
                if (angular.isUndefined($scope.model.ASIN) || !$scope.model.ASIN) {
                    Notification.error(transervice.tran('ASIN不能为空'));
                    return false;
                }
            	ary.forEach(function (key) {
	                if (angular.isUndefined($scope.model[key]) || !$scope.model[key]) {                    
	                    Notification.error(key.toLowerCase()+transervice.tran('不能为空'));
	                    flag = false
	                    return false;
	                }
            	})                
                return flag&&true;
            }

            //保存操作
            $scope.save = function () {
                if (!checkInfo('MAIN_IMAGE_URL','ITEM_LENGTH','ITEM_WIDTH','ITEM_HEIGHT','OUT_PACKAGE_WEIGHT','OUT_PACKAGE_LENGTH','OUT_PACKAGE_WIDTH','OUT_PACKAGE_HEIGHT','QUANTITY_OF_PACKAGE','SALE_PRICE','FBA_FEE')) {
                    return false;
                }
                var s_data = {};
                s_data = angular.copy($scope.model);
                delete s_data.channelTotalList;
                delete s_data.skuTotalList;
                delete s_data.minorClassificationList;
                httpService.httpHelper(httpService.webApi.api, "tools/platformdata", "create", "POST", s_data).then(function (result) {
                    Notification.success(transervice.tran('操作成功'));
                    $scope.cancel();
                });
            };
        });
    }
);