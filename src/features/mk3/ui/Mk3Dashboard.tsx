"use client";

import { useMk3Dashboard } from "@/features/mk3/application/useMk3Dashboard";
import { Mk3DashboardView } from "@/features/mk3/ui/Mk3DashboardView";

export function Mk3Dashboard() {
  const vm = useMk3Dashboard();
  return <Mk3DashboardView vm={vm} />;
}
