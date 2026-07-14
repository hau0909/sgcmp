"use client";

import React, { useState, useEffect } from "react";
import {
  Verification,
  VerificationStatus,
} from "@/features/verification/types";
import {
  requestGetVerification,
  requestCreateVerificationSession,
  requestUpdateVerification,
} from "@/features/verification/api/verification.api";
import { requestGetBookingDetail } from "@/features/booking/api/booking.api";
import { createClient } from "@/lib/supabase/client";
import { BookingCustomerInfo } from "@/features/booking/components/BookingCustomerInfo";
import { BookingServiceSpec } from "@/features/booking/components/BookingServiceSpec";
import {
  Loader2,
  Upload,
  AlertCircle,
  FileImage,
  FileText,
  CheckCircle,
  X,
  Check,
  XCircle,
  Building2,
  Calendar,
} from "lucide-react";

interface VerificationDetailProps {
  bookingId: string;
  isCompanyAdmin: boolean;
  onVerificationUpdate?: (v: Verification) => void;
}

export function VerificationDetail({
  bookingId,
  isCompanyAdmin,
  onVerificationUpdate,
}: VerificationDetailProps) {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | null>(null);

  const supabase = createClient();

  const fetchVerification = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both verification session and booking details in parallel
      const [verifRes, bookingRes] = await Promise.all([
        requestGetVerification(bookingId).catch(() => ({ verification: null })),
        requestGetBookingDetail(bookingId).catch(() => null),
      ]);

      setVerification(verifRes.verification);
      if (verifRes.verification) {
        setNotes(verifRes.verification.notes || "");
        setDescription(verifRes.verification.description || "");
      }

      if (bookingRes && bookingRes.booking) {
        setBooking(bookingRes.booking);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không thể lấy thông tin khảo sát.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const handleCreateSession = async () => {
    try {
      setIsSimulating(true);
      const res = await requestCreateVerificationSession(bookingId);
      setVerification(res.verification);
      if (onVerificationUpdate) onVerificationUpdate(res.verification);
    } catch (err: any) {
      setError(err?.message || "Không thể tạo phiên khảo sát.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleUpdate = async (status?: VerificationStatus) => {
    if (!verification) return;
    try {
      setIsSimulating(true);
      const updates: any = {};
      if (status !== undefined) updates.status = status;
      
      if (isCompanyAdmin) {
        updates.notes = notes;
      } else {
        updates.description = description;
      }

      const res = await requestUpdateVerification(bookingId, updates);
      setVerification(res.verification);
      if (onVerificationUpdate) onVerificationUpdate(res.verification);
    } catch (err: any) {
      setError(err?.message || "Lỗi cập nhật khảo sát.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !verification) return;
    try {
      setIsSimulating(true);
      const newImages = [...verification.images];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${bookingId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("request_verifications")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("request_verifications")
          .getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }

      const res = await requestUpdateVerification(bookingId, {
        images: newImages,
      });
      setVerification(res.verification);
      if (onVerificationUpdate) onVerificationUpdate(res.verification);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi upload ảnh.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
  };

  const handleDeleteImage = async (indexToDelete: number) => {
    if (!verification) return;
    try {
      setIsSimulating(true);
      const newImages = verification.images.filter(
        (_, idx) => idx !== indexToDelete,
      );

      const res = await requestUpdateVerification(bookingId, {
        images: newImages,
      });
      setVerification(res.verification);
      if (onVerificationUpdate) onVerificationUpdate(res.verification);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi xoá ảnh.");
    } finally {
      setIsSimulating(false);
    }
  };

  const canEditImages = !isCompanyAdmin && (verification?.status === "pending" || verification?.status === "rejected");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (canEditImages) {
      handleFiles(e.dataTransfer.files);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-gray-500">Đang tải thông tin khảo sát...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Information Header Cards */}
      {booking && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BookingCustomerInfo
            customerName={booking.customer_name || "—"}
            contactPerson={booking.contact_person || "—"}
            phone={booking.phone || "—"}
            email={booking.email || "—"}
            address={booking.address || "—"}
          />
          <BookingServiceSpec
            serviceName={booking.service_name || "—"}
            guardsCount={booking.guards_per_slot || 1}
            startDate={booking.start_date}
            endDate={booking.end_date}
            timeSlots={booking.timeSlots}
            day_per_week={booking.day_per_week}
            specialInstructions={booking.notes}
          />
        </div>
      )}

      {/* Verification Session Section */}
      {!verification ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Chưa có phiên khảo sát
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-md text-sm">
            Yêu cầu này chưa được tiến hành khảo sát.{" "}
            {isCompanyAdmin &&
              "Vui lòng tạo phiên khảo sát mới để tiếp tục quy trình."}
          </p>
          {isCompanyAdmin && (
            <button
              onClick={handleCreateSession}
              disabled={isSimulating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Tạo phiên khảo sát
            </button>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden transition-all duration-300 space-y-6">
          {isSimulating && (
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="bg-error/10 text-error border border-error/20 p-4 rounded-lg flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
            <div>
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                {!isCompanyAdmin && <FileText className="w-4 h-4 text-primary" />}
                {!isCompanyAdmin ? "Báo Cáo Khảo Sát Yêu Cầu" : "Chi tiết Khảo sát"}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                {!isCompanyAdmin ? "Điền thông tin khảo sát và đính kèm hình ảnh thực tế tại mục tiêu" : "Ghi nhận tình trạng thực tế trước khi báo giá"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                Trạng thái:
              </span>
              {verification.status === "approved" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
                  Đã duyệt
                </span>
              ) : verification.status === "rejected" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border-red-200">
                  Từ chối
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
                  Chờ duyệt
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {!isCompanyAdmin && notes && (
                <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-lg text-xs space-y-1 shadow-sm">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Phản hồi từ Admin
                  </div>
                  <p className="ml-5.5">{notes}</p>
                </div>
              )}

              {isCompanyAdmin ? (
                <div className="bg-blue-50/50 text-on-surface border border-blue-200 p-3 rounded-lg text-xs space-y-2 shadow-sm">
                  <div className="font-bold flex items-center gap-1.5 text-blue-700 uppercase tracking-wider text-[11px]">
                    <FileText className="w-4 h-4" />
                    Mô tả hiện trạng
                  </div>
                  <div className="ml-5.5 whitespace-pre-wrap leading-relaxed">
                    {description || <span className="text-on-surface-variant italic">Chưa có mô tả.</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Mô tả hiện trạng
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={verification.status !== "pending" && verification.status !== "rejected"}
                    placeholder="Nhập mô tả chi tiết về hiện trạng khu vực khảo sát..."
                    className="w-full h-32 p-3 border rounded bg-white border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm focus:outline-none transition-all text-xs text-on-surface placeholder-on-surface-variant"
                  />
                </div>
              )}

              {isCompanyAdmin && (
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Ghi chú
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!isCompanyAdmin}
                    placeholder="Nhập ghi chú phản hồi khảo sát nếu cần..."
                    className="w-full h-24 p-3 border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-xs text-on-surface placeholder-on-surface-variant"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Hình ảnh khảo sát ({verification.images.length})
                </label>
                {canEditImages && (
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                )}
              </div>

              <div
                className={`grid grid-cols-2 sm:grid-cols-3 gap-3 p-2 rounded-xl border-2 transition-all ${isDragActive ? "border-primary bg-primary/5 border-dashed" : "border-transparent"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {verification.images.length === 0 ? (
                  canEditImages ? (
                    <label
                      htmlFor="image-upload"
                      className={`col-span-full py-8 border ${isDragActive ? "border-primary/50 bg-primary/5 text-primary" : "border-outline-variant border-dashed text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-bright cursor-pointer"} rounded-lg flex flex-col items-center justify-center transition-all`}
                    >
                      <FileImage className="w-6 h-6 mb-1.5 opacity-55" />
                      <p className="text-[10px] font-medium">
                        {isDragActive
                          ? "Thả ảnh vào đây..."
                          : "Kéo thả hoặc bấm nút để tải ảnh lên"}
                      </p>
                    </label>
                  ) : (
                    <div
                      className="col-span-full py-8 border border-outline-variant border-dashed text-on-surface-variant bg-surface-bright/50 rounded-lg flex flex-col items-center justify-center pointer-events-none"
                    >
                      <FileImage className="w-6 h-6 mb-1.5 opacity-55" />
                      <p className="text-[10px] font-medium">
                        Chưa có hình ảnh nào
                      </p>
                    </div>
                  )
                ) : (
                  <>
                    {verification.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group"
                      >
                        <a
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full h-full"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Survey image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>
                        {canEditImages && (
                          <button
                            onClick={() => handleDeleteImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                            title="Xóa ảnh này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {canEditImages && (
                      <label
                        htmlFor="image-upload"
                        className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5 text-primary" : "border-outline-variant hover:border-primary hover:bg-surface-bright text-on-surface-variant hover:text-primary"}`}
                      >
                        <Upload
                          className={`w-6 h-6 mb-2 ${isDragActive ? "animate-bounce" : ""}`}
                        />
                        <span className="text-[10px] font-medium text-center px-2">
                          {isDragActive ? "Thả ảnh vào đây" : "Thêm ảnh"}
                        </span>
                      </label>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {isCompanyAdmin && verification.status === "pending" && (
            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!notes.trim()) {
                      setError("Vui lòng điền Ghi chú khi từ chối khảo sát.");
                      return;
                    }
                    setConfirmAction("rejected");
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-red-755 bg-red-50 border border-red-205 hover:bg-red-100 rounded transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-3.5 h-3.5" /> Từ chối
                </button>
                <button
                  onClick={() => setConfirmAction("approved")}
                  className="px-3.5 py-1.5 text-xs font-semibold text-on-primary bg-primary border border-transparent hover:bg-primary/95 rounded transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Duyệt khảo sát
                </button>
              </div>
            </div>
          )}

          {!isCompanyAdmin && (verification.status === "rejected" || verification.status === "pending") && (
            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-4 flex-wrap">
              <button
                onClick={() => handleUpdate("pending")}
                className="px-3.5 py-1.5 text-xs font-semibold text-on-primary bg-primary border border-transparent hover:bg-primary/95 rounded transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Cập nhật thông tin khảo sát
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
            <div className={`p-4 border-b ${confirmAction === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${confirmAction === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}>
                {confirmAction === 'approved' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {confirmAction === 'approved' ? 'Xác nhận duyệt khảo sát' : 'Xác nhận từ chối khảo sát'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-on-surface-variant">
              {confirmAction === 'approved' ? (
                <p>
                  Bạn có chắc chắn muốn duyệt báo cáo khảo sát này? Sau khi duyệt, khách hàng sẽ nhận được thông báo để xem kết quả.
                </p>
              ) : (
                <div className="space-y-3">
                  <p>Bạn đang từ chối bản khảo sát này. Xin lưu ý các thông tin đã ghi nhận:</p>
                  <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
                    <p className="font-semibold text-on-surface mb-1">Ghi chú từ chối:</p>
                    <p className="italic">{notes}</p>
                  </div>
                  <p className="text-red-600 font-medium">Hành động này không thể hoàn tác.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-outline-variant/30 flex items-center justify-end gap-3 bg-surface-container/30">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isSimulating}
                className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  handleUpdate(confirmAction);
                  setConfirmAction(null);
                }}
                disabled={isSimulating}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 ${
                  confirmAction === 'approved' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSimulating && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmAction === 'approved' ? 'Đồng ý duyệt' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
