"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function ImportAndScraperCards({ vm }: Props) {
  return (
    <>
      <article className={styles.card}>
        <h2 className={styles.cardTitle}>7) Import</h2>
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
            import 실행
          </button>
        </div>
        {vm.importResult.error ? <p className={styles.statusBad}>{vm.importResult.error}</p> : null}
        {vm.importResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.importResult.body, null, 2)}</pre> : null}
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>8) Scraper</h2>
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
            scraper 실행
          </button>
        </div>
        {vm.scraperResult.error ? <p className={styles.statusBad}>{vm.scraperResult.error}</p> : null}
        {vm.scraperResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.scraperResult.body, null, 2)}</pre> : null}
      </article>
    </>
  );
}
