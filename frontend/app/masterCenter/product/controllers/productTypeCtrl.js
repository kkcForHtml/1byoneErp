define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/Services/configService'

], function () {
    return ['$scope', '$confirm', 'Notification', 'amHttp','httpService', 'transervice', 'uiGridConstants','$q','$interval','commonService','gridDefaultOptionsService',
        function ($scope, $confirm, Notification, amHttp,httpService, transervice, uiGridConstants,$q,$interval,commonService,gridDefaultOptionsService) {


            //状态
            $scope.states=commonService.getDicList("STATE");
            //获取状态名称
            $scope.getStateName=function (id) {
                var states=$scope.states.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            }
            $scope.gridOptions = {
                columnDefs: [
                    {
                        name: 'SYSTEM_NAME_CN',
                        displayName: transervice.tran('*产品分类名称'),
                        enableCellEdit: true
                    },
                    {
                        name: 'SYSTEM_NAMER_CN',
                        displayName: transervice.tran('产品分类全称'),
                        enableCellEditOnFocus:false,
                        enableCellEdit: false
                    },
                    {
                        name: 'SYSTEM_CLASS_FATHER',
                        displayName: transervice.tran('层级'),
                        enableCellEditOnFocus:false,
                        enableCellEdit: false
                    },
                    {
                        field: 'PRODUCT_TYPE_STATE',
                        displayName: transervice.tran('是否启用'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getStateName(row.entity.PRODUCT_TYPE_STATE)}}</div>',
                        //editableCellTemplate:'<div><form><select class="form-control input-sm" ui-grid-edit-dropdown  ng-model="row.entity.PRODUCT_TYPE_STATE" ng-options="item.D_VALUE as item.D_NAME_CN for item in grid.appScope.states" > </select></form></div>',

                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'D_VALUE',
                        editDropdownValueLabel: 'D_NAME_CN',
                        editDropdownOptionsArray: $scope.states
                    },
                    {
                        name: 'edit',
                        displayName: transervice.tran('操作'),
                        cellTemplate: '<button type="button" class="btn btn-sm btn-link" btn-per="{id:43,name:\'新增编辑\'}" ng-click="grid.appScope.addPrent(row)">{{"同级新增" | translate}}</button>' +
                                      '<button type="button" class="btn btn-sm btn-link" btn-per="{id:43,name:\'新增编辑\'}" ng-click="grid.appScope.addChild(row)" ng-if="row.entity.SYSTEM_CLASS_FATHER==1">{{"子级新增" | translate}}</button>',
                        enableCellEdit: false
                    },
                ],
                enableSorting: false, //是否排序
                onRegisterApi: function( gridApi ) {
                    $scope.gridApi = gridApi;
                    gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                        var promise = $q.defer();
                        gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                        promise.reject();
                        return promise;
                    });
                    $scope.gridApi.edit.on.beginCellEdit($scope,function (entity,ops,event) {
                        $scope.beforeName=entity[ops.name];
                        $scope.focuedElement=$(event.target)
                        $scope.focuedElement.dblclick();
                    })
                    $scope.gridApi.edit.on.afterCellEdit($scope,function (entity,ops,name) {
                        afterEdit(entity,ops,name);
                    })
                    $scope.gridApi.treeBase.on.rowExpanded($scope, function(row) {

                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                        if(row.entity.g_product_types){
                            if(row.isSelected)
                               row.entity.g_product_types.forEach(a=>$scope.gridApi.selection.selectRow(a));
                            else
                                row.entity.g_product_types.forEach(a=>$scope.gridApi.selection.unSelectRow(a));

                        }

                    });
                    //
                    //gridApi.cellNav.on.navigate($scope,function(newRowCol, oldRowCol){
                    //
                    //
                    //
                    //});
                },
                enableVerticalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
            };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);

            //编辑后触发方法
            function afterEdit(entity,ops,name) {
                if(ops.name=="SYSTEM_NAME_CN"){

                    if(entity.g_product_types)
                        for(var i=0;i<entity.g_product_types.length;i++){
                            var child=entity.g_product_types[i];
                            child.SYSTEM_NAMER_CN=name+"-"+child.SYSTEM_NAME_CN;
                        }

                    if(entity.SYSTEM_NAMER_CN.split("-").length>1) {
                        entity.SYSTEM_NAMER_CN=(entity.SYSTEM_NAMER_CN.split("-")[0]+"-"+name);
                    }else{
                        entity.SYSTEM_NAMER_CN=name;
                    }
                }



            }

            function init(){
                var dataSearch = {
                    distinct:1,
                    "where":['=','g_product_type.PRODUCTOT_TYPE_ID',0],
                    "joinwith":["g_product_types","u_userinfo","u_userinfos"],
                    orderby:"g_product_type.PRODUCT_TYPE_STATE DESC",
                };
                httpService.httpHelper(httpService.webApi.api, "master/product/prodskut","index", "POST", dataSearch).then(function (datas) {
                    $scope.gridOptions.data=[];
                    if(!datas.data.length){
                       datas.data.push(
                               {
                                   SYSTEM_NAME_CN: "默认空分类",
                                   SYSTEM_NAME_EN: "",
                                   SYSTEM_NAMER_CN: "",
                                   SYSTEM_NAMER_EN: "",
                                   SYSTEM_CLASS_FATHER: 1,
                                   HIERARCHICAL_PATH: "",
                                   $$treeLevel:0,
                                   DELETED_STATE: 0,
                                   PRODUCTOT_TYPE_ID:0,
                                   PRODUCT_TYPE_STATE:"1",
                                   g_product_types:[]

                               }
                       )
                   }
                    $scope.gridOptions.data=sortData(datas.data);
                    $scope.gridOptions.data.forEach(d=>d.copyObject=angular.copy(d));
                })
            }

            init();

            function sortData(datas){
                var items=[];
                datas.sort(function (a,b) {
                    if(a.SYSTEM_CLASS_FATHER>b.SYSTEM_CLASS_FATHER) return 1;
                    if(a.SYSTEM_CLASS_FATHER<b.SYSTEM_CLASS_FATHER) return -1;
                    return 0;
                });
                for(var i=0;i<datas.length;i++){
                    var item=datas[i];
                    item.$$treeLevel=0;
                    items.push(item);
                    items=items.concat(item.g_product_types);
                }
                return items;

            }



            //同级新增
            $scope.addPrent=function(row){
                var entity=row.entity;
                var names=entity.SYSTEM_NAMER_CN.split("-");
                var index=$.inArray(entity,$scope.gridOptions.data);
                var newItem={
                                SYSTEM_NAME_CN: "",
                                SYSTEM_NAME_EN: "",
                                SYSTEM_NAMER_CN: names.length>1?(names[0]+"-"):"",
                                SYSTEM_NAMER_EN: "",
                                SYSTEM_CLASS_FATHER: entity.SYSTEM_CLASS_FATHER,
                                PRODUCTOT_TYPE_ID: entity.PRODUCTOT_TYPE_ID,
                                HIERARCHICAL_PATH: "",
                                DELETED_STATE: 0,
                                PRODUCT_TYPE_STATE:"1"

                             }
                if(entity.$$treeLevel==0){
                    newItem.$$treeLevel=entity.$$treeLevel;
                    newItem.g_product_types=[];

                }

                if(entity.g_product_types)
                    $scope.gridOptions.data.splice(index+1+entity.g_product_types.length,0,newItem);

                else{
                    $scope.gridOptions.data.splice(index+1,0,newItem);
                    if(index>0){
                        for(i=(index-1);i>=0;i--){
                            var parent=$scope.gridOptions.data[i];
                            if(parent.$$treeLevel==0){
                                parent.g_product_types.push(newItem);
                                break;
                            }
                        }
                    }
                }

            }

            //子级新增
            $scope.addChild=function(row){
                var entity=row.entity;
                var index=$.inArray(entity,$scope.gridOptions.data);
                var newItem={
                    SYSTEM_NAME_CN: "",
                    SYSTEM_NAME_EN: "",
                    SYSTEM_NAMER_CN: entity.SYSTEM_NAME_CN+"-",
                    SYSTEM_NAMER_EN: "",
                    SYSTEM_CLASS_FATHER: 2,
                    PRODUCTOT_TYPE_ID: entity.PRODUCT_TYPE_ID,
                    HIERARCHICAL_PATH: "",
                    DELETED_STATE: 0,
                    PRODUCT_TYPE_STATE:"1",

                }

                if(entity.g_product_types){
                    $scope.gridOptions.data.splice(index+1+entity.g_product_types.length,0,newItem);
                    entity.g_product_types.push(newItem);
                    // $scope.gridApi.treeBase.expandAllRows();
                    //$scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
                    $scope.gridApi.treeBase.expandRow(row);
                }


            }


            //保存方法
            $scope.save = function () {
                var entitys = getDirtyRows($scope.gridOptions.data,[
                    'SYSTEM_NAME_CN',
                    'PRODUCT_TYPE_STATE'],"PRODUCT_TYPE_ID");
                if(!entitys.length){
                    return  Notification.error(transervice.tran('没有可新增或者修改的行'));
                }
                var childs=[];
                for(entity of entitys){
                    if(entity.g_product_types){
                        entity.g_product_types=entity.g_product_types.filter(a=>$.inArray(a,entitys)!=-1);
                        childs=childs.concat(entity.g_product_types);
                    }

                }
                entitys=entitys.filter(a=>$.inArray(a,childs)==-1);

                for(var i=0;i<entitys.length;i++){
                    var item=entitys[i];
                    if(!item.SYSTEM_NAME_CN){
                        return  Notification.error(transervice.tran('请输入产品分类名称'));
                    }
                }

                var saveData={batchMTC:entitys}
              return  httpService.httpHelper(httpService.webApi.api, "master/product/prodskut","update", "POST", saveData).then(function () {
                    Notification.success(transervice.tran('保存成功'));
                    init();
                })
            }

            //删除数据
            $scope.del=function(){
                var rows=$scope.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                var def=$q.defer();
                 $confirm({ text: transervice.tran('是否确认删除?') })
                    .then(function () {
                        var entitys=rows;
                        var noIds=entitys.filter(a=>!a.PRODUCT_TYPE_ID);
                        var hasIds=entitys.filter(a=>a.PRODUCT_TYPE_ID);
                        if(noIds.length){
                            $scope.gridOptions.data=$scope.gridOptions.data.filter(a=>$.inArray(a,noIds)==-1);
                        }
                        if(hasIds.length){
                            entitys=hasIds;
                            var datas=[];
                            entitys.forEach((a)=>{
                                datas.push(a);
                                // if(a.g_product_types){
                                //     a.g_product_types.forEach(b=>b.DELETED_STATE=1);
                                //     datas=datas.concat(a.g_product_types);
                                //     delete a.g_product_types;
                                // }
                                a.DELETED_STATE=1;
                            })
                            //var delData={batchMTC:datas};
                            var deleteRowModel = {
                                "batch": datas
                            };
                            httpService.httpHelper(httpService.webApi.api, "master/product/prodskut","delete", "POST", deleteRowModel,def).then(function () {
                                Notification.success(transervice.tran('删除成功'));
                                init();
                            })
                        }else{
                            def.resolve();
                        }

                    },function () {
                        def.resolve();
                    });
                 return def.promise;
            }



            //获取修改过的实体
            function getDirtyRows(datas,fileds,idtext) {
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

























        }]
});
