interface ApprovedTemplateParams {
  repName: string;
  companyName: string;
  createdAt: string;
  registrationCode: string;
  loginUrl: string;
}

interface RejectedTemplateParams {
  repName: string;
  companyName: string;
  createdAt: string;
  rejectReason: string;
  editUrl: string;
}

export function getApprovedEmailHtml({
  repName,
  companyName,
  createdAt,
  registrationCode,
  loginUrl
}: ApprovedTemplateParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo phê duyệt hồ sơ đăng ký</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #024594; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">SGCMP</h1>
              <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 13px;">Nền tảng Quản lý và Giao thương Doanh nghiệp</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px; color: #334155;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6;">Kính chào ông/bà <strong>${repName}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">Ban quản trị hệ thống <strong>SGCMP</strong> xin thông báo hồ sơ đăng ký doanh nghiệp của đơn vị <strong>${companyName}</strong> gửi ngày <strong>${createdAt}</strong> đã được <strong>phê duyệt thành công</strong>.</p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr style="font-size: 13px;">
                        <td style="padding: 4px 0; color: #64748b; width: 120px;">Mã hồ sơ:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-family: monospace; font-weight: bold; font-size: 14px;">${registrationCode}</td>
                      </tr>
                      <tr style="font-size: 13px;">
                        <td style="padding: 4px 0; color: #64748b;">Trạng thái:</td>
                        <td style="padding: 4px 0; color: #10b981; font-weight: bold;">ĐÃ PHÊ DUYỆT</td>
                      </tr>
                      <tr style="font-size: 13px;">
                        <td style="padding: 4px 0; color: #64748b;">Vai trò tài khoản:</td>
                        <td style="padding: 4px 0; color: #0f172a;">Quản trị viên doanh nghiệp (Company Admin)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">Bây giờ, bạn đã có thể truy cập hệ thống bằng tài khoản đã đăng ký để bắt đầu cấu hình dịch vụ, cập nhật thông tin cửa hàng và tham gia giao thương trên nền tảng của chúng tôi.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #024594; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 6px; box-shadow: 0 4px 6px rgba(2, 69, 148, 0.2);">Truy cập hệ thống ngay</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 11px;">
              <p style="margin: 0 0 6px 0; font-weight: bold; color: #64748b;">Hệ thống Giao thương và Quản lý Doanh nghiệp SGCMP</p>
              <p style="margin: 0 0 12px 0;">Email hỗ trợ: support@sgcmp.vn | Hotline: 1900-xxxx</p>
              <p style="margin: 0;">Đây là email tự động từ hệ thống, vui lòng không trả lời trực tiếp email này.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getRejectedEmailHtml({
  repName,
  companyName,
  createdAt,
  rejectReason,
  editUrl
}: RejectedTemplateParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo kết quả hồ sơ đăng ký</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #b91c1c; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">SGCMP</h1>
              <p style="color: #fca5a5; margin: 5px 0 0 0; font-size: 13px;">Thông báo kết quả duyệt hồ sơ doanh nghiệp</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px; color: #334155;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6;">Kính chào ông/bà <strong>${repName}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">Ban quản trị hệ thống <strong>SGCMP</strong> đã tiến hành kiểm duyệt hồ sơ đăng ký doanh nghiệp của đơn vị <strong>${companyName}</strong> gửi ngày <strong>${createdAt}</strong>. Rất tiếc, hồ sơ của đơn vị hiện tại <strong>không được phê duyệt</strong>.</p>
              
              <!-- Rejection Reason Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: bold;">Lý do từ chối xét duyệt:</h4>
                    <p style="margin: 0; color: #b91c1c; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${rejectReason}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">Vui lòng nhấn vào nút bên dưới để tiến hành điều chỉnh thông tin hoặc bổ sung tài liệu cần thiết và gửi lại hồ sơ cho ban quản trị xét duyệt.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <a href="${editUrl}" target="_blank" style="display: inline-block; background-color: #b91c1c; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 6px; box-shadow: 0 4px 6px rgba(185, 28, 28, 0.2);">Chỉnh sửa hồ sơ ngay</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 11px;">
              <p style="margin: 0 0 6px 0; font-weight: bold; color: #64748b;">Hệ thống Giao thương và Quản lý Doanh nghiệp SGCMP</p>
              <p style="margin: 0 0 12px 0;">Email hỗ trợ: support@sgcmp.vn | Hotline: 1900-xxxx</p>
              <p style="margin: 0;">Đây là email tự động từ hệ thống, vui lòng không trả lời trực tiếp email này.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
