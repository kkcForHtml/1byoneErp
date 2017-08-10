/**
 * Created by Administrator on 2017/4/27.
 */
define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    "app/masterCenter/bchannel/controllers/partner_list_service",
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/messageService',
    'app/common/Services/configService'
], function () {
    return ['$scope', '$confirm', 'commonService', '$timeout', 'Notification', 'httpService', '$filter', 'amHttp','messageService','configService', 'transervice', 'uiGridConstants', '$q', '$interval', 'partner_list_service', 'gridDefaultOptionsService',
        function ($scope, $confirm, commonService, $timeout, Notification, httpService, $filter, amHttp,messageService,configService, transervice, uiGridConstants, $q, $interval, partner_list_service, gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'CHANNEL_CODE', width: 120, displayName: transervice.tran('*平台编码'),
                        cellEditableCondition: function($scope){
                            return $scope.col.grid.options.data[$scope.rowRenderIndex].CHANNEL_ID == null;
                        }
                    },
                    {field: 'CHANNEL_NAME_CN', width: 120, displayName: transervice.tran('*平台名称')},
                    {field: 'CHANNEL_ABBREVIATION', width: 120, displayName: transervice.tran('符号(或简称)')},
                    {
                        field: 'PLATFORM_TYPE_ID',
                        width: 120,
                        displayName: transervice.tran('*平台分类'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.PLATFORM_TYPE_ID.list"
                    },
                    {
                        field: 'ORGANISATION_ID',
                        width: 120,
                        displayName: transervice.tran('*所属组织'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.ORGANISATION_ID.list"
                    },
                    {
                        field: 'PARTNER_ID',
                        name: 'PARTNER_ID',
                        width: 180,
                        enableCellEdit: false,
                        displayName: transervice.tran('*业务伙伴'),
                        cellTemplate: '<div type="button" class="ui-grid-cell-contents ng-binding ng-scope" ng-click="grid.appScope.searchPartner(row.entity)" style="width:100%;">{{row.entity.PARTNER_NAME_CN}}</div>'
                    },
                    {field: 'TAX_COST_COEFFICIENT', width: 120, displayName: transervice.tran('税率成本系数')},
                    {field: 'LAND_CARRIAGE_PRICE', width: 120, displayName: transervice.tran('陆运价格(RMB/KG)')},
                    {field: 'IMPORT_VAT_TAXRATE', width: 120, displayName: transervice.tran('进口VAT税率')},
                    {
                        field: 'FBA_FREIGHT',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('当地至FBA运费(RMB/KG)')
                    },
                    {
                        field: 'IMPORT_TARIFF_RATE',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('进口分类税率')
                    },
                    {
                        field: 'SHIPPING_PRICE_TO',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('龙舟海运价格2(RMB/M3)')
                    },
                    {
                        field: 'SHIPPING_PRICE',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('龙舟海运价格(RMB/M3)')
                    },
                    {
                        field: 'AMAZON_COMMISSION',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('亚马逊Commission')
                    },
                    {
                        field: 'AIR_FREIGHT_PRICE',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('空运价格(RMB/KG)')
                    },
                    {
                        field: 'EXPRESS_PRICE',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('快递价格(RMB/KG)')
                    },
                    {
                        field: 'SEABORNE_PRICE',
                        width: 120,
                        displayType: 'numeric',
                        displayName: transervice.tran('海运价格(RMB/M3)')
                    },
                    {
                        field: 'CHANNEL_STATE',
                        width: 120,
                        displayName: transervice.tran('是否启用'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.CHANNEL_STATE.list"
                    },
                    {field: 'CHANNEL_REMARKS', width: 120, displayName: transervice.tran('备注')}
                ],
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示

                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            //查询库存职能树实体组织&&用户分配组织
            function getOrgOfStorage() {
                configService.getOrganisationList([4]).then(function (datas) {
                    $scope.orgList = [];
                    datas&&datas.forEach(d=> {
                        $scope.orgList.push({
                            "value": d.ORGANISATION_ID,
                            "name": d.ORGANISATION_NAME_CN
                        });
                    });
                    $scope.init();
                })

            };
            getOrgOfStorage();

            $scope.channelList = commonService.getDicList("CHANNEL");
            $scope.stateList = commonService.getDicList("STATE");
            $scope.init = function (currentPage, pageSize) {
                $scope.rowEntity = {
                    "fieldDataObjectMap": {
                        "PLATFORM_TYPE_ID": {
                            "list": $scope.channelList
                        },
                        "ORGANISATION_ID": {
                            "list": $scope.orgList
                        },
                        "CHANNEL_STATE": {
                            "list": $scope.stateList
                        }
                    }
                };
                var searchData = {};
                if ($scope.selectWhere != null) {
                    searchData.where = $scope.selectWhere;
                };
                searchData.orderby = "b_channel.CHANNEL_STATE desc,b_channel.UPDATED_AT desc";
                searchData.joinwith = ["pa_partner","o_organisation"];
                searchData.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchData.distinct = true;
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index?page=" + (currentPage ? currentPage : 1), "POST", searchData).then(function (result) {
                    if (result != null && result.status == 200) {
                        result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                        $scope.gridOptions.data = result.data;
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            object.options = $scope.options;
                            object.rowEntity = $scope.rowEntity;
                            if (object.pa_partner != null) {
                                object.PARTNER_ID = object.pa_partner.PARTNER_ID;
                                object.PARTNER_NAME_CN = object.pa_partner.PARTNER_NAME_CN;
                            }
                            object.copyObject = angular.copy(object);
                        });
                        var data = $scope.gridOptions.data;
                        if (!currentPage) {
                            $scope.gridOptions.paginationCurrentPage = 1;
                        }
                    } else {
                        Notification.error({message: result.message, delay: 5000});
                    }
                });
            };

            // $scope.init();

            //编辑新增方法
            $scope.add = function () {
                var newData = {
                    "CHANNEL_ID":null,
                    "CHANNEL_CODE": null,
                    "CHANNEL_NAME_CN": null,
                    "PLATFORM_TYPE_ID": null,
                    "CHANNEL_ABBREVIATION": null,
                    "CHANNEL_STATE": "1",
                    "rowEntity": $scope.rowEntity
                };
                $scope.gridOptions.data.unshift(newData);
            };

            $scope.save = function () {
                var filedList = [];
                $scope.gridOptions.columnDefs.forEach(d=>{
                    if(d.field){
                        filedList.push(d.field);
                    }
                });
                var entitys = getDirtyRows($scope.gridOptions.data,filedList,"CHANNEL_ID");
                if(entitys.length<=0){
                    return Notification.error(transervice.tran(messageService.error_choose_n));
                }
                var data = angular.copy(entitys);
                var updataDate = new Array();
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];
                    if (obj.CHANNEL_CODE == null || obj.CHANNEL_CODE.length == 0) {
                        return Notification.error(transervice.tran("请输入平台编码"));
                    }
                    if (obj.CHANNEL_NAME_CN == null || obj.CHANNEL_NAME_CN.length == 0) {
                        return Notification.error(transervice.tran("请输入平台名称"));
                    }
                    if (obj.PLATFORM_TYPE_ID == null || obj.PLATFORM_TYPE_ID.length == 0) {
                        return Notification.error(transervice.tran("请输入平台分类"));
                    }
                    if (obj.ORGANISATION_ID == null || obj.ORGANISATION_ID.length == 0) {
                        return Notification.error(transervice.tran("请输入所属组织"));
                    }
                    if (obj.PARTNER_ID == null || obj.PARTNER_ID.lenght == 0) {
                        return Notification.error(transervice.tran("请输入业务伙伴"));
                    }
                    delete obj["copyObject"];
                    delete obj["pa_partner"];
                    delete obj["rowEntity"];
                    updataDate.push(obj);
                };
                var updateRowModel = {"batchMTC": updataDate};
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "update", "POST", updateRowModel).then(function (result) {
                    Notification.success(transervice.tran(result.message));
                    $scope.gridOptions.paginationCurrentPage = 1;
                    $scope.init();
                });
            };
            //删除数据
            $scope.del = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                var myArray = new Array();
                var myArrayNot = new Array();
                for (var i = 0; i < rows.length; i++) {
                    if(rows[i]["CHANNEL_ID"] && rows[i]["CHANNEL_ID"]>0){
                        myArray[i] = rows[i];
                    }else{
                        myArrayNot[i] = rows[i];
                    }
                }
                if (myArrayNot.length > 0) {
                    for (var i = 0; i < myArrayNot.length; i++) {
                        for (var j = 0; j < dataRow.length; j++) {
                            if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                $scope.gridOptions.data.splice(j, 1);
                                break;
                            }
                        }
                    }
                    $scope.gridApi.rowEdit.setRowsClean(myArrayNot);
                }
                if (myArray.length > 0) {
                    return $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "delete", "POST", deleteRowModel).then(
                            function (result) {
                                $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                                $scope.gridApi.selection.clearSelectedRows();
                                $scope.gridOptions.paginationCurrentPage = 1;
                                Notification.success(transervice.tran(result.message));
                                $scope.init();
                            });
                    })
                }
            };

            //获取修改过的实体
            function getDirtyRows(datas,fileds,idtext) {
                if(!datas){
                    return;
                }
                var result=[];
                datas.forEach(d=>{
                    if(!d[idtext]){
                        result.push(d);
                    }else{
                        var flag=getEqualResult(d,fileds);
                        if(!flag){
                            result.push(d);
                        }
                    }
                })
                return result;
                function getEqualResult(data,fields) {
                    var copyData=data.copyObject;
                    for(var i=0;i<fields.length;i++){
                        var f=fields[i];
                        if(copyData[f]!=data[f]){
                                return false;
                        }

                    }
                    return true;
                }
            }

            //查询伙伴列表
            $scope.searchPartner = function (rowEntity) {
                var newData = angular.copy(rowEntity);
                var model = {multiSelect :null};
                partner_list_service.showDialog(model).then(function (data) {
                    newData.PARTNER_ID = data.PARTNER_ID;
                    newData.PARTNER_NAME_CN = data.PARTNER_NAME_CN;
                    angular.copy(newData, rowEntity);
                    $scope.gridApi.grid.refresh();
                });
            };

            $scope.search = function () {
                var data = ["or", ["like", "b_channel.CHANNEL_CODE", $scope.searchCondtion], ["like", "b_channel.CHANNEL_NAME_CN", $scope.searchCondtion]];
                if($scope.searchCondtion){
                    $scope.selectWhere = data;
                }else{
                    $scope.selectWhere = null;
                }
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            };
            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }
        }]
});

