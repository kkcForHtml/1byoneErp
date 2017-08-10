(function (angular, undefined) {
	var module = angular.module('AxelSoft', []);

	module.value('treeViewDefaults', {
		foldersProperty: 'folders',
		filesProperty: 'files',
		displayProperty: 'name',
		collapsible: true
	});
	
	module.directive('treeView', ['$q', 'treeViewDefaults', function ($q, treeViewDefaults) {
		return {
			restrict: 'A',
			scope: {
				treeView: '=treeView',
				treeViewOptions: '=treeViewOptions',
				isShowSort:'=isShowSort'
			},
			replace: true,
			template:
				'<div class="tree">' +
					'<div tree-view-node="treeView">' +
					'</div>' +
				'</div>',
			controller: ['$scope', function ($scope) {
				var self = this,
					selectedNode,
					selectedFile;

				var options = angular.extend({}, treeViewDefaults, $scope.treeViewOptions);

				self.selectNode = function (node, breadcrumbs) {
					if (selectedFile) {
						selectedFile = undefined;
					}
					selectedNode = node;

					if (typeof options.onNodeSelect === "function") {
						options.onNodeSelect(node, breadcrumbs);
					}
				};

				self.selectFile = function (file, breadcrumbs) {
					if (selectedNode) {
						selectedNode = undefined;
					}
					selectedFile = file;

					if (typeof options.onNodeSelect === "function") {
						options.onNodeSelect(file, breadcrumbs);
					}
				};
				
				self.isSelected = function (node) {
					return node === selectedNode || node === selectedFile;
				};
                
				$scope.treeViewOptions.setSelectedNode=function(node){
					selectedFile=node;
				}
				
				$scope.treeViewOptions.setSelectedFile=function(node){
					selectedNode=node;
				}
				/*
				self.addNode = function (event, name, parent) {
					if (typeof options.onAddNode === "function") {
						options.onAddNode(event, name, parent);
					}
				};
				self.removeNode = function (node, index, parent) {
					if (typeof options.onRemoveNode === "function") {
						options.onRemoveNode(node, index, parent);
					}
				};
				
				self.renameNode = function (event, node, name) {
					if (typeof options.onRenameNode === "function") {
						return options.onRenameNode(event, node, name);
					}
					return true;
				};
				*/
				self.getOptions = function () {
					return options;
				};
			}]
		};
	}]);

	module.directive('treeViewNode', ['$q', '$compile', function ($q, $compile) {
		return {
			restrict: 'A',
			require: '^treeView',
			link: function (scope, element, attrs, controller) {

				var options = controller.getOptions(),
					foldersProperty = options.foldersProperty,
					filesProperty = options.filesProperty,
					displayProperty = options.displayProperty,
					collapsible = options.collapsible;
				//var isEditing = false;

				scope.expanded = collapsible == false;
				//scope.newNodeName = '';
				//scope.addErrorMessage = '';
				//scope.editName = '';
				//scope.editErrorMessage = '';

				scope.getFolderIconClass = function () {
					return 'icon-folder' + (scope.expanded && scope.hasChildren() ? '-open' : '');
				};
				
				scope.getFileIconClass = typeof options.mapIcon === 'function' 
					? options.mapIcon
					: function (file) {
						return 'icon-file';
					};
				
				scope.hasChildren = function () {
					var node = scope.node;
					return Boolean(node && (node[foldersProperty] && node[foldersProperty].length) || (node[filesProperty] && node[filesProperty].length));
				};

				scope.selectNode = function (event) {
					event.preventDefault();
					//if (isEditing) return;

					//if (collapsible) {
					//	toggleExpanded();
					//}

					var breadcrumbs = [];
					var nodeScope = scope;
					while (nodeScope.node) {
						breadcrumbs.push(nodeScope.node[displayProperty]);
						nodeScope = nodeScope.$parent;
					}
					controller.selectNode(scope.node, breadcrumbs.reverse());
				};

				scope.selectFile = function (file, event) {
					event.preventDefault();
					//if (isEditing) return;

					var breadcrumbs = [file[displayProperty]];
					var nodeScope = scope;
					while (nodeScope.node) {
						breadcrumbs.push(nodeScope.node[displayProperty]);
						nodeScope = nodeScope.$parent;
					}
					controller.selectFile(file, breadcrumbs.reverse());
				};
				
				scope.isSelected = function (node) {
					return controller.isSelected(node);
				};
                scope.icionExpanded=function(event){
					event.preventDefault();
					toggleExpanded();
				}
                
                

				function toggleExpanded() {
					//if (!scope.hasChildren()) return;
					scope.expanded = !scope.expanded;
				}
				
				scope.renderFinish=options.renderFinish;
				

				function render() {
					if(!options.isLocalCtrData){
						var stru={folders:[],files:[]};
						transferTreeData(scope.treeView,stru);
						scope.treeView=stru;
					}
					


					var template =
						'<div class="tree-folder" ng-repeat="node in ' + attrs.treeViewNode + '.' + foldersProperty + '">' +
							'<a  class="tree-folder-header inline"  ng-class="{ selected: isSelected(node) }">' +
								'<i class="icon-folder-close" ng-click="icionExpanded($event)" ng-class="getFolderIconClass()"></i> ' +
								'<span class="tree-folder-name" ng-click="selectNode($event)">{{ node.' + displayProperty + ' }}</span><span ng-if="isShowSort" style="float: right">{{node.sort}}</span> ' +
							'</a>' +
							'<div class="tree-folder-content"'+ (collapsible ? ' ng-show="expanded"' : '') + '>' +
								'<div tree-view-node="node">' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<a  class="tree-item"  ng-repeat="file in ' + attrs.treeViewNode + '.' + filesProperty + '" ng-click="selectFile(file, $event)" ng-class="{ selected: isSelected(file) }" id="{{file.treeCode}}">' +
							'<span class="tree-item-name"><i class="icon-file"></i> {{ file.' + displayProperty + ' }}</span><span ng-if="isShowSort" style="float: right">{{node.sort}}</span> ' +
						'</a>';
					//ng-class="getFileIconClass(file)"
					//Rendering template.
					element.html('').append($compile(template)(scope));
				}

				function transferTreeData(data,model){
					if(!data){
						return;
					}
					function doLoop(item,mo){
						if(item.children!=null&&item.children!=undefined&&item.children.length>0){
							var itemModel={
								folders:[],
								files:[]
							};
							itemModel=angular.extend(itemModel,item);
							mo.folders.push(itemModel);
							for(var j=0;j<item.children.length;j++){
								var childItem=item.children[j];
								if(childItem)
									doLoop(childItem,itemModel);
							}
						}else{
							mo.files.push(item);
						}
					}

					for(var i=0;i<data.length;i++){
						var item=data[i];
						doLoop(item,model);
					}
				}


				render();
			}
		};
	}]);
	
	
	module.directive('repeatFinish',function(){
    return {
        link: function(scope,element,attr){
            console.log(scope.$index)
            if(scope.$last == true){
                console.log('ng-repeat执行完毕')
                scope.$eval( attr.repeatFinish)
            }
        }
    }
})
})(angular);