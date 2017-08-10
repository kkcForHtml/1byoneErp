define(
	[  'angularAMD',
		'app/common/Services/AmHttp',
	],
	function(angularAMD) {
		angularAMD.service(
			'Buddylist_edit',
			function($q, $modal) {
				this.showDialog = function(model) {
					return $modal
						.open({
							animation : true,
							controller : "Buddylist_edit",
							backdrop:"static",
							size:"llg",//lg,sm,md,llg,ssm
							templateUrl : 'app/cooperativePartner/buddyList/views/Buddylist_edit.html?ver='+_version_,
							resolve : {
								model : function() {
									return model;
								}
							}
						}).result;
				};
			}
		);
		angularAMD.controller("Buddylist_edit",function( $q,$scope,amHttp,$confirm,model,$modalInstance,httpService,Notification,transervice,commonService){

			if(model){
				$scope.isAdd=false;
				$scope.model=angular.copy(model);
				$scope.model.AREA_ID=$scope.model.AREA_ID;
				$scope.PARTNER_ID=$scope.model.PARTNER_ID;
			}else{
              	$scope.isAdd=true;
				$scope.PARTNER_ID=0;
				$scope.model={
					PARTNER_STATE : '1',
					PARTNER_DECLARE : '1',
					PARTNER_CODE: "",                                   //伙伴编码
					PARTNER_NAME_CN: "",                             //伙伴名称
					PARTNER_ANAME_CN: "",                               //简称
                    CLASSIFY_ID: "",                                  //伙伴分类
                    MONEY_ID: "",                                     //默认币种
					D_VALUE: "",                                       //货物所属
					D_VALUES: "",                                      //是否启用
                    AREA_ID:"",                                      //国家
					PARTNER_ADDRESS:"",                                //详细地址
					SMETHOD:"" ,                                       //结算方式
					PARTNER_LEGAL:"",                                 //法人代表
					BUSINESS_LICENCE:"",                             //营业执照注册号
					TAXPAYER_REGIST_CERTIFICATE:"",              //税务登记号
					TAX_RATE:"",                                //税率
					ACCOUNT_NAME:"",                         //户名
					OPEN_ACCOUNT_BANK:"",                    //开户行
					BANK_ACCOUNT:""                        //   银行账号
				}
			}
			var   dataArray=[];
			var  dirtyRowData=[];
			var  checkboxs=[];   //保存勾选的代码
			//伙伴分类列表
			var selectPartnerWhere = {"where":["and",["=","CLASSIFY_STATE",1]]};
			httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "index", "POST",selectPartnerWhere).then(
				function (result){
					if(result!= null && result.status == 200){
						$scope.areaList=result.data;
					}
				}
			);

			/**货币货币列表**/
			 var    selectMoneyWhere ={"where":["and",["=","MONEY_STATE",1]]};
			httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST",selectMoneyWhere).then(
				function (result){
					if(result!= null && result.status == 200){
						$scope.moneyList=result.data;
					}
				}
			);
           /**货物所属    strt **/
			var stateListPa = commonService.getDicList("PARTNER");
			$scope.GoodsList=stateListPa

			//USD厂家是否报关
			var stateListSta = commonService.getDicList("STATE");
			$scope.usdlist=stateListSta;

			/**是否启用**/
			/*var   selectEnableWhere ={"where":["and",["=","D_GROUP","STATE"],["=","D_STATE",1]]};
			httpService.httpHelper(httpService.webApi.api, "common/base/dictionary", "index", "POST",selectEnableWhere).then(
				function (result){
					if(result!= null && result.status == 200){
						$scope.enableList=result.data;
					}
				}
			);*/
			var stateListStas = commonService.getDicList("STATE");
			$scope.enableList=stateListStas;
			//结算方式
			var seettledata = commonService.getDicList("PARTNER_SMETHOD");
			$scope.settlementList=seettledata;




			//国家列表
				var selectCountryWhere = {
					"where":["and",["<>","AREA_FID","0"]]
				};
				httpService.httpHelper(httpService.webApi.api, "master/basics/area", "index", "POST",selectCountryWhere).then(
					function (result){
						if(result!= null && result.status == 200){
							$scope.countryList=result.data;
						}
					}
				);
			//取消操作
			$scope.cancel = function () {
				$modalInstance.dismiss(false);
			};

			//保存操作
			$scope.save = function () {
				if ($scope.model.PARTNER_CODE == '') {
					return Notification.error('伙伴编码不能为空');
				}
				if ($scope.model.PARTNER_NAME_CN == '') {
					return Notification.error('伙伴名称不能为空');
				}
				if ($scope.model.CLASSIFY_ID == '') {
					return Notification.error('伙伴分类不能为空');
				}
				if ($scope.model.MONEY_ID == '') {
						return Notification.error('默认币种不能为空');
				}

				if ($scope.isAdd == true) {   //新增时
					httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "create", "POST", $scope.model).then(
						function (result) {
								var dafaultsoure = [];
								dafaultsoure = $scope.gridOptions.data;
								for (var i = 0; i < dafaultsoure.length; i++) {
									var object = dafaultsoure[i];
									if (object.checked == true) {
										var souse = {
											"CONTACT_ID": object.CONTACT_ID,
											"DEFAULTS": 1
										};
										checkboxs.push(souse);
									} else {
										var souse = {
											"CONTACT_ID": object.CONTACT_ID,
											"DEFAULTS": 0
										};
										checkboxs.push(souse);
									}
								}
							    /*
								if (checkboxs.length != 0) {   //勾取修改
									var checkdate = {
										"batchMTC": checkboxs
									};
									httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "update", "POST", checkdate).then(
										function (data) {
											Notification.success(result.message);
										}
									);
								*/
								//勾取结束
								//修改开始
								if (dataArray.length != 0) {
									/* for(var i=0;i<dataArray.length;i++){
									 delete(dataArray[i]["ids"]);   //删除标识的ids
									 }*/
									var copy_dataArray = angular.copy(dataArray);
									angular.forEach(copy_dataArray,function(obj,index){
										obj.PARTNER_ID = result.data.PARTNER_ID;
									});
									var datam = {
										"batchMTC": copy_dataArray
									};
									httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "create", "POST", datam).then(
										function (resultdate) {
											Notification.success(result.message);
											dataArray.length = 0;
											angular.forEach(dataArray,function(obj,index){
												obj.PARTNER_ID = data.data[0]['PARTNER_ID'];
											});
										}
									);
								}
								//修改结束
								Notification.success({message: result.message, delay: 2000});
								$modalInstance.close();//返回数据

						});
				} else {
					$scope.model.edit_type = "update";
					httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "update?id=" + parseInt($scope.PARTNER_ID), "POST", $scope.model).then(
						function (result) {
							if (result.status == 200) {
								//勾取修改 开始
								var dafaultsoure = [];
								dafaultsoure = $scope.gridOptions.data;
								for (var i = 0; i < dafaultsoure.length; i++) {
									var object = dafaultsoure[i];
									if (object.checked == true) {
										var souse = {
											"CONTACT_ID": object.CONTACT_ID,
											"DEFAULTS": 1
										};
										checkboxs.push(souse);
									} else {
										var souse = {
											"CONTACT_ID": object.CONTACT_ID,
											"DEFAULTS": 0
										};
										checkboxs.push(souse);
									}
								}
								if (checkboxs.length != 0) {   //勾取修改
									for (var i = 0; i < checkboxs.length; i++) {
										if (checkboxs[i]["CONTACT_ID"] == undefined || checkboxs[i]["CONTACT_ID"] == "" || checkboxs[i]["CONTACT_ID"] == null) {
											checkboxs.splice(i, 1);
										}
									}
									if (checkboxs.length != 0) {
										var checkdate = {
											"batchMTC": checkboxs
										};
										httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "update", "POST", checkdate).then(
											function (resultData) {
												Notification.success(resultData.message);
												checkboxs.length = 0;
											}
										);
									}
								}
								//勾取结束  结束
								if (dirtyRowData.length != 0) {   //修改
									var updatelist = {
										"batchMTC": dirtyRowData
									};
									httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "update", "POST", updatelist).then(
										function (resultData) {
											Notification.success(resultData.message);
											dirtyRowData.length = 0;
										});
								}
								if (dataArray.length != 0) {  //新增
									var savelist = {
										"batchMTC": dataArray
									};
									httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "create", "POST", savelist).then(
										function (resultData) {
											Notification.success(resultData.message);
											dataArray.length = 0;
										}
									);
								}

								Notification.success({message: result.message, delay: 2000});
								$modalInstance.close();//返回数据
							} else {
								Notification.error(result.message);
							}
						});
					//总修改结束
				}

			};

			//选项卡
			$scope.tabactive="sbase";
			$scope.switchTab=function(value){
				$scope.tabactive=value;
				$scope.gridApi.core.refresh();
				if($scope.tabactive=="contact"){

				}else if($scope.tabactive=="scard"){

				}
			};

			//联系人列表
			$scope.gridOptions ={
				columnDefs: [
					{ field: 'CONTACT', displayName: '联系人',enableCellEdit:true },
					{ field: 'PHONE', displayName: '手机号' ,enableCellEdit:true},
					{ field: 'TEL', displayName: '座机号码' ,enableCellEdit:true},
					{ field: 'EMAIL', displayName: 'Email',enableCellEdit:true },
					{ field: 'FAX', displayName: '传真' ,enableCellEdit:true},
					{field:'DEFAULTS',name:'name',displayName: transervice.tran('默认'),
						cellTemplate:'<input ng-model="row.entity.checked" class="styled" type="checkbox" ng-click="grid.appScope.choose(row.entity)">',
						enableCellEdit:false
					}
				],
				paginationPageSizes: [10, 20, 50],
				paginationPageSize: 20,				
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;

                    //编辑行dirty
                    if(gridApi.rowEdit)
                        gridApi.rowEdit.on.saveRow($scope, (rowEntity)=>{
                            var promise = $q.defer();
                            gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                            promise.reject();
                        });
					//行选中事件
					$scope.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
						$scope.gridApi = gridApi;
						//行选中事件
						$scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
							if (row) {
								//$scope.testRow = row.entity;
							}
						});
						gridApi.edit.on.afterCellEdit($scope, function (rowEntity) {
							if (rowEntity) {
								//$scope.gridApi.selection.selectRow(rowEntity);
							}
						});
					});
					//可编辑行开始
					gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
						if (newValue != oldValue) {
							if (newValue < 0) {
								var colEditName = colDef.field;
								rowEntity[colEditName] = 0;
								newValue = 0;
							}
							if(rowEntity.CONTACT_ID==null){   //新增
								var indexdata = $scope.indexDirtyRowSave(rowEntity, colDef);
								if (indexdata == null) {  //未找到ids
									var datas = {
										"ids": rowEntity.ids,
										"DEFAULTS":rowEntity.DEFAULTS,
										"PARTNER_ID":rowEntity.PARTNER_ID
									};
									datas[colDef.field]=newValue;
									dataArray.push(datas);
								} else {   //找到了ids
									dataArray[indexdata][colDef.field] = newValue;
								}
							}else {    //修改
								var indexDirty = $scope.indexDirtyRow(rowEntity, colDef);
								if (indexDirty == null) {
									var dirtyRow = {
										"CONTACT_ID":rowEntity.CONTACT_ID
									};
									dirtyRow[colDef.field]=newValue;
									dirtyRowData.push(dirtyRow);
								} else {   //未找到id
									dirtyRowData[indexDirty][colDef.field]=newValue;
								}
							}
						}
					});
					//可编辑行 结束
				}
				//添加编辑联系表数据
			};
			$scope.choose = function(value){
				angular.forEach($scope.gridOptions.data,function(obj){
					if(obj.CONTACT_ID !=value.CONTACT_ID){
						obj.checked = false;
					}
					if(obj.ids!=value.ids){
						obj.checked = false;
					}
				});
				if(value.ids != null  && value.ids != undefined  &&  value.ids !=  0    ){
					angular.forEach($scope.gridOptions.data,function(object){
						if(object.ids==value.ids){
							if(object.checked==true){
								object.DEFAULTS=1;
								//判断是否为添加
								  var   checkindex=$scope.checkboxSave(value.ids);
								if(checkindex==null){  //未找到ids
									var  checkdatese={
									    "ids":value.ids,
										 "DEFAULTS":1
									};
									dataArray.push(checkdatese);
								}else {  //更新 ids数据
									dataArray[checkindex]["DEFAULTS"]=1;
								}
							}else {
								object.DEFAULTS=0;
								var   checkindex=$scope.checkboxSave(value.ids);
								if(checkindex==null){  //未找到ids
									var  checkdatese={
										"ids":value.ids,
										"DEFAULTS":0
									};
									dataArray.push(checkdatese);
								}else {  //更新 ids数据
									dataArray[checkindex]["DEFAULTS"]=1;
								}
							}
						}
					});
				}
			};

			$scope.init=function () {
				var selectWhere = {};
				if($scope.isAdd==false){    //新增
					selectWhere={"where": ["and",
						["=","PARTNER_ID",$scope.model.PARTNER_ID]
					]
					};
				}

				httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "index", "POST",selectWhere).then(
					function (result){
						if(result!= null && result.status == 200){
							if($scope.isAdd==false){
								$scope.gridOptions.data = result.data;
								angular.forEach(result.data,function(obj){
									if(obj.DEFAULTS =="0"){
										obj.checked = false
									}else{
										obj.checked = true;  //保存一个 勾取的值  并保存到数组中去
									}
								});
							}else{
								$scope.gridOptions.data=[];
							}
						}
					}
				);
			};
			$scope.init();
			//编辑新增方法
			var  z=0;
			$scope.edit=function(item){
				if($scope.model.PARTNER_CODE==""  || $scope.model.PARTNER_CODE==undefined   || $scope.model.PARTNER_CODE==null   ){
					Notification.error('伙伴编码不能为空！');
					return
				}
				z++;
					 $scope.gridOptions.data.unshift({   //新增
						 "ids":z,
						 "PARTNER_ID":$scope.model.PARTNER_ID,
						 "CONTACT":null,
						 "PHONE":null,
						 "TEL":null,
						 "EMAIL":null,
						 "FAX":null,
						 "DEFAULTS":0
					 });
			};
          //新增
			$scope.checkboxSave=function(checkids){
				if(dataArray == null  || dataArray == undefined  || dataArray.length  ==0  ){
					dataArray=[];
					return  null
				}
				for(var  i=0;i<dataArray.length;i++){
					var dataItem=dataArray[i];
					if(dataItem.ids==checkids){
						return i;
					}
				}
				return null;
			};


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

			/**是否已编辑**/   //修改
			$scope.indexDirtyRow = function (rowEntity, colDef) {
				if (dirtyRowData == null || dirtyRowData == undefined || dirtyRowData.length == 0) {
					dirtyRowData = [];
					return null;
				}
				for (var i = 0; i < dirtyRowData.length; i++) {
					var dirtyItem = dirtyRowData[i];
					var olID = rowEntity.CONTACT_ID;
					if (dirtyItem.CONTACT_ID == olID) {
						return i;
					}
				}
				return null;
			};
			/**删除*/
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
							if(rows[i]["CONTACT_ID"] == null){
								myArrayNot[i] = rows[i];  //同时删除 数组里面的值
								var  idsdata={
									"ids":rows[i]["ids"]
								}
								mysavede.push(idsdata);    //保存
							}else {
								myArrayNot[i] = rows[i];  //同时删除 数组里面的值
								var areaIdData={
									"CONTACT_ID":rows[i]["CONTACT_ID"]
								};
								myArray[i]=Number(rows[i]["CONTACT_ID"]);
								updatelist.push(areaIdData);
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
										if(updatelist[i]["CONTACT_ID"]==dirtyRowData[j]["CONTACT_ID"]){
											dirtyRowData.splice(j,1);
										}
									}
								}
							}
						}

//						if (myArrayNot.length > 0) {
//							for (var i = 0; i < myArrayNot.length; i++) {
//								for (var j = 0; j < dataRow.length; j++) {
//									if (myArrayNot[i].$$hashKey == dataRow[j].$$hashKey) {
//										$scope.gridOptions.data.splice(j, 1);
//										mysavede.length=0;
//										updatelist.length=0;
//										break;
//									}
//								}
//							}
//						}
	                    var addArray = [], myArray=[];
	                    rows.forEach((obj)=>{
	                    	!obj.CONTACT_ID?addArray.push(obj):myArray.push(obj);
	                    })
		                addArray.forEach((obj)=>{
		                	$scope.gridOptions.data.splice($scope.gridOptions.data.lastIndexOf(obj), 1);
		                })


						if(myArray.length > 0){
							var datade={
								"batch":myArray,
							};
							httpService.httpHelper(httpService.webApi.api, "master/partint/partnerco", "delete", "POST", datade).then(
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
					});

			};
		});
	})
