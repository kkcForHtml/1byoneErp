define(['angularAMD',"app/common/Services/UserCache"],function(angularAMD) {
    angularAMD.directive('amPermission', ["userCache", function (userCache) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, controllers) {
                //解析配置信息
                var settings = angular.fromJson(attrs.amPermission);

                //更新展示设置
                function updateDisplay() {
                    var userInfo = userCache.get("loginInfo");

                    var isShown = false;
                    if (angular.isArray(settings)) {
                        for (var item in settings) {
                            if (isCanShown(settings[item], userInfo)) {
                                isShown = true;
                            }
                        }
                    }
                    else {
                        isShown = isCanShown(settings, userInfo);
                    }

                    if (isShown) {
                        element.removeClass("permission-hide");
                    } else {
                        element.addClass("permission-hide");
                    }
                }

                //判断配置项目是否可见
                function isCanShown(settingItem, userInfo) {
                    if (settingItem.UserType && settingItem.Permission) {
                        if (settingItem.UserType == userInfo.UserType) {
                            if (angular.isArray(settingItem.Permission)) {
                                for (var item in settingItem.Permission) {
                                    return isExistInArray(settingItem.Permission[item], userInfo.permissions.menu);
                                }
                            }
                            else {
                                return isExistInArray(settingItem.Permission, userInfo.permissions.menu);
                            }
                        }
                    }
                    else if (settingItem.UserType) {
                        if (userInfo.UserType == settingItem.UserType) {
                            return true;
                        }
                    } else {
                        if (angular.isArray(settingItem.Permission)) {
                            for (var item in settingItem.Permission) {
                                return isExistInArray(settingItem.Permission[item], userInfo.permissions.menu);
                            }
                        }
                        else {
                            return isExistInArray(settingItem.Permission, userInfo.permissions.menu);
                        }
                    }
                    return false;
                }

                //确认权限在权限列表中是否存在
                function isExistInArray(permission, array) {
                    for (var item in array) {
                        if (array[item] == permission) {
                            return true;
                        }
                    }
                    return false;
                }

                //初始化时更新显示
                updateDisplay();

                //用户信息变更时更新显示
                scope.$on("login-state-changed", function () {
                    updateDisplay();
                    scope.$emit("permission_stage_changed");
                });


            }
        };
    }]);
})