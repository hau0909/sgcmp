"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import type { ContractOption, GuardOption } from "../type";
import {
  mockContractOptions,
  mockGuardOptions,
} from "../data/create-shift.mock";

type CreateShiftModalProps = {
  open: boolean;
  onClose: () => void;
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
};

export function CreateShiftModal({ open, onClose }: CreateShiftModalProps) {
  const [contractId, setContractId] = useState("");
  const [location, setLocation] = useState("");
  const [workDate, setWorkDate] = useState("2026-06-14");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("10:00");
  const [requiredGuardsInput, setRequiredGuardsInput] = useState("1");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);

  const requiredGuards = Number(requiredGuardsInput) || 0;

  const selectedContract = useMemo(() => {
    return mockContractOptions.find(
      (contract) => contract.contract_id === contractId,
    );
  }, [contractId]);

  const filteredGuards = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return mockGuardOptions;
    }

    return mockGuardOptions.filter((guard) => {
      return (
        guard.full_name.toLowerCase().includes(keyword) ||
        guard.guard_code.toLowerCase().includes(keyword) ||
        guard.phone_number.includes(keyword) ||
        guard.email.toLowerCase().includes(keyword)
      );
    });
  }, [searchKeyword]);

  const handleSelectContract = (value: string) => {
    setContractId(value);

    const contract = mockContractOptions.find(
      (item) => item.contract_id === value,
    );

    if (contract) {
      setLocation(contract.address);
    }
  };

  const handleToggleGuard = (guard: GuardOption) => {
    if (guard.status !== "active") {
      return;
    }

    const isSelected = selectedGuardIds.includes(guard.guard_id);

    if (isSelected) {
      setSelectedGuardIds((prev) =>
        prev.filter((guardId) => guardId !== guard.guard_id),
      );
      return;
    }

    if (selectedGuardIds.length >= requiredGuards) {
      return;
    }

    setSelectedGuardIds((prev) => [...prev, guard.guard_id]);
  };

  const handleChangeRequiredGuards = (value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    setRequiredGuardsInput(value);

    const nextValue = Number(value);

    if (!nextValue) {
      setSelectedGuardIds([]);
      return;
    }

    setSelectedGuardIds((prev) => prev.slice(0, nextValue));
  };

  const handleSubmit = () => {
    const payload = {
      contract_id: contractId,
      shift_name: "Ca trực",
      start_time: `${workDate}T${startTime}:00+07:00`,
      end_time:
        endTime <= startTime
          ? `${getNextDate(workDate)}T${endTime}:00+07:00`
          : `${workDate}T${endTime}:00+07:00`,
      required_guards: requiredGuards,
      location,
      guard_ids: selectedGuardIds,
    };

    console.log("Create shift payload:", payload);
    onClose();
  };

  const canSubmit =
    contractId &&
    location.trim() &&
    workDate &&
    startTime &&
    endTime &&
    requiredGuards > 0 &&
    selectedGuardIds.length === requiredGuards;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex h-[calc(100vh-32px)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
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
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[430px_1fr]">
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
                  <option value="">Chọn hợp đồng</option>

                  {mockContractOptions.map((contract) => (
                    <option
                      key={contract.contract_id}
                      value={contract.contract_id}
                    >
                      {contract.code} - {contract.address}
                    </option>
                  ))}
                </select>
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
                      label="Thời hạn"
                      value={`${formatDate(
                        selectedContract.start_date,
                      )} - ${formatDate(selectedContract.end_date)}`}
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
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Ví dụ: Sảnh chính tầng 1"
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
                  onChange={(event) => setWorkDate(event.target.value)}
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
                        onChange={(event) => setStartTime(event.target.value)}
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
                        onChange={(event) => setEndTime(event.target.value)}
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
                  onChange={(event) =>
                    handleChangeRequiredGuards(event.target.value)
                  }
                  placeholder="Nhập số lượng bảo vệ"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                {requiredGuardsInput === "" && (
                  <p className="mt-2 text-xs text-red-500">
                    Vui lòng nhập số lượng bảo vệ.
                  </p>
                )}

                {requiredGuardsInput !== "" && requiredGuards <= 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    Số lượng bảo vệ phải lớn hơn 0.
                  </p>
                )}
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
                    placeholder="Tìm tên, mã bảo vệ, SĐT, email..."
                    className="w-full rounded-md border border-slate-300 px-10 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {filteredGuards.map((guard) => {
                const isSelected = selectedGuardIds.includes(guard.guard_id);
                const isDisabled =
                  guard.status !== "active" ||
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserRound size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {guard.full_name}
                          </p>

                          <span className="text-xs text-slate-500">
                            {guard.guard_code}
                          </span>

                          {isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              <CheckCircle2 size={12} />
                              Đã chọn
                            </span>
                          )}

                          {guard.status !== "active" && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Không hoạt động
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {guard.phone_number} · {guard.email}
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

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Lưu & Tạo ca
          </button>
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
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}:</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

function getNextDate(date: string) {
  const currentDate = new Date(`${date}T00:00:00`);
  currentDate.setDate(currentDate.getDate() + 1);

  return currentDate.toISOString().split("T")[0];
}
