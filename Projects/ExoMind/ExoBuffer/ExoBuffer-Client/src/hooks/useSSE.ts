import { useState, useEffect, useCallback, useRef } from 'react';
import type { Fact, Analysis } from '../api/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseSSEOptions {
  onFact?: (fact: Fact) => void;
  onAnalysis?: (analysis: Analysis) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function useSSE(options: UseSSEOptions = {}) {
  const { onFact, onAnalysis, onError, onOpen } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`${API_BASE}/api/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setReconnectCount(0);
      onOpen?.();
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      onError?.(event);
      eventSource.close();

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        setReconnectCount((prev) => prev + 1);
        connect();
      }, 3000);
    };

    eventSource.addEventListener('new_fact', (event) => {
      try {
        const fact = JSON.parse(event.data) as Fact;
        onFact?.(fact);
      } catch (e) {
        console.error('Failed to parse fact event:', e);
      }
    });

    // 兼容旧事件名 'fact'
    eventSource.addEventListener('fact', (event) => {
      try {
        const fact = JSON.parse(event.data) as Fact;
        onFact?.(fact);
      } catch (e) {
        console.error('Failed to parse fact event:', e);
      }
    });

    eventSource.addEventListener('analysis', (event) => {
      try {
        const analysis = JSON.parse(event.data) as Analysis;
        onAnalysis?.(analysis);
      } catch (e) {
        console.error('Failed to parse analysis event:', e);
      }
    });
  }, [onFact, onAnalysis, onError, onOpen]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectCount,
    reconnect: connect,
    disconnect,
  };
}
