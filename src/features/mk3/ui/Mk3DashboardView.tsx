"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import { AiServicesCard } from "@/features/mk3/ui/components/AiServicesCard";
import { ConversationsCard } from "@/features/mk3/ui/components/ConversationsCard";
import { HeaderActions } from "@/features/mk3/ui/components/HeaderActions";
import { HealthAndModelsCards } from "@/features/mk3/ui/components/HealthAndModelsCards";
import { ImportAndScraperCards } from "@/features/mk3/ui/components/ImportAndScraperCards";
import { ProviderChatCard } from "@/features/mk3/ui/components/ProviderChatCard";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = {
  vm: Mk3DashboardVM;
};

export function Mk3DashboardView({ vm }: Props) {
  const healthBadge = vm.health.status === 200 ? "연결 정상" : vm.health.loading ? "확인 중" : "미확인";
  const modelBadge = vm.providerModels.length > 0 ? `${vm.providerModels.length}개 모델` : "모델 미로드";
  const serviceBadge = vm.aiServiceList.length > 0 ? `${vm.aiServiceList.length}개 서비스` : "서비스 없음";

  return (
    <section className={styles.page} aria-label="mk3 서비스 대시보드">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>mk3 서비스 대시보드</h1>
          <p className={styles.subtitle}>
            mk2 세션 기반으로 mk3 기능을 한 화면에서 실행하고 결과를 관리합니다.
          </p>
          <div className={styles.statusRow}>
            <span className={styles.badge}>Health: {healthBadge}</span>
            <span className={styles.badge}>Provider: {vm.provider}</span>
            <span className={styles.badge}>Models: {modelBadge}</span>
            <span className={styles.badge}>AI Services: {serviceBadge}</span>
          </div>
        </div>
        <HeaderActions vm={vm} />
      </header>
      <div className={styles.gridTwo}>
        <HealthAndModelsCards vm={vm} />
        <ProviderChatCard vm={vm} />
      </div>
      <div className={styles.gridOne}>
        <ConversationsCard vm={vm} />
        <AiServicesCard vm={vm} />
      </div>
      <div className={styles.gridTwo}>
        <ImportAndScraperCards vm={vm} />
      </div>
    </section>
  );
}
