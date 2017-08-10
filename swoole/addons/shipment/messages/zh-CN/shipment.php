<?php
/*
 * 语言包
 * 中文转英文
 * */
return [
    /*model*/
    //ShDispatchNote.php
    'The conditions are incomplete and no operation is allowed!' => '条件不完整,禁止操作!',
    'The current document does not exist and is forbidden to operate!' => '当前单据不存在,禁止操作!',
    'The current document has been audited and cannot be operated on!' => '单据已审核,无法执行此操作!',
    'This operation cannot be performed because the current document is not audited!' => '单据未审核,无法执行此操作!',
    /*logic*/
    //dispatchLogic.php
    'Incomplete structure, unable to generate documents!' => '结构不完整,无法生成单据!',
    'Successful operation!' => '操作成功!',
    'The quantity of shipment in transit warehouse and the quantity of supplier can not be 0 at the same time!' => '中转仓出货数量和供应商出货数量不能同时为0!',
    'total Generate {item} document' => '总生成 {item} 张单据',
    'The document is in the deleted state and cannot be audited!' => '单据已是被删除状态,无法审核单据!',
    'The document is in the period of close account and cannot be audited!' => '单据已处于关账期间,无法审核单据!',
    'The structure is incomplete and cannot be audited!' => '结构不完整,无法审核单据!',
    'Audit failed: shipment tracking generation error occurred. Error prompt:' => '审核失败:发运跟踪生成出错.错误提示:',
    'Audit failure: internal purchase order form error. Error prompt:' => '审核失败:内部采购入库单生成出错.错误提示:',
    'Audit failed: internal purchase order generation error. Error prompt:' => '审核失败:内部采购订单生成出错.错误提示:',
    'Audit failure: internal sales out of order generated error. Error warning: the shipment request organization does not bind the business partner.' => '审核失败:内部销售出库单生成出错.错误提示:发运单需求组织没有绑定业务伙伴.',
    'Audit failure: internal sales out of order generated error. Error prompt:' => '审核失败:内部销售出库单生成出错.错误提示:',
    'Audit failed: internal sales order generation error. Error warning: the shipment request organization does not bind the business partner.' => '审核失败:内部销售订单生成出错.错误提示:发运单需求组织没有绑定业务伙伴.',
    'Audit failed: internal sales order generation error. Error prompt:' => '审核失败:内部销售订单生成出错.错误提示:',
    'Audit failed: the storage list generated error. Error prompt:' => '审核失败:待入库单生成出错.错误提示:',
    'Audit failure: purchase warehouse receipt error occurred. Error prompt:' => '审核失败:采购入库单生成出错.错误提示:',
    'Audit failed: the allocation form was generated error. Error: transfer to warehouse cannot be empty' => '审核失败:调拨单生成出错.错误提示:调入仓库不能为空',
    'Audit failed: the allocation form was generated error. Error prompt:' => '审核失败:调拨单生成出错.错误提示:',
    'Current document' => '当前单据',
    'Reverse audit failure!' => '反审核失败!',
    'No data can be generated for notification!' => '没有数据，无法生成通知!',
    'Pending documents are not in receipt status!' => '待入库单据不是未收货状态',
    'The structure is incomplete and cannot generate notifications!' => '结构不完整，无法生成通知!',
    'Customs declaration unit price must be greater than 0!' => '报关单价必须大于0！',
    'The generated pending documents are not in the state of receipt, and the audit failed!' => '已经生成的待入库单据不是未收货状态,反审核失败!',
    'Internal sales out of audit errors:'=>'内部销售出库反审核出错：',
    'Purchase order quantity modification error:'=>'采购订单数量修改出错：',
    'There is an error in the quantity adjustment of the stock adjustment list:'=>'库存调整单数量修改出错：',
    'Audit error pending warehousing:'=>'待入库反审核出错：',
    'Errors in purchasing, warehousing, SLR audit:'=>'采购入库单反审核出错：',
    'In transit warehouse allocation, SLR audit error:'=>'在途仓的调拨单反审核出错：',
    'Internal sales order audit error:'=>'内部销售订单反审核出错：',
    'Internal purchase order reverse audit error:'=>'内部采购订单反审核出错：',
    'Internal procurement, warehousing, SLR audit error:'=>'内部采购入库单反审核出错：',
    //trackingdetailLogic.php
    'No data!' => '没有数据!',
];
