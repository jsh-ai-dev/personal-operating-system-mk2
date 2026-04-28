"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function ConversationsCard({ vm }: Props) {
  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>5) Conversations / Messages</h2>
      <p className={styles.hint}>대화 목록을 불러와 선택하면, 해당 대화 메시지와 요약/퀴즈 생성 흐름을 테스트할 수 있습니다.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} disabled={vm.conversations.loading} onClick={() => void vm.loadConversations()}>
          conversations 조회
        </button>
        <button type="button" className={styles.button} disabled={vm.messages.loading} onClick={() => void vm.loadMessagesForCurrentConversation()}>
          messages 조회
        </button>
        <button type="button" className={styles.button} disabled={vm.summaryResult.loading} onClick={() => void vm.generateSummary()}>
          요약 생성
        </button>
        <button type="button" className={styles.button} disabled={vm.quizResult.loading} onClick={() => void vm.generateQuiz()}>
          퀴즈 생성
        </button>
      </div>
      {vm.conversationList.length > 0 ? (
        <div className={styles.conversationList}>
          {vm.conversationList.slice(0, 30).map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={`${styles.conversationItem} ${vm.conversationId === conv.id ? styles.conversationItemActive : ""}`}
              onClick={() => vm.setConversationId(conv.id)}
            >
              <strong>{conv.title ?? "(untitled)"}</strong>
              <span>{conv.model ?? "-"}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.chatControls}>
        <button type="button" className={styles.button} disabled={vm.conversationPatchResult.loading} onClick={() => void vm.setConversationHidden(true)}>
          대화 숨김
        </button>
        <button type="button" className={styles.button} disabled={vm.conversationPatchResult.loading} onClick={() => void vm.setConversationHidden(false)}>
          대화 숨김 해제
        </button>
      </div>
      {vm.conversationPatchResult.error ? <p className={styles.statusBad}>{vm.conversationPatchResult.error}</p> : null}
      {vm.conversationPatchResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.conversationPatchResult.body, null, 2)}</pre> : null}
      {vm.messageList.length > 0 ? (
        <div className={styles.messageList}>
          {vm.messageList.slice(0, 30).map((msg) => (
            <button
              key={msg.id}
              type="button"
              className={`${styles.messageItem} ${vm.selectedMessageId === msg.id ? styles.messageItemActive : ""}`}
              onClick={() => {
                vm.setSelectedMessageId(msg.id);
                vm.setEditMessageContent(msg.content ?? "");
              }}
            >
              <strong>{msg.role ?? "unknown"}</strong>
              <span>{msg.is_hidden ? "hidden" : "visible"}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.chatControls}>
        <input className={styles.input} value={vm.editMessageContent} onChange={(e) => vm.setEditMessageContent(e.target.value)} placeholder="선택한 메시지 내용 수정" />
        <button type="button" className={styles.button} disabled={vm.messagePatchResult.loading} onClick={() => void vm.updateMessageContent()}>
          메시지 내용 수정
        </button>
        <button type="button" className={styles.button} disabled={vm.messagePatchResult.loading} onClick={() => void vm.updateMessageHidden(true)}>
          메시지 숨김
        </button>
        <button type="button" className={styles.button} disabled={vm.messagePatchResult.loading} onClick={() => void vm.updateMessageHidden(false)}>
          메시지 숨김 해제
        </button>
      </div>
      {vm.messagePatchResult.error ? <p className={styles.statusBad}>{vm.messagePatchResult.error}</p> : null}
      {vm.messagePatchResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.messagePatchResult.body, null, 2)}</pre> : null}
      {vm.conversations.error ? <p className={styles.statusBad}>{vm.conversations.error}</p> : null}
      {vm.messages.error ? <p className={styles.statusBad}>{vm.messages.error}</p> : null}
      {vm.summaryResult.error ? <p className={styles.statusBad}>{vm.summaryResult.error}</p> : null}
      {vm.quizResult.error ? <p className={styles.statusBad}>{vm.quizResult.error}</p> : null}
      {vm.messages.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.messages.body, null, 2)}</pre> : null}
      {vm.summaryResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.summaryResult.body, null, 2)}</pre> : null}
      {vm.quizResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.quizResult.body, null, 2)}</pre> : null}
    </article>
  );
}
