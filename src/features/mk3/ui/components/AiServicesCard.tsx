"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import { ResultPanel } from "@/features/mk3/ui/components/ResultPanel";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function AiServicesCard({ vm }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>AI 서비스 관리</h2>
      </div>
      <p className={styles.hint}>초기엔 빈 배열이 정상일 수 있습니다. 이후 사용자별 데이터 분리가 여기서 확인됩니다.</p>
      <ResultPanel title="서비스 목록 응답 보기" body={vm.services.body} error={vm.services.error} />
      <div className={styles.splitLayout}>
        <div>
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
        </div>
        <div className={styles.detailPane}>
          <h3 className={styles.detailTitle}>선택된 서비스</h3>
          <p className={styles.hint}>{vm.selectedServiceId ?? "선택된 서비스가 없습니다."}</p>
        </div>
      </div>
      <div className={styles.chatControls}>
        <input className={styles.input} value={vm.newServiceName} onChange={(e) => vm.setNewServiceName(e.target.value)} placeholder="새 AI 서비스 이름 (예: Perplexity)" />
        <button type="button" className={styles.button} disabled={vm.serviceCreateResult.loading} onClick={() => void vm.createAiService()}>
          서비스 생성
        </button>
        <input className={styles.input} value={vm.serviceEditName} onChange={(e) => vm.setServiceEditName(e.target.value)} placeholder="선택한 서비스 이름 수정" />
        <button type="button" className={styles.button} disabled={vm.serviceUpdateResult.loading} onClick={() => void vm.updateAiServiceName()}>
          이름 수정
        </button>
        <button type="button" className={styles.button} disabled={vm.serviceDeleteResult.loading} onClick={() => void vm.deleteAiService()}>
          서비스 삭제
        </button>
      </div>
      <ResultPanel title="서비스 생성 응답 보기" body={vm.serviceCreateResult.body} error={vm.serviceCreateResult.error} />
      <ResultPanel title="서비스 수정 응답 보기" body={vm.serviceUpdateResult.body} error={vm.serviceUpdateResult.error} />
      <ResultPanel title="서비스 삭제 응답 보기" body={vm.serviceDeleteResult.body} error={vm.serviceDeleteResult.error} />
    </article>
  );
}
