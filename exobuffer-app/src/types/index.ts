export interface MessageMeta {
  clipboard?: boolean
  sender?: string
  reply_to?: string
}

export interface Message {
  fact_id: string
  content: string
  source: string
  timestamp: number
  meta: MessageMeta
}

export interface SendMessagePayload {
  content: string
  source: string
  meta: MessageMeta
}
