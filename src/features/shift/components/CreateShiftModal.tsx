"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
  X,
  SquarePen,
} from "lucide-react";

import type { GuardListItem } from "@/features/guards/type";
import { requestGetAllGuards } from "@/features/guards/api/guard.api";
import {
  requestCreateWorkShift,
  requestGetShiftContracts,
} from "../api/shift.api";
import type { ContractOption } from "../type";

type CreateShiftModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

const DEFAULT_WORK_DATE = "2026-06-14";
const DEFAULT_START_TIME = "06:00";
const DEFAULT_END_TIME = "10:00";
const DEFAULT_REQUIRED_GUARDS = "1";

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
};

const getGuardProfile = (profiles: GuardListItem["profiles"]) => {
  if (!profiles) {
    return null;
  }

  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
};

export function CreateShiftModal({
  open,
  onClose,
  onCreated,
}: CreateShiftModalProps) {
  const [contractId, setContractId] = useState("");
  const [shiftName, setShiftName] = useState("");
  const [location, setLocation] = useState("");
  const [workDate, setWorkDate] = useState(DEFAULT_WORK_DATE);
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  const [requiredGuardsInput, setRequiredGuardsInput] = useState(
    DEFAULT_REQUIRED_GUARDS,
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);

  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [guards, setGuards] = useState<GuardListItem[]>([]);

  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [isLoadingGuards, setIsLoadingGuards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const requiredGuards = Number(requiredGuardsInput) || 0;

  const selectedContract = useMemo(() => {
    return contracts.find((contract) => contract.contract_id === contractId);
  }, [contracts, contractId]);

  const formatDayPerWeek = (days?: string[] | null) => {
    if (!days || days.length === 0) {
      return "Chưa cập nhật";
    }

    return days.join(", ");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchContracts = async () => {
      try {
        setIsLoadingContracts(true);

        const response = await requestGetShiftContracts();

        setContracts(response.data ?? []);
      } catch (error) {
        console.log(error);
        setContracts([]);
      } finally {
        setIsLoadingContracts(false);
      }
    };

    fetchContracts();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchGuards = async () => {
      try {
        setIsLoadingGuards(true);

        const response = await requestGetAllGuards();

        setGuards(response.data ?? []);
      } catch (error) {
        console.log(error);
        setGuards([]);
      } finally {
        setIsLoadingGuards(false);
      }
    };

    fetchGuards();
  }, [open]);

  const filteredGuards = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return guards;
    }

    return guards.filter((guard) => {
      const profile = getGuardProfile(guard.profiles);

      return (
        profile?.full_name?.toLowerCase().includes(keyword) ||
        profile?.phone_number?.includes(keyword) ||
        profile?.email?.toLowerCase().includes(keyword)
      );
    });
  }, [guards, searchKeyword]);

  const resetForm = () => {
    setContractId("");
    setLocation("");
    setWorkDate(DEFAULT_WORK_DATE);
    setStartTime(DEFAULT_START_TIME);
    setEndTime(DEFAULT_END_TIME);
    setRequiredGuardsInput(DEFAULT_REQUIRED_GUARDS);
    setSearchKeyword("");
    setSelectedGuardIds([]);
    setSubmitError("");
    setSubmitSuccess("");
    setShiftName("");
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleSelectContract = (value: string) => {
    setContractId(value);
    setSubmitError("");
    setSubmitSuccess("");

    if (!value) {
      setLocation("");
      setWorkDate(DEFAULT_WORK_DATE);
      setRequiredGuardsInput(DEFAULT_REQUIRED_GUARDS);
      setSelectedGuardIds([]);
      return;
    }

    const contract = contracts.find((item) => item.contract_id === value);

    if (contract) {
      setLocation(contract.address);
      setWorkDate(contract.start_date);
      setRequiredGuardsInput(String(contract.guards_per_slot));
      setSelectedGuardIds((prev) => prev.slice(0, contract.guards_per_slot));
    }
  };

  const handleToggleGuard = (guard: GuardListItem) => {
    setSubmitError("");
    setSubmitSuccess("");

    const profile = getGuardProfile(guard.profiles);

    if (!profile?.user_id) {
      return;
    }

    const isSelected = selectedGuardIds.includes(profile.user_id);

    if (isSelected) {
      setSelectedGuardIds((prev) =>
        prev.filter((guardId) => guardId !== profile.user_id),
      );
      return;
    }

    if (selectedGuardIds.length >= requiredGuards) {
      return;
    }

    setSelectedGuardIds((prev) => [...prev, profile.user_id]);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      const payload = {
        contract_id: contractId,
        shift_name: shiftName.trim(),
        start_time: `${workDate}T${startTime}:00+07:00`,
        end_time:
          endTime <= startTime
            ? `${getNextDate(workDate)}T${endTime}:00+07:00`
            : `${workDate}T${endTime}:00+07:00`,
        required_guards: requiredGuards,
        location,
        guard_id: selectedGuardIds,
      };

      await requestCreateWorkShift(payload);

      setSubmitSuccess("Tạo ca trực thành công.");
      await onCreated?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tạo ca trực thất bại";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(
    contractId &&
    shiftName.trim() &&
    location.trim() &&
    workDate &&
    startTime &&
    endTime &&
    requiredGuards > 0 &&
    selectedGuardIds.length === requiredGuards,
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex h-[calc(100vh-32px)] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-700 text-white">
              <CalendarDays size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Tạo ca trực & Phân công bảo vệ
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tạo ca trực theo hợp đồng và phân công nhân sự phụ trách
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSubmitting}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[560px_1fr]">
          <div className="min-h-0 overflow-y-auto border-r border-slate-200 p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase text-blue-700">
              <FileText size={17} />
              <span>Thông tin ca trực</span>
            </div>

            <div className="space-y-5 pb-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Hợp đồng
                </label>

                <select
                  value={contractId}
                  onChange={(event) => handleSelectContract(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {isLoadingContracts
                      ? "Đang tải hợp đồng..."
                      : "Chọn hợp đồng"}
                  </option>

                  {contracts.map((contract) => (
                    <option
                      key={contract.contract_id}
                      value={contract.contract_id}
                    >
                      {contract.code} - {contract.address}
                    </option>
                  ))}
                </select>

                {!isLoadingContracts && contracts.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    Chưa có hợp đồng để tạo ca trực.
                  </p>
                )}
              </div>

              {selectedContract && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-blue-800">
                    Thông tin hợp đồng
                  </p>

                  <div className="space-y-2 text-sm text-slate-700">
                    <InfoRow
                      label="Khách hàng"
                      value={selectedContract.customer_name}
                    />

                    <InfoRow
                      label="Công ty"
                      value={selectedContract.company_name}
                    />

                    <InfoRow
                      label="Dịch vụ"
                      value={selectedContract.service_name}
                    />

                    <InfoRow
                      label="Địa điểm"
                      value={selectedContract.address}
                    />

                    <InfoRow
                      label="Mô tả yêu cầu"
                      value={selectedContract.description || "Không có mô tả"}
                    />

                    <InfoRow
                      label="Số bảo vệ cần"
                      value={`${selectedContract.guards_per_slot} bảo vệ`}
                    />

                    <InfoRow
                      label="Thời hạn"
                      value={`${formatDate(
                        selectedContract.start_date,
                      )} - ${formatDate(selectedContract.end_date)}`}
                    />
                    <InfoRow
                      label="Ngày trực trong tuần"
                      value={
                        selectedContract.day_per_week?.length
                          ? selectedContract.day_per_week.join(", ")
                          : "Chưa cập nhật"
                      }
                    />
                    <InfoRow
                      label="Ca trực trong ngày"
                      value={
                        selectedContract.time_slots?.length
                          ? selectedContract.time_slots.join(", ")
                          : "Chưa cập nhật"
                      }
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Vị trí trực cụ thể
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={location}
                    onChange={(event) => {
                      setLocation(event.target.value);
                      setSubmitError("");
                      setSubmitSuccess("");
                    }}
                    placeholder="Ví dụ: Sảnh chính tầng 1"
                    className="w-full rounded-md border border-slate-300 px-9 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tên ca trực
                </label>

                <div className="relative">
                  <SquarePen
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />{" "}
                  <input
                    value={shiftName}
                    onChange={(event) => {
                      setShiftName(event.target.value);
                      setSubmitError("");
                      setSubmitSuccess("");
                    }}
                    placeholder="Ví dụ: bảo vệ cửa hàng hoa"
                    className="w-full rounded-md border border-slate-300 px-9 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ngày trực
                </label>

                <input
                  type="date"
                  value={workDate}
                  onChange={(event) => {
                    setWorkDate(event.target.value);
                    setSubmitError("");
                    setSubmitSuccess("");
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Khung giờ trực
                </label>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase text-slate-400">
                      Bắt đầu
                    </p>

                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="time"
                        value={startTime}
                        onChange={(event) => {
                          setStartTime(event.target.value);
                          setSubmitError("");
                          setSubmitSuccess("");
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-9 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <span className="mt-6 text-slate-400">-</span>

                  <div>
                    <p className="mb-1 text-xs font-medium uppercase text-slate-400">
                      Kết thúc
                    </p>

                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="time"
                        value={endTime}
                        onChange={(event) => {
                          setEndTime(event.target.value);
                          setSubmitError("");
                          setSubmitSuccess("");
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-9 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {endTime <= startTime && (
                  <p className="mt-2 text-xs text-amber-600">
                    Ca trực kết thúc vào ngày hôm sau.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Số lượng bảo vệ cần
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={requiredGuardsInput}
                  readOnly
                  placeholder="Số lượng bảo vệ theo hợp đồng"
                  className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Số lượng bảo vệ được lấy theo hợp đồng, không thể chỉnh sửa.
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden p-6">
            <div className="shrink-0">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase text-blue-700">
                  <ShieldCheck size={17} />
                  <span>Phân công bảo vệ</span>
                </div>

                <p className="text-sm font-medium text-slate-600">
                  Đã chọn:{" "}
                  <span className="font-bold text-blue-700">
                    {selectedGuardIds.length}/{requiredGuards}
                  </span>{" "}
                  bảo vệ
                </p>
              </div>

              <div className="mb-4 flex gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="Tìm tên, SĐT, email..."
                    className="w-full rounded-md border border-slate-300 px-10 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {isLoadingGuards && (
                <div className="space-y-3">
                  {" "}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full rounded-md border border-slate-200 bg-white p-4"
                    >
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200" />{" "}
                        <div className="min-w-0 flex-1">
                          {" "}
                          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />{" "}
                          <div className="mt-3 h-3 w-64 animate-pulse rounded bg-slate-200" />{" "}
                        </div>{" "}
                        <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>
              )}

              {!isLoadingGuards && filteredGuards.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Không tìm thấy bảo vệ phù hợp.
                </p>
              )}

              {!isLoadingGuards &&
                filteredGuards.map((guard) => {
                  const profile = getGuardProfile(guard.profiles);
                  const profileUserId = profile?.user_id ?? "";

                  const isSelected = selectedGuardIds.includes(profileUserId);

                  const isDisabled =
                    !profileUserId ||
                    requiredGuards <= 0 ||
                    (!isSelected && selectedGuardIds.length >= requiredGuards);

                  return (
                    <button
                      key={guard.guard_id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleToggleGuard(guard)}
                      className={`w-full rounded-md border p-4 text-left transition ${
                        isSelected
                          ? "border-blue-700 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      } ${
                        isDisabled && !isSelected
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name ?? "Guard avatar"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound size={22} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {profile?.full_name ?? "Chưa cập nhật"}
                            </p>

                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                <CheckCircle2 size={12} />
                                Đã chọn
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {profile?.phone_number ?? "Chưa cập nhật"} ·{" "}
                            {profile?.email ?? "Chưa cập nhật"}
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border ${
                            isSelected
                              ? "border-blue-700 bg-blue-700"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          {submitSuccess && (
            <p className="text-right text-sm font-medium text-emerald-600">
              {submitSuccess}
            </p>
          )}

          {submitError && (
            <p className="text-right text-sm font-medium text-red-600">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="rounded-md cursor-pointer border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              className="rounded-md cursor-pointer bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Đang tạo..." : "Lưu & Tạo ca"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4">
      <span className="whitespace-nowrap text-slate-500">{label}:</span>

      <span className="text-right font-medium leading-5 text-slate-800">
        {value}
      </span>
    </div>
  );
}

function getNextDate(date: string) {
  const currentDate = new Date(`${date}T00:00:00`);
  currentDate.setDate(currentDate.getDate() + 1);

  return currentDate.toISOString().split("T")[0];
}
