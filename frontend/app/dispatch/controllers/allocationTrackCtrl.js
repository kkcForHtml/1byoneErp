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
        	startESTIMATE_TRANSFER_AT:'',
        	endESTIMATE_TRANSFER_AT:'',
        	startESTIMATE_CALLOUT_AT:'',
        	endESTIMATE_CALLOUT_AT:'',
        	startACTUAL_CALLOUT_AT:'',
        	endACTUAL_CALLOUT_AT:'',
        	startACTUAL_TRANSFER_AT:'',
        	endACTUAL_TRANSFER_AT:'',        	
        	PLAN_STATE:'',
        	CNUMBER:''
        }
        //清除
        $scope.clearSearch = function () {
        	var initialization = {
	        	startESTIMATE_TRANSFER_AT:'',
	        	endESTIMATE_TRANSFER_AT:'',
	        	startESTIMATE_CALLOUT_AT:'',
	        	endESTIMATE_CALLOUT_AT:'',
	        	startACTUAL_CALLOUT_AT:'',
	        	endACTUAL_CALLOUT_AT:'',
	        	startACTUAL_TRANSFER_AT:'',
	        	endACTUAL_TRANSFER_AT:'',	        	
	        	PLAN_STATE:'',
	        	CNUMBER:''
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
				paginationPageSizes: [10,15,20], //每页显示个数可选项
				paginationPageSize: 15, //每页显示个数

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
        	var search_data = angular.copy($scope.search),search_common = $scope.SEARCH_COMMON,pageTotals = pageSize || 15;

	        	var  searchConditions = flag?{
					"distinct":1,
					"limit":$scope.gridOptions.paginationPageSize,
					"where": ["and",["<>","sh_allocation.DELETED_STATE","1"]],
					"joinwith": ["o_organisation","b_warehouse_out","b_warehouse_in","b_money_load","b_money_freight","b_money_inciden","sh_allocation_detail"],
	        		
	        	}:{
					"distinct":1,
					"limit":$scope.gridOptions.paginationPageSize,
					"where": ["<>","sh_allocation.DELETED_STATE","1"],
					"joinwith": ["o_organisation","b_warehouse_out","b_warehouse_in","b_money_load","b_money_freight","b_money_inciden","sh_allocation_detail"],
					"andfilterwhere": [
						"and",
						[
						    "or",
						    ["like","o_organisation.ORGANISATION_NAME_CN"].concat([search_common]),					    
						    ["like","TRACK_NO",search_common],
//						    ["like","CNUMBER",search_common],
						    ["like","sh_allocation_detail.PSKU_CODE",search_common],     
						    ["like","out.WAREHOUSE_NAME_CN",search_common],     
						    ["like","in.WAREHOUSE_NAME_CN",search_common],
						],
						[
							"and",
						     [">","ESTIMATE_TRANSFER_AT",changeTime(search_data.startESTIMATE_TRANSFER_AT,'start')],
						     ["<","ESTIMATE_TRANSFER_AT",changeTime(search_data.endESTIMATE_TRANSFER_AT)],					     
						     [">","ESTIMATE_CALLOUT_AT",changeTime(search_data.startESTIMATE_CALLOUT_AT,'start')],
						     ["<","ESTIMATE_CALLOUT_AT",changeTime(search_data.endESTIMATE_CALLOUT_AT)],					     
						     [">","ACTUAL_CALLOUT_AT",changeTime(search_data.startACTUAL_CALLOUT_AT,'start')],
						     ["<","ACTUAL_CALLOUT_AT",changeTime(search_data.endACTUAL_CALLOUT_AT)],
						     [">","ACTUAL_TRANSFER_AT",changeTime(search_data.startACTUAL_TRANSFER_AT,'start')],
						     ["<","ACTUAL_TRANSFER_AT",changeTime(search_data.endACTUAL_TRANSFER_AT)],					     					     
						     ["=","PLAN_STATE",search_data.PLAN_STATE],
						     ["=","CNUMBER",search_data.CNUMBER]
						
						]
					]	
	        	}
	        	if (!flag) {
	        		$scope.isInit = false;
	        	}
	        	
        	httpService.httpHelper(httpService.webApi.api, "/shipment/allocation", "index?page=" + (currentPage?currentPage:1), "POST",searchConditions).then(function (data) {
				$p.promise.then(function () {
	        		var copyModel = [];
	        		
					if ($scope.gridOptions.totalItems||data._meta.totalCount*1) {
						$scope.gridOptions.totalItems=data._meta.totalCount;
					}        		
	        		if (data.status==200) {
	        			copyModel = data.data;
	        			for (var i=0; i<copyModel.length; i++) {
	        				copyModel[i].ESTIMATE_TRANSFER_AT = changeTimeStamp(copyModel[i].ESTIMATE_TRANSFER_AT);
	        				copyModel[i].ESTIMATE_CALLOUT_AT = changeTimeStamp(copyModel[i].ESTIMATE_CALLOUT_AT);
	        				copyModel[i].ACTUAL_CALLOUT_AT = changeTimeStamp(copyModel[i].ACTUAL_CALLOUT_AT);
	        				copyModel[i].ACTUAL_TRANSFER_AT = changeTimeStamp(copyModel[i].ACTUAL_TRANSFER_AT);
	        		        			
	        			}
	        			$scope.model = angular.copy(copyModel);
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
        
		//init(true);
		
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
				obj.ESTIMATE_TRANSFER_AT = changeTime(obj.ESTIMATE_TRANSFER_AT)
				obj.ESTIMATE_CALLOUT_AT = changeTime(obj.ESTIMATE_CALLOUT_AT);
				obj.ACTUAL_CALLOUT_AT = changeTime(obj.ACTUAL_CALLOUT_AT);
				obj.ACTUAL_TRANSFER_AT = changeTime(obj.ACTUAL_TRANSFER_AT);
			};
			var post_data = {
				'batchMTC':modify_data
			};
			console.log(post_data);
			httpService.httpHelper(httpService.webApi.api, "/shipment/allocation", "update", "POST",post_data).then(function (data) {
				console.log(data);
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
	        		$('#more').animate({'height':270},200);
	        	}else{
	        		$this.removeClass('cur');
	        		$('#more').animate({'height':0},200);
	        	}        		
        	}else{
        		$this.removeClass('cur');
	        	$('#more').animate({'height':0},200);
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
		
		//获取仓库
//		!function () {
//			var selectWhere = {"where": ''};
//	        httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index", "POST", selectWhere).then(function (result) {
//	            $scope.warehouseList = result.data;
//	            if (result != null && result.status == 200) {
//	 				$scope.warehouseList = result.data;
//	            }
//	            //console.log($scope.warehouseList);
//	            
//	        });					
//		}();
		
    }
});




