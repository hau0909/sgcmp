"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Calendar, Clock, MapPin, Users, FileText, AlertCircle, Plus, Trash2 } from "lucide-react";
import { requestUpdateBookingDetails } from "../api/booking.api";

export interface EditBookingModalProps {
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
    special_instructions?: string | string[] | null;
  };
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: "Monday", label: "T2" },
  { value: "Tuesday", label: "T3" },
  { value: "Wednesday", label: "T4" },
  { value: "Thursday", label: "T5" },
  { value: "Friday", label: "T6" },
  { value: "Saturday", label: "T7" },
  { value: "Sunday", label: "CN" },
];

const PRESET_TIME_SLOTS = [
  "06:00 - 14:00",
  "14:00 - 22:00",
  "22:00 - 06:00",
];

export function EditBookingModal({
  isOpen,
  onClose,
  bookingId,
  initialData,
  onSuccess,
}: EditBookingModalProps) {
  const [address, setAddress] = useState("");
  const [guardsCount, setGuardsCount] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [customSlot, setCustomSlot] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setAddress(initialData.address || "");
      setGuardsCount(initialData.guards_count || 1);
      setStartDate(initialData.start_date || "");
      setEndDate(initialData.end_date || "");
      setDaysPerWeek(initialData.day_per_week || []);
      setTimeSlots(initialData.time_slots || []);

      let instructionsText = "";
      if (initialData.special_instructions) {
        if (Array.isArray(initialData.special_instructions)) {
          instructionsText = initialData.special_instructions.join("\n");
        } else {
          instructionsText = initialData.special_instructions;
        }
      }
      setSpecialInstructions(instructionsText);
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setDaysPerWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const togglePresetTimeSlot = (slot: string) => {
    setTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleAddCustomSlot = () => {
    const trimmed = customSlot.trim();
    if (trimmed && !timeSlots.includes(trimmed)) {
      setTimeSlots((prev) => [...prev, trimmed]);
      setCustomSlot("");
    }
  };

  const handleRemoveSlot = (index: number) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError("Vui lòng nhập địa chỉ công tác.");
      return;
    }
    if (guardsCount < 1) {
      setError("Số lượng bảo vệ phải ít nhất là 1.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    if (daysPerWeek.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày làm việc trong tuần.");
      return;
    }
    if (timeSlots.length === 0) {
      setError("Vui lòng chọn hoặc nhập ít nhất một ca làm việc.");
      return;
    }

    try {
      setIsLoading(true);
      await requestUpdateBookingDetails(bookingId, {
        address: address.trim(),
        guards_per_slot: guardsCount,
        start_date: startDate,
        end_date: endDate,
        day_per_week: daysPerWeek,
        time_slots: timeSlots,
        description: specialInstructions.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Cập nhật thất bại, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            Chỉnh sửa yêu cầu dịch vụ
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Địa chỉ triển khai
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ..."
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              required
            />
          </div>

          {/* Guards Count & Dates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Số lượng nhân sự / ca
              </label>
              <input
                type="number"
                min={1}
                value={guardsCount}
                onChange={(e) => setGuardsCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Days per week */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Ngày làm việc trong tuần
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = daysPerWeek.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              Ca làm việc
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_TIME_SLOTS.map((slot) => {
                const isSelected = timeSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => togglePresetTimeSlot(slot)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-secondary text-on-secondary border-secondary shadow-sm"
                        : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {/* Custom slots list & input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSlot}
                  onChange={(e) => setCustomSlot(e.target.value)}
                  placeholder="Khung giờ khác (vd: 08:00 - 17:00)..."
                  className="flex-1 px-3.5 py-2 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSlot}
                  className="px-3 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium rounded-xl border border-outline-variant flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm
                </button>
              </div>

              {timeSlots.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {timeSlots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container text-on-surface text-xs font-medium border border-outline-variant"
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Ghi chú / Yêu cầu đặc biệt
            </label>
            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Nhập các yêu cầu cụ thể khác nếu có..."
              className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold text-on-primary bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
