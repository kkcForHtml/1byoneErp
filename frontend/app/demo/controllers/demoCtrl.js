define([
    "app/demo/dialog/controllers/editService",
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'css!styles/css/angular.treeview.css',
    'css!bowerLibs/angular-tree-dnd/dist/ng-tree-dnd.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/directives/angular.treeview',
    'kendoMultiSelectBox',
    'app/common/directives/singleSelectDirt',
    'bowerLibs/tinySelect/js/tinyselect',
    'css!bowerLibs/tinySelect/css/tinyselect.css',
    'app/common/directives/tinySelectDirt',
    'bowerLibs/common/ui-bootstrap-tpls-2.5.0',
    'app/common/directives/inputClearDirt',
    'app/common/directives/popoverDirt',
    'app/common/directives/dialogPopupDirt',
    'angular-js-xlsx',
    'app/reportQuery/inventorySales/controllers/poDetail_list_service',
    'app/reportQuery/inventorySales/controllers/dispatchOrder_list_service',
    'app/reportQuery/inventorySales/controllers/salesOrder_list_service',
    'app/demo/directives/select2-directive',
    'css!app/demo/css/select2',
    'css!app/demo/css/select2-bootstrap.css',


], function () {
    return ['$timeout','$scope', '$confirm', 'Notification', 'amHttp', 'editService', 'transervice', 'uiGridConstants', '$q','httpService','commonService','poDetail_list_service','dispatchOrder_list_service','salesOrder_list_service',
        function ($timeout,$scope, $confirm, Notification, amHttp, editService, transervice, uiGridConstants, $q,httpService,commonService,poDetail_list_service,dispatchOrder_list_service,salesOrder_list_service) {
            $scope.dynamicPopover = {
                templateUrl: 'app/demo/dialog/views/template.html',
            };

// $scope.name="longjinliang";
$scope.arr=[];

        var data = [
                { Text: "Test1", Value: "1" },
                { Text: "Test2", Value: "2" },
                { Text: "Test3", Value: "3" },
                { Text: "Test4", Value: "4" }
            ];

            $("#multiselect").kendoMultiSelectBox({
                dataTextField: "Text",
                dataValueField: "Value",
                dataSource: data
            });
            $scope.searchConditions = {
                pageNo: 1,
                pageSize: 2,
            }

            function init() {
                amHttp.get("./app/demo/controllers/datas.json").then(function (datas) {
                    $scope.totalItems = datas.length;
                    $scope.models = datas;
                    i=0;
                    $scope.models.forEach(a => {a.arr=[1,2,3,4,5];a.index=i++;});
                    $scope.gridOptions.data = $scope.models;
                })
            }
            init();

            $scope.pageChanged = function () {
                init();
            }


            /*//编辑框
            $scope.edit = function (item) {
                editService.showDialog(item).then(function (data) {
                    angular.copy(data, item);
                    console.log(data);
                })
            }*/

            /*//采购追踪
            $scope.edit = function (item) {
                poDetail_list_service.showDialog(item).then(function (data) {
                    angular.copy(data, item);
                    console.log(data);
                })
            }*/
            $scope.a1 = ["1","4","5"];
            $scope.a2 = "6";
            $scope.b1 = ["2","3"];
            $scope.c2 = "3";
            //调拨计划-调拨跟踪
            $scope.d2 = "7";
            $scope.e2 = "4";
            //厂家在产、好货
            $scope.edit = function (item) {
                var model = {
                    "sku": item.PSKU_CODE,
                    "organisation": item.ORGANISATION_CODE
                }
                poDetail_list_service.showDialog(model).then(function (data) {

                })
            }
            //空运在途FBA["1","4","5"];"6";
            $scope.fbaAir = function (item ,a,b) {
                var model = {
                    "sku": item.PSKU_CODE,
                    "organisation": item.ORGANISATION_CODE,
                    "transportMode": a,
                    "inWarehouseType": b
                }
                dispatchOrder_list_service.showDialog(model).then(function (data) {

                })
            }
            //海运在途FBA["2","3"];"6";
            $scope.fbaSea = function (item ,a,b) {
                var model = {
                    "sku": item.PSKU_CODE,
                    "organisation": item.ORGANISATION_CODE,
                    "transportMode": a,
                    "inWarehouseType": b
                }
                dispatchOrder_list_service.showDialog(model).then(function (data) {

                })
            }
            //空运在途自营["1","4","5"];"3";
            $scope.selfAir = function (item ,a,b) {
                var model = {
                    "sku": item.PSKU_CODE,
                    "organisation": item.ORGANISATION_CODE,
                    "transportMode": a,
                    "inWarehouseType": b
                }
                dispatchOrder_list_service.showDialog(model).then(function (data) {

                })
            }
            //海运在途自营["2","3"];"3";
            $scope.selfSea = function (item ,a,b) {
                var model = {
                    "sku": item.PSKU_CODE,
                    "organisation": item.ORGANISATION_CODE,
                    "transportMode": a,
                    "inWarehouseType": b
                }
                dispatchOrder_list_service.showDialog(model).then(function (data) {

                })
            }

            //发运追踪
            $scope.del = function (item) {
                dispatchOrder_list_service.showDialog(item).then(function (data) {
                    angular.copy(data, item);
                    console.log(data);
                })
            }
			//销售订单信息
			$scope.saleInformation = function (item) {
				salesOrder_list_service.showDialog(item).then(function (data) {
					angular.copy(data,item);
					console.log(data);
				})
			} 
            //弹出框

            $scope.error = function () {
                Notification.error(transervice.tran('错误'));
            }

            $scope.success = function () {
                Notification.success(transervice.tran('成功'));
            }

            $scope.confirm = function () {
                $confirm({ text: transervice.tran('是否确认删除') })
                    .then(function (data) {
                     console.log(data+"1");
                    },function (data) {
                        console.log(data+"2");
                    });
            }

           /* $scope.del = function (item) {
                $confirm({ text: transervice.tran('是否确认删除') })
                    .then(function () {
                        console.log(data+"1");
                    },function (data) {
                        console.log(data+"2");
                    });
            }*/
            $scope.flag = true;
            $scope.change = function (entity) {
                alert(entity.age);
            };

            $scope.dialog8=function () {
                $scope.dialog7={open: true};
            }
            
            $scope.changeModel=function (arr) {
                console.log(arr);
            }
            $scope.dialog7={
                open:false
            }
            $scope.gridOptions = {
                columnDefs: [
                    { field: 'name', displayName: transervice.tran('姓名'), cellClass: 'red', groupable: false, editableCellTemplate: "<input am-date ng-model='row.entity.date'>" },
                    { field: 'sex', displayName: transervice.tran('性别'), cellClass: 'red',cellTemplate:'<div ></div>' },

                    { field: 'birthday', displayName: transervice.tran('生日'), cellClass: 'red',enableCellEditOnFocus:true,editableCellTemplate: '<input class="form-control input-sm" numeric decimals="2" min="0" max="40" ng-model="row.entity.birthday">'  },
                    { field: 'age', displayName: transervice.tran('年龄'), cellClass: 'red', aggregationType: uiGridConstants.aggregationTypes.sum },
                    {
                        field: 'comment', displayName: transervice.tran('备注'),
                        cellTemplate: '<span dialog-popup    template-url="app/demo/dialog/views/template.html"   id="aaaa{{row.entity.index}}"   dialog-model="row.entity.arr" >dialog</span>',
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {

                        }
                    },
                    { 	name: 'edit', 
                    	displayName: transervice.tran('编辑'), 
                    	cellTemplate: '<button type="button" class="btn btn-link" ng-click="grid.appScope.edit(row.entity)">{{"编辑" | translate}}</button><button type="button" class="btn btn-link" ng-click="grid.appScope.del(row.entity)">{{"删除" | translate}}</button><button type="button" class="btn btn-link" ng-click="grid.appScope.saleInformation(row.entity)">{{"销售订单" | translate}}</button>' 
                    }
                ],
                rowEditWaitInterval: 1,
                enableColumnMoving: true,
                showGroupPanel: true,
                saveFocus: false,
                saveScroll: true,
                saveGroupingExpandedStates: true,
                showColumnFooter: true,
                exporterMenuCsv: true,
                enableFiltering: true,
                enableSorting: true, //是否排序
                useExternalSorting: false, //是否使用自定义排序规则
                enableGridMenu: true, //是否显示grid 菜单
                showGridFooter: true, //是否显示grid footer
                enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
                enableVerticalScrollbar: 0, //grid垂直滚动条是否显示, 0-不显示  1-显示

                //-------- 分页属性 ----------------
                enablePagination: true, //是否分页，默认为true
                enablePaginationControls: true, //使用默认的底部分页
                paginationPageSizes: [10, 15, 20], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10, //每页显示个数
                //paginationTemplate:"<div></div>", //自定义底部分页代码
                totalItems: 0, // 总数量
                useExternalPagination: true,//是否使用分页按钮
                //----------- 选中 ----------------------
                enableFooterTotalSelected: true, // 是否显示选中的总数，默认为true, 如果显示，showGridFooter 必须为true
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
            };

            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            $scope.gridOptions.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
            };

            $scope.save = function () {
                var data = $scope.gridApi.rowEdit.getDirtyRows();
            }



            $scope.treeModel = [
                { id: 1, name: "aaaa", children: [{ id: 2, name: 'bbbb' }] },
                { id: 1, name: "cccc", children: [{ id: 2, name: 'bbbb' }] },
                { id: 1, name: "dddd" }
            ]
            //树形控件属性设置
            $scope.options = {
                selectNodeLabel: function (node) {
                    if ($scope.currentNode)
                        $scope.currentNode.selected = "";
                    $scope.currentNode = node;
                    node.selected = 'selected';

                }
            }

            $scope.selectModel=2;

            $scope.dicOptions = {
                filter: "contains",
                autoBind: true,
                dataTextField: "D_NAME_CN",
                dataValueField: "D_VALUE",
                optionLabel: "请选择",
                url:httpService.webApi.api + "/common/base/dictionary/index",
                value:$scope.selectModel,
                search :{
                    where: { D_GROUP: 'ORGANISATION_RELATION' },
                    "limit": 0
                }
            };


            $scope.selectM=1;
            var accontSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        type: "POST",
                        url: httpService.webApi.api + "/common/base/dictionary/index",
                        dataType: "json"
                    }
                },
                schema: {
                    data: function(d) {
                        return d.data;
                    }
                }
            });

            $scope.accountModel = {
                filter: "contains",
                autoBind: false,
                optionLabel: "请选择",
                dataSource: accontSource,
                dataTextField: "D_NAME_CN",
                dataValueField: "D_VALUE",
                serverFiltering: true,

            };




           var params={
               where: { D_GROUP: 'ORGANISATION_RELATION' },
               "limit": 0
           };
            $scope.tinyOptions={
                textLable:'D_NAME_CN',
                valueLble:'D_VALUE',
                params:params,
                dataUrl: httpService.webApi.api + "/common/base/dictionary/index"
            }
                $scope.num=23;


         $scope.read = function (workbook) {
                /* DO SOMETHING WITH workbook HERE */
//        console.log(workbook);
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function(y) { /* iterate through sheets */
                    var worksheet = workbook.Sheets[y];
                    var XL_row_object = XLSX.utils.sheet_to_row_object_array(worksheet);
                    var json_object = JSON.stringify(XL_row_object);
//              for (z in worksheet) {
//                /* all keys that do not begin with "!" correspond to cell addresses */
//                  if(z[0] === '!') continue;
//                  console.log(y + "!" + z + "=" + JSON.stringify(worksheet[z].v));
//              }
                });
            }

            $scope.error = function (e) {
                /* DO SOMETHING WHEN ERROR IS THROWN */
                console.log(e);
            }

    $scope.config1 = {
        data: [],
        placeholder: '尚无数据'
    };

    $timeout(function () {
        $scope.config1.data = [{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
        $scope.config1.placeholder = '加载完毕'
    }, 1000);


    $scope.config2 = [
        {id: 6, text: '来自ng-repeat'},
        {id: 7, text: '来自ng-repeat'},
        {id: 8, text: '来自ng-repeat'}
    ];

    $scope.config3 = {
        data: [{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
        // 其他配置略，可以去看看内置配置中的ajax配置
    };



$scope.tt = function () {
	alert(this.a)
}
$scope.ts=  "1"
$('#a').on('click',function () {
	alert(1);
})
$scope.t = function () {
	$('#a').trigger('click')
	
}

//  $scope.totalItemss = 164;
//  $scope.currentPages = 4;
//
//  $scope.setPage = function (pageNo) {
//      $scope.currentPage = pageNo;
//  };
//
//  $scope.pageChanged = function() {
//      console.log('Page changed to: ' + $scope.currentPage);
//  };
	$scope.flip = {
		totalItems:164,
		currentPage:4,
		maxSize:5,
		setPage:function (pageNo) {
			this.currentPage = pageNo;
		},
		pageChanged:function () {
			console.log('Page changed to: ' + this.currentPage);
		}
	}



        }]
});
