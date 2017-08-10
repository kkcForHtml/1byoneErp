define([
    //'app/main/directives/menuDirt',
    'css!styles/css/skins/menu.css',
    'css!styles/css/comment.css',
    'css!styles/font_aliyun/iconfont.css',
    'app/common/Services/UserCache',
    'app/common/Services/UserService',
    'app/common/directives/AmPermission',
    'app/common/Services/AmHttp',
    'app/common/Services/httpService',
    'app/common/directives/oneClick',
    'app/common/Services/TranService',
    'numeric',
    'app/common/directives/AmReport',
    'datetimepicker',
    'app/common/directives/amDate',
    'table2excel',
    'appAdmin',
    'app/main/directives/header',
    'app/main/directives/main-sidebar',
    "vfs_fonts",
    "app/common/directives/gridTableDirt",
    'app/common/Services/configService',
    'app/common/Services/commonService',
    'bowerLibs/common/dateFormat',
    'app/common/directives/gridAutoHeightDirt',
    'app/common/directives/gridFlagtDirt',
    'app/main/directives/menuClickDirt',
    'kendo-cultures',
    'kendo-messages',
    'kendo-angular',
    'app/common/directives/inputClearDirt',
    "app/main/controllers/change_password_service",
    'app/common/directives/inputBlurDirt',
    'app/common/directives/dirtyFilter',
    'app/common/directives/skuLinkDirt',
    'app/common/directives/formatDateFilter',
    'app/common/Services/messageService',
    'app/common/directives/purchaseLinkDirt',
    'app/i18n/gridUi_US',
    'bowerLibs/angular-bootstrap-grid-tree/src/tree-grid-directive',
    'app/common/directives/btnPermissionDirt',
    //'app/common/directives/select2-directive'
    'app/common/directives/addHeaderDirt',
    'app/common/directives/kindEditor'

], function () {
    return ['$scope', '$rootScope', '$location','Notification', '$timeout', 'i18nService', 'configService','$state','change_password_service','gridUi_US','httpService',
        function ($scope, $rootScope,$location,Notification, $timeout, i18nService, configService,$state,change_password_service,gridUi_US,httpService) {

            i18nService.setCurrentLang(window.localStorage.lang || 'zh-CN');
            // if(window.localStorage.lang=='en-US'){
            //     i18nService.add(window.localStorage.lang,gridUi_US);
            // }

            kendo.culture(window.localStorage.lang || 'zh-CN');
            configService.getDictionary();

            $scope.userInfo=configService.getUserInfo()
            if(!$scope.userInfo){
                logout();
                // $location.path('/login');
            }




            function logout(){

                $scope.userInfo=null;

                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "logout", "POST", {}).then(function (datas) {

                        Notification.success({message: "退出成功", delay: 5000});
                        localStorage.removeItem("USERINFO");
                        localStorage.removeItem("USERROLEINFO");
                        $location.path('/login');

                })

            }

            $scope.logout =logout;

            //修改密码
            $scope.change_password =function(){
                change_password_service.showDialog();
            }

            //激活当前菜单
            function activeMenu() {
                setTimeout(function () {
                    var curentSate=$state.current.name;
                    if(curentSate.indexOf(".")==-1){
                        return;
                    }
                    curentSate=curentSate.replace(".","/");
                    var alist= $(".sidebar-menu .treeview-menu a");
                    for(var i=0;i<alist.length;i++){
                        var dom=alist[i];
                        if(dom.href.indexOf(curentSate)!=-1){
                            $(dom).parent().parent().parent().find("a:first").click();
                            $(dom).addClass("menu-active");
                            break;
                        }

                    }
                },100)

            }
            activeMenu();
            
            //初始化高度自适应
            var c_height = $(window).height()-50-$('.main-footer').outerHeight();
            $('.content-wrapper').css('min-height',c_height);


        }]
});
