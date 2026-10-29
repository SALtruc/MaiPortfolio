import { Component, lazy, Suspense } from 'react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import { studies } from './stories';
import type { Study } from './stories';
import { workVisuals } from './workVisuals';
import { projectChapterMap } from './routes';
import { WorkReel } from './WorkReel';
import './work.css';
import './cases/case-shell.css';

export type CaseModuleProps = {
  study: Study;
  paused: boolean;
};

const caseRegistry: Record<string, LazyExoticComponent<ComponentType<CaseModuleProps>>> = {
  council: lazy(() => import('./cases/CouncilCase')),
  michelin: lazy(() => import('./cases/MichelinCase')),
  checkpoint: lazy(() => import('./cases/CheckpointCase')),
  'careers-fair': lazy(() => import('./cases/CareersFairCase')),
  ctm: lazy(() => import('./cases/CtmCase')),
};

type CaseErrorBoundaryProps = {
  study: Study;
  children: ReactNode;
};

type CaseErrorBoundaryState = {
  hasError: boolean;
};

class CaseErrorBoundary extends Component<CaseErrorBoundaryProps, CaseErrorBoundaryState> {
  override state: CaseErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CaseErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      const { study } = this.props;
      return (
        <article className="case-module-error" role="alert">
          <p className="j-eyebrow">
            {study.company} · {study.date}
          </p>
          <h1>{study.name}</h1>
          <p>{study.intro}</p>
          <p className="case-module-error-outcome">{study.outcome}</p>
          <div className="case-module-error-actions">
            <button
              type="button"
              className="m-button m-button-dark"
              onClick={() => this.setState({ hasError: false })}
            >
              Try loading case again
            </button>
            <a className="m-button m-button-outline" href={study.source} target="_blank" rel="noreferrer">
              Read the original story ↗
            </a>
          </div>
        </article>
      );
    }
    return this.props.children;
  }
}

function ProjectCase({
  study,
  paused,
  onChange,
}: {
  study: Study;
  paused: boolean;
  onChange: (id: string) => void;
}) {
  const studyIndex = studies.indexOf(study);
  const next = studies[(studyIndex + 1) % studies.length];
  const chapterInfo = projectChapterMap[study.id];
  const CaseComponent = caseRegistry[study.id] ?? caseRegistry.checkpoint;

  return (
    <section
      className={`visual-case visual-case-${study.id}`}
      data-project={study.id}
      aria-label={`${study.name} project case study`}
    >
      <nav className="case-navigation" aria-label="Project case breadcrumb and chapter link">
        <div className="case-breadcrumb">
          <a className="case-back-link" href="#/work">
            ← All projects
          </a>
          <span className="case-breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <span className="case-breadcrumb-current">
            <span>0{studyIndex + 1}</span> {study.name}
          </span>
        </div>
        <div className="case-meta-links">
          {chapterInfo && (
            <a
              className="case-journey-link"
              href={chapterInfo.href}
              aria-label={`Mai’s journey: ${chapterInfo.company} — ${chapterInfo.lessonShort}`}
            >
              Mai’s journey ↗
            </a>
          )}
        </div>
      </nav>

      <div className="case-module-stage" data-case-module={study.id}>
        <CaseErrorBoundary key={study.id} study={study}>
          <Suspense
            fallback={
              <div className="case-module-loading" role="status" aria-live="polite">
                <p className="j-eyebrow">
                  0{studyIndex + 1} · {study.company}
                </p>
                <p className="case-module-loading-copy">Opening {study.name} case experience…</p>
              </div>
            }
          >
            <CaseComponent study={study} paused={paused} />
          </Suspense>
        </CaseErrorBoundary>
      </div>

      <a className="next-project-exhibit" href={`#/work/${next.id}`}>
        <img src={workVisuals[next.id].cover} alt={workVisuals[next.id].coverAlt} loading="lazy" />
        <div>
          <span>Next project in collection</span>
          <h2>{next.name}</h2>
          <p>{workVisuals[next.id].summary}</p>
        </div>
        <span aria-hidden="true">↗</span>
      </a>

      <nav className="case-collection-footer" aria-label="All project studies">
        <div className="case-collection-links">
          {studies.map((s, i) => (
            <button key={s.id} type="button" onClick={() => onChange(s.id)} aria-pressed={s.id === study.id}>
              <span>0{i + 1}</span> {s.name}
            </button>
          ))}
        </div>
        <div className="case-collection-return">
          <a href="#/work">← All 5 projects</a>
          {chapterInfo && <a href={chapterInfo.href}>Back to {chapterInfo.company} on 3D desk ↗</a>}
        </div>
      </nav>
    </section>
  );
}

export function WorkPage({
  projectId,
  invalidProject = false,
  paused = false,
  onChange,
}: {
  projectId: string | undefined;
  invalidProject?: boolean;
  paused?: boolean;
  onChange: (id: string) => void;
}) {
  if (invalidProject) {
    return (
      <section
        className="visual-case invalid-project-page"
        data-project="invalid"
        aria-labelledby="invalid-project-title"
      >
        <div className="case-navigation">
          <a className="case-back-link" href="#/work">
            ← All projects
          </a>
          <span>Project not found</span>
        </div>
        <div className="invalid-project-box" role="alert">
          <p className="j-eyebrow">Projects archive</p>
          <h1 id="invalid-project-title">That project story isn’t in the archive.</h1>
          <p>
            Mai’s portfolio includes five documented project case studies across finance, student leadership, career readiness and marketing operations. Choose a study below or return to the full collection.
          </p>
          <div className="invalid-project-grid">
            {studies.map((item, idx) => (
              <a key={item.id} className="invalid-project-card" href={`#/work/${item.id}`}>
                <span>
                  0{idx + 1} · {item.company}
                </span>
                <strong>{item.name} ↗</strong>
              </a>
            ))}
          </div>
          <div className="invalid-project-actions">
            <a className="m-button m-button-dark" href="#/work">
              Back to all 5 projects ↗
            </a>
            <a className="m-button m-button-outline" href="#/about">
              About Mai &amp; 3D Desk ↗
            </a>
          </div>
        </div>
      </section>
    );
  }

  const study = studies.find(item => item.id === projectId);
  return study ? <ProjectCase key={study.id} study={study} paused={paused} onChange={onChange} /> : <WorkReel />;
}
