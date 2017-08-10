define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'css!bowerLibs/bootstrap-fileinput/css/fileinput.min.css',
        'fileinput-zh',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/commonService',
        'app/masterCenter/product/controllers/commonSKU_add_service',
        'app/masterCenter/product/controllers/productSKU_edit_service',
        'app/common/Services/gridDefaultOptionsService'
    ],
    function (angularAMD) {

        angularAMD.service(
            'commonSKU_edit_service',
            function ($q, $modal) {
                this.showDialog = function (id) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "commonSKU_edit_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/product/views/commonSKU_edit.html?ver='+_version_,
                            resolve: {
                                id:function () {
                                    return id;
                                },
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("commonSKU_edit_Ctrl", function ($scope, $confirm, $filter, $timeout, amHttp, httpService,id, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,commonSKU_add_service,productSKU_edit_service,gridDefaultOptionsService,configService) {


            //状态
            $scope.states=commonService.getDicList("STATE");
            $scope.rowEntity={organizations:[]};
            //获取需求组织，默认采购组织
            (function() {
                // var dataSearch = {
                //     "where":["and",["=","o_organisation_relation_middle.ENTITY_STATE",1],["=","o_organisation_relation_middle.FUNCTION_ID",4]],
                //     "joinwith":["o_organisationt"]
                // };
                // httpService.httpHelper(httpService.webApi.api, "organization/organisationrm", "index", "POST", dataSearch).then(function (datas) {
                //     $scope.organizations=datas.data.filter(a=>a.o_organisationt).map(a=>a.o_organisationt);
                //     $scope.rowEntity.organizations=$scope.organizations
                // });
                configService.getOrganisationList([4]).then(function (ors) {
                    $scope.organizations=ors;
                    $scope.rowEntity.organizations=$scope.organizations;
                })

            })();

            function init() {

                httpService.httpHelper(httpService.webApi.api, "master/product/currensku","view?id="+id, "POST",{}).then(function (datas) {

                    $scope.model=datas.data;
                    $scope.CSKU_ID=$scope.model.CSKU_ID;
                    var typeIds=$scope.model.PRODUCT_TYPE_PATH.split(",");
                    if(typeIds.length){
                        $scope.model.bigTypeId=typeIds[0];


                    }


                    $scope.gridOptions_edit.getPage();//获取产品SKU
                    initInputFile();

                    var dataSearch = {
                        "where": ["=", "g_product_type.PRODUCT_TYPE_STATE", 1],
                        "andwhere":{"g_product_type.PRODUCTOT_TYPE_ID":0},
                         distinct:1,
                        "joinwith":["g_product_types_2"]
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
                        $scope.bigTypeChange();
                        if(typeIds.length>1){
                            $scope.model.smallTypeId=typeIds[1];
                        }
                        $scope.copyModel=angular.copy($scope.model);
                    });

                },function (datas) {
                    Notification.error({message: datas.message, delay: 5000});
                })

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
                $scope.CSKU_ID=$scope.model.CSKU_ID;
                $scope.FinINput = true;
                $scope.FileDownShow = '';
                $scope.FinINputRemoveClass =  'btn btn-xs btn-default';
                httpService.httpHelper(httpService.webApi.api, "common/base/filesmiddle", "index", "POST", { where: { PRODUCT_ID: $scope.CSKU_ID, FILE_TYPE_ID: 1 }, limit: 0, joinWith: ['photos'] }).then(
                    function (data) {
                        var preConfigList = new Array();
                        var preList = new Array();
                        $scope.fileinfo = data.data;
                        angular.forEach(data.data, function (obj) {
                            if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG|bmp)$/.test(obj.photos.name)) {
                     // 非图片类型的展示
                                preList.push("<div class='file-preview-other-frame' style=\"width:auto;height:160px;\"><div class='file-preview-other'><span class='file-icon-4x'><i class='fa fa-file-text-o text-info' style=\"font-size:100px\"></i></span></div></div>");
                            } else {
                       // 图片类型
                                preList.push("<img src=\"" + httpService.imgUri + "/budget" + obj.photos.url + "\" class=\"kv-preview-data file-preview-image\" style=\"width:auto;height:160px;\">");
                            }
                            var tjson = {
                                caption: obj.photos.name, // 展示的文件名
                                size: obj.photos.size,
                                url: httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "delete?id=" + obj.FILES_MIDDLE_ID, // 删除url
                                key: httpService.imgUri + "/budget" + obj.photos.url,
                                show:true
                            };

                            preConfigList.push(tjson);
                        });
                        angular.init($("#imagefiles"), {
                            uploadExtraData: function (previewId, index) {
                                return { PRODUCT_ID: $scope.CSKU_ID, FILE_TYPE_ID: 1 };
                            },
                            fileActionSettings: { showRemove: $scope.FinINput, showZoom: false, removeClass: $scope.FinINputRemoveClass },
                            browseOnZoneClick: $scope.FinINput,
                            uploadUrl: httpService.baseUri + httpService.webApi.api + "/" + "common/base/filesmiddle" + "/" + "create",
                            initialPreviewConfig: preConfigList,
                            initialPreview: preList,
                            otherActionButtons: '<a href={dataKey}  target="_blank" title="下载"  class="btn btn-xs btn-default" download="{caption}" style="display: ' + $scope.FileDownShow + '"><i class="glyphicon glyphicon-download text-info"></i></a>',
                        }).on('fileuploaded', function (event, data, previewId, index) {
                            $('div.file-preview-thumbnails #' + previewId).attr('server_id', data.response.data.FILES_MIDDLE_ID);
                        }).on('filebatchselected', function(event, files) {
                            $('.file-live-thumbs .file-footer-buttons a').hide();//选择完事件
                        }).on('filesuccessremove', function (event, FILES_MIDDLE_ID) {
                            event.preventDefault();
                            var dp = $('div.file-preview-thumbnails #' + FILES_MIDDLE_ID).attr('server_id');
                            httpService.httpHelper(httpService.webApi.api + "/" + "common/base", "filesmiddle", 'delete?id=' + dp, "POST", {}).then(
                                function (data) {
                                    if (data != null && data.status == 200) {
                                        $('#' + FILES_MIDDLE_ID).fadeOut(300, function () {
                                            $(this).remove();
                                        });
                                    } else {
                                        $('#' + FILES_MIDDLE_ID).addClass('btn-danger').find('.file-actions').html(data.message);
                                    }
                                },
                                function (data) {
                                    $('#' + FILES_MIDDLE_ID).addClass('btn-danger').find('.file-actions').html(data.message);
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

                        }).on('filebatchselected', function(event, files) {

                            var parentDom=$(event.target).parent();
                            var contentDiv=parentDom.find('.file-live-thumbs .file-preview-frame:last .kv-file-content');//选择完事件
                            var td=contentDiv.find("textarea");
                            var obj=contentDiv.find("object");
                            if(td.length||obj.length){
                                contentDiv.html('<div class="file-preview-other-frame" style="width:auto;/* height:160px; */"><div class="file-preview-other"><span class="file-icon-4x"><i class="fa fa-file-text-o text-info" style="font-size:100px"></i></span></div></div>')
                            }

                        });
                        if (preConfigList.length == 0) {
                            $('.file-preview-thumbnails').html("");
                        }
                    });

            };

            // $scope.$watch('$viewContentLoaded', function () {
            //     initInputFile();
            // });

       //产品SKU列表配置
                $scope.gridOptions_edit = {
                    columnDefs: [
                        {
                            field: 'edit',
                            displayName: transervice.tran('操作'),
                            cellTemplate:'<a class="btn btn-link"  ng-disabled="!row.entity.PSKU_ID" ng-click="grid.appScope.subEdit(row.entity)"><i class="fa fa-fw fa-pencil"></i></a>',
                            enableCellEdit: false
                        }, {
                            field: 'ORGAN_ID_DEMAND',
                            displayName: transervice.tran('*需求组织'),
                            cellFilter: 'gridFieldFilter:row:col:"ORGANISATION_ID":"ORGANISATION_NAME_CN":row.entity.rowEntity.organizations',
                            // editableCellTemplate:'<div select-organisation-grid select-model="\'ORGAN_CODE_DEMAND\'" row="row" types="[4]" ></div>',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel:'ORGANISATION_ID',
                            editDropdownValueLabel: 'ORGANISATION_NAME_CN',
                            editDropdownRowEntityOptionsArrayPath: "rowEntity.organizations"
                        }, {
                            field: 'PSKU_CODE',
                            displayName: transervice.tran('*产品SKU'),
                        },
                        {field: 'PSKU_NAME_CN', displayName: transervice.tran('*中文名称')},
                        {field: 'PSKU_NAME_EN', displayName: transervice.tran('英文名称')},
                        {
                            field: 'PSKU_STATE',
                            displayName: transervice.tran('是否启用'),
                            cellTemplate:'<span>{{grid.appScope.getStateName(row.entity.PSKU_STATE)}}</span>',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel:'D_VALUE',
                            editDropdownValueLabel: 'D_NAME_CN',
                            editDropdownOptionsArray: $scope.states
                        }
                    ]

                };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_edit);

            $scope.gridOptions_edit.getPage= function (pageNo, pageSize) {

                // var pwhere={
                //     where:["<>","g_product_sku.DELETED_STATE",1],
                //     andwhere:["g_product_sku.CSKU_CODE",$scope.model.CSKU_CODE],
                //     limit:$scope.gridOptions_edit.paginationPageSize
                // }
                var pwhere={"where":["and",["=","g_product_sku.CSKU_ID",$scope.model.CSKU_ID]],
                             "limit":$scope.gridOptions_edit.paginationPageSize}
                httpService.httpHelper(httpService.webApi.api, "master/product/prodsku","index?page="+$scope.gridOptions_edit.paginationCurrentPage, "POST",pwhere).then(function (psku) {
                    psku.data=psku.data.sort((a,b)=>{
                        if(a.PSKU_STATE>b.PSKU_STATE) return 1;
                        if(a.PSKU_STATE<b.PSKU_STATE) return -1;
                        return 0;
                    })
                    $scope.gridOptions_edit.data=psku.data;
                    $scope.detailDataLength=psku.data.length;
                    $scope.gridOptions_edit.data.forEach(a=>{
                        a.rowEntity=$scope.rowEntity;
                        a.copyModel=angular.copy(a);
                    });
                    $scope.gridOptions_edit.totalItems=psku._meta.totalCount;
                })
            }

            $scope.gridOptions_edit.getGridApi=function(gridApi){
                  $scope.gridApi=gridApi;

            }

            //获取状态名称
            $scope.getStateName=function (id) {
                var states=$scope.states.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            }

            //复制按钮不可用方法
            $scope.copyDisabled=function () {

                if(!$scope.model){
                    return false;
                }
                if(!$scope.copyModel){
                    return false;
                }

                if($scope.model.CSKU_NAME_CN!=$scope.copyModel.CSKU_NAME_CN){
                    return true;
                }
                if($scope.model.UNIT_ID!=$scope.copyModel.UNIT_ID){
                    return true;
                }
                if($scope.model.CSKU_NAME_EN!=$scope.copyModel.CSKU_NAME_EN){
                    return true;
                }
                if($scope.model.bigTypeId!=$scope.copyModel.bigTypeId){
                    return true;
                }
                if($scope.model.smallTypeId!=$scope.copyModel.smallTypeId){
                    return true;
                }
                if($scope.model.CSKU_STATE!=$scope.copyModel.CSKU_STATE){
                    return true;
                }
                if($scope.detailDataLength!=$scope.gridOptions_edit.data.length){
                    return true;
                }
                for(var i=0;i<$scope.gridOptions_edit.data.length;i++){
                    var item=$scope.gridOptions_edit.data[i];
                    if(item.ORGAN_ID_DEMAND != item.copyModel.ORGAN_ID_DEMAND ||
                        item.PSKU_ID != item.copyModel.PSKU_ID ||
                        item.PSKU_NAME_CN != item.copyModel.PSKU_NAME_CN ||
                        item.PSKU_NAME_EN != item.copyModel.PSKU_NAME_EN ||
                        item.PSKU_STATE != item.copyModel.PSKU_STATE
                    ){
                        return true;
                    }
                }
                return false;
            }

            //是否启用触发方法
            $scope.stateChange=function () {
                if($scope.model.CSKU_STATE){
                    $confirm({ text: transervice.tran('是否将各产品SKU一同生效？') })
                        .then(function () {
                          $scope.gridOptions_edit.data.forEach(d=>d.PSKU_STATE=1);
                            $scope.model.edit_type=1;
                        });
                }else{
                    $confirm({ text: transervice.tran('禁用通用SKU将连同各产品SKU一同被禁用，请确认是否禁用？') })
                        .then(function () {
                            $scope.gridOptions_edit.data.forEach(d=>d.PSKU_STATE=0);
                            $scope.model.edit_type=0;
                        });
                }
            }

            //获取组织架构名称
            $scope.getOrganisationName=function(id){
                if(!$scope.organizations) return "";
                var ors=$scope.organizations.filter(o=>o.ORGANISATION_ID==id);
                if(ors.length){
                    return ors[0].ORGANISATION_NAME_CN;
                }
            }

            //保存方法
            $scope.save=function(){
                var errorMsg="";
                if (!$scope.model.CSKU_CODE) {
                    errorMsg = '请输入通用SKU';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if (!$scope.model.CSKU_NAME_CN) {
                    errorMsg = '请输入中文名称';
                    Notification.error(transervice.tran(errorMsg));
                    return;
                }
                if (!$scope.model.UNIT_ID) {
                    errorMsg = '请选择单位';
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


                    for(var i=0;i<$scope.gridOptions_edit.data.length;i++){
                        var d=$scope.gridOptions_edit.data[i];
                    if(!d.PSKU_CODE){
                        Notification.error(transervice.tran("请填写产品SKU"));
                        return;
                    }

                    if(!d.ORGAN_ID_DEMAND){
                        Notification.error(transervice.tran("请选择需求组织"));
                        return;
                    }
                    if(!d.PSKU_NAME_CN){
                        Notification.error(transervice.tran("输入中文名称"));
                        return;
                    }

                }
                $scope.model.PRODUCT_TYPE_PATH=($scope.model.bigTypeId+($scope.model.smallTypeId?(","+$scope.model.smallTypeId):''));

                $scope.model.g_product_sku=$scope.gridOptions_edit.data;
                var saveDate={batchMTC:[$scope.model]};

             return   httpService.httpHelper(httpService.webApi.api, "master/product/currensku","update", "POST", saveDate).then(function (datas) {

                    if(datas!= null && datas.status == 200){
                        $scope.count = $('#imagefiles').fileinput('getFileStack').length;
                        if ($scope.count > 0) {
                            $('#imagefiles').fileinput('upload');
                        }else{
                            Notification.success(transervice.tran("保存成功"))
                            $modalInstance.close();
                        }
                    }else{
                        Notification.error({ message: datas.message, delay: 5000 });
                    }



                },function (datas) {
                    Notification.error({message: datas.message, delay: 5000});
                })



            }

            //复制功能
            $scope.copy=function () {

                var model=angular.copy($scope.model);
                delete  model.CSKU_ID;
                delete model.g_product_sku;
                commonSKU_add_service.showDialog(model).then(function () {
                    $modalInstance.close();
                })
            }

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }


            $scope.subAdd=function () {

                $scope.gridOptions_edit.data.unshift({
                    ORGAN_ID_DEMAND:"",
                    PSKU_CODE:"",
                    CSKU_ID:$scope.model.CSKU_ID,
                    PSKU_NAME_CN:$scope.model.CSKU_NAME_CN,
                    PSKU_NAME_EN:$scope.model.CSKU_NAME_EN,
                    PSKU_STATE:1,
                    DELETED_STATE:0,
                    rowEntity:angular.copy($scope.rowEntity)
                });
            }

            $scope.subDel=function(){
                var rows = $scope.gridOptions_edit.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要操作的数据！'));
                }
                //获取有id的数据
                var idRows=rows.filter(r => r.PSKU_ID);
                var noidRows=rows.filter(r=>!r.PSKU_ID);
                if(idRows.length){

                $confirm({text: transervice.tran('确认要删除所选择的数据吗？')}).then(function () {
                        var copyRows = angular.copy(idRows);
                            var delData = {batch: []};
                            copyRows.forEach(a=>{
                                var item={
                                    PSKU_ID:a.PSKU_ID,
                                    PSKU_CODE:a.PSKU_CODE
                                };
                                delData.batch.push(item);
                            })
                            var def=$q.defer();
                            httpService.httpHelper(httpService.webApi.api, "master/product/prodsku", "delete", "POST", delData,def).then(
                                function () {
                                    Notification.success(transervice.tran('删除成功！'));
                                   // $scope.gridOptions_edit.getPage();
                                    $scope.gridOptions_edit.data=$scope.gridOptions_edit.data.filter(d=>$.inArray(d,rows)==-1);
                                    if(!$scope.gridOptions_edit.data.length){
                                        $scope.gridOptions_edit.gridApi.selection.clearSelectedRows();
                                    }
                                }
                            );


                    });
                }else{
                    $scope.gridOptions_edit.data=$scope.gridOptions_edit.data.filter(d=>$.inArray(d,rows)==-1);
                    if(!$scope.gridOptions_edit.data.length){
                        $scope.gridOptions_edit.gridApi.selection.clearSelectedRows();
                    }
                }

                return def.promise;


            }

            $scope.subEdit=function(item){
                productSKU_edit_service.showDialog(item).then(function () {
                    $scope.gridOptions_edit.getPage();
                })
            }




        });
    })