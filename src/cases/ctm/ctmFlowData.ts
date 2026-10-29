export type CtmChannelId = 'facebook' | 'tiktok' | 'linkedin' | 'website';
export type CtmStageId = 'webinars' | 'feedback' | 'followup';

export const CTM_CHANNELS: { id: CtmChannelId; name: string; symbol: string }[] = [
  { id: 'facebook', name: 'Facebook', symbol: 'f' },
  { id: 'tiktok', name: 'TikTok', symbol: '♪' },
  { id: 'linkedin', name: 'LinkedIn', symbol: 'in' },
  { id: 'website', name: 'Website', symbol: '↗' },
];

export const CTM_STAGES: {
  id: CtmStageId;
  name: string;
  title: string;
  action: string;
  connection: string;
  metric: string;
  metricLabel: string;
}[] = [
  {
    id: 'webinars', name: 'Webinars', title: 'Give the conversation a place to happen.',
    action: 'I coordinated 5+ monthly webinars and information sessions, including participant communications and follow-up.',
    connection: 'Alongside the sessions, I coordinated execution across Facebook, TikTok, LinkedIn and the company website.',
    metric: '5+', metricLabel: 'webinars per month',
  },
  {
    id: 'feedback', name: 'Feedback', title: 'Pay attention to the response.',
    action: 'I tracked audience engagement, customer feedback and campaign performance while supporting course promotion and sales.',
    connection: 'Looking at the response helped me see marketing activity as part of a wider customer experience.',
    metric: '4', metricLabel: 'coordinated digital channels',
  },
  {
    id: 'followup', name: 'Follow-up', title: 'Carry the interest forward.',
    action: 'My course promotion, customer engagement and sales support contributed to 15%+ of monthly revenue.',
    connection: 'Participant communications and follow-up were part of my role, alongside the campaign work.',
    metric: '15%+', metricLabel: 'monthly revenue contribution share',
  },
];

export type Point = { x: number; y: number };
export type Curve = { start: Point; first: Point; second: Point; end: Point };
const point = (x: number, y: number): Point => ({ x, y });
const curve = (a: Point, b: Point, c: Point, d: Point): Curve => ({ start: a, first: b, second: c, end: d });

// One coordinate system positions the actual controls, SVG paths and Canvas particles.
export function relayGeometry(compact: boolean) {
  if (compact) {
    const channels = [point(82, 46), point(238, 46), point(82, 109), point(238, 109)];
    const webinars = point(160, 230);
    const feedback = point(82, 372);
    const followup = point(238, 372);
    return {
      width: 320, height: 470, channels, stages: [webinars, feedback, followup],
      channelsToHub: channels.map((from, i) => curve(from, point(from.x, 165 + i * 5), point(160, 157), webinars)),
      work: [
        curve(webinars, point(160, 300), point(82, 292), feedback),
        curve(webinars, point(160, 300), point(238, 292), followup),
        curve(feedback, point(117, 440), point(205, 440), followup),
      ],
    };
  }
  const channels = [point(135, 63), point(135, 160), point(135, 257), point(135, 354)];
  const webinars = point(460, 208);
  const feedback = point(765, 91);
  const followup = point(840, 323);
  return {
    width: 1000, height: 440, channels, stages: [webinars, feedback, followup],
    channelsToHub: channels.map(from => curve(from, point(265, from.y), point(300, 208), webinars)),
    work: [
      curve(webinars, point(605, 208), point(620, 91), feedback),
      curve(webinars, point(620, 208), point(665, 323), followup),
      curve(feedback, point(915, 91), point(915, 260), followup),
    ],
  };
}

export function curvePath(c: Curve) {
  return `M${c.start.x},${c.start.y} C${c.first.x},${c.first.y} ${c.second.x},${c.second.y} ${c.end.x},${c.end.y}`;
}

export function curvePoint(c: Curve, t: number): Point {
  const u = 1 - t;
  return {
    x: u ** 3 * c.start.x + 3 * u ** 2 * t * c.first.x + 3 * u * t ** 2 * c.second.x + t ** 3 * c.end.x,
    y: u ** 3 * c.start.y + 3 * u ** 2 * t * c.first.y + 3 * u * t ** 2 * c.second.y + t ** 3 * c.end.y,
  };
}
