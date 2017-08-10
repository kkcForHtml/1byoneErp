/*********************************************************
 * 开发人员：龙进良
 * 创建时间：2016-09-22
 * 描述说明：页面路由配置
 * *******************************************************/
define(['angularAMD', 'angular-ui-router', 'bootstrap', 'angular-translate-files', 'ui-grid','app/common/Services/TranService'],
    function (angularAMD) {
        var app = angular.module('webStrike', ['ui.router', 'pascalprecht.translate', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav'
            , 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.pinning', 'ui.grid.grouping',
            'ui.grid.exporter', 'ui.grid.pagination', 'ui.grid.autoResize', 'ui.grid.treeView']);
        app.config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
            function ($stateProvider, $urlRouterProvider, $translateProvider) {
                var ver = "?ver="+_version_;
                $stateProvider.state('main', angularAMD.route({
                    url: '/main',
                    templateUrl: './app/main/views/main.html' + ver,
                    controllerUrl: 'app/main/controllers/mainCtrl'  //框架页面main/bwarehouse
                })).state('main.index', angularAMD.route({
                    url: '/index',                     //首页
                    templateUrl: './app/index/views/index.html' + ver,
                    controllerUrl: 'app/index/controllers/indexCtrl'
                })).state('main.bwarehouse', angularAMD.route({
                    url: '/bwarehouse',                     //仓库
                    templateUrl: './app/masterCenter/bwarehouse/views/warehouse.html' + ver,
                    controllerUrl: 'app/masterCenter/bwarehouse/controllers/warehouseCtrl'
                })).state('main.bchannel', angularAMD.route({
                    url: '/bchannel',                       //平台
                    templateUrl: './app/masterCenter/bchannel/views/bchannel.html' + ver,
                    controllerUrl: 'app/masterCenter/bchannel/controllers/bchannelCtrl'
                })).state('main.organisation', angularAMD.route({
                    url: '/organisation',                   //用户中心 组织架构
                    templateUrl: './app/userCenter/organisation/views/organisation.html' + ver,
                    controllerUrl: 'app/userCenter/organisation/controllers/organisationCtrl'
                })).state('main.user', angularAMD.route({
                    url: '/user',                            //用户中心 用户信息
                    templateUrl: './app/userCenter/userManagement/views/userInfo.html' + ver,
                    controllerUrl: 'app/userCenter/userManagement/controllers/userInfoCtrl'
                })).state('main.role', angularAMD.route({
                    url: '/role',                            //用户中心 角色信息
                    templateUrl: './app/userCenter/roleManagement/views/roleInfo.html' + ver,
                    controllerUrl: 'app/userCenter/roleManagement/controllers/roleInfoCtrl'
                })).state('main.staff', angularAMD.route({
                    url: '/staff',                            //用户中心 员工信息
                    templateUrl: './app/userCenter/staffManagement/views/staffInfo.html' + ver,
                    controllerUrl: 'app/userCenter/staffManagement/controllers/staffInfoCtrl'
                })).state('main.fbafee', angularAMD.route({
                    url: '/fbafee',                           //FBA费
                    templateUrl: './app/tools/views/fbafee.html' + ver,
                    controllerUrl: 'app/tools/controllers/fbafeeCtrl'
                })).state('main.fbafeeConfigure', angularAMD.route({
                    url: '/fbafeeConfigure',                           //FBA费配置
                    templateUrl: './app/tools/fbafeeConfigure/views/fbafeeConfigure.html' + ver,
                    controllerUrl: 'app/tools/fbafeeConfigure/controllers/fbafeeConfigureCtrl'
                })).state('main.weighted', angularAMD.route({
                    url: '/weighted',                           //策略加权
                    templateUrl: './app/tools/weighted/views/weighted.html' + ver,
                    controllerUrl: 'app/tools/weighted/controllers/weightedCtrl'
                })).state('main.demo', angularAMD.route({
                    url: '/demo',
                    templateUrl: './app/demo/views/demo.html' + ver,
                    controllerUrl: 'app/demo/controllers/demoCtrl'
                })).state('main.region', angularAMD.route({
                    url: '/region',
                    templateUrl: './app/masterCenter/region/views/region.html' + ver,
                    controllerUrl: 'app/masterCenter/region/controllers/regionCtrl'
                })).state('main.countryInfo', angularAMD.route({
                    url: '/countryInfo',
                    templateUrl: './app/masterCenter/countryInfo/views/countryInfo.html' + ver,
                    controllerUrl: 'app/masterCenter/countryInfo/controllers/countryInfoCtrl'
                })).state('main.unit', angularAMD.route({
                    url: '/unit',
                    templateUrl: 'app/masterCenter/unit/views/unit.html' + ver,
                    controllerUrl: 'app/masterCenter/unit/controllers/unitCtrl'
                })).state('main.money', angularAMD.route({
                    url: '/money',//货币列表
                    templateUrl: './app/masterCenter/money/views/money.html' + ver,
                    controllerUrl: 'app/masterCenter/money/controllers/moneyCtrl'
                })).state('main.exchangeRate', angularAMD.route({
                    url: '/exchangeRate',//汇率列表
                    templateUrl: './app/masterCenter/exchangeRate/views/exchangeRate.html' + ver,
                    controllerUrl: 'app/masterCenter/exchangeRate/controllers/exchangeRateCtrl'
                })).state('main.account', angularAMD.route({
                    url: '/account',//账号管理
                    templateUrl: './app/masterCenter/account/views/account.html' + ver,
                    controllerUrl: 'app/masterCenter/account/controllers/accountCtrl'
                })).state('main.partnerClass', angularAMD.route({
                    url: '/partnerClass',  // 合作伙伴  伙伴分类
                    templateUrl: './app/cooperativePartner/partnerClass/views/partnerClass.html' + ver,
                    controllerUrl: 'app/cooperativePartner/partnerClass/controllers/partnerClassCtrl'
                })).state('main.permission', angularAMD.route({
                    url: '/permission',  //用户中心--权限管理
                    templateUrl: './app/userCenter/permissions/views/permission.html' + ver,
                    controllerUrl: 'app/userCenter/permissions/controllers/permissionCtrl'
                })).state('main.buddyList', angularAMD.route({
                    url: '/buddyList',      //合作伙伴  伙伴列表
                    templateUrl: './app/cooperativePartner/buddyList/views/Buddylist.html' + ver,
                    controllerUrl: 'app/cooperativePartner/buddyList/controllers/BuddylistCtrl'
                })).state('main.productType', angularAMD.route({
                    url: '/productType',  // 产品分类
                    templateUrl: 'app/masterCenter/product/views/productType.html' + ver,
                    controllerUrl: 'app/masterCenter/product/controllers/productTypeCtrl'
                })).state('main.commonSKU', angularAMD.route({
                    url: '/commonSKU',  // 通用SUK
                    templateUrl: 'app/masterCenter/product/views/commonSKU.html' + ver,
                    controllerUrl: 'app/masterCenter/product/controllers/commonSKUCtrl'
                })).state('main.skplacing', angularAMD.route({
                    url: '/skplacing',  // 出库单
                    templateUrl: 'app/inventoryCenter/skplacing/views/skplacing.html' + ver,
                    controllerUrl: 'app/inventoryCenter/skplacing/controllers/skplacingCtrl'
                })).state('main.skstorage', angularAMD.route({
                    url: '/skstorage',  // 入库单
                    templateUrl: 'app/inventoryCenter/skstorage/views/skstorage.html' + ver,
                    controllerUrl: 'app/inventoryCenter/skstorage/controllers/skstorageCtrl'
                })).state('main.skfiallocation', angularAMD.route({
                    url: '/skfiallocation',  // 调拨单
                    templateUrl: 'app/inventoryCenter/skfiallocation/views/skfiallocation.html' + ver,
                    controllerUrl: 'app/inventoryCenter/skfiallocation/controllers/skfiallocationCtrl'
                })).state('main.skallocation', angularAMD.route({
                    url: '/skallocation',  // 调拨计划单
                    templateUrl: 'app/inventoryCenter/skallocation/views/skallocation.html' + ver,
                    controllerUrl: 'app/inventoryCenter/skallocation/controllers/skallocationCtrl'
                })).state('main.productSKU', angularAMD.route({
                    url: '/productSKU',  //  产品SUK
                    templateUrl: 'app/masterCenter/product/views/productSKU.html' + ver,
                    controllerUrl: 'app/masterCenter/product/controllers/productSKUCtrl'
                })).state('main.FSKU',angularAMD.route({
                    url:'/FSKU',  // 映射表
                    templateUrl:'app/masterCenter/product/views/FSKU.html'+ver,
                    controllerUrl:'app/masterCenter/product/controllers/FNSKUCtrl'
                })).state('main.purchasingPlan',angularAMD.route({
                    url:'/purchasingPlan',                     // 采购计划单
                    templateUrl:'app/purchasingCenter/purchasingPlan/views/purchasingPlan.html'+ver,
                    controllerUrl:'app/purchasingCenter/purchasingPlan/controllers/purchasingPlanCtrl'
                })).state('main.purchase',angularAMD.route({
                    url:'/purchase',  // 采购订单列表
                    templateUrl:'app/purchasingCenter/purchaseOrder/views/purchase.html'+ver,
                    controllerUrl:'app/purchasingCenter/purchaseOrder/controllers/purchaseCtrl'
                })).state('main.purchaseTracking',angularAMD.route({
                    url:'/purchaseTracking',  // 采购跟踪列表
                    templateUrl:'app/purchasingCenter/purchasingTracking/views/purchasingTracking.html'+ver,
                    controllerUrl:'app/purchasingCenter/purchasingTracking/controllers/purchasingTrackingCtrl'
                })).state('main.inspectionSchedule',angularAMD.route({
                    url:'/inspectionSchedule',  // 品检排程
                    templateUrl:'app/purchasingCenter/inspectionSchedule/views/inspectionSchedule.html'+ver,
                    controllerUrl:'app/purchasingCenter/inspectionSchedule/controllers/inspectionScheduleCtrl'
                })).state('main.paymentRequest', angularAMD.route({
                    url: '/paymentRequest',                     //财务/应付管理/付款申请
                    templateUrl: './app/finance/paymentRequest/views/paymentRequest.html' + ver,
                    controllerUrl: 'app/finance/paymentRequest/controllers/paymentRequestCtrl'
                })).state('main.accountingPeriod', angularAMD.route({
                        url: '/accountingPeriod',                     //财务/会计区间/启动会计管理
                        templateUrl: './app/finance/accountingPeriod/views/accountingPeriod.html' + ver,
                        controllerUrl: 'app/finance/accountingPeriod/controllers/accountingPeriodCtrl'
                })).state('login', angularAMD.route({
                    url: '/login',                     //登录
                    templateUrl: './app/login/views/login.html' + ver,
                    controllerUrl: 'app/login/controllers/loginCtrl'
                })).state('main.adjustment', angularAMD.route({
                    url: '/adjustment',                     //库存调整单
                    templateUrl: './app/inventoryCenter/adjustment/views/adjustment.html' + ver,
                    controllerUrl: 'app/inventoryCenter/adjustment/controllers/adjustmentCtrl'
                })).state('main.pskstorage',angularAMD.route({
                    url: '/pskstorage',                     //待入库列表
                    templateUrl :'./app/inventoryCenter/pskstorage/views/pskstorage.html' + ver,
                    controllerUrl: 'app/inventoryCenter/pskstorage/controllers/pskstorageCtrl'
                })).state('main.pskdelivery',angularAMD.route({
                    url: '/pskdelivery',                     //待入库列表
                    templateUrl :'./app/inventoryCenter/pskdelivery/views/pskdelivery.html' + ver,
                    controllerUrl: 'app/inventoryCenter/pskdelivery/controllers/pskdeliveryCtrl'
                })).state('main.dispatchPlan',angularAMD.route({
                    url: '/dispatchPlan',//发运计划
                    templateUrl :'app/dispatch/views/dispatchPlan.html' + ver,
                    controllerUrl: 'app/dispatch/controllers/dispatchPlanCtrl'
                })).state('main.dispatchOrder',angularAMD.route({
                    url: '/dispatchOrder',//发运单
                    templateUrl :'app/dispatch/views/dispatchOder.html' + ver,
                    controllerUrl: 'app/dispatch/controllers/dispatchOderCtrl'
                })).state('main.marineTrack',angularAMD.route({
                    url: '/marineTrack',                //发运跟踪
                    templateUrl :'app/dispatch/views/marineTrack.html' + ver, 
                    controllerUrl: 'app/dispatch/controllers/marineTrackCtrl'

                })).state('main.dispatchQuery',angularAMD.route({
                    url: '/dispatchQuery',             //发运查询
                    templateUrl :'app/dispatch/dispatchQuery/views/dispatchQuery.html' + ver,
                    controllerUrl: 'app/dispatch/dispatchQuery/controllers/dispatchQueryCtrl'
                })).state('main.allocationTracking',angularAMD.route({
                    url: '/allocationTrack',             //调拨跟踪
                    templateUrl :'app/dispatch/views/allocationTrack.html' + ver,
                    controllerUrl: 'app/dispatch/controllers/allocationTrackCtrl'
                })).state('main.inventoryReport',angularAMD.route({
                    url: '/inventoryReport',             //库存往来报告
                    templateUrl :'app/report/inventoryReport/views/inventoryReport.html' + ver,
                    controllerUrl: 'app/report/inventoryReport/controllers/inventoryReportCtrl'
                })).state('main.libraryAgeReport',angularAMD.route({
                    url: '/libraryAgeReport',             //库龄报表
                    templateUrl :'app/report/libraryAgeReport/views/libraryAgeReport.html' + ver,
                    controllerUrl: 'app/report/libraryAgeReport/controllers/libraryAgeReportCtrl'
                })).state('main.historyAgeReport',angularAMD.route({
                    url: '/historyAgeReport',             //历史库龄报表
                    templateUrl :'app/report/historyAgeReport/views/historyAgeReport.html' + ver,
                    controllerUrl: 'app/report/historyAgeReport/controllers/historyAgeReportCtrl'
                })).state('main.receiveDifferenceReport',angularAMD.route({
                    url: '/receiveDifferenceReport',             //收货差异表
                    templateUrl :'app/report/receiveDifferenceReport/views/receiveDifferenceReport.html' + ver,
                    controllerUrl: 'app/report/receiveDifferenceReport/controllers/receiveDifferenceReportCtrl'
                })).state('main.accountingPeriodEnd', angularAMD.route({
                    url: '/accountingPeriodEnd',                     //财务/会计区间/关闭会计区间
                    templateUrl: './app/finance/accountingPeriodEnd/views/accountingPeriodEnd.html' + ver,
                    controllerUrl: 'app/finance/accountingPeriodEnd/controllers/accountingPeriodEndCtrl'
                })).state('main.stockLedgerReport',angularAMD.route({
                    url: '/stockLedgerReport',             //库存台账
                    templateUrl :'app/report/stockLedgerReport/views/stockLedgerReport.html' + ver,
                    controllerUrl: 'app/report/stockLedgerReport/controllers/stockLedgerReportCtrl'
                })).state('main.stockSalesReport',angularAMD.route({
                    url: '/stockSalesReport',             //库存销售报表
                    templateUrl :'app/report/stockSalesReport/views/stockSalesReport.html' + ver,
                    controllerUrl: 'app/report/stockSalesReport/controllers/stockSalesReportCtrl'
                })).state('main.skInitialization',angularAMD.route({
                    url: '/skInitialization',             //库存初始化单
                    templateUrl :'app/initialization/skInitialization/views/skInitialization.html' + ver,
                    controllerUrl: 'app/initialization/skInitialization/controllers/skInitializationCtrl'
                })).state('main.menu',angularAMD.route({
                    url: '/menu',             //菜单列表
                    templateUrl :'app/menu/views/menu.html' + ver,
                    controllerUrl: 'app/menu/controllers/menuCtrl'
                })).state('main.menuPermission',angularAMD.route({
                    url: '/menuPermission',             //菜单权限设置
                    templateUrl :'app/menu/views/menuPermission.html' + ver,
                    controllerUrl: 'app/menu/controllers/menuPermissionCtrl'
                })).state('main.logs',angularAMD.route({
                    url: '/logs',             //接口日志
                    templateUrl :'app/logs/views/logs.html' + ver,
                    controllerUrl: 'app/logs/controllers/logsCtrl'
                })).state('main.operationLogs',angularAMD.route({
                    url: '/operationLogs',             //操作日志
                    templateUrl :'app/logs/views/operationLogs.html' + ver,
                    controllerUrl: 'app/logs/controllers/operationLogsCtrl'
                })).state('main.profitCalculation',angularAMD.route({
                    url: '/profitCalculation',             //平台资料管理
                    templateUrl :'app/tools/profitCalculation/views/profitCalculation.html' + ver,
                    controllerUrl: 'app/tools/profitCalculation/controllers/profitCalculationCtrl'
                })).state('main.amazonlogs',angularAMD.route({
                    url: '/amazonlogs',             //亚马逊日志
                    templateUrl :'app/logs/views/amazonlogs.html' + ver,
                    controllerUrl: 'app/logs/controllers/amazonlogsCtrl'
                }));

                $urlRouterProvider.otherwise('/main/index');
                var lang = window.localStorage.lang || 'zh-CN';
                $translateProvider.preferredLanguage(lang);

                $translateProvider.useStaticFilesLoader({
                    prefix: 'app/i18n/',
                    suffix: '.json'
                });

            }]);

        //无路由时定位到当前页
        app.run(function ($rootScope, $templateCache, $location) {
            $rootScope.$on('$locationChangeStart', function (event, next, current) {
            	
            	if (next!==current&&next.indexOf("#")!==-1) {
					$('.k-group').length&&$('.k-group').remove();            		
            	}
            	
                if (next.indexOf("#") === -1) {
                    $location.path(current.split("#")[1]);
                }
            });
        });

        return angularAMD.bootstrap(app);
    });
