define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/masterCenter/bchannel/controllers/partner_list_service",
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService',
    ],
    function (angularAMD) {
        angularAMD.service(
            'organisation_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "organisation_edit_Ctrl",
                            backdrop: "static",
                            size: "75%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/organisation/views/organisation_edit.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }

                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("organisation_edit_Ctrl", function ($scope, amHttp, $confirm, model, $filter, $timeout, messageService, gridDefaultOptionsService, $modalInstance, Notification, transervice, $q, $interval, httpService, partner_list_service) {
            $scope.groupGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                columnDefs: [
                    {field: 'GROUPING_NAME_CN', displayName: transervice.tran('分组名称')},
                    {field: 'GROUPING_REMARKS', displayName: transervice.tran('备注说明')}
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.groupGridOption);
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };
            if (model) {
                $scope.model = angular.copy(model);
                $scope.check = $scope.model.HEADER_STATE==1?true:false;
                $scope.model.PARTNER_NAME = $scope.model.pa_partner?$scope.model.pa_partner.PARTNER_CODE+"_"+$scope.model.pa_partner.PARTNER_ANAME_CN:"";
                $scope.model.isNotUsed = $scope.model.INIT_STATE==1?1:2;
                $scope.model.STARTUP_TIME =new Date($scope.model.STARTUP_TIME).getFullYear()+'-'+(new Date($scope.model.STARTUP_TIME).getMonth()+1);
                $scope.model.isShow = ($scope.model.ORGANISATION_ACCOUNTING!=null&&($scope.model.ORGANISATION_ACCOUNTING.indexOf(1)!=-1||$scope.model.ORGANISATION_ACCOUNTING.indexOf(3)!=-1))?false:true;
                if($scope.model.pa_partner){
                    $scope.model.PARTNER_NAME = $scope.model.pa_partner.PARTNER_CODE + "_" + $scope.model.pa_partner.PARTNER_ANAME_CN;
                }
                var areaList = [];
                var areaList = $scope.model.addressList.filter(d=> {
                    return d.AREA_ID == $scope.model.AREA_ID;
                });
                $scope.model.AREA_ID = areaList.length > 0 ? areaList[0].AREA_ID : null;
                $scope.model.addressList2 = areaList.length > 0 ? areaList[0].b_areas : [];
                var countryCode = [];
                if ($scope.model.addressList2.length > 0) {
                    countryCode = $scope.model.addressList2.filter(d=> {
                        return d.AREA_ID == $scope.model.COUNTRY_ID;
                    });
                }
                $scope.model.COUNTRY_ID = countryCode.length > 0 ? countryCode[0].AREA_ID : null;
                for (var i = 0; i < $scope.model.accOrgList.length; i++) {
                    var obj = $scope.model.accOrgList[i];
                    if ($scope.model.ORGANISATION_ACCOUNTING != null && $scope.model.ORGANISATION_ACCOUNTING.indexOf(obj.D_VALUE) != -1) {
                        obj.isChecked = true;
                    }
                }
                for (var i = 0; i < $scope.model.busOrgList.length; i++) {
                    var obj = $scope.model.busOrgList[i];
                    if ($scope.model.ORGANISATION_BUSINESS != null && $scope.model.ORGANISATION_BUSINESS.indexOf(obj.D_VALUE) != -1) {
                        obj.isChecked = true;
                    }
                }
                if ($scope.model.o_grouping != null) {
                    $scope.groupGridOption.data = $scope.model.o_grouping;
                    $scope.groupGridOption.totalItems = $scope.model.o_grouping.length;
                }
            }
            function init() {
                var selectWhere = {
                    "where": ["and",["<>", "ORGANISATION_STATE", 0],["or",["=", "ORGANISATION_ACCOUNTING", 1],["=", "ORGANISATION_ACCOUNTING", 3]]],
                    "limit": 0
                };
                return httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST", selectWhere).then(function (result) {
                    var legal = result.data.filter(d=>{return d.ORGANISATION_ACCOUNTING==1});
                    $scope.model.legalList = [{
                        "ORGANISATION_ID": "",
                        "ORGANISATION_NAME_CN": "请选择"
                    }].concat(legal);
                    var rootData = result.data.filter(d=>{return d.ORGANISATION_ACCOUNTING==3});
                    $scope.model.isRoot = rootData.length ? true : false;
                    $scope.model.orgRootId = rootData.length ? rootData[0].ORGANISATION_ID : "";
                    if($scope.model.isRoot&&$scope.model.orgRootId!=$scope.model.ORGANISATION_ID){
                        $scope.model.accOrgList.forEach(d=>{if(d.D_VALUE==3){d.isDisable=true}})
                    }

                });
            }
            init().then(function(){
                var selectWhere = {
                    "where": ["and",["<>", "ORGANISATION_STATE", 0],["=","ORGANISATIONOT_ID",$scope.model.ORGANISATION_ID],["<>","ORGANISATION_ID",$scope.model.ORGANISATION_ID]],
                    "limit": 0
                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST", selectWhere).then(function (result) {
                    if(result.data.length){
                        $scope.model.accOrgList.forEach(d=>{
                            if(d.D_VALUE!=1){
                                d.isDisable = true;
                            }
                        })
                    }
                })
            });

            //存储已选
            var result = $scope.model.ORGANISATION_ACCOUNTING ? $scope.model.ORGANISATION_ACCOUNTING.split(",") : [];
            var selectString = "";       //转换成的字符串存入数据库
            //触发事件
            $scope.accSelect = function (id, event) {
                var action = event.target;
                if (action.checked) {
                    $scope.model.accOrgList.forEach(d=>{
                        if(d.D_VALUE!=id){
                            d.isChecked = false;
                        }
                    })
                    selectString = id;
                    $scope.model.ORGANISATION_ACCOUNTING = selectString.length ? selectString : null;
                    $scope.model.isNotUsed = $scope.copyData.ORGANISATION_ACCOUNTING != $scope.model.ORGANISATION_ACCOUNTING ? 1 : 2;
                    $scope.model.isShow = ($scope.model.ORGANISATION_ACCOUNTING!=null&&($scope.model.ORGANISATION_ACCOUNTING.indexOf(1) != -1 || $scope.model.ORGANISATION_ACCOUNTING.indexOf(3) != -1) ) ? false : true;
                    if($scope.model.isShow) {
                        $scope.model.ORGANISATIONOT_ID = "";
                    }
                } else {                            //去除就删除result里
                    if(id==1){
                        var selectWhere = {
                            "where": ["and",["<>", "ORGANISATION_STATE", 0],["=","ORGANISATIONOT_ID",$scope.model.ORGANISATION_ID],["<>","ORGANISATION_ID",$scope.model.ORGANISATION_ID]],
                            "limit": 0
                        };
                        httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST", selectWhere).then(function (result) {
                            if(result.data.length){
                                action.checked = true;
                                $scope.model.accOrgList.forEach(d=>{
                                    if(d.D_VALUE!=id){
                                        d.isDisable = true;
                                    }
                                })
                                return Notification.error(transervice.tran(messageService.error_has_child));
                            }else{
                                selectString = id;
                            }
                            $scope.model.ORGANISATION_ACCOUNTING = selectString.length ? selectString : null;
                            $scope.model.isNotUsed = $scope.copyData.ORGANISATION_ACCOUNTING != $scope.model.ORGANISATION_ACCOUNTING ? 1 : 2;
                            $scope.model.isShow = ($scope.model.ORGANISATION_ACCOUNTING!=null&&($scope.model.ORGANISATION_ACCOUNTING.indexOf(1) != -1 || $scope.model.ORGANISATION_ACCOUNTING.indexOf(3) != -1) ) ? false : true;
                            if($scope.model.isShow) {
                                $scope.model.ORGANISATIONOT_ID = "";
                            }
                        })
                    }
                }
            };
            var result2 = $scope.model.ORGANISATION_BUSINESS ? $scope.model.ORGANISATION_BUSINESS.split(",") : [];
            var selectString2 = "";
            $scope.businessSelect = function (id, event) {
                $scope.model.isNotUsed = 1;
                var action = event.target;
                if (action.checked) {                 //选中，就添加
                    if (result2.indexOf(id) == -1) {   //不存在就添加
                        result2.push(id);
                    }
                } else {//去除就删除result里
                    var idx = result2.indexOf(id);
                    if (idx != -1) {//不存在就添加
                        result2.splice(idx, 1);
                    }
                }
                if (result2.length > 0) {
                    selectString2 = result2.join(",");
                    $scope.model.ORGANISATION_BUSINESS = selectString2;
                } else {
                    $scope.model.ORGANISATION_BUSINESS = null;
                }
                $scope.model.isNotUsed = $scope.copyData.ORGANISATION_BUSINESS != $scope.model.ORGANISATION_BUSINESS ? 1 : 2;
            }
            $scope.copyData = angular.copy($scope.model);

            //地区国家二级联动
            $scope.changeSelect = function (obj, AREA_ID) {
                $scope.model.COUNTRY_ID = "";
                $scope.model.isNotUsed = $scope.copyData[obj] != $scope.model[obj] ? 1 : 2;
                for (var i = 0; i < $scope.model.addressList.length; i++) {
                    var obj = $scope.model.addressList[i];
                    if (obj.AREA_ID == AREA_ID) {
                        $scope.model.addressList2 = [{"AREA_ID": "", "AREA_NAME_CN": "请选择"}].concat(obj.b_areas);
                        break;
                    }
                }
            };

            $scope.changPdf = function(event){
                var action = event.target;
                if(action.checked){
                    $scope.check = true;
                    $scope.model.HEADER_STATE=1;
                }else{
                    $scope.check = false;
                    $scope.model.HEADER_STATE=0;
                }
                $scope.model.isNotUsed = $scope.copyData['HEADER_STATE'] != $scope.model['HEADER_STATE'] ? 1 : 2;
            }

            //分组grid添加空行
            $scope.addGroup = function () {
                $scope.model.isNotUsed = 1;
                var newData = {
                    "GROUPING_NAME_CN": null
                };
                $scope.groupGridOption.data.unshift(newData);
            };
            //分组grid删除行
            $scope.moveGroup = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var delData = rows.filter(e=>e.GROUPING_ID);
                if (delData.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        delData.forEach(d=> {
                            delData.push({
                                "GROUPING_ID": d.GROUPING_ID
                            })
                        });
                        var postData = {batch: delData};
                        httpService.httpHelper(httpService.webApi.api, "organization/grouping", "delete", "POST", postData).then(function (datas) {
                            Notification.success(datas.message);
                            $scope.groupGridOption.data = $scope.groupGridOption.data.filter(a=>$.inArray(a, rows) == -1);
                            $scope.gridApi.selection.clearSelectedRows();
                        })
                    })
                } else {
                    $scope.groupGridOption.data = $scope.groupGridOption.data.filter(a=>$.inArray(a, rows) == -1);
                    $scope.gridApi.selection.clearSelectedRows();
                }

            };

            //修改启用状态为N
            $scope.changeState = function (value) {
                if (value == 0) {
                    var selectWhere = {
                        "where": ["=", "ORGANISATION_CODES", $scope.model.ORGANISATION_CODE]
                    };
                    httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", selectWhere).then(
                        function (result) {
                            if (result.data.length > 0) {
                                $confirm({text: transervice.tran(messageService.error_forbidden_all)}).then(null, function () {
                                    $scope.model.ORGANISATION_STATE = '1';
                                })
                            }
                        })
                }
            };

            //保存
            $scope.save = function () {
                if ($scope.model.ORGANISATION_ACCOUNTING == "2" && ($scope.model.ORGANISATIONOT_ID == null || $scope.model.ORGANISATIONOT_ID.length == 0)) {
                    return Notification.error(transervice.tran('请输入所属法人'));
                }
                if ($scope.model.ORGANISATION_CODE == null || $scope.model.ORGANISATION_CODE.length == 0) {
                    Notification.error(transervice.tran('请输入编码'));
                    return;
                }
                if ($scope.model.ORGANISATION_NAME_CN == null || $scope.model.ORGANISATION_NAME_CN.length == 0) {
                    Notification.error(transervice.tran('请输入名称'));
                    return;
                }
                if ($scope.model.ORGANISATION_FORM_ID == null || $scope.model.ORGANISATION_FORM_ID.length == 0) {
                    Notification.error(transervice.tran('请输入形态'));
                    return;
                }
                if ($scope.model.ORGANISATION_NAME_EN == null || $scope.model.ORGANISATION_NAME_EN.length == 0) {
                    Notification.error(transervice.tran('请输入报表名称'));
                    return;
                }
                if ($scope.model.AREA_ID == null || $scope.model.AREA_ID.length == 0) {
                    Notification.error(transervice.tran('请输入地区'));
                    return;
                }
                if ($scope.model.COUNTRY_ID == null || $scope.model.COUNTRY_ID.length == 0) {
                    Notification.error(transervice.tran('请输入国家'));
                    return;
                }
                var data = [];
                if ($scope.groupGridOption.data && $scope.groupGridOption.data.length > 0) {
                    $scope.groupGridOption.data.forEach(d=> {
                        if (d.GROUPING_NAME_CN && d.GROUPING_NAME_CN.length > 0) {
                            data.push(d);
                        }
                    });
                }
                if ($scope.model.PHONE && $scope.model.PHONE.length > 0) {
                    var re = /^[1-9]+[0-9]*]*$/;
                    if (!re.test($scope.model.PHONE)) {
                        Notification.error(transervice.tran('请输入有效联系电话！'));
                        return;
                    }
                }

                if ($scope.model.HEADER_STATE) {
                    $scope.model.HEADER_STATE = 1;
                } else {
                    $scope.model.HEADER_STATE = 0;
                }
                if ($scope.model.TARIFF != null && $scope.model.TARIFF.length > 0) {

                    var index = $scope.model.TARIFF.indexOf("%");
                    if (index != -1) {
                        var TARIFF = Number($scope.model.TARIFF.substr(0, $scope.model.TARIFF.length - 1)) / 100;
                    } else {
                        var TARIFF = Number($scope.model.TARIFF) / 100;
                    }
                }
                var newData = {
                    "ORGANISATION_ID": $scope.model.ORGANISATION_ID,
                    "ORGANISATION_CODE": $scope.model.ORGANISATION_CODE,
                    "ORGANISATION_NAME_CN": $scope.model.ORGANISATION_NAME_CN,
                    "CONTACT": $scope.model.CONTACT,
                    "PHONE": $scope.model.PHONE,
                    "ORGANISATION_FORM_ID": $scope.model.ORGANISATION_FORM_ID,
                    "FAX": $scope.model.FAX,
                    "ORGANISATION_NAME_EN": $scope.model.ORGANISATION_NAME_EN,
                    "HEADER_STATE": $scope.model.HEADER_STATE,
                    "AREA_ID": $scope.model.AREA_ID,
                    "COUNTRY_ID": $scope.model.COUNTRY_ID,
                    "TARIFF": TARIFF,
                    "ORGANISATION_STATE": $scope.model.ORGANISATION_STATE,
                    "ADDRESS": $scope.model.ADDRESS,
                    "ORGANISATION_REMARKS": $scope.model.ORGANISATION_REMARKS,
                    "ORGANISATION_BUSINESS": $scope.model.ORGANISATION_BUSINESS,
                    "ORGANISATION_ACCOUNTING": $scope.model.ORGANISATION_ACCOUNTING,
                    "ORGANISATIONOT_ID": $scope.model.ORGANISATIONOT_ID,
                    "PARTNER_ID": $scope.model.PARTNER_ID,
                    "INIT_STATE": $scope.model.INIT_STATE,
                    "o_grouping": data,
                    "edit_type": 1
                };
                $scope.model.edit_type = 1;
                $scope.model.CREATED_AT = $scope.formatDate($scope.model.CREATED_AT);
                return httpService.httpHelper(httpService.webApi.api, "organization/organisation", "update?id=" + $scope.model.ORGANISATION_ID, "POST", newData).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close($scope.model);//返回数据

                })
            };

            $scope.changeValue = function (obj, value) {
                $scope.model.isNotUsed = $scope.copyData[obj] != $scope.model[obj] ? 1 : 2;
            };

            //结束初始化
            $scope.endInit = function () {
                if ($scope.model.STARTUP_TIME == null || $scope.model.STARTUP_TIME.length == 0) {
                    return Notification.error(transervice.tran('请输入组织启用年月'));
                }
                var data = angular.copy($scope.model);
                if (data.TARIFF != null && data.TARIFF.length > 0) {

                    var index = data.TARIFF.indexOf("%");
                    if (index != -1) {
                        var TARIFF = Number(data.TARIFF.substr(0, data.TARIFF.length - 1)) / 100;
                    } else {
                        var TARIFF = Number(data.TARIFF) / 100;
                    }
                }
                data.TARIFF = TARIFF;
                data['STARTUP_TIME'] = data['STARTUP_TIME'] && $scope.formatDate(new Date(data['STARTUP_TIME'].replace(/-/g, "/")));
                data['INIT_STATE'] = 1;
                //data['TARIFF'] = 1;
                return httpService.httpHelper(httpService.webApi.api, "organization/organisation", "organisationendinit", "POST", data).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $modalInstance.close($scope.model);//返回数据
                })
            };

            //查询伙伴列表
            $scope.searchPartner = function () {
                var model = {multiSelect: null};
                partner_list_service.showDialog(model).then(function (data) {
                    $scope.model.PARTNER_ID = data ? data.PARTNER_ID : null;
                    $scope.model.PARTNER_NAME_CN = data ? data.PARTNER_NAME_CN : null;
                    $scope.model.PARTNER_NAME = data ? data.PARTNER_CODE + "_" + data.PARTNER_ANAME_CN : null;
                });
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close($scope.model);//返回数据
                //$modalInstance.dismiss(false);
            };
            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = Math.round((object) / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };
        });
    });
