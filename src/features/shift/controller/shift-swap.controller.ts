import { NextResponse } from "next/server";
import { getUser } from "@/features/auth/service/auth.service";
import { handleGetUserProfile } from "@/features/auth/controller/auth.controller";
import { resolveGuardIdForShift } from "../utils/shift-server.utils";
import {
  getGuardEligibleShiftsForSwapRepository,
  createShiftSwapRequestRepository,
  getGuardSwapRequestsRepository,
  getCompanySwapRequestsRepository,
  rejectShiftSwapRequestRepository,
  approveShiftSwapRequestRepository,
} from "../repository/shift-swap.repository";
import { ShiftSwapRequestItem } from "@/types/ShiftSwapRequest";

export const handleGetEligibleShiftsForSwap = async () => {
  try {
    const authResult = await resolveGuardIdForShift();
    if (authResult.response) return authResult.response;

    const data = await getGuardEligibleShiftsForSwapRepository(authResult.guardId!);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Không thể lấy danh sách ca làm" },
      { status: 500 }
    );
  }
};

export const handleCreateShiftSwapRequest = async (request: Request) => {
  try {
    const authResult = await resolveGuardIdForShift();
    if (authResult.response) return authResult.response;

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Người dùng chưa đăng nhập" }, { status: 401 });
    }
    const profileRes = await handleGetUserProfile(user.id);
    const profile = profileRes.data;

    if (!profile?.company_id) {
      return NextResponse.json({ message: "Tài khoản chưa gán công ty" }, { status: 400 });
    }

    const body = await request.json();
    const { reason, items } = body as { reason: string; items: ShiftSwapRequestItem[] };

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json({ message: "Vui lòng nhập lý do đổi ca" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Vui lòng chọn ít nhất 1 ca làm để đổi" }, { status: 400 });
    }

    const created = await createShiftSwapRequestRepository({
      company_id: profile.company_id,
      requester_guard_id: authResult.guardId!,
      reason: reason.trim(),
      items,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Không thể tạo yêu cầu đổi ca" },
      { status: 500 }
    );
  }
};

export const handleGetGuardSwapRequests = async () => {
  try {
    const authResult = await resolveGuardIdForShift();
    if (authResult.response) return authResult.response;

    const data = await getGuardSwapRequestsRepository(authResult.guardId!);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Không thể lấy lịch sử yêu cầu đổi ca" },
      { status: 500 }
    );
  }
};

export const handleGetCompanySwapRequests = async () => {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Người dùng chưa đăng nhập" }, { status: 401 });
    }
    const profileRes = await handleGetUserProfile(user.id);
    const profile = profileRes.data;

    if (!profile) {
      return NextResponse.json({ message: "Không tìm thấy thông tin người dùng" }, { status: 404 });
    }

    if (!["coordinator", "company-admin", "admin"].includes(profile.role)) {
      return NextResponse.json({ message: "Bạn không có quyền xem danh sách yêu cầu" }, { status: 403 });
    }

    if (!profile.company_id) {
      return NextResponse.json({ message: "Tài khoản không thuộc công ty nào" }, { status: 400 });
    }

    const data = await getCompanySwapRequestsRepository(profile.company_id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Không thể lấy danh sách yêu cầu đổi ca" },
      { status: 500 }
    );
  }
};

export const handleRejectShiftSwapRequest = async (requestId: string, request: Request) => {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Người dùng chưa đăng nhập" }, { status: 401 });
    }
    const profileRes = await handleGetUserProfile(user.id);
    const profile = profileRes.data;

    if (!profile || !["coordinator", "company-admin", "admin"].includes(profile.role)) {
      return NextResponse.json({ message: "Bạn không có quyền từ chối yêu cầu đổi ca" }, { status: 403 });
    }

    const body = await request.json();
    const { rejectionReason } = body as { rejectionReason: string };

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json({ message: "Vui lòng nhập lý do từ chối" }, { status: 400 });
    }

    const updated = await rejectShiftSwapRequestRepository(requestId, rejectionReason.trim());
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Không thể từ chối yêu cầu đổi ca" },
      { status: 500 }
    );
  }
};

export const handleApproveShiftSwapRequest = async (requestId: string, request: Request) => {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Người dùng chưa đăng nhập" }, { status: 401 });
    }
    const profileRes = await handleGetUserProfile(user.id);
    const profile = profileRes.data;

    if (!profile || !["coordinator", "company-admin", "admin"].includes(profile.role)) {
      return NextResponse.json({ message: "Bạn không có quyền duyệt yêu cầu đổi ca" }, { status: 403 });
    }

    const body = await request.json();
    const { items } = body as { items: ShiftSwapRequestItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Danh sách ca đổi không hợp lệ" }, { status: 400 });
    }

    // Ensure all items have a replacement guard selected
    const unassignedItem = items.find((it) => !it.replacement_guard_id);
    if (unassignedItem) {
      return NextResponse.json({ message: "Vui lòng chọn bảo vệ thay thế cho tất cả các ca" }, { status: 400 });
    }

    const updated = await approveShiftSwapRequestRepository(requestId, items);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Không thể duyệt yêu cầu đổi ca" },
      { status: 500 }
    );
  }
};
