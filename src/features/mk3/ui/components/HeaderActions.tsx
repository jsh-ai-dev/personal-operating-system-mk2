"use client";

import type { Mk3DashboardVM } from "@/features/mk3/application/useMk3Dashboard";
import styles from "@/features/mk3/ui/Mk3Dashboard.module.css";

type Props = { vm: Mk3DashboardVM };

export function HeaderActions({ vm }: Props) {
  return (
    <div className={styles.actions}>
      <label className={styles.inlineLabel}>
        <input
          type="checkbox"
          checked={vm.includeHiddenConversations}
          onChange={(e) => vm.setIncludeHiddenConversations(e.target.checked)}
        />
        hidden 포함
      </label>
      <button type="button" className={styles.button} disabled={vm.health.loading} onClick={() => void vm.fetchHealth()}>
        health
      </button>
      <button
        type="button"
        className={styles.button}
        disabled={vm.models.loading}
        onClick={() => void vm.loadModelsForProvider(vm.provider)}
      >
        {vm.provider} models
      </button>
      <button type="button" className={styles.button} disabled={vm.services.loading} onClick={() => void vm.fetchAiServices()}>
        ai-services
      </button>
    </div>
  );
}
