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
  return (
    <section className={styles.page} aria-label="mk3 연결 점검">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>mk3 연동 점검</h1>
          <p className={styles.subtitle}>
            mk2 로그인 세션으로 mk3 API를 프록시 호출해, 인증/연결 상태를 먼저 확인합니다.
          </p>
        </div>
        <HeaderActions vm={vm} />
      </header>
      <HealthAndModelsCards vm={vm} />
      <ProviderChatCard vm={vm} />
      <ConversationsCard vm={vm} />
      <AiServicesCard vm={vm} />
      <ImportAndScraperCards vm={vm} />
    </section>
  );
}
