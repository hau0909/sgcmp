"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import {
  requestGetConversations,
  requestGetMessages,
  requestSendMessage,
} from '@/features/chat/api/chat.api';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';
import { ConversationWithDetails } from '@/features/chat/types';
import { supabase } from '@/lib/supabase';

interface CompanyChatProps {
  companyId: string;
  userId: string;
}

export function CompanyChat({ companyId, userId }: CompanyChatProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách conversations khi mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const data = await requestGetConversations(companyId, userId);
        setConversations(data.conversations || []);
        // Tự động chọn conversation đầu tiên nếu có
        if (data.conversations?.length > 0) {
          setActiveConversationId(data.conversations[0].conversation_id);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [companyId]);

  // Lấy messages khi active conversation thay đổi
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const data = await requestGetMessages(activeConversationId);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Realtime subscription cho messages của activeConversationId
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`room:${activeConversationId}`)
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
          // Chỉ push vào mảng nếu chưa có (tránh trùng với tin nhắn tự gửi)
          setMessages((prev) => {
            const exists = prev.some((m) => m.message_id === newMsg.message_id);
            return exists ? prev : [...prev, newMsg];
          });
          
          // Đồng bộ luôn sang danh sách bên trái
          setConversations((prev) => 
            prev.map((c) =>
              c.conversation_id === newMsg.conversation_id
                ? { ...c, latest_message: newMsg.content, updated_at: newMsg.created_at }
                : c
            ).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  // Realtime subscription cấp công ty — phát hiện hội thoại MỚI hoặc tin nhắn từ bất kỳ conversation
  useEffect(() => {
    if (!companyId) return;

    const companyChannel = supabase
      .channel(`company-inbox:${companyId}:${Date.now()}`)
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
              // Cập nhật tin nhắn mới nhất cho conversation đã có
              return prev
                .map((c) =>
                  c.conversation_id === newMsg.conversation_id
                    ? { ...c, latest_message: newMsg.content, updated_at: newMsg.created_at }
                    : c
                )
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            }
            // Conversation chưa có trong list → cần fetch mới
            return prev;
          });

          // Nếu conversation chưa có trong list → fetch toàn bộ lại để lấy đủ thông tin
          setConversations((prev) => {
            const convExists = prev.some(c => c.conversation_id === newMsg.conversation_id);
            if (!convExists) {
              // Fetch lại danh sách
              requestGetConversations(companyId, userId).then((data) => {
                setConversations(data.conversations || []);
              });
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(companyChannel);
    };
  }, [companyId, userId]);


  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversationId || isSending) return;

    try {
      setIsSending(true);
      await requestSendMessage({
        conversationId: activeConversationId,
        senderId: userId,
        content: newMessage.trim(),
      });
      // Không push optimistic — realtime subscription sẽ nhận và thêm tin nhắn (có dedup guard)
      
      // Đồng bộ hiển thị tin nhắn vừa gửi ra sidebar bên trái ngay lập tức
      setConversations((prev) => 
        prev.map((c) =>
          c.conversation_id === activeConversationId
            ? { ...c, latest_message: newMessage.trim(), updated_at: new Date().toISOString() }
            : c
        ).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
      
      setNewMessage('');
      
      // Reset chiều cao textarea
      const textarea = document.getElementById('chat-input');
      if (textarea) {
        textarea.style.height = 'auto';
      }

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

  const filteredConversations = conversations.filter((c) =>
    (c.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

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
              placeholder="Tìm theo tên khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm placeholder:text-on-surface-variant text-on-surface"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-6 text-center text-on-surface-variant text-sm">Đang tải...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-on-surface-variant text-sm mt-10">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p>Chưa có hội thoại nào.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.conversation_id === activeConversationId;
              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => setActiveConversationId(conv.conversation_id)}
                  className={`p-4 border-b border-outline-variant/60 cursor-pointer transition-all border-l-4 ${
                    isActive
                      ? 'bg-primary/5 hover:bg-primary/10 border-l-primary'
                      : 'border-l-transparent hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold text-sm">
                      {conv.customer_avatar ? (
                        <img src={conv.customer_avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        (conv.customer_name || conv.conversation_id).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className={`font-semibold truncate text-sm ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                          {conv.customer_name || `Hội thoại #${conv.conversation_id.slice(0, 8)}`}
                        </div>
                        <span className={`text-[11px] font-medium shrink-0 mt-0.5 ${isActive ? 'text-primary/70' : 'text-on-surface-variant'}`}>
                          {formatTime(conv.updated_at)}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed line-clamp-1 ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {conv.latest_message || `Tạo lúc ${new Date(conv.created_at).toLocaleDateString('vi-VN')}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest">
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant text-sm bg-surface">
            <div className="w-16 h-16 bg-surface-container-highest/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-base font-medium text-on-surface mb-1">Tin nhắn của công ty</p>
            <p className="text-on-surface-variant text-sm">Chọn một hội thoại ở danh sách bên trái để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-[76px] px-6 border-b border-outline-variant flex items-center bg-surface shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg border border-outline-variant/50 overflow-hidden">
                  {(() => {
                    const activeConv = conversations.find(c => c.conversation_id === activeConversationId);
                    if (activeConv?.customer_avatar) {
                      return <img src={activeConv.customer_avatar} alt="Avatar" className="w-full h-full object-cover" />;
                    }
                    return (activeConv?.customer_name || activeConversationId).charAt(0).toUpperCase();
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface leading-tight tracking-tight">
                    {conversations.find(c => c.conversation_id === activeConversationId)?.customer_name || `Hội thoại #${activeConversationId.slice(0, 8)}`}
                  </h3>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingMessages ? (
                <div className="text-center text-on-surface-variant text-sm py-8">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-on-surface-variant text-sm py-8">Chưa có tin nhắn nào.</div>
              ) : (
                messages.map((msg, index) => {
                  const isMyMessage = msg.sender_id === userId;
                  const msgDate = new Date(msg.created_at).toLocaleDateString('vi-VN');
                  const prevMsgDate = index > 0 ? new Date(messages[index - 1].created_at).toLocaleDateString('vi-VN') : null;
                  const showDateSeparator = msgDate !== prevMsgDate;

                  return (
                    <React.Fragment key={msg.message_id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="bg-surface-container-high text-on-surface-variant text-[11px] px-3 py-1 rounded-full font-medium shadow-sm">
                            {msgDate === new Date().toLocaleDateString('vi-VN') ? 'Hôm nay' : msgDate}
                          </span>
                        </div>
                      )}
                    <div
                      className={`flex ${isMyMessage ? 'max-w-[85%] ml-auto flex-row-reverse' : 'gap-4 max-w-[85%]'}`}
                    >
                      {!isMyMessage && (
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface border border-outline-variant/50 shadow-sm shrink-0 font-bold overflow-hidden">
                          {(() => {
                            const activeConv = conversations.find(c => c.conversation_id === activeConversationId);
                            if (activeConv?.customer_avatar) {
                              return <img src={activeConv.customer_avatar} alt="Avatar" className="w-full h-full object-cover" />;
                            }
                            return (activeConv?.customer_name || msg.sender_id).charAt(0).toUpperCase();
                          })()}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                            isMyMessage
                              ? 'bg-primary/90 text-on-primary rounded-tr-sm'
                              : 'bg-surface-container border border-outline-variant/60 text-on-surface rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className={`text-[11px] font-medium text-on-surface-variant mt-1.5 ${isMyMessage ? 'mr-1' : 'ml-1'}`}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-5 bg-surface border-t border-outline-variant shrink-0 z-10 relative">
              <div className="flex items-end gap-3 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <textarea
                  id="chat-input"
                  rows={1}
                  placeholder="Nhập tin nhắn của bạn..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 text-[15px] text-on-surface placeholder:text-on-surface-variant max-h-32 min-h-[40px] outline-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="shrink-0 bg-primary hover:bg-primary/90 text-on-primary rounded-lg h-10 w-10 p-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
