"use client";

import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = {
  title: string;
  body: unknown;
  error?: string | null;
  defaultOpen?: boolean;
};

export function ResultPanel({ title, body, error, defaultOpen = false }: Props) {
  if (error) {
    return <p className={styles.statusBad}>{error}</p>;
  }

  if (body === null || body === undefined) {
    return null;
  }

  return (
    <details className={styles.resultDetails} open={defaultOpen}>
      <summary className={styles.resultSummary}>{title}</summary>
      <pre className={styles.jsonBox}>{JSON.stringify(body, null, 2)}</pre>
    </details>
  );
}
