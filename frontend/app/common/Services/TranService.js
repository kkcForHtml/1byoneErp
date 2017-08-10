define(['angularAMD'], function (angularAMD) {

    angularAMD.service('transervice', ['$translate', function ($translate) {
        this.tran = function (key) {
            if (key) {
                return $translate.instant(key)
            }
            return key;
        }
    }]);

    angularAMD.filter('gridFieldFilter', function () {
            return function (input, row, col,valueName,lableName,list) {
                if(!valueName){
                    if (angular.isDefined(input)) {
                        if (String(input).length > 0) {
                            if (row.entity.rowEntity && row.entity.rowEntity.fieldDataObjectMap[col.field] && row.entity.rowEntity.fieldDataObjectMap[col.field].list) {
                                var list = row.entity.rowEntity.fieldDataObjectMap[col.field].list;
                                var name = "";
                                for (var i = 0; i < list.length; i++) {
                                    if (list[i].value == input) {
                                        name =  list[i].name;
                                    }
                                }
                                if(name == ""){
                                    row.entity[col.field] = null;
                                }
                                return name;
                            }
                        }
                    }
                }else{
                    var name = "";
                    for (var i = 0; i < list.length; i++) {

                        if (list[i][valueName] == input) {
                            name =  list[i][lableName];
                        }
                    }
                    if(name == ""){
                        row.entity[col.field] = "";
                    }
                    return name;
                }

            };
        }
    );

    angularAMD.filter('gridLengthFilter', function () {
            return function (input, row, col) {
                if(input){
                    var colDel=col.colDef;
                    if(colDel.type="number"){
                        if(colDel.max){
                            if(+input>+colDel.max){
                                row.entity[col.field]=colDel.max;
;                            }
                        }
                        if(colDel.min){
                            if(+input<+colDel.max){
                                row.entity[col.field]=colDel.min;

                            }
                        }
                    }else{
                        if(colDel.maxlength){
                            if(input.length>+colDel.maxlength){
                                row.entity[col.field]=input.substring(0,colDel.maxlength);

                            }
                        }
                    }
                    return row.entity[col.field];

                }

            };
        }
    );

})
