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
            var dirtyRowData = [];
            var  dataArray=[];
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'AREA_CODE', displayName: transervice.tran('*地区编码') },
                    { field: 'AREA_NAME_CN', displayName: transervice.tran('*地区名称') },
                    { field: 'AREA_REMARKS', displayName: '备注' },
                    { field: 'AREA_STATE', displayName: '是否启用',editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'gridFieldFilter:row:col',
                        editDropdownIdLabel:"value",
                        editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.AREA_STATE.list",
                        enableCellEdit:true
                    }
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
                    });
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
                            if (rowEntity.AREA_ID == null) {
                                var indexdata = $scope.indexDirtyRowSave(rowEntity, colDef);
                                if (indexdata == null) {  //未找到ids
                                    var datas = {
                                        "ids": rowEntity.ids,
                                        "AREA_CODE": rowEntity.AREA_CODE,      //区域编码
                                        "AREA_NAME_CN": rowEntity.AREA_NAME_CN,      //区域名称中文
                                        "AREA_REMARKS": rowEntity.AREA_REMARKS,      //备注
                                        "AREA_FID": "0",
                                        "AREA_STATE":rowEntity.AREA_STATE,
                                    };
                                    dataArray.push(datas);
                                } else {   //找到了ids   那么久更新指定的项
                                    dataArray[indexdata][colDef.field] = newValue;
                                }
                            } else {
                                //修改发送数据开始
                                var indexDirty = $scope.indexDirtyRow(rowEntity, colDef);
                                if (indexDirty == null) {
                                    var dirtyRow = {
                                        "AREA_ID":rowEntity.AREA_ID,
                                        "AREA_NAME_CN": rowEntity.AREA_NAME_CN,
                                        "AREA_CODE":rowEntity.AREA_CODE,
                                        "AREA_FID":"0"
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
                    var olID = rowEntity.AREA_ID;
                    if (dirtyItem.AREA_ID == olID) {
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
                    //批量修改开始
                    //写一个总校验
                    var countonly=[];
                    var  updatedata={
                        "edit_only":dirtyRowData
                    };
                    var  savedata={
                        "edit_only":dataArray
                    };

                    var datau = {
                        "batchMTC": dataArray
                    };
                    httpService.httpHelper(httpService.webApi.api, "master/basics/area", "only", "POST", datau).then(
                        function(result){
                         if(result.data.statusOnly==200){
                              //  Notification.success({ message: result.data.messageOnly, delay: 5000 });
                             if(dirtyRowData.length != 0){
                              var datau = {
                                  "batchMTC": dirtyRowData
                              };
                                  httpService.httpHelper(httpService.webApi.api, "master/basics/area", "update", "POST", datau).then(
                                      function (datas) {
                                          Notification.success({message:transervice.tran(datas.message), delay: 2000});
                                          dirtyRowData.length = 0;
                                          $scope.init();

                                      }
                                  );
                              }
                             //批量新增开始
                              if(dataArray.length  != 0){
                              var   dataSoure={
                              "batchMTC":dataArray
                              };

                              httpService.httpHelper(httpService.webApi.api, "master/basics/area", "create", "POST", dataSoure).then(
                                  function (datas) {
                                          Notification.success({message:datas.message, delay: 2000});
                                          //清空添加的数组
                                          dataArray.length = 0;
                                          $scope.init();
                                  }
                              );
                              }
                         }else {
                             countonly.length=0;
                               Notification.error({ message: result.data.messageOnly, delay: 5000 });
                         }
                        },function(results){
                            countonly.length=0;
                            Notification.error({ message: results.message, delay: 5000 });
                        }
                    );
                }
            };
            //被删除的组织编码
            $scope.organisation_codes=[];
            //模拟新增的models
            $scope.addModels=[];
            $scope.init=function () {

                var stateList = commonService.getDicList("STATE");

                var rowEntity = {
                    "fieldDataObjectMap":{
                        "AREA_STATE":{
                            "list":stateList
                        }
                    }
                };
                $scope.rowEntity = rowEntity;

                var searchData =$scope.searchCondition;
                if(searchData!=null){
                    var  datam={
                        "where":{"AREA_FID":"0"},
                        "having":[
                            "or",["like","AREA_CODE",searchData],
                            ["like","AREA_NAME_CN",searchData],
                            ["like","AREA_REMARKS",searchData]
                        ],
                        'limit': $scope.gridOptions.paginationPageSize,
                        "orderby": "AREA_STATE desc,UPDATED_AT desc",
                    };
                }else {
                    var  datam={
                        "where":{"AREA_FID":"0"},
                        'limit': $scope.gridOptions.paginationPageSize,
                        "orderby": "AREA_STATE desc,UPDATED_AT desc",
                    };
                }
                httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST", datam).then(
                    function (datas) {
                        datase=$scope.addModels.concat(datas.data);
                        $scope.gridOptions.totalItems=datas._meta.totalCount;
                        $scope.gridOptions.data = datas.data;
                        angular.forEach($scope.gridOptions.data,function(object,indexa){
                            object.rowEntity=$scope.rowEntity;
                        });
                    },
                    function (data) {
                        Notification.error({ message: data.message, delay: 5000 });
                    }
                );
                //server 结束
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
                    "AREA_ID":null,
                    "AREA_CODE":null,
                    "AREA_NAME_CN":null,
                    "AREA_REMARKS":null,
                    "AREA_STATE":"1",
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
                        if(rows[i]["AREA_ID"] == null){
                            myArrayNot[i] = rows[i];  //同时删除 数组里面的值
                            var  idsdata={
                                "ids":rows[i]["ids"]
                            }
                            mysavede.push(idsdata);    //保存
                        }else{
                            myArrayNot[i] = rows[i];  //同时删除 数组里面的值
                            myArrayNot[i] = rows[i];
                            var areaIdData={
                                "AREA_ID":rows[i]["AREA_ID"]
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
                                    if(updatelist[i]["AREA_ID"]==dirtyRowData[j]["AREA_ID"]){
                                        dirtyRowData.splice(j,1);
                                    }
                                }
                            }
                        }
                    }
//                  if (myArrayNot.length > 0) {
//                      for (var i = 0; i < myArrayNot.length; i++) {
//                          for (var j = 0; j < dataRow.length; j++) {
//                              if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
//                                  $scope.gridOptions.data.splice(j, 1);
//                                  mysavede.length=0;
//                                  updatelist.length=0;
//                                  break;
//                              }
//                          }
//                      }
//                  }
                    var addArray = [], myArray=[];
                    rows.forEach((obj)=>{
                    	!obj.AREA_ID?addArray.push(obj):myArray.push(obj);
                    })
	                addArray.forEach((obj)=>{
	                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
	                })
                    
                    //console.log(addArray,myArray);
                    if(myArray.length > 0){
                        var deleteRowModel = {
                            "batch": myArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/basics/area", "delete", "POST", deleteRowModel).then(function (datas) {
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

        }]
});
