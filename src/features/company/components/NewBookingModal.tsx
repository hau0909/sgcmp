"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Calendar,
  Users,
  Clock,
  FileText,
  Plus,
  Minus,
  Check,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { CompanyServiceData } from "../types";
import { requestCreateBooking } from "@/features/booking/api/booking.api";
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

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  services: CompanyServiceData[];
}

export default function NewBookingModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  services,
}: NewBookingModalProps) {
  const { dict } = useTranslation();
  const [serviceId, setServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guardsPerSlot, setGuardsPerSlot] = useState(1);
  const [description, setDescription] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");

  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const [overlappingBookings, setOverlappingBookings] = useState<any[]>([]);

  // Day per week selection
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Time slots selection (User-added custom timeframes only)
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeSlotError, setTimeSlotError] = useState("");

  // Status & Feedback States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setServiceId("");
      setAddress("");
      setStartDate("");
      setEndDate("");
      setGuardsPerSlot(1);
      setDescription("");
      setSelectedDays([]);
      setTimeSlots([]);
      setStartTime("");
      setEndTime("");
      setTimeSlotError("");
      setErrors({});
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setToastMessage(null);

      setSelectedCity("");
      setSelectedWard("");
      setSpecificAddress("");
      setShowOverlapWarning(false);
      setOverlappingBookings([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      requestGetCities().then(res => {
        if (res.success) setCities(res.cities);
      }).catch(console.error);
    }
  }, [isOpen]);

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
    if (errors.day_per_week) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.day_per_week;
        return next;
      });
    }
  };

  const formatTo24h = (timeStr: string): string => {
    if (!timeStr) return "";

    // Split by colon to get hours and minutes
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return timeStr;

    let hoursStr = parts[0];
    let minutesStr = parts[1];

    // Check if there is AM/PM in minutes part
    let isPM = false;
    let isAM = false;
    if (minutesStr.toUpperCase().includes("PM")) {
      isPM = true;
      minutesStr = minutesStr.replace(/PM/i, "").trim();
    } else if (minutesStr.toUpperCase().includes("AM")) {
      isAM = true;
      minutesStr = minutesStr.replace(/AM/i, "").trim();
    }

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return timeStr;

    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    // Format to HH:MM
    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleAddTimeSlot = () => {
    if (!startTime || !endTime) {
      setTimeSlotError(dict.booking.form.errors.start_end_time);
      return;
    }
    const start24 = formatTo24h(startTime);
    const end24 = formatTo24h(endTime);

    const timeToMins = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const newStartMins = timeToMins(start24);
    const newEndMins = timeToMins(end24);

    if (newStartMins >= newEndMins) {
      setTimeSlotError(dict.booking.form.errors.start_before_end);
      return;
    }

    const hasOverlap = timeSlots.some(slot => {
      const [s, e] = slot.split(" - ");
      const existingStartMins = timeToMins(s);
      const existingEndMins = timeToMins(e);
      return Math.max(newStartMins, existingStartMins) < Math.min(newEndMins, existingEndMins);
    });

    if (hasOverlap) {
      setTimeSlotError(dict.booking.form.errors.overlap);
      return;
    }

    const cleanSlot = `${start24} - ${end24}`;

    if (timeSlots.includes(cleanSlot)) {
      setTimeSlotError("Khung giờ này đã được thêm");
      return;
    }

    setTimeSlots((prev) => [...prev, cleanSlot]);
    setStartTime("");
    setEndTime("");
    setTimeSlotError("");

    if (errors.time_slots) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.time_slots;
        return next;
      });
    }
  };

  const handleRemoveTimeSlot = (indexToRemove: number) => {
    setTimeSlots((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const todayStr = new Date().toISOString().split("T")[0];

    if (!serviceId) newErrors.serviceId = "Vui lòng chọn loại dịch vụ";
    if (!selectedCity) newErrors.selectedCity = "Vui lòng chọn Tỉnh/Thành phố";
    if (!selectedWard) newErrors.selectedWard = "Vui lòng chọn Quận/Huyện/Phường/Xã";
    if (!specificAddress.trim()) newErrors.specificAddress = "Vui lòng nhập địa chỉ cụ thể";

    if (!startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";

    if (startDate && startDate < todayStr) {
      newErrors.startDate = "Ngày bắt đầu phải là hôm nay hoặc trong tương lai";
    }
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = "Ngày kết thúc không được trước ngày bắt đầu";
    }

    if (guardsPerSlot < 1) {
      newErrors.guardsPerSlot = "Số bảo vệ tối thiểu phải là 1";
    }

    if (selectedDays.length === 0) {
      newErrors.day_per_week = "Vui lòng chọn ít nhất một ngày làm việc";
    } else if (startDate && endDate && (!newErrors.startDate && !newErrors.endDate)) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        const validDays = new Set<string>();
        for (let i = 0; i <= diffDays; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          validDays.add(dayName);
        }
        const invalidSelectedDays = selectedDays.filter(day => !validDays.has(day));
        if (invalidSelectedDays.length > 0) {
          const dayLabels = invalidSelectedDays.map(d => DAYS_OF_WEEK.find(x => x.value === d)?.label).join(", ");
          newErrors.day_per_week = `Các thứ đã chọn (${dayLabels}) không nằm trong khoảng ngày bắt đầu và kết thúc`;
        }
      }
    }

    if (timeSlots.length === 0) {
      newErrors.time_slots = "Vui lòng tự thêm ít nhất một khung giờ thực hiện";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent, forceCreate: boolean = false) => {
    if (e) e.preventDefault();
    if (!forceCreate && !validate()) return;

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const cityName = cities.find(c => c.city_id.toString() === selectedCity)?.city_name || "";
      const wardName = wards.find(w => w.ward_id.toString() === selectedWard)?.ward_name || "";
      const fullAddress = [specificAddress, wardName, cityName].filter(Boolean).join(", ");

      await requestCreateBooking({
        company_id: companyId,
        service_id: serviceId,
        address: fullAddress,
        description: description || null,
        guards_per_slot: guardsPerSlot,
        time_slots: timeSlots,
        day_per_week: selectedDays,
        start_date: startDate,
        end_date: endDate,
      }, forceCreate);

      setIsSubmitting(false);
      setShowOverlapWarning(false);
      setSubmitSuccess(true);
      setToastMessage(
        "Gửi yêu cầu đặt lịch dịch vụ thành công! Đang chờ đối tác báo giá."
      );

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      if (err.response?.status === 409 && err.response?.data?.overlapBookings) {
        setOverlappingBookings(err.response.data.overlapBookings);
        setShowOverlapWarning(true);
      } else {
        setToastMessage(err?.message || dict.booking.form.errors.submit_failed);
      }
    }
  };

  return (
    <>
      {/* Toast alert overlay */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-fade-in">
          <div className={`text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-3 border ${submitSuccess
            ? "bg-emerald-600 border-emerald-500"
            : "bg-error border-error/80"
            }`}>
            <div className="flex items-center gap-3">
              {submitSuccess ? (
                <CheckCircle className="w-6 h-6 shrink-0 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 shrink-0 text-white" />
              )}
              <div className="text-sm font-medium leading-normal">
                {toastMessage}
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 z-[60] flex justify-center items-center p-4 backdrop-blur-xs transition-opacity duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting && !submitSuccess) {
            onClose();
          }
        }}
      >
        {/* Modal Main container - max-w-[760px] */}
        <div className="bg-surface-container-lowest text-on-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30 shrink-0">
            <div>
              <h2 className="text-[20px] font-bold text-on-surface tracking-tight">
                {dict.booking.form.title}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                {dict.booking.form.partner}{" "}
                <span className="text-primary font-semibold">
                  {companyName}
                </span>
              </p>
            </div>
            {!isSubmitting && !submitSuccess && (
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form Content / Success Screen */}
          {submitSuccess ? (
            <div className="flex-1 px-8 py-16 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mt-2">
                {dict.booking.form.success_title}
              </h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                {dict.booking.form.success_desc}
              </p>
              <div className="mt-4 text-xs text-primary font-semibold flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                {dict.booking.form.auto_close}
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Scrollable inputs wrapper */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
                {/* Section 1: Thông tin dịch vụ & Vị trí */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      {dict.booking.form.section1_title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Service Selection */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <Briefcase className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.service_type} <span className="text-error">*</span>
                      </label>
                      <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-0.5">
                        {dict.booking.form.service_type_desc}
                      </p>
                      <div className="relative">
                        <select
                          value={serviceId}
                          onChange={(e) => {
                            setServiceId(e.target.value);
                            if (errors.serviceId)
                              setErrors((prev) => ({ ...prev, serviceId: "" }));
                          }}
                          className={`w-full bg-surface-bright border rounded-xl px-3 py-2 pr-10 text-sm text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer ${errors.serviceId
                            ? "border-error ring-1 ring-error"
                            : "border-outline-variant"
                            }`}
                        >
                          <option value="" disabled>
                            {dict.booking.form.service_placeholder}
                          </option>
                          {services.map((service, idx) => (
                            <option
                              key={idx}
                              value={service.serviceId || service.name}
                            >
                              {service.name} - ({dict.booking.form.price_from}{" "}
                              {service.price.toLocaleString(dict.booking.form.price_from === "Từ" ? "vi-VN" : "en-US")}{dict.booking.form.price_per_hour})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70" />
                      </div>
                      {errors.serviceId && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />{" "}
                          {errors.serviceId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.city} <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value);
                            if (errors.selectedCity)
                              setErrors((prev) => ({ ...prev, selectedCity: "" }));
                          }}
                          className={`w-full bg-surface-bright border rounded-xl px-3 py-2 text-sm text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer ${errors.selectedCity
                            ? "border-error ring-1 ring-error"
                            : "border-outline-variant"
                            }`}
                        >
                          <option value="" disabled>{dict.booking.form.city_placeholder}</option>
                          {cities.map((c) => (
                            <option key={c.city_id} value={c.city_id.toString()}>
                              {c.city_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70" />
                      </div>
                      {errors.selectedCity && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.selectedCity}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.ward} <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedWard}
                          onChange={(e) => {
                            setSelectedWard(e.target.value);
                            if (errors.selectedWard)
                              setErrors((prev) => ({ ...prev, selectedWard: "" }));
                          }}
                          disabled={!selectedCity || wards.length === 0}
                          className={`w-full bg-surface-bright border rounded-xl px-3 py-2 text-sm text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${errors.selectedWard
                            ? "border-error ring-1 ring-error"
                            : "border-outline-variant"
                            }`}
                        >
                          <option value="" disabled>{dict.booking.form.ward_placeholder}</option>
                          {wards.map((w) => (
                            <option key={w.ward_id} value={w.ward_id.toString()}>
                              {w.ward_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70" />
                      </div>
                      {errors.selectedWard && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.selectedWard}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.specific_address} <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={specificAddress}
                        onChange={(e) => {
                          setSpecificAddress(e.target.value);
                          if (errors.specificAddress)
                            setErrors((prev) => ({ ...prev, specificAddress: "" }));
                        }}
                        placeholder={dict.booking.form.specific_address_placeholder}
                        className={`w-full bg-surface-bright border rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.specificAddress
                          ? "border-error ring-1 ring-error"
                          : "border-outline-variant"
                          }`}
                      />
                      {errors.specificAddress && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.specificAddress}
                        </p>
                      )}
                    </div>


                  </div>
                </div>

                {/* Section 2: Kế hoạch & Lịch trình làm việc */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      {dict.booking.form.section2_title}
                    </h3>
                  </div>

                  {/* 3-Column Grid for Dates & Guards count */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    {/* Start Date */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.start_date} <span className="text-error">*</span>
                      </label>
                      <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-0.5">
                        {dict.booking.form.start_date_desc}
                      </p>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (errors.startDate)
                            setErrors((prev) => ({ ...prev, startDate: "" }));
                        }}
                        className={`w-full bg-surface-bright border rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.startDate
                          ? "border-error ring-1 ring-error"
                          : "border-outline-variant"
                          }`}
                      />
                      {errors.startDate && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{" "}
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.end_date} <span className="text-error">*</span>
                      </label>
                      <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-0.5">
                        {dict.booking.form.end_date_desc}
                      </p>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          if (errors.endDate)
                            setErrors((prev) => ({ ...prev, endDate: "" }));
                        }}
                        className={`w-full bg-surface-bright border rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.endDate
                          ? "border-error ring-1 ring-error"
                          : "border-outline-variant"
                          }`}
                      />
                      {errors.endDate && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{" "}
                          {errors.endDate}
                        </p>
                      )}
                    </div>

                    {/* Guards Count Counter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.guards_per_slot} <span className="text-error">*</span>
                      </label>
                      <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-0.5">
                        {dict.booking.form.guards_per_slot_desc}
                      </p>
                      <div className="flex items-center w-full border border-outline-variant bg-surface-bright rounded-xl p-1 justify-between shadow-2xs h-[38px]">
                        <button
                          type="button"
                          disabled={guardsPerSlot <= 1}
                          onClick={() =>
                            setGuardsPerSlot((p) => Math.max(1, p - 1))
                          }
                          className="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-surface-container-low transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-on-surface flex-1 text-center">
                          {guardsPerSlot} {dict.booking.form.guards_count}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuardsPerSlot((p) => p + 1)}
                          className="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {errors.guardsPerSlot && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />{" "}
                          {errors.guardsPerSlot}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Days of the week selection - Full Width */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.days_of_week} <span className="text-error">*</span>
                    </label>
                    <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-1.5">
                      {dict.booking.form.days_of_week_desc}
                    </p>
                    <div className="flex justify-between gap-1.5 bg-surface-container-low/40 p-1.5 border border-outline-variant/60 rounded-xl">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayValue) => {
                        const isSelected = selectedDays.includes(dayValue);
                        return (
                          <button
                            key={dayValue}
                            type="button"
                            onClick={() => toggleDay(dayValue)}
                            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isSelected
                              ? "bg-primary text-on-primary shadow-xs animate-fade-in"
                              : "hover:bg-surface-container-high text-on-surface-variant"
                              }`}
                          >
                            {dict.booking.form.days_short[dayValue as keyof typeof dict.booking.form.days_short]}
                          </button>
                        );
                      })}
                    </div>
                    {errors.day_per_week && (
                      <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />{" "}
                        {errors.day_per_week}
                      </p>
                    )}
                  </div>

                  {/* Implementation Time slots - Full Width */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.time_slots} <span className="text-error">*</span>
                    </label>
                    <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-1.5">
                      {dict.booking.form.time_slots_desc}
                    </p>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                              {dict.booking.form.from}
                            </span>
                            <div className="flex items-center gap-1.5 border border-outline-variant rounded-xl px-3 py-1.5 bg-surface-bright focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all h-[38px]">
                              <Clock className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => {
                                  setStartTime(e.target.value);
                                  if (timeSlotError) setTimeSlotError("");
                                }}
                                className="w-full bg-transparent text-sm focus:outline-none border-none cursor-pointer"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                              {dict.booking.form.to}
                            </span>
                            <div className="flex items-center gap-1.5 border border-outline-variant rounded-xl px-3 py-1.5 bg-surface-bright focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all h-[38px]">
                              <Clock className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => {
                                  setEndTime(e.target.value);
                                  if (timeSlotError) setTimeSlotError("");
                                }}
                                className="w-full bg-transparent text-sm focus:outline-none border-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTimeSlot}
                          className="h-[38px] px-5 bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-98"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {dict.booking.form.add_time_slot}
                        </button>
                      </div>

                      {timeSlotError && (
                        <p className="text-[11px] text-error font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />{" "}
                          {timeSlotError}
                        </p>
                      )}

                      {/* Display Added Time Slots list */}
                      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 mt-1">
                        {timeSlots.length === 0 ? (
                          <div className="text-center py-4 border border-dashed border-outline-variant/50 rounded-xl text-xs text-on-surface-variant/50 font-medium bg-surface-container-low/20">
                            {dict.booking.form.no_time_slots}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {timeSlots.map((slot, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 border border-primary bg-primary/5 text-primary rounded-xl text-xs font-semibold animate-fade-in group hover:bg-primary/10 transition-all duration-150"
                              >
                                <span>{slot}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTimeSlot(index)}
                                  className="text-primary/70 hover:text-error hover:bg-error/10 rounded-lg p-0.5 transition-all cursor-pointer shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {errors.time_slots && (
                      <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />{" "}
                        {errors.time_slots}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section 3: Yêu cầu nghiệp vụ chi tiết */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      {dict.booking.form.section3_title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-primary" /> {dict.booking.form.description}
                    </label>
                    <p className="text-[10px] text-on-surface-variant/70 leading-normal mb-1.5">
                      {dict.booking.form.description_desc}
                    </p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={dict.booking.form.description_placeholder}
                      rows={3.5}
                      className="w-full bg-surface-bright border border-outline-variant rounded-xl p-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions (sticky, inside the form so type="submit" behaves natively) */}
              <div className="px-6 py-4.5 border-t border-outline-variant bg-surface-container-low/30 flex justify-end gap-3 items-center shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-low rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  {dict.booking.form.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || showOverlapWarning}
                  className="px-5 py-2.5 bg-primary text-on-primary hover:bg-primary/90 font-bold rounded-xl shadow-xs text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:bg-primary/60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {dict.booking.form.submitting}
                    </>
                  ) : (
                    dict.booking.form.submit
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Overlap Warning Overlay */}
          {showOverlapWarning && (
            <div className="absolute inset-0 bg-surface-container-lowest/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-surface-bright border border-error/50 rounded-2xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{dict.booking.form.warning_title}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {dict.booking.form.warning_desc}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-3 max-h-[150px] overflow-y-auto">
                  <p className="text-xs font-semibold text-on-surface mb-2">{dict.booking.form.overlapping_schedules}</p>
                  <div className="flex flex-col gap-2">
                    {overlappingBookings.map((b, idx) => {
                      const srvName = Array.isArray(b.services) ? b.services[0]?.name : b.services?.name;
                      const vnDays = b.day_per_week?.map((d: string) => dict.booking.form.days[d as keyof typeof dict.booking.form.days] || d).join(", ");
                      
                      return (
                        <div key={idx} className="text-xs text-on-surface-variant bg-surface-bright p-2 rounded-lg border border-outline-variant/50">
                          <span className="font-semibold">{b.start_date} - {b.end_date}</span>
                          {srvName && <div className="mt-1 font-medium text-primary">{dict.booking.form.service} {srvName}</div>}
                          <div className="mt-1">{dict.booking.form.time_slot_label} {b.time_slots?.join(", ")}</div>
                          <div className="mt-1">{dict.booking.form.day_label} {vnDays}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-sm font-medium text-on-surface mt-2 text-center">
                  {dict.booking.form.confirm_question}
                </p>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowOverlapWarning(false)}
                    className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-low rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {dict.booking.form.cancel_edit}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="px-4 py-2 bg-error text-white hover:bg-error/90 font-bold rounded-xl shadow-xs text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    {dict.booking.form.confirm_create}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
