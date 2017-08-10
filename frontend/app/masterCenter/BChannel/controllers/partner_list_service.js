/**
 * Created by Administrator on 2017/5/26.
 */
define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/Services/gridDefaultOptionsService',
        'app/common/Services/messageService',
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
                            templateUrl: 'app/masterCenter/bchannel/views/partner_list.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("partner_list_ctrl", function ($scope, amHttp, model, $timeout, $modalInstance, messageService, Notification, transervice, gridDefaultOptionsService, httpService, commonService) {

            if (model) {
                $scope.model = model;

            }

            //获取供应商分类
            (function () {
                var selectWhere = {"where": ["and", ["=", "CLASSIFY_STATE", 1]]};

                httpService.httpHelper(httpService.webApi.api, "master/partint/partnerc", "index", "POST", selectWhere).then(
                    function (datas) {
                        $scope.supplierTypes = datas.data;
                        $scope.supplierTypes.unshift({
                            CLASSIFY_NAME_CN: '全部',
                            CLASSIFY_ID: ''
                        });
                        $scope.supplierType = $scope.supplierTypes[0].CLASSIFY_ID;
                    })
            })();

            $scope.gridOptions = {
                columnDefs: [
                    {
                        field: 'PARTNER_CODE',
                        displayName: transervice.tran('伙伴编码'),
                        width: 80,
                        enableCellEdit: false,
                    },
                    {
                        field: 'pa_partner_classify.CLASSIFY_NAME_CN',
                        displayName: transervice.tran('伙伴分类'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.pa_partner_classify?row.entity.pa_partner_classify.CLASSIFY_NAME_CN:null}}</div>',
                        enableCellEdit: false,
                    },
                    {
                        field: 'PARTNER_NAME_CN',
                        width: 180,
                        displayName: transervice.tran('伙伴公司名称'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'PARTNER_ANAME_CN',
                        width: 80,
                        displayName: transervice.tran('简称'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'b_money.MONEY_NAME_CN',
                        displayName: transervice.tran('默认币种'),
                        cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.b_money?row.entity.b_money.MONEY_NAME_CN:null}}</div>',
                        enableCellEdit: false,
                    },
                    {
                        field: 'PARTNER_LEGAL',
                        displayName: transervice.tran('法人代表'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'PARTNER_ADDRESS',
                        width: 150,
                        displayName: transervice.tran('地址'),
                        enableCellEdit: false,
                    },
                    {
                        field: 'PARTNER_STATE', displayName: '是否启用',
                        cellTemplate: '<span>{{grid.appScope.getStateName(row.entity.PARTNER_STATE)}}</span>',
                        width: 80,
                        enableCellEdit: false,
                        cellClass: 'text-center'
                    },
                ],
                enableSelectAll: model.multiSelect?true:false,
                multiSelect: model.multiSelect?true:false,
            };
            gridDefaultOptionsService.getDefaultOptions($scope, $scope.gridOptions);
            $scope.stateList = commonService.getDicList("STATE");//是否启用
            $scope.init = function (currentPage, pageSize) {
                var selectWhere = null;
                if ($scope.searchWhere) {
                    $scope.searchWhere.limit = pageSize ? pageSize : $scope.gridOptions.paginationPageSize;
                    selectWhere = $scope.searchWhere;
                } else {
                    selectWhere = {
                        "where": ["and", ["<>", "pa_partner.PARTNER_STATE", 0]],
                        "joinwith": ["pa_partner_classify", "b_money"],
                        "limit": (pageSize ? pageSize : $scope.gridOptions.paginationPageSize)
                    };
                }
                selectWhere.orderby = "pa_partner.UPDATED_AT desc";
                selectWhere.limit = (pageSize ? pageSize : $scope.gridOptions.paginationPageSize);
                if ($scope.supplierType) {
                    selectWhere.where.push(['=', "pa_partner.CLASSIFY_ID", $scope.supplierType]);
                }
                if(model.data&&model.data.length){
                    selectWhere.push(["not in","pa_partner.PARTNER_ID",model.data.map(s=>s.PARTNER_ID)])
                }
                httpService.httpHelper(httpService.webApi.api, "master/partint/partner", "index?page=" + (currentPage ? currentPage : 1), "POST", selectWhere).then(function (result) {
                    $scope.gridOptions.totalItems = result._meta.totalCount;
                    $scope.gridOptions.data = result.data;
                    if (!currentPage) {
                        $scope.gridOptions.paginationCurrentPage = 1;
                    }
                })
            };
            $scope.init();
            //获取状态名称
            $scope.getStateName = function (id) {
                var states = $scope.stateList.filter(c=>c.D_VALUE == id);
                if (states.length) {
                    return states[0].D_NAME_CN;
                }
                return "";
            };

            //确定
            $scope.confirm = function () {
                var rows = $scope.gridOptions.gridApi.selection.getSelectedRows();
                if (!rows.length) {
                    return Notification.error(transervice.tran(messageService.error_empty));
                }
                if(model.multiSelect){
                    $modalInstance.close(rows);
                }else{
                    $modalInstance.close(rows[0]);
                }

            };

            //模糊搜索
            $scope.searchPartner = function () {
                if ($scope.searchCondition) {
                    var seleteLike = ["or",
                        ["like", "pa_partner.PARTNER_CODE", $scope.searchCondition],
                        ["like", "pa_partner.PARTNER_ANAME_CN", $scope.searchCondition],
                        ["like", "pa_partner.PARTNER_ANAME_CN", $scope.searchCondition]]
                    $scope.searchWhere = {
                        "where": seleteLike,
                        "joinwith": ["pa_partner_classify", "b_money"]
                    }
                } else {
                    $scope.searchWhere = null;
                }
                $scope.gridOptions.paginationCurrentPage = 1;
                $scope.init();
            };

            $scope.exit = function () {
                $modalInstance.dismiss(false);
            };

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };

            //页码改变时触发方法
            $scope.gridOptions.getPage = function (currentPage, pageSize) {
                $scope.init(currentPage, pageSize);
            }

        });
    });


