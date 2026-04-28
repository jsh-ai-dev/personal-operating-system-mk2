import { useState } from "react";

export type FetchState = {
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

export function useMk3Dashboard() {
  const [health, setHealth] = useState<FetchState>(initialState);
  const [models, setModels] = useState<FetchState>(initialState);
  const [services, setServices] = useState<FetchState>(initialState);
  const [provider, setProvider] = useState<"openai" | "claude" | "gemini">("openai");
  const [providerModels, setProviderModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<FetchState>(initialState);
  const [messages, setMessages] = useState<FetchState>(initialState);
  const [summaryResult, setSummaryResult] = useState<FetchState>(initialState);
  const [quizResult, setQuizResult] = useState<FetchState>(initialState);
  const [importResult, setImportResult] = useState<FetchState>(initialState);
  const [scraperResult, setScraperResult] = useState<FetchState>(initialState);
  const [importTarget, setImportTarget] = useState<
    "jetbrains-codex" | "claude-code" | "claude-export" | "gemini-takeout"
  >("jetbrains-codex");
  const [scraperTarget, setScraperTarget] = useState<
    "claude" | "chatgpt" | "codex" | "gemini" | "cursor"
  >("claude");
  const [newServiceName, setNewServiceName] = useState("");
  const [serviceCreateResult, setServiceCreateResult] = useState<FetchState>(initialState);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceEditName, setServiceEditName] = useState("");
  const [serviceUpdateResult, setServiceUpdateResult] = useState<FetchState>(initialState);
  const [serviceDeleteResult, setServiceDeleteResult] = useState<FetchState>(initialState);
  const [includeHiddenConversations, setIncludeHiddenConversations] = useState(false);
  const [conversationPatchResult, setConversationPatchResult] = useState<FetchState>(initialState);
  const [messagePatchResult, setMessagePatchResult] = useState<FetchState>(initialState);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState("");

  async function runFetch(url: string, setter: (state: FetchState) => void) {
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

  async function runPost(url: string, body: unknown, setter: (state: FetchState) => void) {
    setter({ loading: true, status: null, body: null, error: null });
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  async function runPostNoBody(url: string, setter: (state: FetchState) => void) {
    setter({ loading: true, status: null, body: null, error: null });
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
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

  async function runPatch(url: string, body: unknown, setter: (state: FetchState) => void) {
    setter({ loading: true, status: null, body: null, error: null });
    try {
      const res = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  async function runPut(url: string, body: unknown, setter: (state: FetchState) => void) {
    setter({ loading: true, status: null, body: null, error: null });
    try {
      const res = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  async function runDelete(url: string, setter: (state: FetchState) => void) {
    setter({ loading: true, status: null, body: null, error: null });
    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
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

  async function loadModelsForProvider(nextProvider: "openai" | "claude" | "gemini") {
    const endpoint = `/api/mk3/v1/chat/${nextProvider}/models`;
    await runFetch(endpoint, (state) => {
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
        setProviderModels(ids);
        setSelectedModel((prev) => (prev || ids[0] || ""));
      }
    });
  }

  async function fetchHealth() {
    await runFetch("/api/mk3/v1/health", setHealth);
  }

  async function fetchAiServices() {
    await runFetch("/api/mk3/v1/ai-services", setServices);
  }

  async function sendProviderChat() {
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
      res = await fetch(`/api/mk3/v1/chat/${provider}`, {
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
      setStreamError(typeof payload === "string" ? payload : `요청 실패 (HTTP ${res.status})`);
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
              if (event.type === "chunk") setStreamText((prev) => prev + (event.content ?? ""));
              else if (event.type === "done" && event.conversation_id) setConversationId(event.conversation_id);
              else if (event.type === "error") setStreamError(event.message ?? "mk3 스트림 처리 중 오류가 발생했습니다.");
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } finally {
      setStreaming(false);
    }
  }

  async function loadConversations() {
    await runFetch(
      `/api/mk3/v1/chat/conversations?include_hidden=${includeHiddenConversations ? "true" : "false"}`,
      setConversations,
    );
  }

  async function loadMessagesForCurrentConversation() {
    if (!conversationId) {
      setMessages({ loading: false, status: null, body: null, error: "먼저 대화를 선택하거나 생성해 주세요." });
      return;
    }
    await runFetch(`/api/mk3/v1/chat/conversations/${conversationId}/messages`, setMessages);
  }

  async function setConversationHidden(isHidden: boolean) {
    if (!conversationId) {
      setConversationPatchResult({ loading: false, status: null, body: null, error: "먼저 대화를 선택해 주세요." });
      return;
    }
    await runPatch(`/api/mk3/v1/chat/conversations/${conversationId}`, { is_hidden: isHidden }, setConversationPatchResult);
    await loadConversations();
  }

  async function generateSummary() {
    if (!conversationId) {
      setSummaryResult({ loading: false, status: null, body: null, error: "요약할 대화가 없습니다." });
      return;
    }
    await runPost(`/api/mk3/v1/chat/conversations/${conversationId}/summary`, { model: selectedModel || "gpt-5-mini" }, setSummaryResult);
  }

  async function generateQuiz() {
    if (!conversationId) {
      setQuizResult({ loading: false, status: null, body: null, error: "퀴즈를 만들 대화가 없습니다." });
      return;
    }
    await runPost(`/api/mk3/v1/chat/conversations/${conversationId}/quiz`, { model: selectedModel || "gpt-5-mini" }, setQuizResult);
  }

  async function runImport() {
    await runPostNoBody(`/api/mk3/v1/import/${importTarget}`, setImportResult);
  }

  async function runScraper() {
    await runPostNoBody(`/api/mk3/v1/scraper/${scraperTarget}`, setScraperResult);
  }

  async function createAiService() {
    if (!newServiceName.trim()) {
      setServiceCreateResult({ loading: false, status: null, body: null, error: "서비스 이름을 입력해 주세요." });
      return;
    }
    await runPost("/api/mk3/v1/ai-services", { name: newServiceName.trim(), currency: "USD" }, setServiceCreateResult);
    await runFetch("/api/mk3/v1/ai-services", setServices);
  }

  async function updateAiServiceName() {
    if (!selectedServiceId) {
      setServiceUpdateResult({ loading: false, status: null, body: null, error: "먼저 AI 서비스를 선택해 주세요." });
      return;
    }
    if (!serviceEditName.trim()) {
      setServiceUpdateResult({ loading: false, status: null, body: null, error: "수정할 서비스 이름을 입력해 주세요." });
      return;
    }
    await runPut(`/api/mk3/v1/ai-services/${selectedServiceId}`, { name: serviceEditName.trim(), currency: "USD" }, setServiceUpdateResult);
    await runFetch("/api/mk3/v1/ai-services", setServices);
  }

  async function deleteAiService() {
    if (!selectedServiceId) {
      setServiceDeleteResult({ loading: false, status: null, body: null, error: "먼저 AI 서비스를 선택해 주세요." });
      return;
    }
    await runDelete(`/api/mk3/v1/ai-services/${selectedServiceId}`, setServiceDeleteResult);
    await runFetch("/api/mk3/v1/ai-services", setServices);
    setSelectedServiceId(null);
    setServiceEditName("");
  }

  async function updateMessageHidden(isHidden: boolean) {
    if (!selectedMessageId) {
      setMessagePatchResult({ loading: false, status: null, body: null, error: "먼저 메시지를 선택해 주세요." });
      return;
    }
    await runPatch(`/api/mk3/v1/chat/messages/${selectedMessageId}`, { is_hidden: isHidden }, setMessagePatchResult);
    await loadMessagesForCurrentConversation();
  }

  async function updateMessageContent() {
    if (!selectedMessageId) {
      setMessagePatchResult({ loading: false, status: null, body: null, error: "먼저 메시지를 선택해 주세요." });
      return;
    }
    if (!editMessageContent.trim()) {
      setMessagePatchResult({ loading: false, status: null, body: null, error: "수정할 메시지 내용을 입력해 주세요." });
      return;
    }
    await runPatch(`/api/mk3/v1/chat/messages/${selectedMessageId}`, { content: editMessageContent }, setMessagePatchResult);
    await loadMessagesForCurrentConversation();
  }

  const conversationList = Array.isArray(conversations.body)
    ? conversations.body.filter((item): item is { id: string; title?: string; model?: string } => {
        if (!item || typeof item !== "object") return false;
        const id = (item as { id?: unknown }).id;
        return typeof id === "string";
      })
    : [];

  const messageList = Array.isArray(messages.body)
    ? messages.body.filter((item): item is { id: string; role?: string; content?: string; is_hidden?: boolean } => {
        if (!item || typeof item !== "object") return false;
        const id = (item as { id?: unknown }).id;
        return typeof id === "string";
      })
    : [];

  const aiServiceList = Array.isArray(services.body)
    ? services.body.filter((item): item is { id: string; name?: string; plan_name?: string } => {
        if (!item || typeof item !== "object") return false;
        const id = (item as { id?: unknown }).id;
        return typeof id === "string";
      })
    : [];

  return {
    health,
    models,
    services,
    provider,
    setProvider,
    providerModels,
    setProviderModels,
    selectedModel,
    setSelectedModel,
    conversationId,
    setConversationId,
    message,
    setMessage,
    streaming,
    streamText,
    streamError,
    conversations,
    messages,
    summaryResult,
    quizResult,
    importResult,
    scraperResult,
    importTarget,
    setImportTarget,
    scraperTarget,
    setScraperTarget,
    newServiceName,
    setNewServiceName,
    serviceCreateResult,
    selectedServiceId,
    setSelectedServiceId,
    serviceEditName,
    setServiceEditName,
    serviceUpdateResult,
    serviceDeleteResult,
    includeHiddenConversations,
    setIncludeHiddenConversations,
    conversationPatchResult,
    messagePatchResult,
    selectedMessageId,
    setSelectedMessageId,
    editMessageContent,
    setEditMessageContent,
    conversationList,
    messageList,
    aiServiceList,
    runFetch,
    fetchHealth,
    fetchAiServices,
    loadModelsForProvider,
    sendProviderChat,
    loadConversations,
    loadMessagesForCurrentConversation,
    setConversationHidden,
    generateSummary,
    generateQuiz,
    createAiService,
    updateAiServiceName,
    deleteAiService,
    updateMessageHidden,
    updateMessageContent,
    runImport,
    runScraper,
    setServiceCreateResult,
  };
}

export type Mk3DashboardVM = ReturnType<typeof useMk3Dashboard>;
