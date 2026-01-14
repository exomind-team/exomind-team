import { format } from 'date-fns';
import type { Fact } from '../api/types';
import { User, Bot, Clock } from 'lucide-react';

interface MessageListProps {
  messages: Fact[];
  loading?: boolean;
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'left-kanban': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'right-kanban': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'manual': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' },
  'mobile-client': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
};

function getSourceStyle(source: string) {
  return SOURCE_COLORS[source] || SOURCE_COLORS['manual'];
}

function isOwnMessage(source: string, currentSource: string): boolean {
  return source === currentSource || source === 'mobile-client';
}

export function MessageList({ messages, loading }: MessageListProps) {
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
      {messages.map((message) => {
        const isOwn = isOwnMessage(message.source, 'mobile-client');
        const style = getSourceStyle(message.source);

        return (
          <div
            key={message.fact_id}
            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isOwn ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              {message.source.includes('kanban') ? (
                <Bot className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-500'}`} />
              ) : (
                <User className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-500'}`} />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
              {/* Sender Info */}
              <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-gray-500">{message.meta?.sender || message.source}</span>
                <span className="text-xs text-gray-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>

              {/* Bubble */}
              <div className={`relative px-4 py-2.5 rounded-2xl ${
                isOwn
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : `${style.bg} ${style.text} rounded-bl-sm`
              }`}>
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
    </div>
  );
}
