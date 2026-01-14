import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { Message, SendMessagePayload } from '../types'
import { fetchMessages, sendMessage, createSSEConnection } from '../services/api'

interface MessageContextType {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string, replyTo?: string) => Promise<void>
  refresh: () => Promise<void>
  replyingTo: Message | null
  setReplyingTo: (message: Message | null) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const lastMessageRef = useRef<Message | null>(null)

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchMessages(50)
      setMessages(data)
      setError(null)
      if (data.length > 0) {
        lastMessageRef.current = data[data.length - 1]
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleNewMessage = useCallback((data: string) => {
    try {
      const newMessage: Message = JSON.parse(data)
      // Check if message already exists
      setMessages((prev) => {
        if (prev.some((m) => m.fact_id === newMessage.fact_id)) {
          return prev
        }
        return [...prev, newMessage]
      })
      lastMessageRef.current = newMessage
    } catch (err) {
      console.error('Failed to parse SSE message:', err)
    }
  }, [])

  useEffect(() => {
    refresh()

    // Set up SSE connection
    cleanupRef.current = createSSEConnection(handleNewMessage)

    // Cleanup
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [refresh, handleNewMessage])

  const handleSendMessage = async (content: string, replyTo?: string) => {
    const payload: SendMessagePayload = {
      content,
      source: 'mobile-app',
      meta: {
        clipboard: false,
        sender: 'Mobile User',
      },
    }

    if (replyTo) {
      payload.meta.reply_to = replyTo
    }

    try {
      await sendMessage(payload)
      setReplyingTo(null)
      // Messages will update via SSE
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to send message')
    }
  }

  return (
    <MessageContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage: handleSendMessage,
        refresh,
        replyingTo,
        setReplyingTo,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return context
}
