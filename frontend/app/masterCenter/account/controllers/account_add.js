define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService',
        'app/common/Services/configService'
    ],
    function (angularAMD) {
        angularAMD.service(
            'account_add',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "account_add",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/account/views/account_add.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("account_add", function ($scope, amHttp, $confirm, model, $filter, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService, gridDefaultOptionsService, messageService, configService) {

            $scope.productType = {
                transport: {
                    read: {
                        type: "POST",
                        url: httpService.webApi.api + "/master/product/prodskut/index",
                        dataType: "json"
                    },
                    parameterMap: function (options, operation) {
                        //用户列表的显示，包括查询
                        var search = {"where": ["and", ["=", "PRODUCT_TYPE_STATE", 1], ["=", "PRODUCTOT_TYPE_ID", 0]]};
                        if (options.filter && options.filter.filters) {
                            search = commonService.getFilter(search, options.filter.filters, options.filter.logic);
                        }
                        return search;
                    }
                },
                schema: {
                    data: function (d) {
                        var list = new Array();
                        angular.forEach(d.data, function (obj) {
                            list.push({"D_NAME_CN": obj.SYSTEM_NAME_CN, "D_VALUE": obj.PRODUCT_TYPE_ID});
                        });
                        return list; //响应到页面的数据
                    }
                },
                error: httpService.kendoErr,
                serverFiltering: false,
            };

            $scope.mdicOptions = {
                valuePrimitive: true,
                autoBind: false,
                dataSource: $scope.productType,
                dataTextField: "D_NAME_CN",
                dataValueField: "D_VALUE",
                placeholder: transervice.tran('请选择')
            };

            //初始化基础数据
            function baseInit() {
                //初始化下拉框
                $scope.model = {
                    ACCOUNT_ID: "",
                    ACCOUNT: "",
                    CHANNEL_ID: "",
                    MERCHANTID: "",
                    AREA_ID: "",
                    COUNTRY_ID: "",
                    ORGANISATION_ID: "",
                    ACCOUNT_REMARKS: "",
                    SALES_BRAND_TYPE: "",
                    ACCOUNT_STATE: "1",
                    MwsMP: "",
                    MwsAKey: "",
                    MwsSKey: "",
                    MURL: "",
                    rowEntity: {"fieldDataObjectMap": {}}
                }
                var effectiveList = commonService.getDicList("EFFECTIVE");
                $scope.model.rowEntity = {
                    "fieldDataObjectMap": {
                        "CREDIT_STATE": {
                            "list": commonService.getDicList("ACCOUNT_CREDIT")
                        },
                        "COMPANY_INFO_STATE": {
                            "list": effectiveList
                        },
                        "ADDRESS_STATE": {
                            "list": effectiveList
                        },
                        "TP_STATE": {
                            "list": effectiveList
                        }
                    }
                }
                $scope.mdictionary = new Array();
                $scope.model.stateList = commonService.getDicList("STATE");
                $scope.model.brand_list = {byone: 0, simpletaste: 0, beautrual: 0};
                $scope.model.ORGANISATION_ID = "";
                $scope.model.CHANNEL_ID = "";
                $scope.model.AREA_ID = "";
                $scope.model.COUNTRY_ID = "";
                //初始地区列表
                var selectWhere = {
                    "where": ["and", ["=", "b_area.AREA_STATE", 1], ["=", "b_area.AREA_FID", "0"]],
                    "joinwith": ["b_areas"]
                };
                return httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST", selectWhere).then(function (result) {
                    $scope.model.areaList = [{"AREA_ID": "", "AREA_NAME_CN": "请选择"}].concat(result.data);
                }).then(function () {
                    //组织、平台
                    return configService.getOrganisationList([4]).then(function (datas) {
                        angular.forEach(datas, function (obj, index) {
                            obj.name = obj.ORGANISATION_NAME_CN;
                            obj.value = obj.ORGANISATION_ID;
                        });
                        $scope.model.orgnizeList = [{
                            "ORGANISATION_ID": "",
                            "ORGANISATION_NAME_CN": "请选择"
                        }].concat(datas);
                        $scope.model.rowEntity.fieldDataObjectMap['ORGANISATION_ID'] = {
                            "list": $scope.model.orgnizeList
                        }
                    }).then(function () {
                        $scope.model.countryList = [{"AREA_ID": "", "AREA_NAME_CN": "请选择"}];
                        $scope.model.channelList = [{"CHANNEL_ID": "", "CHANNEL_NAME_CN": "请选择"}];
                        $scope.creditOptions.data = [];
                        $scope.addressOptions.data = [];
                        $scope.companyInfoOptions.data = [];
                        $scope.ipOptions.data = [];
                    });
                });
            }

            //组织列表变更平台列表
            $scope.changeOrgSelect = function (value) {
                $scope.model.CHANNEL_ID = "";
                if (!value) {
                    $scope.model.channelList = [{"CHANNEL_ID": "", "CHANNEL_NAME_CN": "请选择"}];
                }
                angular.forEach($scope.model.orgnizeList, function (obj, index) {
                    if (obj.ORGANISATION_ID == value && obj.ORGANISATION_ID != "") {
                        $scope.model.channelList = [{
                            "CHANNEL_ID": "",
                            "CHANNEL_NAME_CN": "请选择"
                        }].concat(obj.b_channel);
                    }
                });
            };

            //区域列表变更国家列表
            $scope.changeRegionSelect = function (value) {
                $scope.model.COUNTRY_ID = "";
                if (!value) {
                    $scope.model.countryList = [{"AREA_ID": "", "AREA_NAME_CN": "请选择"}];
                }
                angular.forEach($scope.model.areaList, function (obj, index) {
                    if (obj.AREA_ID == value && obj.AREA_ID != "") {
                        $scope.model.countryList = [{"AREA_ID": "", "AREA_NAME_CN": "请选择"}].concat(obj.b_areas);
                    }
                });
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (object) {
                    if (angular.isDate(object)) {
                        object = Math.round((object).valueOf() / 1000);
                    } else {
                        object = new Date(object.replace(/-/g, '/')).getTime();
                        object = Math.round((object).valueOf() / 1000);
                    }
                    return object;
                } else {
                    return '';
                }
            };

            function checkBrand() {
                //销售品牌转字符串
                var brand_array = [];
                if ($scope.model.brand_list.byone == 1)  brand_array.push(1);
                if ($scope.model.brand_list.simpletaste == 2)  brand_array.push(2);
                if ($scope.model.brand_list.beautrual == 3) brand_array.push(3);
                $scope.model.SALES_BRAND_TYPE = brand_array.toString();
                //销售产品中间表
                $scope.model.b_sales_product_type = [];
                var salesProductType = $scope.mdictionary;
                if (salesProductType.length > 0) {
                    var salesProductTypeArray = new Array();
                    angular.forEach(salesProductType, function (obj, indexObj) {
                        salesProductTypeArray.push({"ACCOUNT_ID": $scope.model.ACCOUNT_ID, "PRODUCT_TYPE_ID": obj});
                    });
                    $scope.model.b_sales_product_type = salesProductTypeArray;
                }
            }

            function checkData() {
                //效验数据
                if ($scope.model.ACCOUNT == null || $scope.model.ACCOUNT == "" || $scope.model.ACCOUNT == undefined) {
                    return '基本信息-账号为必填';
                }
                if ($scope.model.MERCHANTID == null || $scope.model.MERCHANTID == "" || $scope.model.MERCHANTID == undefined) {
                    return '基本信息-MerchantID为必填';
                }
                if ($scope.model.ORGANISATION_ID == null || $scope.model.ORGANISATION_ID == "" || $scope.model.ORGANISATION_ID == undefined) {
                    return '基本信息-所属组织为必填';
                }
                if ($scope.model.CHANNEL_ID == null || $scope.model.CHANNEL_ID == "" || $scope.model.CHANNEL_ID == undefined) {
                    return '基本信息-所属平台为必填';
                }
                if ($scope.model.AREA_ID == null || $scope.model.AREA_ID == "" || $scope.model.AREA_ID == undefined) {
                    return '基本信息-地区为必填';
                }
                if ($scope.model.COUNTRY_ID == null || $scope.model.COUNTRY_ID == "" || $scope.model.COUNTRY_ID == undefined) {
                    return '基本信息-国家为必填';
                }
                if ($scope.model.MwsMP == null || $scope.model.MwsMP == "" || $scope.model.MwsMP == undefined) {
                    return '接口信息-MwsMarketPlaceld为必填';
                }
                if ($scope.model.MwsAKey == null || $scope.model.MwsAKey == "" || $scope.model.MwsAKey == undefined) {
                    return '接口信息-MwsAccessKey为必填';
                }
                if ($scope.model.MwsSKey == null || $scope.model.MwsSKey == "" || $scope.model.MwsSKey == undefined) {
                    return '接口信息-MwsSecretKey为必填';
                }
                if ($scope.model.MURL == null || $scope.model.MURL == "" || $scope.model.MURL == undefined) {
                    return '接口信息-URL为必填';
                }
                return "";
            }

            function getCreditData() {
                var msg = "";
                $scope.model.b_account_credit = [];
                angular.forEach($scope.creditOptions.data, function (obj, indexObj) {
                    var entityData = angular.copy(obj);
                    entityData.VALID_UNTIL = $scope.formatDate(entityData.VALID_UNTIL);
                    if (entityData.CREDIT_NUMBER == null || entityData.CREDIT_NUMBER == "" || entityData.CREDIT_NUMBER == undefined) {
                        msg = "绑定信用卡-卡号为必填！";
                    }
                    if (entityData.VALID_UNTIL == null || entityData.VALID_UNTIL == "" || entityData.VALID_UNTIL == undefined) {
                        msg = "绑定信用卡-有效日期为必填！";
                    }
                    $scope.model.b_account_credit.push(entityData);
                });
                return msg;
            }

            function getCompanyInfoData() {
                var msg = "";
                $scope.model.b_account_company_info = [];
                angular.forEach($scope.companyInfoOptions.data, function (obj, indexObj) {
                    if (obj.COMPANY_INFO_NAME == null || obj.COMPANY_INFO_NAME == "" || obj.COMPANY_INFO_NAME == undefined) {
                        msg = "公司资料-公司名称为必填！";
                    }
                    $scope.model.b_account_company_info.push(obj);
                });
                return msg;
            }

            function getAddressData() {
                var msg = "";
                $scope.model.b_account_address = [];
                angular.forEach($scope.addressOptions.data, function (obj, indexObj) {
                    if (obj.ADDRESS == null || obj.ADDRESS == "" || obj.ADDRESS == undefined) {
                        msg = "地址信息-地址为必填！";
                    }
                    $scope.model.b_account_address.push(obj);
                });
                return msg;
            }

            function getIpData() {
                var msg = "";
                $scope.model.b_account_ip = [];
                angular.forEach($scope.ipOptions.data, function (obj, indexObj) {
                    if (obj.TP == null || obj.TP == "" || obj.TP == undefined) {
                        msg = "IP信息-IP为必填！";
                    }
                    $scope.model.b_account_ip.push(obj);
                });
                return msg;
            }

            function delData(object) {
                delete object['areaList'];
                delete object['brand_list'];
                delete object['channelList'];
                delete object['countryList'];
                delete object['orgnizeList'];
                delete object['rowEntity'];
                delete object['stateList'];
                angular.forEach(object.b_account_company_info, function (obj, index) {
                    delete obj['rowEntity'];
                });
                angular.forEach(object.b_account_address, function (obj, index) {
                    delete obj['rowEntity'];
                });
                angular.forEach(object.b_account_credit, function (obj, index) {
                    delete obj['copyModel'];
                    delete obj['rowEntity'];
                });
                angular.forEach(object.b_account_ip, function (obj, index) {
                    delete obj['rowEntity'];
                });
            }

            //保存操作
            $scope.save = function () {

                //效验数据
                var errorMsg = checkData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }

                //处理脏值
                errorMsg = getCreditData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                errorMsg = getCompanyInfoData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                errorMsg = getAddressData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }
                errorMsg = getIpData();
                if (errorMsg != "") {
                    return Notification.error(transervice.tran(errorMsg));
                }

                //转销售产品和销售品牌
                checkBrand();
                //删除多余字段
                var modelTemp = angular.copy($scope.model);
                delData(modelTemp);

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "create", "POST", modelTemp).then(function (result) {
                    Notification.success(result.message);
                    $modalInstance.close($scope.model);//返回数据
                });
            };

            $scope.creditOptions = {
                columnDefs: [
                    {
                        field: 'CREDIT_TYPE',
                        displayName: transervice.tran('卡类型'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="30"   ui-grid-editor ng-model="row.entity.CREDIT_TYPE"></form></div>',
                    }, {
                        field: 'CREDIT_NUMBER',
                        displayName: transervice.tran('*卡号'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="60"   ui-grid-editor ng-model="row.entity.CREDIT_NUMBER"></form></div>',
                    }, {
                        field: 'VALID_UNTIL',
                        displayName: transervice.tran('*有效期至'),
                        cellFilter: "dirtyFilter:row:col",
                        editableCellTemplate: '<div  id="f{{grid.appScope.creditOptions.data.indexOf(row.entity)}}{{grid.appScope.creditOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM\'" depth="\'year\'" start="\'year\'" ng-model="row.entity.VALID_UNTIL"></div>',
                    }, {
                        field: 'HOUSEHOLDER',
                        displayName: transervice.tran('户主'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="30"   ui-grid-editor ng-model="row.entity.HOUSEHOLDER"></form></div>',
                    }, {
                        field: 'CREDIT_STATE',
                        displayName: transervice.tran('状态'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.CREDIT_STATE.list"
                    }, {
                        field: 'CREDIT_REMARKS',
                        displayName: transervice.tran('备注'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.CREDIT_REMARKS"></form></div>',
                    },
                ],

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiCredit = gridApi;
                    $scope.creditOptions.gridApi = gridApi;
                    //行选中事件
                    $scope.gridApiCredit.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowCredit);
                }
            }
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.creditOptions);

            $scope.saveRowCredit = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiCredit.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //编辑新增方法
            $scope.creditAdd = function (item) {
                var newData = {
                    "CREDIT_TYPE": "",
                    "CREDIT_NUMBER": "",
                    "VALID_UNTIL": "",
                    "HOUSEHOLDER": "",
                    "CREDIT_STATE": "1",
                    "CREDIT_REMARKS": "",
                    "rowEntity": $scope.model.rowEntity,
                };
                $scope.creditOptions.data.unshift(newData);
            }

            //删除数据
            $scope.creditDel = function () {
                var dataRow = $scope.creditOptions.data;
                var rows = $scope.gridApiCredit.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["CREDIT_ID"] && rows[i]["CREDIT_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.creditOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiCredit.rowEdit.setRowsClean(myArrayNot);
                    $scope.gridApiCredit.selection.clearSelectedRows();
                }
            }

            //公司信息
            $scope.companyInfoOptions = {
                columnDefs: [
                    {
                        field: 'ORGANISATION_ID',
                        displayName: transervice.tran('组织'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ORGANISATION_ID.list"
                    }, {
                        field: 'COMPANY_INFO_NAME',
                        displayName: transervice.tran('*公司名称'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="100"   ui-grid-editor ng-model="row.entity.COMPANY_INFO_NAME"></form></div>',
                    }, {
                        field: 'COMPANY_INFO_ADDRESS',
                        displayName: transervice.tran('公司地址'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.COMPANY_INFO_ADDRESS"></form></div>',
                    }, {
                        field: 'COMPANY_INFO_PHONE',
                        displayName: transervice.tran('电话'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="20"   ui-grid-editor ng-model="row.entity.COMPANY_INFO_PHONE"></form></div>',
                    }, {
                        field: 'REGIST_CERTIFICATE',
                        displayName: transervice.tran('税号'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="50"   ui-grid-editor ng-model="row.entity.REGIST_CERTIFICATE"></form></div>',
                    }, {
                        field: 'COLLECTION_BANK',
                        displayName: transervice.tran('回款银行信息'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="50"   ui-grid-editor ng-model="row.entity.COLLECTION_BANK"></form></div>',
                    }, {
                        field: 'COMPANY_INFO_STATE',
                        displayName: transervice.tran('状态'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.COMPANY_INFO_STATE.list"
                    }, {
                        field: 'COMPANY_INFO_REMARKS',
                        displayName: transervice.tran('备注'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.COMPANY_INFO_REMARKS"></form></div>',
                    },
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiCompanyInfo = gridApi;

                    //行选中事件
                    $scope.gridApiCompanyInfo.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowCompanyInfo);
                }
            }

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.companyInfoOptions);

            $scope.saveRowCompanyInfo = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiCompanyInfo.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //编辑新增方法
            $scope.companyInfoAdd = function (item) {
                var newData = {
                    "ORGANISATION_ID": $scope.model.ORGANISATION_ID,
                    "COMPANY_INFO_NAME": "",
                    "COMPANY_INFO_ADDRESS": "",
                    "COMPANY_INFO_PHONE": "",
                    "REGIST_CERTIFICATE": "",
                    "COLLECTION_BANK": "",
                    "COMPANY_INFO_STATE": "1",
                    "COMPANY_INFO_REMARKS": "",
                    "rowEntity": $scope.model.rowEntity,
                };
                $scope.companyInfoOptions.data.unshift(newData);
            }
            //删除数据
            $scope.companyInfoDel = function () {
                var dataRow = $scope.companyInfoOptions.data;
                var rows = $scope.gridApiCompanyInfo.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["COMPANY_INFO_ID"] && rows[i]["COMPANY_INFO_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.companyInfoOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiCompanyInfo.rowEdit.setRowsClean(myArrayNot);
                    $scope.gridApiCompanyInfo.selection.clearSelectedRows();
                }
            }

            //地址
            $scope.addressOptions = {
                columnDefs: [
                    {
                        field: 'ADDRESS',
                        displayName: transervice.tran('*地址'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.ADDRESS"></form></div>',
                    }, {
                        field: 'TELEPHONE',
                        displayName: transervice.tran('电话'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="20"   ui-grid-editor ng-model="row.entity.TELEPHONE"></form></div>',
                    }, {
                        field: 'PURPOSE',
                        displayName: transervice.tran('用途'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="50"   ui-grid-editor ng-model="row.entity.PURPOSE"></form></div>',
                    }, {
                        field: 'ADDRESS_STATE',
                        displayName: transervice.tran('状态'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ADDRESS_STATE.list"
                    }, {
                        field: 'ADDRESS_REMARKS',
                        displayName: transervice.tran('备注'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.ADDRESS_REMARKS"></form></div>',
                    },
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiAddress = gridApi;

                    //行选中事件
                    $scope.gridApiAddress.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowAddress);
                }
            }
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.addressOptions);

            $scope.saveRowAddress = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiAddress.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //编辑新增方法
            $scope.addressAdd = function (item) {
                var newData = {
                    "ADDRESS": "",
                    "TELEPHONE": "",
                    "PURPOSE": "",
                    "ADDRESS_STATE": "1",
                    "ADDRESS_REMARKS": "",
                    "rowEntity": $scope.model.rowEntity,
                };
                $scope.addressOptions.data.unshift(newData);
            }

            //删除数据
            $scope.addressDel = function () {
                var dataRow = $scope.addressOptions.data;
                var rows = $scope.gridApiAddress.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["ADDRESS_ID"] && rows[i]["ADDRESS_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.addressOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiAddress.rowEdit.setRowsClean(myArrayNot);
                    $scope.gridApiAddress.selection.clearSelectedRows();
                }
            }

            //IP
            $scope.ipOptions = {
                columnDefs: [
                    {
                        field: 'TP',
                        displayName: transervice.tran('*IP'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="20"   ui-grid-editor ng-model="row.entity.TP"></form></div>',
                    }, {
                        field: 'TP_STATE',
                        displayName: transervice.tran('状态'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.TP_STATE.list"
                    }, {
                        field: 'IP_REMARKS',
                        displayName: transervice.tran('备注'),
                        editableCellTemplate: '<div><form><input type="text" maxlength="250"   ui-grid-editor ng-model="row.entity.IP_REMARKS"></form></div>',
                    },
                ],
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApiIp = gridApi;

                    //行选中事件
                    $scope.gridApiIp.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });

                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRowIp);
                }
            }
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.ipOptions);

            $scope.saveRowIp = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiIp.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //编辑新增方法
            $scope.ipAdd = function (item) {
                var newData = {
                    "TP": "",
                    "TP_STATE": "1",
                    "IP_REMARKS": "",
                    "rowEntity": $scope.model.rowEntity,
                };
                $scope.ipOptions.data.unshift(newData);
            }

            //删除数据
            $scope.ipDel = function () {
                var dataRow = $scope.ipOptions.data;
                var rows = $scope.gridApiIp.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]["IP_ID"] && rows[i]["IP_ID"] > 0) {
                        myArray[i] = rows[i];
                    } else {
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.ipOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApiIp.rowEdit.setRowsClean(myArrayNot);
                    $scope.gridApiIp.selection.clearSelectedRows();
                }
            }

            baseInit();
        });
    })
