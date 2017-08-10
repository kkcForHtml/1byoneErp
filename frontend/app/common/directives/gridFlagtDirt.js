define(['angularAMD'],function(angularAMD) {
    angularAMD.directive('autoFlag', function ($interval) {
        return {

            restrict: 'A',
            link: function ($scope, element, attrs, ngModel) {


                waitData(function(){
                   var ds= $(element).find(".ui-grid ");
                    if(ds.length){
                        return true;
                    }
                    return false;
                },function(){
                    var headers= $(element).find(".ui-grid ").find("span.ui-grid-header-cell-label:contains(*)");
                    for(var i=0;i<headers.length;i++){
                        var $dom=$(headers[i]);
                        var text=$dom.text().replace("*","");
                        $dom.empty();
                        $dom.html('<span style="color: red">*</span>'+text);
                    }

                })

                $(document).click(function (event) {
                        if($scope.oldRowCol){
                            var rowIndex= $scope[attrs.autoHide].data.indexOf($scope.oldRowCol.row.entity);
                            var colIndex=$scope[attrs.autoHide].columnDefs.indexOf($scope.oldRowCol.col.colDef);
                            var $dom=$("#f"+rowIndex+colIndex);
                            var divs1=toArray($dom.find("div"));
                            var spans1=toArray($dom.find("span"));
                            var inputs1=toArray($dom.find("input"));

                            var $dom2=$(".k-animation-container");

                            var divs2=toArray($dom2.find("div"));
                            var spans2=toArray($dom2.find("span"));
                            var inputs2=toArray($dom2.find("input"));
                            var uls2=toArray($dom2.find("ul"));
                            var lis2=toArray($dom2.find("li"));
                            var tds2=toArray($dom2.find("td"));
                            var as2=toArray($dom2.find("td a.k-link"));

                            var cells=toArray($(".ui-grid-cell"));

                            var doms=[].concat(divs1,spans1,inputs1,divs2,spans2,inputs2,uls2,lis2,$dom[0],cells,tds2,as2);
                            if(doms.indexOf(event.target)==-1){

                                    $("#f"+rowIndex+colIndex).hide();
                                    $("#f"+rowIndex+colIndex).prev("div").removeClass("ui-grid-cell-contents-hidden");
                                    $("#f"+rowIndex+colIndex).prev("div").show();
                                 $("#f"+rowIndex+colIndex).prev("div").click(function () {
                                     $("#f"+rowIndex+colIndex).show();
                                     $("#f"+rowIndex+colIndex).prev("div").hide();
                                })


                                // $scope[attrs.autoFlag].gridApi.cellNav.scrollToFocus( $scope[attrs.autoFlag].data[rowIndex], $scope[attrs.autoFlag].columnDefs[colIndex+1]);
                                // $scope.oldRowCol=null;
                                //  setTimeout(function () {
                                //      $(document).click();
                                //  },200)

                                // $scope.gridApi.core.scrollTo( $scope[attrs.autoFlag].data[rowIndex], $scope[attrs.autoFlag].columnDefs[colIndex]);
                            }

                        }

                })

                function toArray(jqArr) {
                    var arr=[];
                    for(var i=0;i<jqArr.length;i++){
                        var item=jqArr[i];
                        arr.push(item);
                    }
                    return arr;
                }

                if(attrs.autoFlag) {

                    $scope[attrs.autoFlag].customScroller = function (uiGridViewport, scrollHandler) {
                        uiGridViewport.on('scroll', function myScrollingOverride(event) {
                            //$scope.scroll.top = uiGridViewport[0].scrollTop;
                            //$scope.scroll.left = uiGridViewport[0].scrollLeft;

                            $(".ui-grid-cell div.ui-grid-cell-contents").show();
                            // You should always pass the event to the callback since ui-grid needs it
                            var headers= $(element).find(".ui-grid ").find("span.ui-grid-header-cell-label:contains(*)");
                                for(var i=0;i<headers.length;i++){
                                    var $dom=$(headers[i]);
                                    var text=$dom.text().replace("*","");
                                    $dom.empty();
                                    $dom.html('<span style="color: red">*</span>'+text);
                                }

                           if($scope.oldRowCol){
                               var rowIndex= $scope[attrs.autoHide].data.indexOf($scope.oldRowCol.row.entity);
                               var colIndex=$scope[attrs.autoHide].columnDefs.indexOf($scope.oldRowCol.col.colDef);
                               $("#f"+rowIndex+colIndex).prev("div").hide();
                           }

                            scrollHandler(event);
                        });

                    }
                }

                if(attrs.autoHide){
                   $scope.oldRowCol=null;
                    setTimeout(function () {
                        if($scope[attrs.autoHide].gridApi&&$scope[attrs.autoHide].gridApi.cellNav)
                        $scope[attrs.autoHide].gridApi.cellNav.on.navigate($scope,function(newRowCol, oldRowCol){
                            oldRowCol=oldRowCol?oldRowCol:$scope.oldRowCol;
                            if(oldRowCol){
                                    var rowIndex= $scope[attrs.autoHide].data.indexOf(oldRowCol.row.entity);
                                    var colIndex=$scope[attrs.autoHide].columnDefs.indexOf(oldRowCol.col.colDef);

                                    $("#f"+rowIndex+colIndex).hide();
                                    $("#f"+rowIndex+colIndex).prev("div").removeClass("ui-grid-cell-contents-hidden");
                                    $("#f"+rowIndex+colIndex).prev("div").show();

                            }


                            var rowIndex= $scope[attrs.autoHide].data.indexOf(newRowCol.row.entity);
                            var colIndex=$scope[attrs.autoHide].columnDefs.indexOf(newRowCol.col.colDef);
                            setTimeout(function () {
                                $("#f"+rowIndex+colIndex).show();
                                $("#f"+rowIndex+colIndex).prev("div").hide();
                                $("#f"+rowIndex+colIndex).click(function (event) {
                                    event.stopPropagation();
                                })
                                // $("#f"+rowIndex+colIndex).find("div").click(function (event) {
                                //     event.stopPropagation();
                                // })
                                // $("#f"+rowIndex+colIndex).find("span").click(function (event) {
                                //     event.stopPropagation();
                                // })
                                // $("#f"+rowIndex+colIndex).find("input").click(function (event) {
                                //     event.stopPropagation();
                                // })
                            },50)

                            setTimeout(function(){
                                $scope.oldRowCol=newRowCol;
                            },200)

                            // $("#f"+rowIndex+colIndex).prev("div").click(function () {
                            //     if($scope.oldRowCol){
                            //         // var rowIndex= $scope[attrs.autoHide].data.indexOf($scope.oldRowCol.row.entity);
                            //         // var colIndex=$scope[attrs.autoHide].columnDefs.indexOf($scope.oldRowCol.col.colDef);
                            //         // $("#f"+rowIndex+colIndex).show();
                            //         // $("#f"+rowIndex+colIndex).prev("div").hide();
                            //         $(this).hide();
                            //     }
                            // })



                        });
                    },500)

                }




                function waitData(fn1,fn2){

                    setTimeout(function(){
                        if(fn1()){
                          fn2();
                        }else{
                            waitData(fn1,fn2);
                        }
                    },500)
                }






            },
        };
    });
})