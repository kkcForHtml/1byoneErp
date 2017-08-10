define(['angularAMD'], function(angularAMD) {
    'use strict';
    angularAMD.service('configService',
            function(httpService, $location,$q) {



                function getUserInfo() {
                    var userInfo = localStorage.getItem("USERINFO");

                    var user = angular.fromJson(userInfo);
                    return user;

                }
                /*
                 * 获取字典
                 */
                function getDictionary()
                {
                    var isCache = arguments[0] !== undefined ? arguments[0] : true;
                    var dic = localStorage.getItem("DICTIONARY");
                    if (dic != null && dic.length > 0 && isCache)
                    {
                        return dic;
                    }
                    else
                    {
                        var postModel = {
                            "select": "m.D_GROUP",
                            "joinWith": "group",
                            "groupby": "D_GROUP",
                            "indexBy": "D_GROUP",
                            "limit": 0,
                            "where": [
                                "<>",
                                "p_dictionary.D_STATE",
                                0
                            ]
                        }

                        httpService.httpHelper(httpService.webApi.api, "common/base/dictionary", "index",  "POST", postModel).then(
                                function(data) {
                                    if (data != null && data.status == 200) {
                                        localStorage.setItem("DICTIONARY", JSON.stringify(data.data));
                                    } else {
                                        $location.path('/login');
                                    }
                                },
                                function(data) {
                                    $location.path('/login');
                                });
                    }
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
                    return permissions;
                }

                
                return ({

                    getDictionary: getDictionary,
                    getUserInfo:getUserInfo,
                    getOrganisationList:getOrganisationList,
                    getPermissions:getPermissions
                });

            });
})