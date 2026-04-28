"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import { ResultPanel } from "@/features/mk3/ui/components/ResultPanel";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function HealthAndModelsCards({ vm }: Props) {
  return (
    <>
      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>서비스 연결 상태</h2>
        </div>
        <p className={styles.hint}>
          {vm.health.status === 200 ? (
            <span className={styles.statusOk}>OK (200)</span>
          ) : vm.health.status ? (
            <span className={styles.statusBad}>HTTP {vm.health.status}</span>
          ) : (
            "아직 호출하지 않았습니다."
          )}
        </p>
        <ResultPanel title="Health 응답 보기" body={vm.health.body} error={vm.health.error} defaultOpen />
      </article>

      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>사용 가능 모델</h2>
        </div>
        <p className={styles.hint}>모델 목록이 보이면 mk3 인증 경계 + 프록시 경로가 정상 동작하는 상태입니다.</p>
        <ResultPanel title="모델 목록 응답 보기" body={vm.models.body} error={vm.models.error} />
      </article>
    </>
  );
}
