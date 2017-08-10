define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'css!bowerLibs/bootstrap-fileinput/css/fileinput.min.css',
        'fileinput-zh',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/gridDefaultOptionsService',
        //'app/masterCenter/product/controllers/selectSupplier_service',
        "app/masterCenter/bchannel/controllers/partner_list_service",
    ],
    function (angularAMD) {

        angularAMD.service(
            'productSKU_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "productSKU_add_Ctrl",
                            backdrop: "static",
                            size: "85%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/product/views/productSKU_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("productSKU_add_Ctrl", function ($scope, $confirm, $filter, $timeout, amHttp, httpService, model, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService,partner_list_service,$q) {

            $scope.dicOptions = {
                filter: "contains",
                autoBind: true,
                dataTextField: "CSKU_CODE",
                dataValueField: "CSKU_ID",
                optionLabel: "请选择",
                url:httpService.webApi.api+"/master/product/currensku/index",//,select:['CSKU_CODE',"concat(CSKU_CODE,'-',CSKU_NAME_CN) as CSKU_NAME_CN",'PRODUCT_TYPE_PATH']
                search:{andwhere:{CSKU_ID:0}},
            };
            if(model){
                $scope.dicOptions.value=model.CSKU_NAME_CN;
                $scope.dicOptions.search.andwhere=["=","CSKU_ID",model.CSKU_ID];
            }


            //亚马逊尺寸
            $scope.amazonSizes=commonService.getDicList("PRODUCT_SKU");
            //状态
            $scope.states=commonService.getDicList("STATE");
            //仓库
            $scope.rowEntity = {channels:[],accounts:[],suppliers:[],moneys:[],wareHouses:[]};
            $scope.transports=commonService.getDicList("TRANSPORTS");
            //平台列表
            (function () {
                var selectWhere = {"limit":"0"};
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.channels_all = result.data;
                        }
                    }
                );
            })();

           //  //获取需求组织，默认采购组织
           // function getOrganizations() {
           //      var dataSearch = {
           //          "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
           //          "joinwith":["o_organisationt"]
           //      };
           //
           //      httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
           //          $scope.organizations_xuqiu=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
           //
           //      });
           //      var dataSearch1 =  {
           //          "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",2]],
           //          "joinwith":["o_organisationt"]
           //      };
           //
           //      httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch1).then(function (datas) {
           //          $scope.organizations_caigou=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
           //
           //
           //      });
           //  };
           //
           //  getOrganizations();

            $scope.options_xuqiu={
                types:[4],
                getList:function (orgList) {
                    $scope.orgList=orgList;
                },
                change:function (id,selectModel) {
                    $scope.organizations_xuqiuBlur(id,selectModel);
                }
            };

            //获取货币种类
            (function () {
                var selectWhere = {"limit":"*"};

                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(function (datas) {
                    $scope.moneys=datas.data;
                    $scope.rowEntity.moneys=datas.data;

                })
            })();

            //获取所有仓库
            (function () {
                searchData = {
                    "joinwith":["organisation","allBchannel"],
                    "distinct": 1,
                    "limit":"*"
                };

                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index" , "POST",searchData).then(
                    function (result) {
                        $scope.wareHouses_all=result.data;
                    })
            })();

            //等待完成
            function waitModel(fn1,fn2) {
                setTimeout(function () {
                    if(fn1()){
                        fn2();
                    }else{
                        waitModel(fn1,fn2);
                    }
                },100)
            }

            //需求组织改变触发方法
            $scope.ORGANISATION_ID="";
            $scope.organizations_xuqiuBlur=function (id,selectModel,notClear) {
                //code=$scope.model.ORGAN_CODE_DEMAND;
                $scope.channels=$scope.channels_all.filter(a=>a.ORGANISATION_ID==id);
                $scope.rowEntity.channels=$scope.channels;



                if($scope.gridOptions_FNSKU){
                    $scope.gridOptions_FNSKU.data.filter(d=>{
                        d.rowEntity.channels=$scope.channels;
                        d.rowEntity.accounts=[];
                        d.rowEntity.wareHouses=[];

                        if(!notClear){
                            d.CHANNEL_ID='';
                            d.ACCOUNT_ID='';
                            d.WAREHOUSE_ID='';
                        }



                    });
                }

                //获取账号数组
                if(!id){
                    return $scope.accounts=[];
                }
                if($scope.ORGANISATION_ID!=id){
                    $scope.ORGANISATION_ID=id;
                    var dataSearch = {
                        "where": ["and",["=", "ORGANISATION_ID", id]]
                    };

                    httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index", "POST", dataSearch).then(function (datas) {
                        $scope.accounts=datas.data;
                        //$scope.rowEntity.accounts=datas.data;

                    })
                }

            }


            function init() {
                $scope.model = {
                    PSKU_CODE: "",
                    ORGAN_ID_DEMAND: "",
                    ORGAN_ID_PURCHASE: "",
                    PSKU_NAME_CN: "",
                    PSKU_NAME_EN: "",
                    PRODUCT_TYPE_PATH: "",
                    UNIT_ID: 0,
                    PSKU_MOQ: null,
                    AMAZON_SIZE_ID: "1",
                    PSKU_STATE: "1",
                    UNIVERSAL_STATE:"0",
                    PSKU_REMARKS: "",
                    DELETED_STATE: 0,
                    TRANSPORT: "1",
                    bigTypeId:0,
                    smallTypeId:0,
                    g_product_sku_packing: {
                        DELETED_STATE: 0,
                        PRODUCT_LONG:"",
                        PRODUCT_WIDE:"",
                        PRODUCT_HIGH:"",
                        PRODUCT_WEIGHT:"",
                        GIFT_BOX_LONG:"",
                        GIFT_BOX_WIDE:"",
                        GIFT_BOX_HIGH:"",
                        PRODUCT_GIFT_WEIGHT:"",
                        PACKING_LONG:"",
                        PACKING_WIDE:"",
                        PACKING_HIGH:"",
                        PACKING_NUMBER:"",
                        NET_WEIGHT:"",
                        GROSS_WEIGHT:"",
                        CABINET_NUMBER:"",
                    },
                    g_product_sku_declare: {
                        DELETED_STATE: 0,
                        CUSTOMS_CODE:"",
                        UNIT_ID:0,
                        CUSTOMS_NAME:"",
                        MATERIAL:"",
                        REPORTING_ELEMENTS:"",
                        VOLTAGE:"",
                        PURPOSE:"",
                        POWER:"",
                        BATTERY_CAPACITY:"",
                        DECLARE_REMARKS:"",
                    },
                    g_product_sku_upc: [],
                    g_product_sku_fnsku: [],
                    g_product_sku_supplier: [],
                    g_product_sku_price: [],
                    g_next_cycle: {
                        DELETED_STATE: 0,
                        DELIVERY:"",
                        STOCKING:"",
                        SHELF_TIME:"",
                        TRANSPORT:"",
                        PLAN_TIME:""
                    }

                }
                if(model){
                    angular.extend($scope.model,model);

                    waitModel(function(){
                        if($scope.channels_all){
                            return true;
                        }
                        return false;
                    },function(){
                        $scope.organizations_xuqiuBlur($scope.model.ORGAN_ID_DEMAND,null,true);
                        waitModel(()=>{
                            if($scope.accounts){
                                return true;
                            }
                            return false;
                        },()=>{
                            $scope.model.g_product_sku_fnsku.forEach(f=>{
                                f.rowEntity.accounts=$scope.accounts.filter(c=>c.CHANNEL_ID==f.CHANNEL_ID);
                                f.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND&&w.CHANNEL_ID==f.CHANNEL_ID);
                            })
                        })

                        delete $scope.model.PSKU_ID;
                    })


                    delete $scope.model.PSKU_CODE;
                    //查找供应商全部数据
                    var searchCoditions={
                        where:["=","PSKU_ID",model.PSKU_ID],
                        joinwith:["pa_partner"]
                    }
                    httpService.httpHelper(httpService.webApi.api, "master/product/prodskus", "index", "POST",searchCoditions).then(function (datas) {
                        datas.data.forEach(e=>{
                            e.isSelected=false;
                            delete e.SKU_SUPPLIER_ID;
                            delete e.PRODUCT_SKU_CODE;
                            delete e.PSKU_ID;
                            if(e.DEFAULTS?parseInt(e.DEFAULTS):false){
                                e.isSelected=true;
                            }
                            $scope.rowEntity.suppliers.push(e.pa_partner);
                            e.rowEntity=$scope.rowEntity;
                        })
                        $scope.model.g_product_sku_supplier=datas.data;
                        $scope.gridOptions_supplier.data=datas.data;

                        //查找采购价格全部数据
                        searchCoditions={
                            where:["=","PSKU_ID",model.PSKU_ID],
                        }
                        httpService.httpHelper(httpService.webApi.api, "master/product/prodskupp", "index", "POST",searchCoditions).then(function (datas) {

                            datas.data.forEach(e=>{
                                delete e.PURCHASING_PRICE_ID;
                                delete e.PRODUCT_SKU_CODE;
                                delete e.PSKU_ID;
                                e.rowEntity=$scope.rowEntity;
                            })
                            $scope.model.g_product_sku_price=datas.data;
                            $scope.gridOptions_price.data=datas.data;

                        })

                    })
                }
                var   datam={
                    limit:"0"
                };
                httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "index", "POST",datam).then(
                    function (units) {
                        $scope.units=units.data;
                        $scope.units.unshift({
                            UNIT_ID:0,
                            UNIT_NAME_CN:"请选择"
                        })
                    }
                );
                var dataSearch = {
                    "where": ["=", "g_product_type.PRODUCT_TYPE_STATE", 1],
                    "andwhere":{"g_product_type.PRODUCTOT_TYPE_ID":0},
                    "joinwith":["g_product_types_2"],
                    distinct:1
                };
                httpService.httpHelper(httpService.webApi.api, "master/product/prodskut","index", "POST", dataSearch).then(function (types) {
                    $scope.types=types.data;
                    $scope.currentBigType={
                        g_product_types:[
                            {
                                PRODUCT_TYPE_ID:0,
                                SYSTEM_NAME_CN:"请选择"
                            }
                        ]
                    };
                    $scope.types.forEach(t=>{
                        t.g_product_types=t.g_product_types_2;
                        if(t.g_product_types){
                            t.g_product_types= t.g_product_types.filter(g=>g.PRODUCT_TYPE_STATE==1);
                        }
                        t.g_product_types.unshift({
                            PRODUCT_TYPE_ID:0,
                            SYSTEM_NAME_CN:"请选择"
                        })
                    })
                    $scope.types.unshift({
                        PRODUCT_TYPE_ID:0,
                        SYSTEM_NAME_CN:"请选择",
                        g_product_types:[
                            {
                                PRODUCT_TYPE_ID:0,
                                SYSTEM_NAME_CN:"请选择"
                            }
                        ]
                    })

                    if(model){
                        $scope.bigTypeChange();
                        $scope.model.smallTypeId=model.smallTypeId;
                    }


                })
            }
            init();

            //大分类改变时
            $scope.bigTypeChange=function () {
                var currentBigType=$scope.types.filter(a=>a.PRODUCT_TYPE_ID==$scope.model.bigTypeId);
                $scope.currentBigType=currentBigType[0];
                $scope.model.smallTypeId=0;
            }



            //附件上传工具初始化
            function initInputFile() {
                $scope.FinINput = true;
                $scope.FileDownShow = 'none';
                $scope.FinINputRemoveClass =  'btn btn-xs btn-default';
                $scope.PSKU_ID = 0;
                //图片信息
                angular.init($("#photofiles"), {
                    uploadExtraData :function (previewId, index) {
                        return { PRODUCT_ID :$scope.PSKU_ID, FILE_TYPE_ID :2 };
                    },
                    fileActionSettings :{ showRemove :$scope.FinINput, showZoom: false, removeClass :$scope.FinINputRemoveClass },
                    browseOnZoneClick :$scope.FinINput,
                    uploadUrl :httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "create"
                }).on('fileuploaded', function (event, data, previewId, index) {
                    $scope.count--;
                    if(!$scope.count){
                        Notification.success(transervice.tran("保存成功"))
                        $modalInstance.close();
                    }

                }).on('filebatchselected', function(event, files) {

                    var parentDom=$(event.target).parent();
                    var contentDiv=parentDom.find('.file-live-thumbs .file-preview-frame:last .kv-file-content');//选择完事件
                    var td=contentDiv.find("textarea");
                    var obj=contentDiv.find("object");
                    if(td.length||obj.length){
                        contentDiv.html('<div class="file-preview-other-frame" style="width:auto;/* height:160px; */"><div class="file-preview-other"><span class="file-icon-4x"><i class="fa fa-file-text-o text-info" style="font-size:100px"></i></span></div></div>')
                    }

                });

                //包材信息
                angular.init($("#wrapperfiles_add"), {
                    uploadExtraData :function (previewId, index) {
                        return { PRODUCT_ID :$scope.PSKU_ID, FILE_TYPE_ID :3 };
                    },
                    fileActionSettings :{ showRemove :$scope.FinINput, showZoom: false, removeClass :$scope.FinINputRemoveClass },
                    browseOnZoneClick :$scope.FinINput,
                    uploadUrl :httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "create"
                }).on('fileuploaded', function (event, data, previewId, index) {
                    $scope.count--;
                    if(!$scope.count){
                        Notification.success(transervice.tran("保存成功"))
                        $modalInstance.close();
                    }

                }).on('filebatchselected', function(event, files) {

                    var parentDom=$(event.target).parent();
                    var contentDiv=parentDom.find('.file-live-thumbs .file-preview-frame:last .kv-file-content');//选择完事件
                    var td=contentDiv.find("textarea");
                    var obj=contentDiv.find("object");
                    if(td.length||obj.length){
                        contentDiv.html('<div class="file-preview-other-frame" style="width:auto;/* height:160px; */"><div class="file-preview-other"><span class="file-icon-4x"><i class="fa fa-file-text-o text-info" style="font-size:100px"></i></span></div></div>')
                    }

                });

                //品检信息
                angular.init($("#checkedfiles_add"), {
                    uploadExtraData :function (previewId, index) {
                        return { PRODUCT_ID :$scope.PSKU_ID, FILE_TYPE_ID :4 };
                    },
                    fileActionSettings :{ showRemove :$scope.FinINput, showZoom: false, removeClass :$scope.FinINputRemoveClass },
                    browseOnZoneClick :$scope.FinINput,
                    uploadUrl :httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "create"
                }).on('fileuploaded', function (event, data, previewId, index) {
                    $scope.count--;
                    if(!$scope.count){
                        Notification.success(transervice.tran("保存成功"))
                        $modalInstance.close();
                    }

                }).on('filebatchselected', function(event, files) {

                    var parentDom=$(event.target).parent();
                    var contentDiv=parentDom.find('.file-live-thumbs .file-preview-frame:last .kv-file-content');//选择完事件
                    var td=contentDiv.find("textarea");
                    var obj=contentDiv.find("object");
                    if(td.length||obj.length){
                        contentDiv.html('<div class="file-preview-other-frame" style="width:auto;/* height:160px; */"><div class="file-preview-other"><span class="file-icon-4x"><i class="fa fa-file-text-o text-info" style="font-size:100px"></i></span></div></div>')
                    }

                });
            };



            $scope.$watch('$viewContentLoaded', function () {
                function timeout() {
                    setTimeout(function () {
                        if($("#photofiles").length)
                            initInputFile();
                        else{
                            timeout();
                        }
                    },200)
                }
                timeout();


            });

            //获取整箱体积方法
            $scope.getZxtiji=function () {
                if(!$scope.model||!$scope.model.g_product_sku_packing||!$scope.model.g_product_sku_packing.PACKING_LONG||
                    !$scope.model.g_product_sku_packing.PACKING_WIDE||
                    !$scope.model.g_product_sku_packing.PACKING_HIGH
                ){
                    return 0;
                }
                var v=$scope.model.g_product_sku_packing.PACKING_HIGH*$scope.model.g_product_sku_packing.PACKING_WIDE*$scope.model.g_product_sku_packing.PACKING_LONG/1000000;
                return v.toFixed(6);
            }

            //获取整箱体积重(KG)方法
            $scope.getZxtijiz=function () {
                if(!$scope.model||!$scope.model.g_product_sku_packing||!$scope.model.g_product_sku_packing.PACKING_LONG||
                    !$scope.model.g_product_sku_packing.PACKING_WIDE||
                    !$scope.model.g_product_sku_packing.PACKING_HIGH
                ){
                    return 0;
                }
                var v=$scope.model.g_product_sku_packing.PACKING_HIGH*$scope.model.g_product_sku_packing.PACKING_WIDE*$scope.model.g_product_sku_packing.PACKING_LONG/5000;
                return v.toFixed(2);
            }

            //获取单品体积方法
            $scope.getDptiji=function () {
                if(!$scope.model||!$scope.model.g_product_sku_packing||!$scope.model.g_product_sku_packing.PACKING_LONG||
                    !$scope.model.g_product_sku_packing.PACKING_WIDE||
                    !$scope.model.g_product_sku_packing.PACKING_HIGH||
                    !$scope.model.g_product_sku_packing.PACKING_NUMBER
                ){
                    return 0;
                }
                var v=$scope.model.g_product_sku_packing.PACKING_HIGH*$scope.model.g_product_sku_packing.PACKING_WIDE*$scope.model.g_product_sku_packing.PACKING_LONG/1000000;
                return (v/$scope.model.g_product_sku_packing.PACKING_NUMBER).toFixed(6);

            }

            //获取单品计费重量方法
            $scope.getDpjfzl=function () {
                if(!$scope.model||!$scope.model.g_product_sku_packing||!$scope.model.g_product_sku_packing.PACKING_LONG||
                    !$scope.model.g_product_sku_packing.PACKING_WIDE||
                    !$scope.model.g_product_sku_packing.PACKING_HIGH||
                    !$scope.model.g_product_sku_packing.PACKING_NUMBER
                ){
                    return 0;
                }
                var zxtijiz=$scope.getZxtijiz();
                var maoz=$scope.model.g_product_sku_packing.GROSS_WEIGHT;
                maoz=maoz?maoz:0;
                if(zxtijiz>maoz){
                    return (zxtijiz/$scope.model.g_product_sku_packing.PACKING_NUMBER).toFixed(2);
                }
                return (maoz/$scope.model.g_product_sku_packing.PACKING_NUMBER).toFixed(2);

            }

            //获取产品+彩盒重方法
            $scope.getCpchttjz=function () {
                if(!$scope.model||!$scope.model.g_product_sku_packing||!$scope.model.g_product_sku_packing.GIFT_BOX_LONG||
                    !$scope.model.g_product_sku_packing.GIFT_BOX_WIDE||
                    !$scope.model.g_product_sku_packing.GIFT_BOX_HIGH
                ){
                    return 0;
                }
                var v=$scope.model.g_product_sku_packing.GIFT_BOX_LONG*$scope.model.g_product_sku_packing.GIFT_BOX_WIDE*$scope.model.g_product_sku_packing.GIFT_BOX_HIGH/5000;
                return v.toFixed(2);
            }

            //下单周期
            $scope.xiadanzq=function () {
                if(!$scope.model||!$scope.model.g_next_cycle
                ){
                    return "";
                }
                var count=0;
                if($scope.model.g_next_cycle.DELIVERY){
                    count+=(+$scope.model.g_next_cycle.DELIVERY);
                }
                if($scope.model.g_next_cycle.STOCKING){
                    count+=(+$scope.model.g_next_cycle.STOCKING);
                }
                if($scope.model.g_next_cycle.SHELF_TIME){
                    count+=(+$scope.model.g_next_cycle.SHELF_TIME);
                }
                if($scope.model.g_next_cycle.TRANSPORT){
                    count+=(+$scope.model.g_next_cycle.TRANSPORT);
                }
                if($scope.model.g_next_cycle.PLAN_TIME){
                    count+=(+$scope.model.g_next_cycle.PLAN_TIME);
                }
                return count;


            }

            //平台表格配置
            $scope.channels=$scope.channels|[];
                $scope.gridOptions_FNSKU = {
                    data:$scope.model.g_product_sku_fnsku,
                    columnDefs: [
                        {
                            field: 'CHANNEL_ID',
                            displayName: transervice.tran('*平台'),
                            cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getChannelName(row.entity.CHANNEL_ID)}}</div>',
                            //cellFilter: 'gridFieldFilter:row:col',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel:'CHANNEL_ID',
                            editDropdownValueLabel: 'CHANNEL_NAME_CN',
                           // editDropdownOptionsArray: $scope.channels
                            editDropdownRowEntityOptionsArrayPath: "rowEntity.channels"
                        }, {
                            field: 'WAREHOUSE_ID',
                            displayName: transervice.tran('*仓库'),
                            cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getWarhouseName(row.entity.WAREHOUSE_ID)}}</div>',
                            //cellFilter: 'gridFieldFilter:row:col',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel:'WAREHOUSE_ID',
                            editDropdownValueLabel: 'WAREHOUSE_NAME_CN',
                            // editDropdownOptionsArray: $scope.channelList
                            editDropdownRowEntityOptionsArrayPath: "rowEntity.wareHouses",
                        },{
                            field: 'ACCOUNT_ID',
                            displayName: transervice.tran('*账号'),
                            cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getAccountName(row.entity.ACCOUNT_ID)}}</div>',
                            //cellFilter: 'gridFieldFilter:row:col',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel:'ACCOUNT_ID',
                            editDropdownValueLabel: 'ACCOUNT',
                            //editDropdownOptionsArray: $scope.accounts,
                            editDropdownRowEntityOptionsArrayPath: "rowEntity.accounts"
                        }, {
                            field: 'PLATFORM_SKU',
                            displayName: transervice.tran('平台SKU'),
                        },
                        {field: 'ASIN', displayName: transervice.tran('ASIN')},
                        {field: 'FNSKU', displayName: transervice.tran('FNSKU')},
                        {
                            field: 'NOTCONSALE',
                            displayName: transervice.tran('是否继续销售'),
                            cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getStateName(row.entity.NOTCONSALE)}}</div>',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel:'D_VALUE',
                            editDropdownValueLabel: 'D_NAME_CN',
                            editDropdownOptionsArray: $scope.states
                        },{
                            field: 'DEFAULTS',
                            displayName: transervice.tran('默认'),
                            cellTemplate:'<input type="checkbox" class="styled" ng-model="row.entity.isSelected"  ng-change="grid.appScope.defaultChange_FNSKU(row.entity)">',
                            enableCellEdit: false,
                            cellClass: 'text-center',
                        }
                    ],
                    enablePagination: false,
                    enablePaginationControls:false

                };
                gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_FNSKU);


            $scope.addFNSKU=function () {
                if(!$scope.model.ORGAN_ID_DEMAND){
                    Notification.error(transervice.tran('请选择需求组织'));
                    return;
                }
                $scope.gridOptions_FNSKU.data.unshift({
                    ACCOUNT:"",
                    ASIN:"",
                    FNSKU:"",
                    NOTCONSALE:"1",
                    DEFAULTS:0,
                    isSelected:false,
                    DELETED_STATE:0,
                    rowEntity:angular.copy($scope.rowEntity)
                })
            }
            $scope.delFNSKU=function () {
                var entitys=$scope.gridOptions_FNSKU.gridApi.selection.getSelectedRows();
                $scope.gridOptions_FNSKU.data=$scope.gridOptions_FNSKU.data.filter(a=>$.inArray(a,entitys)==-1);
            }

            //默认实现单选
            $scope.defaultChange_FNSKU=function (entity) {
                if(entity.isSelected){
                    entity.DEFAULTS=1;
                    $scope.gridOptions_FNSKU.data.forEach(e=>{
                        if(e!=entity){
                            e.DEFAULTS=0;
                            e.isSelected=false;
                        }
                    })
                }else{
                    entity.DEFAULTS=0;
                }

            }
            $scope.gridOptions_FNSKU.afterCellEdit=function(rowEntity, colDef, newValue, oldValue) {
                if (colDef.name === 'CHANNEL_ID') {
                    if (newValue !=oldValue) {
                        //获取账号数组
                            if(!newValue||!$scope.model||!$scope.model.ORGAN_ID_DEMAND){

                                return $scope.rowEntity.accounts=[];
                            }
                        rowEntity.rowEntity.accounts=$scope.accounts.filter(c=>c.CHANNEL_ID==newValue);
                        rowEntity.ACCOUNT_ID="";

                        //获取组织平台下的仓库
                        rowEntity.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND&&w.CHANNEL_ID==rowEntity.CHANNEL_ID);
                         rowEntity.WAREHOUSE_ID="";


                    }
                }
            };

            //UPC 表格配置
            $scope.gridOptions_UPC={
                data:$scope.model.g_product_sku_upc,
                columnDefs: [
                    {
                        field: 'PRODUCT_SKU_UPC',
                        displayName: transervice.tran('UPC'),
                    },
                    {
                        field: 'PRODUCT_SKU_EAN',
                        displayName: transervice.tran('EAN'),
                    },{
                        field: 'UPC_REMARKS',
                        displayName: transervice.tran('备注'),
                    }
                ],
                enablePagination: false,
                enablePaginationControls:false
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_UPC);

            $scope.addUPC=function () {
                $scope.gridOptions_UPC.data.unshift({
                    PRODUCT_SKU_UPC:"",
                    PRODUCT_SKU_EAN:"",
                    UPC_REMARKS:"",
                    DELETED_STATE:0
                })
            }
            $scope.delUPC=function () {
                var entitys=$scope.gridOptions_UPC.gridApi.selection.getSelectedRows();
                $scope.gridOptions_UPC.data=$scope.gridOptions_UPC.data.filter(a=>$.inArray(a,entitys)==-1);
            }

            //采购记录表格配置
            $scope.gridOptions_Order={
                columnDefs: [
                    {
                        field: 'PU_PURCHASE_CD',
                        displayName: transervice.tran('采购单号'),
                    },
                    {
                        field: 'CREATED_AT',
                        displayName: transervice.tran('下单时间'),
                    },{
                        field: 'ORDER_STATE',
                        displayName: transervice.tran('审批状态'),
                    },
                    {
                        field: 'DORGANISATION_ID',
                        displayName: transervice.tran('需求组织'),
                    },{
                        field: 'DORGANISATION_ID',
                        displayName: transervice.tran('采购组织'),
                    },
                    {
                        field: 'PURCHASE',
                        displayName: transervice.tran('数量'),
                    },{
                        field: 'PU_PRICE',
                        displayName: transervice.tran('单价'),
                        displayName: transervice.tran('单价'),
                    },{
                        field: 'MONEY_ID',
                        displayName: transervice.tran('币种'),
                    },
                    {
                        field: 'CUSER_ID',
                        displayName: transervice.tran('采购人'),
                    },{
                        field: 'PARTNER_ID',
                        displayName: transervice.tran('供应商'),
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_Order);


            //供应商列表
            $scope.gridOptions_supplier={
                columnDefs: [
                    // {
                    //     field: 'PARTNER_ID',
                    //     displayName: transervice.tran('供应商编码'),
                    //     cellTemplate:'<div class="text-center"><span>{{row.entity.PARTNER_CODE}}</span><i class="iconfont icon-sousuo_sousuo pull-right" style="margin-right:10px" ng-click="grid.appScope.search(row.entity)"></i></div>',
                    //     enableCellEdit: false,
                    //     cellClass: 'text-right',
                    // },
                    {
                        field: 'pa_partner.PARTNER_NAME_CN',
                        displayName: transervice.tran('*供应商名称'),
                        enableCellEdit: false,
                    },{
                        field: 'pa_partner.PARTNER_ANAME_CN',
                        displayName: transervice.tran('简称'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'pa_partner.PARTNER_ADDRESS',
                        displayName: transervice.tran('地址'),
                        enableCellEdit: false,
                    },{
                        field: 'DEFAULTS',
                        displayName: transervice.tran('默认'),
                        cellTemplate:'<input type="checkbox" class="styled" ng-model="row.entity.isSelected"  ng-change="grid.appScope.defaultChange(row.entity)">',
                        enableCellEdit: false,
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_supplier);


            $scope.addSupplier=function () {
                partner_list_service.showDialog({data:$scope.rowEntity.suppliers,multiSelect:true}).then(function (data) {

                        if($scope.rowEntity.suppliers)
                            $scope.rowEntity.suppliers=$scope.rowEntity.suppliers.concat(data);

                    data.forEach(d=>{
                        var item={
                            pa_partner:d,
                            PARTNER_ID:d.PARTNER_ID,
                            DEFAULTS:0,
                            DELETED_STATE:0,
                            isSelected:false,
                        }
                        $scope.gridOptions_supplier.data.unshift(item);
                    })
                })



            }
            $scope.delSupplier=function () {
                var entitys=$scope.gridOptions_supplier.gridApi.selection.getSelectedRows();
                if(!entitys.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                return $confirm({ text: transervice.tran('删除供应商会连同采购价格一并删除，是否确认删除?') }).then(function(){
                    $scope.gridOptions_supplier.data=$scope.gridOptions_supplier.data.filter(a=>$.inArray(a,entitys)==-1);
                    var suppliers=entitys.map(s=>s.pa_partner);
                    suppliers=suppliers.filter(a=>a!=undefined);
                    $scope.rowEntity.suppliers=$scope.rowEntity.suppliers.filter(a=>$.inArray(a.PARTNER_ID,suppliers.map(s=>s.PARTNER_ID))==-1);
                    if($scope.gridOptions_price.data){
                        var prices=$scope.gridOptions_price.data.filter(a=>$.inArray(a.PARTNER_ID,suppliers.map(s=>s.PARTNER_ID))==-1);
                        $scope.gridOptions_price.data=prices;
                    }
                })



            }
            //选择供应商
            $scope.search=function (entity) {
                partner_list_service.showDialog($scope.gridOptions_supplier.data).then(function (data) {
                    if(entity.SKU_SUPPLIER_ID!=data.PARTNER_ID){
                        var codes=$scope.rowEntity.suppliers.map(p=>p.SKU_SUPPLIER_ID);
                        if(codes.indexOf(data.PARTNER_ID)!=-1){
                            return Notification.error(transervice.tran('供应商已存在'));
                        }
                        if($scope.rowEntity.suppliers)
                            entity.pa_partner=data;
                        entity.SKU_SUPPLIER_ID=data.PARTNER_ID;
                        $scope.rowEntity.suppliers.push(entity.pa_partner);
                    }

                })
            }

            //默认实现单选
            $scope.defaultChange=function (entity) {
                if(entity.isSelected){
                    entity.DEFAULTS=1;
                    $scope.gridOptions_supplier.data.forEach(e=>{
                        if(e!=entity){
                            e.DEFAULTS=0;
                            e.isSelected=false;
                        }
                    })
                }else{
                    entity.DEFAULTS=0;
                }

            }

            //采购价格列表配置
            $scope.gridOptions_price={
                columnDefs: [

                    {
                        field: 'PARTNER_ID',
                        displayName: transervice.tran('*供应商名称'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getPartnerName(row.entity.PARTNER_ID)}}</div>',
                        // cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'PARTNER_ID',
                        editDropdownValueLabel: 'PARTNER_NAME_CN',
                        // editDropdownOptionsArray: $scope.suppliers,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.suppliers"

                    },{
                        field: 'PRODUCT_SKU_MOQ',
                        displayName: transervice.tran('最小起订量'),
                    },
                    {
                        field: 'UNIT_PRICE',
                        displayName: transervice.tran('*价格'),
                    },
                    {
                        field: 'MONEY_ID',
                        displayName: transervice.tran('*币种编码'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getMoneyName(row.entity.MONEY_ID)}}</div>',
                        // cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'MONEY_ID',
                        editDropdownValueLabel: 'MONEY_NAME_CN',
                        //editDropdownOptionsArray: $scope.moneys,
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.moneys"

                    },{
                        field: 'PURCHASING_PRICE_STATE',
                        displayName: transervice.tran('是否启用'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getStateName(row.entity.PURCHASING_PRICE_STATE)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'D_VALUE',
                        editDropdownValueLabel: 'D_NAME_CN',
                        editDropdownOptionsArray: $scope.states
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_price);

            $scope.addPrice=function () {
                if(!$scope.gridOptions_supplier.data||!$scope.gridOptions_supplier.data.length){
                    Notification.error(transervice.tran('请添加供应商！'));
                    return;
                }
                $scope.gridOptions_price.data.unshift({
                    PSKU_ID:$scope.model.PSKU_ID,
                    PARTNER_ID:"",
                    DEFAULTS:"",
                    DELETED_STATE:0,
                    PURCHASING_PRICE_STATE:1,
                    rowEntity:$scope.rowEntity
                });
                $scope.gridOptions_price.gridApi.grid.refresh();
            }
            $scope.delPrice=function () {
                var entitys=$scope.gridOptions_price.gridApi.selection.getSelectedRows();
                $scope.gridOptions_price.data=$scope.gridOptions_price.data.filter(a=>$.inArray(a,entitys)==-1);
            }

            //获取供应商名称
            $scope.getPartnerName=function (id) {
                var suppliers=$scope.rowEntity.suppliers.filter(c=>c.PARTNER_ID==id);
                if(suppliers.length){
                    return suppliers[0].PARTNER_NAME_CN;
                }
                return "";
            }

            //获取货币名称
            $scope.getMoneyName=function (id) {
                var items=$scope.rowEntity.moneys.filter(c=>c.MONEY_ID==id);
                if(items.length){
                    return items[0].MONEY_NAME_CN;
                }
                return "";
            }
                //获取状态名称
            $scope.getStateName=function (id) {
                var states=$scope.states.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            }
                //获取平台名称
                $scope.getChannelName=function (id) {
                    if($scope.channels_all){
                        var channels=$scope.channels_all.filter(c=>c.CHANNEL_ID==id);
                        if(channels.length){
                            return channels[0].CHANNEL_NAME_CN;
                        }
                    }
                    return "";
                }

            //获取仓库名称
            $scope.getWarhouseName=function (id) {
                if($scope.wareHouses_all){
                    var hous=$scope.wareHouses_all.filter(w=>w.WAREHOUSE_ID==id);
                    if(hous.length){
                        return hous[0].WAREHOUSE_NAME_CN;
                    }
                }

                return "";
            }

            //获取组织架构名称
            $scope.getOrganisationName=function(id){
                var ors=$scope.organisations.filter(o=>o.ORGANISATION_ID==id);
                if(ors.length){
                    return ors[0].ORGANISATION_NAME_CN;
                }
            }
            //获取账号名称
            $scope.getAccountName=function (accountId) {

                if($scope.accounts){
                    var arr=$scope.accounts.filter(c=>c.ACCOUNT_ID==accountId);
                    if(arr.length){
                        return arr[0].ACCOUNT;
                    }
                }

                return "";
            }

            //保持方法
            $scope.save=function(){
                var errorMsg="";
                if (!$scope.model.PSKU_CODE) {
                    errorMsg = '请输入产品SKU';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if (!$scope.model.ORGAN_ID_DEMAND) {
                    errorMsg = '请选择需求组织';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if (!$scope.model.PSKU_NAME_CN) {
                    errorMsg = '请输入中文名称';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if (!$scope.model.CSKU_ID) {
                    errorMsg = '请输入通用SKU';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if(!$scope.model.bigTypeId){
                    errorMsg = '请选择分类';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if ($scope.currentBigType&&$scope.currentBigType.g_product_types.length&&!$scope.model.smallTypeId) {
                    errorMsg = '请选择子分类';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }

                if (!$scope.model.UNIT_ID) {
                    errorMsg = '请选择单位';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }

                //if (!$scope.model.PSKU_MOQ||!+$scope.model.PSKU_MOQ) {
                //    errorMsg = '请输入最小起定量';
                //    Notification.error(transervice.tran(errorMsg));
                //    return;
                //}
                if (!$scope.model.AMAZON_SIZE_ID) {
                    errorMsg = '请选择亚马逊尺寸';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }

                for(var i=0;i<$scope.gridOptions_FNSKU.data.length;i++){
                    var item=$scope.gridOptions_FNSKU.data[i];
                    if(!item.CHANNEL_ID){
                        return Notification.error(transervice.tran('请选择条形编码的平台'));
                    }
                    if(!item.WAREHOUSE_ID){
                        return Notification.error(transervice.tran('请选择条形编码的仓库'));
                    }

                    if(!item.ACCOUNT_ID){
                        return Notification.error(transervice.tran('请选择条形编码的账号'));
                    }
                }

                for(var i=0;i<$scope.gridOptions_price.data.length;i++){
                    var item=$scope.gridOptions_price.data[i];
                    if(!item.PARTNER_ID){
                        return Notification.error(transervice.tran('请选择采购价格的供应商'));
                    }
                    if(!item.UNIT_PRICE){
                        return Notification.error(transervice.tran('请输入采购价格的价格'));
                    }

                    if(!item.MONEY_ID){
                        return Notification.error(transervice.tran('请选择采购价格的币种'));
                    }
                }


                var saveModel=angular.copy($scope.model);
                saveModel.PRODUCT_TYPE_PATH=($scope.model.bigTypeId+($scope.model.smallTypeId?(","+$scope.model.smallTypeId):''));
                saveModel.g_product_sku_upc=$scope.gridOptions_UPC.data;
                saveModel.g_product_sku_fnsku=$scope.gridOptions_FNSKU.data;
                saveModel.g_product_sku_supplier=$scope.gridOptions_supplier.data;
                saveModel.g_product_sku_price=$scope.gridOptions_price.data;
                saveModel.g_next_cycle=[saveModel.g_next_cycle];
                saveModel.g_product_sku_declare=[saveModel.g_product_sku_declare];
                saveModel.g_product_sku_packing=[saveModel.g_product_sku_packing];

              return  httpService.httpHelper(httpService.webApi.api, "master/product/prodsku","create", "POST", saveModel).then(function (datas) {
                    $scope.PSKU_ID=datas.data.PSKU_ID;
                    $scope.imagefilesCount = $('#photofiles').fileinput('getFileStack').length;
                    $scope.wrapperfiles_addCount = $('#wrapperfiles_add').fileinput('getFileStack').length;
                    $scope.checkedfiles_addCount = $('#checkedfiles_add').fileinput('getFileStack').length;
                    $scope.count=($scope.imagefilesCount+$scope.wrapperfiles_addCount+$scope.checkedfiles_addCount);

                    if ($scope.imagefilesCount > 0) {
                        $('#photofiles').fileinput('upload');
                    }
                    if ($scope.wrapperfiles_addCount > 0) {
                        $('#wrapperfiles_add').fileinput('upload');
                    }
                    if ($scope.checkedfiles_addCount > 0) {
                        $('#checkedfiles_add').fileinput('upload');
                    }

                    if(!$scope.count){
                        Notification.success(transervice.tran("保存成功"))
                        $modalInstance.close();
                    }

                },function (datas) {
                    Notification.error({message: datas.message, delay: 5000});
                })



            }

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }

            //




        });
    })