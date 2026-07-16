import { NextRequest, NextResponse } from "next/server";
import {
  handleGetCompanyPublishRequestById,
  handleUpdateCompanyPublishRequestStatus,
} from "@/features/company/controller/company.controller";
import { sendEmail } from "@/lib/email";
import {
  getPublishRequestApprovedEmailHtml,
  getPublishRequestRejectedEmailHtml,
} from "@/features/registration/utils/emailTemplates";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "Mã yêu cầu là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetCompanyPublishRequestById(requestId);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu phát hành" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/admin/publish-requests/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "Mã yêu cầu là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, note } = body;

    if (!status || (status !== "APPROVED" && status !== "REJECTED")) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ (chỉ chấp nhận APPROVED hoặc REJECTED)" },
        { status: 400 }
      );
    }

    // Get request details before updating status to get email & names
    const detail = await handleGetCompanyPublishRequestById(requestId);

    await handleUpdateCompanyPublishRequestStatus(requestId, status, note);

    // Send email
    if (detail) {
      const recipientEmail = detail.requested_by?.email || detail.company?.email;
      if (recipientEmail) {
        try {
          const repName = detail.requested_by?.full_name || "Quý đối tác";
          const companyName = detail.company?.company_name || "";
          const createdAt = new Date(detail.requested_at).toLocaleString("vi-VN");

          if (status === "APPROVED") {
            const marketplaceUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/companies/${detail.company_id}`;
            const html = getPublishRequestApprovedEmailHtml({
              repName,
              companyName,
              createdAt,
              marketplaceUrl,
            });
            await sendEmail({
              to: recipientEmail,
              subject: `[SGCMP] Thông báo phê duyệt yêu cầu công khai thông tin doanh nghiệp thành công`,
              html,
            });
          } else if (status === "REJECTED") {
            const editUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/companies/${detail.company_id}`;
            const html = getPublishRequestRejectedEmailHtml({
              repName,
              companyName,
              createdAt,
              rejectReason: note || "Không có lý do chi tiết",
              editUrl,
            });
            await sendEmail({
              to: recipientEmail,
              subject: `[SGCMP] Thông báo từ chối yêu cầu công khai thông tin doanh nghiệp`,
              html,
            });
          }
        } catch (emailErr) {
          console.error("Error sending publish request email:", emailErr);
        }
      } else {
        console.warn(`[SMTP warning] No recipient email found for publish request ${requestId}. Skipping email.`);
      }
    }

    return NextResponse.json(
      { success: true, message: "Cập nhật trạng thái yêu cầu phát hành thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PUT /api/admin/publish-requests/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
