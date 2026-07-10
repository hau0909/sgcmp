"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Shield,
  Briefcase,
  CreditCard,
  Image as ImageIcon
} from "lucide-react";
import { requestGetCoordinatorDetail } from "../api/coordinator.api";

// Reusable SectionCard from AddForm style
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-primary w-4 h-4 flex items-center justify-center">{icon}</span>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Display widget for Field Values from AddForm style
function FieldDisplay({ label, value }: { label: string, value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 h-full">
      <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</span>
      <div className="flex-1 w-full px-3 py-2 min-h-[38px] bg-surface-container-low/30 border border-outline-variant/50 rounded-lg text-sm font-medium text-on-surface flex items-center">
        {value || <span className="text-on-surface-variant/50 italic">Đang cập nhật</span>}
      </div>
    </div>
  );
}

export default function CoordinatorDetail({ coordinatorId }: { coordinatorId: string }) {
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await requestGetCoordinatorDetail(coordinatorId);
        setData(response);
      } catch (err: any) {
        setError(err?.message || "Lỗi khi lấy thông tin điều phối viên.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [coordinatorId]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
        <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex flex-col items-center justify-center py-12">
          <p className="font-semibold text-lg">{error || "Không tìm thấy Điều phối viên"}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface text-on-surface shadow-sm border border-outline-variant hover:bg-surface-container rounded-lg">Quay lại</button>
        </div>
      </div>
    );
  }

  const profile = data?.profiles || {};
  const identity = data?.identity || {};

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hoạt động':
      case 'active':
        return { text: 'Hoạt động', bg: 'bg-[#bbf7d0]', color: 'text-[#166534]' };
      case 'tạm khóa':
      case 'locked':
        return { text: 'Tạm khóa', bg: 'bg-[#fef08a]', color: 'text-[#854d0e]' };
      default:
        return { text: 'Vô hiệu hóa', bg: 'bg-[#fecaca]', color: 'text-[#991b1b]' };
    }
  };
  const status = getStatusConfig(profile.status);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6 animate-fade-in">
      {/* Page header (Đồng bộ layout với Add form) */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4 mt-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors w-fit mb-1 cursor-pointer"
        >
          <ArrowLeft className="w-[15px] h-[15px]" />
          Quay lại danh sách
        </button>
        
        <div className="flex items-center justify-between mt-1">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
              Chi tiết Điều phối viên
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              Xem toàn bộ thông tin hồ sơ của điều phối viên.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid (3 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="border border-outline-variant rounded-2xl bg-surface-container-lowest p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col relative">
            
            {/* Avatar & Name */}
            <div className="flex flex-col items-center mt-2">
              <div className="w-24 h-24 rounded-full border-[3px] border-surface-container flex items-center justify-center overflow-hidden bg-primary/10 text-primary text-4xl font-bold mb-4 shadow-sm ring-1 ring-outline-variant/30">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              
              <h2 className="text-xl font-bold text-on-surface text-center mb-1.5">
                {profile.full_name}
              </h2>
              
              {/* Status Inline */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${status.bg} ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-outline-variant/40 mb-6" />

            {/* Quick Contact Block */}
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/40">
                <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-sm">
                  <Phone className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Số điện thoại</span>
                  <span className="text-sm font-semibold font-mono text-primary">{profile.phone_number || "---"}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/40">
                <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-sm">
                  <Mail className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Email</span>
                  <span className="text-sm font-medium break-all text-on-surface">{profile.email || "---"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections (SectionCard style) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thông tin cá nhân */}
          <SectionCard icon={<User />} title="Thông tin cá nhân">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldDisplay 
                label="Giới tính" 
                value={
                  profile.gender?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "nam" ? "Nam" : 
                  profile.gender?.toLowerCase() === "female" || profile.gender?.toLowerCase() === "nữ" ? "Nữ" : 
                  profile.gender || "---"
                } 
              />
              <FieldDisplay label="Ngày sinh" value={profile.date_of_birth} />
              <div className="sm:col-span-2">
                <FieldDisplay label="Địa chỉ liên hệ" value={profile.address} />
              </div>
            </div>
          </SectionCard>

          {/* Thông tin định danh & Ảnh CCCD Gộp chung */}
          <SectionCard icon={<CreditCard />} title="Thông tin định danh (CCCD/CMND)">
            <div className="flex flex-col gap-6">
              
              {/* Phần Text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <FieldDisplay label="Số thẻ CCCD / CMND" value={identity?.identity_id ? <span className="font-mono text-primary font-bold tracking-wider">{identity.identity_id}</span> : ""} />
                </div>
                <FieldDisplay label="Ngày cấp" value={identity.issue_date} />
                <FieldDisplay label="Nơi cấp" value={identity.issue_place} />
              </div>

              <div className="w-full h-px bg-outline-variant/50" />

              {/* Phần Ảnh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mặt trước CCCD</span>
                  <div className="w-full relative aspect-[1.6] rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center">
                    {identity.front_url ? (
                      <div className="w-full h-full p-0.5">
                        <img 
                          src={identity.front_url} 
                          alt="CCCD Front" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-on-surface-variant/50 font-medium">Chưa cập nhật ảnh</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mặt sau CCCD</span>
                  <div className="w-full relative aspect-[1.6] rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center">
                    {identity.back_url ? (
                      <div className="w-full h-full p-0.5">
                        <img 
                          src={identity.back_url} 
                          alt="CCCD Back" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-on-surface-variant/50 font-medium">Chưa cập nhật ảnh</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
