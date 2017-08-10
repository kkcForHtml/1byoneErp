define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    "app/common/Services/TranService",
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService'
], function () {
    return ['$scope', '$confirm', 'Notification', 'httpService','amHttp', 'transervice','$filter','uiGridConstants','commonService','gridDefaultOptionsService','$q',
        function ($scope, $confirm, Notification, httpService,amHttp, transervice, $filter,uiGridConstants,commonService,gridDefaultOptionsService,$q) {
            var dirtyRowData = [];
             var  dataArray=[];
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'UNIT_CODE', displayName: transervice.tran('*计量单位编码') },
                    { field: 'UNIT_NAME_CN', displayName: transervice.tran('*计量单位名称')},
                    { field: 'UNIT_SYMBOLS', displayName: '符号' },
                    { field: 'UNIT_STATE', displayName: '是否启用',editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'gridFieldFilter:row:col',
                        editDropdownIdLabel:"value",
                        editDropdownValueLabel:'name',
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.fieldDataObjectMap.UNIT_STATE.list",
                        enableCellEdit:true
                    }
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
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (newValue != oldValue) {
                            if (newValue < 0) {
                                var colEditName = colDef.field;
                                rowEntity[colEditName] = 0;
                                newValue = 0;
                            }
                              if(rowEntity.UNIT_ID  !=  null ){
                                      //开始实行修改的功能
                                     var  indexDirty =$scope.indexDirtyRow(rowEntity, colDef);
                                     if(indexDirty==null){  //未找到id 时的操作
                                         var  indeupdate={
                                             "UNIT_ID":rowEntity.UNIT_ID,
                                             "UNIT_NAME_CN":rowEntity.UNIT_NAME_CN,
                                             "UNIT_CODE":rowEntity.UNIT_CODE,
                                             "UNIT_SYMBOLS":rowEntity.UNIT_SYMBOLS,
                                         };
                                         indeupdate[colDef.field]=newValue;
                                         dirtyRowData.push(indeupdate);
                                     }else{   //找到id 更新项
                                         dirtyRowData[indexDirty][colDef.field]=newValue
                                     }

                              }else {
                                         //新增
                                 var    indexdata=$scope.indexDirtyRowSave(rowEntity, colDef);
                                       if(indexdata == null){  //未找到id 是的操作
                                            var  datase ={
                                                "ids":rowEntity.ids,
                                                "UNIT_CODE":rowEntity.UNIT_CODE,
                                                "UNIT_NAME_CN":rowEntity.UNIT_NAME_CN,
                                                "UNIT_SYMBOLS":rowEntity.UNIT_SYMBOLS,
                                                "UNIT_STATE":rowEntity.UNIT_STATE
                                            };
                                           dataArray.push(datase);
                                       }else{   //找到id  时更新项
                                           dataArray[indexdata][colDef.field]=newValue;
                                       }

                              }
                            //地区编码和 地区名称修改时做唯一性验证
                            //新增修改开始
                        }
                    });
                    //编辑行dirty
                    gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                        var promise = $q.defer();
                        gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                        promise.reject();
                    });
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            /**修改**/
            $scope.indexDirtyRow = function (rowEntity, colDef) {
                if (dirtyRowData == null || dirtyRowData == undefined || dirtyRowData.length == 0) {
                    dirtyRowData = [];
                    return null;
                }
                for (var i = 0; i < dirtyRowData.length; i++) {
                    var dirtyItem = dirtyRowData[i];
                    var olID = rowEntity.UNIT_ID;
                    if (dirtyItem.UNIT_ID == olID) {
                        return i;
                    }
                }
                return null;
            };
            /**新增**/
            $scope.indexDirtyRowSave=function(rowEntity,colDef){
                if(dataArray == null  || dataArray == undefined  || dataArray.length  ==0  ){
                    dataArray=[];
                    return  null
                }
                /**新增**/
                for(var i=0;i<dataArray.length;i++){
                    var  dataItem =dataArray[i];
                    var  olID=rowEntity.ids;
                    if(dataItem.ids==olID){      //判断是否已经是添加的行数据
                        return  i;
                    }
                }
                return   null ;
            };
            //模拟新增的models
            $scope.addModels=[];
            var companyList = [];
            var  list=[];
            $scope.init=function () {
                 //  下拉框  start
                var stateList = commonService.getDicList("STATE");
                var rowEntity = {
                    "fieldDataObjectMap":{
                        "UNIT_STATE":{
                            "list":stateList
                        }
                    }
                };
                $scope.rowEntity = rowEntity;

                //  下拉框 end
                //server  开始
                var searchData =$scope.searchCondition;
                var   datam={
                    "where":["=","DELETED_STATE",0],
                    'limit':$scope.gridOptions.paginationPageSize
                };
                 if(searchData!=null  && searchData!=undefined  ){
                     var mycars=new Array(2);
                      if(searchData.indexOf('Y')>=0){
                          mycars[0]=1;
                      }else if(searchData.indexOf('N')>=0){
                          mycars[1]=0;
                      }
                     if(searchData.indexOf('Y')>=0  &&  searchData.indexOf('N')>=0 )   {
                         mycars[0]=0;
                         mycars[1]=1;
                     }
                     datam={
                         "where":["=","DELETED_STATE",0],
                         "having":[
                             "or",["like","UNIT_CODE",searchData],
                             ["like","UNIT_NAME_CN",searchData],
                             ["like","UNIT_SYMBOLS",searchData],
                             ["in","UNIT_STATE",mycars]
                         ],
                         'limit':$scope.gridOptions.paginationPageSize
                     };
                 }
                httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "index?page="+ $scope.gridOptions.paginationCurrentPage, "POST",datam).then(
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
                        getSubList(data);
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
            //修改按钮的开始
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
                    if( dirtyRowData.length != 0){
                        var datau = {
                            "batch": dirtyRowData
                        };

                        httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "update", "POST", datau).then(
                            function (datas) {
                                if(datas.status  == 200){
                                    Notification.success({ message: "修改成功！", delay: 5000 });
                                    dirtyRowData.length=0;
                                    $scope.init();
                                }else {
                                    Notification.error({ message: datas.message, delay: 5000 });
                                }
                            }
                        );
                    }
                    if( dataArray.length  != 0){
                        var  dataSoure={
                            "batch":dataArray
                        };

                        httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "create", "POST", dataSoure).then(
                            function (datas) {
                                if(datas.status  == 200){
                                    Notification.success({ message: "新增成功！", delay: 5000 });
                                    dataArray.length=0;
                                    $scope.init();
                                }else {
                                    Notification.error({ message: datas.message, delay: 5000 });
                                }
                            }
                        );
                    }
                }

            };
            //修改按钮结束
            //编辑新增方法
            var  i=0;
            $scope.edit=function(item){
                i++;
                $scope.gridOptions.data.unshift({
                    "ids":i,
                    "UNIT_ID":null,
                    "UNIT_CODE":null,
                    "UNIT_NAME_CN":null,
                    "UNIT_SYMBOLS":null,
                     "UNIT_STATE":"1",
                       "rowEntity": $scope.rowEntity
                });
            };
            //删除数据
            $scope.del=function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                var dataRow = $scope.gridOptions.data;
                if(!rows.length){
                   return  Notification.error(transervice.tran('请选择您要删除的数据！'));
                }
                return $confirm({ text: transervice.tran('是否确认删除') })
                    .then(function () {
                        var myArray=new Array();
                        var myArrayNot = new Array();
                        var  mysavede=new  Array();   //添加时    删除数组里面的值
                        var updatelist=new Array();     //更新时发生的修改
                        for(var i=0;i<rows.length;i++){
                            if(rows[i]["UNIT_ID"] == null ){
                                myArrayNot[i] = rows[i];
                                var  idsdata={
                                    "ids":rows[i]["ids"]
                                }
                                mysavede.push(idsdata);    //保存
                            }else {
                                myArrayNot[i] = rows[i];
                                var areaIdData={
                                    "UNIT_ID":rows[i]["UNIT_ID"]
                                };
                                updatelist.push(areaIdData);
                                myArray[i]=Number(rows[i]["UNIT_ID"]);
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
                        if(dirtyRowData!=null  && dirtyRowData != undefined  && dirtyRowData.length > 0){
                            if(updatelist.length>0){
                                if(updatelist.length  > 0  ){
                                    for(var i=0;i<updatelist.length;i++){
                                        for(var j=0;j<dirtyRowData.length;j++ ){
                                            if(updatelist[i]["UNIT_ID"]==dirtyRowData[j]["UNIT_ID"]){
                                                dirtyRowData.splice(j,1);
                                            }
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
                        if(myArray.length > 0 ){
                            var datade={
                                "condition":{"where":{"UNIT_ID":myArray}},
                                "edit":{"DELETED_STATE":"1"}
                            };
                            httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "update", "POST", datade).then(
                                function (datas) {
                                    if(datas.status  == "200"){
                                        $scope.init();
                                        Notification.success({ message: datas.message, delay: 5000 });
                                    }
                                },
                                function (datas) {
                                    $scope.init();
                                    Notification.error({ message: datas.message, delay: 5000 });
                                }
                            );
                        }

                     //   $scope.init();
                    });
            };
            //设置组织隶属关系
            $scope.search=function(){
                $scope.gridOptions.paginationCurrentPage=1;
                $scope.init();
            }

        }]
});
