export type HubId = 'listen' | 'coordinate' | 'deliver';

export const COUNCIL_LENSES = [
  {
    id: 'listen' as HubId,
    label: 'Listen',
    index: 0,
    metric: '3',
    metricLabel: 'semesters of council work',
    image: '/assets/council-meeting.webp',
    alt: 'Mai and fellow Student Council executives at a club committee meeting',
    caption: 'The relationships behind campus events.',
    x: 260,
    y: 430,
  },
  {
    id: 'coordinate' as HubId,
    label: 'Coordinate',
    index: 1,
    metric: '500M+',
    metricLabel: 'VND annual council budget',
    image: '/assets/council-portrait.webp',
    alt: 'Mai wearing her RMIT Student Council sash',
    caption: 'CFO and Sponsorship Coordinator, 2024–2026.',
    x: 500,
    y: 470,
  },
  {
    id: 'deliver' as HubId,
    label: 'Deliver',
    index: 2,
    metric: '2,500+',
    metricLabel: 'participants at Club Day S3/2025',
    image: '/assets/clubday-team.webp',
    alt: 'Clubs and organisers at RMIT Club Day Beyond the R-CADE',
    caption: 'Beyond the R-CADE: a result shared by clubs, organisers and university staff.',
    x: 740,
    y: 430,
  },
];

// A visual count of participating clubs, not a floorplan or per-club record.
export const CLUB_POINTS = Array.from({ length: 43 }, (_, index) => {
  const angle = (index / 43) * Math.PI * 2 - Math.PI / 2;
  return {
    id: index,
    x: 500 + Math.cos(angle) * 430,
    y: 245 + Math.sin(angle) * 210,
  };
});

export const EVIDENCE_SEQUENCE = [
  {
    image: '/assets/clubday-portrait.webp',
    alt: 'Mai at Club Day Beyond the R-CADE at RMIT Vietnam',
    title: 'On the day',
    caption: 'Mai at Club Day S3/2025, where 43 clubs welcomed over 2,500 participants.',
  },
  {
    image: '/assets/council-meeting.webp',
    alt: 'Mai and fellow Student Council executives at a club committee meeting',
    title: 'Around the table',
    caption: 'Working alongside club leaders and fellow Student Council executives.',
  },
  {
    image: '/assets/clubday-team.webp',
    alt: 'Clubs and organisers at RMIT Club Day',
    title: 'A shared result',
    caption: 'Club Day was delivered with its project leader, clubs, university staff and wider team.',
  },
  {
    image: '/assets/council-portrait.webp',
    alt: 'Mai wearing her Student Council sash at RMIT',
    title: 'Growing into the role',
    caption: 'CFO, Sponsorship Coordinator and Club Day Project Supervisor across the council journey.',
  },
];
