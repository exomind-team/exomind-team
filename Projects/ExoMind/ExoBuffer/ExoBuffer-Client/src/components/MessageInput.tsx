import { useState, useCallback } from 'react';
import { Send, Loader2, AlertCircle, User, Reply } from 'lucide-react';
import { createFact } from '../api/client';

interface MessageInputProps {
  source: string;
  onMessageSent?: () => void;
}

export function MessageInput({ source, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sender, setSender] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      await createFact({
        content: content.trim(),
        source,
        meta: {
          sender: sender.trim() || undefined,
          reply_to: replyTo.trim() || undefined,
        },
      });

      setContent('');
      setShowOptions(false);
      onMessageSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSending(false);
    }
  }, [content, sender, replyTo, source, sending, onMessageSent]);

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-3">
      {error && (
        <div className="mb-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Quick Options Toggle */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="mb-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {showOptions ? '收起选项' : '展开选项'}
        </button>

        {/* Optional Fields */}
        {showOptions && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="发送者"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div className="relative">
              <Reply className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="回复 ID"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Message Input Area */}
        <div className="flex gap-3">
          <textarea
            placeholder="输入消息..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Source Info */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">来源: {source}</span>
        </div>
      </form>
    </div>
  );
}
