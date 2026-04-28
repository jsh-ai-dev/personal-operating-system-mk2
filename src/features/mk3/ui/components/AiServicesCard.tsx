"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function AiServicesCard({ vm }: Props) {
  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>6) AI Services</h2>
      <p className={styles.hint}>초기엔 빈 배열이 정상일 수 있습니다. 이후 사용자별 데이터 분리가 여기서 확인됩니다.</p>
      {vm.services.error ? <p className={styles.statusBad}>{vm.services.error}</p> : null}
      {vm.services.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.services.body, null, 2)}</pre> : null}
      {vm.aiServiceList.length > 0 ? (
        <div className={styles.conversationList}>
          {vm.aiServiceList.map((svc) => (
            <button
              key={svc.id}
              type="button"
              className={`${styles.conversationItem} ${vm.selectedServiceId === svc.id ? styles.conversationItemActive : ""}`}
              onClick={() => {
                vm.setSelectedServiceId(svc.id);
                vm.setServiceEditName(svc.name ?? "");
              }}
            >
              <strong>{svc.name ?? "(unnamed)"}</strong>
              <span>{svc.plan_name ?? "-"}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.chatControls}>
        <input className={styles.input} value={vm.newServiceName} onChange={(e) => vm.setNewServiceName(e.target.value)} placeholder="새 AI 서비스 이름 (예: Perplexity)" />
        <button type="button" className={styles.button} disabled={vm.serviceCreateResult.loading} onClick={() => void vm.createAiService()}>
          ai-service 생성
        </button>
        <input className={styles.input} value={vm.serviceEditName} onChange={(e) => vm.setServiceEditName(e.target.value)} placeholder="선택한 서비스 이름 수정" />
        <button type="button" className={styles.button} disabled={vm.serviceUpdateResult.loading} onClick={() => void vm.updateAiServiceName()}>
          ai-service 이름 수정
        </button>
        <button type="button" className={styles.button} disabled={vm.serviceDeleteResult.loading} onClick={() => void vm.deleteAiService()}>
          ai-service 삭제
        </button>
      </div>
      {vm.serviceCreateResult.error ? <p className={styles.statusBad}>{vm.serviceCreateResult.error}</p> : null}
      {vm.serviceCreateResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.serviceCreateResult.body, null, 2)}</pre> : null}
      {vm.serviceUpdateResult.error ? <p className={styles.statusBad}>{vm.serviceUpdateResult.error}</p> : null}
      {vm.serviceUpdateResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.serviceUpdateResult.body, null, 2)}</pre> : null}
      {vm.serviceDeleteResult.error ? <p className={styles.statusBad}>{vm.serviceDeleteResult.error}</p> : null}
      {vm.serviceDeleteResult.body !== null ? <pre className={styles.jsonBox}>{JSON.stringify(vm.serviceDeleteResult.body, null, 2)}</pre> : null}
    </article>
  );
}
