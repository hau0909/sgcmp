"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { createBooking } from "@/features/booking/api/booking.api";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export default function BookingModal({ isOpen, onClose, companyId }: BookingModalProps) {
  const router = useRouter(); // Khởi tạo router
  const authUserId = useAuthStore((state) => state.user_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);

  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    description: "",
    service_id: "",
    start_date: "",
    end_date: "",
    guards_per_slot: 1,
    time_slots: "08:00-17:00",
  });

  // Lấy ngày hiện tại format (YYYY-MM-DD) để chặn chọn ngày quá khứ
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);

      if (companyId) {
        const fetchServices = async () => {
          const supabase = createClient();
          const { data } = await supabase
            .from("services")
            .select("service_id, name");

          if (data) {
            setServices(data);
            if (data.length > 0 && !formData.service_id) {
              setFormData((prev) => ({ ...prev, service_id: data[0].service_id }));
            }
          }
        };
        fetchServices();
      }
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUserId) {
      setError("Bạn cần đăng nhập để đặt dịch vụ.");
      return;
    }
    if (!formData.service_id) {
      setError("Vui lòng chọn loại dịch vụ.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createBooking({
        ...formData,
        company_id: companyId,
        customer_id: authUserId,
        time_slots: [formData.time_slots],
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface">
            {isSuccess ? "Hoàn tất yêu cầu" : "Yêu cầu đặt dịch vụ"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            // ================= GIAO DIỆN THÀNH CÔNG GIỐNG ĐĂNG KÝ DOANH NGHIỆP =================
            <div className="py-4 space-y-6 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-on-surface">Đã gửi yêu cầu thành công!</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Yêu cầu đặt dịch vụ bảo vệ của bạn đã được tiếp nhận và đưa vào danh sách chờ xử lý của doanh nghiệp.
                </p>
              </div>

              <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl max-w-sm mx-auto text-center">
                <span className="text-xs text-on-surface-variant block uppercase tracking-wider font-semibold mb-1">
                  Trạng thái hiện tại
                </span>
                <span className="font-mono text-lg font-bold text-primary tracking-wider">
                  ĐANG CHỜ BÁO GIÁ
                </span>
              </div>

              <p className="text-xs text-on-surface-variant/80 max-w-md mx-auto leading-relaxed text-center">
                * Doanh nghiệp sẽ liên hệ với bạn để xác nhận yêu cầu trong thời gian sớm nhất. Bạn có thể theo dõi tiến độ ở trang cá nhân.
              </p>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/");
                  }}
                  className="border border-outline-variant hover:bg-surface-container-low text-on-surface py-2.5 px-6 rounded-xl text-sm font-semibold transition-all"
                >
                  Về Trang Chủ
                </button>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/profile"); // Hoặc đường dẫn dashboard của bạn
                  }}
                  className="bg-primary hover:bg-primary-container text-white py-2.5 px-6 rounded-xl text-sm font-semibold transition-all"
                >
                  Theo Dõi Yêu Cầu
                </button>
              </div>
            </div>
          ) : (
            // ================= GIAO DIỆN FORM ĐẶT DỊCH VỤ =================
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
                {/* VỊ TRÍ */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Vị trí</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-lg focus:outline-primary bg-surface-container-lowest text-sm"
                      placeholder="Nhập địa chỉ hoặc mã cơ sở..."
                    />
                  </div>
                </div>

                {/* NGÀY BẮT ĐẦU / KẾT THÚC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Ngày bắt đầu</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        min={today} // <-- Chặn chọn ngày quá khứ
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-primary bg-surface-container-lowest text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Ngày kết thúc</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        min={formData.start_date || today} // <-- Ngày kết thúc không được nhỏ hơn ngày bắt đầu
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-primary bg-surface-container-lowest text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* LOẠI DỊCH VỤ & SỐ LƯỢNG NHÂN SỰ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LOẠI DỊCH VỤ */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Loại dịch vụ</label>
                    <select
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-primary bg-surface-container-lowest text-sm appearance-none"
                    >
                      <option value="" disabled>Chọn dịch vụ cần thiết</option>
                      {services.map((svc) => (
                        <option key={svc.service_id} value={svc.service_id}>
                          {svc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SỐ LƯỢNG NHÂN SỰ */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Số lượng nhân sự</label>
                    <input
                      type="number"
                      name="guards_per_slot"
                      value={formData.guards_per_slot}
                      onChange={handleChange}
                      min={1}
                      required
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-primary bg-surface-container-lowest text-sm"
                      placeholder="Nhập số lượng..."
                    />
                  </div>
                </div>

                {/* YÊU CẦU CỤ THỂ */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Yêu cầu cụ thể</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-primary bg-surface-container-lowest text-sm resize-none"
                    placeholder="Thêm hướng dẫn đặc biệt, yêu cầu đồng phục, hoặc mã truy cập tại đây..."
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer: Chỉ hiển thị khi đang ở Form */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="booking-form"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-70 shadow-sm transition-all"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}