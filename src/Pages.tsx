import { useState } from 'react';
import { email, linkedin } from './content';

export { JourneyPage } from './JourneyPage';
export { WorkPage } from './WorkPage';

export function NotesPage() {
  return null;
}

export function HelloPage() {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      location.href = `mailto:${email}`;
    }
  };
  return (
    <section className="hello-page" aria-labelledby="hello-title">
      <header className="hello-header">
        <p className="j-eyebrow">Contact · Based in Vietnam</p>
        <h1 id="hello-title">
          A note <em>to Mai.</em>
        </h1>
        <p className="hello-subtitle">
          Open to business, finance, marketing and operations conversations. Reach out directly below or flip the postcard.
        </p>
      </header>

      <div className="contact-direct-bar" aria-label="Direct contact channels">
        <a className="contact-pill contact-pill-primary" href={`mailto:${email}`}>
          <span>Email Mai</span>
          <strong>{email} ↗</strong>
        </a>
        <button type="button" className="contact-pill" onClick={copy}>
          <span>Quick copy</span>
          <strong>{copied ? 'Email copied ✓' : 'Copy email'}</strong>
        </button>
        <a className="contact-pill" href={linkedin} target="_blank" rel="noreferrer">
          <span>Profile</span>
          <strong>LinkedIn ↗</strong>
        </a>
        <a className="contact-pill" href="/ngoc-mai-cv.pdf" target="_blank" rel="noreferrer">
          <span>Resume</span>
          <strong>Download CV (PDF) ↗</strong>
        </a>
      </div>

      <div className={`postcard-scene ${flipped ? 'flipped' : ''}`}>
        <div className="postcard">
          <div className="postcard-face front" inert={flipped}>
            <div className="postcard-drawing" aria-hidden="true">
              <span>✳</span>
              <p>
                Good people.<br />
                Bright possibilities.
              </p>
            </div>
            <div className="postcard-copy">
              <span className="postage-stamp" aria-hidden="true">
                m.
              </span>
              <h2>
                Good conversations<br />
                are always welcome.
              </h2>
              <a href={`mailto:${email}`}>
                {email.split('@')[0]}@<wbr />
                {email.split('@')[1]} ↗
              </a>
              <button onClick={() => setFlipped(true)}>Turn the postcard ↻</button>
            </div>
          </div>
          <div className="postcard-face back" inert={!flipped}>
            <h2>Let’s stay in touch.</h2>
            <a href={`mailto:${email}`}>
              {email.split('@')[0]}@<wbr />
              {email.split('@')[1]} ↗
            </a>
            <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy email'}</button>
            <a href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a href="/ngoc-mai-cv.pdf" target="_blank" rel="noreferrer">
              My CV ↗
            </a>
            <button onClick={() => setFlipped(false)}>Back to the front ↶</button>
            <span role="status" className="sr-only">
              {copied ? 'Email address copied' : ''}
            </span>
          </div>
        </div>
      </div>

      <nav className="hello-next-steps" aria-label="Next steps">
        <a className="desk-return" href="#/">← Back to Home</a>
        <a className="desk-return" href="#/work">Explore Projects ↗</a>
        <a className="desk-return" href="#/about">About Mai &amp; roadmap ↗</a>
      </nav>
    </section>
  );
}
