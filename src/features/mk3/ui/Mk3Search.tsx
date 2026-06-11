"use client";

import { useState } from "react";

import {
  generateRagAnswer,
  indexAllConversations,
  searchConversations,
  type IndexResponse,
  type RagAnswerResponse,
  type SearchResult,
} from "@/features/mk3/application/searchApi";
import styles from "@/features/mk3/ui/Mk3Search.module.css";

function sourceLabel(model: string, provider: string): string {
  const byModel: Record<string, string> = {
    codex: "Codex",
    "claude-code": "Claude Code",
    claude: "Claude",
    gemini: "Gemini",
    chatgpt: "ChatGPT",
  };
  if (byModel[model]) return byModel[model];
  const byProvider: Record<string, string> = {
    openai: "ChatGPT API",
    anthropic: "Claude API",
    google: "Gemini API",
  };
  return byProvider[provider] ?? provider;
}

function isApi(model: string): boolean {
  return !["codex", "claude-code", "claude", "gemini", "chatgpt"].includes(model);
}

function formatCost(cost: number): string {
  if (cost === 0) return "$0";
  if (cost < 0.0001) return "<$0.0001";
  return `$${cost.toFixed(4)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scorePercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function scoreColor(score: number): string {
  if (score >= 0.8) return "#22c55e";
  if (score >= 0.6) return "#f59e0b";
  return "#9ca3af";
}

export function Mk3Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState<IndexResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<RagAnswerResponse | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed || isSearching) return;

    setError(null);
    setAnswerError(null);
    setAnswer(null);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await searchConversations(trimmed);
      setResults(response.results);
    } catch {
      setError("검색 중 오류가 발생했습니다.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleGenerateAnswer() {
    const trimmed = query.trim();
    if (!trimmed || isAnswering) return;

    setAnswerError(null);
    setAnswer(null);
    setIsAnswering(true);
    try {
      const response = await generateRagAnswer(trimmed);
      setAnswer(response);
    } catch {
      setAnswerError("답변 생성 중 오류가 발생했습니다. 검색 결과는 유지됩니다.");
    } finally {
      setIsAnswering(false);
    }
  }

  async function handleIndexAll() {
    setError(null);
    setIsIndexing(true);
    setIndexResult(null);
    try {
      const response = await indexAllConversations();
      setIndexResult(response);
    } catch {
      setError("인덱싱 중 오류가 발생했습니다.");
    } finally {
      setIsIndexing(false);
    }
  }

  function handleEnterPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    void handleSearch();
  }

  function openConversation(id: string) {
    window.open(`/mk3/chat/${id}`, "_blank", "noopener,noreferrer");
  }

  const canGenerateAnswer = hasSearched && results.length > 0 && !isSearching;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI Search</h1>
        <button
          type="button"
          className={styles.headerButton}
          disabled={isIndexing}
          onClick={() => void handleIndexAll()}
        >
          {isIndexing ? "인덱싱 중..." : "전체 대화 인덱싱"}
        </button>
      </header>

      <div className={styles.searchBox}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          className={styles.searchInput}
          autoComplete="off"
          placeholder="예: MSA 서비스 간 트랜잭션 처리, AWS 보안 그룹 설정, AI 시스템 프롬프트 작성법..."
          onKeyDown={handleEnterPress}
        />
        <button
          type="button"
          className={styles.searchButton}
          disabled={isSearching || !query.trim()}
          onClick={() => void handleSearch()}
        >
          {isSearching ? "..." : "검색"}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.indexSection}>
        {indexResult ? (
          <span className={styles.indexResult}>
            {indexResult.indexed}건 인덱싱 / {indexResult.skipped}건 스킵 / {indexResult.total}건 전체 · $
            {indexResult.cost_usd.toFixed(6)}
            {indexResult.failed > 0 ? <span className={styles.failed}> ({indexResult.failed}건 실패)</span> : null}
          </span>
        ) : null}
      </div>

      {canGenerateAnswer ? (
        <section className={styles.answerSection}>
          <div className={styles.answerHeader}>
            <div>
              <h2 className={styles.answerTitle}>검색 결과 기반 답변</h2>
              <p className={styles.answerHint}>요약된 과거 대화만 근거로 사용하고, 출처 대화 링크를 함께 보여줍니다.</p>
            </div>
            <button
              type="button"
              className={styles.answerButton}
              disabled={isAnswering}
              onClick={() => void handleGenerateAnswer()}
            >
              {isAnswering ? "답변 생성 중..." : "근거로 답변 생성"}
            </button>
          </div>

          {answerError ? <p className={styles.answerError}>{answerError}</p> : null}

          {answer ? (
            <div className={styles.answerPanel}>
              {answer.status === "answered" ? (
                <>
                  <p className={styles.answerText}>{answer.answer}</p>
                  <div className={styles.answerMeta}>
                    <span>모델 {answer.model}</span>
                    <span>
                      토큰 {answer.tokens_input.toLocaleString("ko-KR")} in /{" "}
                      {answer.tokens_output.toLocaleString("ko-KR")} out
                    </span>
                    <span>
                      비용 {formatCost(answer.cost_usd)} · 검색 {formatCost(answer.search_cost_usd)}
                    </span>
                  </div>
                  <div className={styles.sourceList}>
                    {answer.sources.map((source) => (
                      <article key={source.conversation_id} className={styles.sourceCard}>
                        <div className={styles.sourceCardTop}>
                          <span className={`${styles.badge} ${styles[`badge_${source.provider}`] ?? ""}`}>
                            {sourceLabel(source.model, source.provider)}
                          </span>
                          <span className={styles.score} style={{ color: scoreColor(source.score) }}>
                            유사도 {scorePercent(source.score)}
                          </span>
                        </div>
                        <h3 className={styles.sourceTitle}>{source.title || "(untitled)"}</h3>
                        <p className={styles.sourceExcerpt}>{source.summary_excerpt}</p>
                        <div className={styles.sourceFooter}>
                          <span>생성 {formatDate(source.created_at)}</span>
                          <a className={styles.sourceLink} href={source.href} target="_blank" rel="noreferrer">
                            출처 대화 열기 →
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.insufficient}>
                  <p>{answer.message || "관련 요약 대화가 부족합니다."}</p>
                  <span>검색 결과 중 요약이 없는 대화는 답변 근거로 사용하지 않습니다.</span>
                </div>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {hasSearched && !isSearching ? (
        <section className={styles.resultsSection}>
          {results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((result) => (
                <article key={result.conversation_id} className={styles.resultCard}>
                  <div className={styles.resultMeta}>
                    <div className={styles.resultMetaLeft}>
                      <span className={`${styles.badge} ${styles[`badge_${result.provider}`] ?? ""}`}>
                        {sourceLabel(result.model, result.provider)}
                      </span>
                      {isApi(result.model) && <span className={styles.modelText}>{result.model}</span>}
                      {isApi(result.model) && <span className={styles.cost}>{formatCost(result.total_cost_usd)}</span>}
                    </div>
                    <button
                      type="button"
                      className={styles.viewButton}
                      onClick={() => openConversation(result.conversation_id)}
                    >
                      대화 보기 →
                    </button>
                  </div>
                  <div className={styles.titleLine}>
                    {result.summary && <span className={styles.summaryBadge}>요약</span>}
                    <span className={styles.resultTitle}>{result.title || "(untitled)"}</span>
                  </div>
                  <div className={styles.resultSub}>
                    <span>메시지 {result.message_count}개 · 생성 {formatDate(result.created_at)}</span>
                    <span className={styles.score} style={{ color: scoreColor(result.score) }}>
                      유사도 {scorePercent(result.score)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>관련 대화를 찾지 못했습니다.</p>
              <p className={styles.emptyHint}>아직 인덱싱이 안 됐다면 위의 &quot;전체 대화 인덱싱&quot;을 먼저 실행해보세요.</p>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
