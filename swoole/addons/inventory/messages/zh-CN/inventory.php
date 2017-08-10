<?php
/*
 * 语言包
 * 中文转英文
 * */
return [
	'Incomplete structure, unable to generate documents!'=>'结构不完整，无法生成单据！',
	/*model*/
	//SkAllocation.php
	'Parameter check failed'=>'参数校验失败',
	//SkFiallocation.php
	'The current time has been closed, can not be added!'=>'当前时间已关账,不能新增!',
	'New parameters are incomplete, new additions are not allowed!'=>'新增参数不全,不允许新增!',
	'The current document is not allowed during the closing period!'=>'当前单据处于关账期间,不允许编辑!',
	'The current document has been audited and cannot be operated on!'=>'单据已审核,无法执行此操作!',
	'This operation cannot be performed because the current document is not audited!'=>'单据未审核,无法执行此操作!',
	'The system automatically generated documents can not be reverse audited'=>'系统自动生成的单据不能反审核!',
	//SkStorageDetail.php
	'No find purchase order!'=>'找不到采购订单!',
	'No find storage order!'=>'找不到入库单!',
	'Purchase order {PURCHASE_CD} only can storage {NUMBER} !'=>'采购订单 {PURCHASE_CD} 只能入库 {NUMBER} !',
	'Storage order {STORAGE_CD} only can red storage {NUMBER} !'=>'入库单 {STORAGE_CD} 只能红字入库 {NUMBER} !',

	/*logic*/
	//AdjustmentLogic.php
	'Query was successful!'=>'查询成功!',
	'Document status is unknown.'=>'单据状态指代不明.',
	//allocationLogic.php
    'The selected data contained the confirmation of the library documents, can not be audited!'=>'所选数据中含已确认出库单据,不能反审核!',
    'Call out {sku} is insufficient stock!'=>'调出SKU{sku}库存不足!',
    'Successful operation!'=>'操作成功!',
    //PenddeliveryLogic.php
    'It has been shipped out of documents, not allowed to operate!'=>'是已出库单据,不允许操作!',
    'Error of single type to be delivered!'=>'待出库单类型错误!',
    'Please cancel the storage plan for the transfer plan: {allocationcd}'=>'请先将调拨计划单:{allocationcd}对应的待入库单取消入库',
    'Exception error'=>'异常错误',
    //PendstorageLogic.php
    'Operation error'=>'操作错误',
    'Please select details for storage!'=>'请选择待入库详情调拨单!',
    'The incoming order does not exist!'=>'待入库单不存在!',
    'The selected order form and the details of the allocation sheet are inconsistent!'=>'所选入库单和详情调拨单不一致!',
    //placingLogic.php
    'The orderclassify parameter cannot be null!'=>'orderclassify参数不能为空!',
    'No data!'=>'没有数据!',
    //initialise
	'Document details must have at least one!'=>'单据明细必须有至少一条！',
	'Only one document is allowed in the same organisation and same channel and same warehouse!'=>'同一组织同一平台同一仓库只允许存在一张库存初始化单据！',
	'The current document has been initialized and cannot be reverse audited!'=>'当前单据已初始化，不能反审核！',
	'The file cannot be read!'=>'无法读取这份文件！',
    'Can not find the organization by name!'=>'根据组织名称找不到组织!',
    'Find multiple organizations by name!'=>'根据组织名称找到多个组织!',
    'Can not find the channel by name!'=>'根据平台名称找不到平台!',
    'Find multiple channel by name!'=>'根据平台名称找到多个平台!',
    'Can not find the warehouse by name!'=>'根据仓库名称找不到仓库!',
    'Find multiple warehouse by name!'=>'根据仓库名称找到多个仓库!',
    'Can not find SKU in the organization!'=>'在对应的组织下找不到SKU!',
];
