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
            'account_edit',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal.open({
                        animation: true,
                        controller: "account_edit",
                        backdrop: "static",
                        size: "llg",//lg,sm,md,llg,ssm
                        templateUrl: 'app/masterCenter/account/views/account_edit.html?ver=' + _version_,
                        resolve: {
                            model: function () {
                                return model;
                            }
                        }
                    }).result;
                };
            }
        );
        angularAMD.controller("account_edit", function ($scope, amHttp, $confirm, model, $filter, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService, gridDefaultOptionsService, messageService, configService) {

            $scope.mdictionary = new Array();
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
                if (model) {
                    $scope.model = angular.copy(model);
                }
                //初始化品牌
                $scope.model.brand_list = {byone: 0, simpletaste: 0, beautrual: 0};
                if ($scope.model.SALES_BRAND_TYPE) {
                    ss = $scope.model.SALES_BRAND_TYPE.split(",");
                    angular.forEach(ss, function (obj) {
                        if (obj == 1) $scope.model.brand_list.byone = 1;
                        if (obj == 2) $scope.model.brand_list.simpletaste = 2;
                        if (obj == 3) $scope.model.brand_list.beautrual = 3;
                    });
                }

                //缓存字段
                $scope.model.stateList = commonService.getDicList("STATE");
                var effectiveList = commonService.getDicList("EFFECTIVE");
                $scope.model.rowEntity.fieldDataObjectMap['CREDIT_STATE'] = {"list": commonService.getDicList("ACCOUNT_CREDIT")};
                $scope.model.rowEntity.fieldDataObjectMap['COMPANY_INFO_STATE'] = {"list": effectiveList};
                $scope.model.rowEntity.fieldDataObjectMap['ADDRESS_STATE'] = {"list": effectiveList};
                $scope.model.rowEntity.fieldDataObjectMap['TP_STATE'] = {"list": effectiveList};

                //区域国家
                angular.forEach($scope.model.rowEntity.fieldDataObjectMap['AREA_ID'].list, function (obj, index) {
                    if (obj.AREA_ID == $scope.model.AREA_ID) {
                        $scope.model.countryList = obj.b_areas;
                    }
                });
                $scope.model.areaList = $scope.model.rowEntity.fieldDataObjectMap['AREA_ID'].list;

                //组织、平台
                return configService.getOrganisationList([4]).then(function (datas) {
                    angular.forEach(datas, function (obj, index) {
                        obj.name = obj.ORGANISATION_NAME_CN;
                        obj.value = obj.ORGANISATION_ID;
                        if (obj.ORGANISATION_ID == $scope.model.ORGANISATION_ID) {
                            $scope.model.channelList = obj.b_channel;
                        }
                    });
                    $scope.model.orgnizeList = datas;
                    $scope.model.rowEntity.fieldDataObjectMap['ORGANISATION_ID'] = {
                        "list": $scope.model.orgnizeList
                    }
                }).then(function () {
                    //销售产品中间表
                    var selectWhere = {"where": ["=", "ACCOUNT_ID", $scope.model.ACCOUNT_ID]};
                    return httpService.httpHelper(httpService.webApi.api, "master/basics/salespt", "index", "POST", selectWhere).then(function (result) {
                        if (result != null && result.status == 200) {
                            angular.forEach(result.data, function (obj, indexObj) {
                                $scope.mdictionary.push(obj.PRODUCT_TYPE_ID);
                            });
                        }
                    }).then(function () {
                        /*creditInit($scope.creditOptions.paginationCurrentPage,$scope.creditOptions.paginationPageSize);
                         companyInfoInit($scope.companyInfoOptions.paginationCurrentPage,$scope.companyInfoOptions.paginationPageSize);
                         addressInit($scope.addressOptions.paginationCurrentPage,$scope.addressOptions.paginationPageSize);
                         ipInit($scope.ipOptions.paginationCurrentPage,$scope.ipOptions.paginationPageSize);*/
                        return creditInit().then(function () {
                            return addressInit().then(function () {
                                return companyInfoInit().then(function () {
                                    return ipInit();
                                })
                            })
                        });
                    });
                });
            }

            //监听区域列表变更国家列表
            $scope.$watch('model.AREA_ID', function (n, o) {
                $scope.model.countryList = new Array();
                angular.forEach($scope.model.areaList, function (obj, index) {
                    if (obj.AREA_ID == n) {
                        $scope.model.countryList = obj.b_areas;
                    }
                });
            })

            //监听组织列表变更平台列表
            $scope.$watch('model.ORGANISATION_ID', function (n, o) {
                $scope.model.channelList = new Array();
                angular.forEach($scope.orgnizeList, function (obj, index) {
                    if (obj.ORGANISATION_ID == n) {
                        $scope.model.channelList = obj.b_channel;
                    }
                });
            });

            //取消操作
            $scope.cancel = function () {
                $modalInstance.dismiss(angular.copy($scope.model));
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

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "update?id=" + $scope.model.ACCOUNT_ID, "POST", modelTemp).then(function (datas) {
                        Notification.success(datas.message);
                        $modalInstance.close($scope.model);//返回数据
                    }
                );
            };

            function searchCreditCondition(pageSize) {
                var dataSearch = {
                    "where": ['and', ['=', 'ACCOUNT_ID', $scope.model.ACCOUNT_ID]],
                    "orderby": "CREDIT_STATE desc,UPDATED_AT desc",
                    "limit": (pageSize ? pageSize : $scope.creditOptions.paginationPageSize)
                };
                return dataSearch;
            }

            //信用卡绑定
            function creditInit(currentPage, pageSize) {
                //过滤条件
                var dataSearch = searchCreditCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "master/basics/accountcr", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    if (datas.data) {
                        datas._meta.totalCount * 1 && ($scope.creditOptions.totalItems = datas._meta.totalCount);
                        $scope.creditOptions.data = datas.data;
                        angular.forEach($scope.creditOptions.data, function (obj, index) {
                            //obj.VALID_UNTIL = $filter("date")(obj.VALID_UNTIL * 1000, "yyyy-MM-dd");
                            obj.VALID_UNTIL = new Date(obj.VALID_UNTIL * 1000);
                            obj.VALID_UNTIL = obj.VALID_UNTIL ? (obj.VALID_UNTIL.getFullYear() + '-' + (obj.VALID_UNTIL.getMonth() + 1)) : null;
                            obj.rowEntity = $scope.model.rowEntity;
                        });
                    }
                    if (!currentPage) {
                        $scope.creditOptions.paginationCurrentPage = 1;
                    }
                });
            }

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
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getCreditPage) {
                            getCreditPage(newPage, pageSize);
                        }
                    });
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

            //页码改变时触发方法
            function getCreditPage(currentPage, pageSize) {
                creditInit(currentPage, pageSize);
            }

            $scope.saveRowCredit = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiCredit.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };
            //新增方法
            $scope.creditAdd = function (item) {
                var newData = {
                    "ACCOUNT_ID": $scope.model.ACCOUNT_ID,
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
                    if (myArray.length <= 0) {
                        $scope.gridApiCredit.selection.clearSelectedRows();
                    }
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/accountcr", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiCredit.rowEdit.setRowsClean($scope.creditOptions.data);
                                $scope.gridApiCredit.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                creditInit();
                            }
                        );
                    });
                }
            };

            function searchCompanyInfoCondition(pageSize) {
                var dataSearch = {
                    "where": ['and', ['=', 'ACCOUNT_ID', $scope.model.ACCOUNT_ID]],
                    "orderby": "COMPANY_INFO_STATE desc,UPDATED_AT desc",
                    "limit": (pageSize ? pageSize : $scope.companyInfoOptions.paginationPageSize)
                };
                return dataSearch;
            }

            //公司资料
            function companyInfoInit(currentPage, pageSize) {

                //搜索条件
                var dataSearch = searchCompanyInfoCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "master/basics/accountci", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    if (datas.data) {
                        datas._meta.totalCount * 1 && ($scope.companyInfoOptions.totalItems = datas._meta.totalCount);
                        $scope.companyInfoOptions.data = datas.data;
                        angular.forEach($scope.companyInfoOptions.data, function (obj, index) {
                            obj.rowEntity = $scope.model.rowEntity;
                        });
                    }
                    if (!currentPage) {
                        $scope.companyInfoOptions.paginationCurrentPage = 1;
                    }
                });
            }

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
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getCompanyInfoPage) {
                            getCompanyInfoPage(newPage, pageSize);
                        }
                    });
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

            //页码改变时触发方法
            function getCompanyInfoPage(currentPage, pageSize) {
                companyInfoInit(currentPage, pageSize);
            }

            $scope.saveRowCompanyInfo = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiCompanyInfo.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };
            //新增方法
            $scope.companyInfoAdd = function (item) {
                var newData = {
                    "ACCOUNT_ID": $scope.model.ACCOUNT_ID,
                    "ORGANISATION_ID": "",
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
                    if (myArray.length <= 0) {
                        $scope.gridApiCompanyInfo.selection.clearSelectedRows();
                    }
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/accountci", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiCompanyInfo.rowEdit.setRowsClean($scope.companyInfoOptions.data);
                                $scope.gridApiCompanyInfo.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                companyInfoInit();
                            }
                        );
                    });
                }
            };

            function searchAddressCondition(pageSize) {
                var dataSearch = {
                    "where": ['and', ['=', 'ACCOUNT_ID', $scope.model.ACCOUNT_ID]],
                    "orderby": "ADDRESS_STATE desc,UPDATED_AT desc",
                    "limit": (pageSize ? pageSize : $scope.addressOptions.paginationPageSize)
                };

                return dataSearch;
            }

            //地址信息
            function addressInit(currentPage, pageSize) {

                //搜索条件
                var dataSearch = searchAddressCondition(pageSize);

                return httpService.httpHelper(httpService.webApi.api, "master/basics/accounta", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    if (datas.data) {
                        datas._meta.totalCount * 1 && ($scope.addressOptions.totalItems = datas._meta.totalCount);
                        $scope.addressOptions.data = datas.data;
                        angular.forEach($scope.addressOptions.data, function (obj, index) {
                            obj.rowEntity = $scope.model.rowEntity;
                        });
                    }
                    if (!currentPage) {
                        $scope.addressOptions.paginationCurrentPage = 1;
                    }
                });
            }

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
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getAddressPage) {
                            getAddressPage(newPage, pageSize);
                        }
                    });
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

            //页码改变时触发方法
            function getAddressPage(currentPage, pageSize) {
                addressInit(currentPage, pageSize);
            }

            $scope.saveRowAddress = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiAddress.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };
            //新增方法
            $scope.addressAdd = function (item) {
                var newData = {
                    "ACCOUNT_ID": $scope.model.ACCOUNT_ID,
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
                    if (myArray.length <= 0) {
                        $scope.gridApiAddress.selection.clearSelectedRows();
                    }
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/accounta", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiAddress.rowEdit.setRowsClean($scope.addressOptions.data);
                                $scope.gridApiAddress.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                addressInit();
                            }
                        );
                    });
                }
            };


            function searchIpCondition(pageSize) {
                var dataSearch = {
                    "where": ['and', ['=', 'ACCOUNT_ID', $scope.model.ACCOUNT_ID]],
                    "orderby": "TP_STATE desc,UPDATED_AT desc",
                    "limit": (pageSize ? pageSize : $scope.ipOptions.paginationPageSize)
                };
                return dataSearch;
            }

            //IP信息
            function ipInit(currentPage, pageSize) {

                //搜索条件
                var dataSearch = searchIpCondition(pageSize);
                return httpService.httpHelper(httpService.webApi.api, "master/basics/accountip", "index?page=" + (currentPage ? currentPage : 1), "POST", dataSearch).then(function (datas) {
                    if (datas.data) {
                        datas._meta.totalCount * 1 && ($scope.ipOptions.totalItems = datas._meta.totalCount);
                        $scope.ipOptions.data = datas.data;
                        angular.forEach($scope.ipOptions.data, function (obj, index) {
                            obj.rowEntity = $scope.model.rowEntity;
                        });
                    }
                    if (!currentPage) {
                        $scope.ipOptions.paginationCurrentPage = 1;
                    }
                });
            }

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
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getIpPage) {
                            getIpPage(newPage, pageSize);
                        }
                    });
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

            //页码改变时触发方法
            function getIpPage(currentPage, pageSize) {
                ipInit(currentPage, pageSize);
            }

            $scope.saveRowIp = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApiIp.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //新增方法
            $scope.ipAdd = function (item) {
                var newData = {
                    "ACCOUNT_ID": $scope.model.ACCOUNT_ID,
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
                    if (myArray.length <= 0) {
                        $scope.gridApiIp.selection.clearSelectedRows();
                    }
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/accountip", "delete", "POST", deleteRowModel).then(
                            function (datas) {
                                $scope.gridApiIp.rowEdit.setRowsClean($scope.ipOptions.data);
                                $scope.gridApiIp.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                ipInit();
                            }
                        );
                    });
                }
            }

            baseInit();
        });
    })
