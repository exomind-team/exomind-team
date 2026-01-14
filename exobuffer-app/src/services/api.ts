import { Message, SendMessagePayload } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function fetchMessages(limit?: number, since?: number): Promise<Message[]> {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (since) params.append('since', since.toString())

  const url = `${API_BASE}/api/facts?${params.toString()}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`)
  }
  return response.json()
}

export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  const response = await fetch(`${API_BASE}/api/fact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`)
  }
  return response.json()
}

export function createSSEConnection(
  onMessage: (data: string) => void,
  onError?: (error: Event) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/events`)

  eventSource.onmessage = (event) => {
    onMessage(event.data)
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    onError?.(error)
    eventSource.close()
  }

  // Return cleanup function
  return () => {
    eventSource.close()
  }
}
