import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useSSE } from './hooks/useSSE';
import { fetchFacts } from './api/client';
import type { Fact } from './api/types';
import { MessageSquare, Settings, Menu, Tag } from 'lucide-react';

// 全局常量
export const DEFAULT_SOURCE = 'human';
export const DEFAULT_MESSAGE_ORDER: MessageOrder = 'newest-bottom';
export const MESSAGE_ORDER_KEY = 'exobuffer_messageOrder';
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 消息顺序类型
type MessageOrder = 'newest-top' | 'newest-bottom';

function App() {
  console.group('App.tsx')
  console.log('API_BASE', API_BASE)
  console.groupEnd()
  const [messages, setMessages] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [messageOrder, setMessageOrder] = useState<MessageOrder>(() => {
    // 从 localStorage 读取，默认微信风格（新下旧上）
    return (localStorage.getItem(MESSAGE_ORDER_KEY) as MessageOrder) || DEFAULT_MESSAGE_ORDER;
  });
  const [showSettings, setShowSettings] = useState(false);

  // 锚点定位：使用 ref 存储锚点消息 ID（用于下一次渲染）
  const anchorRef = useRef<string | null>(null);
  // 使用 state 触发 MessageList 中的锚点滚动
  const [scrollToAnchor, setScrollToAnchor] = useState<string | null>(null);

  // 切换消息顺序时保存锚点并触发滚动
  const handleSetMessageOrder = useCallback((newOrder: MessageOrder) => {
    // 切换前保存当前滚动位置对应的消息
    if (messageOrder === DEFAULT_MESSAGE_ORDER) {
      // 当前在底部，保存最后一个消息作为锚点
      if (messages.length > 0) {
        anchorRef.current = messages[messages.length - 1].fact_id;
      }
    } else {
      // 当前在顶部，保存第一个消息作为锚点
      if (messages.length > 0) {
        anchorRef.current = messages[0].fact_id;
      }
    }

    // 设置新顺序
    setMessageOrder(newOrder);
    localStorage.setItem(MESSAGE_ORDER_KEY, newOrder);

    // 触发锚点滚动（在下一个渲染周期）
    setScrollToAnchor(anchorRef.current);
  }, [messageOrder, messages]);

  // 重置锚点状态（滚动完成后）
  const handleAnchorScrollComplete = useCallback(() => {
    setScrollToAnchor(null);
  }, []);

  // Fetch initial messages
  const loadMessages = useCallback(async () => {
    try {
      const data = await fetchFacts();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 发送消息后刷新列表
  const handleMessageSent = useCallback((fact: Fact) => {
    // 直接添加新消息到列表（避免依赖 SSE 延迟）
    setMessages((prev) => {
      if (prev.some(m => m.fact_id === fact.fact_id)) {
        return prev;
      }
      return [...prev, fact];
    });
  }, []);

  // 切换消息顺序
  const toggleMessageOrder = useCallback(() => {
    setMessageOrder((prev) => {
      const newOrder = prev === 'newest-top' ? 'newest-bottom' : 'newest-top';
      localStorage.setItem(MESSAGE_ORDER_KEY, newOrder);
      return newOrder;
    });
  }, []);

  // 初始化加载消息
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // SSE connection for real-time updates (使用 useCallback 稳定回调)
  const handleFact = useCallback((fact: Fact) => {
    setMessages((prev) => {
      // 去重：检查是否已存在相同 fact_id
      if (prev.some(m => m.fact_id === fact.fact_id)) {
        return prev;
      }
      return [...prev, fact];
    });
  }, []);

  const { isConnected, reconnectCount, reconnect } = useSSE({
    onFact: handleFact,
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Mobile Optimized with Source Input & Settings */}
      <header className="flex-shrink-0 sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Left: Menu + Logo + Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="p-2 -ml-2 text-gray-600 hover:text-gray-800 touch-manipulation">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800 whitespace-nowrap">ExoBuffer</h1>
          </div>

          {/* Middle: Source Input - Compact (desktop) */}
          <div className="relative flex-1 max-w-[160px] hidden sm:flex items-center">
            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="来源"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Right: Settings + Connection Status */}
          <div className="relative flex items-center gap-2 flex-shrink-0 ml-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
            <ConnectionStatus
              isConnected={isConnected}
              reconnectCount={reconnectCount}
              onReconnect={reconnect}
            />

            {/* Settings Panel - Floating Menu */}
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-48 p-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">消息顺序</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSetMessageOrder('newest-bottom')}
                    className={`px-3 py-2 text-sm rounded-lg border text-left ${
                      messageOrder === 'newest-bottom'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    微信风格（新下旧上）
                  </button>
                  <button
                    onClick={() => handleSetMessageOrder('newest-top')}
                    className={`px-3 py-2 text-sm rounded-lg border text-left ${
                      messageOrder === 'newest-top'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    看板风格（新上旧下）
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Source Input - Always visible on mobile */}
        <div className="mt-3 sm:hidden">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="来源标识"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* Message List */}
        <MessageList
          messages={messages}
          loading={loading}
          messageOrder={messageOrder}
          scrollToAnchor={scrollToAnchor}
          onAnchorScrollComplete={handleAnchorScrollComplete}
          currentSource={source}
        />
      </main>

      {/* Footer Input - Fixed Bottom */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <MessageInput source={source} onMessageSent={handleMessageSent} />
        </div>
      </footer>
    </div>
  );
}

export default App;
