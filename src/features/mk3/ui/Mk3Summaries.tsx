"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { generateQuiz, type Conversation, listConversations } from "@/features/mk3/application/chatApi";
import styles from "@/features/mk3/ui/Mk3Summaries.module.css";

type ServiceFilterKey =
  | "openai"
  | "anthropic"
  | "google"
  | "jetbrains-codex"
  | "claude-export"
  | "claude-code"
  | "gemini-takeout"
  | "chatgpt"
  | "gemini-code-assist"
  | "copilot"
  | "cursor";

const SERVICE_FILTERS: Array<{ key: ServiceFilterKey; label: string; emoji: string }> = [
  { key: "chatgpt", label: "ChatGPT", emoji: "💬" },
  { key: "openai", label: "ChatGPT API", emoji: "🧠" },
  { key: "jetbrains-codex", label: "Codex", emoji: "🛠️" },
  { key: "gemini-takeout", label: "Gemini", emoji: "💎" },
  { key: "google", label: "Gemini API", emoji: "🔷" },
  { key: "gemini-code-assist", label: "Gemini Code Assist", emoji: "🧩" },
  { key: "claude-export", label: "Claude", emoji: "🟠" },
  { key: "anthropic", label: "Claude API", emoji: "🧡" },
  { key: "claude-code", label: "Claude Code", emoji: "💻" },
  { key: "copilot", label: "Copilot", emoji: "🛫" },
  { key: "cursor", label: "Cursor", emoji: "⌨️" },
];
const OPENAI_MODELS = [
  { id: "gpt-5-nano", label: "GPT-5 Nano" },
  { id: "gpt-5-mini", label: "GPT-5 Mini" },
  { id: "gpt-5", label: "GPT-5" },
];

function sourceLabel(conv: Conversation) {
  const byModel: Record<string, string> = {
    codex: "JetBrains",
    "claude-code": "Claude Code",
    claude: "Claude.ai",
    gemini: "Gemini",
  };
  if (byModel[conv.model]) return byModel[conv.model];
  const byProvider: Record<string, string> = {
    openai: "ChatGPT API",
    anthropic: "Claude",
    google: "Gemini",
  };
  return byProvider[conv.provider] ?? conv.provider;
}

function conversationFilterKey(conv: Conversation): ServiceFilterKey {
  if (conv.model === "codex") return "jetbrains-codex";
  if (conv.model === "claude-code") return "claude-code";
  if (conv.model === "claude") return "claude-export";
  if (conv.model === "gemini") return "gemini-takeout";
  if (conv.provider === "openai") return "openai";
  if (conv.provider === "anthropic") return "anthropic";
  if (conv.provider === "google") return "google";
  return "openai";
}

function renderSummary(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function formatCost(cost: number | null): string {
  if (cost == null) return "-";
  if (cost === 0) return "$0";
  if (cost < 0.0001) return "<$0.0001";
  return `$${cost.toFixed(4)}`;
}

export function Mk3Summaries() {
  const searchParams = useSearchParams();
  const openSummaryId = searchParams.get("open");
  const [all, setAll] = useState<Conversation[]>([]);
  const [activeFilters, setActiveFilters] = useState<ServiceFilterKey[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<"7d" | "30d" | "month" | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [quizModelById, setQuizModelById] = useState<Record<string, string>>({});
  const [quizCostById, setQuizCostById] = useState<Record<string, number | null>>({});
  const [quizGenerating, setQuizGenerating] = useState<Set<string>>(new Set());
  const [quizErrorById, setQuizErrorById] = useState<Record<string, string>>({});

  function dateOnly(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function applyRangePreset(preset: "7d" | "30d" | "month") {
    const now = new Date();
    const end = dateOnly(now);
    if (preset === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setDateFrom(dateOnly(start));
      setDateTo(end);
      setSelectedPreset(preset);
      return;
    }
    const days = preset === "7d" ? 6 : 29;
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    setDateFrom(dateOnly(start));
    setDateTo(end);
    setSelectedPreset(preset);
  }

  useEffect(() => {
    void listConversations().then(setAll).catch(() => setAll([]));
  }, []);

  const summarized = useMemo(() => all.filter((c) => Boolean(c.summary)), [all]);
  const filtered = useMemo(() => {
    const byService =
      activeFilters.length === 0
        ? summarized
        : summarized.filter((c) => activeFilters.includes(conversationFilterKey(c)));
    return byService.filter((conv) => {
      const created = new Date(conv.created_at);
      if (Number.isNaN(created.getTime())) return false;
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (created < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);
        if (created > to) return false;
      }
      return true;
    });
  }, [summarized, activeFilters, dateFrom, dateTo]);

  useEffect(() => {
    if (!openSummaryId) return;
    if (!filtered.some((conv) => conv.id === openSummaryId)) return;
    setExpanded((prev) => {
      if (prev.has(openSummaryId)) return prev;
      const next = new Set(prev);
      next.add(openSummaryId);
      return next;
    });
  }, [openSummaryId, filtered]);

  useEffect(() => {
    if (!openSummaryId) return;
    if (!filtered.some((conv) => conv.id === openSummaryId)) return;
    const target = document.getElementById(`summary-${openSummaryId}`);
    if (!target) return;
    window.requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }, [openSummaryId, filtered]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFilter(key: ServiceFilterKey) {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));
  }

  function selectedQuizModel(conv: Conversation): string {
    return quizModelById[conv.id] ?? conv.quiz_model ?? "gpt-5-mini";
  }

  async function createQuiz(conv: Conversation) {
    const model = selectedQuizModel(conv);
    setQuizGenerating((prev) => new Set(prev).add(conv.id));
    setQuizErrorById((prev) => ({ ...prev, [conv.id]: "" }));
    try {
      const result = await generateQuiz(conv.id, model);
      setQuizCostById((prev) => ({ ...prev, [conv.id]: result.cost_usd }));
      setAll((prev) => prev.map((c) => (c.id === conv.id ? { ...c, quiz_model: model, quiz_cost_usd: result.cost_usd, quiz: result.quiz } : c)));
    } catch (e) {
      setQuizErrorById((prev) => ({ ...prev, [conv.id]: e instanceof Error ? e.message : "퀴즈 생성 실패" }));
    } finally {
      setQuizGenerating((prev) => {
        const next = new Set(prev);
        next.delete(conv.id);
        return next;
      });
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI Summary</h1>
      </header>
      <section className={styles.filterRow}>
        {SERVICE_FILTERS.map((f) => {
          const active = activeFilters.includes(f.key);
          return (
            <button key={f.key} type="button" className={`${styles.filterChip} ${active ? styles.filterChipActive : ""}`} onClick={() => toggleFilter(f.key)}>
              <span>{f.emoji}</span> {f.label}
            </button>
          );
        })}
        <button type="button" className={styles.filterClear} onClick={() => setActiveFilters([])}>
          선택 해제
        </button>
      </section>
      <section className={styles.dateFilterRow}>
        <label className={styles.dateLabel}>
          시작일
          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setSelectedPreset(null);
            }}
          />
        </label>
        <label className={styles.dateLabel}>
          종료일
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setSelectedPreset(null);
            }}
          />
        </label>
        <button type="button" className={`${styles.presetBtn} ${selectedPreset === "7d" ? styles.presetBtnActive : ""}`} onClick={() => applyRangePreset("7d")}>
          최근 7일
        </button>
        <button type="button" className={`${styles.presetBtn} ${selectedPreset === "30d" ? styles.presetBtnActive : ""}`} onClick={() => applyRangePreset("30d")}>
          최근 30일
        </button>
        <button type="button" className={`${styles.presetBtn} ${selectedPreset === "month" ? styles.presetBtnActive : ""}`} onClick={() => applyRangePreset("month")}>
          이번 달
        </button>
        <button type="button" className={styles.filterClear} onClick={() => { setDateFrom(""); setDateTo(""); setSelectedPreset(null); }}>
          기간 해제
        </button>
      </section>

      {filtered.length > 0 ? (
        <section className={styles.list}>
          {filtered.map((conv) => (
            <article key={conv.id} id={`summary-${conv.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.meta}>
                  <span className={`${styles.badge} ${styles[`badge_${conv.provider}`] ?? ""}`}>
                    {sourceLabel(conv)}
                  </span>
                  <span className={styles.modelTag}>{conv.summary_model ?? "-"}</span>
                  <span className={styles.cost}>{formatCost(conv.summary_cost_usd)}</span>
                  <span className={styles.date}>
                    생성 {new Date(conv.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link href={`/mk3/chat/${conv.id}`} className={styles.viewLink}>대화 보기 →</Link>
                </div>
                <div className={styles.titleRow}>
                  <span className={styles.cardTitle}>{conv.title}</span>
                  <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(conv.id)}>
                    {expanded.has(conv.id) ? "▲ 접기" : "▼ 내용 보기"}
                  </button>
                </div>
              </div>
              {expanded.has(conv.id) ? (
                <div className={styles.body}>
                  <div className={styles.quizBar}>
                    <select
                      className={styles.quizSelect}
                      value={selectedQuizModel(conv)}
                      onChange={(e) => setQuizModelById((prev) => ({ ...prev, [conv.id]: e.target.value }))}
                      disabled={quizGenerating.has(conv.id)}
                    >
                      {OPENAI_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <button type="button" className={styles.quizBtn} onClick={() => void createQuiz(conv)} disabled={quizGenerating.has(conv.id)}>
                      {quizGenerating.has(conv.id) ? "퀴즈 생성 중..." : (conv.quiz?.length ? "재생성" : "퀴즈 만들기")}
                    </button>
                    {(quizCostById[conv.id] ?? conv.quiz_cost_usd) != null ? (
                      <span className={styles.quizCost}>
                        {formatCost(quizCostById[conv.id] ?? conv.quiz_cost_usd ?? null)}
                      </span>
                    ) : null}
                  </div>
                  {quizErrorById[conv.id] ? <p className={styles.quizError}>{quizErrorById[conv.id]}</p> : null}
                  <div
                    className={`${styles.summaryContent} ${styles.summaryExpanded}`}
                    dangerouslySetInnerHTML={{ __html: renderSummary(conv.summary ?? "") }}
                  />
                  <div className={styles.bodyActions}>
                    <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(conv.id)}>
                      ▲ 접기
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <section className={styles.empty}>아직 요약된 대화가 없습니다.</section>
      )}
    </main>
  );
}
