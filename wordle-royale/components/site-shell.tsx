"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Wordle Royale home">
      <span className="brand-mark" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} />
        ))}
      </span>
      <span className="brand-name">
        wordle<span>ROYALE</span>
      </span>
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Brand />
        <button
          className="help-button"
          onClick={() => dialog.current?.showModal()}
        >
          <Icon name="help" />
          How to play
        </button>
      </header>
      {children}
      <footer className="site-footer">
        <span>Five letters. One crown.</span>
        <span className="footer-credit">
          <span className="tiny-tiles" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          A little friendly competition.
        </span>
      </footer>
      <dialog
        ref={dialog}
        className="rules-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        aria-labelledby="rules-title"
      >
        <button
          className="icon-button dialog-close"
          aria-label="Close how to play"
          onClick={() => dialog.current?.close()}
        >
          <Icon name="close" />
        </button>
        <span className="eyebrow">A QUICK WORD</span>
        <h2 id="rules-title">Know your colors.</h2>
        <p>
          Guess a five-letter word. Every guess gives you clues for the next
          one.
        </p>
        <div className="rule">
          <span className="rule-tile correct">W</span>
          <div>
            <strong>Right letter. Right spot.</strong>
            <p>Green means you’ve got it.</p>
          </div>
        </div>
        <div className="rule">
          <span className="rule-tile present">O</span>
          <div>
            <strong>Right letter. Different spot.</strong>
            <p>Yellow means try it somewhere else.</p>
          </div>
        </div>
        <div className="rule">
          <span className="rule-tile absent">R</span>
          <div>
            <strong>Out of the running.</strong>
            <p>Gray means it’s not in the word.</p>
          </div>
        </div>
        <button
          className="primary-button"
          onClick={() => dialog.current?.close()}
        >
          Got it <Icon name="check" />
        </button>
      </dialog>
    </div>
  );
}
