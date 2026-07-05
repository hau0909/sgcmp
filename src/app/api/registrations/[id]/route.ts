import { NextRequest, NextResponse } from "next/server";
import {
  handleGetRegistrationDetail,
  handleUpdateRegistrationStatus,
} from "@/features/registration/controller/registration.controller";
import { sendEmail } from "@/lib/email";
import {
  getApprovedEmailHtml,
  getRejectedEmailHtml,
} from "@/features/registration/utils/emailTemplates";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hồ sơ đăng ký là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetRegistrationDetail(id);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy hồ sơ đăng ký" },
        { status: 404 }
      );
    }

    return NextResponse.json({ registration: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/registrations/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hồ sơ đăng ký là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, note } = body;

    if (!status || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ (chỉ chấp nhận approved hoặc rejected)" },
        { status: 400 }
      );
    }

    // Get detail before status update to extract email and owner info
    const detail = await handleGetRegistrationDetail(id);

    await handleUpdateRegistrationStatus(id, status, note);

    // Send email notification asynchronously
    if (detail) {
      const recipientEmail = detail.companies?.profiles?.email || detail.companies?.email;
      if (recipientEmail) {
        (async () => {
          try {
            const repName = detail.companies?.profiles?.full_name || "Quý đối tác";
            const companyName = detail.companies?.company_name || "";
            const createdAt = new Date(detail.created_at).toLocaleString("vi-VN");
            const registrationCode = detail.registration_code;
            
            if (status === "approved") {
              const loginUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/login`;
              const html = getApprovedEmailHtml({
                repName,
                companyName,
                createdAt,
                registrationCode,
                loginUrl
              });
              await sendEmail({
                to: recipientEmail,
                subject: `[SGCMP] Thông báo phê duyệt hồ sơ đăng ký doanh nghiệp thành công`,
                html
              });
            } else if (status === "rejected") {
              const editUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/register`;
              const html = getRejectedEmailHtml({
                repName,
                companyName,
                createdAt,
                rejectReason: note || "Không có lý do chi tiết",
                editUrl
              });
              await sendEmail({
                to: recipientEmail,
                subject: `[SGCMP] Thông báo từ chối hồ sơ đăng ký doanh nghiệp`,
                html
              });
            }
          } catch (emailErr) {
            console.error("Error sending status email:", emailErr);
          }
        })();
      } else {
        console.warn(`[SMTP warning] No recipient email found for registration ${id}. Skipping email.`);
      }
    }

    return NextResponse.json(
      { success: true, message: "Cập nhật trạng thái đăng ký thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PUT /api/registrations/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

