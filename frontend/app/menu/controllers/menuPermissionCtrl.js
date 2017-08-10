define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'css!bowerLibs/angular-bootstrap-grid-tree/src/treeGrid.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/userCenter/userManagement/controllers/role_list_service',
    'app/common/Services/commonService'
], function () {
    return  function ($scope, $confirm, Notification, $filter,httpService, transervice,role_list_service,commonService) {


        $scope.tree_data =[];
        $scope.my_tree = tree = {};
        $scope.expanding_property = {
            field: "MENUS_NAME_CN",
            displayName: "菜单列表",
        };
        $scope.col_defs = [
            {
                field: "有权",
                cellTemplate: "<input type='checkbox' ng-model='row.branch.isSelected' ng-change='cellTemplateScope.click(row.branch)' />",
                cellTemplateScope: {
                    click: function(data) {
                        if($scope.ROLE_INFO_ID)
                          selectChange(data);
                        else{
                            Notification.error(transervice.tran("请选择需要授权的角色"));
                            data.isSelected=!data.isSelected;
                        }
                    },
                    disable:function(data) {
                        return disable(data);
                    },
                }
            }
        ];

        function selectChange(data) {
            // if(data.isSelected){
            //     var parent=findParent(data);
            //     if(parent){
            //         parent.isSelected=true;
            //     }
            // }

            if(data.children&&data.children.length){
                data.children.forEach(a=>{
                    a.isSelected=data.isSelected;
                    selectChange(a);
                })
            }
        }

        //全选
        $scope.selectAll=function () {
            if($scope.ROLE_INFO_ID)
                $scope.tree_data.forEach(d=>{
                    d.isSelected=tree.isSelected;
                    selectChange(d);
                })
            else{
                Notification.error(transervice.tran("请选择需要授权的角色"));
               tree.isSelected=!tree.isSelected;
            }


        }


        function disable(data) {
            var items=data.children.filter(d=>d.isSelected);
            if(items.length){
                return true;
            }
            return false;
        }



        function init() {
            // var selectWhere={
            //     limit:0,
            //     orderby:{MENUS_INDEX:"ASC"}
            // }
            // httpService.httpHelper(httpService.webApi.api, "common/base/rolemenus", "index", "POST", selectWhere).then(function (datas) {
            //     $scope.tree_data=createTree(datas.data);
            //     $scope.tree_data=sortTreeModel($scope.tree_data);
            //
            // })

            var str = localStorage.getItem("MENUS");
            var menus = angular.fromJson(str);
            filterMenu(menus);
            $scope.tree_data=menus;

        }

        init();

        function filterMenu(menus) {
            for(var i=0;i<menus.length;i++){
                var m=menus[i];
                m.children=m.SUB_MENUS;
                delete m.SUB_MENUS;
                filterMenu(m.children);
            }
        }

        //搜索角色
        $scope.searchRoles = function () {

            role_list_service.showDialog().then(function(data){
                data=data[0];
                var user=commonService.getUserInfo();
                var rus=user.u_role_user;
                var roles=[];
                if(rus&&rus.length){
                    roles=rus.map(r=>r.u_roleInfo);
                }
                var flag=0;
                //检查是否是超级管理员，否则不能对自己授权
                for(var i=0;i<roles.length;i++){
                    var ro=roles[i];
                    if(ro.ROLE_TYPE_ID==3){
                        flag=1;
                        break;
                    }
                }
                if(!flag){
                   var roleIds= roles.map(r=>r.ROLE_INFO_ID);
                   if(roleIds.indexOf(data.ROLE_INFO_ID)!=-1){
                       return Notification.error(transervice.tran("不能对自己所在角色授权"));
                   }
                }
                $scope.roleInputName = data.ROLE_INFO_NAME_CN;
                $scope.ROLE_INFO_ID=data.ROLE_INFO_ID;
                var dataSearch = {
                    where:{ROLE_INFO_ID:data.ROLE_INFO_ID},
                    limit:0
                };
                httpService.httpHelper(httpService.webApi.api, "users/permission", "index", "POST", dataSearch).then(function (result) {
                    if(result.data.length){
                        $scope.roleMenuPermission=result.data[0];
                        selectTreeNode(result.data[0]);
                    }else{
                        $scope.roleMenuPermission={
                            ROLE_INFO_ID:data.ROLE_INFO_ID,
                            MENUS:'',
                            PERMISSION_STATE:1
                        }
                        selectTreeNode($scope.roleMenuPermission);
                    }

                })

            });
        }


        //授权
        $scope.authority=function () {

            var mids=getSelectedIds($scope.tree_data);
            $scope.roleMenuPermission.MENUS=mids.toString();

            httpService.httpHelper(httpService.webApi.api, "users/permission", "update", "POST", $scope.roleMenuPermission).then(function (result) {
                Notification.success(result.message);
                init();
                $scope.roleMenuPermission=null;
                $scope.roleInputName="";
                $scope.ROLE_INFO_ID="";

            })

        }

        function getSelectedIds(datas){
            var entitys=[];
            getIds(datas);
            function  getIds(datas) {
                datas.forEach(d=>{
                    if(d.isSelected){
                        entitys.push(d);
                    }
                    getIds(d.children);
                })
            }

            return entitys.map(e=>e.MENUS_ID);

        }


        //初始化选择
        function selectTreeNode(up){
            var menus=up.MENUS.split(",");
            loopSelect($scope.tree_data);
            function loopSelect(datas){
                datas.forEach(d=>{
                    if(menus.indexOf(d.MENUS_ID)!=-1){
                        d.isSelected=true;
                    }else{
                        d.isSelected=false;
                    }
                    loopSelect(d.children);
                })
            }
        }


        function createTree(datas){

            var child=[];
            for(var i=0;i<datas.length;i++){
                var item=datas[i];
                item.children=[];
                for(var j=0;j<datas.length;j++){
                    var obj=datas[j];
                    if(obj.MENUS_FID==item.MENUS_ID){
                        item.children.push(obj);
                        child.push(obj);
                    }
                }
            }
            var treeModel=datas.filter(a=>child.indexOf(a)==-1);
            return treeModel;
        }


        //获取父节点
        function findParent(node){

            var o=loop($scope.tree_data);
            return o;

            function loop(datas) {
                for(var i=0;i<datas.length;i++){
                    var item=datas[i];
                    if(item.MENUS_ID==node.MENUS_FID){
                        return item;
                    }else{
                        var obj=loop(item.children)
                        if(obj){
                            return obj;
                        }
                    }
                }
            }

        }

        function sortTreeModel(datas){
            datas=datas.sort((a,b)=>{
                if(+a.MENUS_INDEX>+b.MENUS_INDEX){
                    return 1;
                }else if(+a.MENUS_INDEX<+b.MENUS_INDEX){
                    return -1;
                }
                return 0;
            });
            for(var i=0;i<datas.length;i++){
                var item=datas[i];
                sortChild(item);
            }

            return datas;

            function sortChild(node) {
                if(node.children&&node.children.length){
                    node.children=node.children.sort((a,b)=>{
                        if(+a.MENUS_INDEX>+b.MENUS_INDEX){
                            return 1;
                        }else if(+a.MENUS_INDEX<+b.MENUS_INDEX){
                            return -1;
                        }
                        return 0;
                    });

                    for(var i=0;i<node.children.length;i++){
                        var item=node.children[i];
                        sortChild(item);
                    }
                }

            }
        }













        }
});
