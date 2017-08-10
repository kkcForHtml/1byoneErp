define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    "app/common/Services/TranService",
    'app/common/Services/gridDefaultOptionsService'
], function () {
    return ['$scope','$confirm','httpService', 'Notification', 'amHttp', 'transervice', 'uiGridConstants','gridDefaultOptionsService','$q','commonService',
        function ($scope,$confirm,httpService, Notification, amHttp, transervice, uiGridConstants,gridDefaultOptionsService,$q,commonService) {
            var dataArray = [];
            var dirtyRowData = [];
            var WEIGHTED_LIST= new Array();

            WEIGHTED_LIST.push({'value':'HUP','name':'持升','WEIGHTED_CODE':'HUP'});
            WEIGHTED_LIST.push({'value':'WUP','name':'波升','WEIGHTED_CODE':'WUP'});
            WEIGHTED_LIST.push({'value':'HD','name':'持降','WEIGHTED_CODE':'HD'});
            WEIGHTED_LIST.push({'value':'WD','name':'波降','WEIGHTED_CODE':'WD'});

            $scope.rowEntity = {"fieldDataObjectMap": {}};

            $scope.Obo_weighted_list = {};
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'WEIGHTED_CODE',
                        displayName: transervice.tran('销售走势'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'WEIGHTED_CODE',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.WEIGHTED_CODE.list"
                    },
                    { field: 'WEIGHTED_DAY3',
                        displayName: transervice.tran('*3天'),
                        type: 'number',
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTED_DAY3"></form></div>'
                    },
                    {   field: 'WEIGHTED_DAY7',
                        displayName: '*7天',
                        type: 'number',
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTED_DAY7"></form></div>'
                    },
                    {
                        field: 'WEIGHTED_DAY15',
                        displayName: '*15天',
                        type: 'number',
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTED_DAY15"></form></div>'
                    },
                    {
                        field: 'WEIGHTED_DAY30',
                        displayName: '*30天',
                        type: 'number',
                        cellClass: "text-right",
                        editableCellTemplate: '<div><form><input formatting="false"  numeric decimals="2" max="99999999"  min="0" ui-grid-editor ng-model="row.entity.WEIGHTED_DAY30"></form></div>'
                    },
                ],

                //---------------api---------------------
                onRegisterApi: function( gridApi ) {
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
                    })
                    //可编辑行
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (newValue != oldValue) {
                            if (newValue < 0) {
                                var colEditName = colDef.field;
                                rowEntity[colEditName] = 0;
                                newValue = 0;
                            }
                            //地区编码和 地区名称修改时做唯一性验证
                            //新增修改开始
                            if (rowEntity.WEIGHTED_ID == null) {
                                var indexdata = $scope.indexDirtyRowSave(rowEntity, colDef);
                                if (indexdata == null) {  //未找到ids
                                    var datas = {
                                        "ids": rowEntity.ids,
                                        "WEIGHTED_NAME": '',
                                        "WEIGHTED_CODE": rowEntity.WEIGHTED_CODE,
                                        "WEIGHTED_DAY3": rowEntity.WEIGHTED_DAY3,
                                        "WEIGHTED_DAY7": rowEntity.WEIGHTED_DAY3,
                                        "WEIGHTED_DAY15": rowEntity.WEIGHTED_DAY15,
                                        "WEIGHTED_DAY30": rowEntity.WEIGHTED_DAY30,
                                    };
                                    console.log(datas);
                                    dataArray.push(datas);
                                } else {   //找到了ids   那么久更新WEIGHTED_DAY3指定的项
                                    dataArray[indexdata][colDef.field] = newValue;
                                }
                            } else {
                                //修改发送数据开始
                                var indexDirty = $scope.indexDirtyRow(rowEntity, colDef);
                                if (indexDirty == null) {
                                    var dirtyRow = {
                                        "WEIGHTED_ID": rowEntity.WEIGHTED_ID,
                                        "WEIGHTED_NAME": '',
                                        "WEIGHTED_CODE": rowEntity.WEIGHTED_CODE,
                                        "WEIGHTED_DAY3": rowEntity.WEIGHTED_DAY3,
                                        "WEIGHTED_DAY7": rowEntity.WEIGHTED_DAY3,
                                        "WEIGHTED_DAY15": rowEntity.WEIGHTED_DAY15,
                                        "WEIGHTED_DAY30": rowEntity.WEIGHTED_DAY30,
                                    };
                                    dirtyRow[colDef.field]=newValue;
                                    dirtyRowData.push(dirtyRow);
                                } else {   //未找到id
                                    dirtyRowData[indexDirty][colDef.field]=newValue;
                                }
                            }
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                        var promise = $q.defer();
                    gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                    promise.reject();
                });
                }
                //可编辑行 结束
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
            /**是否已编辑**/   //修改
            $scope.indexDirtyRow = function (rowEntity, colDef) {
                if (dirtyRowData == null || dirtyRowData == undefined || dirtyRowData.length == 0) {
                    dirtyRowData = [];
                    return null;
                }
                for (var i = 0; i < dirtyRowData.length; i++) {
                    var dirtyItem = dirtyRowData[i];
                    var olID = rowEntity.WEIGHTED_ID;
                    if (dirtyItem.WEIGHTED_ID == olID) {
                        return i;
                    }
                }
                return null;
            };
            /**是否已编辑**/  // 新增
            $scope.indexDirtyRowSave=function(rowEntity,colDef){
                if(dataArray == null  || dataArray == undefined  || dataArray.length  ==0  ){
                    dataArray=[];
                    return  null
                }
                for(var i=0;i<dataArray.length;i++){
                    var  dataItem =dataArray[i];
                    var  olID=rowEntity.ids;
                    if(dataItem.ids==olID){      //判断是否已经是添加的行数据
                        return  i;
                    }
                }
                return   null ;
            };
            /**点击修改按钮**/
            $scope.modify = function () {
                var isboolea=true;

                if(dirtyRowData == undefined || dirtyRowData == null || dirtyRowData.length == 0){
                    if (dataArray == undefined  || dataArray == null || dataArray.length==0){
                        isboolea=false;
                    }
                }
                if (isboolea==false) {
                    Notification.error(transervice.tran('没有可新增或者修改的行！'));
                    return;
                }else {
                    if(dirtyRowData.length != 0){

                        angular.forEach(dirtyRowData,function(obj,index){
                            obj.WEIGHTED_NAME = $scope.getWeightName(obj.WEIGHTED_CODE);
                        });

                        var datau = {
                            "batchMTC": dirtyRowData
                        };

                        httpService.httpHelper(httpService.webApi.api, "tools/oboweighted", "update", "POST", datau).then(
                            function (datas) {
                                Notification.success({message:transervice.tran(datas.message), delay: 2000});
                                dirtyRowData.length = 0;
                                $scope.init();
                            }
                        );
                    }

                    //批量新增开始
                    if(dataArray.length  != 0){

                        angular.forEach(dataArray,function(obj,index){
                            obj.WEIGHTED_NAME = $scope.getWeightName(obj.WEIGHTED_CODE);
                        });

                        var   dataSoure={
                            "batchMTC":dataArray
                        };

                        httpService.httpHelper(httpService.webApi.api, "tools/oboweighted", "create", "POST", dataSoure).then(
                            function (datas) {
                                Notification.success({message:datas.message, delay: 2000});
                                //清空添加的数组
                                dataArray.length = 0;
                                $scope.init();
                            }
                        );
                    }
                }
            };
            //被删除的组织编码
            $scope.organisation_codes=[];
            //模拟新增的models
            $scope.addModels=[];
            $scope.init=function () {

                $scope.rowEntity.fieldDataObjectMap['WEIGHTED_CODE'] = {"list": WEIGHTED_LIST};

                var datam = [];

                httpService.httpHelper(httpService.webApi.api, "tools/oboweighted", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST", datam).then(
                    function (datas) {
                        $scope.gridOptions.data = datas.data;
                        angular.forEach($scope.gridOptions.data, function (ob, index) {
                            ob.rowEntity = $scope.rowEntity;
                        });
                    },
                    function (data) {
                        Notification.error({ message: data.message, delay: 5000 });
                    }
                );
            };

            $scope.init();

            function getSubList(datas){
                var pageNo=$scope.gridOptions.paginationCurrentPage;
                var pageSize=$scope.gridOptions.paginationPageSize;
                var from=(pageNo-1)*pageSize;
                var to=from+pageSize;
                if(datas.size<(to+1)){
                    return datas.splice(from);
                }
                return datas.splice(from,pageSize);
            }
            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                $scope.init();
            }
            //编辑新增方法
            var  i=0;
            $scope.edit=function(item){
                i++;
                $scope.gridOptions.data.unshift({
                    "ids":i,
                    "WEIGHTED_NAME" : null,
                    "WEIGHTED_DAY3" : null,
                    "WEIGHTED_DAY7" : null,
                    "WEIGHTED_DAY15" : null,
                    "WEIGHTED_DAY30" : null,
                    rowEntity: $scope.rowEntity
                });
            };
            //删除数据
            $scope.del=function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                var dataRow = $.extend(true, [], $scope.gridOptions.data);
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({ text: transervice.tran('是否确认删除') }).then(function () {
                    var myArray=new Array();
                    var myArrayNot = new Array();
                    var  mysavede=new  Array();   //添加时    删除数组里面的值
                    var updatelist=new Array();     //更新时发生的修改
                    for(var i=0;i<rows.length;i++){
                        if(rows[i]["WEIGHTED_ID"] == null){
                            myArrayNot[i] = rows[i];  //同时删除 数组里面的值
                            var  idsdata={
                                "ids":rows[i]["ids"]
                            }
                            mysavede.push(idsdata);    //保存
                        }else{
                            myArrayNot[i] = rows[i];  //同时删除 数组里面的值
                            myArrayNot[i] = rows[i];
                            var areaIdData={
                                "WEIGHTED_ID":rows[i]["WEIGHTED_ID"]
                            };
                            updatelist.push(areaIdData);
                            myArray[i]=rows[i];
                        }
                    }
                    if( dataArray != null  &&  dataArray != undefined   && dataArray.length  > 0){
                        if(mysavede.length > 0){   //删除新增里面的数据
                            for(var i=0;i < mysavede.length;i++){
                                for(var j=0;j < dataArray.length;j++){
                                    if(mysavede[i]["ids"]== dataArray[j]["ids"] ){
                                        dataArray.splice(j,1);
                                    }
                                }
                            }
                        }
                    }
                    if(dirtyRowData!=null  && dirtyRowData != undefined  && dirtyRowData.length > 0  ){
                        if(updatelist.length  > 0  ){
                            for(var i=0;i<updatelist.length;i++){
                                for(var j=0;j<dirtyRowData.length;j++ ){
                                    if(updatelist[i]["WEIGHTED_ID"]==dirtyRowData[j]["WEIGHTED_ID"]){
                                        dirtyRowData.splice(j,1);
                                    }
                                }
                            }
                        }
                    }

                    var addArray = [], myArray=[];
                    rows.forEach((obj)=>{
                    !obj.WEIGHTED_ID?addArray.push(obj):myArray.push(obj);
                    })
                        addArray.forEach((obj)=>{
                            $scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                    })

                    //console.log(addArray,myArray);
                    if(myArray.length > 0){
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "tools/oboweighted", "delete", "POST", deleteRowModel).then(function (datas) {
                            $scope.gridApi.selection.clearSelectedRows();
                            myArray.forEach((obj)=>{
                                $scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
                        })
                            Notification.success({ message: transervice.tran(datas.message), delay: 5000 });
                        },function () {
                            $scope.init();
                        });

                    }
                });
            };
            //设置组织隶属关系
            $scope.search=function(){
                $scope.gridOptions.paginationCurrentPage=1;
                $scope.init();
            }

            $scope.getWeightName = function($code){
                var return_name;
                angular.forEach(WEIGHTED_LIST,function(obj,index){
                    if(obj.value == $code){
                        return_name =  obj.name;
                    }
                });
                return return_name;
            }
        }]
});
