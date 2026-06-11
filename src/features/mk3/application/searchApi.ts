export type SearchResult = {
  conversation_id: string;
  title: string;
  model: string;
  provider: string;
  summary: boolean;
  message_count: number;
  total_cost_usd: number;
  created_at: string;
  score: number;
};

export type SearchResponse = {
  results: SearchResult[];
  cost_usd: number;
};

export type IndexResponse = {
  indexed: number;
  skipped: number;
  failed: number;
  total: number;
  cost_usd: number;
};

export type RagAnswerStatus = "answered" | "insufficient_grounding";

export type RagAnswerSource = {
  conversation_id: string;
  title: string;
  summary_excerpt: string;
  created_at: string;
  provider: string;
  model: string;
  score: number;
  href: string;
};

export type RagAnswerResponse = {
  status: RagAnswerStatus;
  answer: string;
  sources: RagAnswerSource[];
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  search_cost_usd: number;
  message: string;
};

async function readJsonSafe<T>(res: Response, fallback: T): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function searchConversations(query: string, limit = 10): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`/api/mk3/v1/search?${params.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return readJsonSafe<SearchResponse>(res, { results: [], cost_usd: 0 });
}

export async function indexAllConversations(): Promise<IndexResponse> {
  const res = await fetch("/api/mk3/v1/search/index", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return readJsonSafe<IndexResponse>(res, {
    indexed: 0,
    skipped: 0,
    failed: 0,
    total: 0,
    cost_usd: 0,
  });
}

export async function generateRagAnswer(query: string, limit = 5): Promise<RagAnswerResponse> {
  const res = await fetch("/api/mk3/v1/search/answer", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return readJsonSafe<RagAnswerResponse>(res, {
    status: "insufficient_grounding",
    answer: "",
    sources: [],
    model: "gpt-5-mini",
    tokens_input: 0,
    tokens_output: 0,
    cost_usd: 0,
    search_cost_usd: 0,
    message: "관련 요약 대화가 부족합니다. 먼저 관련 대화를 요약하거나 검색어를 구체화하세요.",
  });
}
