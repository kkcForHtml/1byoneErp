<?php
/*
 * 语言包
 * 中文转英文
 * */
return [
    /*model*/
    //付款申请
	'Please fill in the complete condition!'=>'请填写完整条件!',
	'The current document has been audited and cannot be operated on!'=>'单据已审核,无法执行此操作!',
	'This operation cannot be performed because the current document is not audited!'=>'单据未审核,无法执行此操作!',
	'This operation cannot be performed if the current document is not audited or unpaid!'=>'单据未审核或未付款,无法执行此操作!',
	'This operation cannot be performed if the current document is not audited or has been paid!'=>'单据未审核或已付款,无法执行此操作!',
	'This document cannot be executed without payment of the current document!'=>'单据已付款,无法执行此操作!',
    //采购订单
    'Document details must have at least one!'=>'单据明细必须有至少一条!',
    'The system automatically generated documents can not be reverse audited'=>'系统自动生成的单据不能反审核!',

    /*logic*/
    //pinspectLogic.php
    'No data!'=>'没有数据!',
    'The document has been lost and cannot be operated on!'=>'单据已丢失,无法进行此操作!',
    'This operation cannot be performed without the inspection of the document!'=>'单据未验货,无法执行此操作!',
    'No found organization!'=>'没有对应的组织!',
    'No found channel!'=>'没有找到对应的平台!',
    'No found SKU!'=>'没有找到产品SKU!',
    'No found currency SKU!'=>'没有找到通用SKU!',

    //planLogic.php
    'This document has been used by other documents and cannot be performed this operation!'=>'该单据已被其他单据使用,不能执行此操作!',
    'The file cannot be read!'=>'无法读取这份文件!',
    'Dictionary cache did not find platform type!'=>'字典缓存没有找到平台类型!',
    'Successful operation!'=>'操作成功!',
    'No data! The currecy SKU,Turnover quantity and Total number are required!'=>'没有数据!其中通用SKU、翻单数量和合计为必填项!',
    'total Generate'=>'总生成',
    'document'=>'张单据',
    'total Generate {item} document'=>'总生成 {item} 张单据',
    'The first parameter is not an array!'=>'第一个参数不为数组!',

    //purchaseLogic.php
    'The current document has been closed and cannot be operated on!'=>'当前单据已关账,不能进行此操作!',
	'The current document does not meet the conditions for reverse examination!'=>'当前单据不符合反审核条件!',
	'The generated purchasing warehouse receipt has been audited and cannot be audited!'=>'生成的采购入库单已审核,不能反审核!',
	'The shipment bill has been issued and cannot be checked back!'=>'已经生成发运单,不能反审核!',
	'The generated inspection schedule has been reviewed and cannot be audited!'=>'生成的品检排程单已审核,不能反审核!',
	'The current purchase order has been generated and the payment request form cannot be audited!'=>'当前采购订单已经生成付款申请单,不能反审核!',
	'anti audit success!'=>'反审核成功!',
	'Unable to query purchase order details!'=>'查询不到采购订单明细数据!',
	'query no purchase order data!'=>'查询不到采购订单数据!',
/*
	'Dictionary cache did not find platform type'=>'字典缓存没有找到平台类型',
	'no find country'=>'没有找到国家',
	'this country no find sales organisation'=>'国家下没有对应的组织',
	'no find sku'=>'没有找到产品SKU',
	'no find currency sku'=>'没有找到通用SKU',
	'The current document has been closed and cannot be reverse audited!'=>'当前单据已关账，不能反审核！',
	'The current document has been closed and cannot be audited!'=>'当前单据已关账，不能审核！',
	'The current document is closed and cannot be altered!'=>'当前单据已关账，不能修改！',
	'Platform selection needs to be consistent!'=>'平台需选择一致！',
	'The documents must have at least one!'=>'单据明细必须有至少一条！',
	'no data'=>'无数据',
	'This cannot be done with the status of the document'=>'单据状态无法进行此操作',
	'Can not read file'=>'无法读取这份文件',
	'Can not find channel'=>'没有找到对应的平台',
	'There is no data to export!'=>'没有需要导出的数据！',
	'No find payment'=>'没有找到付款申请单',
	'The current documents have been paid, can not reaudit!'=>'当前单据已付款，不能反审核！'*/
];
