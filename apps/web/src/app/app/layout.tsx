import { AppShell } from "@/components/AppShell";
import { NetworkGuard } from "@/components/NetworkGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <NetworkGuard>{children}</NetworkGuard>
    </AppShell>
  );
}
