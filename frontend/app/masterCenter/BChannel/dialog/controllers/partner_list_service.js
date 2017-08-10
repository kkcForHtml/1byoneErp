/**
 * Created by Administrator on 2017/5/26.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp'
    ],
    function (angularAMD) {
        angularAMD.service(
            'partner_list_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "partner_list_ctrl",
                            backdrop: "static",
                            //size: "lg",//lg,sm,md,llg,ssm,
                            size: "1000px",//lg,sm,md,llg,ssm
                            templateUrl: 'app/masterCenter/BChannel/dialog/views/partner_list.html?ver='+_version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("partner_list_ctrl", function ($scope, amHttp, model, $timeout, $modalInstance, Notification, transervice, httpService,commonService) {
            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PARTNER_CODE',
                        displayName: transervice.tran('伙伴编码'),
                        width:80,
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'pa_partner_classify.CLASSIFY_NAME_CN',
                        displayName: transervice.tran('伙伴分类'),
                        cellTemplate:'<span>{{row.entity.pa_partner_classify?row.entity.pa_partner_classify.CLASSIFY_NAME_CN:null}}</span>',
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'PARTNER_NAME_CN',
                        width:180,
                        displayName: transervice.tran('伙伴公司名称'),
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'PARTNER_ANAME_CN',
                        width:80,
                        displayName: transervice.tran('简称'),
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'b_money.MONEY_NAME_CN',
                        displayName: transervice.tran('默认币种'),
                        cellTemplate:'<span>{{row.entity.b_money?row.entity.b_money.MONEY_NAME_CN:null}}</span>',
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'PARTNER_LEGAL',
                        displayName: transervice.tran('法人代表'),
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'PARTNER_ADDRESS',
                        width:150,
                        displayName: transervice.tran('地址'),
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                    {
                        field: 'PARTNER_STATE', displayName: '是否启用',
                        cellTemplate:'<span>{{grid.appScope.getStateName(row.entity.PARTNER_STATE)}}</span>',
                        width:80,
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    }
                ],
                paginationPageSizes: [20, 50, 100], //每页显示个数可选项
                paginationCurrentPage: 1, //当前页码
                paginationPageSize: 20, //每页显示个数
                useExternalPagination: true,//是否使用分页按钮,
                enableFullRowSelection : true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
                multiSelect: false,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    //分页按钮事件
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (getPage) {
                            getPage(newPage, pageSize);
                        }
                    });
                    //行选中事件
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if (row) {
                            $scope.testRow = row.entity;
                        }
                    });
                }
            };

            $scope.stateList = commonService.getDicList("STATE");//是否启用
            $scope.init  = function(currentPage, pageSize){
                var selectWhere = null;
                if($scope.searchWhere){
                    $scope.searchWhere.limit = pageSize ? pageSize : $scope.gridOptions.paginationPageSize;
                    selectWhere = $scope.searchWhere;
                }else{
                    selectWhere = {
                        "where":["and",["=","pa_partner.DELETED_STATE",0]],
                        "joinwith":["pa_partner_classify","b_money"],
                        "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                    };
                }
                httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "index", "POST", selectWhere).then(function (result) {
                    $scope.gridOptions.totalItems = result._meta.totalCount;
                    $scope.gridOptions.data = result.data;
                })
            };
            $scope.init();
            //获取状态名称
            $scope.getStateName=function (id) {
                var states=$scope.stateList.filter(c=>c.D_VALUE==id);
                if(states.length){
                    return states[0].D_NAME_CN;
                }
                return "";
            };

            //确定
            $scope.confirm = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran('请选择您要添加的数据！'));
                }
                $modalInstance.close(rows[0]);
            };

            //模糊搜索
            $scope.searchPartner = function () {
                if($scope.searchCondition){
                    var seleteLike = ["or",["like","pa_partner.PARTNER_CODE",$scope.searchCondition],["like","pa_partner.PARTNER_NAME_CN",$scope.searchCondition],["like","pa_partner.PARTNER_ANAME_CN",$scope.searchCondition]]
                    $scope.searchWhere = {
                        "where":["and",["=","pa_partner.DELETED_STATE",0],seleteLike],
                        "joinwith":["pa_partner_classify","b_money"]
                    }
                }else{
                    $scope.searchWhere = null;
                }
                $scope.init();
            };
            $scope.exit= function () {
                $modalInstance.dismiss(false);
            };
            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };
            //页码改变时触发方法
            function getPage(currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }


        });
    });


