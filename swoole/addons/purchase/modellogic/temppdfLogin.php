<?php
/**
 * Created by PhpStorm.
 * User:  Administrator
 * Date:  2017/6/2 0002
 * Time:  9: 22
 */
namespace addons\purchase\modellogic;

use Yii;

class temppdfLogin
{
    //模板标题1中文英文
    const TemplateOne = array(
        0 => array(
            0 => '采 购 订 单',
            1 => 'PURCHASE ORDER'
        ),
        1 => array(
            0 => '供应商',
            1 => 'Supplier'
        ),
        2 => array(
            0 => '需方',
            1 => 'Purchaser'
        ),
        3 => array(
            0 => '联系人',
            1 => 'Contact Person'
        ),
        4 => array(
            0 => '电话',
            1 => 'TEL'
        ),
        5 => array(
            0 => '订单号',
            1 => 'Order Number'
        ),
        6 => array(
            0 => '传真',
            1 => 'Fax'
        ),
        7 => array(
            0 => '币种',
            1 => 'Currency'
        ),
        8 => array(
            0 => '一.产品名称、规格、金额、供货日期及数量: ',
            1 => '1.Product description,specification,price,delivery date and quantity: '
        ),
        9 => array(
            0 => '序号',
            1 => 'NO.'
        ),
        10 => array(
            0 => '产品编码',
            1 => 'Model No.'
        ),
        11 => array(
            0 => '产品名称',
            1 => 'Descriptions'
        ),
        12 => array(
            0 => '规格',
            1 => 'Spec'
        ),
        13 => array(
            0 => '数量',
            1 => 'QTY'
        ),
        14 => array(
            0 => '单价',
            1 => 'Unit Price'
        ),
        15 => array(
            0 => '总价',
            1 => 'Total Price'
        ),
        16 => array(
            0 => '交货日期',
            1 => 'Delivery Date'
        ),
        17 => array(
            0 => '数量合计',
            1 => 'Total Quantity'
        ),
        18 => array(
            0 => '金额合计',
            1 => 'Total Value'
        ),
        19 => array(
            0 => '二. 质量要求、技术标准: 按需方要求，产品质量符合相关行业标准，因质量问题造成的一切经济损失由供方承担；',
            1 => '2. Quality Requirements: Products must be in line with industry standards and related national standards, all economic losses caused by quality problems are borne by the supplier.'
        ),
        20 => array(
            0 => '三. 结算方式及期限: 按双方确定的报价执行；',
            1 => '3. Price Condition: Carry out according to agreed price.'
        ),
        21 => array(
            0 => '四. 解决合同纠纷的方式: 友好协商，如协商不成，任何一方有权向人民法院提起诉讼；',
            1 => '4. Dissension Solution: Negotiate first.If can\'t have an agreement,then either party can apply for arbitration or litigation.'
        ),
        22 => array(
            0 => '五. 其他约定事项: 供应商在收到订单后，需要在一个工作日内确认并签字回传；',
            1 => '5. Other Items : After receiving the order,the supplier needs to confirm and sign back within one business day.'
        ),
        23 => array(
            0 => '备注',
            1 => 'Remark'
        ),
        24 => array(
            0 => '制单',
            1 => 'Prepared by'
        ),
        25 => array(
            0 => '跟单人',
            1 => 'Merchandiser'
        ),
        26 => array(
            0 => '审批',
            1 => 'Checked by'
        ),
        27 => array(
            0 => '批准',
            1 => 'Approved by'
        ),
        28 => array(
            0 => '日期',
            1 => 'Date'
        ),
        29 => array(
            0 => '部门',
            1 => 'Department'
        ),
        30 => array(
            0 => '供方签名',
            1 => 'Supplier Signature'
        ),
        31 => array(
            0 => '交货日期回签',
            1 => 'Delivery Date'
        )

    );

    //模板标题2中文英文
    const TemplateTwo = array(
        0 => array(
            0 => '深圳万百万科技有限公司',
            1 => 'Shenzhen 1Byone Technology Co. Ltd',
        ),
        1 => array(
            0 => '地址: 广东省深圳市南山区塘岭路1号金骐智谷大厦19搂1901-1902室',
            1 => 'Address: Room 1901-1902, Jinqi Wisdom Valley Building, No.1 Tangling Road, Nanshan District,Shenzhen City, Guangzhou Province',
        ),
        2 => array(
            0 => '电话: 0755-23763796',
            1 => 'TEL: 0755-23763796',
        ),
        3 => array(
            0 => '传真: 0755-29022260',
            1 => 'FAX: 0755-29022260',
        ),
        4 => array(
            0 => '采 购 订 单',
            1 => 'PURCHASE ORDER',
        ),
        5 => array(
            0 => '乙方',
            1 => 'Party B',
        ),
        6 => array(
            0 => '订单号',
            1 => 'Order Number',
        ),
        7 => array(
            0 => '联系人',
            1 => 'Contact Person',
        ),
        8 => array(
            0 => '订单日期',
            1 => 'Order Date',
        ),
        9 => array(
            0 => '电话',
            1 => 'TEL',
        ),
        10 => array(
            0 => '币别',
            1 => 'Currency',
        ),
        11 => array(
            0 => '传真',
            1 => 'Fax',
        ),
        12 => array(
            0 => '序号',
            1 => 'No.',
        ),
        13 => array(
            0 => '产品编码',
            1 => 'Model No.',
        ),
        14 => array(
            0 => '产品名称',
            1 => 'Descriptions',
        ),
        15 => array(
            0 => '报关品名',
            1 => 'Commodity',
        ),
        16 => array(
            0 => '规格',
            1 => 'Spec',
        ),
        17 => array(
            0 => '单位',
            1 => 'Unit',
        ),
        18 => array(
            0 => '数量',
            1 => 'QTY',
        ),
        19 => array(
            0 => '单价',
            1 => 'Unit Price',
        ),
        20 => array(
            0 => '总价',
            1 => 'Total Price',
        ),
        21 => array(
            0 => '交货日期',
            1 => 'Delivery Date',
        ),
        22 => array(
            0 => '合计',
            1 => 'Total',
        ),
        23 => array(
            0 => '备注',
            1 => 'Remark',
        ),
        24 => array(
            0 => '1、以上价格含税，乙方提供发票为: ',
            1 => '1.The above price included the tax. Invoice: ',
            2 => ' 17% ',
        ),
        25 => array(
            0 => '增值税专用发票；',
            1 => 'VAT Special Invoice',
        ),
        26 => array(
            0 => '2、结算方式及期限: ',
            1 => '2.Price Condition: ',
        ),
        27 => array(
            0 => ' 按甲乙双方签订的采购合同执行；',
            1 => 'Carry out according to the Procurement Contract which has been signed by both Parties.',
        ),
        28 => array(
            0 => '3、送货地址: ',
            1 => '3.Shipping Address: ',
        ),
        29 => array(
            0 => ' 送至需甲方指定地点；',
            1 => 'Party B should ship the products to the party A designated location. ',
        ),
        30 => array(
            0 => '4、凭证要求/技术标准: 产品质量应按甲乙双方签订的采购合同执行，若因产品质量问题造成的一切经济损失，由乙方承担全部责任；',
            1 => '4.Quality Requirements: Carry out according to the Procurement Contract which has been signed by both Parties, all economic losses caused by quality problems are borne by Party B.',
        ),
        31 => array(
            0 => '5、乙方在送货时，应提供乙方有公司出货专用章之类的送货单据，送货单内产品名称、规格型号等应与本订单一致并附本订单；',
            1 => '5.Party B should provide Delivery Note when ship the products to designated location,the product description, specification and all other information in the Delivery Note must be the same with the order.',
        ),
        32 => array(
            0 => '6、订单24小时内应由乙方签名回传，逾期视为乙方已接收订单所有要求，如因产品交期未达到订单要求，公司将保留追究乙方责任的权利。',
            1 => '6.After receiving the order,Party B needs to confirm and sign back within one business day. Overdue is seen as Party B has accepted all the requirements of the order.If the product delivery time does not meet the order requirements, Party A reserves the right to take legal action of Party B.',
        ),
        33 => array(
            0 => '乙方签名(盖章)',
            1 => 'Party B signature(stamp)',
        ),
        34 => array(
            0 => '甲方签名(盖章)',
            1 => 'Party A signature(stamp)',
        ),
        35 => array(
            0 => '制单',
            1 => 'Prepared by',
        ),
        36 => array(
            0 => '跟单人',
            1 => 'Merchandiser',
        ),
        37 => array(
            0 => '审批',
            1 => 'Checked by',
        ),
        38 => array(
            0 => '批准',
            1 => 'Approved by',
        ),
        39 => array(
            0 => '日期',
            1 => 'Date',
        ),
        40 => array(
            0 => '部门',
            1 => 'Department',
        ),
    );

    /**
     * 模板1html 拼装
     * $list 数据
     * $num 模板
     * */
    public static function GetTemplate($list, $num)
    {
        if ($num == '1' || $num == '2') {
            return static::GetTemplateOne($list, $num);
        }
        if ($num == '3' || $num == '4') {
            return static::GetTemplateTwo($list, $num);
        }
    }

    /**
     * 模板1html 拼装
     * $list 数据
     * $num 1中文 2英文
     * */
    public static function GetTemplateOne($data, $num)
    {
        $title = self::TemplateOne;
        $i = 0;
        if ($num == '2') {
            $i = 1;
        }

        $htmlHeaher = '';//页头
        $htmlContent = '';//内容
        $htmlFooter = '';//页脚
        $htmls = '';//组织架构报表用名
        $htmls_l = '';//表格内容
        $htmls_remarks = '';//备注
        $array = '';//拼装后返回的数据
        $page = 10;//每页条数
        //是否显示组织架构报表用名
        if ($data['HEADER_STATE'] !== null && $data['HEADER_STATE']) {
            $htmls = "<h3 class=\"text-center\" style=\"color:  red;margin: 0px;\">" . $data['ORGANISATION_NAME_EN'] . "</h3>";
        }
        //判断是否有备注
        if ($data['ORDER_REMARKS'] !== null && $data['ORDER_REMARKS']) {
            $htmls_remarks = "<div class=\"row\" style=\"margin-bottom:  30px\"><span>" . $title[23][$i] . ": " . $data['ORDER_REMARKS'] . "</span></div>";
        }
        $time = $tiem = $data['AUTITO_AT'] !== null ? date("Y-m-j", $data['AUTITO_AT']) : "";

        $htmlHeaher = <<<TOE
            <div style="height:100%;">
            <div>
                {$htmls}
                <div class="text-center ">
                    <h3  style="color:  red">{$title[0][$i]}</h3>
                    <div style="height:3px;border:none;border-top:solid 1px red;width:200px;margin: 0 auto;" ></div>
                    <div style="height:3px;border:none;border-top:solid 1px red;width:200px;margin: 0 auto;" ></div>
                </div>
            </div>
            <div style="height:20px;"></div>
            <div class="row" >
                <div class="col-xs-5 text-left" >
                    <span style="color:  red">{$title[1][$i]}: </span><span>{$data['PARTNER_NAME_CN']}</span>
                </div>
                <div class="col-xs-5 text-left" >
                    <span style="color:  red">{$title[2][$i]}: </span><span>{$data['ORGANISATION_NAME_CN']}</span>
                </div>

                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[3][$i]}: </span><span>{$data['CONTACT']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[3][$i]}: </span><span>{$data['ORCONTACT']}</span>
                </div>

                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[4][$i]}: </span><span>{$data['PHONE']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[5][$i]}: </span><span>{$data['PU_PURCHASE_CD']}</span>
                </div>

                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[6][$i]}: </span><span>{$data['FAX']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[4][$i]}: </span><span>{$data['ORPHONE']}</span>
                </div>

                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[7][$i]}: </span><span>{$data['MONEY_NAME_CN']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color:  red">{$title[6][$i]}: </span><span>{$data['ORFAX']}</span>
                </div>
            </div>
            <div class="row" style="margin-top:20px;margin-bottom:10px;text-align: left;">
                <span>{$title[8][$i]}</span>
            </div>

TOE;

        $htmlFooter = <<<TOE
                        <div class="row" style="height:10px;"></div>
                        <div class="row" style="margin-bottom:  10px;text-align: left;">
                            <span>{$title[19][$i]}</span>
                        </div>
                        <div class="row" style="margin-bottom:  10px;text-align: left;">
                            <span>{$title[20][$i]}</span>
                        </div>
                        <div class="row" style="margin-bottom:  10px;text-align: left;">
                            <span>{$title[21][$i]}</span>
                        </div>
                        <div class="row"  style="margin-bottom:  10px;text-align: left;">
                            <span>{$title[22][$i]}</span>
                        </div>
                        {$htmls_remarks}
                        <div class="row">
                            <div class="col-xs-3 text-left"  style="margin-bottom:10px;">
                                <span style="color:  red">{$title[24][$i]}: </span><span>{$data['CSTAFF_CODE']}</span>
                            </div>
                            <div class="col-xs-3 text-left" style="margin-bottom:10px;">
                                <span style="color:  red">{$title[25][$i]}: </span><span>{$data['FUSTAFF_CODE']}</span>
                            </div>
                            <div class="col-xs-3 text-left" style="margin-bottom:10px;">
                                <span style="color:  red">{$title[26][$i]}: </span><span>{$data['AUSTAFF_CODE']}</span>
                            </div>
                            <div class="col-xs-3 text-left" style="margin-bottom:10px;">
                                <span style="color:  red">{$title[27][$i]}: </span><span>{$data['PIZHUN']}</span>
                            </div>
                            <div class="col-xs-3 text-left" style="margin-bottom:10px;">
                                <span style="color:  red">{$title[28][$i]}: </span><span>{$time}</span>
                            </div>
                            <div class="col-xs-3 text-left" style="margin-bottom:10px;">
                                <span style="color:  red">{$title[29][$i]}: </span><span>{$data['BUMEN']}</span>
                            </div>

                        </div>
                        <div class="row" style="margin:  20px 0px; text-align: left;">
                            <div class="col-xs-5">
                                <span style="color:  red;font-weight: bold;font-size:16px;">{$title[30][$i]}: </span>
                            </div>
                            <div class="col-xs-5">
                                <span style="color:  red;font-weight: bold;font-size:16px;">{$title[31][$i]}: </span>
                            </div>
                        </div>


TOE;

        $htmlnumpr = <<<TOE
                        <div class="row" style="margin-bottom:  0">
                                 <table  class="table table-bordered" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;border-top:  0;text-align: right;">
                                            <span>{$title[17][$i]}:&nbsp;&nbsp;</span><span>{$data['detailNum']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span>{$title[18][$i]}:&nbsp;&nbsp;</span><span>{$data['detailMoeny']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        </td>
                                    </tr>
                                 </table>
                       </div>
TOE;

        //循环内容
        if (count($data['detail']) > 0) {

            foreach ($data['detail'] as $index => $item) {
                $htmls_l .= "<tr>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['index'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['PSKU_CODE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['PSKU_NAME_CN'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['FNSKU'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['PURCHASE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['TAX_UNITPRICE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['NUMPRICE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['COMMI_PERIOD'] . "</td>
                                </tr>";
                //每页十条
                if (is_int(($index + 1) / $page)) {
                    $html_numpr = '';
                    if (($index + 1) == count($data['detail'])) {
                        $html_numpr = $htmlnumpr;
                    }
                    $htmlContent = <<<TOE
                        <div class="row"  style="margin-bottom:  0px;">
                            <table  class="table table-bordered" style="margin-bottom:  0">
                                <tr>
                                    <td width="50" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;;font-size:  14px; padding:  5px 3px;">{$title[9][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[10][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[11][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[12][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[13][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[14][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[15][$i]}</td>
                                    <td width="100" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[16][$i]}</td>
                                </tr>
                                {$htmls_l}
                            </table>
                        </div>
                        $html_numpr
TOE;


                    $array .= $htmlHeaher . $htmlContent . '</div>';
                    $htmls_l = '';


                }

                if (($index + 1) == count($data['detail']) && !is_int(($index + 1) / $page)) {
                    $htmlContent = <<<TOE
                        <div class="row" >
                            <table  class="table table-bordered" style="margin-bottom:  0">
                                <tr>
                                    <td width="50" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;;font-size:  14px; padding:  5px 3px;">{$title[9][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[10][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[11][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[12][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[13][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[14][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[15][$i]}</td>
                                    <td width="100" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[16][$i]}</td>
                                </tr>
                                {$htmls_l}
                            </table>
                        </div>
                        $htmlnumpr

TOE;
                    $array .= $htmlHeaher . $htmlContent . $htmlFooter . '</div>';
                    $htmls_l = '';
                }


            }
            if (count($data['detail']) < $page && $htmls_l !== "") {
                $htmlContent = <<<TOE
                        <div class="row">
                            <table  class="table table-bordered" style="margin-bottom:  0">
                                <tr>
                                    <td width="50" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;;font-size:  14px; padding:  5px 3px;">{$title[9][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[10][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[11][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[12][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[13][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[14][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[15][$i]}</td>
                                    <td width="100" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;color:  red;font-size:  14px; padding:  5px 3px;">{$title[16][$i]}</td>
                                </tr>
                                {$htmls_l}
                            </table>

                        </div>
                        $htmlnumpr
TOE;
                $array .= $htmlHeaher . $htmlContent . $htmlFooter . '</div>';
            }
        }
        return $array;
    }

    /**
     * 模板2html 拼装
     * $list 数据
     * $num 1中文 2英文
     * */
    public static function GetTemplateTwo($data, $num)
    {
        $title = self::TemplateTwo;
        $i = 0;
        if ($num == '4') {
            $i = 1;
        }

        $htmlHeaher = '';//页头
        $htmlContent = '';//内容
        $htmlFooter = '';//页脚
        $htmls_l = '';//表格内容
        $htmls_remarks = '';//备注
        $array = '';//拼装后返回的数据
        $page = 10;//每页条数
        $img = Yii::getAlias('@upload/print/logostore.png');

        //判断是否有备注
        if ($data['ORDER_REMARKS'] !== null && $data['ORDER_REMARKS']) {
            $htmls_remarks = "<div class=\"row\" style=\"margin-bottom: 10px\"><span>" . $title[23][$i] . ": " . $data['ORDER_REMARKS'] . "</span></div>";
        }

        $time = $data['PRE_ORDER_AT'] !== null ? date("Y-m-d", $data['PRE_ORDER_AT']) : "";
        $time2 = $data['AUTITO_AT'] !== null ? date("Y-m-d", $data['AUTITO_AT']) : "";
        $htmlHeaher = <<<TOE
        <div style="height:100%;">
        <div style="margin-bottom: 20px">
            <div class="row" style="color: red !important;">
                <div class="col-xs-1" style="padding-top:10px;">
                    <img  src="{$img}" style="width: 100%">
                </div>
                <div class="col-xs-8">
                      <div class="text-center" style="color: red;padding-bottom: 5px">
                          <span>{$title[0][$i]}</span>
                      </div>
                    <div class="text-center" style="color: red;padding-bottom: 5px">
                        <span>{$title[1][$i]}</span>
                    </div>
                    <div class="text-center" >
                        <span style="color: red;">{$title[2][$i]}&nbsp;&nbsp;&nbsp;&nbsp;{$title[3][$i]}</span>
                    </div>
                </div>
            </div>
            <div class="text-center ">
                <h3  style="color: red">{$title[4][$i]}</h3>
                <div style="height:3px;border:none;border-top:solid 1px red;width:200px;margin: 0 auto;" ></div>
                <div style="height:3px;border:none;border-top:solid 1px red;width:200px;margin: 0 auto;" ></div>
            </div>

        </div>
        <div>
            <div class="row">
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[5][$i]}:&nbsp;</span><span>{$data['PARTNER_NAME_CN']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[6][$i]}:&nbsp;</span><span>{$data['PU_PURCHASE_CD']}</span>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[7][$i]}:&nbsp;</span><span>{$data['CONTACT']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[8][$i]}:&nbsp;</span><span>{$time}</span>
                </div>
            </div>
            <div class="row" style="">
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[9][$i]}:&nbsp;</span><span>{$data['PHONE']}</span>
                </div>
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[10][$i]}:&nbsp;</span><span>{$data['MONEY_NAME_CN']}</span>
                </div>
            </div>
            <div class="row" style="margin-bottom: 10px">
                <div class="col-xs-5 text-left">
                    <span style="color: red">{$title[11][$i]}:&nbsp;</span><span>{$data['FAX']}</span>
                </div>
            </div>
        </div>

TOE;

        $htmlFooter = <<<TOE
        <div class="row" style="height:10px;"></div>
        {$htmls_remarks}
        <div class="row" style="margin-bottom: 10px">
            <span>{$title[24][$i]}&nbsp;<u>{$title[24][2]}</u>&nbsp;{$title[25][$i]}</span>
        </div>
        <div class="row" style="margin-bottom: 10px">
            <span>{$title[26][$i]}&nbsp;<u>{$title[27][$i]}</u></span>
        </div>
        <div class="row" style="margin-bottom: 10px">
            <span>{$title[28][$i]}&nbsp;<u>{$title[29][$i]}</u></span>
        </div>
        <div class="row"  style="margin-bottom: 10px">
            <span>{$title[30][$i]}</span>
        </div>
        <div class="row"  style="margin-bottom: 10px">
            <span>{$title[31][$i]}</span>
        </div>
        <div class="row"  style="margin-bottom: 10px">
            <span>{$title[32][$i]}</span>
        </div>

        <div class="row"  style=" margin-top: 10px; margin-bottom: 30px">
              <div class="col-xs-5 text-left"><span>{$title[33][$i]}:&nbsp;</span></div>
              <div class="col-xs-5 text-left"><span>{$title[34][$i]}:&nbsp;</span></div>
        </div>

        <div class="row">
            <div class="col-xs-3 text-left">
                <span style="color: red">{$title[35][$i]}:&nbsp;</span><span>{$data['CSTAFF_CODE']}</span>
            </div>
            <div class="col-xs-3 text-left">
                <span style="color: red">{$title[36][$i]}:&nbsp;</span><span>{$data['FUSTAFF_CODE']}</span>
            </div>
            <div class="col-xs-3 text-left">
                <span style="color: red">{$title[37][$i]}:&nbsp;</span><span>{$data['AUSTAFF_CODE']}</span>
            </div>
            <div class="col-xs-3 text-left">
                <span style="color: red">{$title[38][$i]}:&nbsp;</span><span>{$data['PIZHUN']}</span>
            </div>
            <div class="col-xs-3 text-left">
                <span style="color: red">{$title[39][$i]}:&nbsp;</span><span>{$time2}</span>
            </div>
            <div class="col-xs-3 text-left">
                <span style="color: red">{$title[40][$i]}:&nbsp;</span><span>{$data['BUMEN']}</span>
            </div>

        </div>

TOE;

        $htmlnumpr = <<<TOE
                                <tr>
                                    <td colspan="2" class="text-center" style="border: solid 1px red;font-size:  14px;"><span>{$title[22][$i]}</span></td>
                                    <td colspan="2" style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>

                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td style="border: solid 1px red;font-size:  14px; padding:  5px 3px;">{$data['detailNum']}</td>
                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td style="border: solid 1px red;font-size:  14px; padding:  5px 3px;">{$data['MONEY_SYMBOLS']}{$data['detailMoeny']}</td>
                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                </tr>
                                <tr>
                                    <td colspan="2" class="text-right" style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td colspan="2" style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>

                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;"></td>
                                    <td colspan="3" class="text-center" style="border: solid 1px red;font-size:  14px; padding:  5px 3px;">{$data['detailMoenyCh']}</td>

                                </tr>
TOE;

        //循环内容
        if (count($data['detail']) > 0) {

            foreach ($data['detail'] as $index => $item) {
                $htmls_l .= "<tr><td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['index'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['PSKU_CODE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['PSKU_NAME_CN'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['CUSTOMS_NAME'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['FNSKU'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['UNIT_NAME_CN'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['PURCHASE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['TAX_UNITPRICE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['NUMPRICE'] . "</td>
                                    <td class='text-center' style='border: solid 1px red;font-size:  14px; padding:  5px 3px;'>" . $item['COMMI_PERIOD'] . "</td></tr>";
                //每页5条
                if (is_int(($index + 1) / $page)) {
                    $html_numpr = '';
                    if (($index + 1) == count($data['detail'])) {
                        $html_numpr = $htmlnumpr;
                    }
                    $htmlContent = <<<TOE
                        <div class="row" style="margin-bottom:  0px;">
                            <table  class="table table-bordered" style="margin-bottom:  0">
                                <tr>
                                    <td width="50" class="text-center " style="border: solid 1px red; padding:  5px 3px;color:  red;font-size:  14px;">{$title[12][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red; padding:  5px 3px;color:  red;font-size:  14px;">{$title[13][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red; padding:  5px 3px;color:  red;font-size:  14px;">{$title[14][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[15][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[16][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[17][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[18][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[19][$i]}</td>
                                    <td  class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[20][$i]}</td>
                                    <td  class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[21][$i]}</td>
                                </tr>
                                {$htmls_l}
                                {$html_numpr}
                            </table>

                        </div>
TOE;

                    $array .= $htmlHeaher . $htmlContent . '</div>';
                    $htmls_l = '';


                }

                if (($index + 1) == count($data['detail']) && !is_int(($index + 1) / $page)) {
                    $htmlContent = <<<TOE
                        <div class="row" style="margin-bottom:  10px;">
                            <table  class="table table-bordered" style="margin-bottom:  0">
                                <tr>
                                    <td width="50" class="text-center " style="border: solid 1px red; padding:  5px 3px;color:  red;font-size:  14px;">{$title[12][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red; padding:  5px 3px;color:  red;font-size:  14px;">{$title[13][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red; padding:  5px 3px;color:  red;font-size:  14px;">{$title[14][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[15][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[16][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[17][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[18][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[19][$i]}</td>
                                    <td  class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[20][$i]}</td>
                                    <td  class="text-center " style="border: solid 1px red;padding:  5px 3px;color:  red;font-size:  14px;">{$title[21][$i]}</td>
                                </tr>
                                {$htmls_l}
                                {$htmlnumpr}
                            </table>

                        </div>
TOE;
                    $array .= $htmlHeaher . $htmlContent . $htmlFooter . '</div>';
                    $htmls_l = '';
                }

            }
            if (count($data['detail']) < $page && $htmls_l !== "") {
                $htmlContent = <<<TOE
                        <div class="row"  style="margin-bottom:  10px;">
                            <table  class="table table-bordered" style="margin-bottom:  0">
                                <tr>
                                    <td width="50" class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[12][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[13][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[14][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[15][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[16][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[17][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[18][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[19][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[20][$i]}</td>
                                    <td class="text-center " style="border: solid 1px red;color:  red;font-size:  14px; padding:  5px 3px;">{$title[21][$i]}</td>
                                </tr>
                                {$htmls_l}
                                {$htmlnumpr}
                            </table>

                        </div>
TOE;
                $array .= $htmlHeaher . $htmlContent . $htmlFooter . '</div>';
            }
        }
        return $array;
    }


}