import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

function getResetPasswordEmailHtml(email: string, resetLink: string) {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu - SGCMP</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
    <!-- Brand Title -->
    <h1 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 800; color: #0052cc; letter-spacing: 0.5px; font-family: sans-serif;">SGCMP</h1>
    
    <!-- Main Heading -->
    <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Đặt lại mật khẩu tài khoản</h2>
    
    <!-- Description -->
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
      Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng bấm nút bên dưới để tiến hành đặt lại mật khẩu mới.
    </p>

    <!-- Email Box -->
    <div style="text-align: left; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Địa chỉ email</div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #0284c7; font-weight: 500; word-break: break-all;">
        ${email}
      </div>
    </div>

    <!-- Action Button -->
    <a href="${resetLink}" target="_blank" style="display: block; width: 100%; background-color: #0052cc; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center; padding: 13px 0; border-radius: 8px; box-sizing: border-box;">
      Đặt lại mật khẩu
    </a>

    <!-- Notice Footer -->
    <div style="margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.4;">
      Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
    </div>
  </div>

  <!-- Copyright -->
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
    © SGCMP System
  </div>
</body>
</html>
  `;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const trimmedEmail = email ? String(email).trim().toLowerCase() : "";

    if (!trimmedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập địa chỉ email.",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Địa chỉ email không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const redirectTo = `${origin}/update-password`;

    let emailSentViaSmtp = false;

    // Attempt custom link generation & SMTP email sending if configured
    try {
      const { data, error: genError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: trimmedEmail,
        options: { redirectTo },
      });

      if (!genError && data?.properties?.action_link) {
        const actionLink = data.properties.action_link;
        const html = getResetPasswordEmailHtml(trimmedEmail, actionLink);

        const sendResult = await sendEmail({
          to: trimmedEmail,
          subject: "Đặt lại mật khẩu - SGCMP",
          html,
        });

        if (sendResult.success) {
          emailSentViaSmtp = true;
        }
      }
    } catch (err) {
      console.warn("Custom SMTP generation fallback to default resetPasswordForEmail:", err);
    }

    // Fallback to standard Supabase auth email if custom SMTP was not used
    if (!emailSentViaSmtp) {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message || "Gửi yêu cầu đặt lại mật khẩu thất bại.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi liên kết đặt lại mật khẩu tới email của bạn.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Đã xảy ra lỗi hệ thống.",
      },
      { status: 500 },
    );
  }
}
