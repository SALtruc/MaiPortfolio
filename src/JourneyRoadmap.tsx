import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { journeyStories } from './stories';
import { chapterLessons } from './routes';

type Point = [number, number];
type Geometry = { w: number; h: number; axis: 'x' | 'y'; stops: Point[]; tail: Point };

// Stops sit exactly on the road's knots, so the HTML overlay can place them by percentage.
const WIDE: Geometry = { w: 1000, h: 460, axis: 'x', stops: [[95, 300], [295, 110], [500, 300], [705, 110], [890, 290]], tail: [990, 175] };
const TALL: Geometry = { w: 360, h: 960, axis: 'y', stops: [[86, 70], [274, 250], [86, 430], [274, 610], [86, 790]], tail: [250, 940] };

function segment([x0, y0]: Point, [x1, y1]: Point, axis: Geometry['axis']) {
  if (axis === 'x') {
    const dx = (x1 - x0) / 2;
    return `C${x0 + dx} ${y0} ${x1 - dx} ${y1} ${x1} ${y1}`;
  }
  const dy = (y1 - y0) / 2;
  return `C${x0} ${y0 + dy} ${x1} ${y1 - dy} ${x1} ${y1}`;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export default function JourneyRoadmap({
  selected,
  paused,
  onChange,
}: {
  selected: number;
  paused: boolean;
  onChange: (index: number) => void;
}) {
  const [tall, setTall] = useState(() => matchMedia('(max-width: 850px)').matches);
  const geo = tall ? TALL : WIDE;
  const { stops } = geo;
  const road = `M${stops[0][0]} ${stops[0][1]}` + stops.slice(1).map((p, i) => segment(stops[i], p, geo.axis)).join('');
  const tail = `M${stops[4][0]} ${stops[4][1]}${segment(stops[4], geo.tail, geo.axis)}`;

  const box = useRef<HTMLDivElement>(null);
  const roadRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const pinRef = useRef<HTMLSpanElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const metrics = useRef({ total: 0, at: [0, 0, 0, 0, 0] });
  const current = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    const query = matchMedia('(max-width: 850px)');
    const update = () => setTall(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Draw the road fill and move Mai's pin to a distance along the road.
  const place = (length: number) => {
    const path = roadRef.current;
    const area = box.current;
    if (!path || !area) return;
    current.current = length;
    fillRef.current?.style.setProperty('stroke-dashoffset', `${metrics.current.total - length}`);
    const point = path.getPointAtLength(length);
    const scale = area.clientWidth / geo.w;
    pinRef.current?.style.setProperty('transform', `translate3d(${point.x * scale}px, ${point.y * scale}px, 0)`);
  };

  // Measure once per geometry; the road starts empty so the first visit draws it.
  useLayoutEffect(() => {
    const total = roadRef.current?.getTotalLength() ?? 0;
    let sum = 0;
    const at = [0, ...segRefs.current.slice(0, 4).map(seg => (sum += seg?.getTotalLength() ?? 0))];
    metrics.current = { total, at };
    fillRef.current?.style.setProperty('stroke-dasharray', `${total}`);
    const reduced = paused || matchMedia('(prefers-reduced-motion: reduce)').matches;
    place(reduced ? at[selected < 0 ? 4 : selected] : 0);
    const resize = new ResizeObserver(() => place(current.current));
    if (box.current) resize.observe(box.current);
    return () => resize.disconnect();
  }, [tall]);

  useEffect(() => {
    const target = metrics.current.at[selected < 0 ? 4 : selected];
    cancelAnimationFrame(frame.current);
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      place(target);
      return;
    }
    const from = current.current;
    const distance = Math.abs(target - from);
    const duration = 450 + (distance / Math.max(1, metrics.current.total)) * 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      place(from + (target - from) * easeInOut(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [selected, paused, tall]);

  const pct = ([x, y]: Point) => ({ left: `${(x / geo.w) * 100}%`, top: `${(y / geo.h) * 100}%` }) as CSSProperties;

  return (
    <div className="j-roadmap">
      <div className="j-roadmap-head">
        <span>The roadmap · 2024 → Now</span>
        <span>{selected < 0 ? 'Choose a stop' : `Stop 0${selected + 1} of 05`}</span>
      </div>
      <div className="j-road" ref={box} style={{ aspectRatio: `${geo.w} / ${geo.h}` }} data-layout={tall ? 'tall' : 'wide'}>
        <svg viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
          <path className="j-road-tail" d={tail} />
          <path className="j-road-base" d={road} ref={roadRef} />
          <path className="j-road-dash" d={road} />
          <path className="j-road-fill" d={road} ref={fillRef} />
          {stops.slice(1).map((p, i) => (
            <path
              key={i}
              className="j-road-measure"
              d={`M${stops[i][0]} ${stops[i][1]}${segment(stops[i], p, geo.axis)}`}
              ref={node => {
                segRefs.current[i] = node;
              }}
            />
          ))}
        </svg>

        <nav className="j-stops" aria-label="Journey roadmap">
          {journeyStories.map((item, index) => {
            const lesson = chapterLessons[index];
            const side = tall ? (stops[index][0] < geo.w / 2 ? 'right' : 'left') : 'below';
            return (
              <button
                key={item.company}
                type="button"
                className="j-stop"
                style={pct(stops[index])}
                data-label={side}
                data-passed={selected < 0 || index <= selected ? 'true' : undefined}
                ref={node => {
                  buttons.current[index] = node;
                }}
                aria-pressed={selected === index}
                aria-label={`Stop ${index + 1}: ${item.company}, ${item.year}. ${lesson.lessonShort}. ${lesson.skill}.`}
                onClick={() => onChange(index)}
                onKeyDown={event => {
                  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
                  event.preventDefault();
                  const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
                  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (index + (forward ? 1 : 4)) % 5;
                  buttons.current[next]?.focus();
                  onChange(next);
                }}
              >
                <span className="j-stop-plate">
                  {lesson.logo ? <img src={lesson.logo} alt="" draggable="false" /> : <strong>{item.company}</strong>}
                </span>
                <span className="j-stop-label">
                  <span className="j-chapter-year">
                    0{index + 1} · {item.year}
                  </span>
                  <span className="j-chapter-name">{item.company}</span>
                  <span className="j-chapter-lesson">{lesson.lessonShort}</span>
                  <span className="j-stop-skill">{lesson.skill}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <span className="j-pin" ref={pinRef} aria-hidden="true">
          <img src="/assets/mai-portrait.webp" alt="" />
        </span>

        <a className="j-road-next" href="#/contact" style={pct(geo.tail)}>
          Next stop? <strong>Let’s talk ↗</strong>
        </a>
      </div>
    </div>
  );
}
