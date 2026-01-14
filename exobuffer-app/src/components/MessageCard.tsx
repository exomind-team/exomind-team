import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Message } from '../types'
import { useMessages } from '../context/MessageContext'

interface MessageCardProps {
  message: Message
  onReply: (message: Message) => void
  isLatest: boolean
}

export default function MessageCard({ message, onReply, isLatest }: MessageCardProps) {
  const { messages } = useMessages()
  const timeStr = format(new Date(message.timestamp), 'HH:mm', { locale: zhCN })

  // Find original message for reply
  const originalMessage = message.meta.reply_to
    ? messages.find((m) => m.fact_id === message.meta.reply_to)
    : null

  const sourceColor = {
    'left-kanban': '#34c759',
    'right-kanban': '#007aff',
    'agent': '#ff9500',
    'human': '#ff3b30',
  }[message.source] || '#8e8e93'

  return (
    <div
      className={`p-3 bg-card mb-2 rounded-lg shadow-sm mx-2 ${
        isLatest ? 'ring-2 ring-primary/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${sourceColor}20`, color: sourceColor }}
          >
            {message.source}
          </span>
          {message.meta.sender && (
            <span className="text-xs text-text-secondary">{message.meta.sender}</span>
          )}
        </div>
        <span className="text-xs text-text-secondary">{timeStr}</span>
      </div>

      {/* Reply quote */}
      {message.meta.reply_to && (
        <div className="bg-gray-100 border-l-3 border-primary/50 p-2 mb-2 rounded-r text-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-primary">🔁 引用</span>
            <span className="text-xs text-text-secondary font-mono">
              {message.meta.reply_to.slice(0, 8)}...
            </span>
          </div>
          {originalMessage && (
            <p className="text-xs text-text-secondary truncate">
              {originalMessage.content.split('\n')[0]}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="text-sm text-text whitespace-pre-wrap break-words">
        {message.content}
      </div>

      {/* Footer actions */}
      <div className="flex justify-end mt-2 pt-2 border-t border-border/50">
        <button
          onClick={() => onReply(message)}
          className="text-xs text-primary hover:text-primary-dark px-2 py-1 rounded hover:bg-primary/10 transition-colors"
        >
          回复
        </button>
      </div>
    </div>
  )
}
