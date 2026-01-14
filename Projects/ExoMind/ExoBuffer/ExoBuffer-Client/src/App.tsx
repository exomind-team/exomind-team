import { useState, useEffect, useCallback } from 'react';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useSSE } from './hooks/useSSE';
import { fetchFacts } from './api/client';
import type { Fact } from './api/types';
import { MessageSquare, Settings, Menu } from 'lucide-react';

const DEFAULT_SOURCE = 'mobile-client';

function App() {
  const [messages, setMessages] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(DEFAULT_SOURCE);

  // Fetch initial messages
  const loadMessages = useCallback(async () => {
    try {
      const data = await fetchFacts(undefined, 50);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // SSE connection for real-time updates
  const { isConnected, reconnectCount, reconnect } = useSSE({
    onFact: (fact) => {
      setMessages((prev) => [...prev, fact]);
    },
  });

  const handleMessageSent = () => {
    // Scroll to bottom or refresh if needed
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <header className="flex-shrink-0 sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 text-gray-600 hover:text-gray-800 touch-manipulation">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-800">ExoBuffer</h1>
            </div>
          </div>
          <ConnectionStatus
            isConnected={isConnected}
            reconnectCount={reconnectCount}
            onReconnect={reconnect}
          />
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* Source Selector - Collapsible */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="来源标识"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
          />
          <button
            onClick={() => setSource(DEFAULT_SOURCE)}
            className="p-2.5 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-xl touch-manipulation"
            title="重置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <MessageList messages={messages} loading={loading} />
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
