define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/directives/selectOrganisationDirt'
    ],
    function (angularAMD) {
        angularAMD.service(
            'adjustmentEditService',
            function ($q, $modal) {
                this.showDialog = function (model, index, count, idList) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "adjustmentEditCtrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/inventoryCenter/adjustment/views/adjustment_edit.html',
                            resolve: {
                                model: function () {
                                    return model;
                                },
                                index: function () {
                                    return index;
                                },
                                count: function () {
                                    return count;
                                },
                                idList: function () {
                                    return idList;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("adjustmentEditCtrl", function ($scope, amHttp, $confirm, model, index, count, idList, $modalInstance, httpService, Notification, transervice, $http, $q, $interval, commonService, $filter, gridDefaultOptionsService, $timeout, messageService) {
            $scope.index = index;
            $scope.count = count;
            $scope.idList = idList;
            $scope.rowEntity = {};

            $scope.ROOT_PLAN_STATE = 0;

            //初始化单据类型下拉框
            $scope.model = model;
            $scope.options = {
                filter: "contains",
                autoBind: true,
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_CODE",
                optionLabel: "请输入SKU",
                url: httpService.webApi.api + "/master/product/prodsku/index",
                search: {
                    where: ["and", ["=", "g_product_sku.PSKU_STATE", 1], ["=", "g_product_sku.ORGAN_ID_DEMAND", model.PRGANISATION_ID]],
                    joinWith: ["b_unit", "g_product_sku_price"]
                }
            };

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'TDSKU_CODE', displayName: transervice.tran('SKU'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.TDSKU_CODE}}</div>',
                        editableCellTemplate: '<div><form><div single-select options="row.entity.options" select-model="row.entity.PDSKU_CODE" change="grid.appScope.selectRowChange(row)" row="row"></div></form></div>',
                        cellEditableCondition: function () {
                            return $scope.ROOT_PLAN_STATE != 2;
                        }

                    },
                    {field: 'PSKU_NAME_CN', displayName: transervice.tran('产品名称'), enableCellEdit: false,},

                    {
                        field: 'UNIT_ID',
                        displayName: transervice.tran('单位'),
                        enableCellEdit: true,
                        cellClass: 'text-right',
                        cellTemplate: '<span>{{grid.appScope.getUnitName(row.entity.UNIT_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'UNIT_ID',
                        editDropdownValueLabel: 'UNIT_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.unitList",
                        cellEditableCondition: function () {
                            return $scope.ROOT_PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'TDNUMBER',
                        enableCellEdit: true,
                        displayName: transervice.tran('数量'),
                        cellClass: 'text-right',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="0" max="999999999" min="-999999" ui-grid-editor ng-model="row.entity.TDNUMBER" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>',
                        cellEditableCondition: function () {
                            return $scope.ROOT_PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'MONEY_ID',
                        displayName: transervice.tran('币种'),
                        enableCellEdit: true,
                        cellClass: 'text-right',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellTemplate: '<span>{{grid.appScope.getMoneyName(row.entity.MONEY_ID)}}</span>',
                        editDropdownIdLabel: 'MONEY_ID',
                        editDropdownValueLabel: 'MONEY_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.moneylist",
                        cellEditableCondition: function () {
                            return $scope.ROOT_PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'UNIT_PRICE',
                        displayName: transervice.tran('单价'),
                        enableCellEdit: true,
                        cellClass: 'text-right',
                        cellTemplate: '<div class="ui-grid-cell-contents" >{{row.entity.UNIT_PRICE|number:2}}</div>',
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="9999999" min="0" ui-grid-editor ng-model="row.entity.UNIT_PRICE" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>',
                        cellEditableCondition: function () {
                            return $scope.ROOT_PLAN_STATE != 2;
                        }
                    },
                    {
                        field: 'TDMONEY',
                        displayName: transervice.tran('金额'),
                        cellClass: 'text-right',
                        cellTemplate: '<div class="ui-grid-cell-contents" >{{row.entity.TDMONEY|number:2}}</div>',
                        enableCellEdit: false
                    },
//                  { field: 'WAREHOUSE_CODE', displayName: transervice.tran('调整仓库'),
//                      cellTemplate:'<span>{{grid.appScope.getWarehouseName(row.entity.WAREHOUSE_CODE)}}</span>',
//                      editableCellTemplate: '<div><form><input type="number" max="9999999" min="0" ui-grid-editor ng-model="row.entity.UNIT_PRICE" ng-change="grid.appScope.changeTotalmoney(row)"></form></div>',
//                      cellEditableCondition: function () {
//                          return $scope.ROOT_PLAN_STATE != 2;
//                      }
//                  },
                    {
                        field: 'TDAREHOUSE_ID', displayName: transervice.tran('调整仓库'),
                        cellTemplate: '<span>{{grid.appScope.getWarehouseName(row.entity.TDAREHOUSE_ID)}}</span>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WAREHOUSE_CODE',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.warehouseList",
                        cellEditableCondition: function () {
                            return $scope.ROOT_PLAN_STATE != 2;
                        }
                    }

                ],
                enablePagination: false, //是否分页，默认为true
                enablePaginationControls: false, //使用默认的底部分页
                useExternalPagination: false//是否使用分页按钮

            };

            //翻页触发方法
            $scope.gridOptions.getPage = function (pageNo, pageSize) {

            }

            //初始化组织,仓库
            var p = $q.defer(), _obj = {};
            $scope.orgoptions = {
                types: [4],
                getList: function (data) {
                    $scope.model.org = data;
                    p.resolve();
                }
            }
            //初始化转对象
            function toObject(list, code, n) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i][code] == n) {
                        return list[i];
                    }
                }
            };

            //首单
            $scope.firstPage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery(0).then(function () {
                    $scope.index = 0;
                    $scope.nextBtnDisabled = false;
                });
            };

            //上一单
            $scope.prePage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.index - 1).then(function () {
                    $scope.index -= 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //下一单
            $scope.nextPage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.index + 1).then(function () {
                    $scope.index += 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //尾单
            $scope.lastPage = function () {
                $scope.nextBtnDisabled = true;
                turnPageQuery($scope.count - 1).then(function () {
                    $scope.index = $scope.count - 1;
                    $scope.nextBtnDisabled = false;
                });
            };

            //翻单查询
            function turnPageQuery(offset) {


                var dataSearch = {
                    "where": ['and', ['=', 'DELETED_STATE', 0]],
                    "joinWith": ["o_organisation", "b_warehouse", "u_user_info"],
                    "orderby": "sk_adjustment.PLAN_STATE asc,sk_adjustment.CREATED_AT desc",
                    //"offset": offset,
                    "distinct": true
                };
                return httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "view?id=" + $scope.idList[offset], "POST", dataSearch).then(function (result) {
                    $scope.copyModel = $.extend(true, {}, $scope.model, result.data);
                    $scope.model = angular.copy($scope.copyModel);
                    init();
                });
            }

            //获取api
            $scope.gridOptions.getGridApi = function (api) {
                $scope.gridApi = api;
            }

            //勾选某一行
            $scope.gridOptions.selectRow = function (row) {

            }

            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);

            //新增明细
            $scope.addDetail = function () {
                var newData = {
                    //"SALES_ORDER": "",
                    "TDSKU_CODE": "",
                    "PSKU_ID": "",
                    "TDRODUCT_DE": "",
                    "UNIT_ID": "",
                    "TDNUMBER": "",
                    "UNIT_PRICE": "",
                    "TDMONEY": "",
                    "TDAREHOUSE_ID": $scope.AWAREHOUSE_ID,
                    rowEntity: $scope.rowEntity,
                    options: angular.copy($scope.options),
                    "UNIT_NAME": "",
                    "PSKU_NAME_CN": "",
                };
                newData.options.search.where.push(["=", "g_product_sku.ORGAN_ID_DEMAND", $scope.model.PRGANISATION_ID]);
                $scope.gridOptions.data.unshift(newData);
                gridDefaultOptionsService.refresh($scope.gridOptions, "PSKU_CODE");//刷新方法
//              var datas = $scope.gridOptions.data;
//              $scope.gridOptions.data = [];
//              setTimeout(function () {
//                  datas.forEach(a=> {
//                      a.options.value = a.ATSKU_CODE;
//                      if (a.PSKU_ID) {
//                          a.options.search.andwhere = ["=", "g_product_sku.PSKU_ID", a.PSKU_ID];
//                      } else {
//                          a.options.search.andwhere = ["=", "g_product_sku.PSKU_ID", "0"];
//                      }
//                  });
//                  $scope.gridOptions.data = datas;
//                  $scope.$apply();
//              }, 10);
            };

            //行删除
            $scope.delDetail = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择需要操作的数据'));
                }
                var exitsTemp = 0;
                angular.forEach($scope.gridOptions.data, function (obj, objIndex) {
                    if (obj["STORAGE_DETAIL_ID"] && obj["STORAGE_DETAIL_ID"] > 0) {
                        exitsTemp++;
                    }
                });
                var myArray = new Array();
                var myArrayNot = new Array();
                angular.forEach(rows, function (obj, objIndex) {
                    if (obj["ADJUSTMENT_DETAIL_ID"] && obj["ADJUSTMENT_DETAIL_ID"] > 0) {
                        myArray.push(obj);
                    } else {
                        myArrayNot.push(obj);
                    }
                });
                if (myArrayNot.length > 0) {
                    angular.forEach(myArrayNot, function (obj, objIndex) {
                        angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                            if (obj.$$hashKey == obj1.$$hashKey) {
                                $scope.gridOptions.data.splice(objIndex1, 1);
                            }
                        });
                    });
                    $scope.gridApi.rowEdit.setRowsClean(myArrayNot);
                    if (myArray.length <= 0) {
                        $scope.gridApi.selection.clearSelectedRows();
                    }
                    if ($scope.gridOptions.data <= 0) {
                        $scope.model.needPurchase = 0;
                    }
                }
                if (myArray.length > 0) {
                    if (exitsTemp > myArray.length) {
                        $confirm({text: transervice.tran(messageService.confirm_del)}).then(function () {
                            var deleteRowModel = {
                                "batch": myArray
                            };
                            httpService.httpHelper(httpService.webApi.api, "inventory/adjustdetail", "delete", "POST", deleteRowModel).then(function (datas) {
                                $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                                $scope.gridApi.selection.clearSelectedRows();
                                Notification.success(datas.message);
                                getskuDetail();
                            });
                        });
                    } else {
                        return Notification.error(transervice.tran("明细必须保存一条实际存在的数据"));
                    }
                }
            }

            //页面元素显示初始化
            function baseInfoInit() {
                $scope.model.isLink = $scope.model.isLink ? $scope.model.isLink : 1;//显示翻单按钮
                //页面元素显示初始化
                if ($scope.model.PLAN_STATE == 2) {
                    $scope.PLAN_STATE = "已审核";
                    $scope.showAuth = false;
                    if ($scope.model.SYSTEM_GENERATION == 1) {
                        $scope.showResetAuth = false;
                    } else {
                        $scope.showResetAuth = true;
                    }
                    $scope.showSave = false;
                    $scope.isdisable = true;
                } else {
                    $scope.PLAN_STATE = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                    $scope.isdisable = false;
                }

                $scope.ROOT_PLAN_STATE = $scope.model.PLAN_STATE;
                $scope.copyPlanState = $scope.model.PLAN_STATE;
                $scope.CUSER_NAME = $scope.model.u_user_info == null ? "" : $scope.model.u_user_info.u_staff_info.STAFF_NAME_CN;
                $scope.CREATED_AT = $filter("date")(new Date(parseInt($scope.model.CREATED_AT) * 1000), "yyyy-MM-dd");


                //调整原因
                $scope.reasonList = [{"value": '1', "name": "定期盘点"}, {"value": '2', "name": "运输遗失"}, {
                    "value": '3',
                    "name": "海关抽检"
                }, {'value': '4', 'name': '入库差异调整'}];

                $scope.ADJUSTMENT_AT = $scope.model.ADJUSTMENT_AT * 1 ? $filter("date")(new Date(parseInt($scope.model.ADJUSTMENT_AT) * 1000), "yyyy-MM-dd") : $scope.model.ADJUSTMENT_AT;
                $scope.ADJUSTMENT_REASON = $scope.model.ADJUSTMENT_REASON;
                $scope.AWAREHOUSE_ID = $scope.model.AWAREHOUSE_ID;
                $scope.model.ORDER_TYPE = parseInt($scope.model.ORDER_TYPE);
                $scope.model.PRGANISATION_ID = $scope.model.PRGANISATION_ID;
            };

            //基本信息和金额信息初始化
            init();

            //初始化
            function init() {
                $scope.warehouseList = new Array();
                $scope.organisation_list = new Array();
                //页面元素显示初始化
                baseInfoInit();

                var selectWhere = {'limit': 0};
                //初始化组织
                //initOrg();

                //初始化单位
                initUnitlist();
                //初始化币种
                initMoneyList();

                //$scope.PRGANISATION_CODE = $scope.model.PRGANISATION_CODE;

                //初始化出库仓库列表
//              httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(
//                  function (datas) {
//                		$scope.copyModel&&($scope.model = angular.copy($scope.copyModel));
//                      $scope.warehouseTotalList = datas.data;
//                      angular.forEach($scope.gridOptions.data, function (object, index) {
//                          object.rowEntity = $scope.rowEntity;
//                      });
//                      angular.forEach(datas.data, function (obj, index) {
//                          //初始化出库仓库列表
//                          if (obj.ORGANIZE_CODE == $scope.model.PRGANISATION_CODE  && (obj.WAREHOUSE_TYPE_ID == 1 || obj.WAREHOUSE_TYPE_ID == 2 || obj.WAREHOUSE_TYPE_ID == 5 || obj.WAREHOUSE_TYPE_ID == 8)) {
//                              $scope.warehouseList.push(obj);
//                          }
//                          //获取完仓库列表后绑定初始值
//                          $scope.model.PWAREHOUSE_CODE = $scope.model.PWAREHOUSE_CODE;
//                      });
//                      $scope.rowEntity.warehouseList = $scope.warehouseList;
//                      
//                  }
//              );
                p.promise.then(function () {
                    $scope.PRGANISATION_ID = $scope.model.PRGANISATION_ID
                    _obj = toObject($scope.model.org, 'ORGANISATION_ID', $scope.PRGANISATION_ID);
                    $scope.warehouseList = $scope.rowEntity.warehouseList = _obj.user_warehouse;
                    //初始化明细
                    getskuDetail();

                });
            }

            //初始化明细获取
            function getskuDetail() {
                var dataSearch = {
                    "where": ["=", "ADJUSTMENT_ID", $scope.model.ADJUSTMENT_ID],
                    "joinWith": ["b_unit", "g_product_sku"]
                }
                httpService.httpHelper(httpService.webApi.api, "/inventory/adjustdetail", "index", "POST", dataSearch).then(
                    function (result) {
                        $scope.gridOptions.totalItems = result.data.length;
                        $scope.gridOptions.data = result.data;
                        angular.forEach($scope.gridOptions.data, function (object, index) {
                            if (object.b_unit) {
                                object.UNIT_NAME_CN = object.b_unit.UNIT_NAME_CN;
                            }
                            if (object.g_product_sku) {
                                object.PSKU_NAME_CN = object.g_product_sku.PSKU_NAME_CN;
                            }
                            object.options = angular.copy($scope.options);
                            object.options.value = object.TDSKU_CODE;
                            object.options.search.andwhere = ["=", "g_product_sku.PSKU_CODE", object.TDSKU_CODE];
                            object.MONEY_ID = object.MONEY_ID;
                            //warehouseList:[],moneylist:[]
                            httpService.waitData(function () {
                                if ($scope.rowEntity.warehouseList && $scope.rowEntity.moneylist && $scope.rowEntity.unitList) {
                                    return true;
                                }
                                return false;
                            }, function () {
                                object.rowEntity = angular.copy($scope.rowEntity);
                            });
                            object.MONEY_ID = object.MONEY_ID;
                        });
                    }
                );
            }


            //初始化组织列表
            function initOrg() {
                angular.forEach($scope.model.organisation_list, function (obj, index) {
                    $scope.organisation_list.push({
                        'ORGANISATION_ID': obj.ORGANISATION_ID,
                        'ORGANISATION_NAME_CN': obj.o_organisationt.ORGANISATION_NAME_CN
                    });

                });
            }

            //初始化货币列表
            function initMoneyList() {
                var selectWhere = {limit: 0};

                //初始化出库仓库列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.rowEntity.moneylist = result.data;
                    }
                );
            }

            //获取币种名称
            $scope.getMoneyName = function (moneyId) {
                if (moneyId) {
                    var warehouse = $scope.rowEntity.moneylist.filter(c=>c.MONEY_ID == moneyId);
                    if (warehouse.length) {
                        return warehouse[0].MONEY_NAME_CN;
                    }
                }
            }

            //获取单位名称
            $scope.getUnitName = function (unit_id) {
                if (unit_id) {
                    var unit = $scope.rowEntity.unitList.filter(c=>c.UNIT_ID == unit_id);
                    if ($scope.rowEntity.unitList.length) {
                        return unit[0].UNIT_NAME_CN;
                    }
                }
            }

            //初始化单位表
            function initUnitlist() {
                var selectWhere = {'where': ['=', 'UNIT_STATE', 1], limit: 0};

                //初始化出库仓库列表
                httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.rowEntity.unitList = result.data;
                    }
                );
            }

            //SKU行选择
            $scope.selectRowChange = function (row) {  //选择
                var price = row.selectModel.g_product_sku_price;
                row.entity.UNIT_PRICE = 0.00;
                row.entity.UNIT_NAME = row.selectModel.b_unit.UNIT_NAME_CN;
                row.entity.UNIT_ID = row.selectModel.b_unit.UNIT_ID;

                row.entity.PSKU_NAME_CN = row.selectModel.PSKU_NAME_CN;
                row.entity.TDSKU_CODE = row.selectModel.PSKU_CODE;
                row.entity.PSKU_ID = row.selectModel.PSKU_ID;
                row.entity.TDNUMBER = 0;
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE * row.entity.TDNUMBER).toFixed(2);
                $scope.gridOptions.gridApi.grid.refresh();
            };

            //更改数量
            $scope.changeTotalmoney = function (row) {
                row.entity.TDMONEY = parseFloat(row.entity.UNIT_PRICE * row.entity.TDNUMBER).toFixed(2);
            };

            //取消操作
            $scope.cancel = function () {
                $modalInstance.close();
            };

            //组织列表选择change事件
            $scope.ochange = function (PRGANISATION_ID, entity) {
                if (PRGANISATION_ID) {
                    $scope.model.PRGANISATION_ID = PRGANISATION_ID;
                    $scope.warehouseList = new Array();
                    angular.forEach($scope.warehouseTotalList, function (obj, index) {
                        if (obj.ORGANISATION_ID == PRGANISATION_ID) {
                            $scope.warehouseList.push(obj);
                        }
                    });

                    $scope.sdkCondtion.where = ["and", ["=", "g_product_sku.PSKU_STATE", 1], ['or', ['=', 'g_product_sku.ORGAN_ID_DEMAND', PRGANISATION_ID], ['=', 'g_product_sku.ORGAN_ID_PURCHASE', PRGANISATION_ID]]];

                }
            };

            //获取调整仓库名称
            $scope.getWarehouseName = function (warehouseID) {
                if (warehouseID) {
                    var warehouse = $scope.warehouseList.filter(c=>c.WAREHOUSE_ID == warehouseID);
                    if (warehouse.length) {
                        return warehouse[0].WAREHOUSE_NAME_CN;
                    }
                }
                return "";
            }

            //保存操作
            $scope.save = function () {
                //校验信息
                checkInfo();

                if ($scope.msg.length > 0) {
                    return Notification.error(transervice.tran($scope.msg));
                }
                //组装数据
                getInfo();
                //保存更新数据
                saveinfo(false);
            };

            //校验信息
            function checkInfo() {
                $scope.msg = "";
                if ($scope.model.PLAN_STATE == 2) {
                    $scope.msg = "已审核单据不能修改";
                    return;
                }
                if (!$scope.model) {
                    $scope.msg = "请选择组织";
                    return;
                }
                if (!$scope.PRGANISATION_ID) {
                    $scope.msg = "请选择组织";
                    return;
                } else if (!$scope.ADJUSTMENT_REASON) {
                    $scope.msg = "请选择调整理由";
                    return;
                } else if (!$scope.AWAREHOUSE_ID) {
                    $scope.msg = "请选择调整仓库";
                    return;
                }

                angular.forEach($scope.gridOptions.data, function (obj, index) {
                    if (!obj.TDSKU_CODE) {
                        $scope.msg = '请选择SKU';
                        return;
                    }
                    if (!obj.MONEY_ID) {
                        $scope.msg = '请选择币种';
                        return;
                    }
                });
            }

            //组装数据
            function getInfo() {
                //组装数据
                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                $scope.model.ADJUSTMENT_AT = Math.round(formatDate / 1000);
                var formatDate2 = new Date($scope.CREATED_AT.replace(/-/g, '/')).getTime();

                $scope.model.CREATED_AT = Math.round(formatDate2 / 1000);
                $scope.model.AWAREHOUSE_ID = $scope.model.AWAREHOUSE_ID;
                $scope.model.PRGANISATION_ID = $scope.PRGANISATION_ID;

                if ($scope.model.ADJUSTMENT_ID > 0) {
                    $scope.model.ADJUSTMENT_ID = $scope.model.ADJUSTMENT_ID;
                    angular.forEach($scope.gridOptions.data, function (row, index) {
                        row['ADJUSTMENT_ID'] = $scope.model.ADJUSTMENT_ID;
                    });
                }

                //明细
                $scope.model.sk_adjustment_detail = $scope.gridOptions.data;
                //清除不需要更新的信息
                delete $scope.model.b_warehouse;
                delete $scope.model.o_organisation;
            }

            //保存更新数据
            function saveinfo(is_not_tip) {

                if ($scope.model.ADJUSTMENT_ID == 0) {
                    var action = "create";
                    $scope.model.PLAN_STATE = 1;
                    $scope.copyPlanState = 1;
                } else {
                    var action = "update?id=" + $scope.model.ADJUSTMENT_ID;
                }
                //检测明细是否有数据
                if ($scope.model.sk_adjustment_detail.length == 0) {
                    return Notification.error(transervice.tran('请添加调整明细'));
                }

                if ($scope.gridOptions.data.length == 0) {
                    return Notification.error(transervice.tran('请添加调整明细'));
                    return;
                }
                delete $scope.model.authFlag;

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", action, "POST", $scope.model).then(
                    function (result) {
                        if (is_not_tip == false) {
                            Notification.success(transervice.tran(result.message));
                            $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                        }
                    }
                );
            }


            //审核
            $scope.authSkplace = function () {

                $confirm({text: transervice.tran(messageService.confirm_audit)}).then(function () {
                    checkAuth(2, 1);
                })

            };

            //反审核
            $scope.resetAuthSkplace = function () {
                //校验确认审核
                checkAuth(1, 2);
            }

            //校验确认审核
            function checkAuth(planState, authFlag) {
                getInfo();
                saveinfo(true);


                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                var flag = false;
                $scope.gridOptions.data.forEach(function (obj) {
                    obj.TDNUMBER < 0 && (flag = true);
                })
                $scope.model.ADJUSTMENT_AT = Math.round(formatDate / 1000);


                var sku_arr = new Object();

                angular.forEach($scope.gridOptions.data, function (obj1, objIndex1) {
                    var sku = new Object();
                    sku['PSKU_ID'] = obj1.PSKU_ID;
                    sku['PSKU_CODE'] = obj1.TDSKU_CODE;
                    sku['NUMBER'] = obj1.TDNUMBER;
                    sku['WAREHOUSE_ID'] = obj1.TDAREHOUSE_ID;
                    sku_arr[objIndex1] = sku;
                });

                //检查及时库存是否够

                httpService.httpHelper(httpService.webApi.api, "inventory/placing", "checkskuinventory", "POST", sku_arr).then(function (datas) {
                    if (datas.data.flag == false) {
                        $confirm({text: transervice.tran('选择的' + datas.data.sku + '库存不足，是否继续操作？')}).then(function () {
                            //更新单据状态
                            updateSkState(planState, authFlag);
                            $scope.ROOT_PLAN_STATE = planState;
                        });
                    } else {
                        //更新单据状态
                        updateSkState(planState, authFlag);
                        $scope.ROOT_PLAN_STATE = planState;
                    }
                });
            }

            //更新库存调整单状态
            function updateSkState(planState, authFlag) {
                var resultArr = new Array();
                //获取当前登陆人信息
                var USERINFO = localStorage.getItem('USERINFO');
                USERINFO = angular.fromJson(USERINFO);

                getInfo();

                var formatDate = new Date($scope.ADJUSTMENT_AT.replace(/-/g, '/')).getTime();
                $scope.model.AUTITO_AT = Math.round(formatDate / 1000);
                $scope.model.AUTITO_ID = USERINFO.USER_INFO_ID;
                $scope.model.PLAN_STATE = planState;
                $scope.model.authFlag = authFlag;

                resultArr.push($scope.model);

                var dataSearch = {
                    "batchMTC": resultArr
                };

                httpService.httpHelper(httpService.webApi.api, "inventory/adjustment", "update", "POST", dataSearch).then(function (datas) {
                    $scope.copyPlanState = planState;
                    $scope.model.PLAN_STATE == 2 && ($scope.isdisable = true);
                    $scope.model.PLAN_STATE == 1 && ($scope.isdisable = false);
                    Notification.success(transervice.tran(datas.message));
                    $scope.gridApi.rowEdit.setRowsClean($scope.gridOptions.data);
                    afterAuth(authFlag);
                })
            }

            //审核和反审核后的处理
            function afterAuth(authFlag) {
                if (authFlag == 2) {
                    $scope.PLAN_STATE = "未审核";
                    $scope.showAuth = true;
                    $scope.showResetAuth = false;
                    $scope.showSave = true;
                } else if (authFlag == 1) {
                    $scope.PLAN_STATE = "已审核";
                    $scope.showAuth = false;
                    $scope.showResetAuth = true;
                    $scope.showSave = false;
                }
            }
        });
    })
