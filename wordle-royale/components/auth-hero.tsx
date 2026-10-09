export function AuthHero() {
  return (
    <section className="auth-hero" aria-label="Wordle Royale">
      <span className="brand-mark hero-mark" role="img" aria-label="Wordle Royale icon">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} />
        ))}
      </span>
    </section>
  );
}
