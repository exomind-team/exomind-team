import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectCount: number;
  onReconnect?: () => void;
}

export function ConnectionStatus({ isConnected, reconnectCount, onReconnect }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Wifi className="w-3 h-3" />
          已连接
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <WifiOff className="w-3 h-3" />
          断开连接
          {reconnectCount > 0 && (
            <span className="ml-1">({reconnectCount})</span>
          )}
        </span>
      )}

      {reconnectCount > 0 && onReconnect && (
        <button
          onClick={onReconnect}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="重新连接"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
