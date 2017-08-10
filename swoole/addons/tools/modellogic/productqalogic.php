<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/19
 * Time: 11:50
 */
namespace   addons\tools\modellogic;

  use addons\tools\models\QaProductFqa;

  class  productqalogic{
      /**
       * 新增产品问答
       * @param $post
       * @return string
       */
     public static  function  Saveqa($post)
     {
         $namePass=new QaProductFqa();
         $namePass->CUSER_CODE=getU_userinfo();                         //$post["CUSER_CODE"];      //创建者
         $namePass->ISACTIVE=$post["ISACTIVE"];   //问题状态
         $namePass->CLASSIFICATION=$post["CLASSIFICATION"];   //问题标签
         $namePass->PRODUCTC_ID=$post["PRODUCTC_ID"];
         $namePass->CSKU_CODE=$post["CSKU_CODE"];                       //通用SKU编码
         $namePass->PRODUCT_DE=$post["PRODUCT_DE"];                          //产品说明
         $namePass->TITILES=$post["TITILES"];
              return   $namePass->save();
     }
      /**
       *  解答产品中的问题
       */
      public static  function  updates($post){
          return QaProductFqa::updateAll(array('FAQ_CN'=>"回答了这个问题99",'UUSER_CODE'=>123),'PRODUCT_FQA_ID=:PRODUCT_FQA_ID',array(':PRODUCT_FQA_ID'=>32));
      }
  }