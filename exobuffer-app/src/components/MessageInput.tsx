import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { useMessages } from '../context/MessageContext'

interface MessageInputProps {
  inputRef?: React.RefObject<{ focus: () => void }>
}

const MessageInput = forwardRef<{ focus: () => void }, MessageInputProps>(
  function MessageInput({ inputRef }, ref) {
    const { sendMessage, replyingTo, setReplyingTo, isLoading } = useMessages()
    const [content, setContent] = useState('')
    const [isSending, setIsSending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // 导出 focus 方法给父组件
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus()
    }))

    // 如果有 inputRef，也同步调用 focus（兼容旧逻辑）
    if (inputRef?.current) {
      // inputRef 会在父组件中使用，这里不需要额外处理
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    try {
      setIsSending(true)
      await sendMessage(content.trim(), replyingTo?.fact_id)
      setContent('')
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('发送失败，请重试')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="bg-white border-t border-border px-2 py-2">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded mb-1">
          <span className="text-xs text-primary">回复:</span>
          <span className="text-xs text-text-secondary flex-1 truncate">
            {replyingTo.content.split('\n')[0]}
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-xs text-text-secondary hover:text-text px-1"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          rows={1}
          className="flex-1 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          disabled={isSending}
          style={{ maxHeight: '100px' }}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSending}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              发送
            </span>
          ) : (
            '发送'
          )}
        </button>
      </form>
    </div>
  )
})

export default MessageInput
