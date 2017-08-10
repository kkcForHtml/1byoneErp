define(
    ['angularAMD',
    ],
    function (angularAMD) {

        angularAMD.service(
            'selectSupplier_service',
            function ($q, $modal) {
                this.showDialog = function (models) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "selectSupplier_Ctrl",
                            backdrop: "static",
                            size: "md",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/product/views/selectSupplier.html?ver='+_version_,
                            resolve: {
                                models: function () {
                                    return models;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("selectSupplier_Ctrl", function ($scope, models,$confirm, $filter, $timeout, amHttp, httpService, $modalInstance, Notification, transervice, $http, $q, $interval,commonService,gridDefaultOptionsService) {
            $scope.partnerCodes=models.map(p=>p.PARTNER_CODE);
            $scope.conditions={
                supplierType:0,
                supplierName:""
            };
            //获取供应商分类
            (function () {
                var selectWhere = {"where": ["and",["=","CLASSIFY_STATE",1]]};
                httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "index", "POST", selectWhere).then(
                    function (datas) {
                        $scope.supplierTypes=datas.data;
                        if(datas.data.length){
                            $scope.conditions.supplierType=$scope.supplierTypes[0].CLASSIFY_CODE;
                            init();
                        }


                    },function (datas) {
                        Notification.error({ message: datas.message, delay: 5000 });
                    })
            })();

            //供应商列表
            $scope.gridOptions_supplier={
                columnDefs: [
                    {
                        field: 'PARTNER_CODE',
                        displayName: transervice.tran('供应商编码'),
                        enableCellEdit: false,
                        cellClass: 'text-right',
                        cellTemplate:'<span style="margin-right: 10px">{{row.entity.PARTNER_CODE}}</span>'
                    },
                    {
                        field: 'PARTNER_NAME_CN',
                        displayName: transervice.tran('供应商名称'),
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    },{
                        field: 'PARTNER_ANAME_EN',
                        displayName: transervice.tran('简称'),
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    },
                    {
                        field: 'PARTNER_LEGAL',
                        displayName: transervice.tran('法人'),
                        enableCellEdit: false,
                        cellClass: 'text-center',
                    }
                ],
                multiSelect: false,// 是否可以选择多个,默认为true;
                paginationPageSizes: [10], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 10, //每页显示个数
            }
            gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions_supplier);

            $scope.gridOptions_supplier.getPage=function (pageNo,pageSize) {
                  init();
            }


            $scope.gridOptions_supplier.isRowSelectable = function(row){
                var index=$.inArray(row.entity.PARTNER_CODE,$scope.partnerCodes);
                    if(index==-1){
                        return true;
                    }
                    return false;
                };
            // $scope.gridOptions_supplier.selectRow=function (row) {
            //     if(row.isSelected)
            //         $scope.gridOptions_supplier.data.forEach(a=>{
            //             if(a!=row)$scope.gridApi.selection.unSelectRow(a)
            //         });
            //
            // }



            function init() {
                var selectWhere = {where: ["and",["=","PARTNER_STATE",1],["=","PARTNER_CLASSIFY_CODE",$scope.conditions.supplierType]],
                                    andFilterWhere:["or",["like","PARTNER_NAME_CN",$scope.conditions.supplierName],["like","PARTNER_ANAME_CN",$scope.conditions.supplierName]],
                                    limit: $scope.gridOptions_supplier.paginationPageSize,
                                   };
                // if($scope.conditions.supplierType){
                //     selectWhere.where.push(["like","PARTNER_CLASSIFY_CODE",$scope.conditions.supplierType]);
                // }
                // if($scope.conditions.supplierName){
                //     selectWhere.where.push(["like","PARTNER_ANAME_CN",$scope.conditions.supplierName]);
                // }
                httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "index?page="+$scope.gridOptions_supplier.paginationCurrentPage, "POST", selectWhere).then(
                    function (datas) {
                        if(!$scope.gridOptions_supplier.totalItems)
                            $scope.gridOptions_supplier.totalItems=datas._meta.totalCount;
                        $scope.gridOptions_supplier.data = datas.data;
                    },function (datas) {
                        Notification.error({ message: datas.message, delay: 5000 });
                    })
            }

            $scope.search=function(){
                if($scope.gridOptions_supplier.paginationCurrentPage!=1)
                   $scope.gridOptions_supplier.paginationCurrentPage=1;
                init();
            }

            $scope.cancel=function () {
                $modalInstance.dismiss(false);
            }
            $scope.save=function () {
                var rows=$scope.gridOptions_supplier.gridApi.selection.getSelectedRows();
                if(!rows.length){
                    return  Notification.error(transervice.tran('请选择供应商！'));
                }
                $modalInstance.close(rows[0]);
            }




        });
    })