define(['angularAMD'], function(angularAMD) {
    'use strict';
    angularAMD.service('messageService',
        function() {

            return {
                error_has_child:"该法人主体下挂有组织，不能取消",
                error_forbidden_all:"禁用该组织，将会把该组织在隶属关系中的子组织一同禁用，是否确认？",
                error_choose_org:"请先选择需求组织",
                error_choose_one:"请先选择用户或者角色",
                error_information_empty:'暂无数据！',
                error_payment_notEquals:"总实付金额与采购明细实付金额总和不相等，系统将以采购明细实付金额总和为准，是否确认?",
                error_detail_delAll:'明细信息至少保留一条！',
                error_choose_n:"没有新增或者修改的行！",
                confirm_del:"确定要删除所选择数据吗？",
                confirm_audit:"审核会把当前审核的数据一起保存，确定操作吗？",
                confirm_audit_f:"确定反审核吗？",
                confirm_audit_c:"确定审核吗？",
                confirm_reset_password:"确定重置密码吗?",

                confirm_org_del:"删除所选择组织数据会连同分配的对应组织下的仓库一起删除，是否确定？",
                error_audit_a:"所选数据中包含已审核数据，请重新选择",
                error_audit_n:"所选数据中包含未审核数据，请重新选择",
                error_audit_s:"所选数据中包含系统生成数据，请重新选择",
                error_pay_y:"所选数据中已包含已付款数据，请重新选择",
                error_empty:"请选择需要操作的数据",
                error_exchange_rate:"没有相关汇率信息,请重新选择",
                error_empty_org:"请先给用户分配组织",

                dispatchPlan_n:"操作会导致库存出现负数，是否确定？",
                dispatchPlan_m:"操作会导致库存出现负数，是否确定？",
                dispatchPlan_c1:"发运数量总和不能大于翻单数量！",
                dispatchPlan_c2:"请选择需求组织！",
                dispatchPlan_c3:"请填写计划发运日期",
                dispatchPlan_c4:"请选择目的仓！",
                dispatchPlan_c5:"请选择平台！",
                dispatchPlan_c6:"中转仓出货数量和供应商出货数量不能同时为0！",

                dispatchOrder_c1:'请选择运输方式',
                dispatchOrder_c2:'请输入空运次数',
                dispatchOrder_c3:'请选择需求国SKU',
                dispatchOrder_c4:'实际发运数量要大于0',
                dispatchOrder_c5:'请输入实际发运日期',
                dispatchOrder_c6:'请选择报关币种',
                dispatchOrder_c7:'请输入报关价格',
                dispatchOrder_c8:'请输入预计送达日期',

            };
        });
});