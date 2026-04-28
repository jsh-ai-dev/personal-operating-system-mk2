"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import { ResultPanel } from "@/features/mk3/ui/components/ResultPanel";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function ImportAndScraperCards({ vm }: Props) {
  return (
    <>
      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>대화 데이터 가져오기</h2>
        </div>
        <p className={styles.hint}>로컬 데이터 소스에서 대화를 가져옵니다. 경로는 mk3 backend `.env` 설정을 사용합니다.</p>
        <div className={styles.chatControls}>
          <select
            className={styles.select}
            value={vm.importTarget}
            onChange={(e) =>
              vm.setImportTarget(
                e.target.value as
                  | "jetbrains-codex"
                  | "claude-code"
                  | "claude-export"
                  | "gemini-takeout",
              )
            }
          >
            <option value="jetbrains-codex">jetbrains-codex</option>
            <option value="claude-code">claude-code</option>
            <option value="claude-export">claude-export</option>
            <option value="gemini-takeout">gemini-takeout</option>
          </select>
          <button type="button" className={styles.button} disabled={vm.importResult.loading} onClick={() => void vm.runImport()}>
            가져오기 실행
          </button>
        </div>
        <ResultPanel title="가져오기 응답 보기" body={vm.importResult.body} error={vm.importResult.error} />
      </article>

      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>구독 정보 수집</h2>
        </div>
        <p className={styles.hint}>크롬 로그인 상태를 기반으로 구독/사용량 정보를 스크래핑합니다.</p>
        <div className={styles.chatControls}>
          <select
            className={styles.select}
            value={vm.scraperTarget}
            onChange={(e) =>
              vm.setScraperTarget(
                e.target.value as "claude" | "chatgpt" | "codex" | "gemini" | "cursor",
              )
            }
          >
            <option value="claude">claude</option>
            <option value="chatgpt">chatgpt</option>
            <option value="codex">codex</option>
            <option value="gemini">gemini</option>
            <option value="cursor">cursor</option>
          </select>
          <button type="button" className={styles.button} disabled={vm.scraperResult.loading} onClick={() => void vm.runScraper()}>
            수집 실행
          </button>
        </div>
        <ResultPanel title="수집 응답 보기" body={vm.scraperResult.body} error={vm.scraperResult.error} />
      </article>
    </>
  );
}
