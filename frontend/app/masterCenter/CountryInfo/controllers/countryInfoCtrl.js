define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    "app/common/Services/TranService",
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService'
], function () {
    return ['$scope', '$confirm', 'Notification','httpService','amHttp', 'transervice', '$filter','uiGridConstants','gridDefaultOptionsService','$q','commonService',
        function ($scope, $confirm, Notification,httpService, amHttp, transervice,$filter, uiGridConstants,gridDefaultOptionsService,$q,commonService) {
            var dirtyRowData = [];
            var   dataArray=[];
            var AreaTotalList = [];
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'AREA_CODE', displayName: transervice.tran('*国家编码') },
                    { field: 'AREA_NAME_CN', displayName: transervice.tran('*全称(中文)') },
                    { field: 'AREA_NAME_EN', displayName: '全称（英文）' },
                    { field: 'AREA_FID', displayName: transervice.tran('*所属地区'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.AREA_FID.list",
                        enableCellEdit: true },
                   /* { field: 'AREA_STATE', displayName: '是否启用',
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity2.fieldDataObjectMap.AREA_STATE.list",
                        enableCellEdit:true},*/
                    {
                        field: 'AREA_STATE',
                        width: 120,
                        displayName: transervice.tran('是否启用'),
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel: 'name',
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.fieldDataObjectMap.AREA_STATE.list"
                    },
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
                    //再设置一个 公共的 行来操作  来实现  唯一性的判断
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row){
                            $scope.testRow = row.entity;
                        }
                    });
                    //编辑开始
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (newValue != oldValue) {
                            if (newValue < 0) {
                                var colEditName = colDef.field;
                                rowEntity[colEditName] = 0;
                                newValue = 0;
                            }
                            if(rowEntity.AREA_ID==null){
                                        var   indexdata =$scope.indexDirtyRowSave(rowEntity,colDef);
                                        if(indexdata == null){  //未找到ids
                                            var   datas = {
                                                "ids":rowEntity.ids,
                                                "AREA_CODE":rowEntity.AREA_CODE,      //区域编码
                                                "AREA_NAME_CN":rowEntity.AREA_NAME_CN,      //区域名称中文
                                                "AREA_NAME_EN":rowEntity.AREA_NAME_EN,
                                                "AREA_REMARKS":rowEntity.AREA_REMARKS,      //备注
                                                "AREA_FID":rowEntity.AREA_FID,
                                                "AREA_STATE":rowEntity.AREA_STATE,
                                            };
                                        //    dirtyRow[colDef.field]=newValue;
                                            dataArray.push(datas);
                                        }else {   //找到了ids   那么久更新指定的项
                                            if(colDef.field=="AREA_NAME"){
                                                dataArray[indexdata]["AREA_FID"]=newValue;
                                            }else {
                                                dataArray[indexdata][colDef.field]=newValue;
                                            }
                                        }
                                        //保存到数组中

                            }else {
                                //是否已添加  //保存   保存到了这个数组中
                                    var indexDirty = $scope.indexDirtyRow(rowEntity, colDef);
                                    if (indexDirty == null) {
                                        var dirtyRow = {
                                            "AREA_ID":rowEntity.AREA_ID,
                                            "AREA_FID":rowEntity.AREA_FID,    //所属地区
                                             "AREA_CODE":rowEntity.AREA_CODE,
                                             "AREA_NAME_CN":rowEntity.AREA_NAME_CN,
                                             "AREA_NAME_EN":rowEntity.AREA_NAME_EN,
                                             "AREA_STATE":rowEntity.AREA_STATE,
                                        };
                                       // dirtyRow[colDef.field]=newValue;
                                        dirtyRowData.push(dirtyRow);
                                    } else {   //未找到id
                                        dirtyRowData[indexDirty][colDef.field]=newValue;
                                    }

                            }
                        }
                    });
                    $scope.gridApi.core.on.filterChanged($scope, function () {
                        var grid = this.grid;
                        var size = grid.columns.length;
                        if (size > 0) {
                            var paras = [];
                            for (var i = 0; i < size; i++) {
                                if (grid.columns[i].filters[0] != undefined && grid.columns[i].filters[0].term != undefined && (grid.columns[i].filters[0].term + '').length > 0) {
                                    var para = {
                                        "columnName": grid.columns[i].field,
                                        "value": grid.columns[i].filters[0].term
                                    }
                                    paras.push(para);
                                }
                            }
                            $scope.filters["paras"] = paras;
                        } else {
                            $scope.filters["paras"] = null;
                        }
                        $scope.poReportQuery();
                    });
                    //编辑结束
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                        var promise = $q.defer();
                    gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                    promise.reject();
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);


            $scope.modify = function () {
                var isboolea=true;
                if(dirtyRowData == undefined || dirtyRowData == null || dirtyRowData.length == 0){
                    if (dataArray == undefined  || dataArray == null || dataArray.length==0){
                        isboolea=false;
                    }
                }
                if (isboolea == false  ) {
                    Notification.error(transervice.tran('没有可新增或者修改的行！'));
                    return;
                }else {
                    var countonly=[];
                    var  updatedata={
                        "edit_only":dirtyRowData
                    };
                    var  savedata={
                        "edit_only":dataArray
                    };
                    countonly.push(updatedata);
                    countonly.push(savedata);
                    //修改开始
                    httpService.httpHelper(httpService.webApi.api, "master/basics/area", "only", "POST", countonly).then(
                        function(result){
                               if(result.data.statusOnly==200){
                                   if( dirtyRowData.length != 0) {
                                       var datau = {
                                           "batchMTC": dirtyRowData
                                       };
                                       httpService.httpHelper(httpService.webApi.api, "master/basics/area", "update", "POST", datau).then(
                                           function (datas) {
                                                   Notification.success({message:datas.message, delay: 2000});
                                                   //清空添加的数组
                                                   dirtyRowData.length = 0;
                                                   $scope.init();
                                           });
                                   }
                                       //新增开始
                                       if( dataArray.length  != 0){
                                            var error_msg = "";
                                           angular.forEach(dataArray,function(obj,index){
                                               if(!obj.AREA_CODE){
                                                   error_msg = transervice.tran('国家编码不能为空！');
                                                   return false;
                                               }
                                               if(!obj.AREA_NAME_CN){
                                                   error_msg = transervice.tran('全称(中文)不能为空！');
                                                   return false;
                                               }
                                               if(!obj.AREA_FID){
                                                   error_msg = transervice.tran('所属地区不能为空！');
                                                   return false;
                                               }
                                           });

                                           if(error_msg){
                                              return  Notification.error({message:error_msg,delay: 5000})
                                           }

                                           var   dataSoure={
                                               "batchMTC":dataArray
                                           };

                                           httpService.httpHelper(httpService.webApi.api, "master/basics/area", "create", "POST", dataSoure).then(
                                               function (datas) {
                                                       Notification.success({ message:datas.message, delay: 5000 });
                                                       dataArray.length=0;
                                                       $scope.init();
                                               }
                                           );
                                       }
                                       //新增结束
                               }else{
                                   countonly.length=0;
                                   Notification.error({ message: result.data.messageOnly, delay: 5000 });
                               }
                        },function(results){
                            countonly.length=0;
                            Notification.error({ message: results.message, delay: 5000 });
                        });
                }
            };
              /**  修改**/
            $scope.indexDirtyRow = function (rowEntity, colDef) {
                if (dirtyRowData == null || dirtyRowData == undefined || dirtyRowData.length == 0) {
                    dirtyRowData = [];
                    return null;
                }
                for (var i = 0; i < dirtyRowData.length; i++) {
                    var dirtyItem = dirtyRowData[i];
                    var olID = rowEntity.AREA_ID;
                    if (dirtyItem.AREA_ID== olID) {
                        return i;
                    }
                }
                return null;
            };
            /** 新增**/
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
            //被删除的组织编码
            $scope.organisisation_codes=[];
            //模拟新增的models
            $scope.addModels=[];

            var stateList = commonService.getDicList("STATE");

            $scope.init=function () {

                var areaList = [];
                httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST",
                    {
                        "where":{"AREA_FID":"0","AREA_STATE":1},
                        "orderby": "AREA_STATE desc,UPDATED_AT desc",
                    }).then(
                    function (datas) {
                     var dropList=datas.data;

                        $scope.AreaTotalList = dropList;

                        angular.forEach(dropList, function (objdrop, index) {
                            var newData = {};
                            newData.name = objdrop.AREA_NAME_CN;
                            newData.value = objdrop.AREA_ID;
                            areaList.push(newData);
                        });
                        var rowEntity = {
                            "fieldDataObjectMap":{
                                "AREA_FID":{
                                    "list":areaList
                                },
                                "AREA_STATE":{
                                    "list":stateList
                                }
                            }
                        };
                        $scope.rowEntity = rowEntity;
                    }
                );
                //添加下拉框  结束
                var datam={
                    "where":["and",["<>","b_area.AREA_FID","0"]],
                    "joinwith":["b_area"],
                    'limit': $scope.gridOptions.paginationPageSize,
                    "orderby": "b_area.AREA_STATE desc,b_area.UPDATED_AT desc",
                };
                var searchData =$scope.searchCondition;
                if(searchData!=null){
                    datam={
                        "where":["and",["<>","b_area.AREA_FID","0"],
                            ["or",
                                ["like","b.AREA_NAME_CN",searchData],
                                ["like","b_area.AREA_CODE",searchData],
                                ["like","b_area.AREA_NAME_CN",searchData],
                                ["like","b_area.AREA_NAME_EN",searchData]
                            ]
                        ],
                        "joinwith":["b_area"],
                        'limit': $scope.gridOptions.paginationPageSize,
                        "orderby": "b_area.AREA_STATE desc,b_area.UPDATED_AT desc",
                    };
                }
                httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index?page="+$scope.gridOptions.paginationCurrentPage, "POST", datam).then(
                    function (datas) {
                        datase=$scope.addModels.concat(datas.data);
                        $scope.gridOptions.totalItems=datas._meta.totalCount;
                        $scope.gridOptions.data = datas.data;
                        angular.forEach($scope.gridOptions.data,function(object,index){
                            object.rowEntity = $scope.rowEntity;

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
            var i=0;
            $scope.edit=function(item){
                 i++;
                $scope.gridOptions.data.unshift({
                    "ids":i,
                     "AREA_ID":null,
                    "AREA_CODE":null,
                    "AREA_NAME_CN":null,
                    "AREA_NAME_EN":null,
                    "rowEntity": $scope.rowEntity,
                    "AREA_STATE":"1",
                    "rowEntity2": $scope.rowEntity2,
                });
            };
            //删除数据
            $scope.del=function(){

                var rows=$scope.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if(!rows.length){
                   return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({ text: transervice.tran('是否确认删除') })
                    .then(function () {
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
//                      if (myArrayNot.length > 0) {
//                          for (var i = 0; i < myArrayNot.length; i++) {
//                              for (var j = 0; j < dataRow.length; j++) {
//                                  if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
//                                      $scope.gridOptions.data.splice(j, 1);
//                                      mysavede.length=0;
//                                      updatelist.length=0;
//                                      break;
//                                  }
//                              }
//                          }
//                      }
	                    var addArray = [], myArray=[];
	                    rows.forEach((obj)=>{
	                    	!obj.AREA_ID?addArray.push(obj):myArray.push(obj);
	                    })
		                addArray.forEach((obj)=>{
		                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
		                })

                        
                        if(myArray.length > 0){
                            var deleteRowModel = {
                                "batch": myArray
                            };
                            httpService.httpHelper(httpService.webApi.api, "master/basics/area", "delete", "POST", deleteRowModel).then(
                                function (datas) {
	                                $scope.gridApi.selection.clearSelectedRows();
					                myArray.forEach((obj)=>{
					                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
					                })                               
	                                Notification.success({ message: transervice.tran(datas.message), delay: 5000 });
                                },
                                function () {
                                	$scope.init();
                                }
                            );
                        }
                    //    $scope.init();
                    });
            };
            $scope.search=function(){
                $scope.gridOptions.paginationCurrentPage=1;
                $scope.init();
            }

        }]
});
