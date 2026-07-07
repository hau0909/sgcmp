"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Edit, Mail, Phone, User, UserRound, X } from "lucide-react";

import { requestGetGuardDetail, requestUploadGuardFile, requestUpdateGuardProfile } from "@/features/guards/api/guard.api";
import type { GuardDetail, GuardDetailProfile, gender } from "@/features/guards/type";

const getProfile = (
  profiles: GuardDetail["profiles"],
): GuardDetailProfile | null => {
  if (!profiles) {
    return null;
  }

  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) {
    return "Chưa cập nhật";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("vi-VN").format(parsedDate);
};

const formatGender = (gender: string | null | undefined): string => {
  if (!gender) {
    return "Chưa cập nhật";
  }

  const normalizedGender = gender.trim().toLowerCase();

  if (normalizedGender === "male") {
    return "Nam";
  }

  if (normalizedGender === "female") {
    return "Nữ";
  }

  return gender;
};

export default function GuardDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();

  const guardId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [guard, setGuard] = useState<GuardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "male" as gender,
    identity_id: "",
    identity_issue_date: "",
    identity_issue_place: "",
    address: "",
    phone_number: "",
    email: "",
  });

  const fetchGuardDetail = async (silent = false) => {
    if (!guardId) {
      setErrorMessage("Không tìm thấy bảo vệ");
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setErrorMessage("");

      const result = await requestGetGuardDetail(guardId);

      if (!result.success || !result.data) {
        throw new Error(result.message);
      }

      setGuard(result.data);
    } catch (error: unknown) {
      setGuard(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin bảo vệ",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGuardDetail();
  }, [guardId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (guard) {
      const p = getProfile(guard.profiles);
      const iden = guard.identity;
      setFormData({
        full_name: p?.full_name ?? "",
        date_of_birth: p?.date_of_birth ?? "",
        gender: (p?.gender?.trim().toLowerCase() === "female" ? "female" : "male") as gender,
        identity_id: iden?.identity_id ?? "",
        identity_issue_date: iden?.issue_date ?? "",
        identity_issue_place: iden?.issue_place ?? "",
        address: p?.address ?? "",
        phone_number: p?.phone_number ?? "",
        email: p?.email ?? "",
      });
      setAvatarPreview(p?.avatar_url ?? null);
      setCccdFrontPreview(iden?.front_url ?? null);
      setCccdBackPreview(iden?.back_url ?? null);
      setAvatarFile(null);
      setCccdFrontFile(null);
      setCccdBackFile(null);
    }
  }, [guard]);

  const handleCancel = () => {
    if (guard) {
      const p = getProfile(guard.profiles);
      const iden = guard.identity;
      setFormData({
        full_name: p?.full_name ?? "",
        date_of_birth: p?.date_of_birth ?? "",
        gender: (p?.gender?.trim().toLowerCase() === "female" ? "female" : "male") as gender,
        identity_id: iden?.identity_id ?? "",
        identity_issue_date: iden?.issue_date ?? "",
        identity_issue_place: iden?.issue_place ?? "",
        address: p?.address ?? "",
        phone_number: p?.phone_number ?? "",
        email: p?.email ?? "",
      });
      setAvatarPreview(p?.avatar_url ?? null);
      setCccdFrontPreview(iden?.front_url ?? null);
      setCccdBackPreview(iden?.back_url ?? null);
    }
    setAvatarFile(null);
    setCccdFrontFile(null);
    setCccdBackFile(null);
    setFieldErrors({});
    setEditError("");
    setIsEditing(false);
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      nextErrors.full_name = "Vui lòng nhập họ và tên.";
    } else {
      const name = formData.full_name;
      const nameRegex = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;

      if (name.startsWith(" ") || name.endsWith(" ")) {
        nextErrors.full_name = "Họ và tên không được chứa khoảng trắng ở đầu hoặc cuối.";
      } else if (/\s{2,}/.test(name)) {
        nextErrors.full_name = "Họ và tên không được chứa nhiều khoảng trắng liên tiếp.";
      } else if (!nameRegex.test(name)) {
        nextErrors.full_name = "Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ.";
      }
    }

    if (!formData.date_of_birth) {
      nextErrors.date_of_birth = "Vui lòng chọn ngày sinh.";
    } else {
      const dobDate = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dobDate.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        nextErrors.date_of_birth = "Ngày sinh không được ở tương lai.";
      } else {
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }

        if (age < 18) {
          nextErrors.date_of_birth = "Nhân viên bảo vệ phải từ 18 tuổi trở lên.";
        }
      }
    }

    if (!formData.identity_id.trim()) {
      nextErrors.identity_id = "Vui lòng nhập số CCCD/CMND.";
    } else if (!/^(\d{9}|\d{12})$/.test(formData.identity_id.trim())) {
      nextErrors.identity_id = "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
    }

    if (!formData.identity_issue_date) {
      nextErrors.identity_issue_date = "Vui lòng chọn ngày cấp CCCD/CMND.";
    } else {
      const issueDate = new Date(formData.identity_issue_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      issueDate.setHours(0, 0, 0, 0);
      if (issueDate > today) {
        nextErrors.identity_issue_date = "Ngày cấp CCCD/CMND không được ở tương lai.";
      }
    }

    if (!formData.identity_issue_place.trim()) {
      nextErrors.identity_issue_place = "Vui lòng nhập nơi cấp CCCD/CMND.";
    } else {
      const issuePlaceRegex = /^[\p{L}\p{M}0-9\s]+$/u;
      if (!issuePlaceRegex.test(formData.identity_issue_place.trim())) {
        nextErrors.identity_issue_place = "Nơi cấp không được chứa ký tự đặc biệt.";
      }
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ thường trú.";
    } else {
      const addressRegex = /^[\p{L}\p{M}0-9\s,\/.-]+$/u;
      if (!addressRegex.test(formData.address.trim())) {
        nextErrors.address = "Địa chỉ không được chứa ký tự đặc biệt.";
      }
    }

    if (!formData.phone_number.trim()) {
      nextErrors.phone_number = "Vui lòng nhập số điện thoại.";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone_number.trim())) {
      nextErrors.phone_number = "Số điện thoại không hợp lệ.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email không hợp lệ.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setEditError("Vui lòng kiểm tra lại các thông tin chưa hợp lệ.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      if (!guard?.user_id) {
        throw new Error("Không tìm thấy thông tin tài khoản bảo vệ.");
      }

      let currentAvatarUrl = avatarPreview;
      let currentFrontUrl = cccdFrontPreview;
      let currentBackUrl = cccdBackPreview;

      // 1. Upload avatar if selected
      if (avatarFile) {
        const res = await requestUploadGuardFile(
          avatarFile,
          guard.user_id,
          "avatar",
        );
        if (res.success && res.data) {
          currentAvatarUrl = res.data.public_url;
        } else {
          throw new Error(res.message || "Không thể tải ảnh đại diện lên");
        }
      }

      // 2. Upload CCCD Front if selected
      if (cccdFrontFile) {
        const res = await requestUploadGuardFile(
          cccdFrontFile,
          guard.user_id,
          "cccd_front",
        );
        if (res.success && res.data) {
          currentFrontUrl = res.data.public_url;
        } else {
          throw new Error(res.message || "Không thể tải ảnh mặt trước CCCD lên");
        }
      }

      // 3. Upload CCCD Back if selected
      if (cccdBackFile) {
        const res = await requestUploadGuardFile(
          cccdBackFile,
          guard.user_id,
          "cccd_back",
        );
        if (res.success && res.data) {
          currentBackUrl = res.data.public_url;
        } else {
          throw new Error(res.message || "Không thể tải ảnh mặt sau CCCD lên");
        }
      }

      // 4. Save details
      const res = await requestUpdateGuardProfile(guardId, {
        user_id: guard?.user_id,
        ...formData,
        avatar_url: currentAvatarUrl,
        front_url: currentFrontUrl,
        back_url: currentBackUrl,
      });

      if (!res.success) {
        throw new Error(res.message || "Không thể cập nhật hồ sơ");
      }

      setIsEditing(false);
      setToastMessage("Cập nhật thông tin bảo vệ thành công.");
      await fetchGuardDetail(true);
    } catch (error: unknown) {
      setEditError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi lưu hồ sơ",
      );
    } finally {
      setSaving(false);
    }
  };

  const profile = useMemo(() => {
    return guard ? getProfile(guard.profiles) : null;
  }, [guard]);

  const identity = guard?.identity ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="rounded-md border border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            Đang tải thông tin bảo vệ...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !guard) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="rounded-md border border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-red-600">
            {errorMessage || "Không tìm thấy hồ sơ bảo vệ"}
          </p>
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name ?? "Chưa cập nhật";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {isEditing ? (
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-16 w-16 cursor-pointer group rounded-md overflow-hidden border border-slate-300 shadow-sm"
              title="Click để chọn ảnh đại diện mới"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`Ảnh đại diện preview`}
                  className="h-full w-full object-cover transition group-hover:brightness-50"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500 transition group-hover:bg-slate-300">
                  <UserRound className="h-7 w-7" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 text-white">
                <Edit className="h-4 w-4" />
              </div>
            </div>
          ) : profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={`Ảnh của ${fullName}`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-md border border-slate-300 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-slate-300 bg-slate-200 text-slate-500">
              <UserRound className="h-7 w-7" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-950">
                {fullName}
              </h1>

              {profile?.status === "active" ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  HOẠT ĐỘNG
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  VÔ HIỆU HÓA
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-medium text-slate-600">
              Thông tin chi tiết nhân viên bảo vệ
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded bg-blue-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      {editError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{editError}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <User className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Thông tin cá nhân
              </h2>
            </div>

            <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.full_name
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                    {fieldErrors.full_name && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.date_of_birth
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.date_of_birth && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.date_of_birth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Giới tính
                    </label>
                    <select
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as gender,
                        })
                      }
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      CCCD/CMND <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.identity_id
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.identity_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity_id: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.identity_id && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.identity_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Ngày cấp
                    </label>
                    <input
                      type="date"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.identity_issue_date
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.identity_issue_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity_issue_date: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.identity_issue_date && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.identity_issue_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Nơi cấp
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.identity_issue_place
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.identity_issue_place}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity_issue_place: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.identity_issue_place && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.identity_issue_place}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Địa chỉ thường trú
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.address
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                    {fieldErrors.address && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <InfoItem label="Họ và tên" value={fullName} />

                  <InfoItem
                    label="Ngày sinh"
                    value={formatDate(profile?.date_of_birth)}
                  />

                  <InfoItem
                    label="Giới tính"
                    value={formatGender(profile?.gender)}
                  />

                  <InfoItem
                    label="CCCD/CMND"
                    value={identity?.identity_id ?? "Chưa cập nhật"}
                  />

                  <InfoItem
                    label="Ngày cấp"
                    value={formatDate(identity?.issue_date)}
                  />

                  <InfoItem
                    label="Nơi cấp"
                    value={identity?.issue_place ?? "Chưa cập nhật"}
                  />

                  <div className="md:col-span-2">
                    <InfoItem
                      label="Địa chỉ thường trú"
                      value={profile?.address ?? "Chưa cập nhật"}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <User className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Hình ảnh CCCD/CMND
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <CccdPreviewBox
                label="Mặt trước CCCD/CMND"
                imageUrl={isEditing ? cccdFrontPreview : identity?.front_url}
                isEditing={isEditing}
                onClick={() => cccdFrontInputRef.current?.click()}
              />

              <CccdPreviewBox
                label="Mặt sau CCCD/CMND"
                imageUrl={isEditing ? cccdBackPreview : identity?.back_url}
                isEditing={isEditing}
                onClick={() => cccdBackInputRef.current?.click()}
              />
            </div>

            {/* Hidden File Inputs for Editing */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
                  const MAXIMUM_IMAGE_SIZE = 2 * 1024 * 1024;
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    setEditError("Ảnh đại diện chỉ hỗ trợ định dạng JPG hoặc PNG.");
                    e.target.value = "";
                    return;
                  }
                  if (file.size > MAXIMUM_IMAGE_SIZE) {
                    setEditError("Kích thước ảnh đại diện không được vượt quá 2MB.");
                    e.target.value = "";
                    return;
                  }
                  setEditError("");
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={cccdFrontInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    setEditError("Ảnh mặt trước CCCD chỉ hỗ trợ định dạng JPG hoặc PNG.");
                    e.target.value = "";
                    return;
                  }
                  setEditError("");
                  setCccdFrontFile(file);
                  setCccdFrontPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={cccdBackInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    setEditError("Ảnh mặt sau CCCD chỉ hỗ trợ định dạng JPG hoặc PNG.");
                    e.target.value = "";
                    return;
                  }
                  setEditError("");
                  setCccdBackFile(file);
                  setCccdBackPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <Mail className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Thông tin liên hệ
              </h2>
            </div>

            <div className="space-y-5">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.phone_number
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.phone_number && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.phone_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-slate-500" />

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Số điện thoại
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {profile?.phone_number ?? "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">Email</p>

                      <p className="mt-1 break-all text-sm font-bold text-slate-950">
                        {profile?.email ?? "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );

}
function CccdPreviewBox({
  label,
  imageUrl,
  isEditing,
  onClick,
}: {
  label: string;
  imageUrl?: string | null;
  isEditing?: boolean;
  onClick?: () => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>

      {imageUrl ? (
        <div
          onClick={isEditing ? onClick : undefined}
          className={`relative aspect-[16/10] overflow-hidden rounded-md border border-slate-300 ${isEditing ? "cursor-pointer group" : ""
            }`}
          title={isEditing ? "Click để chọn ảnh mới" : undefined}
        >
          <img
            src={imageUrl}
            alt={label}
            className={`h-full w-full object-cover ${isEditing ? "transition group-hover:brightness-50" : ""
              }`}
          />
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/45 text-white">
              <Edit className="h-6 w-6" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={isEditing ? onClick : undefined}
          className={`flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-100 ${isEditing ? "cursor-pointer hover:bg-slate-200 transition group" : ""
            }`}
          title={isEditing ? "Click để chọn ảnh mới" : undefined}
        >
          <div className="text-center">
            <User
              className={`mx-auto h-8 w-8 text-slate-400 ${isEditing ? "group-hover:text-blue-500 transition" : ""
                }`}
            />

            <p
              className={`mt-2 text-sm font-medium text-slate-500 ${isEditing ? "group-hover:text-blue-600 transition" : ""
                }`}
            >
              Chưa có hình ảnh
            </p>
            {isEditing && (
              <p className="mt-1 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                Tải ảnh lên
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
