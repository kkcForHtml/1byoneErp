/**
 * Created by admin on 2017/6/21.
 */
define([    
	'ngload!ui-notification',
	
],
    function () {
        return ['$scope','Notification', 'httpService', 'transervice', 'gridDefaultOptionsService', '$filter',
            function ($scope,Notification, httpService, transervice, gridDefaultOptionsService,$filter) {
                var now = new Date()//时间
                $scope.year = now.getFullYear();//获取当前年分;
                $scope.gridSystemsOptions = {
                    columnDefs: [
                        {
                            field: 'ORGANISATION_NAME_CN',
                            displayName: transervice.tran('法人实体'),
                            enableCellEdit: false
                        },
                        {
                            field: 'ORGANISATION_STATE',
                            displayName: transervice.tran('启用'),
                            enableCellEdit: false,
                            cellTemplate: '<label ng-if="row.entity.accountingperiod==null">否</label>' +
                            '<label ng-if="row.entity.accountingperiod != null">是</label>'
                        }

                    ],
                    enablePagination: true, //是否分页，默认为true
                    enablePaginationControls: true,//使用默认的底部分页
                    multiSelect: false,


                };
                gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridSystemsOptions);

                //行选中事件
                $scope.gridSystemsOptions.getGridApi=function(gridApis){
                    $scope.gridApis = gridApis;
                    //分页按钮事件
                    gridApis.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    gridApis.selection.on.rowSelectionChanged($scope,function(row,event){
                        //$scope.leap();

                    });
                }

                $scope.gridPermissionsOptions = {
                    columnDefs: [
                        {field: 'ACCOUNTING_PERIOD', displayName: transervice.tran('期间'), enableCellEdit: false},
                        {
                            field: 'START_AT',
                            displayName: transervice.tran('开始时间'),
                            type: 'date',
                            cellFilter: "date:'yyyy-MM-dd'",
                            cellFilter: "dirtyFilter:row:col",
                            editableCellTemplate:'<div  id="f{{grid.appScope.gridPermissionsOptions.data.indexOf(row.entity)}}{{grid.appScope.gridPermissionsOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'" ng-change="grid.appScope.refreshCheckBox()"  ng-model="row.entity.START_AT"></div>',
                        },
                        {
                            field: 'END_AT',
                            displayName: transervice.tran('结束时间'),
                            type: 'date',
                            cellFilter: "date:'yyyy-MM-dd'",
                            cellFilter: "dirtyFilter:row:col",
                            editableCellTemplate:'<div  id="f{{grid.appScope.gridPermissionsOptions.data.indexOf(row.entity)}}{{grid.appScope.gridPermissionsOptions.columnDefs.indexOf(col.colDef)}}"> <input input-blur class="form-control input-sm" kendo-date-time-picker  k-format="\'yyyy-MM-dd\'"  ng-model="row.entity.END_AT"></div>',
                        },
                    ],
                    enablePagination: false, //是否分页，默认为true
                    enablePaginationControls: false, //使用默认的底部分页

                    onRegisterApi: function (gridApi) {
                        //$scope.gridApis = gridApi;
                        $scope.gridPermissionsOptions.gridApi=gridApi;
                    }
                };
                gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridPermissionsOptions);

                /**
                 * 查询所有已定义的实体法人
                 * @param where
                 */

                function search(){
	                var selectWhere = {
                        "where": ["=", "ORGANISATION_ACCOUNTING", 1],    //法人实体
                        "andWhere": ["=", "ORGANISATION_STATE", 1],    //启用
	                    "limit": $scope.gridSystemsOptions.paginationPageSize
	                };
                	
                    httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index?page="+$scope.gridSystemsOptions.paginationCurrentPage, "POST", selectWhere).then(function (datas) {
                        $scope.gridSystemsOptions.data = [];
                        if (datas.data.length > 0) {
                             datas._meta.totalCount*1&&($scope.gridSystemsOptions.totalItems = datas._meta.totalCount);
                            $scope.gridSystemsOptions.data = datas.data;
                           //$scope.ngclick();
                            $scope.leap();
                        }
                    });
                }


                //var datam = {
                //    "where": ["and", ["=", "o_organisation_relation_middle.ENTITY_STATE", 1], ["=", "o_organisation_relation_middle.FUNCTION_ID", 2],
                //        ["and", ["=", "o_organisation.ORGANISATION_STATE", 1]]],
                //    "joinwith": ["o_organisation","accountingperiod"]
                //};
                //
                //function search() {
                //    httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index?page=" + $scope.gridSystemsOptions.paginationCurrentPage, "POST", datam).then(function (datas) {
                //        $scope.gridSystemsOptions.data = [];
                //        if (datas.data.length > 0) {
                //            $scope.gridSystemsOptions.totalItems = datas._meta.totalCount;
                //            $scope.gridSystemsOptions.data = datas.data;
                //        }
                //    })
                //}

                //页码改变时触发方法
                function getPage(currentPage, pageSize) {
                    search(currentPage, pageSize);
                }

                $scope.ngclick = function () {
                    //var checkRows = $scope.gridApis.selection.getSelectedRows();
                    //if(checkRows.length > 0){
                    //    if(checkRows[0].accountingperiod != null){
                    //        return;
                    //    }
                    //}
                    
                    var year = $scope.year;
                    var now = new Date()//时间
                    var open;//开始时间
                    var end;//结束时间
                    var day;//天
                    //var ;//月
                    var num;//期数
                    var arr = new Array();


                    if (!year) {
                        year = now.getFullYear();//获取当前年分
                    }

                    //判断是否是闰年的计算方式
                    var cond1 = year % 4 == 0;
                    var cond2 = year % 100 != 0;
                    var cond3 = year % 400 == 0;

                    for (var i = 1; i <= 12; i++) {
                        num = "第" + [i] + "期";
                        if(i<10){
                            open = year + "-0" + i + "-" + "01";
                        }else{
                            open = year + "-" + i + "-" + "01";
                        }
                        if (i == 2) {
                            //判断闰年
                            if (cond1 && cond2 || cond3) {
                                day = 29;
                            } else {
                                day = 28;
                            }
                            //end = year + "-" + i + "-" + day;
                        }
                        //判断大月
                        if (i == 1 || i == 3 || i == 5 || i == 7 || i == 8 || i == 10 || i == 12) {
                            day = 31;
                            //end = year + "-" + i + "-" + day;
                        }
                        //判断小月
                        if (i == 4 || i == 6 || i == 9 || i == 11) {
                            day = 30;
                        }
                        
                        if(i<10){
                            end = year + "-0" + i + "-" + day;
                        }else{
                            end = year + "-" + i + "-" + day;
                        }
                        arr.push({
                            ACCOUNTING_PERIOD: num,
                            START_AT: open,
                            END_AT: end

                        })

                    }
                    $scope.gridPermissionsOptions.data = arr;
                }
                
                $scope.refreshCheckBox = function () {
                	$('#ck').prop('checked',false);
                }
                $scope.leap = function () {
                    $scope.ngclick();
                    //判断是否需要检索数据
                    var isSerach = false;

                    var year = $scope.year;
                    //if($scope.year>1900 && $scope.year <9999){
                    //    //输入的年份合法
                    //}else{
                    //    //输入的年份不合法，直接返回
                    //    return;
                    //}

                    //if($scope.gridApis && $scope.gridApis.selection){
                        //var rowss = $scope.gridApis.selection.getSelectedRows();
                        //if(rowss.length >0 && $scope.year){
                       var codes= $scope.gridSystemsOptions.data.map(c=>c.ORGANISATION_ID);
                            var datam = {
                                "where": ["and", ["in", "ac_accounting_period.ORGANISATION_ID", codes], ["=", "ac_accounting_period.YEARS", $scope.year]],
                                groupby:["ORGANISATION_ID"]
                            };

                            httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "index?page=1", "POST", datam).then(function (datas) {
                                if (datas.data.length > 0) {
                                    //$scope.gridPermissionsOptions.data = [];
                                    isSerach = true;
                                    var list = new Array();
                                    angular.forEach(datas.data, function (obj) {
                                        obj.ACCOUNTING_PERIOD = '第'+obj.ACCOUNTING_PERIOD+'期';
                                        obj.START_AT =  $filter("date")(obj.START_AT*1000, "yyyy-MM-dd");
                                        obj.END_AT =  $filter("date")(obj.END_AT*1000, "yyyy-MM-dd");
                                        list.push(obj);
                                        for(var i=0;i<$scope.gridSystemsOptions.data.length;i++){
                                            var org=$scope.gridSystemsOptions.data[i];
                                            if(org.ORGANISATION_ID==obj.ORGANISATION_ID){
                                                org.accountingperiod=obj;
                                                flag=true;
                                                break;
                                            }
                                        }

                                     });

                                    var cos1=datas.data.map(a=> a.ORGANISATION_ID);
                                    var ors=$scope.gridSystemsOptions.data.filter(o=> cos1.indexOf(o.ORGANISATION_ID)==-1);
                                    ors.forEach(o=> o.accountingperiod=null);

                                    $scope.gridPermissionsOptions.totalItems = datas._meta.totalCount;
                                    //$scope.gridPermissionsOptions.data = list;
                                }else{
                                    $scope.gridSystemsOptions.data.forEach(o=> o.accountingperiod=null);
                                }
                            })
                        //}
                    //}

                    //需要检索数据的时候，右边grid显示的是数据库的内容
                    if(isSerach){
                        return;
                    }

                    var now = new Date()//时间
                    var open;//开始时间
                    var end;//结束时间
                    var day;//天
                    //var ;//月
                    var num;//期数
                    var arr = new Array();


                    if (!year) {
                        year = now.getFullYear();//获取当前年分
                    }

                    //判断是否是闰年的计算方式
                    var cond1 = year % 4 == 0;
                    var cond2 = year % 100 != 0;
                    var cond3 = year % 400 == 0;

                    for (var i = 1; i <= 12; i++) {
                        num = "第" + [i] + "期";
                        if(i<10){
                            open = year + "-0" + i + "-" + "01";
                        }else{
                            open = year + "-" + i + "-" + "01";
                        }
                        if (i == 2) {
                            //判断闰年
                            if (cond1 && cond2 || cond3) {
                                day = 29;
                            } else {
                                day = 28;
                            }
                            //end = year + "-" + i + "-" + day;
                        }
                        //判断大月
                        if (i == 1 || i == 3 || i == 5 || i == 7 || i == 8 || i == 10 || i == 12) {
                            day = 31;
                            //end = year + "-" + i + "-" + day;
                        }
                        //判断小月
                        if (i == 4 || i == 6 || i == 9 || i == 11) {
                            day = 30;
                        }
                        
                        if(i<10){
                            end = year + "-0" + i + "-" + day;
                        }else{
                            end = year + "-" + i + "-" + day;
                        }
                        arr.push({
                            ACCOUNTING_PERIOD: num,
                            START_AT: open,
                            END_AT: end

                        })

                    }
                    $scope.gridPermissionsOptions.data = arr;
                };

                search();


                //启动
                $scope.start =    function () {
                    var checkRows = $scope.gridApis.selection.getSelectedRows();
                    if(checkRows.length ==0){
                        Notification.error(transervice.tran('请先选择法人实体！'));
                        return;
                    }
                    
                    if($scope.year>1900 && $scope.year <9999){
                    }else{
                        //输入的年份不合法，直接返回
                        Notification.error(transervice.tran('请输入正确的年度！'));
                        return;
                    }
                    
                    if(checkRows[0].accountingperiod != null){
                        Notification.error(transervice.tran('已启用的法人实体不能重复启用！'));
                        return;
                    }
                        
                    var rows = $scope.gridPermissionsOptions.data;

                    if (!rows.length) {
                        return Notification.error(transervice.tran('会计区间无数据，无法进行启动！'));
                    }

                    $scope.startArray = new Array();

                    angular.forEach(rows, function (obj) {
                        $scope.rowObj = new Object();

                        $scope.rowObj.ORGANISATION_ID = checkRows[0].ORGANISATION_ID;
                        $scope.rowObj.YEARS = $scope.year;
                        $scope.rowObj.ACCOUNTING_PERIOD = obj.ACCOUNTING_PERIOD.replace("第","").replace("期","");
                        $scope.rowObj.ACCOUNTING_STATE = 1;
                        
                        var formatDate = new Date(obj.START_AT.replace(/-/g, '/')).getTime();
                        var START_AT = Math.round(formatDate/1000);

                        $scope.rowObj.START_AT = START_AT;

                        var formatDates = new Date(obj.END_AT.replace(/-/g, '/')).getTime();
                        var END_AT = Math.round(formatDates/1000);

                        $scope.rowObj.END_AT = END_AT;
                       
                        $scope.rowObj.DELETED_STATE = 0;

                        $scope.startArray.push($scope.rowObj);
                    });

                    var startRows = {
                        "batch": $scope.startArray

                    };
                    httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod","create", "POST", startRows).then(function (datas) {
                        Notification.success(transervice.tran('启动成功'));
                        search();
                        //$scope.leap();

                    });
                }
            }
        ]
    })
;