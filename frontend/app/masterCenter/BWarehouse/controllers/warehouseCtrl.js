define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/masterCenter/bwarehouse/controllers/warehouse_edit_service",
    "app/masterCenter/bwarehouse/controllers/warehouse_add_service",
    'app/masterCenter/product/controllers/productSKU_add_service',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/configService',
    'app/common/Services/messageService',
], function () {
    return ['$scope', '$confirm', 'Notification','commonService', 'httpService','amHttp', 'transervice','messageService', 'configService','uiGridConstants','warehouse_edit_service','warehouse_add_service','gridDefaultOptionsService',
        function ($scope, $confirm, Notification,commonService,httpService, amHttp, transervice,messageService,configService, uiGridConstants,warehouse_edit_service,warehouse_add_service,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'WAREHOUSE_CODE',enableCellEdit: false, displayName: transervice.tran('仓库编码'),
                        cellTemplate: '<a class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{row.entity.WAREHOUSE_CODE}}</a>'},
                    { field: 'WAREHOUSE_NAME_CN',enableCellEdit: false, displayName: transervice.tran('仓库名称')},
                    { field: 'ORGANISATION_ID',enableCellEdit: false, displayName: transervice.tran('所属组织'),
                        cellTemplate: '<div class="ui-grid-cell-contents ">{{row.entity.organisation.ORGANISATION_NAME_CN}}</div>'},
                    { field: 'CHANNEL_ID',enableCellEdit: false, displayName: transervice.tran('平台'),
                        cellTemplate: '<div class="ui-grid-cell-contents ">{{row.entity.allBchannel.CHANNEL_NAME_CN}}</div>'},
                    { field: 'WAREHOUSE_TYPE_NAME',enableCellEdit: false, displayName: transervice.tran('仓库分类')},
                    { field: 'WAREHOUSE_ADDRESSA',enableCellEdit: false, displayName: transervice.tran('仓库地址') },
                    { field: 'SPACE_INVENTORY',enableCellEdit: false, displayName: transervice.tran('空间库容'),cellClass:"text-right",
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.SPACE_INVENTORY}}</div>'
                    },
                    { field: 'INVENTORY_PROP',enableCellEdit: false,displayName: transervice.tran('货物库容占比'),
                        cellTemplate: '<div class="ui-grid-cell-contents text-right">{{row.entity.INVENTORY_PROP}}%</div>'
                    },
                    { field: 'WAREHOUSE_STATE_NAME',enableCellEdit: false, displayName: transervice.tran('是否启用') }
                ],
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
           //查询库存组织&&查询地区
            function searchArea() {
                configService.getOrganisationList([4]).then(function (datas) {
                    var res_list = new Array();
                    res_list.push({
                        "ORGANISATION_ID":"",
                        "ORGANISATION_NAME_CN":"请选择",
                        "b_channel":[{"CHANNEL_ID":"","CHANNEL_NAME_CN":"请选择"}]
                    });
                    $scope.orgList = [];
                    datas&&datas.forEach(d=> {
                        res_list.push({
                            'ORGANISATION_ID':d.ORGANISATION_ID,
                            'ORGANISATION_NAME_CN':d.ORGANISATION_NAME_CN,
                            'b_channel':d.b_channel
                        })
                    });
                    $scope.orgList = res_list;
                    $scope.addressList =[];
                    var selectWhere = {
                        "joinwith":["b_areas"],
                        "distinct" :true
                    };
                    httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST",selectWhere).then(function (result) {
                        for(var i=0;i<result.data.length;i++){
                            var countryArry = result.data[i].b_areas;
                            if(countryArry.length>0){
                                for(var j=0;j<countryArry.length;j++){
                                    var data = {
                                        "AREA_ID":countryArry[j].AREA_ID,
                                        "AREA_IDS":result.data[i].AREA_ID,
                                        "ADDRESS_NAME":result.data[i].AREA_NAME_CN+" "+countryArry[j].AREA_NAME_CN
                                    }
                                    $scope.addressList.push(data);
                                }
                            }
                        }
                        $scope.init();
                    });
                })
            }
            searchArea();
            $scope.channelList = [{"CHANNEL_ID":"","CHANNEL_NAME_CN":"请选择"}];
            //组织平台二级联动
            $scope.changeSelect = function (value) {
                if(value.length==0){
                    $scope.CHANNEL_ID = "";
                }
                for (var i = 0; i < $scope.orgList.length; i++) {
                    var obj = $scope.orgList[i];
                    if (obj.ORGANISATION_ID == value) {
                        $scope.channelList = [{"CHANNEL_ID":"","CHANNEL_NAME_CN":"请选择"}].concat(obj.b_channel);
                        $scope.CHANNEL_ID = "";
                        break;
                    }
                }
            };
            $scope.warehouseList = [];
            $scope.warehouseList.push({
                "D_VALUE":"",
                "D_NAME_CN":"请选择"
            });
            $scope.warehouseList = $scope.warehouseList.concat(commonService.getDicList("WAREHOUSE"));
            $scope.stateList = commonService.getDicList("STATE");
            $scope.WAREHOUSE_TYPE_ID = "";
            $scope.ORGANISATION_ID = "";
            $scope.CHANNEL_ID = "";
            $scope.init = function(currentPage, pageSize){

                var searchData ={};
                if($scope.searchWhere!=null){
                    searchData = $scope.searchWhere;
                }
                searchData.joinwith = ["organisation","allBchannel","b_area"];
                searchData.orderby = "b_warehouse.WAREHOUSE_STATE desc,b_warehouse.UPDATED_AT desc";
                searchData.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                searchData.distinct = true;

                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index?page=" + (currentPage ? currentPage : 1), "POST",searchData).then(
                    function (result){
                        result._meta.totalCount*1&&($scope.gridOptions.totalItems = result._meta.totalCount);
                            $scope.gridOptions.data = result.data;
                            angular.forEach($scope.gridOptions.data,function(object,index){
                                object.WAREHOUSE_TYPE_NAME = $scope.getplanTypeName(object.WAREHOUSE_TYPE_ID);
                                object.warehouseList = $scope.warehouseList;
                                object.WAREHOUSE_ADDRESSA = object.b_area? (object.b_area.AREA_NAME_CN+" "+(object.WAREHOUSE_ADDRESS?object.WAREHOUSE_ADDRESS:"")):"";
                                if($scope.orgList!=null){
                                    for (var i = 0; i < $scope.orgList.length; i++) {
                                        var orgObject = $scope.orgList[i];
                                    }
                                    object.orgList=$scope.orgList;
                                }
                                if($scope.stateList!=null){
                                    for (var i = 0; i < $scope.stateList.length; i++) {
                                        var obj = $scope.stateList[i];
                                        if (obj.D_VALUE == object.WAREHOUSE_STATE) {
                                            object.WAREHOUSE_STATE_NAME = obj.D_NAME_CN;
                                        }
                                    }
                                    object.stateList = $scope.stateList;
                                }
                                if($scope.addressList!=null){
                                    object.addressList =$scope.addressList;
                                }
                                object.SPACE_INVENTORY = Number(object.SPACE_INVENTORY).toFixed(2);
                                if(object.SPACE_INVENTORY&&object.SPACE_INVENTORY>0 ){
                                    object.INVENTORY_PROP = toDecimal(object.THEORY_INVENTORY/object.SPACE_INVENTORY*100);
                                }
                                object.INVENTORY_PROP = object.INVENTORY_PROP?object.INVENTORY_PROP:0;
                            });
                            if (!currentPage) {
                                $scope.gridOptions.paginationCurrentPage = 1;
                            }
                    });
            };

            //获取仓库分类名称
            $scope.getplanTypeName = function(value){
                var planType = $scope.warehouseList.filter(t=>t.D_VALUE == value);
                if(planType.length){
                    return planType[0].name;
                }
                return "";
            };

            //新增方法
            $scope.add = function(){
                var model={
                    "warehouseList":$scope.warehouseList,
                    "orgList":$scope.orgList,
                    "channelList":$scope.channelList,
                    "stateList":$scope.stateList,
                    "addressList":$scope.addressList
                };
                warehouse_add_service.showDialog(model).then(function(data){
                    $scope.init();
                });
            };

            //编辑方法
            $scope.edit=function(item){
                warehouse_edit_service.showDialog(item).then(function(data){
                    $scope.init();
                });
            };

            //删除数
            $scope.del = function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran(messageService.error_empty));
                }
                return $confirm({ text: transervice.tran(messageService.confirm_del) }).then(function () {
                        var myArray=[];
                        for(var i=0;i<rows.length;i++){
                            myArray[i]=rows[i];
                        }
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "delete", "POST",deleteRowModel).then(
                            function (result){
                                Notification.success(transervice.tran("操作成功！"));
                                $scope.gridOptions.paginationCurrentPage = 1;
                                $scope.gridApi.selection.clearSelectedRows();
                                $scope.init();
                        });

                    });
            };

            //搜索
            $scope.search=function(){
                $scope.searchWhere = {"where":[]};
                if($scope.WAREHOUSE_TYPE_ID!=null && $scope.WAREHOUSE_TYPE_ID.length!=0){
                    if($scope.searchWhere.where.length>0){
                        if($scope.searchWhere.andwhere){
                            var data = angular.copy($scope.searchWhere.andwhere);
                            $scope.searchWhere.andwhere = ["and",data,["=","b_warehouse.WAREHOUSE_TYPE_ID",$scope.WAREHOUSE_TYPE_ID]];
                        }else{
                            $scope.searchWhere.andwhere = ["=","b_warehouse.WAREHOUSE_TYPE_ID",$scope.WAREHOUSE_TYPE_ID];
                        }
                    }else{
                        $scope.searchWhere.where = ["=","b_warehouse.WAREHOUSE_TYPE_ID",$scope.WAREHOUSE_TYPE_ID];
                    }
                }
                //组织
                if($scope.ORGANISATION_ID!=null && $scope.ORGANISATION_ID.length!=0){
                    if($scope.searchWhere.where.length>0) {
                        if ($scope.searchWhere.andwhere) {
                            var data = angular.copy($scope.searchWhere.andwhere);
                            $scope.searchWhere.andwhere = ["and", data, ["=", "b_warehouse.ORGANISATION_ID", $scope.ORGANISATION_ID]];
                        } else {
                            $scope.searchWhere.andwhere = ["=", "b_warehouse.ORGANISATION_ID", $scope.ORGANISATION_ID];
                        }
                    }else{
                        $scope.searchWhere.where = ["=", "b_warehouse.ORGANISATION_ID", $scope.ORGANISATION_ID];
                    }
                }
                //平台
                if($scope.CHANNEL_ID!=null && $scope.CHANNEL_ID.length!=0){
                    if($scope.searchWhere.where.length>0) {
                        if ($scope.searchWhere.where && $scope.searchWhere.andwhere) {
                            var data = angular.copy($scope.searchWhere.andwhere);
                            $scope.searchWhere.andwhere = ["and", data, ["=", "b_warehouse.CHANNEL_ID", $scope.CHANNEL_ID]];
                        } else {
                            $scope.searchWhere.andwhere = ["=", "b_warehouse.CHANNEL_ID", $scope.CHANNEL_ID];
                        }
                    }else{
                        $scope.searchWhere.where = ["=", "b_warehouse.CHANNEL_ID", $scope.CHANNEL_ID];
                    }
                }
                if($scope.searchCondtion!=null && $scope.searchCondtion.length!=0){
                    if($scope.searchWhere.where.length>0) {
                        if (scope.searchWhere.where && $scope.searchWhere.andwhere) {
                            var data = angular.copy($scope.searchWhere.andwhere);
                            $scope.searchWhere.andwhere = ["and", data, ["or", ["like", "WAREHOUSE_CODE", $scope.searchCondtion], ["like", "b_warehouse.WAREHOUSE_NAME_CN", $scope.searchCondtion]]];
                        } else {
                            $scope.searchWhere.andwhere = ["or", ["like", "WAREHOUSE_CODE", $scope.searchCondtion], ["like", "b_warehouse.WAREHOUSE_NAME_CN", $scope.searchCondtion]];
                        }
                    }else{
                        $scope.searchWhere.where = ["or", ["like", "WAREHOUSE_CODE", $scope.searchCondtion], ["like", "b_warehouse.WAREHOUSE_NAME_CN", $scope.searchCondtion]];
                    }
                }
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();

            };
            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init(currentPage, pageSize);
            }

            //四舍五入强制保留两位小数
            function toDecimal(x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return false;
                }
                var f = Math.round(x * 100) / 100;
                if (f == x) {
                    return x;
                }
                var s = f.toString();
                var rs = s.indexOf('.');
                if (rs < 0) {
                    rs = s.length;
                    s += '.';
                }
                while (s.length <= rs + 2) {
                    s += '0';
                }
                return s;
            }

        }]
});
