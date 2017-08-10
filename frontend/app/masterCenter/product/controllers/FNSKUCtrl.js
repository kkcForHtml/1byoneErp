define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/masterCenter/product/controllers/productSKU_add_service',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/singleSelectDirt'

], function () {
    return ['$scope', '$confirm', 'Notification', '$filter','httpService', 'transervice', 'uiGridConstants','commonService','gridDefaultOptionsService','$state','$compile','$q',
        function ($scope, $confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,$state,$compile,$q) {

            //状态
            $scope.states=commonService.getDicList("ISUSED");


            $scope.rowEntity = {channelList:[],accounts:[],suppliers:[],moneys:[],wareHouses:[]};

            //获取所有仓库
            (function () {
                searchData = {
                    "joinwith":["organisation","allBchannel"],
                    limit:"0",
                    "distinct": 1
                };

                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index" , "POST",searchData).then(
                    function (result) {
                        $scope.wareHouses_all=result.data;
                    })
            })();


            //平台列表
            (function () {
                var selectWhere = {limit:"*"};
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(
                    function (result) {
                        $scope.channelList = result.data;

                    }
                );
            })();

            //获取账号
            function getAllAccounts() {

                var dataSearch = {
                    limit:"0"
                };

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index", "POST", dataSearch).then(function (datas) {
                    $scope.accounts=datas.data;

                })

            };

            // 设置样式函数
            function cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
                var entity=row.entity;
                var entitys=getDirtyRows($scope.gridOptions_FNSKU.data,['PSKU_ID', 'CHANNEL_ID', 'WAREHOUSE_ID', 'PLATFORM_SKU', 'ASIN','FNSKU','ACCOUNT_ID',],"PRODUCT_SKU_FNSKU_ID");
                if(entitys.indexOf(entity)!=-1){
                    return "";
                }

                return '';

            }

            //平台表格配置
            $scope.gridOptions_FNSKU = {
                columnDefs: [
                    {
                        field: 'g_product_sku.PSKU_CODE',
                        displayName: transervice.tran('*产品SKU'),
                        editableCellTemplate:'<div ng-if="!grid.appScope.gridOptions_FNSKU.showDirt" id="f{{grid.appScope.gridOptions_FNSKU.data.indexOf(row.entity)}}{{grid.appScope.gridOptions_FNSKU.columnDefs.indexOf(col.colDef)}}" ><div single-select options="row.entity.options" select-model="row.entity.PSKU_ID"  row="row" style="width: 100%"></div></div>',
                        cellClass:cellClass,
                        width:170
                    },
                    {
                        field: 'CHANNEL_ID',
                        displayName: transervice.tran('平台'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getChannelName(row.entity.CHANNEL_ID)}}</div>',
                        //cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'CHANNEL_ID',
                        editDropdownValueLabel: 'CHANNEL_NAME_CN',
                        // editDropdownOptionsArray: $scope.channelList
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.channelList",
                        cellClass:cellClass,
                    }, {
                        field: 'WAREHOUSE_ID',
                        displayName: transervice.tran('仓库'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getWarhouseName(row.entity.WAREHOUSE_ID)}}</div>',
                        //cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'WAREHOUSE_ID',
                        editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                        // editDropdownOptionsArray: $scope.channelList
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.wareHouses",
                        cellClass:cellClass,
                    },{
                        field: 'ACCOUNT_ID',
                        displayName: transervice.tran('账号'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getAccountName(row.entity.ACCOUNT_ID)}}</div>',
                        //cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'ACCOUNT_ID',
                        editDropdownValueLabel: 'ACCOUNT',
                        //editDropdownOptionsArray: $scope.accounts,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.accounts",
                        cellClass:cellClass,
                    }, {
                        field: 'PLATFORM_SKU',
                        displayName: transervice.tran('平台SKU'),
                        cellClass:cellClass,
                    },
                    {field: 'ASIN', displayName: transervice.tran('ASIN'), cellClass:cellClass,},

                    {field: 'FNSKU', displayName: transervice.tran('FNSKU'), cellClass:cellClass,}

                ],
                enableHorizontalScrollbar: 0, //grid水平滚动条是否显示, 0-不显示  1-显示

            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_FNSKU);

            //编辑后触发
            $scope.gridOptions_FNSKU.afterCellEdit=function (rowEntity, colDef, newValue, oldValue) {
                if(newValue!=oldValue){
                    if("CHANNEL_ID"==colDef.name){
                        // rowEntity.CHANNEL_CODE_neme=$scope.getChannelName(newValue)
                        rowEntity.rowEntity.accounts=getAccount(rowEntity);
                        rowEntity.ACCOUNT_ID="";

                        //获取组织平台下的仓库
                        rowEntity.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==rowEntity.ORGAN_ID_DEMAND&&w.CHANNEL_ID==rowEntity.CHANNEL_ID);
                        rowEntity.WAREHOUSE_ID="";
                    }
                    $scope.gridApi.grid.refresh();
                }

            }



            $scope.dicOptions = {
                filter: "contains",
                autoBind: true,
                // dataSource:null,
                dataTextField: "PSKU_CODE",
                dataValueField: "PSKU_ID",
                optionLabel: "请选择",
                url:httpService.webApi.api+"/master/product/prodsku/index",
                search:{},
                o_change:$scope.selectRowChange
                ,

            };



            $scope.add=function () {
                // var def=$q.defer();
                var newItem={
                    CHANNEL_ID:"",
                    WAREHOUSE_ID:"",
                    ACCOUNT:"",
                    ASIN:"",
                    FNSKU:"",
                    NOTCONSALE:1,
                    DEFAULTS:0,
                    isSelected:false,
                    isCreate:true,
                    DELETED_STATE:0,
                    index:$scope.gridOptions_FNSKU.data.length,
                    rowEntity:$scope.rowEntity,
                    options:angular.copy($scope.dicOptions)
                };

                $scope.gridOptions_FNSKU.data.unshift(newItem);
                gridDefaultOptionsService.refresh($scope.gridOptions_FNSKU,"PSKU_ID");


            }


            $scope.del=function () {
                var entitys=$scope.gridOptions_FNSKU.gridApi.selection.getSelectedRows();

                if(!entitys.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                var def=$q.defer();
                 $confirm({ text: transervice.tran('是否确认删除?') })
                    .then(function () {
                        var delRows=entitys.filter(e=>e.PRODUCT_SKU_FNSKU_ID);
                        if(delRows.length){
                            delRows.forEach(e=>e.DELETED_STATE=1);
                            var postData={batch:delRows};

                            httpService.httpHelper(httpService.webApi.api, "master/product/prodskuf", "delete", "POST", postData,def).then(function (datas) {
                                Notification.success(transervice.tran('删除成功！'));
                                $state.go("main.FSKU",null,{reload:true});
                                // $scope.gridOptions_FNSKU.data=$scope.gridOptions_FNSKU.data.filter(a=>$.inArray(a,entitys)==-1);

                            });
                        }else{
                            $scope.gridOptions_FNSKU.data=$scope.gridOptions_FNSKU.data.filter(a=>$.inArray(a,entitys)==-1);
                            def.resolve();
                        }


                    });
                 return def.promise;
            }

            $scope.save=function () {

                var entitys = getDirtyRows($scope.gridOptions_FNSKU.data,['PSKU_ID',
                    'CHANNEL_ID',
                    'WAREHOUSE_ID',
                    'PLATFORM_SKU',
                    'ASIN','FNSKU','ACCOUNT_ID'],"PRODUCT_SKU_FNSKU_ID");
                if(!entitys.length){
                    return Notification.error(transervice.tran("没有新增或修改的行"));
                }
                for(var i=0;i<entitys.length;i++){
                    var item=entitys[i];
                    if(!item.PSKU_ID){
                        return Notification.error(transervice.tran("请填写产品SKU"));
                    }
                }


                var saveData={batchMTC:entitys}
              return  httpService.httpHelper(httpService.webApi.api, "master/product/prodskuf","update", "POST", saveData).then(function () {
                    Notification.success(transervice.tran('保存成功'));
                    // $scope.search();
                    $state.go("main.FSKU",null,{reload:true});
                })
            }

            //获取状态名称
            $scope.getStateName=function (id) {
                var states=$scope.states.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            }
            //获取平台名称
            $scope.getChannelName=function (id) {
                var channels=$scope.channelList.filter(c=>c.CHANNEL_ID==id);
                if(channels.length){
                    return channels[0].CHANNEL_NAME_CN;
                }
                return "";
            }

            //获取仓库名称
            $scope.getWarhouseName=function (id) {
                var hous=$scope.wareHouses_all.filter(w=>w.WAREHOUSE_ID==id);
                if(hous.length){
                    return hous[0].WAREHOUSE_NAME_CN;
                }
                return "";
            }

            //获取账号名称
            $scope.getAccountName=function (accountId) {

                var arr=$scope.accounts.filter(c=>c.ACCOUNT_ID==accountId);
                if(arr.length){
                    return arr[0].ACCOUNT;
                }
                return "";
            }



            $scope.gridOptions_FNSKU.getPage=function(pageNo,pageSize){
                $scope.init();
            };

            $scope.gridOptions_FNSKU.getGridApi=function(gridApi){
                $scope.gridApi=gridApi;
            };

            //等待数据
            function waitData(fn1,fn2){
                setTimeout(function () {
                    if(!fn1()){
                        waitData(fn1,fn2);
                    }else{
                        fn2();
                    }
                },50)
            };

            $scope.name="";

            $scope.init=function(){


                var searchCoditions={
                    limit: $scope.gridOptions_FNSKU.paginationPageSize,
                    andFilterWhere:["or",["like","g_product_sku.PSKU_CODE",$scope.name],["like","g_product_sku_fnsku.ASIN",$scope.name],["like","g_product_sku_fnsku.FNSKU",$scope.name]],
                    joinwith:["g_product_sku"],
                    orderby:"g_product_sku_fnsku.UPDATED_AT DESC",
                }

                httpService.httpHelper(httpService.webApi.api, "master/product/prodskuf", "index?page="+$scope.gridOptions_FNSKU.paginationCurrentPage, "POST",searchCoditions).then(
                    function (result){
                        $scope.gridOptions_FNSKU.totalItems=result._meta.totalCount;
                        for(var i=0;i<result.data.length;i++){
                            var d=result.data[i];
                            d.index=i;
                            d.copyObject=angular.copy(d);
                            if(d.g_product_sku){
                                d.ORGAN_ID_DEMAND=d.g_product_sku.ORGAN_ID_DEMAND;
                            }


                            d.rowEntity=angular.copy($scope.rowEntity);

                            d.rowEntity.accounts=getAccount(d);


                            d.rowEntity.channelList=getChannelByorg(d);

                            d.rowEntity.wareHouses= $scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==d.ORGAN_ID_DEMAND&&w.CHANNEL_ID==d.CHANNEL_ID);

                            var options=angular.copy($scope.dicOptions);
                             options.value=d.g_product_sku.PSKU_ID;
                            options.search.andwhere=["=","PSKU_ID",d.PSKU_ID];
                            d.options=options;
                        };
                        $scope.gridOptions_FNSKU.data = result.data;
                        $scope.gridApi.grid.refresh();
                    }
                );

            };

            getAllAccounts().then(function(){
                $scope.init();
            });



            //模糊搜索
            $scope.search=function(){
                $scope.gridOptions_FNSKU.paginationCurrentPage=1;
                $scope.init();
            }

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


            //根据平台需求组织获取账号
            function getAccount (entity) {

                var arr=[];
                if(entity.ORGAN_ID_DEMAND&&entity.CHANNEL_ID){

                    arr=$scope.accounts.filter(a=>a.ORGANISATION_ID==entity.ORGAN_ID_DEMAND&&a.CHANNEL_ID==entity.CHANNEL_ID);

                }
                return arr;

            }

            //根据需求组织获取平台
            function getChannelByorg(entity) {
                var arr=[];
                if(entity.ORGAN_ID_DEMAND){

                    arr=$scope.channelList.filter(a=>a.ORGANISATION_ID==entity.ORGAN_ID_DEMAND);

                }
                return arr;
            }

            $scope.selectRowChange= function (row) {
               // $scope.gridApi.core.getVisibleRows()
                if (row) {
                    row.isDirty = true;
                    row.isError = true;
                    $scope.gridApi.grid.refresh();
                    var model= row.selectModel;
                    row.entity.g_product_sku=model;
                    row.entity.ORGAN_ID_DEMAND=model.ORGAN_ID_DEMAND;
                    row.entity.CHANNEL_ID="";
                    row.entity.ACCOUNT_ID="";

                    row.entity.PSKU_ID=model.PSKU_ID;
                    //row.entity.rowEntity.accounts=getAccount(row.entity);
                    row.entity.rowEntity.channelList=getChannelByorg(row.entity);
                }

            }

            $scope.dicOptions.o_change=$scope.selectRowChange;




        }]
});
