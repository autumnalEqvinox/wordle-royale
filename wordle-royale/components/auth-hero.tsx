import { Icon } from "@/components/icons";

export function AuthHero() {
  const rows = [
    {
      word: "CRANE",
      colors: ["correct", "correct", "absent", "present", "absent"],
    },
    {
      word: "CROWD",
      colors: ["correct", "correct", "correct", "correct", "absent"],
    },
    {
      word: "CROWN",
      colors: ["correct", "correct", "correct", "correct", "correct"],
    },
  ];
  return (
    <section className="auth-hero" aria-label="Welcome to Wordle Royale">
      <div className="hero-content">
        <div className="hero-kicker">
          <span /> THE WORD GAME WITH A COMPETITIVE STREAK
        </div>
        <h1>
          A little wordplay.
          <br />A lot of{" "}
          <span>
            rivalry.
            <svg viewBox="0 0 240 15" aria-hidden="true">
              <path d="M3 10Q95-3 237 6M24 14Q125 3 218 10" />
            </svg>
          </span>
        </h1>
        <p>
          Your next great guess starts here.
          <br />
          Find your words. Find your people. Claim your crown.
        </p>
      </div>
      <div className="board-scene" aria-hidden="true">
        <Icon name="spark" className="scene-spark spark-one" />
        <Icon name="spark" className="scene-spark spark-two" />
        <div className="floating-note">
          Make your next move.
          <svg viewBox="0 0 65 45">
            <path d="M3 3q55-6 49 31m-9-9 9 10 10-9" />
          </svg>
        </div>
        <div className="word-board">
          <div className="board-caption">
            <span>THE ROAD TO ROYALTY</span>
            <Icon name="crown" />
          </div>
          {rows.map(({ word, colors }, row) => (
            <div className="board-row" key={word}>
              {[...word].map((letter, column) => (
                <span
                  className={`letter-tile ${colors[column]}`}
                  style={{
                    animationDelay: `${250 + row * 160 + column * 65}ms`,
                  }}
                  key={`${row}-${column}`}
                >
                  {letter}
                </span>
              ))}
            </div>
          ))}
          <div className="board-result">
            <span>
              <Icon name="check" /> That’s a royal guess.
            </span>
            <span>3 / 6</span>
          </div>
        </div>
        <div className="crown-sticker">
          <Icon name="crown" />
          <span>
            WELL
            <br />
            PLAYED.
          </span>
        </div>
      </div>
      <div className="hero-bottom">
        <span className="hero-bottom-icon">
          <Icon name="crown" />
        </span>
        <div>
          <strong>Big brain energy. Friendly rivalry.</strong>
          <span>A new way to bring your word game.</span>
        </div>
      </div>
    </section>
  );
}
