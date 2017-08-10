define(['angularAMD', 'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.css', 'ngload!ui-notification'], function (angularAMD) {
    'use strict';
    angularAMD.service('commonService',
        function ($confirm, Notification, $location) {


            function getDicTable() {
                var dic = localStorage.getItem("DICTIONARY");
                if (dic != null && dic.length > 0) {
                    dic = angular.fromJson(dic);
                    return dic;
                }
                else {
                    $location.path('/login');
                }
            }


            function changeDic(status, group, type) {
                //获取字典
                var dic = getDicTable();
                if (dic !== undefined && dic.hasOwnProperty(group)) {
                    dic = eval(dic);
                    for (var i in dic[group]['group']) {
                        var val = dic[group]['group'][i].d_value;
                        if (status.toString() === val) {
                            if (type === 'img')
                                return dic[group]['group'][i].d_img;
                            else
                                return dic[group]['group'][i].d_name;
                        }
                    }
                }
            }



            function getDicList(group) {
                var addDefault = arguments[1] !== undefined ? arguments[1] : true;
                var defName = arguments[2] !== undefined ? arguments[2] : "全部";
                //获取字典
                var dic = getDicTable();
                var items = new Array();
                if (dic.hasOwnProperty(group)) {
                    dic = eval(dic);

                    for (var i in dic[group]['group']) {
                        var val = dic[group]['group'][i].D_STATE;
                        if (val == '1') {
                            dic[group]['group'][i].name = dic[group]['group'][i].D_NAME_CN;
                            dic[group]['group'][i].value = dic[group]['group'][i].D_VALUE;
                            items.push(dic[group]['group'][i]);
                        }
                    }
                }
                // if (addDefault)
                // {
                //     items.unshift({d_value: null, d_name: defName});
                // }
                return items;
            }


            function getFilter(model, filters, logic) {
                var type = arguments[3] !== undefined ? arguments[3] : true;
                if (!model.hasOwnProperty('addFilterWhere'))
                    model.addFilterWhere = [];
                if (logic === "or") {
                    var where = { "and": ['or'] };
                    angular.forEach(filters, function (fit) {
                        if (fit.value instanceof Date) {
                            if (Object.prototype.toString.call(type) === "[object String]") {
                                fit.value = fit.value.pattern(type)
                            } else {
                                fit.value = type ? fit.value.pattern("yyyy-MM-dd HH:mm:ss") : new Date(fit.value).getTime() / 1000;
                            }
                        }
                        switch (fit.operator) {
                            case "contains":
                                where.and.push(['like', fit.field, fit.value]);
                                break;
                            case "eq":
                                where.and.push(['=', fit.field, fit.value]);
                                break;
                            case "neq":
                                where.and.push(['<>', fit.field, fit.value]);
                                break;
                            case "gte":
                                where.and.push(['>=', fit.field, fit.value]);
                                break;
                            case "gt":
                                where.and.push(['>', fit.field, fit.value]);
                                break;
                            case "lte":
                                where.and.push(['<=', fit.field, fit.value]);
                                break;
                            case "lt":
                                where.and.push(['<', fit.field, fit.value]);
                                break;
                            case "doesnotcontain":
                                where.and.push(['not like', fit.field, fit.value]);
                                break;
                            case "in":
                                where.and.push(['in', fit.field, fit.value]);
                                break;
                        }
                    });
                    model.addFilterWhere.push(where);
                }
                else {
                    angular.forEach(filters, function (fit) {
                        if (fit.value instanceof Date) {
                            if (Object.prototype.toString.call(type) === "[object String]") {
                                fit.value = fit.value.pattern(type)
                            } else {
                                fit.value = type ? fit.value.pattern("yyyy-MM-dd HH:mm:ss") : new Date(fit.value).getTime() / 1000;
                            }
                        }
                        if (fit.hasOwnProperty('filters')) {
                            model = getFilter(model, fit.filters, fit.logic)
                        }
                        switch (fit.operator) {
                            case "contains":
                                model.addFilterWhere.push({ "and": ['like', fit.field, fit.value] });
                                break;
                            case "eq":
                                model.addFilterWhere.push({ "and": ['=', fit.field, fit.value] });
                                break;
                            case "neq":
                                model.addFilterWhere.push({ "and": ['<>', fit.field, fit.value] });
                                break;
                            case "gte":
                                model.addFilterWhere.push({ "and": ['>=', fit.field, fit.value] });
                                break;
                            case "gt":
                                model.addFilterWhere.push({ "and": ['>', fit.field, fit.value] });
                                break;
                            case "lte":
                                model.addFilterWhere.push({ "and": ['<=', fit.field, fit.value] });
                                break;
                            case "lt":
                                model.addFilterWhere.push({ "and": ['<', fit.field, fit.value] });
                                break;
                            case "doesnotcontain":
                                model.addFilterWhere.push({ "and": ['not like', fit.field, fit.value] });
                                break;
                            case "in":
                                model.addFilterWhere.push({ "and": ['in', fit.field, fit.value] });
                                break;
                        }
                    });
                }
                return model;
            }


            //获取组织方法
            function getOrganisationList(types,isInit) {

                var dataSearch = {
                    "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1]],
                    limit:"0",
                    "joinwith":["o_organisationc"]
                };
                if(!types){
                    types=[4];
                }
                if (isInit==0) {
                    dataSearch.where.push(["=","oc.INIT_STATE","0"])
                }
                if (isInit==1) {
                    dataSearch.where.push(["=","oc.INIT_STATE","1"])
                }

                if(types.length==1){
                    dataSearch.where.push(["=","o_organisation_relation_middle.FUNCTION_ID",types[0]])
                }else{
                    dataSearch.andwhere=["or"];
                    for(var i=0;i<types.length;i++){
                        var type=types[i];
                        dataSearch.andwhere.push(["=","o_organisation_relation_middle.FUNCTION_ID",type])
                    }
                }
                var deferred = $q.defer();
                httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                    var organizations=datas.data.filter(a=>a.o_organisationc).map(a=>a.o_organisationc);
                    deferred.resolve(organizations);

                });

                return deferred.promise;
            }

            //获取页面权限
            function getPermissions(BUSINESS_OBJECT_ID) {
                var str = localStorage.getItem("PERMISSIONS");
                var permissions = angular.fromJson(str);
                permissions=permissions.filter(p=>p.BUSINESS_OBJECT_ID==BUSINESS_OBJECT_ID);

                return permissions.map(p=>p.PERMISSION_NAME_CN);
            }


            function getUserInfo() {
                var userInfo = localStorage.getItem("USERINFO");

                var user = angular.fromJson(userInfo);
                return user;

            }



            return ({
                getDicTable: getDicTable,
                getCurDic: changeDic,
                getDicList: getDicList,
                getFilter: getFilter,
                getUserInfo:getUserInfo,
                getOrganisationList:getOrganisationList,
                getPermissions:getPermissions
            });

        });
})