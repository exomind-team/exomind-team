import { useMessages } from '../context/MessageContext'

export default function Header() {
  const { messages, isLoading, error } = useMessages()

  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">ExoBuffer</h1>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Beta</span>
      </div>
      <div className="flex items-center gap-3">
        {isLoading && (
          <span className="text-xs text-white/80 animate-pulse">加载中...</span>
        )}
        {error && (
          <span className="text-xs text-red-300">连接异常</span>
        )}
        <span className="text-xs text-white/80">{messages.length} 条消息</span>
      </div>
    </header>
  )
}
