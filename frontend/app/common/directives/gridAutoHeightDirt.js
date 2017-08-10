define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('autoHeight', function ($q) {
        return {

            restrict: 'A',
            scope: {
                autoHeight: "=",
            },
            link: function ($scope, element, attrs, ngModel) {

                $scope.noEditCols=[];
                  if($scope.autoHeight){
                      for(var i=0;i<$scope.autoHeight.columnDefs.length;i++){
                          var col=$scope.autoHeight.columnDefs[i];
                          if(col.enableCellEdit==undefined||col.enableCellEdit){
                              col.enableCellEditOnFocus=true;
                          }
                          if(col.enableCellEdit==false){
                              $scope.noEditCols.push(i);
                          }
                      }
                  }




                    $scope.$watch("autoHeight.data.length",function (newValue, oldValue) {
                        if(newValue==undefined){
                            return;
                        }
                        if(newValue){
                            var rowHeight=$scope.autoHeight.rowHeight||30;
                            var height=rowHeight*$scope.autoHeight.data.length;

                            if(!$scope.autoHeight.enablePagination&&!$scope.autoHeight.enableHorizontalScrollbar){
                                height-=13;
                            }

                            if(!height){
                                height+=60;
                            }else{
                                if($scope.autoHeight.enableHorizontalScrollbar||$scope.autoHeight.enablePagination){
                                    height+=60;
                                }else{
                                    height+=50;
                                }

                            }

                            if($scope.autoHeight.enablePagination){
                                height+=10;
                            }

                            if($scope.autoHeight.enableHorizontalScrollbar){
                                height+=10;
                            }

                            if($scope.autoHeight.showColumnFooter){
                                height+=24;
                            }



                            waitData(function(){
                                if($(element).find(".ui-grid").length){
                                    return true;
                                }
                                return false;
                            },function(){
                                $(element).find(".ui-grid").css('height', height + 'px');
                            })


                            //setTimeout(function(){
                            //    if(attrs.control!=undefined){
                            //        var $grid=$(element).find(".ui-grid");
                            //        var $rows=$grid.find(" .ui-grid-render-container-body .ui-grid-viewport .ui-grid-row");
                            //        for(var i=0;i<$rows.length;i++){
                            //            var row=$($rows[i]);
                            //            var cols=row.find("div[ui-grid-cell]");
                            //            for(var j=0;j<cols.length;j++){
                            //                var col=$(cols[j]);
                            //                if($scope.noEditCols.indexOf(j)!=-1){
                            //                    var div=col.find("div.ui-grid-cell-contents");
                            //                    div.css("background-color","#ccc");
                            //
                            //                }
                            //            }
                            //
                            //        }
                            //
                            //    }
                            //},300)
                        }else{
                            waitData(function(){
                                if($(element).find(".ui-grid").length){
                                    return true;
                                }
                                return false;
                            },function(){
                                if($scope.autoHeight.enableHorizontalScrollbar||$scope.autoHeight.enablePagination)
                                 $(element).find(".ui-grid").css('height', '100px');
                                else{
                                    $(element).find(".ui-grid").css('height', '60px');
                                }
                            })

                        }
                    });

                function waitData(fn1,fn2){

                    setTimeout(function(){
                        if(fn1()){
                            fn2();
                        }else{
                            waitData(fn1,fn2);
                        }
                    },50)
                }







            },
        };
    });
})