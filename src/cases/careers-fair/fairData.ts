export type PassPerspectiveId = 'visitor' | 'contributor';

export const PASS_PERSPECTIVES = {
  visitor: {
    label: 'Then', role: 'Student participant',
    line: 'A year before supporting the booth, I attended Careers Fair as a student.',
    image: '/assets/mai-portrait.webp',
    alt: 'Portrait of Mai at RMIT',
  },
  contributor: {
    label: 'Now', role: 'Career Booth team member',
    line: 'Returning with a different responsibility: helping students find their next step.',
    image: '/assets/careers-fair.webp',
    alt: 'Mai and a colleague at the RMIT Careers Fair booth',
  },
} as const;

export const RESPONSIBILITIES = [
  { id: 'guide', title: 'Guide', caption: 'The immediate question', progress: 0.16,
    image: '/assets/careers-fair.webp', alt: 'Mai and a colleague supporting the RMIT Careers Fair booth',
    imageCaption: 'At the Career Booth, as one member of the wider delivery team.' },
  { id: 'connect', title: 'Connect', caption: 'A conversation with employers', progress: 0.56,
    image: '/assets/mai-networking.webp', alt: 'Mai speaking with an industry representative at an RMIT networking event',
    imageCaption: 'Mai in a professional conversation at an RMIT networking event.' },
  { id: 'learn', title: 'Learn', caption: 'What I took forward', progress: 1,
    image: '/assets/career-launch.webp', alt: 'Students and speakers at Career Ready Launching Week',
    imageCaption: 'A related chapter: Career Ready Launching Week, where I supported communications and operations.' },
] as const;

export const REFLECTION_THEMES = [
  { title: 'AI in recruitment', body: 'Employer conversations opened up questions about how recruitment is changing.' },
  { title: 'Resilience', body: 'Persistence was part of my own journey, too: four applications before joining the Career Ready Assistant team.' },
  { title: 'Human connection', body: 'The fair offered more than applications: confidence, relationships and new possibilities through conversation.' },
] as const;

export type EvidenceItem = { image: string; alt: string; caption: string };

export const CAREERS_FAIR_EVIDENCE: EvidenceItem[] = [
  { image: '/assets/careers-fair.webp', alt: 'Mai and a colleague supporting the RMIT Careers Fair booth',
    caption: 'Career Booth · RMIT Careers Fair 2026' },
  { image: '/assets/mai-networking.webp', alt: 'Mai speaking with an industry representative at an RMIT networking event',
    caption: 'In conversation · an RMIT networking event' },
  { image: '/assets/career-launch.webp', alt: 'Students and speakers at Career Ready Launching Week',
    caption: 'A related chapter · Career Ready Launching Week' },
];
