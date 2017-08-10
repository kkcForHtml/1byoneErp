/**
 * Created by Administrator on 2017/5/8.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        "app/masterCenter/bchannel/controllers/partner_list_service",
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService',
    ],
    function (angularAMD) {

        angularAMD.service(
            'organisation_add_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "organisation_add_Ctrl",
                            backdrop: "static",
                            size: "75%",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/organisation/views/organisation_add.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }

                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("organisation_add_Ctrl", function ($scope, amHttp, model, $timeout,$confirm, $modalInstance,messageService,gridDefaultOptionsService, Notification,uiGridConstants,transervice, httpService,$q, $interval,partner_list_service) {
            $scope.groupGridOption = {
                enableSorting: false,
                enableRowSelection: true,
                columnDefs: [
                    {field: 'GROUPING_NAME_CN', displayName: transervice.tran('分组名称')},
                    {field: 'GROUPING_REMARKS', displayName: transervice.tran('备注说明')}
                ],
                /*paginationPageSizes: [10, 20, 50], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10, //每页显示个数*/
                //---------------api---------------------
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
                }
            };
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.groupGridOption);
            $scope.saveRow = function (rowEntity) {
                // create a fake promise - normally you'd use the promise returned by $http or $resource
                var promise = $q.defer();
                $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
                promise.reject();
            };

            if (model) {
                $scope.model = angular.copy(model);
                var selectWhere = {
                    "where": ["<>", "ORGANISATION_STATE", 0],
                    "andwhere": ["like", "ORGANISATION_ACCOUNTING", "1"],
                    "limit": 0
                };
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "index", "POST", selectWhere).then(function (result) {
                    $scope.model.legalList = [{"ORGANISATION_ID":"","ORGANISATION_NAME_CN":"请选择"}].concat(result.data);
                });

                $scope.model.isShow = true;
                $scope.model.AREA_ID = "";
                $scope.model.COUNTRY_ID ="";
                $scope.model.ORGANISATIONOT_ID ="";
                if($scope.model.isRoot){
                    $scope.model.accOrgList.forEach(d=>{if(d.D_VALUE==3){d.isDisable=true}})
                }
                var areaList = [];
                areaList = $scope.model.addressList.filter(d=>{
                    return d.AREA_ID == $scope.model.AREA_ID;
                });
                $scope.model.AREA_ID = areaList.length>0?areaList[0].AREA_ID:null;
                $scope.model.addressList2 = areaList.length>0?areaList[0].b_areas:[];
                var  countryCode = [];
                if($scope.model.addressList2.length>0){
                    countryCode = $scope.model.addressList2.filter(d=>{
                        return d.AREA_ID == $scope.model.COUNTRY_ID;
                    });
                }
                $scope.model.COUNTRY_ID = countryCode.length>0?countryCode[0].AREA_ID:null;

                $scope.model.ORGANISATION_STATE = "1";
                if ($scope.model.o_grouping != null) {
                    $scope.groupGridOption.data = $scope.model.o_grouping;
                }
                var selectString = "";       //转换成的字符串存入数据库
                //核算组织触发事件
                $scope.accSelect = function (id, event) {
                    var action = event.target;
                    if (action.checked) {
                        $scope.model.accOrgList.forEach(d=>{
                            if(d.D_VALUE!=id){
                                d.isChecked = false;
                            }
                        })//选中，就添加
                        selectString = id;
                    } else {
                        selectString = "";
                    }
                    $scope.model.ORGANISATION_ACCOUNTING = selectString;
                    $scope.model.isShow = ($scope.model.ORGANISATION_ACCOUNTING.indexOf(1)!=-1||$scope.model.ORGANISATION_ACCOUNTING.indexOf(3)!=-1 )?false:true;
                };
                var result2 = [];
                var selectString2 = "";
                //业务组织触发事件
                $scope.businessSelect = function (id, event) {
                    var action = event.target;
                    if (action.checked) {                 //选中，就添加
                        if (result2.indexOf(id) == -1) {   //不存在就添加
                            result2.push(id);
                        }
                    } else {//去除就删除result里
                        var idx = result2.indexOf(id);
                        if (idx != -1) {//不存在就添加
                            result2.splice(idx, 1);
                        }
                    }
                    if (result2.length > 0) {
                        selectString2 = result2.join(",");
                        $scope.model.ORGANISATION_BUSINESS = selectString2;
                    }
                }

            }
            //地区国家二级联动
            $scope.changeSelect = function (AREA_ID) {
                $scope.model.COUNTRY_ID = "";
                for (var i = 0; i < $scope.model.addressList.length; i++) {
                    var obj = $scope.model.addressList[i];
                    if (obj.AREA_ID == AREA_ID) {
                        $scope.model.addressList2 =[{"AREA_ID":"","AREA_NAME_CN":"请选择"}].concat(obj.b_areas);
                        break;
                    }
                }
            };

            $scope.changeTariff = function(){
                if($scope.model.TARIFF && $scope.model.TARIFF.length>0&&$scope.model.TARIFF>=0){
                    $scope.model.TARIFF = $scope.model.TARIFF+"%";
                }
            }

            //分组grid添加空行
            $scope.addGroup = function () {
                var newData = {
                    "GROUPING_NAME_CN": null
                };
                $scope.groupGridOption.data.unshift(newData);
            };
            //分组grid删除行
            $scope.moveGroup = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                $scope.groupGridOption.data = $scope.groupGridOption.data.filter(a=>$.inArray(a, rows) == -1);
                $scope.gridApi.selection.clearSelectedRows();
            };

            //保存
            $scope.save = function () {
                if($scope.model.ORGANISATION_ACCOUNTING=="2"&&($scope.model.ORGANISATIONOT_ID==null||$scope.model.ORGANISATIONOT_ID.length==0)){
                    return Notification.error(transervice.tran('请输入所属法人'));
                }
                if ($scope.model.ORGANISATION_CODE == null || $scope.model.ORGANISATION_CODE.length==0 ) {
                    Notification.error(transervice.tran('请输入编码'));
                    return;
                }
                if ($scope.model.ORGANISATION_NAME_CN == null || $scope.model.ORGANISATION_NAME_CN.length==0) {
                    Notification.error(transervice.tran('请输入名称'));
                    return;
                }
                if ($scope.model.ORGANISATION_FORM_ID == null || $scope.model.ORGANISATION_FORM_ID.length==0) {
                    Notification.error(transervice.tran('请输入形态'));
                    return;
                }
                if ($scope.model.ORGANISATION_NAME_EN == null || $scope.model.ORGANISATION_NAME_EN.length==0) {
                    Notification.error(transervice.tran('请输入报表名称'));
                    return;
                }
                if ($scope.model.AREA_ID == null || $scope.model.AREA_ID.length==0) {
                    Notification.error(transervice.tran('请输入地区'));
                    return;
                }
                if ($scope.model.COUNTRY_ID == null || $scope.model.COUNTRY_ID.length==0) {
                    Notification.error(transervice.tran('请输入国家'));
                    return;
                }
                if($scope.model.PHONE && $scope.model.PHONE.length>0){
                    var re = /^[1-9]+[0-9]*]*$/;
                    if (!re.test($scope.model.PHONE)) {
                        Notification.error(transervice.tran('请输入有效联系电话！'));
                        return;
                    }
                }
                if ($scope.groupGridOption.data && $scope.groupGridOption.data.length > 0) {
                    var data = [];
                    $scope.groupGridOption.data.forEach(d=>{
                        if(d.GROUPING_NAME_CN && d.GROUPING_NAME_CN.length>0){
                            data.push(d);
                        }
                    });
                    $scope.model.o_grouping = data;
                }
                if($scope.model.HEADER_STATE){
                    $scope.model.HEADER_STATE = 1;
                }else{
                    $scope.model.HEADER_STATE = 0;
                }
                if($scope.model.TARIFF!=null){
                    $scope.model.TARIFF = Number($scope.model.TARIFF)/100;

                }
               var newData = {
                    "ORGANISATION_CODE":$scope.model.ORGANISATION_CODE,
                    "ORGANISATION_NAME_CN":$scope.model.ORGANISATION_NAME_CN,
                    "CONTACT":$scope.model.CONTACT,
                    "PHONE":$scope.model.PHONE,
                    "ORGANISATION_FORM_ID":$scope.model.ORGANISATION_FORM_ID,
                    "FAX":$scope.model.FAX,
                    "ORGANISATION_NAME_EN":$scope.model.ORGANISATION_NAME_EN,
                    "HEADER_STATE":$scope.model.HEADER_STATE,
                    "AREA_ID":$scope.model.AREA_ID,
                    "COUNTRY_ID":$scope.model.COUNTRY_ID,
                    "TARIFF":$scope.model.TARIFF,
                    "ORGANISATION_STATE":$scope.model.ORGANISATION_STATE,
                    "ADDRESS":$scope.model.ADDRESS,
                    "ORGANISATION_REMARKS":$scope.model.ORGANISATION_REMARKS,
                    "ORGANISATION_BUSINESS":$scope.model.ORGANISATION_BUSINESS,
                    "ORGANISATION_ACCOUNTING":$scope.model.ORGANISATION_ACCOUNTING,
                    "ORGANISATIONOT_ID":$scope.model.ORGANISATIONOT_ID,
                    "PARTNER_ID":$scope.model.PARTNER_ID,
                    "INIT_STATE":0,
                    "o_grouping":$scope.model.o_grouping
                };

                return httpService.httpHelper(httpService.webApi.api, "organization/organisation", "create", "POST",newData).then(
                    function (result) {
                        Notification.success(transervice.tran(result.message));
                        $modalInstance.close($scope.model);//返回数据
                    })
            };
            //查询伙伴列表
            $scope.searchPartner = function () {
                var model = {multiSelect :null};
                partner_list_service.showDialog(model).then(function(data){
                    $scope.model.PARTNER_ID = data?data.PARTNER_ID:null;
                    $scope.model.PARTNER_NAME_CN = data?data.PARTNER_NAME_CN:null;
                    $scope.model.PARTNER_NAME = data?data.PARTNER_ID+"_"+data.PARTNER_ANAME_CN:null;
                });
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.close($scope.model);//返回数据
                //$modalInstance.dismiss(false);
            };

        });
    });
