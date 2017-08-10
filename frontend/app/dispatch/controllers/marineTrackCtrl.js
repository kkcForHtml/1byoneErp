define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/Services/commonService',
    'app/common/Services/gridDefaultOptionsService',
    'app/common/directives/singleSelectDirt',
  	'app/dispatch/directives/h-grid-respond',
    'app/dispatch/filters/commonFilter',
    'app/common/Services/messageService'

], function () {
    return   function ($scope, $q,$confirm, Notification, $filter,httpService, transervice, uiGridConstants,commonService,gridDefaultOptionsService,$state,$compile,messageService) {


        //初始化配置数据
        $scope.SEARCH_COMMON='';
        $scope.search = {
        	startPLAN_AT:'',
        	startPLAN_AT:'',
        	startACTUAL_SHIPM_AT:getYTT(-90),
        	endACTUAL_SHIPM_AT:'',
        	startEXPECTED_SERVICE_AT:'',
        	endEXPECTED_SERVICE_AT:'',
        	startACTUAL_SERVICE_AT:'',
        	endACTUAL_SERVICE_AT:'',
        	PLAN_STATE:'',
        	TRANSPORT_MODE:'',
        	CNUMBER:'',
        	CABINET_NO:''
        }
        //清除
        $scope.clearSearch = function () {
        	var initialization = {
	        	startPLAN_AT:'',
	        	endPLAN_AT:'',
	        	startACTUAL_SHIPM_AT:'',
	        	endACTUAL_SHIPM_AT:'',
	        	startEXPECTED_SERVICE_AT:'',
	        	endEXPECTED_SERVICE_AT:'',
	        	startACTUAL_SERVICE_AT:'',
	        	endACTUAL_SERVICE_AT:'',
	        	PLAN_STATE:'',
	        	TRANSPORT_MODE:'',
	        	CNUMBER:'',
	        	CABINET_NO:''
        	};
        	this.search = angular.copy(initialization);
        }
		//分页
			$scope.gridOptions = {
				columnDefs: [
				],
				enablePagination: true, //是否分页，默认为true
				enablePaginationControls: true,
				enableGridMenu: false, //是否使用菜单
				showColumnFooter: true,
//				paginationPageSizes: [10,15,20], //每页显示个数可选项
				//paginationPageSize: 15, //每页显示个数

				//---------------api---------------------
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;
					//分页按钮事件
					gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
						if(getPage) {
							getPage(newPage, pageSize);
						}
					});
				}
			};
			gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
			$scope.gridOptions.data = [];
            //页码改变时触发方法
            function getPage(currentPage,pageSize){
                init($scope.isInit,currentPage,pageSize,function () {
	                $('.in').removeClass('in');
	                $('.fa-minus').removeClass('fa-minus');
	                $('.edit').removeClass('edit');           	
                });
            }

       	var $p = $q.defer();
 		$scope.model = [];
 		$scope.isInit = true;
        function init (flag,currentPage, pageSize,fn) {
        	var search_data = angular.copy($scope.search),
	        	search_common = $scope.SEARCH_COMMON,
	        	pageTotals = pageSize || 15;

	        	var  searchConditions = flag?{
					"distinct":1,
					"where": ["and",["<>","DELETED_STATE","1"],["<>","PLAN_STATE","2"]],
					"joinwith": ["o_organisation","b_channel","sh_tracking_detail","b_warehouse"],
					"limit":$scope.gridOptions.paginationPageSize,
					"andfilterwhere":[
						"and",
					     [">","ACTUAL_SHIPM_AT",changeTime($scope.search.startACTUAL_SHIPM_AT,'start')],
					     ["<","ACTUAL_SHIPM_AT",""]						
					]
	        		
	        	}:{
					"distinct":1,
					"limit":$scope.gridOptions.paginationPageSize,
					"where": ["<>","DELETED_STATE","1"],
					"joinwith": ["o_organisation","b_channel","sh_tracking_detail","b_warehouse"],
					"andfilterwhere": [
						"and",
						[
						    "or",
						    ["like","o_organisation.ORGANISATION_NAME_CN"].concat([search_common]),
						    //["like","CABINET_NO",search_common], 
						    ["like","sh_tracking.TRACK_NO",search_common],
//						    ["like","CNUMBER",search_common],
						    // ["like","bac.AREA_NAME_CN",search_common],
						    ["like","sh_tracking_detail.PSKU_CODE",search_common],
						    ["like","sh_tracking_detail.PU_ORDER_CD",search_common]
						],
						[
							"and",
							 [">","PLAN_AT",changeTime(search_data.startPLAN_AT,'start')],
							 ["<","PLAN_AT",changeTime(search_data.endPLAN_AT)],					     
							 [">","ACTUAL_SHIPM_AT",changeTime(search_data.startACTUAL_SHIPM_AT,'start')],
							 ["<","ACTUAL_SHIPM_AT",changeTime(search_data.endACTUAL_SHIPM_AT)],					     
							 [">","EXPECTED_SERVICE_AT",changeTime(search_data.startEXPECTED_SERVICE_AT,'start')],
							 ["<","EXPECTED_SERVICE_AT",changeTime(search_data.endEXPECTED_SERVICE_AT)],					     
							 [">","ACTUAL_SERVICE_AT",changeTime(search_data.startACTUAL_SERVICE_AT,'start')],
							 ["<","ACTUAL_SERVICE_AT",changeTime(search_data.endACTUAL_SERVICE_AT)],					     
							 ["=","PLAN_STATE",search_data.PLAN_STATE],
							 ["=","TRANSPORT_MODE",search_data.TRANSPORT_MODE],
							 ["=","CNUMBER",search_data.CNUMBER],
							 ['=','CABINET_NO',search_data.CABINET_NO]
						
						]
					]	
					
	        	}
	        	if (!flag) {
	        		$scope.isInit = false;
	        	}
        	httpService.httpHelper(httpService.webApi.api, "/shipment/tracking", "index?page=" + (currentPage?currentPage:1), "POST",searchConditions).then(function (data) {
        		$p.promise.then(function () {
	        		var copyModel = [];
					($scope.gridOptions.totalItems||data._meta.totalCount*1)&&($scope.gridOptions.totalItems=data._meta.totalCount);				
	        		if (data.status==200) {
	        			copyModel = data.data;
	        			for (var i=0; i<copyModel.length; i++) {
	        			
	        				var ary=[];
	        				copyModel[i].PLAN_AT = changeTimeStamp(copyModel[i].PLAN_AT);
	        				copyModel[i].ACTUAL_SHIPM_AT = changeTimeStamp(copyModel[i].ACTUAL_SHIPM_AT);
	        				copyModel[i].EXPECTED_SERVICE_AT = changeTimeStamp(copyModel[i].EXPECTED_SERVICE_AT);
	        				copyModel[i].ACTUAL_SERVICE_AT = changeTimeStamp(copyModel[i].ACTUAL_SERVICE_AT);
	        				copyModel[i].LOADING_AT = changeTimeStamp(copyModel[i].LOADING_AT);
	        				for (var j=0; j<copyModel[i].sh_tracking_detail.length; j++) {
	        					copyModel[i].sh_tracking_detail[j].ACTUALS_ERVICE_AT&&ary.push(copyModel[i].sh_tracking_detail[j].ACTUALS_ERVICE_AT*1);
	        					copyModel[i].sh_tracking_detail[j].ACTUALS_ERVICE_AT = changeTimeStamp(copyModel[i].sh_tracking_detail[j].ACTUALS_ERVICE_AT);
	        				}
	        				if (copyModel[i].PLAN_STATE==2&&ary.length) {
	        					copyModel[i].ACTUAL_SERVICE_AT = changeTimeStamp(ary.min());
	        				}
	        			}
	        			$scope.model = copyModel;
	        			$('.h-grid input[type="checkbox"]').prop('checked',false);
		                $('.in:has(table)').removeClass('in');
		                $('.fa-minus').removeClass('fa-minus');
		                $('.edit').removeClass('edit');                	
	        			//if(!copyModel.length) return Notification.error(transervice.tran(messageService.error_information_empty));	 
	        		}
        			
        		})
        	},function (data) {
        		Notification.error(transervice.tran(data.message));
        	})
        }        		
		init(true,1);
		
		function changeTime (n,flag) {
			return typeof n!==undefined&&n?flag=='start'?new Date(n+' 00:00:00').getTime()/1000:new Date(n+' 23:59:59').getTime()/1000:n;
		}
		Date.prototype.format = function(fmt) { 
		     var o = { 
		        "M+" : this.getMonth()+1,                 //月份 
		        "d+" : this.getDate(),                    //日 
		        "h+" : this.getHours(),                   //小时 
		        "m+" : this.getMinutes(),                 //分 
		        "s+" : this.getSeconds(),                 //秒 
		        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
		        "S"  : this.getMilliseconds()             //毫秒 
		    }; 
		    if (typeof fmt !=undefined&&fmt) {
			    if(/(y+)/.test(fmt)) {
			            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
			    }
			     for(var k in o) {
			        if(new RegExp("("+ k +")").test(fmt)){
			             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
			         }
			     }
		    	
		    }
		    return fmt; 
		}
		function changeTimeStamp (n) {
			return typeof n!=undefined&&n?new Date(Number(n)*1000).format('yyyy-MM-dd'):n;
		}
		//数组取最小值
		Array.prototype.min = function () {
			return Math.min.apply({},this);
		}
		//获取距离今天天数年月日
		function getYTT (AddDayCount) {
			var dd = new Date(); 
			dd.setDate(dd.getDate()+AddDayCount);
			var y = dd.getFullYear(); 
			var m = dd.getMonth()+1;
			var d = dd.getDate(); 
			return y+"-"+m+"-"+d; 
		}
		
		//保存
		$scope.modify = function () {
			var ary_select = [],modify_data=[];
			$('.dis input').each(function (index,ele) {
				var $tr = $(ele).parents('tr');
				($tr.hasClass('edit')||$tr.next().find('.edit').length)&&ary_select.push(index);
			})
			//console.log(ary_select);
			if(!ary_select.length) return Notification.error(transervice.tran(messageService.error_choose_n));
			for (var i=0; i<ary_select.length; i++) {
				modify_data.push(angular.copy($scope.model[ary_select[i]]));
			};
			//console.log(modify_data);
			for (var i=0; i<modify_data.length; i++) {
				var obj = modify_data[i];
				obj.PLAN_AT = changeTime(obj.PLAN_AT);
				obj.ACTUAL_SHIPM_AT = changeTime(obj.ACTUAL_SHIPM_AT)
				obj.EXPECTED_SERVICE_AT = changeTime(obj.EXPECTED_SERVICE_AT);
				obj.ACTUAL_SERVICE_AT = changeTime(obj.ACTUAL_SERVICE_AT);
				obj.LOADING_AT = changeTime(obj.LOADING_AT);
				for (var j=0; j<modify_data[i].sh_tracking_detail.length; j++) {
					modify_data[i].sh_tracking_detail[j].ACTUALS_ERVICE_AT = changeTime(modify_data[i].sh_tracking_detail[j].ACTUALS_ERVICE_AT);
					
				};
			};
			var post_data = {
				'batchMTC':modify_data
			};
			//console.log(post_data);
			httpService.httpHelper(httpService.webApi.api, "/shipment/tracking", "update", "POST",post_data).then(function (data) {
				if (data.status==200) {
					Notification.success(transervice.tran(data.message));
					$('tr').removeClass('edit');
					return;
				}
			},function (data) {
				Notification.error(transervice.tran(data.message));	
			});
		};
		
		//模糊搜索
		$scope.searching = function () {
			$scope.gridOptions.paginationCurrentPage = 1;
			init(false);		
		};
		
        //展开更多条件
        $scope.showMore = function (n) {
        	var $this = $('.carett');
        	if (n) {
	        	if (!$this.hasClass('cur')) {
	        		$this.addClass('cur');
	        	}else{
	        		$this.removeClass('cur');
	        	}        		
        	}else{
        		$this.removeClass('cur');
        	}
        	
        }
		//获取币种
		!function () {
			var moneyListWhere = {
	            "where": ["and",["<>", "MONEY_STATE", 0]]
	        }
	        httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", moneyListWhere).then(function (result) {
	                if (result != null && result.status == 200) {
	                    var  moneyList = result.data;
	                    $scope.moneyList = moneyList;
	                    $p.resolve();
	                }
	            }
	        ); 	
		}();		
		$scope.changeMoney = function (n) {
			if (n) {				
				return $scope.moneyList.filter(obj=>obj.MONEY_ID==n)[0].MONEY_NAME_CN;				
			}
			return '';
		}

           
    }
});




