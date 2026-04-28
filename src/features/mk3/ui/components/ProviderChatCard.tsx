"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import { ResultPanel } from "@/features/mk3/ui/components/ResultPanel";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function ProviderChatCard({ vm }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>실시간 AI 대화</h2>
      </div>
      <p className={styles.hint}>provider별 모델을 불러온 뒤 메시지를 전송하면 mk3 SSE 스트림 응답을 실시간으로 확인합니다.</p>
      <div className={styles.chatControls}>
        <select
          className={styles.select}
          value={vm.provider}
          onChange={(e) => {
            const next = e.target.value as "openai" | "claude" | "gemini";
            vm.setProvider(next);
            vm.setProviderModels([]);
            vm.setSelectedModel("");
          }}
          disabled={vm.streaming}
        >
          <option value="openai">openai</option>
          <option value="claude">claude</option>
          <option value="gemini">gemini</option>
        </select>
        <button
          type="button"
          className={styles.button}
          disabled={vm.models.loading || vm.streaming}
          onClick={() => void vm.loadModelsForProvider(vm.provider)}
        >
          {vm.provider} 모델 불러오기
        </button>
        <select
          className={styles.select}
          value={vm.selectedModel}
          onChange={(e) => vm.setSelectedModel(e.target.value)}
          disabled={vm.streaming}
        >
          <option value="">모델 선택</option>
          {vm.providerModels.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <input
          className={styles.input}
          value={vm.message}
          onChange={(e) => vm.setMessage(e.target.value)}
          placeholder="AI에게 보낼 메시지"
          disabled={vm.streaming}
        />
        <button type="button" className={styles.button} disabled={vm.streaming} onClick={() => void vm.sendProviderChat()}>
          {vm.streaming ? "전송 중..." : "전송"}
        </button>
      </div>
      {vm.conversationId ? <p className={styles.hint}>conversation_id: {vm.conversationId}</p> : null}
      {vm.streamError ? <p className={styles.statusBad}>{vm.streamError}</p> : null}
      <ResultPanel title="스트림 결과 보기" body={vm.streamText || null} />
    </article>
  );
}
