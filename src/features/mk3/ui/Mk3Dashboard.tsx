"use client";

import { useState } from "react";

import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type FetchState = {
  loading: boolean;
  status: number | null;
  body: unknown;
  error: string | null;
};

const initialState: FetchState = {
  loading: false,
  status: null,
  body: null,
  error: null,
};

async function readJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return await res.text();
  }
}

export function Mk3Dashboard() {
  const [health, setHealth] = useState<FetchState>(initialState);
  const [models, setModels] = useState<FetchState>(initialState);
  const [services, setServices] = useState<FetchState>(initialState);
  const [openAiModels, setOpenAiModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);

  async function runFetch(
    url: string,
    setter: (state: FetchState) => void,
  ) {
    setter({ loading: true, status: null, body: null, error: null });
    try {
      const res = await fetch(url, { method: "GET", credentials: "include" });
      const payload = await readJsonSafe(res);
      setter({
        loading: false,
        status: res.status,
        body: payload,
        error: res.ok ? null : "요청은 도달했지만 성공 응답이 아닙니다.",
      });
    } catch (e) {
      setter({
        loading: false,
        status: null,
        body: null,
        error: e instanceof Error ? e.message : "요청에 실패했습니다.",
      });
    }
  }

  async function loadOpenAiModelsForChat() {
    await runFetch("/api/mk3/v1/chat/openai/models", (state) => {
      setModels(state);
      if (state.status === 200 && Array.isArray(state.body)) {
        const ids = state.body
          .map((item: unknown) => {
            if (item && typeof item === "object" && "id" in item) {
              const id = (item as { id?: unknown }).id;
              return typeof id === "string" ? id : null;
            }
            return null;
          })
          .filter((id: string | null): id is string => Boolean(id));
        setOpenAiModels(ids);
        setSelectedModel((prev) => (prev || ids[0] || ""));
      }
    });
  }

  async function sendOpenAiChat() {
    if (!selectedModel) {
      setStreamError("먼저 OpenAI 모델을 불러와 선택해 주세요.");
      return;
    }
    if (!message.trim()) {
      setStreamError("메시지를 입력해 주세요.");
      return;
    }
    setStreaming(true);
    setStreamError(null);
    setStreamText("");

    let res: Response;
    try {
      res = await fetch("/api/mk3/v1/chat/openai", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          model: selectedModel,
          message,
        }),
      });
    } catch (e) {
      setStreaming(false);
      setStreamError(e instanceof Error ? e.message : "요청에 실패했습니다.");
      return;
    }

    if (!res.ok || !res.body) {
      setStreaming(false);
      const payload = await readJsonSafe(res);
      setStreamError(
        typeof payload === "string"
          ? payload
          : `요청 실패 (HTTP ${res.status})`,
      );
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const event = JSON.parse(raw) as {
                type?: string;
                content?: string;
                message?: string;
                conversation_id?: string;
              };
              if (event.type === "chunk") {
                setStreamText((prev) => prev + (event.content ?? ""));
              } else if (event.type === "done") {
                if (event.conversation_id) {
                  setConversationId(event.conversation_id);
                }
              } else if (event.type === "error") {
                setStreamError(event.message ?? "mk3 스트림 처리 중 오류가 발생했습니다.");
              }
            } catch {
              // ignore parse errors for partial or non-json events
            }
          }
        }
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <section className={styles.page} aria-label="mk3 연결 점검">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>mk3 연동 점검</h1>
          <p className={styles.subtitle}>
            mk2 로그인 세션으로 mk3 API를 프록시 호출해, 인증/연결 상태를 먼저 확인합니다.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            disabled={health.loading}
            onClick={() => void runFetch("/api/mk3/v1/health", setHealth)}
          >
            health
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={models.loading}
            onClick={() => void loadOpenAiModelsForChat()}
          >
            openai models
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={services.loading}
            onClick={() => void runFetch("/api/mk3/v1/ai-services", setServices)}
          >
            ai-services
          </button>
        </div>
      </header>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>1) Health</h2>
        <p className={styles.hint}>
          {health.status === 200 ? (
            <span className={styles.statusOk}>OK (200)</span>
          ) : health.status ? (
            <span className={styles.statusBad}>HTTP {health.status}</span>
          ) : (
            "아직 호출하지 않았습니다."
          )}
        </p>
        {health.error ? <p className={styles.statusBad}>{health.error}</p> : null}
        {health.body !== null ? (
          <pre className={styles.jsonBox}>{JSON.stringify(health.body, null, 2)}</pre>
        ) : null}
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>2) OpenAI Models</h2>
        <p className={styles.hint}>
          모델 목록이 보이면 mk3 인증 경계 + 프록시 경로가 정상 동작하는 상태입니다.
        </p>
        {models.error ? <p className={styles.statusBad}>{models.error}</p> : null}
        {models.body !== null ? (
          <pre className={styles.jsonBox}>{JSON.stringify(models.body, null, 2)}</pre>
        ) : null}
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>4) OpenAI Chat (SSE)</h2>
        <p className={styles.hint}>
          모델 선택 후 메시지를 전송하면 mk3 SSE 스트림 응답을 실시간으로 확인합니다.
        </p>
        <div className={styles.chatControls}>
          <select
            className={styles.select}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={streaming}
          >
            <option value="">모델 선택</option>
            {openAiModels.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="mk3로 보낼 메시지"
            disabled={streaming}
          />
          <button
            type="button"
            className={styles.button}
            disabled={streaming}
            onClick={() => void sendOpenAiChat()}
          >
            {streaming ? "전송 중..." : "전송"}
          </button>
        </div>
        {conversationId ? (
          <p className={styles.hint}>conversation_id: {conversationId}</p>
        ) : null}
        {streamError ? <p className={styles.statusBad}>{streamError}</p> : null}
        {streamText ? <pre className={styles.jsonBox}>{streamText}</pre> : null}
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>3) AI Services</h2>
        <p className={styles.hint}>
          초기엔 빈 배열이 정상일 수 있습니다. 이후 사용자별 데이터 분리가 여기서 확인됩니다.
        </p>
        {services.error ? <p className={styles.statusBad}>{services.error}</p> : null}
        {services.body !== null ? (
          <pre className={styles.jsonBox}>{JSON.stringify(services.body, null, 2)}</pre>
        ) : null}
      </article>
    </section>
  );
}
