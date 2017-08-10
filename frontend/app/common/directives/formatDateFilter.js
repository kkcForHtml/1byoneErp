define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.filter('formatDateFilter',function ($filter) {
		return function (value,formateStr) {
			if(value){
				if(formateStr)
				 return $filter("date")(new Date(value*1000),formateStr);
				else
					return $filter("date")(new Date(value*1000),'yyyy-MM-dd');
			}
			return "";
		}
	})
})