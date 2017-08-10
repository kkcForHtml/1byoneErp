define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/commonService',
        'css!bowerLibs/bootstrap-fileinput/css/fileinput.min.css',
        'fileinput-zh',
        'bowerLibs/common/uploadConfig',
        'app/common/Services/commonService',
    ],
    function (angularAMD) {

        angularAMD.service(
            'commonSKU_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "commonSKU_add_Ctrl",
                            backdrop: "static",
                            size: "llg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/product/views/commonSKU_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("commonSKU_add_Ctrl", function ($scope, $confirm, $filter, $timeout, amHttp, httpService, $modalInstance, Notification, transervice, $http, $q, $interval,model,commonService ,gridDefaultOptionsService,configService) {


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
                $scope.model = {
                    CSKU_NAME_CN: "",
                    UNIT_ID: 0,
                    CSKU_NAME_EN: "",
                    bigTypeId:0,
                    smallTypeId: 0,
                    CSKU_STATE:'1'
                }
                if(model){
                    angular.extend($scope.model,model);
                }
                var   datam={
                         limit:"*"
                        };
                httpService.httpHelper(httpService.webApi.api, "master/basics/unit", "index", "POST",datam).then(
                    function (units) {
                        $scope.units=units.data;
                        $scope.units.unshift({
                            UNIT_ID:0,
                            UNIT_NAME_CN:"请选择"
                        })

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
                            if(model){
                                $scope.bigTypeChange();
                                $scope.model.smallTypeId=model.smallTypeId;
                            }


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
                $scope.CSKU_ID = 0;
                $scope.FinINput = true;
                $scope.FileDownShow = 'none';
                $scope.FinINputRemoveClass =  'btn btn-xs btn-default';
                angular.init($("#imagefiles_add"), {
                    uploadExtraData :function (previewId, index) {
                        return { PRODUCT_ID :$scope.CSKU_ID, FILE_TYPE_ID :1 };
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
                initInputFile();
            });


                $scope.gridOptions = {
                    columnDefs: [
                        {
                            field: 'edit',
                            displayName: transervice.tran('操作'),
                            cellTemplate:'<a class="btn btn-link" ng-click="" ng-disabled="!row.entity.PSKU_ID"><i class="fa fa-fw fa-pencil"></i></a>',
                            enableCellEdit: false
                        }, {
                            field: 'ORGAN_ID_DEMAND',
                            displayName: transervice.tran('*需求组织'),
                            cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.getOrganisationName(row.entity.ORGAN_ID_DEMAND)}}</div>',
                            // cellFilter: 'gridFieldFilter:row:col:"ORGANISATION_CODE":"ORGANISATION_NAME_CN":row.entity.rowEntity.organizations',
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
                    ],
                    enablePagination: false, //是否分页，默认为true
                    enablePaginationControls: false, //使用默认的底部分页

                };

            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);


            //获取组织架构名称
            $scope.getOrganisationName=function(id){
                if(!$scope.organizations) return "";
                var ors=$scope.organizations.filter(o=>o.ORGANISATION_ID==id);
                if(ors.length){
                    return ors[0].ORGANISATION_NAME_CN;
                }
            }

            //获取状态名称
            $scope.getStateName=function (id) {
                var states=$scope.states.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            }



            //保持方法
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
                    errorMsg = '请选择单位'
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


                for(var i=0;i<$scope.gridOptions.data.length;i++){
                    var d=$scope.gridOptions.data[i];
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



                $scope.model.g_product_sku=$scope.gridOptions.data;
                return httpService.httpHelper(httpService.webApi.api, "master/product/currensku","create", "POST", $scope.model).then(function (datas) {
                    if(datas!= null && datas.status == 200){
                        $scope.CSKU_ID=datas.data.CSKU_ID;
                        $scope.count = $('#imagefiles_add').fileinput('getFileStack').length;
                        if ($scope.count > 0) {
                            $('#imagefiles_add').fileinput('upload');
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

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            }


            $scope.subAdd=function () {

                $scope.gridOptions.data.unshift({
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
                var rows=$scope.gridOptions.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择您要操作的数据！'));
                }

                $scope.gridOptions.data=$scope.gridOptions.data.filter(d=>$.inArray(d,rows)==-1);

                if(!$scope.gridOptions.data.length){
                    $scope.gridOptions.gridApi.selection.clearSelectedRows();
                }

            }




        });
    })