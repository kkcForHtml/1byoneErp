/**
 * Created by Administrator on 2017/5/15.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/userCenter/userManagement/controllers/userInfo_edit_service",
        "app/userCenter/permissions/controllers/userPermissionService",
        'app/common/Services/messageService',
        'app/common/Services/configService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'user_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "user_list_ctrl",
                            backdrop: "static",
                            size: "lg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/roleManagement/views/user_list.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("user_list_ctrl", function ($scope, amHttp, model, $filter,configService,$timeout,messageService,commonService,userPermissionService, $modalInstance,gridDefaultOptionsService, Notification, transervice, httpService, $q, $interval,userInfo_edit_service) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'USER_INFO_CODE',enableCellEdit: false, displayName: transervice.tran('用户编码')},
                    { field: 'USERNAME', displayName: transervice.tran('用户实名'),
                        enableCellEdit: false,
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.editUser(row.entity)">{{row.entity.u_staffinfo.STAFF_NAME_CN}}</a>'},
                    { field: 'ORGANISATION_CODE',enableCellEdit: false, displayName: transervice.tran('组织编码'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.o_organisation.ORGANISATION_CODE}}</div>'},
                    { field: 'ORGANISATION_NAME_CN',enableCellEdit: false, displayName: transervice.tran('组织名称'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.o_organisation.ORGANISATION_NAME_CN}}</div>'},
                    { field: 'ROLE_INFO_CODE', enableCellEdit: false,displayName: transervice.tran('角色编码')},
                    { field: 'ROLE_INFO_NAME_CN',enableCellEdit: false, displayName: transervice.tran('角色')},
                    { field: 'PERSONAL_ROLE_ID',enableCellEdit: false, displayName: transervice.tran('权限'),
                        cellTemplate: '<a type="button" class="btn btn-link" ng-click="grid.appScope.seePermission(row.entity)">查看</a>'},
                    { field: 'STAFF_STATE', enableCellEdit: false,displayName: transervice.tran('是否启用'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getStateName(row.entity.STAFF_STATE)}}</div>' }
                ],
                paginationPageSizes: [10,20,50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10,//每页显示个数
                //---------------api---------------------
                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                        if(getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            if(model){
                $scope.exitData = model.exitUserList;
            }
            $scope.name = "用户选择";
            $scope.stateList = commonService.getDicList("STATE");
            $scope.condition = model.exitUserList;
            $scope.init = function(currentPage, pageSize){
                var searchData = {
                    "where":["<>","u_user_info.STAFF_STATE",0]
                };
                if( $scope.searchWhere!=null){
                    searchData = $scope.searchWhere;
                }
                var dataSearch =null;
                if ($scope.condition.length>0) {
                    dataSearch = ["not in","u_user_info.USER_INFO_ID",$scope.condition];
                }
                if(dataSearch!=null){
                    if(searchData.where.length>3 || $scope.searchWhere!=null){
                        searchData.where.push(dataSearch);
                    }else{
                        searchData.where = ["and",["<>","u_user_info.STAFF_STATE",0]];
                        searchData.where.push(dataSearch);
                    }
                }
                /*if(dataSearch!=null){
                    searchData.where.push(dataSearch);
                }*/
                searchData.joinwith = ["u_userinfoc","u_role_user","o_grouping","u_staffinfo","o_organisation","u_category","u_user_organization"];
                searchData.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchData.orderby = "u_user_info.STAFF_STATE desc,u_user_info.UPDATED_AT desc ";
                searchData.distinct = true;

                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.gridOptions.totalItems=result._meta.totalCount;
                            $scope.gridOptions.data = result.data;
                            angular.forEach(result.data,function(obj){
                                obj.ORGANISATION_NAME_CN =obj.o_organisation!=null? obj.o_organisation.ORGANISATION_NAME_CN:"";
                                obj.ROLE_INFO_NAME_CN =obj.u_staffinfo!=null? obj.u_staffinfo.ROLE_INFO_NAME_CN:"";
                                if(obj.u_role_user!=null){
                                    var roleCode = [];
                                    var roleName = [];
                                    obj.u_role_user.forEach(d=>{
                                        roleCode.push(d.u_roleInfo.ROLE_INFO_CODE);
                                        roleName.push(d.u_roleInfo.ROLE_INFO_NAME_CN);
                                    });
                                    obj.ROLE_INFO_CODE = roleCode.join(",");
                                    obj.ROLE_INFO_NAME_CN = roleName.join(",");
                                }
                            });
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                        } else{
                            Notification.error({message: result.message, delay: 5000});
                        }
                    });
            };
            $scope.init();
            $scope.userType = commonService.getDicList("USER_INFO");
            $scope.stateList = commonService.getDicList("STATE");


            //用户信息
            $scope.editUser = function(item){
                //查询行政职能
                configService.getOrganisationList([1]).then(function (datas) {
                    var res_list = new Array();
                    datas && datas.forEach(d=> {
                        res_list.push(d);
                    });
                    $scope.businessOrgList = res_list;

                    /*var dataSearch = {
                     "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",1]],
                     "joinwith":["o_organisationt"],
                     "limit":0
                     };
                     httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                     var poOrgList = datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
                     $scope.businessOrgList = poOrgList;
                     });*/
                    getUserInfo(item.USER_INFO_CODE);
                })

            };

            function getUserInfo(value){
                var item = {};
                var selectData = {
                    "where":["=","u_user_info.USER_INFO_CODE",value],
                    "joinwith":["u_userinfoc","u_role_user","o_grouping","u_staffinfo","o_organisation","u_category","u_user_organization"],
                    "orderby":"u_user_info.STAFF_STATE desc,u_user_info.UPDATED_AT desc",
                    "distinct":true
                };
                httpService.httpHelper(httpService.webApi.api, "users/userinfo", "index" , "POST",selectData).then(
                    function (result){
                        var data = result.data[0];
                        data.ORGANISATION_NAME_CN =data.o_organisation!=null? data.o_organisation.ORGANISATION_NAME_CN:"";
                        data.ROLE_INFO_NAME_CN =data.u_staffinfo!=null? data.u_staffinfo.ROLE_INFO_NAME_CN:"";
                        item= data;
                        item['userType'] = $scope.userType;
                        item['businessOrgList'] = $scope.businessOrgList;
                        item['stateList'] = $scope.stateList;
                        userInfo_edit_service.showDialog(item).then(function(data){
                            $scope.gridOptions.paginationCurrentPage=1;
                            $scope.init();
                        });
                    });
            }
            //查看权限
            $scope.seePermission = function(entity){
                var model = {
                    "USER_INFO_CODE":entity.USER_INFO_CODE,
                    "USERNAME":entity.USERNAME
                };
                userPermissionService.showDialog(model)
            };

            //确定
            $scope.confirm = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                $scope.model = [];

                angular.forEach(rows,function(obj){
                    $scope.model.push({
                        "USER_INFO_ID":obj.USER_INFO_ID,
                        "USERNAME":obj.USERNAME,
                        "USER_INFO_CODE":obj.USER_INFO_CODE,
                        "STAFF_NAME_CN":obj.u_staffinfo?obj.u_staffinfo.STAFF_NAME_CN:"",
                        "STAFF_CODE":obj.STAFF_CODE,
                        "u_userInfo":{
                            "USER_INFO_ID":obj.USER_INFO_ID,
                            "USER_INFO_CODE":obj.USER_INFO_CODE,
                            "u_staffinfo":obj.u_staffinfo
                        }
                    })
                });

                $modalInstance.close($scope.model);//返回数据
            };

            //模糊搜索
            $scope.search = function(){
                if($scope.searchCondition){
                    var condition = ["or",["like","u_user_info.USER_INFO_CODE",$scope.searchCondition],["like","u_user_info.USERNAME",$scope.searchCondition]];
                    $scope.searchWhere = {
                        "where":["and",["=","u_user_info.STAFF_STATE",1],condition],
                        "joinwith":["u_staffinfo"],
                    };
                }else{
                    $scope.searchWhere = null;
                }
                $scope.init();
            };
            //获取状态名称
            $scope.getStateName = function(value) {
                var docState=$scope.stateList.filter(c=>c.D_VALUE==value);
                if(docState.length){
                    return docState[0].D_NAME_CN;
                }
                return "";
            };

            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }
            //取消
            $scope.exit = function () {
                $modalInstance.dismiss(false);
            };
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

            //删除arr1中的出现在arr2的数据
            function removeDuplicate(arr1, arr2){
                var data = [];
                var index = 0;
                for (var i = 0 ; i <= arr1.length ; i ++ ){
                    var obj = arr1[i-index];
                    for(var j = 0 ; j < arr2.length ; j ++ ){
                        var orgItem = arr2[j];
                        if (obj.USER_INFO_CODE == orgItem.USER_INFO_CODE){
                            arr1.splice(i-index,1);
                            arr2.splice(j,1);
                            index++;
                            break;
                        }
                    }
                }
                return arr1;
            }

        })
    });


