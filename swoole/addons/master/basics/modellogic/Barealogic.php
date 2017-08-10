<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/27
 * Time: 17:45
 */
namespace   addons\master\basics\modellogic;
  use addons\master\basics\models\BArea;
  use yii\swoole\helpers\ArrayHelper;
  use Yii;
  class   Barealogic{
      /**
       * 校验
       */
      public static   function  OnlyLogic($post)
      {
          //放到一个数组中去
          $countOnly = [];
          for ($i = 0; $i < count($post); $i++) {   //保存至总数组中
              if (isset($post[$i]["edit_only"])) {
                  $editlist = $post[$i]["edit_only"];
                  for ($j = 0; $j < count($editlist); $j++) {
                      $entityOnly = [];
                      if( isset( $editlist[$j]["AREA_ID"] )  &&  isset($editlist[$j]["AREA_FID"])   ){
                          $entityOnly["AREA_ID"]=$editlist[$j]["AREA_ID"];
                          $entityOnly["AREA_FID"]=$editlist[$j]["AREA_FID"];
                      }
                      if(!isset($editlist[$j]['AREA_FID'])){
                          $result=[];
                          $result["statusOnly"]=500;
                          $result["messageOnly"]= Yii::t('basics', "The subordinate area cannot be empty!");
                          return  $result;
                      }
                      if(isset($editlist[$j]["ids"])  && isset($editlist[$j]["AREA_FID"])   )
                      {
                          $entityOnly["AREA_FID"]=$editlist[$j]["AREA_FID"];
                          $entityOnly["ids"]=$editlist[$j]["ids"];
                      }
                      if( isset( $editlist[$j]["AREA_CODE"] ) && isset(  $editlist[$j]["AREA_NAME_CN"] ) ){


                          if($editlist[$j]["AREA_CODE"] ==""  || $editlist[$j]["AREA_CODE"] == null ){
                              $result=[];
                              $result["statusOnly"]=500;
                              $result["messageOnly"]= Yii::t('basics', "The area encoding cannot be empty!");
                              return  $result;
                          }
                          if( $editlist[$j]["AREA_NAME_CN"]==""  &&  $editlist[$j]["AREA_NAME_CN"] == null ){
                              $result=[];
                              $result["statusOnly"]=500;
                              $result["messageOnly"]= Yii::t('basics', "The area name cannot be empty!");
                              return  $result;
                          }

                          $entityOnly["AREA_CODE"] = $editlist[$j]["AREA_CODE"];
                          $entityOnly["AREA_NAME_CN"] = $editlist[$j]["AREA_NAME_CN"];
                          $entityOnly["AREA_NAME_EN"] = isset($editlist[$j]["AREA_NAME_EN"])?$editlist[$j]["AREA_NAME_EN"]:'';
                          $countOnly[] = $entityOnly;
                      }

                  }
              }
          }
          $isnull=true;
           if($countOnly!=null  &&  count($countOnly) > 0    )    //不连数据库验证时
           {
                   for($i=0;$i<count($countOnly);$i++ ){
                       for($j=$i+1;$j<count($countOnly);$j++ ){
                              if( $countOnly[$i]["AREA_CODE"]==$countOnly[$j]["AREA_CODE"]   )
                              {
                                  $isnull=false;
                                   $result=[];
                                   $result["statusOnly"]=500;
                                  $result["messageOnly"]=Yii::t('basics', "The encoding already exists. Please do not submit again!");
                                  return $result;
                              }
                             if( $countOnly[$i]["AREA_NAME_CN"] == $countOnly[$j]["AREA_NAME_CN"]    )
                             {
                                 $isnull=false;
                                 $result=[];
                                 $result["statusOnly"]=500;
                                 $result["messageOnly"]= Yii::t('basics', "The name has already exists. Please do not submit again!");
                                 return $result;
                             }
                         }
                       }
           }
             if($isnull) {   //连数据库验证时
                 $onlyCn = false;
                 $onlyCode = false;
                 $result = [];
                 $result["statusOnly"] = 200;
                 $result["messageOnly"] = "suess";
                 for ($i = 0; $i < count($countOnly); $i++)
                 {
                     if (  $countOnly[$i]["AREA_FID"] ==  "0" ) {   //地区的
                         if(  isset( $countOnly[$i]["ids"]) ){
                             $onlyCn = BArea::find()->where(["AREA_FID" => $countOnly[$i]["AREA_FID"],"AREA_NAME_CN" => $countOnly[$i]["AREA_NAME_CN"] ])->exists();
                             if ($onlyCn) {
                                 $result["statusOnly"] = 500;
                                 $result["messageOnly"] = Yii::t('basics', "The name has already exists. Please do not submit again!");
                                 return $result;
                             }
                             $onlyCode = BArea::find()->where(["AREA_FID" => $countOnly[$i]["AREA_FID"], "AREA_CODE" => $countOnly[$i]["AREA_CODE"] ])->exists();
                             if ($onlyCode) {
                                 $result["statusOnly"] = 500;
                                 $result["messageOnly"] = Yii::t('basics', "The encoding already exists. Please do not submit again!");
                                 return $result;
                             }
                         }else if( isset($countOnly[$i]["AREA_ID"]) ){

                                 $onlyCn = BArea::find()->where(["AREA_FID" => "0", "AREA_NAME_CN" => $countOnly[$i]["AREA_NAME_CN"]])->andWhere(["<>","AREA_ID",$countOnly[$i]["AREA_ID"]])->exists();
                                  if($onlyCn){
                                      $result["statusOnly"] = 500;
                                      $result["messageOnly"] = Yii::t('basics', "The name has already exists. Please do not submit again!");
                                      return $result;

                                  }

                                 $onlyCode = BArea::find()->where(["AREA_FID" => "0",  "AREA_CODE" => $countOnly[$i]["AREA_CODE"]])->andWhere(["<>","AREA_ID",$countOnly[$i]["AREA_ID"]])->exists();
                             if($onlyCode){
                                 $result["statusOnly"] = 500;
                                 $result["messageOnly"] = Yii::t('basics', "The encoding already exists. Please do not submit again!");
                                 return $result;
                             }
                         }
                         return $result;
                     } else {
                         $onlyCnG = false;
                         $onlyCodeG = false;
                         if (isset($countOnly[$i])) {
                             if ($countOnly[$i]["AREA_NAME_CN"]) {
                                 if(isset($countOnly[$i]["AREA_ID"])){
                                     $onlyCnG = BArea::find()->where(["and", ["<>", "AREA_FID", "0"],
                                         ["=", "AREA_NAME_CN", $countOnly[$i]["AREA_NAME_CN"]]])->andWhere(["<>", "AREA_ID", $countOnly[$i]["AREA_ID"]])->exists();
                                 }else{
                                     $onlyCnG = BArea::find()->where(["and", ["<>", "AREA_FID", "0"],
                                         ["=", "AREA_NAME_CN", $countOnly[$i]["AREA_NAME_CN"]]])->exists();
                                 }
                             }
                             if ($onlyCnG) {
                                 $result["statusOnly"] = 500;
                                 $result["messageOnly"] = Yii::t('basics', "The name has already exists. Please do not submit again!");
                                 return $result;
                             }
                             if (isset($countOnly[$i]["AREA_CODE"])) {

                                 if(isset($countOnly[$i]["AREA_ID"])){
                                     $onlyCodeG = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_CODE", $countOnly[$i]["AREA_CODE"]]])->andWhere(["<>", "AREA_ID", $countOnly[$i]["AREA_ID"]])->exists();
                                 }else{
                                     $onlyCodeG = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_CODE", $countOnly[$i]["AREA_CODE"]]])->exists();
                                 }

                                 if ($onlyCodeG) {
                                     $result["statusOnly"] = 500;
                                     $result["messageOnly"] = Yii::t('basics', "The encoding already exists. Please do not submit again!");
                                     return $result;
                                 }
                             }
                             if (isset($countOnly[$i]["AREA_NAME_EN"])) {
                                 if(isset($countOnly[$i]["AREA_ID"])){
                                     $onlyCodeG = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_CODE", $countOnly[$i]["AREA_CODE"]]])->andWhere(["<>", "AREA_ID", $countOnly[$i]["AREA_ID"]])->exists();
                                 }else{
                                     $onlyCodeG = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_NAME_EN", $countOnly[$i]["AREA_NAME_EN"]]])->exists();
                                 }
                                 if ($onlyCodeG) {
                                     $result["statusOnly"] = 500;
                                         $result["messageOnly"] = Yii::t('basics', "English name has already exists. Please do not submit again!");
                                     return $result;
                                 }
                             }
                         }
                     }
                 }
             }


          $result=[];
          $result["statusOnly"]=200;
          $result["messageOnly"]="suess";
          return $result;
      }
  }