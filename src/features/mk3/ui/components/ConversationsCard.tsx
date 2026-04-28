"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import { ResultPanel } from "@/features/mk3/ui/components/ResultPanel";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function ConversationsCard({ vm }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>대화 기록 관리</h2>
      </div>
      <p className={styles.hint}>대화 목록을 불러와 선택하면, 해당 대화 메시지와 요약/퀴즈 생성 흐름을 테스트할 수 있습니다.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} disabled={vm.conversations.loading} onClick={() => void vm.loadConversations()}>
          대화 목록 새로고침
        </button>
        <button type="button" className={styles.button} disabled={vm.messages.loading} onClick={() => void vm.loadMessagesForCurrentConversation()}>
          메시지 불러오기
        </button>
        <button type="button" className={styles.button} disabled={vm.summaryResult.loading} onClick={() => void vm.generateSummary()}>
          요약 생성
        </button>
        <button type="button" className={styles.button} disabled={vm.quizResult.loading} onClick={() => void vm.generateQuiz()}>
          퀴즈 생성
        </button>
      </div>
      <div className={styles.splitLayout}>
        <div>
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
        </div>
        <div className={styles.detailPane}>
          <h3 className={styles.detailTitle}>선택된 대화</h3>
          <p className={styles.hint}>{vm.conversationId ?? "선택된 대화가 없습니다."}</p>
          <div className={styles.chatControls}>
            <button type="button" className={styles.button} disabled={vm.conversationPatchResult.loading} onClick={() => void vm.setConversationHidden(true)}>
              대화 숨김
            </button>
            <button type="button" className={styles.button} disabled={vm.conversationPatchResult.loading} onClick={() => void vm.setConversationHidden(false)}>
              대화 숨김 해제
            </button>
          </div>
          <ResultPanel
            title="대화 상태 변경 응답 보기"
            body={vm.conversationPatchResult.body}
            error={vm.conversationPatchResult.error}
          />
        </div>
      </div>
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
      <ResultPanel title="메시지 수정 응답 보기" body={vm.messagePatchResult.body} error={vm.messagePatchResult.error} />
      <ResultPanel title="대화 목록/메시지 응답 보기" body={vm.messages.body} error={vm.conversations.error ?? vm.messages.error} />
      <ResultPanel title="요약 결과 보기" body={vm.summaryResult.body} error={vm.summaryResult.error} />
      <ResultPanel title="퀴즈 결과 보기" body={vm.quizResult.body} error={vm.quizResult.error} />
    </article>
  );
}
