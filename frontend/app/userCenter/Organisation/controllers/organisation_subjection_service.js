define(
    ['angularAMD',
        'app/common/Services/AmHttp',
        'app/common/directives/angular.treeview',
        'app/userCenter/organisation/controllers/organisation_business_service'
    ],
    function (angularAMD) {
        angularAMD.service(
            'organisation_subjection_service',
            function ($q, $modal) {
                this.showDialog = function (model) {
                    return $modal
                        .open({
                            animation: true,
                            controller: "organisation_subjection_Ctrl",
                            backdrop: "static",
                            size: "lg",//lg,sm,md,llg,ssm
                            templateUrl: 'app/userCenter/organisation/views/organisation_subjection.html?ver=' + _version_,
                            resolve: {
                                model: function () {
                                    return model;
                                }
                            }
                        }).result;
                };
            }
        );
        angularAMD.controller("organisation_subjection_Ctrl", function ($scope, amHttp, model, commonService,$filter, $modalInstance, Notification, transervice, httpService, organisation_business_service) {
            if (model != null) {
                $scope.model = model;
            }
            $scope.model.busOrgList = commonService.getDicList("ORGANISATION_RELATION");
            //初始化
            /*$scope.model.ORGANISATION_STATE = "1";*/
            $scope.isSelectedOptionDisabled = true;
            $scope.isTreeNull = true;
            $scope.isFirstNode = false;
            $scope.isTopSelectedItem = true;
            $scope.isDownSelectedItem = true;
            $scope.rightSelectedItems = [];
            $scope.leftSelectedItems = null;
            $scope.setLongForm = function () {
                if ($scope.model.isChecked) {

                    /*var d = new Date();
                    d.setFullYear(2099, 11, 31);*/
                    var d = '2099-12-31';
                    $scope.model.END_TIME = d;
                } else {
                    $scope.model.END_TIME = null;
                }
            };

            //顶层组织弹框
            $scope.serachOrg = function () {
                if (model.FUNCTION_ID) {
                    organisation_business_service.showDialog(model).then(function (data) {
                        $scope.relmodel = data;
                        $scope.model.ORGANISATION_RELATION_ID = $scope.relmodel.ORGANISATION_RELATION_ID;
                        $scope.model.ORGANISATION_ID = $scope.relmodel.ORGANISATION_ID;
                        $scope.model.ORGANISATION_NAME_CN = $scope.relmodel.ORGANISATION_NAME_CN;
                        $scope.model.ORGANISATION_ID = $scope.relmodel.ORGANISATION_ID;
                        $scope.model.FUNCTION_ID = $scope.relmodel.FUNCTION_ID;
                        $scope.model.FUNCTION_NAME = $scope.relmodel.ORGANISATION_BUSINESS_NAME;
                        $scope.model.EFFECTIVE_TIME = $scope.relmodel.EFFECTIVE_TIME ? ($filter("date")($scope.relmodel.EFFECTIVE_TIME*1000, "yyyy-MM-dd")) : null;
                        $scope.model.END_TIME = $scope.relmodel.END_TIME ? ($filter("date")($scope.relmodel.END_TIME*1000, "yyyy-MM-dd")) : null;
                        /*$scope.model.EFFECTIVE_TIME = $scope.relmodel.EFFECTIVE_TIME ? new Date($scope.relmodel.EFFECTIVE_TIME * 1000) : null;
                        $scope.model.END_TIME = $scope.relmodel.END_TIME ? new Date($scope.relmodel.END_TIME * 1000) : null;*/
                        $scope.model.ORGANISATION_FORM_ID = $scope.relmodel.ORGANISATION_FORM_ID;
                        $scope.model.RELATION_REMARKS = $scope.relmodel.RELATION_REMARKS;
                        $scope.model.isChecked = $scope.model.ORGANISATION_FORM_ID == 1 ? true : false;
                        $scope.treeModel = $scope.relmodel.treeData;
                        if ($scope.treeModel.length == 0) {
                            $scope.treeModel.push({
                                "id": $scope.model.ORGANISATION_ID,
                                "name": $scope.model.ORGANISATION_NAME_CN,
                                "children": []
                            });
                        }
                        //查询不在隶属关系树上的对应职能类型的组织
                        $scope.model.exitOrgList = $scope.relmodel.exitOrgList;//存在树上的组织ID
                        searchOtherOrg($scope.relmodel.exitOrgList);
                    })
                } else {
                    Notification.error(transervice.tran('请先选择职能类型！'));
                }

            };
            //职能类型
            $scope.typeSelect = function (orgCode, functionId) {
                if ($scope.model.ORGANISATION_NAME_CN) {
                    $scope.model.ORGANISATION_ID = null;
                    $scope.model.ORGANISATION_NAME_CN = null;
                    $scope.model.ORGANISATION_ID = null;
                    $scope.model.EFFECTIVE_TIME = null;
                    $scope.model.END_TIME = null;
                    $scope.model.dataList = null;
                    $scope.treeModel = null;
                }
                var selectWhere = {
                    "where": ["and", ["<>","o_organisation.ORGANISATION_STATE",0], ["=", "o_organisation_relation.FUNCTION_ID", functionId]],
                    "joinWith": ["o_organisationd", "o_organisationrm"]
                };
                $scope.exitOrgList = [];
                httpService.httpHelper(httpService.webApi.api, "organization/organisationr", "index", "POST", selectWhere).then(
                    function (result) {
                        var treeData = [];
                        if (result.data.length != 0) {
                            var data = result.data[0];
                            var treeList = [];
                            angular.forEach(data.o_organisationrm, function (obj) {
                                $scope.exitOrgList.push(obj.o_organisationt.ORGANISATION_ID);
                                var newData = {
                                    "ids": obj.ORGANISATION_PID,
                                    "id": obj.ORGANISATION_ID,
                                    "name": obj.o_organisationt.ORGANISATION_NAME_CN
                                };
                                treeList.push(newData);
                            });
                            $scope.model.ORGANISATION_RELATION_ID = data.ORGANISATION_RELATION_ID;
                            $scope.model.EFFECTIVE_TIME = data.EFFECTIVE_TIME ? ($filter("date")(data.EFFECTIVE_TIME*1000, "yyyy-MM-dd")) : null;
                            $scope.model.END_TIME = data.END_TIME ? ($filter("date")(data.END_TIME*1000, "yyyy-MM-dd")) : null;
                            /*$scope.model.EFFECTIVE_TIME = data.EFFECTIVE_TIME ? new Date(data.EFFECTIVE_TIME*1000) : null;
                            $scope.model.END_TIME = data.END_TIME ? new Date(data.END_TIME*1000) : null;*/
                            $scope.model.ORGANISATION_FORM_ID = data.ORGANISATION_FORM_ID;
                            $scope.model.RELATION_REMARKS = data.RELATION_REMARKS;
                            $scope.model.ORGANISATION_STATE = data.ORGANISATION_STATE;
                            $scope.model.ORGANISATION_ID = data.o_organisationd?data.o_organisationd.ORGANISATION_ID:null;
                            $scope.model.ORGANISATION_NAME_CN = data.o_organisationd?data.o_organisationd.ORGANISATION_NAME_CN:null;
                            //一维数组转换为树形结构
                            treeData = loopData(treeList);
                        }else{
                            $scope.model.ORGANISATION_RELATION_ID = null;
                            $scope.model.EFFECTIVE_TIME = null;
                            $scope.model.END_TIME = null;
                            $scope.model.ORGANISATION_FORM_ID = null;
                            $scope.model.RELATION_REMARKS =null;
                            $scope.model.ORGANISATION_ID = null;
                            $scope.model.ORGANISATION_NAME_CN = null;
                            $scope.model.ORGANISATION_STATE = "1"
                        }

                        $scope.model.isChecked = $scope.model.ORGANISATION_FORM_ID == 1 ? true : false;
                        var d = "2099-12-31";
                        $scope.model.END_TIME = $scope.model.isChecked?d:$scope.model.END_TIME;
                        $scope.treeModel = treeData.length>0?treeData:null;
                        if ($scope.treeModel && $scope.treeModel.length == 0) {
                            $scope.treeModel.push({
                                "id": $scope.model.ORGANISATION_ID,
                                "name": $scope.model.ORGANISATION_NAME_CN,
                                "children": []
                            });
                        }
                        searchOtherOrg($scope.exitOrgList);
                    });
            };

            //顶层组织和职能二级联动
            $scope.changeSelect = function (value) {
                for (var i = 0; i < $scope.model.orgList.length; i++) {
                    var obj = $scope.model.orgList[i];
                    if (obj.ORGANISATION_ID == value) {
                        $scope.model.functionList = obj.functionList;
                        break;
                    }
                }
            };

            //可选组织table tr选中事件
            $scope.selectedLeftItem = function (value) {
                $scope.leftSelectedItems = {
                    "id": value.ORGANISATION_ID,
                    "name": value.ORGANISATION_NAME_CN,
                    "children": []
                };
                $scope.selected = value;
            };

            //树形控件属性设置
            $scope.options = {
                selectNodeLabel: function (node) {
                    if ($scope.currentNode) {
                        $scope.currentNode.selected = "";
                    }
                    $scope.currentNode = node;
                    node.selected = 'selected';
                    $scope.rightSelectedItems = $scope.currentNode;
                    changeButtonAble();
                    //更改上移按钮可用状态
                    changeTopButton($scope.treeModel);
                    //更改下移按钮可用状态
                    changeDownButton($scope.treeModel);
                }
            };

            //加入
            $scope.addItemsToRight = function () {
                if ($scope.treeModel.length == 0) {
                    $scope.treeModel = [];
                    $scope.treeModel.push({
                        "id": $scope.model.ORGANISATION_ID,
                        "name": $scope.model.ORGANISATION_NAME_CN,
                        "children": []
                    });
                    $scope.treeModel[0].children.push({
                        "id": $scope.leftSelectedItems.id,
                        "ids": $scope.model.ORGANISATION_ID,
                        "name": $scope.leftSelectedItems.name,
                        "children": []
                    });
                } else {
                    joinTree($scope.rightSelectedItems);
                }
                for (var i = 0; i < $scope.model.dataList.length; i++) {
                    var leftListItem = $scope.model.dataList[i];
                    if(leftListItem.ORGANISATION_ID == $scope.treeModel[0].id){
                        $scope.model.dataList.splice(i, 1);
                    }
                    if (leftListItem.ORGANISATION_ID === $scope.leftSelectedItems.id) {
                        $scope.model.dataList.splice(i, 1);
                    }
                }
                /*$scope.rightSelectedItems.selected = "";*/
                $scope.leftSelectedItems = null;
                changeButtonAble();
                changeTopButton($scope.treeModel);
                changeDownButton($scope.treeModel);
            };

            //删除
            $scope.addItemsToLeft = function () {
                removeChild($scope.treeModel);
                for (var i = 0; i < $scope.model.dataList.length; i++) {
                    var leftListItem = $scope.model.dataList[i];
                    if(leftListItem.ORGANISATION_ID == $scope.model.ORGANISATION_ID){
                        $scope.model.dataList.splice(i, 1);
                        break;
                    }
                }
                $scope.rightSelectedItems = [];
                changeButtonAble();
            };

            //上移调用
            function moveTop(arry) {
                var children = $scope.rightSelectedItems;
                for (var i = 0; i < arry.length; i++) {
                    var object = arry[i];
                    if (i == 0 && object.id == $scope.rightSelectedItems.id) {
                        Notification.error(transervice.tran('该组织无法上移！请选择合适节点！'));
                        return;
                    }

                    if (object.children.length > 0) {
                        var index = $.inArray(children, object.children);
                        if (index != -1 && index != 0) {
                            var temp = object.children[index - 1];
                            object.children.splice(index - 1, 1, object.children[index]);
                            object.children.splice(index, 1, temp);
                            var aa = object.children;
                        } else {
                            moveTop(object.children);
                        }

                    }
                }
                /*$scope.rightSelectedItems = [];
                changeButtonAble();*/
                changeDownButton($scope.treeModel);
            }

            //上移
            $scope.addItemsToTop = function () {
                moveTop($scope.treeModel);
                changeTopButton($scope.treeModel);

            };
            //下移调用
            function moveDown(arry) {
                var children = $scope.rightSelectedItems;
                for (var i = 0; i < arry.length; i++) {
                    var object = arry[i];
                    if (i == arry.length - 1 && object.id == $scope.rightSelectedItems.id) {
                        Notification.error(transervice.tran('该组织无法上移！请选择合适节点！'));
                        return;
                    }
                    if (object.children.length > 0) {
                        var index = $.inArray(children, object.children);
                        if (index != -1) {
                            var temp = object.children[index + 1];
                            object.children.splice(index + 1, 1, object.children[index]);
                            object.children.splice(index, 1, temp);
                            var aa = object.children;
                        } else {
                            moveDown(object.children);
                        }

                    }
                }
            }

            //下移
            $scope.addItemsToDown = function () {
                moveDown($scope.treeModel);
                changeTopButton($scope.treeModel);
                changeDownButton($scope.treeModel);
            };
            //按钮是否可用
            function changeButtonAble() {
                $scope.isSelectedOptionDisabled = $scope.rightSelectedItems.length <= 0;
                $scope.isTreeNull = $scope.rightSelectedItems.length <= 0;
                $scope.isFirstNode = $scope.rightSelectedItems.id ==$scope.model.ORGANISATION_ID;
                $scope.isTopSelectedItem = $scope.rightSelectedItems.length <= 0;
                $scope.isDownSelectedItem = $scope.rightSelectedItems.length <= 0;
                if($scope.treeModel.length==0){
                    $scope.isTreeNull = false;
                }
            }

            //日期转换为时间戳
            $scope.formatDate = function (object) {
                if (angular.isDate(object)) {
                    object = Math.round((object).valueOf() / 1000);
                } else {
                    object = Math.round((object) / 1000);
                }
                return object;
            };

            //保存
            $scope.save = function () {
                if ($scope.model.ORGANISATION_ID == null || $scope.model.ORGANISATION_ID.length <= 0) {
                    Notification.error(transervice.tran('请输入顶层组织'));
                    return;
                }
                if ($scope.model.FUNCTION_ID == null || $scope.model.FUNCTION_ID.length <= 0) {
                    Notification.error(transervice.tran('请输入职能类型'));
                    return;
                }
                if ($scope.model.EFFECTIVE_TIME == null || $scope.model.EFFECTIVE_TIME.length <= 0) {
                    Notification.error(transervice.tran('请输入生效日期'));
                    return;
                }
                if ($scope.model.END_TIME == null || $scope.model.END_TIME.length <= 0) {
                    Notification.error(transervice.tran('请输入禁用日期'));
                    return;
                }
                if ($scope.model.isChecked) {
                    $scope.model.ORGANISATION_FORM_ID = 1;
                } else {
                    $scope.model.ORGANISATION_FORM_ID = 0;
                }
                var EFFECTIVE_TIME = $scope.formatDate(new Date($scope.model.EFFECTIVE_TIME.replace(/-/g, "/")));
                var END_TIME =  $scope.formatDate(new Date($scope.model.END_TIME.replace(/-/g, "/")));
                if (EFFECTIVE_TIME > END_TIME) {
                    return Notification.error(transervice.tran('截止日期必须大于或等于生效日期'));
                }
                $scope.relationList = [];

                if ($scope.treeModel.length > 0) {
                    $scope.relationList.push({
                        "ORGANISATION_ID": $scope.treeModel[0].id,
                        "ORGANISATION_PID": null,
                        "ENTITY_STATE": 0
                    });
                    angular.forEach($scope.treeModel[0].children, function (object) {
                        treeToArry(object, object.children, $scope.model.ORGANISATION_ID);

                    });
                }
                if ($scope.treeModel.length > 0 && !$scope.treeModel[0].children) {
                    return Notification.error(transervice.tran('未设置顶层组织对应职能的隶属关系！'));
                }
                var data = {
                    "ORGANISATION_RELATION_ID": $scope.model.ORGANISATION_RELATION_ID,
                    "ORGANISATION_ID": $scope.model.ORGANISATION_ID,
                    "FUNCTION_ID": $scope.model.FUNCTION_ID,
                    "EFFECTIVE_TIME": EFFECTIVE_TIME,
                    "END_TIME":END_TIME,
                    "ORGANISATION_FORM_ID": $scope.model.ORGANISATION_FORM_ID,
                    "RELATION_REMARKS": $scope.model.RELATION_REMARKS,
                    "ORGANISATION_STATE": $scope.model.ORGANISATION_STATE,
                    "o_organisationrm": $scope.relationList

                };
                if ($scope.model.ORGANISATION_RELATION_ID) {
                    data.edit_type = '1';
                    if ($scope.relationList.length == 0) {
                        data.ORGANISATION_STATE = 0;
                        //data.END_TIME = $scope.model.ORGANISATION_FORM_ID==1?EFFECTIVE_TIME:END_TIME;
                    }
                    return httpService.httpHelper(httpService.webApi.api, "/organization/organisationr", "update", "POST", data).then(
                        function (result) {
                            Notification.success(transervice.tran(result.message));
                            $modalInstance.close($scope.model);//返回数据
                        });
                } else {
                    return httpService.httpHelper(httpService.webApi.api, "/organization/organisationr", "create", "POST", data).then(
                        function (result) {
                            Notification.success(transervice.tran(result.message));
                            $modalInstance.close($scope.model);//返回数据
                        });
                }
            };

            /**加入右侧调用**/
            function joinTree(arry) {
                arry.children.push($scope.leftSelectedItems);
                var data = joinChild($scope.treeModel, arry);
                return arry;
            }

            function joinChild(object, changeChild) {
                for (var i = 0; i < object.length; i++) {
                    var child = object[i];
                    if (child.id == $scope.rightSelectedItems.id) {
                        child.children.splice(i, child);
                        break;
                    } else {
                        var aa = joinChild(child.children, changeChild);
                    }
                }
            }

            /**end **/
            /**移除**/
            function removeChild(object) {
                for (var i = 0; i < object.length; i++) {
                    var item = object[i];
                    if (item.id == $scope.rightSelectedItems.id) {
                        object.splice(i, 1);
                        $scope.model.dataList.push({
                            "ORGANISATION_ID": item.id,
                            "ORGANISATION_NAME_CN": item.name
                        });
                        if (item.children.length > 0) {
                            for (var j = 0; j < item.children.length; j++) {
                                var obj = item.children[j];
                                $scope.model.dataList.push({
                                    "ORGANISATION_ID": obj.id,
                                    "ORGANISATION_NAME_CN": obj.name
                                });
                            }
                        }
                        break;
                    } else {
                        removeChild(item.children);
                    }
                }
            }

            //树形转一维数组
            function treeToArry(object, children, parentId) {
                if (children.length > 0) {
                    $scope.relationList.push({
                        "ORGANISATION_ID": object.id,
                        "ORGANISATION_PID": parentId,
                        "ENTITY_STATE": 0
                    });
                    angular.forEach(children, function (item) {
                        treeToArry(item, item.children, object.id)
                    })
                } else {
                    $scope.relationList.push({
                        "ORGANISATION_ID": object.id,
                        "ORGANISATION_PID": parentId,
                        "ENTITY_STATE": 1
                    });
                }
            }

            //更改上移按钮可用状态
            function changeTopButton(arry) {
                if($scope.rightSelectedItems.id == $scope.treeModel[0].id){
                    $scope.isTopSelectedItem = true;
                    return ;
                }
                var children = $scope.rightSelectedItems;
                for (var i = 0; i < arry.length; i++) {
                    var object = arry[i];
                    if (i != 0 && object.id == $scope.rightSelectedItems.id) {
                        $scope.isTopSelectedItem = false;
                        break;
                    }
                    if (object.children.length > 0) {
                        var index = $.inArray(children, object.children);
                        if (index != 0 && object.children.length==0) {
                            $scope.isTopSelectedItem = false;
                            break;
                        } else if (index == 0) {
                            $scope.isTopSelectedItem = true;
                            break;
                        } else {
                            changeTopButton(object.children);
                        }

                    }
                }
            }

            //更改下移按钮可用状态
            function changeDownButton(arry) {
                var children = $scope.rightSelectedItems;
                for (var i = 0; i < arry.length; i++) {
                    var object = arry[i];
                    if (i != arry.length - 1 && object.id == $scope.rightSelectedItems.id) {
                        $scope.isDownSelectedItem = false;
                        break;
                    }

                    if (object.children.length > 0) {
                        var index = $.inArray(children, object.children);
                        if (index != -1 && index != object.children.length - 1) {
                            $scope.isDownSelectedItem = false;
                            break;
                        } else if (index == object.children.length - 1) {
                            $scope.isDownSelectedItem = true;
                            break;

                        } else {
                            changeDownButton(object.children);
                        }

                    }
                }
            }

            //查询不存在隶属关系树上对应职能类型对应职能类型的组织
            function searchOtherOrg(exitOrgId) {
                var dataSearch = [];
                dataSearch = {
                    "where": ["and",["<>", "ORGANISATION_STATE", 0], ["like", "ORGANISATION_BUSINESS", $scope.model.FUNCTION_ID]],
                    "limit": 0
                }
                if (exitOrgId.length == 0 && $scope.model.ORGANISATION_ID) {
                    exitOrgId.push($scope.model.ORGANISATION_ID);
                }
                if(exitOrgId.length>0){
                    dataSearch.where.push(["not in", "ORGANISATION_ID", exitOrgId]);
                }
                /*dataSearch = {
                    "where": ["and",["<>", "ORGANISATION_STATE", 0], ["like", "ORGANISATION_BUSINESS", $scope.model.FUNCTION_ID], ["not in", "ORGANISATION_ID", exitOrgId]],
                    "limit": 0
                }*/
                httpService.httpHelper(httpService.webApi.api, "organization/organisation", "get_organisationrm", "POST", dataSearch).then(function (result) {
                    if (result != null && result.status == 200) {
                        $scope.model.dataList = result.data.length > 0 ? result.data : [];
                    }
                });
            }

            //一维数组转换为树形结构
            function loopData(arr) {
                var children = [];
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    var tempArr = findChilds(arr, item);
                    item.children = tempArr;
                    children = children.concat(tempArr);
                }
                arr = arr.filter(a=>$.inArray(a, children) == -1);
                return arr;
            }

            function findChilds(arr, item) {
                var tempArr = [];
                arr.forEach(a=> {
                    if (a.ids == item.id) {
                        tempArr.push(a);
                    }
                });
                return tempArr;
            }

            //取消
            $scope.cancel = function () {
                $modalInstance.dismiss(false);
            };
        });
    })
