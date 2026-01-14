import type { Fact, Analysis, CreateFactRequest, CreateFactResponse, FactMeta } from './types';
import { API_BASE } from '../App';


// ==================== Fact API ====================

export async function createFact(data: CreateFactRequest): Promise<CreateFactResponse> {
  const response = await fetch(`${API_BASE}/api/fact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create fact: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchFacts(since?: number, limit?: number): Promise<Fact[]> {
  const params = new URLSearchParams();
  if (since) params.set('since', since.toString());
  if (limit) params.set('limit', limit.toString());

  const response = await fetch(`${API_BASE}/api/facts?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch facts: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAnalysis(factId?: string): Promise<Analysis[]> {
  const params = new URLSearchParams();
  if (factId) params.set('fact_id', factId);

  const response = await fetch(`${API_BASE}/api/analysis?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis: ${response.statusText}`);
  }

  return response.json();
}

// ==================== SSE Event Stream ====================

export type EventType = 'fact' | 'analysis' | 'heartbeat';

export interface SSEEvent {
  type: EventType;
  data: Fact | Analysis;
  timestamp: number;
}

type EventCallback = (event: SSEEvent) => void;
type ErrorCallback = (error: Event) => void;

export function createEventSource(
  onMessage: EventCallback,
  onError?: ErrorCallback,
  onOpen?: () => void
): EventSource {
  const eventSource = new EventSource(`${API_BASE}/api/events`);

  eventSource.onopen = () => {
    console.log('[SSE] Connected to events stream');
    onOpen?.();
  };

  eventSource.onmessage = (event) => {
    try {
      const data: SSEEvent = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('[SSE] Failed to parse event:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('[SSE] Connection error:', error);
    eventSource.close();
    onError?.(error);
  };

  return eventSource;
}

export function closeEventSource(eventSource: EventSource | null): void {
  if (eventSource) {
    eventSource.close();
  }
}

// ==================== Utility Functions ====================

export function buildFactId(): string {
  return `f-${Math.random().toString(36).substring(2, 15)}`;
}

export function now(): number {
  return Date.now();
}
