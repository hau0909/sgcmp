"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, LogIn, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  requestGetMyConversations,
  requestGetOrCreateConversation,
  requestGetMessages,
  requestSendMessage,
} from '@/features/chat/api/chat.api';
import { Message } from '@/types/Message';
import { ConversationWithDetails } from '@/features/chat/types';
import { supabase } from '@/lib/supabase';

interface CustomerChatWidgetProps {
  companyId?: string;
  companyName?: string;
  /** Nếu true, widget sẽ tự mở ngay khi render */
  defaultOpen?: boolean;
  /** Callback khi widget được đóng (nhấn nút X) */
  onClose?: () => void;
  /** Nếu true, widget không có FAB và hiển ngay trong layout (không fixed) */
  embedded?: boolean;
}

export function CustomerChatWidget({ companyId: initCompanyId, companyName: initCompanyName, defaultOpen = false, onClose, embedded = false }: CustomerChatWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeCompanyName, setActiveCompanyName] = useState<string | null>(null);
  const [contextCompanyId, setContextCompanyId] = useState<string | undefined>(initCompanyId);
  const [contextCompanyName, setContextCompanyName] = useState<string | undefined>(initCompanyName);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoadingConvs, setIsLoadingConvs] = useState(false);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const userId = useAuthStore(state => state.user_id);
  const role = useAuthStore(state => state.role);

  // ── Hooks phải nằm TRƯỚC mọi conditional return ──

  useEffect(() => { setMounted(true); }, []);

  // Đóng widget khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Lắng nghe event mở widget từ trang chi tiết công ty
  useEffect(() => {
    const handler = (e: Event) => {
      const { companyId, companyName } = (e as CustomEvent).detail;
      setContextCompanyId(companyId);
      setContextCompanyName(companyName);
      setActiveConversationId(null);
      setMessages([]);
      setIsOpen(true);
    };
    window.addEventListener('open-customer-chat', handler);
    return () => window.removeEventListener('open-customer-chat', handler);
  }, []);

  // Load conversations khi mở widget
  // Nếu có initCompanyId: chỉ lấy conversations của customer này và lọc theo công ty
  // Nếu không: lấy tất cả conversations của customer
  // Đồng thời set activeConversationId nếu đã có hội thoại cũ với công ty đó
  useEffect(() => {
    if (!isOpen || !userId) return;
    const fetchConvs = async () => {
      try {
        setIsLoadingConvs(true);
        const data = await requestGetMyConversations(userId);
        const allConvs: ConversationWithDetails[] = data.conversations || [];

        if (contextCompanyId) {
          const matched = allConvs.filter(c => c.company_id === contextCompanyId);
          setConversations(matched);
          if (matched.length > 0) {
            setActiveConversationId(matched[0].conversation_id);
          }
        } else {
          setConversations(allConvs);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoadingConvs(false);
      }
    };
    fetchConvs();
  }, [isOpen, userId, contextCompanyId]);

  // Load messages khi chọn conversation
  useEffect(() => {
    if (!activeConversationId) return;
    const fetchMsgs = async () => {
      try {
        setIsLoadingMsgs(true);
        const data = await requestGetMessages(activeConversationId);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsLoadingMsgs(false);
      }
    };
    fetchMsgs();
  }, [activeConversationId]);

  // Realtime subscription
  useEffect(() => {
    if (!activeConversationId) return;
    const channel = supabase
      .channel(`customer-room:${activeConversationId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            const exists = prev.some((m) => m.message_id === newMsg.message_id);
            return exists ? prev : [...prev, newMsg];
          });
          setConversations((prev) =>
            prev.map((c) =>
              c.conversation_id === newMsg.conversation_id
                ? { ...c, latest_message: newMsg.content, updated_at: newMsg.created_at }
                : c
            ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversationId]);

  // Realtime subscription cấp khách hàng — phát hiện tin nhắn từ bất kỳ conversation
  useEffect(() => {
    if (!userId) return;

    const inboxChannel = supabase
      .channel(`customer-inbox:${userId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          setConversations((prev) => {
            const convExists = prev.some(c => c.conversation_id === newMsg.conversation_id);
            if (convExists) {
              return prev
                .map((c) =>
                  c.conversation_id === newMsg.conversation_id
                    ? { ...c, latest_message: newMsg.content, updated_at: newMsg.created_at }
                    : c
                )
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            }
            return prev;
          });

          // Nếu conversation chưa có trong list -> fetch lại
          setConversations((prev) => {
            const convExists = prev.some(c => c.conversation_id === newMsg.conversation_id);
            if (!convExists) {
              requestGetMyConversations(userId).then((data) => {
                setConversations(data.conversations || []);
              });
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inboxChannel);
    };
  }, [userId]);

  // Set tên công ty cho header khi mở từ detail page
  useEffect(() => {
    if (contextCompanyId && contextCompanyName) setActiveCompanyName(contextCompanyName);
  }, [contextCompanyId, contextCompanyName]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Conditional renders (sau tất cả hooks) ──
  if (!mounted) return null;
  if (role && role !== 'customer') return null;
  if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/onboarding')) return null;

  const isInConversation = !!activeConversationId || (!!contextCompanyId && isOpen);

  const filteredConversations = conversations.filter((c) =>
    (c.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!newMessage.trim() || isSending || !userId) return;
    try {
      setIsSending(true);
      let convId = activeConversationId;

      // Lần đầu gửi: tạo conversation mới
      if (!convId && contextCompanyId) {
        const res = await requestGetOrCreateConversation(contextCompanyId, userId);
        convId = res.conversation.conversation_id;
        setActiveConversationId(convId);
      }

      if (!convId) return;

      const data = await requestSendMessage({
        conversationId: convId,
        senderId: userId,
        content: newMessage.trim(),
      });
      setMessages((prev) => {
        const exists = prev.some((m) => m.message_id === data.message.message_id);
        return exists ? prev : [...prev, data.message];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === convId
            ? { ...c, latest_message: newMessage.trim(), updated_at: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
      setNewMessage('');
      const ta = document.getElementById('customer-chat-input') as HTMLTextAreaElement | null;
      if (ta) ta.style.height = 'auto';
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Window */}
      {isOpen && (
        <div className="bg-surface border border-outline-variant rounded-2xl shadow-xl w-[340px] sm:w-[380px] h-[520px] mb-4 flex flex-col overflow-hidden text-on-surface animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex justify-between items-center shrink-0 shadow-sm z-10">
            {isInConversation ? (
              <div className="flex items-center gap-2">
                {!initCompanyId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 -ml-2 text-on-surface-variant hover:bg-surface-container-high"
                    onClick={() => {
                      setActiveConversationId(null);
                      setActiveCompanyName(null);
                      setMessages([]);
                      // Nếu context được set bởi event (không phải prop), xoá để hiện danh sách
                      if (!initCompanyId) {
                        setContextCompanyId(undefined);
                        setContextCompanyName(undefined);
                      }
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <span className="font-bold text-primary truncate max-w-[220px]">
                  {activeCompanyName || 'Hội thoại'}
                </span>
              </div>
            ) : (
              <span className="font-bold text-primary text-lg tracking-tight">Tin nhắn</span>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-surface">
            {!role ? (
              /* Chưa đăng nhập */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Xin chào!</h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Vui lòng đăng nhập để trò chuyện với các công ty.
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-sm transition-transform active:scale-95"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              </div>
            ) : isInConversation ? (
              /* Chat Area */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {isLoadingMsgs ? (
                    <div className="text-center text-on-surface-variant text-sm py-8">Đang tải...</div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="w-7 h-7 text-primary/60" />
                      </div>
                      <p className="font-semibold text-on-surface text-sm mb-1">Chưa có tin nhắn nào</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender_id === userId;
                      const msgDate = new Date(msg.created_at).toLocaleDateString('vi-VN');
                      const prevMsgDate = index > 0 ? new Date(messages[index - 1].created_at).toLocaleDateString('vi-VN') : null;
                      const showDateSeparator = msgDate !== prevMsgDate;

                      return (
                        <React.Fragment key={msg.message_id}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-3">
                              <span className="bg-surface-container-high text-on-surface-variant text-[11px] px-3 py-1 rounded-full font-medium shadow-sm">
                                {msgDate === new Date().toLocaleDateString('vi-VN') ? 'Hôm nay' : msgDate}
                              </span>
                            </div>
                          )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start gap-2'}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold overflow-hidden mt-0.5 text-xs">
                              {(() => {
                                const activeConv = conversations.find(c => c.conversation_id === activeConversationId);
                                if (activeConv?.customer_avatar) {
                                  return <img src={activeConv.customer_avatar} alt="Avatar" className="w-full h-full object-cover" />;
                                }
                                return (activeConv?.customer_name || 'C').charAt(0).toUpperCase();
                              })()}
                            </div>
                          )}
                          <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-primary/90 text-on-primary rounded-tr-sm'
                                  : 'bg-surface-container border border-outline-variant/60 text-on-surface rounded-tl-sm'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] font-medium text-on-surface-variant mt-1 mx-1">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-surface border-t border-outline-variant shrink-0">
                  <div className="flex items-end gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <textarea
                      id="customer-chat-input"
                      rows={1}
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-none focus:ring-0 resize-none py-1.5 px-1 text-[14px] text-on-surface placeholder:text-on-surface-variant max-h-24 min-h-[36px] outline-none"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || isSending}
                      className="shrink-0 bg-primary hover:bg-primary/90 text-on-primary rounded-lg h-9 w-9 p-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Danh sách hội thoại */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 pb-3 pt-3 border-b border-outline-variant shrink-0 relative group">
                  <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên công ty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-[13px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant"
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {isLoadingConvs ? (
                    <div className="p-6 text-center text-on-surface-variant text-sm">Đang tải...</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-on-surface-variant text-sm">
                      <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                      {searchQuery ? 'Không tìm thấy kết quả.' : 'Chưa có hội thoại nào.'}
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                    <div
                      key={conv.conversation_id}
                      onClick={() => {
                        setActiveConversationId(conv.conversation_id);
                        setActiveCompanyName(conv.customer_name || null);
                      }}
                      className="p-4 border-b border-outline-variant/60 hover:bg-surface-container-high cursor-pointer transition-colors flex gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold text-sm overflow-hidden">
                        {conv.customer_avatar
                          ? <img src={conv.customer_avatar} alt="" className="w-full h-full object-cover" />
                          : (conv.customer_name || 'C').charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-on-surface text-sm truncate">
                            {conv.customer_name || `Hội thoại #${conv.conversation_id.slice(0, 8)}`}
                          </span>
                          <span className="text-[11px] text-on-surface-variant shrink-0 mt-0.5">
                            {formatTime(conv.updated_at)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 leading-relaxed">
                          {conv.latest_message || 'Chưa có tin nhắn'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
