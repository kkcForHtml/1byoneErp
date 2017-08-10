define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.filter('dirtyFilter',function ($filter) {
		return function (value,row,col) {
			if(!row){
				return value;
			}
			if(!row.entity){
				return value;
			}
			if(!row.entity.copyModel){
				row.entity.copyModel=angular.copy(row.entity);
				return value;
			}
			var entity=row.entity;
			var name=col.colDef.name;
			if(entity[name]!=entity.copyModel[name]){
				row.grid.api.rowEdit.setRowsDirty([entity]);
			}
			return value;
		}
	})
})