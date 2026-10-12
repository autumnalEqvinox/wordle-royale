import { AuthForm } from "@/components/auth-form";
import { SiteShell } from "@/components/site-shell";
import type { AuthMode } from "@/lib/auth-utils";

export function AuthPage({ mode }: { mode: AuthMode }) {
  return (
    <SiteShell>
      <main id="main-content" className="auth-main">
        <AuthForm key={mode} mode={mode} />
      </main>
    </SiteShell>
  );
}
