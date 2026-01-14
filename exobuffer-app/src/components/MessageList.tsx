import { useRef, useEffect } from 'react'
import { useMessages } from '../context/MessageContext'
import MessageCard from './MessageCard'
import { Message } from '../types'

export default function MessageList() {
  const { messages, isLoading, error, refresh, replyingTo, setReplyingTo } = useMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevMessagesLength = useRef(messages.length)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      scrollToBottom()
    }
    prevMessagesLength.current = messages.length
  }, [messages.length])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    // Focus input
    const input = document.querySelector('textarea') as HTMLTextAreaElement
    input?.focus()
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-text-secondary text-sm">加载消息中...</p>
        </div>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2">加载失败</p>
          <p className="text-text-secondary text-xs mb-3">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary text-sm">暂无消息</p>
          <p className="text-text-secondary/70 text-xs mt-1">发送消息开始对话</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
      {messages.map((message, index) => (
        <MessageCard
          key={message.fact_id}
          message={message}
          onReply={handleReply}
          isLatest={index === messages.length - 1}
        />
      ))}
    </div>
  )
}
