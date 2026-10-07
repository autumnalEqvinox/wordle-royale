import { AuthGuard } from "@/components/auth-guard";
import { SiteShell } from "@/components/site-shell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <AuthGuard>{children}</AuthGuard>
    </SiteShell>
  );
}
