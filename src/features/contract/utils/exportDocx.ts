import { ContractExportFormData } from "../components/ExportContractModal";

/**
 * Helper to convert number to Vietnamese text (Price in words)
 */
export function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num)) return "";
  const defaultWords = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readThreeDigits(n: number, showZeroHundred: boolean): string {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const unit = n % 10;
    let res = "";

    if (hundred > 0 || showZeroHundred) {
      res += defaultWords[hundred] + " trăm ";
    }

    if (ten > 1) {
      res += defaultWords[ten] + " mươi ";
      if (unit === 1) res += "mốt ";
      else if (unit === 5) res += "lăm ";
      else if (unit > 0) res += defaultWords[unit] + " ";
    } else if (ten === 1) {
      res += "mười ";
      if (unit === 1) res += "một ";
      else if (unit === 5) res += "lăm ";
      else if (unit > 0) res += defaultWords[unit] + " ";
    } else if (hundred > 0 && unit > 0) {
      res += "lẻ " + defaultWords[unit] + " ";
    } else if (unit > 0) {
      res += defaultWords[unit] + " ";
    }

    return res;
  }

  let str = Math.round(num).toString();
  const groups: number[] = [];
  while (str.length > 0) {
    groups.push(parseInt(str.slice(-3), 10));
    str = str.slice(0, -3);
  }

  let resultWords = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const readG = readThreeDigits(g, i < groups.length - 1);
      resultWords += readG + units[i] + " ";
    }
  }

  resultWords = resultWords.trim();
  if (resultWords) {
    resultWords = resultWords.charAt(0).toUpperCase() + resultWords.slice(1) + " đồng chẵn";
  }
  return resultWords;
}

/**
 * Utility to export contract details to a Microsoft Word (.doc) file client-side
 * with EXACT 100% compliance with Master Template & Sample format.
 */
export function exportContractDocx(contract: any, customFormData?: ContractExportFormData) {
  if (!contract) return;

  const company = contract.company || {};
  const customer = contract.customer || {};
  const booking = contract.booking || {};

  // Formatted signing date split
  const rawSigningDate = customFormData?.signing_date || "01/08/2026";
  const dateParts = rawSigningDate.split(/[\/\.-]/);
  const day = dateParts[0] || "01";
  const month = dateParts[1] || "08";
  const year = dateParts[2] || "2026";

  const signingLocation = customFormData?.signing_location || (company.address ? `Trụ sở ${company.name}` : "Trụ sở Bên B");
  const contractCode = customFormData?.contract_code || contract.contract_code || `88/2026/HĐDV-VTL`;

  // Dates
  const startDateStr = customFormData?.start_date || "01/08/2026";
  const endDateStr = customFormData?.end_date || "31/07/2027";

  // Resolved Customer Info (Party A)
  const partyA = {
    company_name: customFormData?.customer_company_name || customer.company_name || customer.representative || "CỬA HÀNG THỜI TRANG NHẬT LONG",
    address: customFormData?.customer_address || customer.address || booking.address || "Số 122 Đường 30 Tháng 4, Phường An Phú, Quận Ninh Kiều, TP. Cần Thơ",
    tax_code: customFormData?.customer_tax_code ? customFormData.customer_tax_code : (customer.tax_code && customer.tax_code !== "........................" ? customer.tax_code : "Cá nhân (Không có MST)"),
    phone: customFormData?.customer_phone || customer.phone || "0292 3888 777",
    email: customFormData?.customer_email || customer.email || "nhatlongfashion.ct@gmail.com",
    representative: customFormData?.customer_representative || customer.representative || "Ông TRẦN VĂN THỊNH",
    position: customFormData?.customer_position || (customer.position !== "........................" ? customer.position : "Chủ Cửa hàng / Giám đốc"),
  };

  // Resolved Company Info (Party B)
  const partyB = {
    name: customFormData?.company_name || company.name || "CÔNG TY CỔ PHẦN DỊCH VỤ BẢO VỆ VIỆT THIÊN LONG",
    address: customFormData?.company_address || company.address || "12B, tổ 3, KV1, Phường Cái Răng, TP. Cần Thơ",
    tax_code: customFormData?.company_tax_code || company.tax_code || "1801654321",
    phone: customFormData?.company_phone || company.phone || "0902 360 799",
    email: customFormData?.company_email || company.email || "contact@vietthienlongsecurity.com",
    representative: customFormData?.company_representative || company.representative || "Ông PHAN KIM LÂM",
    position: customFormData?.company_position || company.position || "Giám đốc Điều hành",
  };

  // Target Location & Service Name
  const serviceName = customFormData?.service_name || contract.service_name || "Dịch vụ Bảo vệ Kinh doanh & Giải trí";
  const targetAddress = customFormData?.target_address || booking.address || partyA.address;
  const serviceScopeReq = customFormData?.service_scope_req || "Bảo vệ an ninh, giữ xe khách hàng, bảo vệ tài sản và duy trì trật tự cho cửa hàng thời trang bán lẻ.";

  // Job Description List
  const scopeList = customFormData?.service_scope_list || [
    "Quản lý bãi xe khách hàng, cấp phát thẻ giữ xe, hỗ trợ dắt xe và mở cửa đón/tiễn khách hàng lịch sự.",
    "Quan sát hỗ trợ ngăn ngừa trộm cắp, tráo tem nhãn quần áo trong giờ mở cửa.",
    "Bảo vệ an toàn cửa ngõ, PCCC và tuần tra chống đột nhập ban đêm.",
  ];

  const scopeListHtml = scopeList
    .map((item: string) => `<p style="margin-bottom: 4px; text-align: justify;">- ${item}</p>`)
    .join("");

  // Table 2.4 Parameters
  const timeSlotsStr = customFormData?.time_slots_str || "08:00 - 22:00, 22:00 - 08:00";
  const guardsPerSlotStr = customFormData?.guards_per_slot_str || "01";
  const daysPerWeekStr = customFormData?.days_per_week_str || "7 ngày / tuần (Thứ Hai đến Chủ Nhật)";
  const quotationTypeStr = customFormData?.quotation_type === "monthly" ? "Theo tháng (Monthly)" : customFormData?.quotation_type === "hourly" ? "Theo giờ (Hourly)" : "Trọn gói (Package)";
  
  const totalPriceFormatted = customFormData?.total_price_formatted || "21.000.000 VNĐ / tháng";
  const unitPriceDetail = customFormData?.unit_price_detail || "21.000.000 VNĐ / tháng";

  // Price In Words
  const rawPriceNum = typeof customFormData?.total_price === "number" ? customFormData.total_price : (booking.quoted_price || 21000000);
  const priceInWords = rawPriceNum ? numberToVietnameseWords(rawPriceNum) : "Hai mươi mốt triệu đồng chẵn";
  const vatStatus = customFormData?.vat_status || "chưa bao gồm Thuế VAT (8%)";

  // Section 6 Overtime & Payment
  const otNormal = customFormData?.overtime_normal || "30.000";
  const otSunday = customFormData?.overtime_sunday || "45.000";
  const otHoliday = customFormData?.overtime_holiday || "70.000";

  const paymentTerm = customFormData?.payment_term || "Bên A thanh toán từ ngày 01 đến ngày 05 của tháng tiếp theo.";
  const bankAccHolder = customFormData?.bank_account_holder || partyB.name;
  const bankAccNo = customFormData?.bank_account_no || "1029384756";
  const bankName = customFormData?.bank_name || "Vietcombank";
  const bankBranch = customFormData?.bank_branch || "Cần Thơ";

  // Build complete HTML string styled for Word export matching Master Template EXACTLY
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Hợp Đồng Dịch Vụ Bảo Vệ</title>
<style>
  @page {
    size: 8.27in 11.69in; /* A4 size */
    margin: 1.0in 1.0in 1.0in 1.0in; /* 1 inch margins */
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.45;
    color: #000000;
  }
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .header-table td {
    border: none;
    padding: 0;
    font-size: 11pt;
    text-align: center;
    vertical-align: top;
  }
  .title-block {
    text-align: center;
    margin-top: 25px;
    margin-bottom: 25px;
  }
  .title {
    font-size: 15pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  .subtitle {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 5px;
  }
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .subsection-title {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 4px;
  }
  p {
    margin: 0 0 6px 0;
    text-align: justify;
    text-justify: inter-word;
  }
  ul {
    margin: 0 0 8px 20px;
    padding: 0;
  }
  li {
    margin-bottom: 4px;
    text-align: justify;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  table.data-table th, table.data-table td {
    border: 1px solid #000000;
    padding: 6px 8px;
    font-size: 11pt;
  }
  table.data-table th {
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }
  .signature-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 35px;
  }
  .signature-table td {
    border: none;
    padding: 0;
    text-align: center;
    vertical-align: top;
    width: 50%;
  }
  .bold {
    font-weight: bold;
  }
</style>
</head>
<body>

  <!-- Quốc hiệu - Tiêu ngữ -->
  <table class="header-table">
    <tr>
      <td style="width: 100%; font-weight: bold; text-align: center;">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
        <span style="font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</span>
      </td>
    </tr>
  </table>

  <!-- Tiêu đề hợp đồng -->
  <div class="title-block">
    <div class="title">HỢP ĐỒNG DỊCH VỤ BẢO VỆ</div>
    <div class="subtitle">Số hợp đồng: ${contractCode}</div>
  </div>

  <p style="text-align: left;">Hôm nay, ngày ${day} tháng ${month} năm ${year}, tại ${signingLocation}, các Bên gồm có:</p>

  <!-- BÊN THUÊ DỊCH VỤ (BÊN A) -->
  <div class="section-title">BÊN THUÊ DỊCH VỤ (BÊN A)</div>
  <p style="margin-bottom: 2px;"><b>Tên đơn vị/Công ty:</b> ${partyA.company_name}</p>
  <p style="margin-bottom: 2px;"><b>Địa chỉ trụ sở/Chi nhánh:</b> ${partyA.address}</p>
  <p style="margin-bottom: 2px;"><b>Mã số thuế:</b> ${partyA.tax_code}</p>
  <p style="margin-bottom: 2px;"><b>Điện thoại:</b> ${partyA.phone}</p>
  <p style="margin-bottom: 2px;"><b>Email:</b> ${partyA.email}</p>
  <p style="margin-bottom: 2px;"><b>Đại diện bởi:</b> ${partyA.representative}</p>
  <p style="margin-bottom: 8px;"><b>Chức vụ:</b> ${partyA.position}</p>

  <!-- BÊN CUNG CẤP DỊCH VỤ (BÊN B) -->
  <div class="section-title">BÊN CUNG CẤP DỊCH VỤ (BÊN B)</div>
  <p style="margin-bottom: 2px;"><b>Tên đơn vị/Công ty:</b> ${partyB.name}</p>
  <p style="margin-bottom: 2px;"><b>Địa chỉ trụ sở:</b> ${partyB.address}</p>
  <p style="margin-bottom: 2px;"><b>Mã số thuế:</b> ${partyB.tax_code}</p>
  <p style="margin-bottom: 2px;"><b>Điện thoại:</b> ${partyB.phone}</p>
  <p style="margin-bottom: 2px;"><b>Email:</b> ${partyB.email}</p>
  <p style="margin-bottom: 2px;"><b>Đại diện bởi:</b> ${partyB.representative}</p>
  <p style="margin-bottom: 12px;"><b>Chức vụ:</b> ${partyB.position}</p>

  <p style="font-style: italic;">(Sau đây gọi tắt là "Bên A" và "Bên B")</p>

  <p>Xét thấy nhu cầu và năng lực của các Bên, sau quá trình trao đổi và thống nhất, hai Bên đồng ý ký kết Hợp đồng dịch vụ bảo vệ này với các điều khoản và điều kiện cụ thể như sau:</p>

  <!-- ĐIỀU 1 -->
  <div class="subsection-title">ĐIỀU 1. GIẢI THÍCH TỪ NGỮ</div>
  <p>Trong Hợp đồng này, các từ ngữ dưới đây được hiểu và giải thích như sau:</p>
  <p><b>Dịch vụ Bảo vệ:</b> Là toàn bộ các công việc an ninh, kiểm soát trật tự, tuần tra, bảo vệ tài sản do Bên A yêu cầu và Bên B đồng ý cung cấp.</p>
  <p><b>Mục tiêu / Địa điểm bảo vệ:</b> Là khu vực, mặt bằng hoặc tài sản cụ thể được Bên A chỉ định để Bên B triển khai Dịch vụ Bảo vệ quy định tại Điều 2.2.</p>
  <p><b>Nhân viên bảo vệ:</b> Là lực lượng an ninh thuộc quản lý trực tiếp của Bên B, đã qua đào tạo nghiệp vụ chuyên môn, được điều động làm nhiệm vụ tại Mục tiêu.</p>
  <p><b>Ca trực:</b> Khoảng thời gian Nhân viên bảo vệ thực hiện nhiệm vụ duy trì an ninh tại Vị trí bảo vệ theo thỏa thuận.</p>
  <p><b>Công cụ hỗ trợ:</b> Các phương tiện, trang thiết bị (bộ đàm, dùi cui, đèn pin, còi, máy dò kim loại...) do Bên B trang bị cho Nhân viên bảo vệ theo đúng quy định của pháp luật.</p>
  <p><b>Sự cố ngoài tầm kiểm soát:</b> Các sự việc xảy ra vượt quá khả năng can thiệp hợp lý của Nhân viên bảo vệ (thiên tai, cháy nổ kỹ thuật diện rộng, cướp có vũ khí, đám đông bạo loạn vượt quá số lượng bảo vệ ca trực).</p>

  <!-- ĐIỀU 2 -->
  <div class="subsection-title">ĐIỀU 2. ĐỐI TƯỢNG, LOẠI HÌNH VÀ PHẠM VI HỢP ĐỒNG</div>
  <p class="bold">2.1. Loại hình dịch vụ ký kết:</p>
  <p>Hai Bên thống nhất thực hiện gói dịch vụ: <b>${serviceName}</b></p>

  <p class="bold">2.2. Địa điểm thực hiện dịch vụ (Mục tiêu):</p>
  <p><b>${targetAddress}</b></p>

  <p class="bold">2.3. Thời gian thực hiện hợp đồng:</p>
  <p>Từ ngày <b>${startDateStr}</b> đến hết ngày <b>${endDateStr}</b>.</p>

  <p class="bold">2.4. Khung giờ trực, Nhân sự và Phí dịch vụ:</p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 50%; border: 1px solid #000000; padding: 6px 8px; background-color: #f2f2f2; font-weight: bold; text-align: center;">Nội dung / Thông số</th>
        <th style="width: 50%; border: 1px solid #000000; padding: 6px 8px; background-color: #f2f2f2; font-weight: bold; text-align: center;">Giá trị thỏa thuận</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px;">Gói dịch vụ đăng ký</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold;">${serviceName}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px;">Khung giờ trực (Time Slots)</td>
        <td style="border: 1px solid #000000; padding: 6px 8px;">${timeSlotsStr}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px;">Số lượng bảo vệ / Ca (Guards per slot)</td>
        <td style="border: 1px solid #000000; padding: 6px 8px;">${guardsPerSlotStr} nhân sự / ca</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px;">Lịch hoạt động tuần (Days per week)</td>
        <td style="border: 1px solid #000000; padding: 6px 8px;">${daysPerWeekStr}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px;">Hình thức báo giá (Quotation Type)</td>
        <td style="border: 1px solid #000000; padding: 6px 8px;">${quotationTypeStr}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px;">Đơn giá áp dụng</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold;">${unitPriceDetail}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold;">TỔNG GIÁ TRỊ HỢP ĐỒNG</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; color: #000000;">${totalPriceFormatted}</td>
      </tr>
    </tbody>
  </table>

  <p class="bold">2.5. Nguyên tắc tính phí dịch vụ:</p>
  <p>Đơn giá và Tổng phí dịch vụ quy định tại Điều 2.4 được giữ nguyên, không thay đổi dựa trên số ngày trong tháng (28, 29, 30 hay 31 ngày) hoặc việc Bên A tạm đóng cửa nghỉ Lễ, Tết (trừ khi hai Bên có thỏa thuận khác bằng văn bản).</p>

  <!-- ĐIỀU 3 -->
  <div class="subsection-title">ĐIỀU 3. NỘI DUNG VÀ PHẠM VI CÔNG VIỆC</div>
  <p>Bên B có trách nhiệm triển khai công tác bảo vệ cho Bên A theo phạm vi khái quát sau:</p>
  <p><b>Phạm vi dịch vụ yêu cầu:</b> ${serviceScopeReq}</p>
  <p><b>Mô tả công việc chi tiết:</b></p>
  ${scopeListHtml}
  <p class="bold">Nhiệm vụ chung của lực lượng bảo vệ:</p>
  <p>- Kiểm soát an ninh, quản lý người và phương tiện ra/vào Mục tiêu theo nội quy của Bên A.</p>
  <p>- Duy trì an toàn tài sản, kiểm soát chống thất thoát, phát hiện và ngăn chặn kịp thời các hành vi trộm cắp, cạy phá, gây rối hoặc vi phạm quy định.</p>
  <p>- Tuần tra định kỳ/đột xuất trong Khu vực bảo vệ; kiểm tra an toàn PCCC, hệ thống điện, nước, các lối thoát hiểm và niêm phong kho bãi.</p>
  <p>- Phát hiện sớm các sự cố cháy nổ, tràn nước, chập điện và thực hiện các biện pháp xử lý ban đầu, đồng thời báo ngay cho Đại diện Bên A.</p>
  <p>- Chấp hành nghiêm chỉnh quy định pháp luật và nội quy làm việc do Bên A ban hành.</p>

  <!-- ĐIỀU 4 -->
  <div class="subsection-title">ĐIỀU 4. TIÊU CHUẨN NHÂN VIÊN BẢO VỆ VÀ QUẢN LÝ CA TRỰC</div>
  <p class="bold">Tiêu chuẩn nhân sự:</p>
  <p>- Nhân viên bảo vệ có đủ năng lực hành vi dân sự, sức khỏe tốt, lý lịch rõ ràng, không tiền án tiền sự, được đào tạo nghiệp vụ bảo vệ chuyên nghiệp và kỹ năng PCCC cơ bản.</p>
  <p>- Tác phong nghiêm túc, mang đồng phục, bảng tên và trang bị đầy đủ công cụ hỗ trợ theo quy định của Bên B.</p>
  <p>- Thái độ lịch sự, tôn trọng khách hàng và chấp hành nghiêm nội quy làm việc tại Mục tiêu.</p>

  <p class="bold">Trách nhiệm người lao động:</p>
  <p>- Nhân viên bảo vệ là người lao động thuộc quyền quản lý trực tiếp của Bên B. Bên B chịu hoàn toàn trách nhiệm chi trả tiền lương, thưởng, chế độ BHXH, BHYT, BHTN và các quyền lợi lao động khác theo quy định của Luật Lao động.</p>
  <p>- Bên A không có bất kỳ trách nhiệm pháp lý hay tài chính nào đối với quan hệ lao động giữa Bên B và Nhân viên bảo vệ.</p>

  <p class="bold">Phương án xử lý sự cố ca trực đột xuất & Phạt trống ca:</p>
  <p>- <b>Điều động thay thế:</b> Trường hợp Nhân viên bảo vệ vắng mặt (ốm đau, sự cố đột xuất, việc riêng khẩn cấp, bỏ ca), Bên B có trách nhiệm điều động nhân sự dự phòng thay thế có mặt tại Mục tiêu trong thời gian không quá 02 giờ kể từ khi phát sinh sự cố hoặc nhận được thông báo của Bên A.</p>
  <p>- <b>Phạt vi phạm trống ca trực:</b> Nếu bỏ vị trí trực không có lý do chính đáng và không có nhân sự thay thế dẫn đến Mục tiêu bị bỏ trống, Bên B chịu phạt vi phạm tương đương 150% đơn giá ca trực/giờ trực trong khoảng thời gian bị bỏ trống. Đồng thời, Bên B chịu trách nhiệm bồi thường 100% thiệt hại tài sản phát sinh (nếu có) trong thời gian ca trực bị bỏ trống này.</p>
  <p>- <b>Căn cứ ghi nhận qua Hệ thống/Ứng dụng:</b> Mọi sự cố ca trực (vắng mặt, đi muộn, vi phạm tác phong, ngủ gật) được Bên A ghi nhận và phản ánh qua hệ thống/ứng dụng quản lý hoặc gửi trực tiếp cho Điều phối viên Bên B. Các báo cáo và dữ liệu bằng chứng ghi nhận trên hệ thống sau khi xác minh sẽ là căn cứ pháp lý chính thức để hai bên đối chiếu nghiệm thu chất lượng, áp dụng phạt vi phạm trống ca hoặc yêu cầu thay đổi nhân sự.</p>

  <!-- ĐIỀU 5 -->
  <div class="subsection-title">ĐIỀU 5. PHƯƠNG THỨC THỰC HIỆN VÀ QUẢN LÝ TÀI SẢN</div>
  <p>- <b>Bố trí và điều động nhân sự:</b> Bên B có quyền chủ động bố trí, điều động, xoay ca Nhân viên bảo vệ để đảm bảo duy trì đủ quân số và chất lượng dịch vụ theo thỏa thuận. Người quản lý của Bên B được quyền tiếp cận Mục tiêu để kiểm tra, giám sát ca trực.</p>
  <p class="bold">Trách nhiệm trông giữ phương tiện:</p>
  <p>- <b>Đối với xe gắn máy:</b> Bên B chỉ chịu trách nhiệm bồi thường khi mất mát toàn bộ xe trong trường hợp khách hàng/nhân viên có Thẻ giữ xe hợp lệ do Bên B cấp. Bên B không chịu trách nhiệm đối với tài sản để trong cốp xe, mũ bảo hiểm hoặc các phụ tùng dễ tháo rời trừ khi có biên bản bàn giao riêng.</p>
  <p>- <b>Đối với xe ô tô:</b> Bên B chịu trách nhiệm quản lý xe khi có Thẻ giữ xe hợp lệ. Bên B không chịu trách nhiệm đối với tài sản, tiền mặt cá nhân để bên trong cabin/thùng xe hoặc các phụ tùng bên ngoài dễ tháo rời.</p>
  <p class="bold">Trách nhiệm phối hợp an ninh và quản lý tài sản của Bên A:</p>
  <p>- Bên A có trách nhiệm niêm phong cửa kho, niêm phong phòng làm việc sau giờ hoạt động, kiểm kê tài sản định kỳ và phối hợp đảm bảo cơ sở vật chất an toàn (tường rào, hệ thống khóa, đèn chiếu sáng).</p>
  <p>- Tự chịu trách nhiệm bảo quản tài sản cá nhân có giá trị cao (tiền mặt, trang sức, điện thoại, máy tính xách tay) không bàn giao cụ thể cho Bên B.</p>
  <p class="bold">Nhân viên rời vị trí & Nghỉ giữa ca:</p>
  <p>- Nếu Nhân viên bảo vệ phải tạm rời vị trí theo yêu cầu khẩn cấp của Bên A, Bên A chủ động phối hợp các biện pháp an toàn tại vị trí đó.</p>
  <p>- Trong ca trực dài, Nhân viên bảo vệ được nghỉ ăn giữa ca tối đa 30 phút/ca và phải tổ chức xoay phiên để không bỏ trống hoàn toàn Mục tiêu.</p>

  <!-- ĐIỀU 6 -->
  <div class="subsection-title">ĐIỀU 6. CHI PHÍ DỊCH VỤ VÀ PHƯƠNG THỨC THANH TOÁN</div>
  <p>- <b>Tổng giá trị hợp đồng:</b> <b>${totalPriceFormatted}</b> (Bằng chữ: <i>${priceInWords}</i>). Mức giá trên <b>${vatStatus}</b>.</p>
  <p class="bold">Phí dịch vụ tăng cường / Ngoài giờ (nếu có phát sinh):</p>
  <p>- Ngày thường: <b>${otNormal} VNĐ/giờ/nhân sự.</b></p>
  <p>- Ngày Chủ nhật: <b>${otSunday} VNĐ/giờ/nhân sự.</b></p>
  <p>- Ngày Lễ, Tết: <b>${otHoliday} VNĐ/giờ/nhân sự.</b></p>
  <p class="bold">Quy trình lập chứng từ & Thời hạn thanh toán:</p>
  <p>- Bên B gửi Bảng kê chi tiết dịch vụ và Đề nghị thanh toán kèm Hóa đơn VAT điện tử cho Bên A vào cuối tháng hoặc sau khi kết thúc đợt dịch vụ.</p>
  <p>- <b>Thời hạn thanh toán:</b> ${paymentTerm}</p>
  <p>- <b>Phạt chậm thanh toán:</b> Nếu Bên A chậm thanh toán quá thời hạn quy định, Bên A phải chịu tiền lãi chậm trả tính theo mức lãi suất 150% lãi suất cơ bản do Ngân hàng Nhà nước công bố tại thời điểm thanh toán tính trên số tiền chậm trả cho mỗi ngày chậm thanh toán.</p>
  <p class="bold">Thông tin tài khoản nhận thanh toán của Bên B:</p>
  <p style="margin-left: 20px;">Tên tài khoản: <b>${bankAccHolder}</b></p>
  <p style="margin-left: 20px;">Số tài khoản: <b>${bankAccNo}</b></p>
  <p style="margin-left: 20px;">Ngân hàng: <b>${bankName}</b> - Chi nhánh: <b>${bankBranch}</b></p>

  <!-- ĐIỀU 7 -->
  <div class="subsection-title">ĐIỀU 7. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</div>
  <p>- Tạo điều kiện về cơ sở vật chất (chỗ làm việc, điện, nước, nhà vệ sinh) cho Nhân viên bảo vệ thực hiện nhiệm vụ.</p>
  <p>- Cung cấp kịp thời nội quy, quy định làm việc và danh mục tài sản cần bảo vệ cho Bên B.</p>
  <p>- Thanh toán chi phí dịch vụ đầy đủ, đúng hạn theo Điều 6.</p>
  <p>- Có quyền yêu cầu Bên B thay đổi Nhân viên bảo vệ không đáp ứng tiêu chuẩn tác phong, nghiệp vụ hoặc vi phạm nội quy trong vòng 24 - 48 giờ sau khi thông báo bằng văn bản.</p>
  <p>- <b>Cam kết không tuyển dụng nhân sự:</b> Trong thời gian hiệu lực của Hợp đồng và trong vòng 12 (mười hai) tháng sau khi chấm dứt Hợp đồng, Bên A cam kết không tuyển dụng trực tiếp hoặc gián tiếp bất kỳ Nhân viên bảo vệ nào của Bên B đã/đang làm việc tại Mục tiêu sang làm việc cho Bên A nếu không có sự đồng ý bằng văn bản của Bên B. Nếu vi phạm, Bên A phải bồi thường cho Bên B khoản chi phí tuyển dụng và đào tạo tương đương 03 (ba) tháng phí dịch vụ.</p>

  <!-- ĐIỀU 8 -->
  <div class="subsection-title">ĐIỀU 8. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</div>
  <p>- Bố trí đủ nhân sự đúng tiêu chuẩn, đúng khung giờ theo cam kết tại Điều 2.4.</p>
  <p>- Chịu trách nhiệm quản lý, giám sát tác phong và kết quả làm việc của Nhân viên bảo vệ.</p>
  <p>- Trang bị đầy đủ đồng phục, bảng tên và Công cụ hỗ trợ phù hợp với pháp luật.</p>
  <p>- Mua Bảo hiểm trách nhiệm nghề nghiệp cho hoạt động dịch vụ bảo vệ theo quy định pháp luật.</p>
  <p>- Bảo mật tuyệt đối mọi thông tin an ninh, tình hình sản xuất kinh doanh và dữ liệu nội bộ của Bên A.</p>

  <!-- ĐIỀU 9 -->
  <div class="subsection-title">ĐIỀU 9. BỒI THƯỜNG THIỆT HẠI VÀ GIỚI HẠN TRÁCH NHIỆM</div>
  <p>- <b>Nguyên tắc bồi thường:</b> Bên B có trách nhiệm bồi thường 100% giá trị thiệt hại thực tế cho Bên A đối với các trường hợp mất mát, hư hỏng tài sản xảy ra trong Mục tiêu bảo vệ mà nguyên nhân trực tiếp do lỗi lơ là, thiếu trách nhiệm hoặc vi phạm quy trình của Nhân viên bảo vệ Bên B gây ra.</p>
  <p class="bold">Điều kiện bồi thường:</p>
  <p>- Tài sản mất mát/hư hỏng nằm trong phạm vi Mục tiêu bảo vệ và thuộc trách nhiệm kiểm soát trực tiếp của bảo vệ.</p>
  <p>- Bên A cung cấp đầy đủ chứng từ hợp pháp chứng minh quyền sở hữu và giá trị tài sản (hóa đơn mua hàng, sổ tài sản, biên bản kiểm kê, chứng từ khấu hao).</p>
  <p>- Có Biên bản xác nhận sự cố giữa hai Bên hoặc Biên bản kết luận điều tra chính thức của Cơ quan Công an có thẩm quyền.</p>
  <p>- <b>Giới hạn trách nhiệm bồi thường:</b> Tổng giá trị bồi thường tối đa mà Bên B phải chịu trách nhiệm cho một sự cố hoặc chuỗi sự cố phát sinh từ cùng một nguyên nhân không vượt quá 03 (ba) tháng phí dịch vụ gần nhất đã thanh toán (trừ trường hợp do lỗi cố ý hoặc hành vi vi phạm pháp luật hình sự của Nhân viên bảo vệ Bên B).</p>
  <p>- <b>Thời hạn bồi thường:</b> Trong vòng 07 (bảy) ngày làm việc kể từ khi có đầy đủ biên bản xác nhận trách nhiệm hoặc kết luận của Cơ quan Công an.</p>
  <p class="bold">Các trường hợp miễn trừ trách nhiệm bồi thường:</p>
  <p>- Thiệt hại do Sự kiện Bất khả kháng quy định tại Điều 11.</p>
  <p>- Mất mát tài sản cá nhân không bàn giao cụ thể cho bảo vệ (tiền mặt, trang sức, điện thoại, máy tính cá nhân...).</p>
  <p>- Mất mát xảy ra do lỗi bất cẩn, hành vi cố ý hoặc sự chỉ đạo trực tiếp từ cán bộ, nhân viên của Bên A.</p>
  <p>- Tài sản của các nhà thầu phụ nằm trong Mục tiêu nhưng không bàn giao quản lý cụ thể bằng văn bản cho Bên B.</p>
  <p>- Các tổn thất về hàng hóa/tài sản mà Bên B đã có văn bản hoặc email cảnh báo nguy cơ an ninh ít nhất 01 (một) lần nhưng Bên A không thực hiện biện pháp khắc phục.</p>

  <!-- ĐIỀU 10 -->
  <div class="subsection-title">ĐIỀU 10. BẢO MẬT THÔNG TIN</div>
  <p>Cả hai Bên cam kết bảo mật tuyệt đối mọi thông tin kinh doanh, quy trình vận hành, sơ đồ an ninh và dữ liệu tiếp cận được trong quá trình thực hiện Hợp đồng. Nghĩa vụ bảo mật tiếp tục có hiệu lực kể cả sau khi Hợp đồng chấm dứt.</p>

  <!-- ĐIỀU 11 -->
  <div class="subsection-title">ĐIỀU 11. SỰ KIỆN BẤT KHẢ KHÁNG</div>
  <p>Sự kiện Bất khả kháng bao gồm thiên tai (động đất, lũ lụt, bão lớn), hỏa hoạn khách quan, dịch bệnh, chiến tranh, bạo loạn hoặc sự thay đổi chính sách pháp luật ảnh hưởng trực tiếp đến việc thực hiện Hợp đồng.</p>
  <p>Bên gặp sự kiện Bất khả kháng được miễn trách nhiệm vi phạm nhưng phải thông báo bằng văn bản cho Bên kia trong vòng 05 (năm) ngày làm việc và áp dụng mọi biện pháp nỗ lực để hạn chế thiệt hại.</p>

  <!-- ĐIỀU 12 -->
  <div class="subsection-title">ĐIỀU 12. CHẤM DỨT HỢP ĐỒNG VÀ ĐƠN PHƯƠNG CHẤM DỨT</div>
  <p>Hợp đồng chấm dứt khi hết thời hạn quy định tại Điều 2.3 mà không gia hạn, hoặc hai Bên thỏa thuận chấm dứt bằng văn bản.</p>
  <p>- <b>Đơn phương chấm dứt hợp đồng:</b> Mỗi Bên có quyền đơn phương chấm dứt Hợp đồng trước thời hạn nếu Bên kia vi phạm nghiêm trọng nghĩa vụ hợp đồng và không khắc phục trong vòng 10 (mười) ngày làm việc kể từ khi nhận được thông báo yêu cầu khắc phục. Bên đơn phương chấm dứt phải thông báo bằng văn bản cho Bên kia trước ít nhất 30 (ba mươi) ngày.</p>
  <p>- <b>Phạt vi phạm thời hạn thông báo:</b> Nếu một Bên đơn phương chấm dứt Hợp đồng mà không tuân thủ thời hạn thông báo trước 30 ngày, Bên vi phạm phải chịu phạt bồi thường cho Bên kia một khoản tiền tương đương 01 (một) tháng phí dịch vụ.</p>

  <!-- ĐIỀU 13 -->
  <div class="subsection-title">ĐIỀU 13. THỜI HẠN HIỆU LỰC VÀ GIA HẠN HỢP ĐỒNG</div>
  <p>Hợp đồng này có hiệu lực từ ngày <b>${startDateStr}</b> đến ngày <b>${endDateStr}</b>.</p>
  <p>- <b>Tự động gia hạn:</b> Khi hết thời hạn Hợp đồng, nếu hai Bên không có thông báo bằng văn bản về việc chấm dứt trước ít nhất 30 (ba mươi) ngày, Hợp đồng này sẽ được tự động gia hạn thêm 12 (mười hai) tháng với các điều khoản không thay đổi.</p>

  <!-- ĐIỀU 14 -->
  <div class="subsection-title">ĐIỀU 14. GIẢI QUYẾT TRANH CHẤP</div>
  <p>Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng, hòa giải trong vòng 30 ngày. Trường hợp không thể thương lượng thành công, vụ việc sẽ do Tòa án nhân dân có thẩm quyền tại địa phương của Bên B giải quyết.</p>

  <!-- ĐIỀU 15 -->
  <div class="subsection-title">ĐIỀU 15. ĐIỀU KHOẢN CHUNG</div>
  <p>- Hợp đồng này bao gồm toàn bộ thỏa thuận giữa hai Bên và thay thế mọi đàm phán, thư từ trước đó.</p>
  <p>- Mọi sửa đổi, bổ sung Hợp đồng chỉ có giá trị pháp lý khi được lập thành văn bản Phụ lục hợp đồng có chữ ký xác nhận của Đại diện hợp pháp hai Bên.</p>
  <p>- Hợp đồng được lập thành 02 (hai) bản gốc bằng tiếng Việt có giá trị pháp lý ngang nhau, mỗi Bên giữ 01 bản để thực hiện.</p>

  <!-- Ký xác nhận -->
  <table class="signature-table">
    <tr>
      <td class="bold" style="text-align: center; width: 50%; font-weight: bold; font-size: 11pt;">ĐẠI DIỆN BÊN A</td>
      <td class="bold" style="text-align: center; width: 50%; font-weight: bold; font-size: 11pt;">ĐẠI DIỆN BÊN B</td>
    </tr>
    <tr>
      <td style="font-size: 10pt; font-style: italic; text-align: center; padding-bottom: 75px;">(Ký, ghi rõ họ tên, chức vụ và đóng dấu)</td>
      <td style="font-size: 10pt; font-style: italic; text-align: center; padding-bottom: 75px;">(Ký, ghi rõ họ tên, chức vụ và đóng dấu)</td>
    </tr>
    <tr>
      <td class="bold" style="text-align: center; font-weight: bold;">${partyA.representative}</td>
      <td class="bold" style="text-align: center; font-weight: bold;">${partyB.representative}</td>
    </tr>
  </table>

</body>
</html>
  `;

  // Create Blob and trigger browser download as a Word-compatible .doc file
  const blob = new Blob(["\ufeff" + htmlContent], {
    type: "application/msword;charset=utf-8",
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeContractCode = contractCode.replace(/[\/\\:]/g, "_");
  a.download = `Hop_Dong_Dich_Vu_Bao_Ve_${safeContractCode}.doc`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
