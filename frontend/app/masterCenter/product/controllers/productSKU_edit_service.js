define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'css!bowerLibs/bootstrap-fileinput/css/fileinput.min.css',
        'fileinput-zh',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/gridDefaultOptionsService',
        // 'app/masterCenter/product/controllers/selectSupplier_service',
        'app/common/directives/singleSelectDirt',
        "app/masterCenter/bchannel/controllers/partner_list_service",
    ],
    function (angularAMD) {

        angularAMD.service(
            'productSKU_edit_service',
            function ($q, $modal) {
                this.showDialog = function (model,isLink) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "productSKU_edit_Ctrl",
                            backdrop: "static",
                            size: "85%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/product/views/productSKU_edit.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                },
                                isLink:function(){
                                    return isLink
                                }
                            }
                        }).result;
                };
            }
        );

        angularAMD.controller("productSKU_edit_Ctrl", function ($scope, model,isLink,$confirm, $filter, $timeout, amHttp, httpService, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService,partner_list_service,productSKU_add_service) {

            $scope.dicOptions = {
                filter: "contains",
                autoBind: true,
                dataTextField: "CSKU_CODE",
                dataValueField: "CSKU_ID",
                optionLabel: "请选择",//,select:['CSKU_CODE',"concat(CSKU_CODE,'-',CSKU_NAME_CN) as CSKU_NAME_CN",'PRODUCT_TYPE_PATH']
                url:httpService.webApi.api+"/master/product/currensku/index",
                search:{andwhere:["=","CSKU_ID",model.CSKU_ID]},
                value:model.CSKU_ID
            }


            //状态
            $scope.states=commonService.getDicList("STATE");
            //亚马逊尺寸
            $scope.amazonSizes=commonService.getDicList("PRODUCT_SKU");
            //仓库
            $scope.wareHouses=commonService.getDicList("WAREHOUSE");
            $scope.rowEntity = {channelList:[],accounts:[],suppliers:[],moneys:[],wareHouses:[],states:$scope.states};
            $scope.transports=commonService.getDicList("TRANSPORTS");
            var watchObject={channels:$scope.channelList_all,accounts: $scope.accounts_all,wareHouses:$scope.wareHouses_all};//构造观察对象
            //获取账号
            (function (){

                var dataSearch = {
                    limit:"*"
                };

                return httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index", "POST", dataSearch).then(function (datas) {
                    $scope.accounts_all=datas.data;
                    watchObject.accounts=$scope.accounts_all;
                })

            })();

            //获取所有仓库
            (function () {
                searchData = {
                    "joinwith":["organisation","allBchannel"],
                    "distinct": 1,
                    "limit":"0"
                };

                httpService.httpHelper(httpService.webApi.api, "master/basics/warehouse", "index" , "POST",searchData).then(
                    function (result) {
                        $scope.wareHouses_all=result.data;
                        watchObject.wareHouses=$scope.wareHouses_all;
                    })
            })();


            init().then(function () {

                //获取单位

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
                     distinct:1,
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
                    });
                    var typeIds=$scope.model.PRODUCT_TYPE_PATH.split(",");
                    if(typeIds.length){
                        $scope.model.bigTypeId=typeIds[0];
                        $scope.bigTypeChange();
                        if(typeIds.length>1){
                            $scope.model.smallTypeId=typeIds[1];
                        }

                    }
                    $scope.copyModel.model=angular.copy($scope.model);


                })
            });


            //平台列表
            (function () {
                var selectWhere = {limit:"0"};
                httpService.httpHelper(httpService.webApi.api, "master/basics/channel", "index", "POST", selectWhere).then(
                    function (result) {
                        if (result != null && result.status == 200) {
                            $scope.channelList_all = result.data;
                            watchObject.channels=$scope.channelList_all;
                            //$scope.rowEntity.channelList=result.data;
                        }
                    }
                );
            })();

            // //获取需求组织，默认采购组织
            // (function() {
            //     var dataSearch = {
            //         "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
            //         "joinwith":["o_organisationt"]
            //     };
            //
            //     httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
            //         $scope.organizations_xuqiu=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
            //
            //     });
            //     var dataSearch1 =  {
            //         "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",2]],
            //         "joinwith":["o_organisationt"]
            //     };
            //
            //     httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch1).then(function (datas) {
            //         $scope.organizations_caigou=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
            //
            //
            //     });
            // })();

            $scope.options_xuqiu={
                types:[4],
                // getList:function (orgList) {
                //     $scope.orgList=orgList;
                // },
                change:function (id,selectModel) {
                    $scope.organizations_xuqiuBlur(id,selectModel);
                }
            };


            //获取货币种类
            (function () {
                var selectWhere = {"limit":"0"};

                httpService.httpHelper(httpService.webApi.api, "master/basics/money", "index", "POST", selectWhere).then(function (datas) {
                    $scope.moneys=datas.data;
                    $scope.rowEntity.moneys=datas.data;

                });



            })();

            //获取产品SKU的供应商
            (function () {
                var selectWhere = {"where": ["=","g_product_sku_supplier.PSKU_ID",model.PSKU_ID],
                    "joinwith":["pa_partner"]
                };

                httpService.httpHelper(httpService.webApi.api, "master/product/prodskus", "index", "POST", selectWhere).then(function (datas) {

                    $scope.suppliers=datas.data.map(a=>a.pa_partner);
                    $scope.rowEntity.suppliers= $scope.suppliers;

                })
            })();

            //等待完成
            function waitModel(lable,fn) {
                setTimeout(function () {
                    if(watchObject[lable]&&watchObject[lable].length){
                        fn();
                    }else{
                        waitModel(lable,fn);
                    }
                },100)
            }

             $scope.copyModel={};


            function init() {
                $scope.PSKU_ID=model.PSKU_ID;

                var searchCoditions={
                    where:["=","g_product_sku.PSKU_ID",model.PSKU_ID],//"g_product_sku_upc","g_product_sku_fnsku","g_product_sku_supplier","g_product_sku_price",
                    joinwith:["g_product_sku_packing","g_product_sku_declare","g_next_cycle","g_product_sku_upc","g_product_sku_fnsku1"],
                }

                return  httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "index", "POST",searchCoditions).then(
                    function (result){

                            $scope.model=result.data[0];

                             $scope.copyModel.g_product_sku_packing=angular.copy($scope.model.g_product_sku_packing);
                             $scope.copyModel.g_product_sku_declare=angular.copy($scope.model.g_product_sku_declare);
                             $scope.copyModel.g_next_cycle=angular.copy($scope.model.g_next_cycle);

                        if($scope.model.PSKU_MOQ){
                            $scope.model.PSKU_MOQ=parseInt($scope.model.PSKU_MOQ);
                        }
                        $scope.model.g_product_sku_fnsku=$scope.model.g_product_sku_fnsku1;

                        $scope.model.g_product_sku_fnsku.forEach(a=>{
                            a.rowEntity=angular.copy($scope.rowEntity);
                            if(+a.DEFAULTS){
                                a.isSelected=true;
                            }else{
                                a.isSelected=false;
                            }
                        });

                        $scope.copyModel.g_product_sku_fnsku=angular.copy($scope.model.g_product_sku_fnsku);


                            waitModel("channels",function () {
                                $scope.rowEntity.channelList=$scope.channelList_all.filter(b=>b.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND);
                                $scope.model.g_product_sku_fnsku.forEach(a=>{
                                    a.rowEntity.channelList=$scope.channelList_all.filter(b=>b.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND);
                                });
                            })

                        waitModel("accounts",function () {
                            $scope.model.g_product_sku_fnsku.forEach(a=>{
                                a.rowEntity.accounts=$scope.accounts_all.filter(b=>b.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND&&b.CHANNEL_ID==a.CHANNEL_ID);
                            });

                            waitModel("wareHouses",function () {
                                $scope.model.g_product_sku_fnsku.forEach(a=>{
                                    //获取组织平台下的仓库
                                    a.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND&&w.CHANNEL_ID==a.CHANNEL_ID);
                                });
                                $scope.gridOptions_FNSKU.data=$scope.model.g_product_sku_fnsku;
                            })
                        })



                            formatModel($scope.model);

                            $scope.gridOptions_UPC.data=$scope.model.g_product_sku_upc;

                           $scope.copyModel.g_product_sku_upc=angular.copy($scope.model.g_product_sku_upc);

                            $scope.gridOptions_supplier.getPage();
                            $scope.gridOptions_price.getPage();
                           $scope.gridOptions_Order.getPage();


                    }
                );

            }



            //大分类改变时
            $scope.bigTypeChange=function () {
                var currentBigType=$scope.types.filter(a=>a.PRODUCT_TYPE_ID==$scope.model.bigTypeId);
                $scope.currentBigType=currentBigType[0];
                $scope.model.smallTypeId=0;
            }


            //复制按钮不可用方法
            $scope.copyDisabled=function () {
                if(!$scope.model&&$scope.copyModel){
                    return false;
                }
                if($scope.model&&$scope.copyModel.model)
                     if(!equalModel($scope.model,$scope.copyModel.model,["PSKU_CODE","ORGAN_ID_DEMAND","PSKU_NAME_CN","CSKU_ID","ORGAN_ID_PURCHASE","PSKU_NAME_EN","bigTypeId","smallTypeId","UNIT_ID","AMAZON_SIZE_ID","PSKU_MOQ","UNIVERSAL_STATE","TRANSPORT","PSKU_STATE","PSKU_REMARKS"])){
                         return true;
                     }
                     if(!equalModel($scope.model.g_product_sku_packing,$scope.copyModel.g_product_sku_packing,['PRODUCT_LONG','PRODUCT_WIDE','PRODUCT_HIGH','PRODUCT_WEIGHT','GIFT_BOX_LONG','GIFT_BOX_WIDE','GIFT_BOX_HIGH','PRODUCT_GIFT_WEIGHT','PACKING_LONG','PACKING_WIDE','PACKING_HIGH','PACKING_NUMBER','NET_WEIGHT','GROSS_WEIGHT','CABINET_NUMBER'])){
                         return true;
                     }

                    if(!equalModel($scope.model.g_product_sku_declare,$scope.copyModel.g_product_sku_declare,['CUSTOMS_CODE','UNIT_ID','CUSTOMS_NAME','MATERIAL','REPORTING_ELEMENTS','VOLTAGE','PURPOSE','POWER','BATTERY_CAPACITY','DECLARE_REMARKS'])){
                        return true;
                    }

                    if(!equalModel($scope.model.g_next_cycle,$scope.copyModel.g_next_cycle,['DELIVERY','STOCKING','SHELF_TIME','TRANSPORT','PLAN_TIME'])){
                      return true;
                    }

                if(!equalModel($scope.gridOptions_FNSKU.data,$scope.copyModel.g_product_sku_fnsku,['CHANNEL_ID','WAREHOUSE_ID','ACCOUNT_ID','PLATFORM_SKU','ASIN','FNSKU','NOTCONSALE','DEFAULTS'])){
                    return true;
                }
                if(!equalModel($scope.gridOptions_UPC.data,$scope.copyModel.g_product_sku_upc,['PRODUCT_SKU_UPC','PRODUCT_SKU_EAN','UPC_REMARKS'])){
                    return true;
                }
                if(!equalModel($scope.gridOptions_supplier.data,$scope.copyModel.g_product_sku_supplier,['PARTNER_ID'])){
                    return true;
                }
                if(!equalModel($scope.gridOptions_price.data,$scope.copyModel.g_product_sku_price,['PARTNER_ID','PRODUCT_SKU_MOQ','UNIT_PRICE','MONEY_ID','PURCHASING_PRICE_STATE'])){
                    return true;
                }
                return false;

            }

            function equalModel(from,to,fileds){
                if(from instanceof Array){
                       if(from&&to){
                           if(from.length!=to.length){
                               return false;
                           }
                           for(var j=0;j<from.length;j++){
                               var item=from[j];
                               for(var i=0;i<fileds.length;i++){
                                   var filed=fileds[i];
                                   var f=item[filed]?item[filed]:'';
                                   var t=to[j][filed]?to[j][filed]:'';
                                   if(f!=t){
                                       return false;
                                   }
                               }
                           }
                       } else{
                            if(from){
                                if(!to){
                                    return false;
                                }
                            }
                       }
                }else{
                    if(from&&to)
                    for(var i=0;i<fileds.length;i++){
                        var filed=fileds[i];
                        var f=from[filed]?from[filed]:'';
                        var t=to[filed]?to[filed]:'';
                        if(f!=t){
                            return false;
                        }
                    }
                    else{
                        if(from){
                            if(!to){
                                return false;
                            }
                        }
                    }
                }

                return true;
            }

            $scope.copy=function(){
                var saveModel=angular.copy($scope.model);

                saveModel.PRODUCT_TYPE_PATH=($scope.model.bigTypeId+($scope.model.smallTypeId?(","+$scope.model.smallTypeId):''));
                saveModel.g_product_sku_upc=angular.copy($scope.gridOptions_UPC.data);
                saveModel.g_product_sku_fnsku=angular.copy($scope.gridOptions_FNSKU.data);
                saveModel.g_next_cycle=angular.copy(saveModel.g_next_cycle);
                saveModel.g_product_sku_declare=angular.copy(saveModel.g_product_sku_declare);
                saveModel.g_product_sku_packing=angular.copy(saveModel.g_product_sku_packing);

                saveModel.g_product_sku_upc.forEach(d=>{
                    delete d.PRODUCT_SKU_UPC_ID;
                    delete d.PRODUCT_SKU_CODE;
                    delete d.PSKU_ID;
                });
                saveModel.g_product_sku_fnsku.forEach(d=>{
                    delete d.PRODUCT_SKU_FNSKU_ID;
                    delete d.PRODUCT_SKU_CODE;
                    delete d.PSKU_ID;
                });

                    if(saveModel.g_next_cycle){
                        delete saveModel.g_next_cycle.NEXT_CYCLE_ID;
                        delete saveModel.g_next_cycle.PRODUCT_SKU_CODE;
                        delete saveModel.g_next_cycle.PSKU_ID;
                    }


                    if(saveModel.g_product_sku_declare){
                        delete saveModel.g_product_sku_declare.SKU_FILES_ID;
                        delete saveModel.g_product_sku_declare.PRODUCT_SKU_CODE;
                        delete saveModel.g_product_sku_declare.PSKU_ID;
                    }


                if(saveModel.g_product_sku_packing) {
                    delete saveModel.g_product_sku_packing.SKU_FILES_ID;
                    delete saveModel.g_product_sku_packing.PRODUCT_SKU_CODE;
                    delete saveModel.g_product_sku_packing.PSKU_ID;
                }




                productSKU_add_service.showDialog(saveModel).then(function(result){
                    $modalInstance.close();
                })
            }






            initInputFile();
            //附件上传工具初始化
            function initInputFile() {

                $scope.FinINput = true;
                $scope.FileDownShow = '';
                $scope.FinINputRemoveClass =  'btn btn-xs btn-default';
                var searchWhere={ where: ["=","p_files_middle.PRODUCT_ID",$scope.PSKU_ID],
                    andwhere:["or",["=","p_files_middle.FILE_TYPE_ID",2],["=","p_files_middle.FILE_TYPE_ID",3],["=","p_files_middle.FILE_TYPE_ID",4]],
                    limit: 0,
                    joinWith: ['photos'] }
                httpService.httpHelper(httpService.webApi.api, "common/base/filesmiddle", "index", "POST", searchWhere).then(
                    function (data) {
                        //图片
                        var preConfigList_tupian = new Array();
                        var preList_tupian = new Array();
                        //包材
                        var preConfigList_baocai = new Array();
                        var preList_baocai = new Array();
                        //品检
                        var preConfigList_pinjian = new Array();
                        var preList_pinjian = new Array();

                        $scope.fileinfo = data.data;
                        angular.forEach(data.data, function (obj) {
                            var item;
                            if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG|bmp)$/.test(obj.photos.name)) {
                                // 非图片类型的展示
                                item="<div class='file-preview-other-frame' style=\"width:auto;height:160px;\"><div class='file-preview-other'><span class='file-icon-4x'><i class='fa fa-file-text-o text-info' style=\"font-size:100px\"></i></span></div></div>";
                            } else {
                                // 图片类型
                                item="<img src=\"" + httpService.imgUri + "/budget" + obj.photos.url + "\" class=\"kv-preview-data file-preview-image\" style=\"width:auto;height:160px;\">";
                            }
                            var tjson = {
                                caption: obj.photos.name, // 展示的文件名
                                size: obj.photos.size,
                                url: httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "delete?id=" + obj.FILES_MIDDLE_ID, // 删除url
                                key: httpService.imgUri + "/budget" + obj.photos.url,
                                show:true
                            };
                            if(obj.FILE_TYPE_ID==2){
                                preConfigList_tupian.push(tjson)
                                preList_tupian.push(item);
                            }else if(obj.FILE_TYPE_ID==3){
                                preConfigList_baocai.push(tjson)
                                preList_baocai.push(item);
                            }else{
                                preConfigList_pinjian.push(tjson)
                                preList_pinjian.push(item);
                            }

                        });

                        initFile("imagefiles",preConfigList_tupian,preList_tupian,2);
                        initFile("wrapperfiles",preConfigList_baocai,preList_baocai,3);
                        initFile("checkedfiles",preConfigList_pinjian,preList_pinjian,4);

                        function initFile(id,config,pre,FILE_TYPE_ID) {
                            var parentDom=$("#"+id).parent();
                            angular.init($("#"+id), {
                                uploadExtraData: function (previewId, index) {
                                    return { PRODUCT_ID: $scope.PSKU_ID, FILE_TYPE_ID: FILE_TYPE_ID };
                                },
                                fileActionSettings: { showRemove: $scope.FinINput, showZoom: false, removeClass: $scope.FinINputRemoveClass },
                                browseOnZoneClick: $scope.FinINput,
                                uploadUrl: httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "create",
                                initialPreviewConfig: config,
                                initialPreview: pre,
                                otherActionButtons: '<a href={dataKey}  target="_blank" title="下载"  class="btn btn-xs btn-default" download="{caption}" style="display: ' + $scope.FileDownShow + '"><i class="glyphicon glyphicon-download text-info"></i></a>',
                            }).on('fileuploaded', function (event, data, previewId, index) {
                                parentDom.find('div.file-preview-thumbnails #' + previewId).attr('server_id', data.response.data.FILES_MIDDLE_ID);
                            }).on('filebatchselected', function(event, files) {
                                parentDom.find('.file-live-thumbs .file-footer-buttons a').hide();//选择完事件
                                var contentDiv=parentDom.find('.file-live-thumbs .file-preview-frame:last .kv-file-content');//选择完事件
                                var td=contentDiv.find("textarea");
                                var obj=contentDiv.find("object");
                                if(td.length||obj.length){
                                    contentDiv.html('<div class="file-preview-other-frame" style="width:auto;/* height:160px; */"><div class="file-preview-other"><span class="file-icon-4x"><i class="fa fa-file-text-o text-info" style="font-size:100px"></i></span></div></div>')
                                }

                            }).on('filesuccessremove', function (event, FILES_MIDDLE_ID) {
                                event.preventDefault();
                                var dp = parentDom.find('div.file-preview-thumbnails #' + FILES_MIDDLE_ID).attr('server_id');
                                httpService.httpHelper(httpService.webApi.api + "/" + "common/base", "filesmiddle", 'delete?id=' + dp, "POST", {}).then(
                                    function (data) {
                                        if (data != null && data.status == 200) {
                                            parentDom.find('#' + FILES_MIDDLE_ID).fadeOut(300, function () {
                                                $(this).remove();
                                            });
                                        } else {
                                            parentDom.find('#' + FILES_MIDDLE_ID).addClass('btn-danger').find('.file-actions').html(data.message);
                                        }
                                    },
                                    function (data) {
                                        parentDom.find('#' + FILES_MIDDLE_ID).addClass('btn-danger').find('.file-actions').html(data.message);
                                    });

                                return false;
                            }).on('filezoomhidden', function (event, params) {
                                $("body").addClass('modal-open');
                            }).on('fileuploaded', function (event, data, previewId, index) {
                                $scope.count--;
                                if(!$scope.count){
                                    Notification.success(transervice.tran("保存成功"))
                                    $modalInstance.close();
                                }

                            });
                            if (pre.length == 0) {
                                parentDom.find('.file-preview-thumbnails').html("");
                            }
                        }

                    });


            };



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
            $scope.channelList=$scope.channelList|[];
            $scope.gridOptions_FNSKU = {
                columnDefs: [
                    {
                        field: 'CHANNEL_ID',
                        displayName: transervice.tran('*平台'),
                        cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getChannelName(row.entity.CHANNEL_ID)}}</div>',
                        //cellFilter: 'gridFieldFilter:row:col',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'CHANNEL_ID',
                        editDropdownValueLabel: 'CHANNEL_NAME_CN',
                        // editDropdownOptionsArray: $scope.channelList
                        editDropdownRowEntityOptionsArrayPath: "rowEntity.channelList"
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
                    PSKU_ID:$scope.model.PSKU_ID,
                    CHANNEL_ID:"",
                    WAREHOUSE_ID:"",
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

                if(!entitys.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                return $confirm({ text: transervice.tran('是否确认删除?') })
                    .then(function () {
                        var delRows=entitys.filter(e=>e.PRODUCT_SKU_FNSKU_ID);
                        if(delRows.length){

                            var postData={batch:delRows};

                            httpService.httpHelper(httpService.webApi.api, "master/product/prodskuf", "delete", "POST", postData).then(function (datas) {
                                $scope.gridOptions_FNSKU.data=$scope.gridOptions_FNSKU.data.filter(a=>$.inArray(a,entitys)==-1);

                            },function (result) {
                                Notification.error({ message: result.message, delay: 5000 });
                            });
                        }else{
                            $scope.gridOptions_FNSKU.data=$scope.gridOptions_FNSKU.data.filter(a=>$.inArray(a,entitys)==-1);
                        }


                    });
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
            $scope.ORGAN_ID_DEMAND="";
            $scope.organizations_xuqiuBlur=function (id) {
                $scope.channelList=$scope.channelList_all.filter(a=>a.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND);
                $scope.gridOptions_FNSKU.data.filter(d=>{
                    d.rowEntity.channelList=$scope.channelList;
                    d.rowEntity.accounts=[];
                    d.rowEntity.wareHouses=[];

                    d.CHANNEL_ID='';
                    d.ACCOUNT_ID='';
                    d.WAREHOUSE_ID='';
                });
                $scope.rowEntity.channelList=$scope.channelList;

                //获取账号数组
                if(!id){
                    return $scope.accounts=[];
                }
                if($scope.ORGAN_ID_DEMAND!=id){
                    $scope.ORGAN_ID_DEMAND=id;
                    var dataSearch = {
                        "where": ["and",["=", "ORGANISATION_ID", $scope.model.ORGAN_ID_DEMAND]]
                    };

                    httpService.httpHelper(httpService.webApi.api, "master/basics/account", "index", "POST", dataSearch).then(function (datas) {
                        $scope.accounts=datas.data;
                        //$scope.rowEntity.accounts=datas.data;

                    })
                }

            }

            $scope.gridOptions_FNSKU.afterCellEdit=function(rowEntity, colDef, newValue, oldValue) {
                if (colDef.name === 'CHANNEL_ID') {
                    if (newValue !=oldValue) {
                        //获取账号数组
                        if(!newValue||!$scope.model||!$scope.model.ORGAN_ID_DEMAND){

                            return $scope.rowEntity.accounts=[];
                        }
                        rowEntity.rowEntity.accounts=$scope.accounts_all.filter(c=>c.CHANNEL_ID==newValue);
                        rowEntity.ACCOUNT_ID="";
                        //获取组织平台下的仓库
                        rowEntity.rowEntity.wareHouses=$scope.wareHouses_all.filter(w=>w.ORGANISATION_ID==$scope.model.ORGAN_ID_DEMAND&&w.CHANNEL_ID==rowEntity.CHANNEL_ID);
                        rowEntity.WAREHOUSE_ID="";

                    }
                }
            };



            //UPC 表格配置
            $scope.gridOptions_UPC={
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
                    PSKU_ID:$scope.model.PSKU_ID,
                    PRODUCT_SKU_UPC:"",
                    PRODUCT_SKU_EAN:"",
                    UPC_REMARKS:"",
                    DELETED_STATE:0
                })
            }
            $scope.delUPC=function () {
                var entitys=$scope.gridOptions_UPC.gridApi.selection.getSelectedRows();

                if(!entitys.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                $confirm({ text: transervice.tran('是否确认删除?') })
                    .then(function () {

                        var delRows=entitys.filter(e=>e.PRODUCT_SKU_UPC_ID);
                        if(delRows.length){
                            var postData={batch:delRows};

                            httpService.httpHelper(httpService.webApi.api, "master/product/prodskuu", "delete", "POST", postData).then(function (datas) {
                                Notification.success(datas.message);
                                $scope.gridOptions_UPC.data=$scope.gridOptions_UPC.data.filter(a=>$.inArray(a,entitys)==-1);

                            });
                        }else{
                            $scope.gridOptions_UPC.data=$scope.gridOptions_UPC.data.filter(a=>$.inArray(a,entitys)==-1);
                        }


                    });
            }

            //采购记录表格配置
            $scope.gridOptions_Order={
                columnDefs: [
                    {
                        field: 'pu_purchase.PU_PURCHASE_CD',
                        displayName: transervice.tran('采购单号'),
                        cellTemplate:'<div ><a class="btn btn-link" style="padding-top: 3px;" p-link link-code="row.entity.pu_purchase.PU_PURCHASE_CD" link-state="\'1\'">{{row.entity.pu_purchase.PU_PURCHASE_CD}}</a></div>',

                    },
                    {
                        field: 'pu_purchase.PRE_ORDER_AT',
                        displayName: transervice.tran('下单时间'),
                    },{
                        field: 'pu_purchase.PRE_ORDER_AT',
                        displayName: transervice.tran('审批状态'),
                        cellTemplate:'<div class="ui-grid-cell-contents ">{{row.entity.pu_purchase.PRE_ORDER_AT==1?"未审核":"已审核"}}</div>',
                    },
                    {
                        field: 'pu_purchase.o_organisation_o.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('需求组织'),
                    },{
                        field: 'pu_purchase.o_organisation.ORGANISATION_NAME_CN',
                        displayName: transervice.tran('采购组织'),
                    },
                    {
                        field: 'PURCHASE',
                        displayName: transervice.tran('数量'),
                        cellClass:"text-right"
                    },{
                        field: 'TAX_UNITPRICE',
                        displayName: transervice.tran('单价'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.TAX_UNITPRICE|number:2}}</div>',
                    },{
                        field: 'pu_purchase.b_money.MONEY_NAME_CN',
                        displayName: transervice.tran('币种'),
                    },
                    {
                        field: 'pu_purchase.u_userinfo_g.STAFF_NAME_CN',
                        displayName: transervice.tran('采购人'),
                    },{
                        field: 'pu_purchase.pa_partner.PARTNER_ANAME_CN',
                        displayName: transervice.tran('供应商'),
                    }
                ]
            }
                gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_Order);

            $scope.gridOptions_Order.getPage=function(pageNo,pageSize){
                var searchCoditions={
                    "where": ["and",["<>", "pu_purchase.DELETED_STATE", 1],["=","pu_purchase_detail.PSKU_ID",$scope.model.PSKU_ID],["=","pu_purchase.DORGANISATION_ID",$scope.model.ORGAN_ID_DEMAND]],
                    "joinwith": ['pu_purchase'],
                    "distinct": true,
                    "limit":  $scope.gridOptions_Order.paginationPageSize
                }
                httpService.httpHelper(httpService.webApi.api, "purchase/purchasedetail", "index?page="+$scope.gridOptions_Order.paginationCurrentPage, "POST",searchCoditions).then(function (datas) {

                    datas.data.forEach(a=>{
                        if(a.pu_purchase.PRE_ORDER_AT)
                        a.pu_purchase.PRE_ORDER_AT=$filter("date")(new Date(a.pu_purchase.PRE_ORDER_AT*1000),"yyyy-MM-dd HH:mm:ss");
                    });
                    $scope.gridOptions_Order.data=datas.data;
                    $scope.gridOptions_Order.totalItems=datas._meta.totalCount;

                    // $scope.gridOptions_supplier.gridApi.grid.refresh();

                })
            }


            //供应商列表
            $scope.gridOptions_supplier={
                columnDefs: [
                    // {
                    //     field: 'PARTNER_CODE',
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
                        cellClass: 'text-center',
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_supplier);

            //翻页查询
            $scope.gridOptions_supplier.getPage=function (pageNo,pageSize) {
                var searchCoditions={
                    limit: $scope.gridOptions_supplier.paginationPageSize,
                    where:["=","PSKU_ID",$scope.model.PSKU_ID],
                    joinwith:["pa_partner"]
                }
                httpService.httpHelper(httpService.webApi.api, "master/product/prodskus", "index?page="+$scope.gridOptions_supplier.paginationCurrentPage, "POST",searchCoditions).then(function (datas) {

                    $scope.gridOptions_supplier.data=datas.data;
                    $scope.gridOptions_supplier.totalItems=datas._meta.totalCount;
                    $scope.gridOptions_supplier.data.forEach(e=>{
                        e.isSelected=false;
                        if(e.DEFAULTS?parseInt(e.DEFAULTS):false){
                            e.isSelected=true;
                        }
                    })
                    $scope.copyModel.g_product_sku_supplier=angular.copy($scope.gridOptions_supplier.data);
                    // $scope.gridOptions_supplier.gridApi.grid.refresh();

                })

            }

            $scope.addSupplier=function () {
                partner_list_service.showDialog({data:$scope.rowEntity.suppliers.data,multiSelect:true}).then(function (data) {

                    if($scope.rowEntity.suppliers)
                        $scope.rowEntity.suppliers=$scope.rowEntity.suppliers.concat(data);

                    data.forEach(d=>{
                        var item={
                            pa_partner:d,
                            PSKU_ID:$scope.model.PSKU_ID,
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

                return $confirm({ text: transervice.tran('删除供应商会连同采购价格一并删除，是否确认删除?') })
                    .then(function () {
                        var saveRows=entitys.filter(e=>e.SKU_SUPPLIER_ID);

                        if(saveRows.length){
                            var delDatas=[];
                            saveRows.forEach(d=>{
                                delDatas.push({
                                    PSKU_ID: d.PSKU_ID,
                                    SKU_SUPPLIER_ID:d.SKU_SUPPLIER_ID,
                                    PARTNER_ID:d.PARTNER_ID
                                })
                            })
                            var postData={batch:delDatas};
                            httpService.httpHelper(httpService.webApi.api, "master/product/prodskus", "delete", "POST", postData).then(function (datas) {
                                Notification.success(datas.message);
                                $scope.gridOptions_supplier.data=$scope.gridOptions_supplier.data.filter(a=>$.inArray(a,entitys)==-1);
                                var suppliers=entitys.map(s=>s.pa_partner);

                                $scope.rowEntity.suppliers=$scope.rowEntity.suppliers.filter(s=>$.inArray(s.PARTNER_ID,suppliers.map(s=>s.PARTNER_ID))==-1);
                                if($scope.gridOptions_price.data){
                                    var prices=$scope.gridOptions_price.data.filter(a=>$.inArray(a.PARTNER_ID,suppliers.map(s=>s.PARTNER_ID))==-1);
                                    $scope.gridOptions_price.data=prices;
                                }

                            });
                        }else{
                            $scope.gridOptions_supplier.data=$scope.gridOptions_supplier.data.filter(a=>$.inArray(a,entitys)==-1);
                            var suppliers=entitys.map(s=>s.pa_partner);
                            suppliers=suppliers.filter(a=>a!=undefined);

                            $scope.rowEntity.suppliers=$scope.rowEntity.suppliers.filter(s=>$.inArray(s.PARTNER_ID,suppliers.map(s=>s.PARTNER_ID))==-1);

                            if($scope.gridOptions_price.data){
                                var prices=$scope.gridOptions_price.data.filter(a=>$.inArray(a.PARTNER_ID,suppliers.map(s=>s.PARTNER_ID))==-1);
                                $scope.gridOptions_price.data=prices;
                            }
                        }


                    });


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
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.PRODUCT_SKU_MOQ}}</div>',
                    },
                    {
                        field: 'UNIT_PRICE',
                        displayName: transervice.tran('*价格'),
                        cellTemplate:'<div class="ui-grid-cell-contents text-right">{{row.entity.UNIT_PRICE|number:2}}</div>',
                    },
                    {
                        field: 'MONEY_ID',
                        displayName: transervice.tran('*币种'),
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
                        cellFilter: 'gridFieldFilter:row:col:"D_VALUE":"D_NAME_CN":row.entity.rowEntity.states',
                        //cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getStateName(row.entity.PURCHASING_PRICE_STATE)}}</div>',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownIdLabel:'D_VALUE',
                        editDropdownValueLabel: 'D_NAME_CN',
                        //editDropdownOptionsArray: $scope.states
                        editDropdownRowEntityOptionsArrayPath:"rowEntity.states"
                    }
                ]
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_price);

            //翻页查询
            $scope.gridOptions_price.getPage=function (pageNo,pageSize) {
                var searchCoditions={
                    limit: $scope.gridOptions_price.paginationPageSize,
                    where:["=","PSKU_ID",$scope.model.PSKU_ID],
                }
                httpService.httpHelper(httpService.webApi.api, "master/product/prodskupp", "index?page="+$scope.gridOptions_price.paginationCurrentPage, "POST",searchCoditions).then(function (datas) {

                    $scope.gridOptions_price.data=datas.data;
                    $scope.gridOptions_price.data.forEach(a=>a.rowEntity=$scope.rowEntity);
                    $scope.gridOptions_price.totalItems=datas._meta.totalCount;

                    $scope.copyModel.g_product_sku_price=angular.copy($scope.gridOptions_price.data);

                })

            }
            $scope.addPrice=function () {
                if(!$scope.gridOptions_supplier.data||!$scope.gridOptions_supplier.data.length){
                    Notification.error(transervice.tran('请添加供应商！'));
                    return;
                }
                $scope.gridOptions_price.data.unshift({
                    PSKU_ID:$scope.model.PSKU_ID,
                    DEFAULTS:"",
                    PURCHASING_PRICE_STATE:1,
                    rowEntity:$scope.rowEntity
                });

                $scope.gridOptions_price.gridApi.grid.refresh();
            }
            $scope.delPrice=function () {
                var entitys=$scope.gridOptions_price.gridApi.selection.getSelectedRows();

                if(!entitys.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                return $confirm({ text: transervice.tran('是否确认删除?') })
                    .then(function () {

                        var delDatas=entitys.filter(d=>d.PURCHASING_PRICE_ID);
                        if(delDatas.length){
                            var postData={batch:entitys};

                            httpService.httpHelper(httpService.webApi.api, "master/product/prodskupp", "delete", "POST", postData).then(function (datas) {

                                Notification.success(datas.message);
                                $scope.gridOptions_price.data=$scope.gridOptions_price.data.filter(a=>$.inArray(a,entitys)==-1);

                            });
                        }else{
                            $scope.gridOptions_price.data=$scope.gridOptions_price.data.filter(a=>$.inArray(a,entitys)==-1);
                        }



                    });
            }

            //获取供应商名称
            $scope.getPartnerName=function (id) {
                if(!$scope.rowEntity.suppliers){
                    return;
                }
                var suppliers=$scope.rowEntity.suppliers.filter(c=>c.PARTNER_ID==id);
                if(suppliers.length){
                    return suppliers[0].PARTNER_NAME_CN;
                }
                return "";
            }

            //获取货币名称
            $scope.getMoneyName=function (id) {
                if(!$scope.rowEntity.moneys){
                    return;
                }
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
                if(!$scope.channelList_all){
                    return;
                }
                var channels=$scope.channelList_all.filter(c=>c.CHANNEL_ID==id);
                if(channels.length){
                    return channels[0].CHANNEL_NAME_CN;
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

                var arr=$scope.accounts_all.filter(c=>c.ACCOUNT_ID==accountId);
                if(arr.length){
                    return arr[0].ACCOUNT;
                }
                return "";
            }

            //获取仓库名称
            $scope.getWarhouseName=function (id) {
                var hous=$scope.wareHouses_all.filter(w=>w.WAREHOUSE_ID==id);
                if(hous.length){
                    return hous[0].WAREHOUSE_NAME_CN;
                }
                return "";
            }


            //产品suk码变化时把字表的sku码也改变
            $scope.pskuCodeChange=function (code) {
   /*             $scope.gridOptions_UPC.data.for;
                saveModel.g_product_sku_fnsku=$scope.gridOptions_FNSKU.data;
                saveModel.g_product_sku_supplier=$scope.gridOptions_supplier.data;
                saveModel.g_product_sku_price=$scope.gridOptions_price.data;
                saveModel.g_next_cycle=[saveModel.g_next_cycle];
                saveModel.g_product_sku_declare=[saveModel.g_product_sku_declare];
                saveModel.g_product_sku_packing=[saveModel.g_product_sku_packing];*/
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
                //    errorMsg = '请输入最小起订量且要大于0';
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
                        return  Notification.error(transervice.tran('请选择条形编码的账号'));
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
                saveModel.g_next_cycle=saveModel.g_next_cycle?[saveModel.g_next_cycle]:[];
                saveModel.g_product_sku_declare=saveModel.g_product_sku_declare?[saveModel.g_product_sku_declare]:[];
                saveModel.g_product_sku_packing=saveModel.g_product_sku_packing?[saveModel.g_product_sku_packing]:[];

               return httpService.httpHelper(httpService.webApi.api, "master/product/prodsku","update", "POST", saveModel).then(function (datas) {
                    if (datas != null && datas.status == 200){
                        $scope.PSKU_ID=datas.data.PSKU_ID;
                        $scope.imagefilesCount = $('#imagefiles').fileinput('getFileStack').length;
                        $scope.wrapperfilesCount = $('#wrapperfiles').fileinput('getFileStack').length;
                        $scope.checkedfilesCount = $('#checkedfiles').fileinput('getFileStack').length;

                        $scope.count=($scope.imagefilesCount+$scope.wrapperfilesCount+$scope.checkedfilesCount);

                        if ($scope.imagefilesCount > 0) {
                            $('#imagefiles').fileinput('upload');
                        }
                        if ($scope.wrapperfilesCount > 0) {
                            $('#wrapperfiles').fileinput('upload');
                        }
                        if ($scope.checkedfilesCount > 0) {
                            $('#checkedfiles').fileinput('upload');
                        }

                        if(!$scope.count){
                            Notification.success(transervice.tran("保存成功"))
                            $modalInstance.close();
                        }
                    }else{
                        Notification.error({message: datas.message, delay: 5000});
                    }

                },function (datas) {
                    Notification.error({message: datas.message, delay: 5000});
                })



            }

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }

            //格式化数据
            function formatModel(model) {
                var packing=model.g_product_sku_packing;
                if(packing){
                    packing.PRODUCT_LONG=packing&&packing.PRODUCT_LONG?parseFloat(packing.PRODUCT_LONG):""
                    packing.PRODUCT_WIDE=packing&&packing.PRODUCT_WIDE?parseFloat(packing.PRODUCT_WIDE):""
                    packing.PRODUCT_HIGH=packing&&packing.PRODUCT_HIGH?parseFloat(packing.PRODUCT_HIGH):""
                    packing.PRODUCT_WEIGHT=packing&&packing.PRODUCT_WEIGHT?parseFloat(packing.PRODUCT_WEIGHT):""
                    packing.GIFT_BOX_LONG=packing&&packing.GIFT_BOX_LONG?parseFloat(packing.GIFT_BOX_LONG):""
                    packing.GIFT_BOX_WIDE=packing&&packing.GIFT_BOX_WIDE?parseFloat(packing.GIFT_BOX_WIDE):""
                    packing.GIFT_BOX_HIGH=packing&&packing.GIFT_BOX_HIGH?parseFloat(packing.GIFT_BOX_HIGH):""
                    packing.PRODUCT_GIFT_WEIGHT=packing&&packing.PRODUCT_GIFT_WEIGHT?parseFloat(packing.PRODUCT_GIFT_WEIGHT):""
                    packing.PACKING_LONG=packing&&packing.PACKING_LONG?parseFloat(packing.PACKING_LONG):""
                    packing.PACKING_WIDE=packing&&packing.PACKING_WIDE?parseFloat(packing.PACKING_WIDE):""
                    packing.PACKING_HIGH=packing&&packing.PACKING_HIGH?parseFloat(packing.PACKING_HIGH):""
                    packing.PACKING_NUMBER=packing&&packing.PACKING_NUMBER?parseFloat(packing.PACKING_NUMBER):""
                    packing.NET_WEIGHT=packing&&packing.NET_WEIGHT?parseFloat(packing.NET_WEIGHT):""
                    packing.GROSS_WEIGHT=packing&&packing.GROSS_WEIGHT?parseFloat(packing.GROSS_WEIGHT):""
                    packing.CABINET_NUMBER=packing&&packing.CABINET_NUMBER?packing.CABINET_NUMBER:"";
                }


                var cycle=model.g_next_cycle;
                if(cycle){
                    cycle.DELIVERY=cycle&&cycle.DELIVERY?parseFloat(cycle.DELIVERY):""
                    cycle.STOCKING=cycle&&cycle.STOCKING?parseFloat(cycle.STOCKING):""
                    cycle.SHELF_TIME=cycle&&cycle.SHELF_TIME?parseFloat(cycle.SHELF_TIME):""
                    cycle.TRANSPORT=cycle&&cycle.TRANSPORT?parseFloat(cycle.TRANSPORT):""
                    cycle.PLAN_TIME=cycle&&cycle.PLAN_TIME?parseFloat(cycle.PLAN_TIME):""
                }

            }



        });

    })