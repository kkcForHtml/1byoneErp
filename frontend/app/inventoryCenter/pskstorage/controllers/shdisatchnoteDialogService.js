define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt',
    ],
    function (angularAMD) {
        angularAMD.service(
            'shdisatchnoteDialogService',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "shdisatchnoteDialogCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/pskstorage/views/shdisatchnoteDialog.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("shdisatchnoteDialogCtrl", function ($scope, amHttp, $confirm, model, $modalInstance, httpService, Notification, configService,transervice, $http, $q, $interval, commonService,$filter,gridDefaultOptionsService,messageService,goodsRejectedService) {

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //初始化组织列表
            $scope.organizations = [];

            $scope.channels = [];
            $scope.wareHouses = [];

            //亚马逊尺寸
            $scope.amazonSizes=commonService.getDicList("PRODUCT_SKU");

            //是否紧急状态
            $scope.urgents=commonService.getDicList("URGENT_ORDER");


            //运输方式
            $scope.transports=commonService.getDicList("TRANSPORTS");
            $scope.transports_search=[{D_VALUE:"",D_NAME_CN:'全部'}].concat($scope.transports);

            //获取质检状态
            $scope.inspectionStates=commonService.getDicList("INSPECTION_STATE");

            //获取发运单状态
            $scope.dispatchStates=[{D_VALUE:"",D_NAME_CN:'全部'}].concat(commonService.getDicList("PU_DISPATCH_NOTE"));


            //初始化仓库列表
            $scope.eWarehouseList = [];//调出仓库列表
            $scope.aWarehouseList = [];//调入仓库列表
            (function () {

                var dataSearch = {
                    "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
                    "joinwith":["o_organisationt"]
                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (result) {
                    $scope.organizations = result.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
                    $scope.ARGANISATION_CODE = model.ARGANISATION_CODE;
                    $scope.ERGANISATION_CODE = model.ERGANISATION_CODE;
                });


                //获取货币
                var selectWhere2 = {limit:"*"};

                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere2).then(function (datas) {
                    $scope.moneys=datas.data;
                });

                //获取仓库
                var selectWhere = {"where": ["=", "WAREHOUSE_STATE", 1],'limit':0};
                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
                    angular.forEach(result.data, function (obj, index) {
                        if (obj.ORGANIZE_CODE === model.ARGANISATION_CODE) {
                            $scope.eWarehouseList.push(obj);
                        }
                    });
                    angular.forEach(result.data, function (obj, index) {
                        if (obj.ORGANIZE_CODE === model.ERGANISATION_CODE) {
                            $scope.aWarehouseList.push(obj);
                        }
                    });
                    $scope.ATWAREHOUSE_CODE = model.ATWAREHOUSE_CODE;
                    $scope.ETWAREHOUSE_CODE = model.ETWAREHOUSE_CODE;
                    $scope.init();//初始化信息
                });
            })();



            $scope.init = function() {
                $scope.OrganizationName  = getOrganizationName(model.ORGANISATION_ID);
                $scope.CHANNEL_NAME_CN  = model.CHANNEL_NAME_CN;
                $scope.WAREHOUSE_NAME_CN = model.WAREHOUSE_NAME_CN;
                $scope.D_NAME_CN = getStateName($scope.transports,model.TRANSPORT_MODE)
                $scope.DEMANDSKU_CODE = model.DEMANDSKU_CODE;
                $scope.PARTNER_NAME_CN = model.PARTNER_NAME_CN;
                $scope.PlAN_SHIPMENT_AT = model.PlAN_SHIPMENT_AT?$filter("date")(new Date(model.PlAN_SHIPMENT_AT*1000),"yyyy-MM-dd"):"";;
                $scope.KUKAI_NUMBER = model.KUKAI_NUMBER;
                $scope.PSKU_NAME_CN = model.PSKU_NAME_CN;
                $scope.PSKU_NAME_EN = model.PSKU_NAME_EN;
                $scope.EXPECTED_SERVICE_AT  = model.EXPECTED_SERVICE_AT?$filter("date")(new Date(model.EXPECTED_SERVICE_AT*1000),"yyyy-MM-dd"):"";
                $scope.PLA_QUANTITY = model.PLA_QUANTITY;
                $scope.ACTUAL_SHIPM_NUM = model.ACTUAL_SHIPM_NUM;
                $scope.ACTUAL_SHIPM_AT =  model.ACTUAL_SHIPM_AT?$filter("date")(new Date(model.ACTUAL_SHIPM_AT*1000),"yyyy-MM-dd"):"";
                $scope.DELIVER_WARID = model.DELIVER_WARID?model.DELIVER_WARID:'供应商仓';
                $scope.INSPECTION_STATE = getStateName($scope.inspectionStates,model.INSPECTION_STATE)
                $scope.DELIVERY_AT = model.DELIVERY_AT?$filter("date")(new Date(model.DELIVERY_AT*1000),"yyyy-MM-dd"):"";
                $scope.PAYMENT_TERM = model.PAYMENT_TERM;
                $scope.FBA_ID = model.FBA_ID;
                $scope.PLAN_STATE = model.PLAN_STATE==1?'未审核':'已审核';
                $scope.PO_NUMBER = model.PO_NUMBER;
                $scope.DISPATCH_REMARKS = model.DISPATCH_REMARKS;

                //采购信息
                $scope.ORDER_CD = model.ORDER_CD;
                $scope.PSKU_CODE = model.PSKU_CODE;
                $scope.PRICE = model.PRICE;
                $scope.SO_MONEY_CODE  =  getMoneyName(model.SO_MONEY_ID);
                $scope.AMOUNT = model.AMOUNT;

                //货柜信息
                $scope.AMAZON_SIZE_ID = getStateName($scope.amazonSizes,model.AMAZON_SIZE_ID);
                $scope.FCL_LONG = model.FCL_LONG;
                $scope.FCL_WIDE = model.FCL_WIDE;
                $scope.FCL_HIGH = model.FCL_HIGH;
                $scope.FCL_LONG_IN = model.FCL_LONG?model.FCL_HIGH/2.54:0;
                $scope.FCL_WIDE_IN = model.FCL_WIDE?model.FCL_WIDE/2.54:0;
                $scope.FCL_HIGH_IN = model.FCL_HIGH?model.FCL_HIGH/2.54:0;
                $scope.GROSS_WEIGHT = model.GROSS_WEIGHT;
                $scope.FCL_NET_WEIGHT = model.FCL_NET_WEIGHT;
                $scope.LAST_NUM = model.LAST_NUM;
                $scope.PACKING_NUMBER = model.PACKING_NUMBER;
                $scope.NET_WEIGHT_CBM = getTijizhong(model);
                $scope.NET_WEIGHT = getZTJ(model);
                $scope.JFZ = getJiFeiZhong(model);
                $scope.ZXS = getZXS(model);

                //报关信息
                $scope.CUSTOMS_NAME = model.CUSTOMS_NAME;
                $scope.UNIT_NAME = model.UNIT_NAME;
                $scope.REPORTING_ELEMENTS = model.REPORTING_ELEMENTS;
                $scope.CUSTOMS_CODE = model.CUSTOMS_CODE;
                $scope.MONEY_CODE = getMoneyName(model.MONEY_ID);
                $scope.CUSTOMS_PRICE = model.CUSTOMS_PRICE;
                $scope.TARIFF = model.TARIFF;
                $scope.VALUE_ADDED_TAX = model.VALUE_ADDED_TAX;
                $scope.MARKUP_RATIO = model.MARKUP_RATIO+'%';
                $scope.baoguanjine = (model.CUSTOMS_PRICE*model.ACTUAL_SHIPM_NUM).toFixed(2);;

                //单据信息
                $scope.PURCHASING_WAREHOUSING_CD = model.PURCHASING_WAREHOUSING_CD;
                $scope.INTERNAL_SALES_CD =model.INTERNAL_SALES_CD;
                $scope.INTERNAL_PURCHASING_CD = model.INTERNAL_PURCHASING_CD;
                $scope.INTERNAL_SALESTH_CD = model.INTERNAL_SALESTH_CD;
                $scope.INTERNAL_PURCHASINGST_CD = model.INTERNAL_PURCHASINGST_CD;
                $scope.ALLOCATION_ONTHEWAY_CD = model.ALLOCATION_ONTHEWAY_CD;
                $scope.ALLOCATION_GOAL_CD = model.ALLOCATION_GOAL_CD;
                $scope.SO_FNSKU = model.SO_FNSKU;
                $scope.FNSKU = model.FNSKU;
            };



            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            function formatDate(dateValue) {
                if(angular.isUndefined(dateValue)||dateValue === ''){
                    return 0;
                }
                var _formatDate = new Date(dateValue.replace(/-/g,'/')).getTime();
                return Math.round(_formatDate/1000);
            }


            //获取需求组织名称
            function  getOrganizationName(id) {
                if($scope.organizations){
                    var ors= $scope.organizations.filter(o=>o.ORGANISATION_ID==id);
                    if(ors.length){
                        return ors[0].ORGANISATION_NAME_CN;
                    }
                }
                return "";
            };


            //获取体积重
            function getTijizhong(entity){
                var l=entity.FCL_LONG?entity.FCL_LONG:0;
                var w=entity.FCL_WIDE?entity.FCL_WIDE:0;
                var h=entity.FCL_HIGH?entity.FCL_HIGH:0;
                if(entity.TRANSPORT_MODE==1){ //海运
                    return (l*w*h/6000).toFixed(2);
                }else{//空运
                    return (l*w*h/5000).toFixed(2);
                }
            }

            //获取总体积（CBM）
            function getZTJ(entity){
                var l=entity.FCL_LONG?(+entity.FCL_LONG):0;
                var w=entity.FCL_WIDE?(+entity.FCL_WIDE):0;
                var h=entity.FCL_HIGH?(+entity.FCL_HIGH):0;
                return (l*w*h/1000000).toFixed(2);
            }

            //获取计费重
            function getJiFeiZhong(entity){
                var tijiz=getTijizhong(entity);
                var maoz=(+entity.GROSS_WEIGHT)?entity.GROSS_WEIGHT:0;
                if(!(+entity.PACKING_NUMBER)){
                    return 0;
                }
                if(tijiz>maoz){
                    return  (tijiz/entity.PACKING_NUMBER).toFixed(4);
                }
                return  (maoz/entity.PACKING_NUMBER).toFixed(4);
            }

            //获取状态名称
            function  getStateName(states,id) {
                var states=states.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            };
            ////获取货币名称
            function getMoneyName(id){
                if(!$scope.moneys){
                    return "";
                }
                var items=$scope.moneys.filter(c=>c.MONEY_ID=id);
                if(items.length){
                    return items[0].MONEY_NAME_CN;
                }
                return "";
            }

            function getZXS(entity){

                if(!(+entity.PACKING_NUMBER)||!(+entity.ACTUAL_SHIPM_NUM)){
                    entity.FCL_NUM=0;
                    return 0;
                }
                var result=parseInt(entity.ACTUAL_SHIPM_NUM/entity.PACKING_NUMBER);
                entity.FCL_NUM=result;
                return result;
            }
        });
    }
);