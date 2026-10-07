import { AuthForm } from "@/components/auth-form";
import { AuthHero } from "@/components/auth-hero";
import { SiteShell } from "@/components/site-shell";
import type { AuthMode } from "@/lib/auth-utils";

export function AuthPage({ mode }: { mode: AuthMode }) {
  return (
    <SiteShell>
      <main id="main-content" className="auth-main">
        <AuthHero />
        <AuthForm key={mode} mode={mode} />
      </main>
    </SiteShell>
  );
}
