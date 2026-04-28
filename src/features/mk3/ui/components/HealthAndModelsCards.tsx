"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function HealthAndModelsCards({ vm }: Props) {
  return (
    <>
      <article className={styles.card}>
        <h2 className={styles.cardTitle}>1) Health</h2>
        <p className={styles.hint}>
          {vm.health.status === 200 ? (
            <span className={styles.statusOk}>OK (200)</span>
          ) : vm.health.status ? (
            <span className={styles.statusBad}>HTTP {vm.health.status}</span>
          ) : (
            "아직 호출하지 않았습니다."
          )}
        </p>
        {vm.health.error ? <p className={styles.statusBad}>{vm.health.error}</p> : null}
        {vm.health.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.health.body, null, 2)}</pre> : null}
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>2) Last Loaded Models</h2>
        <p className={styles.hint}>모델 목록이 보이면 mk3 인증 경계 + 프록시 경로가 정상 동작하는 상태입니다.</p>
        {vm.models.error ? <p className={styles.statusBad}>{vm.models.error}</p> : null}
        {vm.models.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.models.body, null, 2)}</pre> : null}
      </article>
    </>
  );
}
