"use client";

import { useAuthStore } from '@/store/auth.store';
import { CompanyChat } from '@/features/chat/components/CompanyChat';
import { useTranslation } from '@/components/providers/LanguageProvider';

export default function ChatPage() {
  const companyId = useAuthStore((state) => state.company_id);
  const userId = useAuthStore((state) => state.user_id);
  const { dict } = useTranslation();

  if (!companyId || !userId) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center text-on-surface-variant text-sm">
        {dict.chat?.not_found_company || "Không tìm thấy thông tin công ty. Vui lòng đăng nhập lại."}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-white flex flex-col">
      <CompanyChat companyId={companyId} userId={userId} />
    </div>
  );
}
