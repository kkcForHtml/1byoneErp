define(
		function() {

			return function transferTreeData(data){
				var model={folders:[],files:[]};
				function doLoop(item,mo){
					if(item.children!=null&&item.children!=undefined&&item.children.length>0){
						var itemModel={
							folders:[],
							files:[]
						};
						itemModel=angular.extend(item,itemModel);
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
				return model;
				
			}

		})
