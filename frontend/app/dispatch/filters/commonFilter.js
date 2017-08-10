define([ 'angularAMD' ], function(angularAMD) {
	angularAMD.filter('transNull',function () {
		return function (n) {
			return typeof n !==undefined&&n?n:'-';
		}
	}).filter('transTransport',function () {
		return function (n) {
			var str = '';
			switch (n){
				case '1':
					str += "空运";
					break;
				case '2':
					str +="海运";
					break;
				case '3':
					str +="龙舟海运";
					break;
				case '4':
					str +="快递";
					break;
				case '5':
					str +="陆运";
					break;
					
				default:
					str +=n
					break;
			}
			return str;
		}
	}).filter('transStatus',function () {
		return function (n) {
			var str = '';
			switch (n){
				case "1":
					str+='已发运'
					break;
				case "2":
					str+='已送达'
					break;
				default:
					str+=n;
					break;
			}
			return str;
		}
	}).filter('transMoneyCode',function () {
		return function (n) {
			var str = '';
			switch (n){
				case "USD":
					str+="美元"
					break;
				case "EUR":
					str+="欧元"
					break;
				case "JPY":
					str+="日元"
					break;
				case "CNY":
					str+="人民币"
					break;
				case "GBP":
					str+="英镑"
					break;
				case "BYR":
					str+="白俄罗斯卢布"
					break;
				case "AUD":
					str+="澳元"
					break;
				default:
					str+=n;
					break;
			}
			return str;
		}
	}).filter('transStatusAl',function () {
		return function (n) {
			var str = '';
			switch (n){
				case "1":
					str+='已完成'
					break;
				case "2":
					str+='已递送'
					break;
				case "3":
					str+='未递送'
					break;
				default:
					str+=n;
					break;
			}
			return str;
		}
	});
})