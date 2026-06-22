import React from 'react';
import { Search, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CompanyChat() {
  return (
    <div className="flex h-full bg-surface overflow-hidden text-on-surface">
      {/* Sidebar */}
      <div className="w-80 border-r border-outline-variant flex flex-col bg-surface-container-low">
        <div className="p-5 border-b border-outline-variant shrink-0">
          <h2 className="text-xl font-bold mb-4 font-headline tracking-tight text-primary">Tin nhắn</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm hội thoại..." 
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm placeholder:text-on-surface-variant text-on-surface"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Conversation 1 (Active) */}
          <div className="p-4 border-b border-outline-variant/60 cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all border-l-4 border-l-primary relative">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold">
                T
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-primary truncate">Trần Thanh Bình</div>
                  <span className="text-[11px] font-medium text-primary/70 shrink-0 mt-0.5">14:30</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-1 leading-relaxed">Vâng, tôi cần xem lại báo giá chi tiết trước khi xác nhận.</p>
              </div>
            </div>
          </div>

          {/* Conversation 2 */}
          <div className="p-4 border-b border-outline-variant/60 hover:bg-surface-container-high cursor-pointer transition-all border-l-4 border-l-transparent">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-on-surface group-hover:text-primary transition-colors truncate">Tập đoàn Alpha VN</div>
                  <span className="text-xs text-on-surface-variant shrink-0 mt-0.5">Hôm qua</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-1 leading-relaxed">Cảm ơn đội ngũ đã hỗ trợ sự kiện thành công tốt đẹp.</p>
              </div>
            </div>
          </div>

          {/* Conversation 3 */}
          <div className="p-4 border-b border-outline-variant/60 hover:bg-surface-container-high cursor-pointer transition-all border-l-4 border-l-transparent">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold">
                M
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-on-surface truncate">Marcus Chen</div>
                  <span className="text-xs text-on-surface-variant shrink-0 mt-0.5">12/11</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-1 leading-relaxed">Lịch trình di chuyển đã được cập nhật chưa?</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest">
        {/* Chat Header */}
        <div className="h-[76px] px-6 border-b border-outline-variant flex items-center justify-between bg-surface shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg border border-outline-variant/50">
              T
            </div>
            <div>
              <h3 className="font-bold text-on-surface leading-tight tracking-tight">Trần Thanh Bình</h3>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center my-4">
            <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider bg-surface px-4 py-1.5 rounded-full border border-outline-variant shadow-sm">Hôm nay</span>
          </div>

          {/* SENDER: Admin message (align right usually for the user representing the app) */}
          <div className="flex max-w-[85%] ml-auto flex-row-reverse">
            <div className="flex flex-col items-end">
              <div className="bg-primary/90 text-on-primary p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-[15px] leading-relaxed">
                Xin chào. Chúng tôi đã nhận được yêu cầu về dịch vụ cho sự kiện sắp tới. Bạn có muốn xem qua báo giá sơ bộ không?
              </div>
              <div className="text-[11px] font-medium text-on-surface-variant mt-1.5 mr-1">14:15</div>
            </div>
          </div>

          {/* SENDER: Customer message (align left) */}
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold">
              T
            </div>
            <div className="flex flex-col items-start">
              <div className="bg-surface-container border border-outline-variant/60 p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-on-surface text-[15px] leading-relaxed">
                Vâng, tôi cần xem lại báo giá chi tiết trước khi xác nhận.
              </div>
              <div className="text-[11px] font-medium text-on-surface-variant mt-1.5 ml-1">14:30</div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-5 bg-surface border-t border-outline-variant shrink-0 z-10 relative">
          <div className="flex items-end gap-3 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea 
              rows={1}
              placeholder="Nhập tin nhắn của bạn..." 
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 text-[15px] text-on-surface placeholder:text-on-surface-variant max-h-32 min-h-[40px] outline-none"
            />
            <Button className="shrink-0 bg-primary hover:bg-primary/90 text-on-primary rounded-lg h-10 w-10 p-0 shadow-sm transition-transform active:scale-95">
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
