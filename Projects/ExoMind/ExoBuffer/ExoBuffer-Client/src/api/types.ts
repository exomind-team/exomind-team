// ExoBuffer API Types

export interface FactMeta {
  sender?: string;
  reply_to?: string;
  clipboard?: boolean;
  ip?: string;
}

export interface Fact {
  fact_id: string;
  content: string;
  source: string;
  timestamp: number;
  meta: FactMeta;
}

export interface Analysis {
  analysis_id: string;
  fact_id: string;
  content: string;
  timestamp: number;
}

export interface CreateFactRequest {
  content: string;
  source: string;
  meta?: FactMeta;
}

export interface CreateFactResponse {
  fact_id: string;
  success: boolean;
}

export interface EventsResponse {
  type: 'fact' | 'analysis' | 'heartbeat';
  data: Fact | Analysis;
  timestamp: number;
}
