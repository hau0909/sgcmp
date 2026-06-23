"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, LogIn, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const role = useAuthStore(state => state.role);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ẩn nếu là admin/company/coordinator hoặc chưa mount (để tránh hydration mismatch)
  if (!mounted) return null;
  if (role && role !== "customer") return null;

  // Ẩn trên các trang auth
  if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/onboarding')) return null;

  // Dữ liệu mẫu danh sách công ty đang chat
  const companies = [
    { id: '1', name: 'Bảo vệ Sài Gòn', initial: 'B', lastMessage: 'Chúng tôi đã nhận được yêu cầu của bạn.', time: '14:30' },
    { id: '2', name: 'Dịch vụ Vệ sinh 24/7', initial: 'D', lastMessage: 'Báo giá đã được gửi vào email.', time: 'Hôm qua' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Window */}
      {isOpen && (
        <div className="bg-surface border border-outline-variant rounded-2xl shadow-xl w-[320px] sm:w-[380px] h-[520px] mb-4 flex flex-col overflow-hidden text-on-surface transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex justify-between items-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10 relative">
            {activeCompany ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 -ml-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  onClick={() => setActiveCompany(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                <div className="font-bold text-primary truncate max-w-[200px]">
                  {companies.find(c => c.id === activeCompany)?.name}
                </div>
              </div>
            ) : (
              <div className="font-bold text-primary text-lg tracking-tight">Tin nhắn</div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-surface flex flex-col relative">
            {!role ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-surface-container-lowest">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 tracking-tight">Xin chào!</h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Vui lòng đăng nhập để trò chuyện với các công ty nhằm nhận được sự hỗ trợ tốt nhất.
                </p>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-sm transition-transform active:scale-95"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng nhập tính năng Chat
                </Button>
              </div>
            ) : !activeCompany ? (
              /* Companies List (Sidebar equivalent) */
              <div className="flex-1 overflow-y-auto">
                <div className="bg-surface-container-lowest/50">
                  
                  {/* Thanh tìm kiếm nhỏ gọn */}
                  <div className="px-4 py-3 border-b border-outline-variant/60 sticky top-0 bg-surface z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm công ty..." 
                        className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-[13px] focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {companies.map((company) => (
                    <div 
                      key={company.id}
                      onClick={() => setActiveCompany(company.id)}
                      className="p-4 border-b border-outline-variant/60 hover:bg-surface-container-high cursor-pointer transition-colors flex gap-3"
                    >
                      <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold">
                        {company.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="font-semibold text-on-surface truncate">{company.name}</div>
                          <span className="text-[11px] font-medium text-on-surface-variant shrink-0 mt-0.5">{company.time}</span>
                        </div>
                        <p className="text-[13px] text-on-surface-variant mt-1.5 line-clamp-1 leading-relaxed">
                          {company.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Chat Area */
              <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-5">
                  <div className="flex justify-center my-2">
                    <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider bg-surface px-3 py-1 rounded-full border border-outline-variant shadow-sm">Hôm nay</span>
                  </div>

                  {/* Admin (Company) Message - Left aligned */}
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold text-xs mt-1">
                      {companies.find(c => c.id === activeCompany)?.initial}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="bg-surface-container border border-outline-variant/60 p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-on-surface text-[14px] leading-relaxed">
                        Chúng tôi đã nhận được yêu cầu của bạn.
                      </div>
                      <div className="text-[10px] font-medium text-on-surface-variant mt-1.5 ml-1">14:15</div>
                    </div>
                  </div>

                  {/* Customer Message - Right aligned */}
                  <div className="flex max-w-[85%] ml-auto flex-row-reverse">
                    <div className="flex flex-col items-end">
                      <div className="bg-primary/90 text-on-primary p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-[14px] leading-relaxed">
                        Cảm ơn bạn. Bao lâu thì tôi nhận được báo giá chi tiết?
                      </div>
                      <div className="text-[10px] font-medium text-on-surface-variant mt-1.5 mr-1">14:30</div>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 bg-surface border-t border-outline-variant shrink-0 relative z-10">
                  <div className="flex items-end gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                    <textarea 
                      rows={1}
                      placeholder="Nhập tin nhắn..." 
                      className="w-full bg-transparent border-none focus:ring-0 resize-none py-1.5 px-2 text-[14px] text-on-surface placeholder:text-on-surface-variant max-h-24 min-h-[36px] outline-none"
                    />
                    <Button className="shrink-0 bg-primary hover:bg-primary/90 text-on-primary rounded-lg h-9 w-9 p-0 shadow-sm transition-transform active:scale-95">
                      <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
