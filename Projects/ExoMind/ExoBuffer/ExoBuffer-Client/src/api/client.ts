import type { Fact, Analysis, CreateFactRequest, CreateFactResponse } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
