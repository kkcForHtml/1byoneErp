<?php

namespace addons\users\models;

use Yii;

use addons\organization\models\OOrganisation;

/**
 * This is the model class for table "u_user_organization".
 */

/**
 * @SWG\Definition(
 *   definition="UUserOrganization",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="USER_ORGANIZATION_ID", type="integer",description="用户组织分配ID"),
 *           @SWG\Property(property="USER_INFO_ID", type="integer",description="用户ID"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织ID")
 *       )
 *   }
 * )
 */
class UUserOrganization extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_user_organization';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['USER_INFO_ID', 'ORGANISATION_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'USER_ORGANIZATION_ID' => Yii::t('users', '用户组织分配ID'),
            'USER_INFO_ID' => Yii::t('users', '用户ID'),
            'ORGANISATION_ID' => Yii::t('users', '组织ID'),
        ];
    }

    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->joinWith(["ba_areas", "user_warehouse", "b_channel"]);
    }

    /*public function getO_organisation_area()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_CODE' => 'ORGANISATION_CODE'])->joinWith("ba_areas");
    }*/
}
