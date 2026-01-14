import { format } from 'date-fns';
import type { Fact } from '../api/types';
import { User, Bot, Clock } from 'lucide-react';
import { useEffect, useRef, useMemo, useState } from 'react';

interface MessageListProps {
  messages: Fact[];
  loading?: boolean;
  messageOrder?: 'newest-top' | 'newest-bottom';
  onFirstVisibleChange?: (factId: string | null) => void;
  anchorId?: string | null;
}

// ===== 原 HTML 前端的颜色生成函数（保持一致）=====

// 字符串转哈希
function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

// 基于 source 和 ip 生成 HSL 颜色（与原 HTML 前端一致）
function generateColor(source: string, ip: string): { h: number; s: number; l: number } {
  const hash_both = hashStr(source + '' + ip);
  const hash_ip = hashStr(ip);

  const hue = Math.abs(hash_both) % 360;
  const saturation = 90 + Math.abs(hash_ip) % 10; // 90-99%
  const lightness = 85 + Math.abs(hash_ip) % 10; // 85-94%

  return { h: hue, s: saturation, l: lightness };
}

// 获取消息样式（基于 source + ip 动态生成）
function getMessageStyle(fact: Fact) {
  const source = fact.source || '';
  const ip = fact.meta?.ip || '';

  const { h, s, l } = generateColor(source, ip);

  // 背景色（柔和色调）
  const backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;

  // 文字颜色（比背景色深很多，确保可读性）
  const textColor = `hsl(${h}, ${s}%, ${Math.max(l - 60, 10) / 2}%)`;

  // 边框颜色
  const borderColor = `hsl(${h}, ${s}%, ${Math.max(l - 35, 15)}%)`;

  return { backgroundColor, textColor, borderColor };
}

function isOwnMessage(source: string, currentSource: string): boolean {
  return source === currentSource || source === 'mobile-client';
}

export function MessageList({
  messages,
  loading,
  messageOrder = 'newest-bottom',
  onFirstVisibleChange,
  anchorId
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [hasAnchored, setHasAnchored] = useState(false);

  // 根据消息顺序排序
  const sortedMessages = useMemo(() => {
    const sorted = [...messages];
    if (messageOrder === 'newest-top') {
      return sorted.reverse();
    }
    return sorted;
  }, [messages, messageOrder]);

  // 设置 IntersectionObserver 跟踪第一个可见消息
  useEffect(() => {
    if (!onFirstVisibleChange) return;

    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // 找到消息的 fact_id
            for (const [factId, el] of messageRefs.current) {
              if (el === entry.target) {
                onFirstVisibleChange(factId);
                break;
              }
            }
          }
        }
      },
      { rootMargin: '-1px 0px -99% 0px' }
    );

    observerRef.current = observer;

    // 观察所有消息元素
    messageRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [onFirstVisibleChange, sortedMessages]);

  // 锚点定位：切换顺序后滚动到锚点消息
  useEffect(() => {
    if (!anchorId || hasAnchored) return;

    const anchorElement = messageRefs.current.get(anchorId);
    if (anchorElement) {
      anchorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasAnchored(true);
      const resetTimer = setTimeout(() => setHasAnchored(false), 1000);
      return () => clearTimeout(resetTimer);
    }
  }, [anchorId, messageOrder, hasAnchored]);

  // 微信风格：初始加载或新消息时滚动到底部
  useEffect(() => {
    if (messageOrder === 'newest-bottom' && !anchorId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messageOrder, anchorId]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-base">暂无消息</p>
        <p className="text-sm mt-1">开始发送消息吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {sortedMessages.map((message) => {
        const isOwn = isOwnMessage(message.source, 'mobile-client');
        const { backgroundColor, textColor } = getMessageStyle(message);

        // 保存消息元素的 ref（不使用 useCallback，遵守 React Hooks 规则）
        const setMessageRef = (el: HTMLDivElement | null) => {
          if (el) {
            messageRefs.current.set(message.fact_id, el);
          } else {
            messageRefs.current.delete(message.fact_id);
          }
        };

        return (
          <div
            key={message.fact_id}
            ref={setMessageRef}
            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isOwn ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              {message.source?.includes('kanban') ? (
                <Bot className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-500'}`} />
              ) : (
                <User className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-500'}`} />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
              {/* Sender Info */}
              <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs" style={{ color: textColor }}>
                  {message.meta?.sender || message.source || 'unknown'}
                </span>
                <span className="text-xs text-gray-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>

              {/* Bubble - 使用动态 HSL 背景色 */}
              <div
                className={`relative px-4 py-2.5 rounded-2xl ${
                  isOwn
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'rounded-bl-sm'
                }`}
                style={isOwn ? {} : { backgroundColor, color: textColor }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>

              {/* Reply Info */}
              {message.meta?.reply_to && (
                <div className={`mt-1 text-xs text-blue-500 ${isOwn ? 'text-right' : 'text-left'}`}>
                  ↩ 回复 {message.meta.reply_to.slice(0, 6)}...
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* 滚动锚点 */}
      <div ref={bottomRef} className="h-0" />
    </div>
  );
}
