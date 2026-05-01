"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { listConversations, type Conversation } from "@/features/mk3/application/chatApi";
import styles from "@/features/mk3/ui/Mk3QuizList.module.css";

function providerLabel(p: string) {
  return ({ openai: "OpenAI", anthropic: "Anthropic", google: "Google", gemini: "Gemini", jetbrains: "JetBrains" }[p] ?? p);
}

function formatCost(v: number | null) {
  if (v == null) return "";
  return v < 0.0001 ? "<$0.0001" : `$${v.toFixed(4)}`;
}

export function Mk3QuizList() {
  const [all, setAll] = useState<Conversation[]>([]);

  const quizzes = useMemo(() => all.filter((c) => Boolean(c.quiz?.length)), [all]);

  useEffect(() => {
    void listConversations().then(setAll).catch(() => setAll([]));
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI 퀴즈</h1>
      </header>

      {quizzes.length > 0 ? (
        <section className={styles.list}>
          {quizzes.map((conv) => (
            <article key={conv.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.meta}>
                  <span className={styles.badge}>{providerLabel(conv.provider)}</span>
                  <span className={styles.modelTag}>퀴즈 모델 {conv.quiz_model ?? "-"}</span>
                  <span className={styles.cost}>{formatCost(conv.quiz_cost_usd)}</span>
                  <span className={styles.date}>
                    {new Date(conv.updated_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  {conv.quiz ? <span className={styles.badgeQuiz}>{conv.quiz.length}문제</span> : null}
                  <Link href={`/mk3/summaries?open=${conv.id}`} className={styles.summaryLink}>요약 보기 →</Link>
                </div>
                <div className={styles.titleRow}>
                  <span className={styles.cardTitle}>{conv.title}</span>
                  <Link href={`/mk3/quiz/${conv.id}`} className={styles.play}>퀴즈 풀기 →</Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className={styles.empty}>생성된 퀴즈가 없습니다.</section>
      )}
    </main>
  );
}
