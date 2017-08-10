define(['angularAMD'], function(angularAMD) {
    'use strict';
    angularAMD.service('gridDefaultOptionsService',
            function($q) {
              this.getDefaultOptions=function ($scope,options) {
                  var gridOptions = {
                      enableCellEditOnFocus:true,
                      enableColumnMoving: false,
                      rowEditWaitInterval: 1,
                      showGroupPanel: false,
                      saveFocus: false,
                      saveScroll: false,
                      saveGroupingExpandedStates: false,
                      showColumnFooter: false,
                      exporterMenuCsv: false,
                      enableFiltering: false,
                      enableSorting: false, //是否排序
                      useExternalSorting: false, //是否使用自定义排序规则
                      enableGridMenu: true, //是否显示grid 菜单
                      showGridFooter: false, //是否显示grid footer
                      enableHorizontalScrollbar: 0, //grid水平滚动条是否显示, 0-不显示  1-显示
                      enableVerticalScrollbar: 0, //grid垂直滚动条是否显示, 0-不显示  1-显示

                      //-------- 分页属性 ----------------
                      enablePagination: true, //是否分页，默认为true
                      enablePaginationControls: true, //使用默认的底部分页
                      paginationPageSizes: [10,15, 20, 50,100], //每页显示个数可选项
                      paginationCurrentPage: 1, //当前页码
                      paginationPageSize: 15, //每页显示个数,
                      totalItems:1,
                      //paginationTemplate:"<div></div>", //自定义底部分页代码
                      useExternalPagination: true,//是否使用分页按钮
                      //----------- 选中 ----------------------
                      enableFooterTotalSelected: false, // 是否显示选中的总数，默认为true, 如果显示，showGridFooter 必须为true
                      enableFullRowSelection: false, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                      enableRowHeaderSelection: true, //是否显示选中checkbox框 ,默认为true
                      enableRowSelection: true, // 行选择是否可用，默认为true;
                      enableSelectAll: true, // 选择所有checkbox是否可用，默认为true;
                      enableSelectionBatchEvent: true, //默认true
                      // isRowSelectable: function (row) { //GridRow
                      //     if (row.entity.age > 45) {
                      //         row.grid.api.selection.selectRow(row.entity); // 选中行
                      //     }
                      // },
                      modifierKeysToMultiSelect: false,//默认false,为true时只能 按ctrl或shift键进行多选, multiSelect 必须为true;
                      multiSelect: true,// 是否可以选择多个,默认为true;
                      noUnselect: false,//默认false,选中后是否可以取消选中
                      selectionRowHeaderWidth: 30,//默认30 ，设置选择列的宽度；
                      rowHeight: 30,

                      //---------------api---------------------
                      onRegisterApi: function(gridApi) {
                          if(options.getGridApi){
                              options.getGridApi(gridApi);
                          }
                          options.gridApi=gridApi;

                          //分页按钮事件
                          if(gridApi.pagination)
                          gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                              if(options.getPage) {
                                  options.getPage(newPage, pageSize);
                              }
                          });
                          //行选中事件
                          if(gridApi.selection)
                          gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                              // if(row){
                              //    // $scope.testRow = row.entity;
                              // }
                              if(options.selectRow){
                                  options.selectRow(row);
                              }

                          });

                          if(gridApi.edit)
                          gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                              if(options.afterCellEdit){
                                  options.afterCellEdit(rowEntity, colDef, newValue, oldValue);
                              }
                          });

                          //编辑行dirty
                          if(gridApi.rowEdit)
                          gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                              var promise = $q.defer();
                              gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                              promise.reject();
                          });
                      },

                  };

                  if(options){
                      angular.extend(gridOptions,options);
                      angular.extend(options,gridOptions);
                  }
              }


                this.getDirtyRows=getDirtyRows;

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
                        if(!copyData){
                            return true;
                        }
                        for(var i=0;i<fields.length;i++){
                            var f=fields[i];
                            if(copyData[f]!=data[f]){
                                return false;

                            }

                        }
                        return true;
                    }
                }

                this.refresh=function (gridOptions,PRODUCT_SKU_CODE) {
                   var  _this=gridOptions;
                    _this.data.forEach(item=>{
                        var options=item.options;
                        if(!options.search.andwhere){
                            if(item[PRODUCT_SKU_CODE]){
                                options.value=item[PRODUCT_SKU_CODE];
                                if(options.table)
                                options.search.andwhere=["=",options.table+"."+options.dataValueField,item[PRODUCT_SKU_CODE]];
                                else{
                                    options.search.andwhere=["=","g_product_sku."+options.dataValueField,item[PRODUCT_SKU_CODE]];
                                }
                            }else{
                                if(options.table)
                                options.search.andwhere=["=",options.table+"."+options.dataValueField,0];
                                else
                                    options.search.andwhere=["=","g_product_sku."+options.dataValueField,0];
                            }
                        }
                        /*if(!options.search.andwhere){
                            if(item[PRODUCT_SKU_CODE]){
                                options.value=item[PRODUCT_SKU_CODE];
                                options.search.andwhere=["=","g_product_sku.PSKU_CODE",item[PRODUCT_SKU_CODE]];
                            }else{
                                options.search.andwhere=["=","g_product_sku.PSKU_CODE",0];
                            }
                        }*/
                    })

                    _this.showDirt=true;
                    setTimeout(function () {
                        _this.showDirt=false;
                    },10)
                }

            });
})