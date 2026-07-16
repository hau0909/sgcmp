/**
 * Utility to export contract details to a Microsoft Word (.doc) file client-side
 * by wrapping formatted HTML with Word-compatible XML styles.
 */
export function exportContractDocx(contract: any) {
  if (!contract) return;

  const company = contract.company || {};
  const customer = contract.customer || {};
  const booking = contract.booking || {};
  const services = booking?.services || {};

  // Parse signing date
  const createDate = contract.created_at ? new Date(contract.created_at) : new Date();
  const day = String(createDate.getDate()).padStart(2, "0");
  const month = String(createDate.getMonth() + 1).padStart(2, "0");
  const year = createDate.getFullYear();

  // Format dates
  const formatLocalDate = (dateStr: string | null) => {
    if (!dateStr) return "........................";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const startDateStr = formatLocalDate(contract.start_date);
  const endDateStr = formatLocalDate(contract.end_date);

  // Generate Service Positions Table Rows
  const timeSlots = booking.time_slots || [];
  let servicePositionsHtml = "";
  if (timeSlots.length > 0) {
    servicePositionsHtml = timeSlots
      .map((slot: string) => {
        return `
          <tr>
            <td style="border: 1px solid #000000; padding: 6px 8px; font-size: 11pt;">${contract.service_name || "Dịch vụ bảo vệ"} (${slot})</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; font-size: 11pt; text-align: center;">${booking.guards_per_slot || 1} nhân sự</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; font-size: 11pt;">........................</td>
          </tr>
        `;
      })
      .join("");
  } else {
    servicePositionsHtml = `
      <tr>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-size: 11pt;">${contract.service_name || "Dịch vụ bảo vệ"}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-size: 11pt; text-align: center;">${booking.guards_per_slot || 1} nhân sự</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-size: 11pt;">........................</td>
      </tr>
    `;
  }

  // Generate Assigned Guards List
  const guards = contract.assigned_guards_list || [];
  let guardsHtml = "";
  if (guards.length > 0) {
    guardsHtml = guards
      .map((g: any, index: number) => {
        return `
          <p style="margin-left: 20px; text-align: left; margin-bottom: 2px;"><b>Nhân viên bảo vệ ${index + 1}:</b></p>
          <p style="margin-left: 40px; text-align: left; margin-bottom: 2px;">- Họ và tên: <b>${g.full_name}</b></p>
          <p style="margin-left: 40px; text-align: left; margin-bottom: 2px;">- CCCD: ${g.cccd}</p>
          <p style="margin-left: 40px; text-align: left; margin-bottom: 8px;">- SĐT: ${g.phone_number}</p>
        `;
      })
      .join("");
  } else {
    // Generate blank lines for manual filling
    const blankCount = Math.max(3, booking.guards_per_slot || 3);
    for (let i = 0; i < blankCount; i++) {
      guardsHtml += `
        <p style="margin-left: 20px; text-align: left; margin-bottom: 2px;"><b>Nhân viên bảo vệ ${i + 1}:</b></p>
        <p style="margin-left: 40px; text-align: left; margin-bottom: 2px;">- Họ và tên: ........................................................................................</p>
        <p style="margin-left: 40px; text-align: left; margin-bottom: 2px;">- CCCD: ........................................................................................</p>
        <p style="margin-left: 40px; text-align: left; margin-bottom: 8px;">- SĐT: ........................................................................................</p>
      `;
    }
  }

  // Generate Service Scope Description
  const scopeText = booking.description || services.description || "Thực hiện công tác bảo vệ an ninh trật tự, giám sát tài sản theo thỏa thuận.";

  // Build complete HTML string styled for Word
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Hop Dong Dich Vu Bao Ve</title>
<style>
  @page {
    size: 8.27in 11.69in; /* A4 size */
    margin: 1.0in 1.0in 1.0in 1.0in; /* 1 inch margins */
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
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
    margin-top: 30px;
    margin-bottom: 30px;
  }
  .title {
    font-size: 15pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  .subtitle {
    font-size: 12pt;
    font-style: italic;
    margin-top: 5px;
  }
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  .subsection-title {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 8px;
    margin-bottom: 4px;
  }
  p {
    margin: 0 0 8px 0;
    text-align: justify;
    text-justify: inter-word;
  }
  ul {
    margin: 0 0 10px 20px;
    padding: 0;
  }
  li {
    margin-bottom: 5px;
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
    margin-top: 40px;
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
      <td style="width: 45%; font-weight: bold; text-transform: uppercase; text-align: center;">
        ${company.name || "CÔNG TY DỊCH VỤ BẢO VỆ"}<br>
        <span style="font-weight: normal; font-size: 10pt;">Số: ${contract.contract_code}</span>
      </td>
      <td style="width: 55%; font-weight: bold; text-align: center;">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
        <span style="font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</span>
      </td>
    </tr>
  </table>

  <!-- Tiêu đề hợp đồng -->
  <div class="title-block">
    <div class="title">HỢP ĐỒNG DỊCH VỤ BẢO VỆ</div>
    <div class="subtitle">Số hợp đồng: ${contract.contract_code}</div>
  </div>

  <p style="text-align: left;">Hôm nay, ngày ${day} tháng ${month} năm ${year}, tại ........................................................................, các bên gồm có:</p>

  <!-- Thông tin bên A -->
  <div class="section-title">BÊN THUÊ DỊCH VỤ (BÊN A)</div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
    <tr>
      <td style="width: 25%; padding: 3px 0; vertical-align: top;">Tên đơn vị/công ty:</td>
      <td style="width: 75%; padding: 3px 0; font-weight: bold;">${customer.company_name}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Địa chỉ:</td>
      <td style="padding: 3px 0;">${customer.address}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Mã số thuế:</td>
      <td style="padding: 3px 0;">${customer.tax_code}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Điện thoại:</td>
      <td style="padding: 3px 0;">${customer.phone}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Email:</td>
      <td style="padding: 3px 0;">${customer.email}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Đại diện:</td>
      <td style="padding: 3px 0; font-weight: bold;">${customer.representative}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Chức vụ:</td>
      <td style="padding: 3px 0;">${customer.position}</td>
    </tr>
  </table>

  <!-- Thông tin bên B -->
  <div class="section-title">BÊN CUNG CẤP DỊCH VỤ (BÊN B)</div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
    <tr>
      <td style="width: 25%; padding: 3px 0; vertical-align: top;">Tên công ty:</td>
      <td style="width: 75%; padding: 3px 0; font-weight: bold;">${company.name}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Địa chỉ:</td>
      <td style="padding: 3px 0;">${company.address}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Mã số thuế:</td>
      <td style="padding: 3px 0;">${company.tax_code}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Điện thoại:</td>
      <td style="padding: 3px 0;">${company.phone}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Email:</td>
      <td style="padding: 3px 0;">${company.email}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Đại diện:</td>
      <td style="padding: 3px 0; font-weight: bold;">${company.representative}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; vertical-align: top;">Chức vụ:</td>
      <td style="padding: 3px 0;">${company.position}</td>
    </tr>
  </table>

  <p>Sau khi bàn bạc và thống nhất, hai bên đồng ý ký kết hợp đồng dịch vụ bảo vệ với các điều khoản cụ thể như sau:</p>

  <!-- Điều 1 -->
  <div class="subsection-title">Điều 1. Giải thích từ ngữ</div>
  <p>1. <b>Bên A</b>: Là bên thuê dịch vụ bảo vệ.</p>
  <p>2. <b>Bên B</b>: Là doanh nghiệp cung cấp dịch vụ bảo vệ chuyên nghiệp.</p>
  <p>3. <b>Mục tiêu bảo vệ</b>: Địa điểm thực hiện dịch vụ được chỉ định tại Điều 2.</p>
  <p>4. <b>Nhân viên bảo vệ</b>: Nhân sự thuộc Bên B được phân công làm nhiệm vụ tại mục tiêu.</p>

  <!-- Điều 2 -->
  <div class="subsection-title">Điều 2. Đối tượng và phạm vi hợp đồng</div>
  <p class="bold">2.1 Địa điểm bảo vệ (Mục tiêu):</p>
  <p>${booking.address || "........................................................................................"}</p>
  
  <p class="bold">2.2 Thời gian thực hiện hợp đồng:</p>
  <p>Thời hạn thực hiện hợp đồng là từ ngày <b>${startDateStr}</b> đến hết ngày <b>${endDateStr}</b>.</p>

  <p class="bold">2.3 Danh sách vị trí ca trực:</p>
  <table class="data-table" style="width: 100%; border-collapse: collapse; margin: 10px 0;">
    <thead>
      <tr>
        <th style="width: 50%; border: 1px solid #000000; padding: 6px 8px; background-color: #f2f2f2; font-weight: bold; text-align: center;">Vị trí / Ca trực</th>
        <th style="width: 25%; border: 1px solid #000000; padding: 6px 8px; background-color: #f2f2f2; font-weight: bold; text-align: center;">Số lượng bảo vệ</th>
        <th style="width: 25%; border: 1px solid #000000; padding: 6px 8px; background-color: #f2f2f2; font-weight: bold; text-align: center;">Đơn giá ca trực</th>
      </tr>
    </thead>
    <tbody>
      ${servicePositionsHtml}
    </tbody>
  </table>

  <!-- Điều 3 -->
  <div class="subsection-title">Điều 3. Phạm vi công việc</div>
  <p>Bên B có trách nhiệm thực hiện công tác bảo vệ an ninh, tài sản và kiểm soát trật tự tại mục tiêu của Bên A theo mô tả công việc sau:</p>
  <p><i>${scopeText}</i></p>

  <!-- Điều 4 -->
  <div class="subsection-title">Điều 4. Nhân viên bảo vệ</div>
  <p class="bold">4.1 Danh sách nhân viên bảo vệ được chỉ định (nếu có):</p>
  ${guardsHtml}

  <p class="bold">4.2 Tiêu chuẩn nhân viên bảo vệ:</p>
  <ul>
    <li>Đã được đào tạo nghiệp vụ bảo vệ chuyên nghiệp, có sức khỏe tốt, lý lịch rõ ràng.</li>
    <li>Tác phong nghiêm túc, trang phục chỉnh tề theo đúng quy định của Bên B.</li>
    <li>Có thái độ lịch sự, tôn trọng khách hàng và nghiêm túc chấp hành nội quy của Bên A.</li>
  </ul>

  <p class="bold">4.3 Phương án xử lý sự cố ca trực đột xuất:</p>
  <p style="text-align: left;">- <b>Thay thế nhân sự dự phòng</b>: Bên B có trách nhiệm duy trì lực lượng bảo vệ dự phòng 24/7 để thay thế ngay lập tức trong trường hợp nhân viên bảo vệ chính thức tại mục tiêu gặp sự cố đột xuất (ốm đau, tai nạn, việc riêng khẩn cấp, bỏ ca). Thời gian bàn giao và có mặt của nhân sự thay thế tại mục tiêu không quá 02 giờ kể từ khi sự cố xảy ra hoặc kể từ khi nhận được thông báo của Bên A.</p>
  <p style="text-align: left;">- <b>Phạt vi phạm trống ca trực</b>: Trường hợp nhân viên bảo vệ tự ý bỏ vị trí trực mà không có lý do chính đáng và không có nhân sự thay thế hợp lệ dẫn đến mục tiêu bảo vệ bị bỏ trống, Bên B phải chịu phạt vi phạm tương đương 150% đơn giá ca trực trong khoảng thời gian bỏ trống. Bên B chịu hoàn toàn trách nhiệm bồi thường 100% giá trị thiệt hại nếu xảy ra mất mát, hư hỏng tài sản của Bên A trong thời gian ca trực bị bỏ trống này.</p>
  <p style="text-align: left;">- <b>Căn cứ ghi nhận qua hệ thống Báo cáo</b>: Mọi sự cố đột xuất liên quan đến ca trực (nhân sự vắng mặt, đi muộn, vi phạm tác phong như ngủ gật, thái độ không tốt) sẽ được Bên A gửi phản ánh trực tiếp qua hệ thống báo cáo của ứng dụng hoặc liên hệ trực tiếp với Điều phối viên của Bên B để yêu cầu xử lý. Các báo cáo và bằng chứng ghi nhận trên hệ thống sau khi được Bên B xác minh và chuyển sang trạng thái đã xử lý sẽ là <b>căn cứ pháp lý chính thức</b> để hai bên đối chiếu chất lượng dịch vụ, áp dụng phạt vi phạm trống ca trực hoặc thực hiện các biện pháp thay thế nhân sự tương ứng.</p>

  <!-- Điều 5 -->
  <div class="subsection-title">Điều 5. Phương thức thực hiện</div>
  <p style="text-align: left;">- Bên B cung cấp nhân viên bảo vệ làm việc theo các ca trực đã thỏa thuận tại Điều 2.</p>
  <p style="text-align: left;">- Bên B tự trang bị công cụ hỗ trợ cần thiết phục vụ công tác bảo vệ phù hợp với quy định pháp luật.</p>
  <p style="text-align: left;">- Bên B có trách nhiệm thường xuyên kiểm tra, giám sát chất lượng làm việc của nhân viên bảo vệ tại mục tiêu.</p>

  <!-- Điều 6 -->
  <div class="subsection-title">Điều 6. Chi phí dịch vụ và Phương thức thanh toán</div>
  <p class="bold">6.1 Tổng giá trị hợp đồng và Chi phí dịch vụ:</p>
  <p style="text-align: left;">- <b>Tổng giá trị hợp đồng:</b> <b>${contract.formatted_price || "........................"} VNĐ</b> <i>(đã bao gồm các chi phí liên quan, chưa bao gồm chi phí tăng cường nếu có)</i>.</p>
  <p style="text-align: left;">- Chi phí cố định hàng tháng (nếu thanh toán theo tháng): ........................................................................ VNĐ/tháng.</p>

  <p class="bold">6.2 Chi phí tăng cường ngoài giờ (nếu phát sinh):</p>
  <p style="text-align: left;">- Ngày thường: ........................................................................................</p>
  <p style="text-align: left;">- Ngày Chủ nhật: ........................................................................................</p>
  <p style="text-align: left;">- Ngày lễ, Tết: ........................................................................................</p>

  <p class="bold">6.3 Phương thức thanh toán:</p>
  <p style="text-align: left;">- Phương thức thanh toán: ........................................................................................</p>
  <p style="text-align: left;">- Chi tiết thanh toán (Tài khoản ngân hàng/Tiền mặt/Khác): ........................................................................................</p>
  <p style="text-align: left;">- Thời hạn thanh toán: ........................................................................................</p>

  <!-- Điều 7 -->
  <div class="subsection-title">Điều 7. Quyền và nghĩa vụ Bên A</div>
  <p style="text-align: left;">- Phối hợp với Bên B tạo điều kiện thuận lợi cho nhân viên bảo vệ thực hiện nhiệm vụ.</p>
  <p style="text-align: left;">- Thanh toán phí dịch vụ đầy đủ và đúng hạn theo thỏa thuận cho Bên B.</p>
  <p style="text-align: left;">- Cung cấp đầy đủ nội quy, quy định làm việc tại mục tiêu cho nhân viên bảo vệ.</p>

  <!-- Điều 8 -->
  <div class="subsection-title">Điều 8. Quyền và nghĩa vụ Bên B</div>
  <p style="text-align: left;">- Đảm bảo an ninh trật tự và an toàn tài sản tại mục tiêu theo đúng cam kết.</p>
  <p style="text-align: left;">- Bố trí đủ số lượng nhân sự bảo vệ theo các ca trực đã quy định.</p>
  <p style="text-align: left;">- Chịu trách nhiệm quản lý trực tiếp và chi trả tiền lương, chế độ bảo hiểm xã hội cho nhân viên bảo vệ theo quy định pháp luật.</p>

  <!-- Điều 9 -->
  <div class="subsection-title">Điều 9. Bồi thường thiệt hại</div>
  <p style="text-align: left;">- Bên B có trách nhiệm bồi thường cho Bên A nếu xảy ra mất mát, hư hỏng tài sản do lỗi thiếu tinh thần trách nhiệm hoặc cố ý của nhân viên bảo vệ Bên B gây ra tại mục tiêu.</p>
  <p style="text-align: left;">- Mức bồi thường thiệt hại thực tế căn cứ theo kết luận xác minh của cơ quan chức năng có thẩm quyền hoặc sự thỏa thuận thống nhất giữa hai bên.</p>

  <!-- Điều 10 -->
  <div class="subsection-title">Điều 10. Bảo mật thông tin</div>
  <p>Cả hai bên cam kết bảo mật tuyệt đối mọi thông tin liên quan đến hoạt động sản xuất kinh doanh, nội bộ của nhau được tiếp cận trong suốt quá trình thực hiện hợp đồng.</p>

  <!-- Điều 11 -->
  <div class="subsection-title">Điều 11. Sự kiện bất khả kháng</div>
  <p>Các biến cố khách quan bất khả kháng như thiên tai, dịch bệnh, chiến tranh sẽ do quy định pháp luật điều chỉnh.</p>

  <!-- Điều 12 -->
  <div class="subsection-title">Điều 12. Chấm dứt hợp đồng</div>
  <p>Hợp đồng chấm dứt khi hết thời hạn quy định tại Điều 2 mà không gia hạn thêm hoặc theo thỏa thuận đơn phương bằng văn bản khi một bên vi phạm nghiêm trọng các cam kết dịch vụ.</p>

  <!-- Điều 13 -->
  <div class="subsection-title">Điều 13. Hiệu lực hợp đồng</div>
  <p style="text-align: left;">- Hợp đồng này có hiệu lực từ ngày <b>${startDateStr}</b> đến hết ngày <b>${endDateStr}</b>.</p>
  <p style="text-align: left;">- Hợp đồng được lập thành 02 bản có giá trị pháp lý ngang nhau, mỗi bên giữ 01 bản làm căn cứ thực hiện.</p>

  <!-- Điều 14 -->
  <div class="subsection-title">Điều 14. Giải quyết tranh chấp</div>
  <p>Mọi tranh chấp phát sinh trước hết sẽ được giải quyết thông qua thương lượng, hòa giải. Trường hợp thương lượng không thành công sẽ đưa vụ việc ra Tòa án nhân dân có thẩm quyền giải quyết.</p>

  <!-- Điều 15 -->
  <div class="subsection-title">Điều 15. Điều khoản chung</div>
  <p>Các sửa đổi, bổ sung nội dung hợp đồng chỉ có giá trị khi được lập thành văn bản phụ lục hợp đồng và có chữ ký xác nhận của người đại diện hợp pháp của hai bên.</p>

  <!-- Ký xác nhận -->
  <table class="signature-table" style="width: 100%; border-collapse: collapse; margin-top: 40px;">
    <tr>
      <td class="bold" style="text-align: center; width: 50%; font-weight: bold;">ĐẠI DIỆN BÊN A</td>
      <td class="bold" style="text-align: center; width: 50%; font-weight: bold;">ĐẠI DIỆN BÊN B</td>
    </tr>
    <tr>
      <td style="font-size: 10pt; font-style: italic; text-align: center; padding-bottom: 80px;">(Ký, ghi rõ họ tên)</td>
      <td style="font-size: 10pt; font-style: italic; text-align: center; padding-bottom: 80px;">(Ký, đóng dấu, ghi rõ họ tên)</td>
    </tr>
    <tr>
      <td class="bold" style="text-align: center; font-weight: bold;">${customer.representative}</td>
      <td class="bold" style="text-align: center; font-weight: bold;">${company.representative}</td>
    </tr>
    <tr>
      <td style="font-size: 10.5pt; text-align: center;">Chức vụ: ${customer.position}</td>
      <td style="font-size: 10.5pt; text-align: center;">Chức vụ: ${company.position}</td>
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
  a.download = `Hop_Dong_Dich_Vu_Bao_Ve_${contract.contract_code || contract.contract_id}.doc`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
