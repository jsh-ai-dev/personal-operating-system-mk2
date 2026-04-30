"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getAllModels,
  getConversation,
  getMessages,
  deleteMessage,
  setMessageHidden,
  streamChat,
  summarizeConversation,
  updateMessageContent,
  type AiModel,
  type ChatDoneEvent,
  type Conversation,
  type Message,
} from "@/features/mk3/application/chatApi";
import styles from "@/features/mk3/ui/Mk3ChatRoom.module.css";

type Props = { initialId: string };
const IMPORT_MODELS = new Set(["codex", "claude-code", "claude", "gemini"]);
const IMPORT_LABELS: Record<string, string> = {
  codex: "JetBrains · Codex",
  "claude-code": "Claude Code",
  claude: "Claude.ai",
  gemini: "Gemini",
};

export function Mk3ChatRoom({ initialId }: Props) {
  const router = useRouter();
  const isNew = initialId === "new";
  const [conversationId, setConversationId] = useState<string | null>(isNew ? null : initialId);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [summaryModel, setSummaryModel] = useState("gpt-5-mini");
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryCostUsd, setSummaryCostUsd] = useState<number | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);
  const streamingRef = useRef("");

  function fitEditHeight(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    async function boot() {
      const [allModels, conv, existingMessages] = await Promise.all([
        getAllModels(),
        conversationId ? getConversation(conversationId).catch(() => null) : Promise.resolve(null),
        conversationId ? getMessages(conversationId).catch(() => []) : Promise.resolve([]),
      ]);
      setConversation(conv);
      setModels(allModels);
      const prior = existingMessages.find((m) => m.role === "assistant")?.model ?? "";
      setSelectedModel(allModels.find((m) => m.id === prior)?.id ?? allModels[0]?.id ?? "");
      setMessages(existingMessages);
      setSummary(conv?.summary ?? null);
      setSummaryCostUsd(conv?.summary_cost_usd ?? null);
      if (conv?.summary) setSummaryOpen(false);
    }
    void boot();
  }, [conversationId]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, streamingText]);

  const selected = useMemo(() => models.find((m) => m.id === selectedModel), [models, selectedModel]);
  const summaryModels = useMemo(() => models.filter((m) => m.provider === "openai"), [models]);
  const readOnly = useMemo(() => {
    if (isNew) return false;
    if (conversation && IMPORT_MODELS.has(conversation.model)) return true;
    const assistantModel = messages.find((m) => m.role === "assistant")?.model ?? "";
    return assistantModel === "";
  }, [isNew, conversation, messages]);
  const readOnlyLabel = useMemo(
    () => IMPORT_LABELS[conversation?.model ?? ""] ?? "가져온 대화",
    [conversation?.model],
  );

  async function refreshMessages(targetId: string) {
    const data = await getMessages(targetId).catch(() => []);
    setMessages(data);
  }

  async function toggleHidden(msg: Message) {
    if (msg.id.startsWith("temp-")) return;
    await setMessageHidden(msg.id, !msg.is_hidden);
    if (conversationId) await refreshMessages(conversationId);
  }

  async function removeMessage(msg: Message) {
    if (msg.id.startsWith("temp-")) return;
    if (!window.confirm("이 말풍선을 삭제할까요?")) return;
    await deleteMessage(msg.id);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
  }

  function startEdit(msg: Message) {
    setEditingId(msg.id);
    setEditContent(msg.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function saveEdit(msg: Message) {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === msg.content) {
      cancelEdit();
      return;
    }
    await updateMessageContent(msg.id, trimmed);
    if (conversationId) await refreshMessages(conversationId);
    cancelEdit();
  }

  async function doSummarize() {
    if (!conversationId || summarizing) return;
    setSummarizing(true);
    setError("");
    try {
      const result = await summarizeConversation(conversationId, summaryModel);
      setSummary(result.summary);
      setSummaryCostUsd(result.cost_usd);
      setSummaryOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "요약 실패");
    } finally {
      setSummarizing(false);
    }
  }

  function renderSummary(text: string) {
    return text
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^---$/gm, "<hr>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  async function send() {
    const text = input.trim();
    if (!text || !selected || streaming || readOnly) return;

    setInput("");
    setStreaming(true);
    setStreamingText("");
    streamingRef.current = "";
    setError("");

    const tempUser: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId ?? "",
      role: "user",
      content: text,
      model: null,
      tokens_input: null,
      tokens_output: null,
      cost_usd: null,
      created_at: new Date().toISOString(),
      is_hidden: false,
    };
    setMessages((prev) => [...prev, tempUser]);

    try {
      await streamChat(
        selected.provider,
        { conversationId, model: selected.id, message: text },
        (chunk) => {
          streamingRef.current += chunk;
          setStreamingText(streamingRef.current);
        },
        (done: ChatDoneEvent) => {
          setMessages((prev) => [
            ...prev,
            {
              id: done.message_id,
              conversation_id: done.conversation_id,
              role: "assistant",
              content: streamingRef.current,
              model: selected.id,
              tokens_input: done.tokens_input,
              tokens_output: done.tokens_output,
              cost_usd: done.cost_usd,
              created_at: new Date().toISOString(),
              is_hidden: false,
            },
          ]);
          setStreamingText("");
          if (!conversationId) {
            setConversationId(done.conversation_id);
            router.replace(`/mk3/chat/${done.conversation_id}`);
          }
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "전송 실패");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/mk3/chat" className={styles.back}>← 목록으로</Link>
        {!readOnly ? (
          <select className={styles.model} value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={streaming || !!conversationId}>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.provider}] {m.id}
              </option>
            ))}
          </select>
        ) : null}
        {readOnly ? <span className={styles.readonly}>{readOnlyLabel}</span> : null}
      </header>
      {!isNew ? (
        <div className={styles.summaryBar}>
          <select className={styles.summaryModel} value={summaryModel} onChange={(e) => setSummaryModel(e.target.value)} disabled={summarizing}>
            {summaryModels.map((m) => (
              <option key={m.id} value={m.id}>{m.id}</option>
            ))}
          </select>
          <button type="button" className={styles.summaryBtn} onClick={() => void doSummarize()} disabled={summarizing}>
            {summarizing ? "요약 중…" : summary ? "재요약" : "요약하기"}
          </button>
          {summaryCostUsd != null ? <span className={styles.summaryCost}>${summaryCostUsd.toFixed(4)}</span> : null}
        </div>
      ) : null}
      {summary ? (
        <div className={styles.summaryPanel}>
          <button type="button" className={styles.summaryToggle} onClick={() => setSummaryOpen((v) => !v)}>
            {summaryOpen ? "▲ 요약 접기" : "▼ 요약 보기"}
          </button>
          {summaryOpen ? <div className={styles.summaryBody} dangerouslySetInnerHTML={{ __html: renderSummary(summary) }} /> : null}
        </div>
      ) : null}
      <div ref={boxRef} className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.msg} ${msg.role === "user" ? styles.user : styles.assistant}`}>
            <div className={styles.msgWrap}>
              {msg.is_hidden ? (
                <button type="button" className={styles.hiddenBubble} onClick={() => void toggleHidden(msg)}>
                  숨긴 메시지 · 클릭해서 복원
                </button>
              ) : editingId === msg.id ? (
                <div className={styles.editWrap}>
                  <textarea
                    className={styles.editInput}
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      fitEditHeight(e.currentTarget);
                    }}
                    ref={(el) => {
                      if (el) fitEditHeight(el);
                    }}
                  />
                  <div className={styles.editActions}>
                    <button type="button" className={styles.smallBtnPrimary} onClick={() => void saveEdit(msg)}>저장</button>
                    <button type="button" className={styles.smallBtn} onClick={cancelEdit}>취소</button>
                  </div>
                </div>
              ) : (
                <div className={styles.bubbleRow}>
                  <div className={styles.bubble}>{msg.content}</div>
                  {!msg.id.startsWith("temp-") ? (
                    <div className={styles.msgActions}>
                      <button type="button" className={styles.msgBtn} onClick={() => startEdit(msg)}>수정</button>
                      <button type="button" className={styles.msgBtn} onClick={() => void toggleHidden(msg)}>{msg.is_hidden ? "복원" : "숨김"}</button>
                      <button type="button" className={`${styles.msgBtn} ${styles.msgBtnDelete}`} onClick={() => void removeMessage(msg)}>삭제</button>
                    </div>
                  ) : null}
                </div>
              )}
              {msg.role === "assistant" && msg.cost_usd != null ? (
                <div className={styles.meta}>
                  {msg.tokens_input?.toLocaleString()} in / {msg.tokens_output?.toLocaleString()} out · ${msg.cost_usd.toFixed(4)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {streaming ? (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <div className={styles.bubble}>{streamingText || "..."}</div>
          </div>
        ) : null}
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      {!readOnly ? <div className={styles.composer}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="메시지 입력"
          disabled={streaming}
        />
        <button type="button" className={styles.send} onClick={() => void send()} disabled={streaming || !input.trim()}>
          {streaming ? "..." : "전송"}
        </button>
      </div> : null}
    </main>
  );
}
