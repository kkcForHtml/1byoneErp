/*
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id : each tree's unique id.
	tree-model : the tree model on $scope.
	node-id : each node's id
	node-label : each node's label
	node-children: each node's children

	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children" >
	</div>
*/

(function ( angular ) {
	'use strict';

	angular.module( 'angularTreeview', [] ).directive( 'treeModel', ['$compile', function( $compile ) {
		return {
			restrict: 'A',
			link: function ( scope, element, attrs ) {
				//tree id
				var treeId = attrs.treeId;
			
				//tree model
				var treeModel = attrs.treeModel;

				//node id
				var nodeId = attrs.nodeId || 'id';

				//node label
				var nodeLabel = attrs.nodeLabel || 'name';

				//children
				var nodeChildren = attrs.nodeChildren || 'children';

				//tree template
				//'<i class="collapsed" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
				//'<i class="expanded" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
				//'<i class="normal" data-ng-hide="node.' + nodeChildren + '.length"></i> ' +
				var template ="";
				if(scope[treeId].isCheckBoxTree){
					template=	'<ul>' +
						'<li data-ng-repeat="node in ' + treeModel + '">' +
						'<i class="{{'+treeId+'.collapsedIcon}}" ng-if="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="{{'+treeId+'.expandedIcon}}" ng-if="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="{{'+treeId+'.normalIcon}}" ng-if="!node.' + nodeChildren + '.length"></i> ' +
						'<div  class="checkbox checkbox-info checkbox-inline" ng-if="'+treeId+'.isCheckBoxTree && node.'+nodeChildren+'.length"><input type="checkbox" class="styled"  ng-model="node.isChecked" ng-change="'+treeId+'.checkBoxChange(node)" id="a{{node.treeCode}}"> <label for="a{{node.treeCode}}">{{node.' + nodeLabel + '}}</label></div>'+
						'<div  class="checkbox checkbox-info checkbox-inline div-treeCheckBox-l-20" ng-if="'+treeId+'.isCheckBoxTree && !node.'+nodeChildren+'.length"><input type="checkbox" class="styled"  ng-model="node.isChecked" ng-change="'+treeId+'.checkBoxChange(node)" id="a{{node.treeCode}}"> <label for="a{{node.treeCode}}">{{node.' + nodeLabel + '}}</label></div>'+
						'<span ng-if="(!'+treeId+'.isCheckBoxTree" data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
						'<div ng-if="!node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
						'</li>' +
						'</ul>';
				}else if(scope[treeId].isAttachmentTree){
					template=	'<ul>' +
						'<li data-ng-repeat="node in ' + treeModel + '">' +
						'<i class="{{'+treeId+'.collapsedIcon}}" ng-if="node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="{{'+treeId+'.expandedIcon}}" ng-if="!node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<span  data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}' +
							'<div ng-if="!node.isRoot" style="display: none">' +
								'<p class="glyphicon glyphicon-edit oprate-icon" title="编辑" ng-click="' + treeId + '.editFloder(node)" ></p>'+
								'<p class="glyphicon glyphicon-trash oprate-icon" title="删除" ng-click="' + treeId + '.deleteFloder(node)"  style=""></p>'+
						    '</div>'+
						'</span>'+

						'<div ng-if="!node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
						'</li>' +
						'</ul>';
				}else if(scope[treeId].sort){

                        template=	'<ul>' +
                            '<li data-ng-repeat="node in ' + treeModel + '" style="position: relative" >' +
                            '<i class="{{'+treeId+'.collapsedIcon}}" ng-if="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)" style=""></i>' +
                            '<i class="{{'+treeId+'.expandedIcon}}" ng-if="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i class="{{'+treeId+'.normalIcon}}" ng-if="!node.' + nodeChildren + '.length" ></i>' +
                            '<span  data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}' +
                             '<div style="display: {{node.selected?\'inline-block\':\'none\'}};margin-left: 60px;"  ><i class=" iconfont icon-arrow-bottom" style="margin-right: 15px;font-weight: bolder" data-ng-click="'+treeId+'.moveDown(node)"></i><i class=" iconfont icon-arrow-top" style="font-weight: bolder" data-ng-click="'+treeId+'.moveUp(node)"></i></div>'+
							'</span>' +
                            '<div ng-if="!node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                            '</ul>';

                }else{
					template=	'<ul>' +
						'<li data-ng-repeat="node in ' + treeModel + '" style="position: relative">' +
						'<i class="{{'+treeId+'.collapsedIcon}}" ng-if="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)" style=""></i>' +
						'<i class="{{'+treeId+'.expandedIcon}}" ng-if="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="{{'+treeId+'.normalIcon}}" ng-if="!node.' + nodeChildren + '.length" ></i>' +
						'<span  data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
						'<div ng-if="!node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
						'</li>' +
						'</ul>';
				}



				//check tree id, tree model
				if( treeId && treeModel ) {

					//root node
					if( attrs.angularTreeview ) {
					
						//create tree object if not exists
						scope[treeId] = scope[treeId] || {};

						//默认图标
						scope[treeId].collapsedIcon=scope[treeId].collapsedIcon||'fa fa-fw fa-plus';
						scope[treeId].expandedIcon=scope[treeId].expandedIcon||'fa fa-fw fa-minus';
						scope[treeId].normalIcon=scope[treeId].normalIcon||'';

						//if node head clicks,
						scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){

							//Collapse or Expand
							selectedNode.collapsed = !selectedNode.collapsed;
						};

						//if node label clicks,
						scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){

							//remove highlight from previous node
							if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
								scope[treeId].currentNode.selected = undefined;
							}

							//set highlight to selected node
							selectedNode.selected = 'selected';

							//set currentNode
							scope[treeId].currentNode = selectedNode;

						};



						//checkBox触发方法
						scope[treeId].checkBoxChange = scope[treeId].checkBoxChange || function( selectedNode ){
								//selectedNode.isChecked=!selectedNode.isChecked
								if(scope[treeId].multiple){
									loopChildren(selectedNode);
								}else{
									if(selectedNode.isChecked){
										singleChecked(selectedNode)
									}

								}

								function loopChildren(node){
									if(node.children&&node.children.length){
										for(var i=0;i<node.children.length;i++){
											var item=node.children[i];
											if(item){
												item.isChecked=node.isChecked;
												loopChildren(item);
											}
										}
									}
								}

								function singleChecked(node){
									for(var i=0;i<scope[treeModel].length;i++){
										var item = scope[treeModel][i];
										if(item){
											loopNode(item);
										}
									}

									function loopNode(no){
										if(no.treeCode !=node.treeCode){
											no.isChecked=false;
										}
										for(var i=0;i<no.children.length;i++){
											var item=no.children[i];
											if(item){
												loopNode(item);
											}
										}
									}
								}
							}
					}

					//Rendering template.
					element.html('').append( $compile( template )( scope ) );
				}
			}
		};
	}]);
})( angular );
