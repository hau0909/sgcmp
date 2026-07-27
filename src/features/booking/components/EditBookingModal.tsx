"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { requestUpdateBookingDetails } from "@/features/booking/api/booking.api";
import { requestGetCities, requestGetWards } from "@/features/address/api/address.api";
import { City, Ward } from "@/features/address/types";
import { useTranslation } from "@/components/providers/LanguageProvider";

const DAYS_OF_WEEK = [
  { value: "Monday", label: "T2" },
  { value: "Tuesday", label: "T3" },
  { value: "Wednesday", label: "T4" },
  { value: "Thursday", label: "T5" },
  { value: "Friday", label: "T6" },
  { value: "Saturday", label: "T7" },
  { value: "Sunday", label: "CN" },
];

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  initialData: {
    address: string;
    guards_count: number;
    start_date: string;
    end_date: string;
    time_slots: string[];
    day_per_week: string[];
    special_instructions: string | string[] | null;
  };
  onSuccess: () => void;
}

export function EditBookingModal({
  isOpen,
  onClose,
  bookingId,
  initialData,
  onSuccess,
}: EditBookingModalProps) {
  const { dict } = useTranslation();
  const [guardsPerSlot, setGuardsPerSlot] = useState(initialData.guards_count || 1);
  const [startDate, setStartDate] = useState(initialData.start_date || "");
  const [endDate, setEndDate] = useState(initialData.end_date || "");
  const [description, setDescription] = useState(
    Array.isArray(initialData.special_instructions)
      ? initialData.special_instructions.join("\n")
      : initialData.special_instructions || ""
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData.day_per_week || []);
  const [timeSlots, setTimeSlots] = useState<string[]>(initialData.time_slots || []);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeSlotError, setTimeSlotError] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState(initialData.address || "");
  const [useAddressSelect, setUseAddressSelect] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGuardsPerSlot(initialData.guards_count || 1);
      setStartDate(initialData.start_date || "");
      setEndDate(initialData.end_date || "");
      setDescription(
        Array.isArray(initialData.special_instructions)
          ? initialData.special_instructions.join("\n")
          : initialData.special_instructions || ""
      );
      setSelectedDays(initialData.day_per_week || []);
      setTimeSlots(initialData.time_slots || []);
      setSpecificAddress(initialData.address || "");
      setStartTime("");
      setEndTime("");
      setTimeSlotError("");
      setErrors({});
      setIsSubmitting(false);
      setToastMessage(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen && useAddressSelect) {
      requestGetCities().then(res => {
        if (res.success) setCities(res.cities);
      }).catch(console.error);
    }
  }, [isOpen, useAddressSelect]);

  useEffect(() => {
    if (selectedCity) {
      requestGetWards(Number(selectedCity)).then(res => {
        if (res.success) setWards(res.wards);
      }).catch(console.error);
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedCity]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const formatTo24h = (timeStr: string): string => {
    if (!timeStr) return "";
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return timeStr;
    const hh = parts[0].padStart(2, "0");
    const mm = parts[1].padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleAddTimeSlot = () => {
    setTimeSlotError("");
    if (!startTime || !endTime) {
      setTimeSlotError(dict.booking.detail.edit_modal?.error_time_range || "Vui lòng chọn đầy đủ Giờ bắt đầu và Giờ kết thúc.");
      return;
    }
    const formattedStart = formatTo24h(startTime);
    const formattedEnd = formatTo24h(endTime);
    if (formattedStart >= formattedEnd) {
      setTimeSlotError(dict.booking.detail.edit_modal?.error_time_order || "Giờ bắt đầu phải nhỏ hơn giờ kết thúc trong ngày.");
      return;
    }
    const newSlot = `${formattedStart} - ${formattedEnd}`;
    if (timeSlots.includes(newSlot)) {
      setTimeSlotError(dict.booking.detail.edit_modal?.error_duplicate_slot || "Khung giờ này đã được thêm vào danh sách.");
      return;
    }
    setTimeSlots([...timeSlots, newSlot]);
    setStartTime("");
    setEndTime("");
  };

  const handleRemoveTimeSlot = (indexToRemove: number) => {
    setTimeSlots(timeSlots.filter((_, idx) => idx !== indexToRemove));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const finalAddress = useAddressSelect
      ? [specificAddress, wards.find(w => w.ward_id.toString() === selectedWard)?.ward_name, cities.find(c => c.city_id.toString() === selectedCity)?.city_name].filter(Boolean).join(", ")
      : specificAddress;

    if (!finalAddress.trim()) newErrors.address = dict.booking.detail.edit_modal?.error_address || "Vui lòng nhập địa chỉ triển khai.";
    if (!startDate) newErrors.startDate = dict.booking.detail.edit_modal?.error_start_date || "Vui lòng chọn ngày bắt đầu.";
    if (!endDate) newErrors.endDate = dict.booking.detail.edit_modal?.error_end_date || "Vui lòng chọn ngày kết thúc.";
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = dict.booking.detail.edit_modal?.error_invalid_dates || "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.";
    }
    if (guardsPerSlot < 1) newErrors.guardsPerSlot = dict.booking.detail.edit_modal?.error_guards_count || "Số lượng bảo vệ phải lớn hơn 0.";
    if (selectedDays.length === 0) newErrors.day_per_week = dict.booking.detail.edit_modal?.error_working_days || "Vui lòng chọn ít nhất một ngày làm việc trong tuần.";
    if (timeSlots.length === 0) newErrors.timeSlots = dict.booking.detail.edit_modal?.error_time_slots || "Vui lòng thêm ít nhất một khung giờ thực hiện.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const finalAddress = useAddressSelect
        ? [
            specificAddress,
            wards.find((w) => w.ward_id.toString() === selectedWard)?.ward_name,
            cities.find((c) => c.city_id.toString() === selectedCity)?.city_name,
          ]
            .filter(Boolean)
            .join(", ")
        : specificAddress;

      await requestUpdateBookingDetails(bookingId, {
        address: finalAddress,
        description: description || null,
        guards_per_slot: guardsPerSlot,
        time_slots: timeSlots,
        day_per_week: selectedDays,
        start_date: startDate,
        end_date: endDate,
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setToastMessage(err?.message || "Lỗi khi cập nhật yêu cầu dịch vụ.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 border-b border-outline-variant/40 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span>{dict.booking.detail.edit_modal?.title || "Chỉnh sửa Yêu cầu dịch vụ"}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Toast */}
        {toastMessage && (
          <div className="m-4 p-3 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              {dict.booking.detail.edit_modal?.address_label || "Địa chỉ triển khai"} <span className="text-error">*</span>
            </label>
            {!useAddressSelect ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={specificAddress}
                  onChange={(e) => setSpecificAddress(e.target.value)}
                  placeholder={dict.booking.detail.edit_modal?.address_placeholder || "Nhập địa chỉ chi tiết"}
                  className="w-full text-sm bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface focus:outline-hidden focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setUseAddressSelect(true)}
                  className="text-xs text-secondary font-semibold hover:underline"
                >
                  {dict.booking.detail.edit_modal?.select_address_link || "Chọn Tỉnh/Thành & Phường/Xã từ danh sách"}
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-surface-container-low/50 p-4 border border-outline-variant/50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      {dict.booking.detail.edit_modal?.city_label || "Tỉnh / Thành phố"}
                    </span>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full text-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-on-surface"
                    >
                      <option value="">{dict.booking.detail.edit_modal?.select_city || "-- Chọn Thành phố --"}</option>
                      {cities.map((c) => (
                        <option key={c.city_id} value={c.city_id}>
                          {c.city_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      {dict.booking.detail.edit_modal?.ward_label || "Quận / Phường / Xã"}
                    </span>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedCity}
                      className="w-full text-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-on-surface disabled:opacity-50"
                    >
                      <option value="">{dict.booking.detail.edit_modal?.select_ward || "-- Chọn Phường / Xã --"}</option>
                      {wards.map((w) => (
                        <option key={w.ward_id} value={w.ward_id}>
                          {w.ward_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  value={specificAddress}
                  onChange={(e) => setSpecificAddress(e.target.value)}
                  placeholder={dict.booking.detail.edit_modal?.specific_address_placeholder || "Số nhà, tên đường, tòa nhà..."}
                  className="w-full text-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-on-surface"
                />
                <button
                  type="button"
                  onClick={() => setUseAddressSelect(false)}
                  className="text-xs text-secondary font-semibold hover:underline"
                >
                  {dict.booking.detail.edit_modal?.direct_address_link || "Nhập địa chỉ trực tiếp"}
                </button>
              </div>
            )}
            {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
          </div>

          {/* Guards Count & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                {dict.booking.detail.edit_modal?.guards_count || "Số lượng bảo vệ"} <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={guardsPerSlot}
                onChange={(e) => setGuardsPerSlot(parseInt(e.target.value) || 1)}
                className="w-full text-sm bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface font-mono"
              />
              {errors.guardsPerSlot && <p className="text-xs text-error mt-1">{errors.guardsPerSlot}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                {dict.booking.detail.edit_modal?.start_date || "Ngày bắt đầu"} <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface font-mono"
              />
              {errors.startDate && <p className="text-xs text-error mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                {dict.booking.detail.edit_modal?.end_date || "Ngày kết thúc"} <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface font-mono"
              />
              {errors.endDate && <p className="text-xs text-error mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              {dict.booking.detail.edit_modal?.working_days || "Ngày làm việc trong tuần"} <span className="text-error">*</span>
            </label>
            <div className="flex gap-2 bg-surface-container-low p-2 border border-outline-variant/60 rounded-xl">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? "bg-secondary text-white shadow-xs"
                        : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {dict.booking.form.days_short[day.value as keyof typeof dict.booking.form.days_short] || day.label}
                  </button>
                );
              })}
            </div>
            {errors.day_per_week && <p className="text-xs text-error mt-1">{errors.day_per_week}</p>}
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              {dict.booking.detail.edit_modal?.time_slots || "Khung giờ thực hiện"} <span className="text-error">*</span>
            </label>
            <div className="bg-surface-container-low/50 border border-outline-variant/60 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">{dict.booking.detail.edit_modal?.time_from || "Từ:"}</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-xs bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-mono text-on-surface"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">{dict.booking.detail.edit_modal?.time_to || "Đến:"}</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-xs bg-surface-container-lowest border border-outline-variant rounded-lg p-2 font-mono text-on-surface"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  className="px-3 py-2 bg-secondary text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-secondary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {dict.booking.detail.edit_modal?.add_time_slot || "Thêm khung giờ"}
                </button>
              </div>
              {timeSlotError && <p className="text-xs text-error">{timeSlotError}</p>}

              {timeSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/30">
                  {timeSlots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold font-mono text-secondary"
                    >
                      <Clock className="w-3.5 h-3.5 text-outline-variant" />
                      {slot}
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(idx)}
                        className="text-error hover:text-error/80 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">{dict.booking.detail.edit_modal?.no_time_slots || "Chưa có khung giờ nào được chọn."}</p>
              )}
            </div>
            {errors.timeSlots && <p className="text-xs text-error mt-1">{errors.timeSlots}</p>}
          </div>

          {/* Description / Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              {dict.booking.detail.edit_modal?.special_instructions || "Yêu cầu đặc biệt / Ghi chú"}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.booking.detail.edit_modal?.special_instructions_placeholder || "Nhập yêu cầu bổ sung nếu có..."}
              className="w-full text-sm bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors"
            >
              {dict.booking.detail.edit_modal?.cancel || "Hủy"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (dict.booking.detail.edit_modal?.saving || "Đang lưu...") : (dict.booking.detail.edit_modal?.save || "Lưu thay đổi")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
