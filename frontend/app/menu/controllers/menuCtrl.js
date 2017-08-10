define([
    'css!bowerLibs/angular-ui-notification/dist/angular-ui-notification.min.css',
    'ngload!ui-notification',
    'ngload!ui.bootstrap',
    'angular-confirm',
    'app/common/directives/angular.treeview',

], function () {
    return  function ($scope, $confirm, Notification, $filter,httpService, transervice,$q) {

        $scope.treeModel=[];
        $scope.currentNode=null;

        function init() {
            var selectWhere={
                limit:0,
                orderby:{MENUS_INDEX:"ASC"}
            }
            httpService.httpHelper(httpService.webApi.api, "common/base/rolemenus", "index", "POST", selectWhere).then(function (datas) {
                $scope.treeModel=createTree(datas.data);
                $scope.treeModel=sortTreeModel($scope.treeModel);
                if(datas.data.length){
                    $scope.currentNode=$scope.treeModel[0];
                    $scope.currentNode.selected = 'selected';
                }
                initModel($scope.treeModel);

            })
        }

        init();

        function initModel(datas) {
            for(var i=0;i<datas.length;i++){
                var item=datas[i];
                item.copyModel=angular.copy(item);
                if(item.children&&item.children.length){
                    initModel(item.children);
                }
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

        function findDirtyModels(datas) {
            var models=[];
            equalModel(datas);
            function equalModel(datas) {
                for(var i=0;i<datas.length;i++){
                    var item=datas[i];
                    if(item.MENUS_NAME_CN!=item.copyModel.MENUS_NAME_CN || item.MENUS_FID!=item.copyModel.MENUS_FID || item.MENUS_INDEX!=item.copyModel.MENUS_INDEX){
                        var item1=angular.copy(item);
                        delete item1.children;
                        models.push(item1);
                    }
                    if(item.children&&item.children.length){
                        equalModel(item.children);
                    }
                }
            }
            return models;
        }

        //保存方法
        $scope.save=function () {
            var models=findDirtyModels($scope.treeModel);
            if(!models.length){
                return Notification.error(transervice.tran('没有修改过的数据'));
            }
            var saveDatas={batchMTC:models};
            httpService.httpHelper(httpService.webApi.api, "common/base/rolemenus", "update", "POST", saveDatas).then(function (datas) {
                Notification.success(datas.message);
                init();
            })
        }

        //上移
        $scope.moveUp=function (node) {
                var parent=findParent(node);
                if(parent){
                    var index=parent.children.indexOf(node);
                    if(index){
                        var temp=parent.children[index-1];
                        var sort=temp.MENUS_INDEX;
                        parent.children[index-1]=node;
                        parent.children[index]=temp;
                        temp.MENUS_INDEX=node.MENUS_INDEX;
                        node.MENUS_INDEX=sort;
                    }else{
                       var pprent=findParent(parent);
                       if(pprent){
                           var pindex=pprent.children.indexOf(parent);
                           if(pindex){
                               var temp=pprent.children[pindex-1];
                               temp.children.push(node);
                               node.MENUS_INDEX=getSort(temp,"max");
                               parent.children.splice(index,1);
                               node.MENUS_FID=temp.MENUS_ID;
                           }
                       }else{
                           var idx=$scope.treeModel.indexOf(parent);
                           if(idx){
                               var temp=$scope.treeModel[idx-1];
                               temp.children.push(node);
                               node.MENUS_INDEX=getSort(temp,"max");
                               parent.children.splice(index,1);
                               node.MENUS_FID=temp.MENUS_ID;
                           }
                       }
                    }
                }else{
                    var index=$scope.treeModel.indexOf(node);
                    if(index){
                        var temp=$scope.treeModel[index-1];
                        $scope.treeModel[index-1]=node;
                        $scope.treeModel[index]=temp;
                        var sort=temp.MENUS_INDEX;
                        temp.MENUS_INDEX=node.MENUS_INDEX;
                        node.MENUS_INDEX=sort;
                    }
                }
        }

        //下移
        $scope.moveDown=function (node) {
            var parent=findParent(node);
            if(parent){
                var index=parent.children.indexOf(node);
                if(index!=(parent.children.length-1)){
                    var temp=parent.children[index+1];
                    var sort=temp.MENUS_INDEX;
                    parent.children[index+1]=node;
                    parent.children[index]=temp;
                    temp.MENUS_INDEX=node.MENUS_INDEX;
                    node.MENUS_INDEX=sort;
                }else{
                    var pprent=findParent(parent);
                    if(pprent){
                        var pindex=pprent.children.indexOf(parent);
                        if(pindex!=(parent.children.length-1)){
                            var temp=pprent.children[pindex+1];
                            temp.children.unshift(node);
                            node.MENUS_INDEX=getSort(temp,"min");
                            parent.children.splice(index,1);
                            node.MENUS_FID=temp.MENUS_ID;
                        }
                    }else{
                        var idx=$scope.treeModel.indexOf(parent);
                        if(idx!=($scope.treeModel.length-1)){
                            var temp=$scope.treeModel[idx+1];
                            temp.children.unshift(node);
                            node.MENUS_INDEX=getSort(temp,"min");
                            parent.children.splice(index,1);
                            node.MENUS_FID=temp.MENUS_ID;
                        }
                    }
                }
            }else{
                var index=$scope.treeModel.indexOf(node);
                if(index!=($scope.treeModel.length-1)){
                    var temp=$scope.treeModel[index+1];
                    $scope.treeModel[index+1]=node;
                    $scope.treeModel[index]=temp;
                    var sort=temp.MENUS_INDEX;
                    temp.MENUS_INDEX=node.MENUS_INDEX;
                    node.MENUS_INDEX=sort;
                }
            }
        }

        //获取父节点
        function findParent(node){

            var o=loop($scope.treeModel,null);
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

        //设置排序号
        function getSort(parent,type) {
            var sort=0;
            for(var i=0;i<parent.children.length;i++){
                var item=parent.children[i];
                if(!sort){
                    sort=(+item.MENUS_INDEX);
                }
                if(type=="max"){
                    if(+item.MENUS_INDEX>sort){
                        sort=(+item.MENUS_INDEX);
                    }
                }else{
                    if(+item.MENUS_INDEX<sort){
                        sort=(+item.MENUS_INDEX);
                    }
                }

            }
            if(type=="max"){
                return sort+1;
            }else{
                return sort-1;
            }

        }


        //树形控件属性设置
        $scope.options = {
            selectNodeLabel: function (node) {
                if ($scope.currentNode) {
                    $scope.currentNode.selected = "";

                }
                $scope.currentNode = node;
                node.selected = 'selected';

            },
            sort:true,
            moveUp:function(node){
                $scope.moveUp(node);
            },
            moveDown:function (node) {
                $scope.moveDown(node);
            }
        };

    }
});
