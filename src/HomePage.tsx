import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { approaches, email, linkedin } from './content';
import { ProjectShowcase, AboutPlayground } from './InteractiveStories';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={down ? 'm-arrow down' : 'm-arrow'}>
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroPortrait() {
  return (
    <div className="m-hero-person">
      <div className="m-portrait-orbit" aria-hidden="true">
        <span />
      </div>
      <div className="m-hero-spark" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M40 5v70M5 40h70M15 15l50 50M15 65l50-50" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>
      <div className="m-portrait-enter">
        <div className="m-portrait-float">
          <a className="m-portrait-tilt" href="#/about" aria-label="Meet Mai Nguyen">
            <div className="m-portrait-photo">
              <img
                src="/assets/mai-portrait.webp"
                alt="Ngoc Mai Nguyen at RMIT University Vietnam"
                width="1061"
                height="1591"
                fetchPriority="high"
              />
            </div>
            <span className="m-portrait-caption">
              <span>
                <strong>Hi, I’m Mai.</strong>
                <small>RMIT Business · TikTok Intern</small>
              </span>
              <Arrow />
            </span>
          </a>
        </div>
      </div>
      <span className="m-portrait-note">
        Always Day 1.<span aria-hidden="true">↗</span>
      </span>
    </div>
  );
}

export default function HomePage({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState('Copy email');

  useGSAP(
    () => {
      if (paused) return;
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.m-hero-title .m-title-line', { yPercent: 105, duration: 1.15, stagger: 0.12, ease: 'power4.out' });
        gsap.from('.m-hero-eyebrow, .m-hero-actions, .m-hero-bottom', {
          y: 18,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          delay: 0.25,
          ease: 'power3.out',
        });
        gsap.from('.m-ribbon-depth', { scale: 0.88, rotation: -9, opacity: 0, duration: 1.6, ease: 'power3.out' });
        gsap.from('.m-portrait-enter', { y: 28, scale: 0.96, opacity: 0, duration: 0.95, delay: 0.2, ease: 'power3.out' });
        const hero = root.current!.querySelector<HTMLElement>('.m-hero')!;
        const ambient = gsap
          .timeline({ repeat: -1, yoyo: true, paused: true })
          .to('.m-portrait-float', { y: -10, rotation: 1.1, duration: 4, ease: 'sine.inOut' }, 0)
          .to('.m-ribbon-ambient', { y: 15, rotation: -2, scale: 1.025, duration: 6, ease: 'sine.inOut' }, 0)
          .to('.m-portrait-note', { y: 4, rotation: -1.2, duration: 3.6, ease: 'sine.inOut' }, 0.8);
        let inView = true;
        const syncAmbient = () => {
          const playing = inView && !document.hidden;
          hero.dataset.ambient = playing ? 'on' : 'off';
          if (playing) ambient.play();
          else ambient.pause();
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          syncAmbient();
        });
        observer.observe(hero.querySelector('.m-hero-composition')!);
        document.addEventListener('visibilitychange', syncAmbient);
        syncAmbient();
        gsap.to('.m-ribbon-scroll', {
          yPercent: 15,
          rotation: 9,
          ease: 'none',
          scrollTrigger: { trigger: '.m-hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
        });
        gsap.from('.m-footer-ribbon', {
          yPercent: 20,
          rotation: -12,
          ease: 'none',
          scrollTrigger: { trigger: '.m-contact', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
        });
        return () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', syncAmbient);
          hero.dataset.ambient = 'off';
          ambient.kill();
        };
      });
      media.add('(min-width: 960px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)', () => {
        const hero = root.current!.querySelector<HTMLElement>('.m-hero')!;
        const ribbon = root.current!.querySelector<HTMLElement>('.m-ribbon-pointer')!;
        const moveX = gsap.quickTo(ribbon, 'x', { duration: 1.1, ease: 'power3.out' });
        const moveY = gsap.quickTo(ribbon, 'y', { duration: 1.1, ease: 'power3.out' });
        const rotate = gsap.quickTo(ribbon, 'rotation', { duration: 1.4, ease: 'power3.out' });
        const portrait = root.current!.querySelector<HTMLElement>('.m-portrait-tilt')!;
        const portraitX = gsap.quickTo(portrait, 'rotationY', { duration: 0.8, ease: 'power3.out' });
        const portraitY = gsap.quickTo(portrait, 'rotationX', { duration: 0.8, ease: 'power3.out' });
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          const bounds = hero.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          moveX(x * 24);
          moveY(y * 18);
          rotate(x * 4);
          portraitX(-x * 9);
          portraitY(y * 7);
        };
        const reset = () => {
          moveX(0);
          moveY(0);
          rotate(0);
          portraitX(0);
          portraitY(0);
        };
        hero.addEventListener('pointermove', move);
        hero.addEventListener('pointerleave', reset);
        return () => {
          hero.removeEventListener('pointermove', move);
          hero.removeEventListener('pointerleave', reset);
        };
      });
      let disposed = false;
      Promise.all([
        document.fonts.ready,
        ...Array.from(root.current!.querySelectorAll('img')).map(img => img.decode().catch(() => {})),
      ]).then(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
      return () => {
        disposed = true;
        media.revert();
      };
    },
    { scope: root, dependencies: [paused], revertOnUpdate: true },
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyStatus('Email copied');
    } catch {
      setCopyStatus('Use the email link');
    }
  };
  const scrollToWork = () => document.getElementById('selected-work')?.scrollIntoView({ behavior: paused ? 'instant' : 'smooth' });

  return (
    <div className="motion-home" ref={root}>
      <section className="m-hero" aria-labelledby="home-title" data-ambient="off">
        <div className="m-ribbon-depth" aria-hidden="true">
          <div className="m-ribbon-scroll">
            <div className="m-ribbon-pointer">
              <div className="m-ribbon-ambient">
                <img src="/assets/cobalt-ribbon.png" alt="" fetchPriority="high" width="1954" height="780" />
              </div>
            </div>
          </div>
        </div>
        <div className="m-hero-center">
          <p className="m-hero-eyebrow">
            Ngoc Mai Nguyen <span>{approaches.map(item => item.word).join(' · ')}</span>
          </p>
          <div className="m-hero-composition">
            <div className="m-hero-message">
              <h1 className="m-hero-title" id="home-title">
                <span className="m-title-mask">
                  <span className="m-title-line">BUSINESS,</span>
                </span>
                <span className="m-title-mask">
                  <span className="m-title-line">IN MOTION.</span>
                </span>
              </h1>
              <div className="m-hero-actions">
                <button className="m-button m-button-dark" onClick={scrollToWork}>
                  Explore my work <Arrow />
                </button>
                <a className="m-button m-button-outline" href="#/about">
                  About Mai <Arrow />
                </a>
              </div>
            </div>
            <HeroPortrait />
          </div>
        </div>
        <div className="m-hero-bottom">
          <p>
            A head for numbers. A feel for people.<br />
            I connect the details that move<br className="m-desktop-break" /> good ideas forward.
          </p>
          <button className="m-scroll-cue" aria-label="Scroll to selected work" onClick={scrollToWork}>
            <span>Selected work</span>
            <Arrow down />
          </button>
          <a className="m-current" href="#/journey/4">
            <span>
              <i /> Current chapter
            </span>
            <strong>TikTok</strong>
            <span>
              AI Data Service &amp; Operations Intern <Arrow />
            </span>
          </a>
        </div>
        <div className="m-experience">
          <p>
            Places I’ve learned<br />
            by doing.
          </p>
          <div className="m-marquee" aria-label="Experience at RMIT, Michelin, TikTok and CTM">
            <div className="m-marquee-track">
              {[0, 1].map(repeat => (
                <div className="m-marquee-group" key={repeat} aria-hidden={repeat === 1 ? true : undefined}>
                  <span>
                    RMIT<small>University Vietnam</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                  <span className="m-michelin">
                    MICHELIN<small>Finance &amp; projects</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                  <span>
                    TikTok<small>Data &amp; operations</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                  <span>
                    CTM<small>Marketing &amp; sales</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProjectShowcase />
      <AboutPlayground paused={paused} />

      <footer className="m-contact" aria-labelledby="contact-title">
        <img className="m-footer-ribbon" src="/assets/cobalt-ribbon.png" alt="" loading="lazy" aria-hidden="true" />
        <div className="m-contact-content">
          <p>Next stop · A good conversation is a good beginning.</p>
          <h2 id="contact-title">
            <span>LET’S MAKE</span>
            <span>GOOD THINGS HAPPEN.</span>
          </h2>
          <div className="m-contact-actions">
            <a className="m-button m-button-paper" href={`mailto:${email}`}>
              Say hello <Arrow />
            </a>
            <div>
              <a className="m-email" href={`mailto:${email}`}>
                ngocmaimia056@<wbr />
                gmail.com
              </a>
              <button className="m-copy-email" onClick={copyEmail} aria-live="polite">
                {copyStatus}
              </button>
            </div>
          </div>
          <div className="m-footer-links">
            <div>
              <strong>Ngoc Mai Nguyen</strong>
              <span>Business, with a human side.</span>
            </div>
            <nav aria-label="Footer navigation">
              <a href="#/">Home</a>
              <a href="#/work">Projects</a>
              <a href="#/about">About Mai</a>
              <a href="#/contact">Contact</a>
            </nav>
            <div>
              <a href={linkedin} target="_blank" rel="noreferrer">
                LinkedIn <Arrow />
              </a>
              <a href="/ngoc-mai-cv.pdf" target="_blank" rel="noreferrer">
                Download CV <Arrow />
              </a>
            </div>
            <div>
              <strong>Based in Vietnam</strong>
              <span>Open to new conversations.</span>
            </div>
          </div>
          <div className="m-footer-sign">
            <a
              href="#/"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: paused ? 'instant' : 'smooth' })}
            >
              mai.
            </a>
            <span>Always Day 1.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
