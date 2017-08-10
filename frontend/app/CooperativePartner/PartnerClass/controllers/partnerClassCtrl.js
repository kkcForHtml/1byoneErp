define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    "app/common/Services/TranService",
    'app/common/Services/gridDefaultOptionsService'
], function () {
    return ['$scope', '$confirm','httpService', 'Notification', 'amHttp', 'transervice','$filter', 'uiGridConstants','commonService','gridDefaultOptionsService','$q',
        function ($scope, $confirm,httpService, Notification, amHttp, transervice, $filter,uiGridConstants,commonService,gridDefaultOptionsService,$q) {
            var dirtyRowData = [];
            var  dataArray=[];
            var   onlyArray=[];   //验证唯一性
            $scope.gridOptions = {
                columnDefs: [
                    // { field: 'CLASSIFY_CODE', displayName: transervice.tran('*分类编码') },
                    { field: 'CLASSIFY_NAME_CN', displayName: transervice.tran('*分类名称') },
                    { field: 'CLASSIFY_REMARKS', displayName: '备注' },
                    { field: 'CLASSIFY_STATE', displayName: '是否启用',
                        cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel: 'value',
                        editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.CLASSIFY_STATE.list",
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
                            if (rowEntity.CLASSIFY_ID == null) {
                                var indexdata = $scope.indexDirtyRowSave(rowEntity, colDef);
                                if (indexdata == null) {  //未找到ids
                                    var datas = {
                                        "ids": rowEntity.ids,
                                        "CLASSIFY_ID": rowEntity.CLASSIFY_ID,
                                        "CLASSIFY_NAME_CN": rowEntity.CLASSIFY_NAME_CN,
                                        "CLASSIFY_REMARKS": rowEntity.CLASSIFY_REMARKS,
                                        "CLASSIFY_STATE": rowEntity.CLASSIFY_STATE
                                    };
                                    //     datas[colDef.field]=newValue;
                                    dataArray.push(datas);
                                } else {   //找到了ids   那么久更新指定的项
                                    dataArray[indexdata][colDef.field] = newValue;
                                }
                            } else {
                                //修改发送数据开始
                                var indexDirty = $scope.indexDirtyRow(rowEntity, colDef);
                                if (indexDirty == null) {
                                    var dirtyRow = {
                                        "CLASSIFY_ID": rowEntity.CLASSIFY_ID, DE,
                                             "CLASSIFY_NAME_CN":rowEntity.CLASSIFY_NAME_CN
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
            //编辑新增方法
            var  i=0;
            $scope.edit=function(item){
                i++;
                $scope.gridOptions.data.unshift({
                    "ids":i,
                    "CLASSIFY_ID":null,
                    "CLASSIFY_CODE":null,
                    "CLASSIFY_NAME_CN":null,
                    "CLASSIFY_REMARKS":null,
                    "CLASSIFY_STATE":"1",
                    "rowEntity": $scope.rowEntity

                });
            };
            /**是否已编辑**/   //修改
            $scope.indexDirtyRow = function (rowEntity, colDef) {
                if (dirtyRowData == null || dirtyRowData == undefined || dirtyRowData.length == 0) {
                    dirtyRowData = [];
                    return null;
                }
                for (var i = 0; i < dirtyRowData.length; i++) {
                    var dirtyItem = dirtyRowData[i];
                    var olID = rowEntity.CLASSIFY_ID;
                    if (dirtyItem.CLASSIFY_ID == olID) {
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
             /**唯一性验证  **/
             $scope.indexDirtyRowOnly=function(rowEntity,colDef){
                if(onlyArray  == null  || onlyArray == undefined || onlyArray.length == 0  ){
                    onlyArray=[];
                    return  null ;
                }
                 for(var i=0;i<onlyArray.length;i++){
                     var  onlyItem =onlyArray[i];
                      var CodeId=rowEntity.AREA_ID;
                      var  NameCnId =rowEntity.AREA_NAME_CN;
                      if(onlyItem.AREA_ID  ==  CodeId ){
                          return   i;
                      }
                     if(onlyItem.AREA_NAME_CN  ==  NameCnId){
                         return   i;
                     }
                        return  null;
                 }
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
                    if(dirtyRowData.length != 0){
                        var datau = {
                            "batchMTC": dirtyRowData
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "update", "POST", datau).then(
                            function (datas) {
                                Notification.success({ message:transervice.tran(datas.message), delay: 5000 });
                                dirtyRowData.length=0;
                                $scope.init();
                            }
                        );
                    }
                    //批量新增开始
                    if(dataArray.length  != 0){
                        var   dataSoure={
                            "batchMTC":dataArray
                        };
                        httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "create", "POST", dataSoure).then(
                            function (datas) {
                                    Notification.success({ message: transervice.tran(datas.message), delay: 5000 });
                                    //清空添加的数组
                                    dataArray.length=0;
                                    $scope.init();
                            }
                        );
                    }
                }
            };
            //被删除的组织编码
         //  $scope.organisation_codes=[];
            //模拟新增的models
            $scope.addModels=[];
            $scope.init=function () {
                var    partnerDropList=[];
                var searchData =$scope.searchCondition;
                 //下拉框数据    start
                var stateList = commonService.getDicList("STATE");
                var rowEntity = {
                    "fieldDataObjectMap":{
                        "CLASSIFY_STATE":{
                            "list":stateList
                        }
                    }
                };
                $scope.rowEntity = rowEntity;

                 // 下拉框数据    end
                if(searchData!=null){
                    var  datam={

                        "having":["or",["like","CLASSIFY_NAME_CN",searchData],["like","CLASSIFY_NAME_CN",searchData]]
                    };
                }else {
                    var  datam={
                    };
                }
                httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "index", "POST", datam).then(
                    function (datas) {
                        datase=$scope.addModels.concat(datas.data);
                        $scope.gridOptions.totalItems=datase.length;
                        $scope.gridOptions.data = getSubList(datas.data);
                        angular.forEach($scope.gridOptions.data,function(object,index){
                            object.rowEntity = $scope.rowEntity;
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

            //删除数据
            $scope.del=function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if(!rows.length){
                   return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                return $confirm({ text: transervice.tran('是否确认删除') })
                    .then(function () {
                        var myArray=new Array()
                        var myArrayNot = new Array();
                        var  mysavede=new  Array();   //添加时    删除数组里面的值
                        var updatelist=new Array();     //更新时发生的修改
                        for(var i=0;i<rows.length;i++){
                            if(rows[i]["CLASSIFY_ID"] == null){
                                myArrayNot[i] = rows[i];  //同时删除 数组里面的值
                                var  idsdata={
                                    "ids":rows[i]["ids"]
                                }
                                mysavede.push(idsdata);    //保存
                            }else{
                                var areaIdData={
                                    "AREA_ID":rows[i]["CLASSIFY_ID"]
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
                                        if(updatelist[i]["CLASSIFY_ID"]==dirtyRowData[j]["CLASSIFY_ID"]){
                                            dirtyRowData.splice(j,1);
                                        }
                                    }
                                }
                            }
                        }
                        if (myArrayNot.length > 0) {
                            for (var i = 0; i < myArrayNot.length; i++) {
                                for (var j = 0; j < dataRow.length; j++) {
                                    if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
                                        $scope.gridOptions.data.splice(j, 1);
                                        mysavede.length=0;
                                        updatelist.length=0;
                                        break;
                                    }
                                }
                            }
                        }
                        if(myArray.length > 0){
                            var deleteRowModel = {
                                "batch": myArray
                            };
                            httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "delete", "POST", deleteRowModel).then(
                                function (datas) {
                                    Notification.success({ message: transervice.tran('删除成功'), delay: 5000 });
                                    $scope.gridApi.selection.clearSelectedRows();
                                    $scope.init();
                                }
                            );
                        }
                       // $scope.init();
                    });
            };
            //设置组织隶属关系
            $scope.search=function(){
                $scope.gridOptions.paginationCurrentPage=1;
                $scope.init();
            }

        }]
});
