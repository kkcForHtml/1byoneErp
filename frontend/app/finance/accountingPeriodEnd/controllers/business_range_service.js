/**
 * Created by Administrator on 2017/6/26.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/gridTableDirt',
        'app/common/Services/commonService',
        'app/common/Services/configService',
        'app/common/Services/gridDefaultOptionsService',
    ],
    function (angularAMD) {

        angularAMD.service(
           'business_range_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "business_rangeCtrl",
                            backdrop: "static",
                            size: "lg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/finance/accountingPeriodEnd/views/business_range.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("business_rangeCtrl", function ($scope,model, amHttp, $filter, $modalInstance, transervice, uiGridConstants, httpService,gridDefaultOptionsService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'ACCOUNTING_PERIOD',
                        displayName: transervice.tran('期间'),
                        enableCellEdit: false,

                    },
                    {
                        field: 'START_AT',
                        displayName: transervice.tran('开始日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",
                        enableCellEdit: false,
                    },
                    {
                        field: 'END_AT',
                        displayName: transervice.tran('结束日期'),
                        type: 'date',
                        cellFilter: "date:'yyyy-MM-dd'",
                        enableCellEdit: false,
                    },
                    {
                        field: 'ACCOUNTING_STATE',
                        displayName: transervice.tran('关账'),
                        enableCellEdit: false,

                    },

                ],
                enablePaginationControls: false, //使用默认的底部分页
            };


            if(model){

                //获取传过来的数据筛选出组织code
               	var ORGANISATION_ID = model.ORGANISATION_ID, years = model.YEARS;
                var datam = {
                    "where":["and",["=","ORGANISATION_ID",ORGANISATION_ID],["=","YEARS",years]],
                    "orderby":"ACCOUNTING_PERIOD asc",

                }
                gridDefaultOptionsService.getDefaultOptions($scope,$scope.gridOptions);
                httpService.httpHelper(httpService.webApi.api, "finance/accountingperiod", "index" ,"POST", datam).then(function (datas) {
                    $scope.gridOptions.data = [];
                    var getAccountingCN =["第一期","第一期","第二期","第三期","第四期","第五期","第六期","第七期","第八期","第九期","第十期","第十一期","第十二期"];
                    var getAccountingStateCN = ['是','否'];
                    if (datas.data.length > 0) {
                        $scope.gridOptions.totalItems = datas._meta.totalCount;
                        for(var i=0;i<datas.data.length;i++){
                            var d =datas.data[i];
                            d.rowEntity = $scope.rowEntity;
                            d.ACCOUNTING_PERIOD = getAccountingCN[d.ACCOUNTING_PERIOD];
                            d.START_AT = d.START_AT?$filter("date")(new Date(d.START_AT*1000),"yyyy-MM-dd"):"";
                            d.START_AT = kendo.toString(new Date(d.START_AT),"yyyy-MM-dd");
                            d.END_AT = d.END_AT?$filter("date")(new Date(d.END_AT*1000),"yyyy-MM-dd"):"";
                            d.ACCOUNTING_STATE = getAccountingStateCN[d.ACCOUNTING_STATE];
                            d.copyObject = angular.copy(d);
                        }
                        $scope.gridOptions.data = datas.data;
                    }
                });
            }

            $scope.getAccountingCN = {"1":"第一期","3":"第三期","4":"第四期","5":"第五期","6":"第六期","7":"第七期","8":"第八期","9":"第九期","10":"第十期","11":"第十一期","12":"第十二期"};

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };
        });


    });
