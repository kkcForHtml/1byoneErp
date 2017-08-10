define([ 'angularAMD','angular-storage'], function(angularAMD) {
	
	angularAMD.factory('userCache', ['store', function (store) {
	    return store.getNamespacedStore('userCache');
	}]);
	
	angularAMD.factory('loginCache', ['store', function (store) {
	    return store.getNamespacedStore('loginCache');
	}]);	
	
})
