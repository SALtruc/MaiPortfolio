import { studies } from './stories';

export type CanonicalPage = 'home' | 'work' | 'about' | 'contact' | 'lost';

export const mainNav: { id: Exclude<CanonicalPage, 'lost'>; href: string; label: string }[] = [
  { id: 'home', href: '#/', label: 'Home' },
  { id: 'work', href: '#/work', label: 'Projects' },
  { id: 'about', href: '#/about', label: 'About Mai' },
  { id: 'contact', href: '#/contact', label: 'Contact' },
];

export type ChapterLesson = {
  title: string;
  text: string;
  skill: string;
  lessonShort: string;
  project: string | null;
  relatedProjects: { id: string; name: string; label: string }[];
};

export const chapterLessons: ChapterLesson[] = [
  {
    title: 'People before spreadsheets.',
    text: 'Student leadership taught me to listen, build trust and adapt to different teams.',
    skill: 'Project management',
    lessonShort: 'Learning to lead',
    project: 'council',
    relatedProjects: [{ id: 'council', name: 'Club Day & community', label: 'See the work behind it' }],
  },
  {
    title: 'Look beyond the first click.',
    text: 'At CTM, I began connecting content, customer conversations and the follow-up that comes next.',
    skill: 'Communication',
    lessonShort: 'Seeing the whole picture',
    project: 'ctm',
    relatedProjects: [{ id: 'ctm', name: 'Customer engagement', label: 'See the work behind it' }],
  },
  {
    title: 'Try again. Then speak up.',
    text: 'Four applications later, I joined RMIT Careers. Confidence grew through conversations and taking ownership.',
    skill: 'Innovation',
    lessonShort: 'Finding my voice',
    project: 'checkpoint',
    relatedProjects: [
      { id: 'checkpoint', name: 'Career Checkpoint', label: 'See the work behind it' },
      { id: 'careers-fair', name: 'Careers Fair', label: 'Also from this chapter: Careers Fair' },
    ],
  },
  {
    title: 'Make the details useful.',
    text: 'Michelin taught me to organise different inputs into something a team could make a decision with.',
    skill: 'Data-driven',
    lessonShort: 'Building clarity',
    project: 'michelin',
    relatedProjects: [{ id: 'michelin', name: 'Green Finance', label: 'See the work behind it' }],
  },
  {
    title: 'A beginner, all over again.',
    text: 'Now at TikTok, I’m learning how data, quality and everyday operations support products people use.',
    skill: 'Data-driven',
    lessonShort: 'Always Day 1',
    project: null,
    relatedProjects: [],
  },
];

export const projectChapterMap: Record<string, { chapterIndex: number; company: string; lessonShort: string; href: string }> = {
  council: { chapterIndex: 0, company: 'Student Council', lessonShort: 'Learning to lead', href: '#/journey/0' },
  ctm: { chapterIndex: 1, company: 'CTM', lessonShort: 'Seeing the whole picture', href: '#/journey/1' },
  checkpoint: { chapterIndex: 2, company: 'RMIT Careers', lessonShort: 'Finding my voice', href: '#/journey/2' },
  'careers-fair': { chapterIndex: 2, company: 'RMIT Careers', lessonShort: 'Finding my voice', href: '#/journey/2' },
  michelin: { chapterIndex: 3, company: 'Michelin', lessonShort: 'Building clarity', href: '#/journey/3' },
};

const validProjectIds = new Set(studies.map(study => study.id));
const validChapterKeys = new Set(['0', '1', '2', '3', '4']);

export type ParsedRoute = {
  raw: string[];
  rawPage: string;
  canonicalPage: CanonicalPage;
  chapter: number;
  invalidChapter: boolean;
  aboutSection: 'desk' | 'background' | 'recognition' | null;
  projectId: string | undefined;
  invalidProject: boolean;
};

export function parseRoute(hash: string = location.hash): ParsedRoute {
  const clean = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  const parts = clean ? clean.split('/') : [''];
  const first = parts[0] || '';

  if (first === '' || first === 'home') {
    if (parts.length > 1) {
      return { raw: parts, rawPage: first, canonicalPage: 'lost', chapter: -1, invalidChapter: false, aboutSection: null, projectId: undefined, invalidProject: false };
    }
    return { raw: parts, rawPage: '', canonicalPage: 'home', chapter: -1, invalidChapter: false, aboutSection: null, projectId: undefined, invalidProject: false };
  }

  if (first === 'work' || first === 'projects') {
    if (parts.length === 1) {
      return { raw: parts, rawPage: 'work', canonicalPage: 'work', chapter: -1, invalidChapter: false, aboutSection: null, projectId: undefined, invalidProject: false };
    }
    if (parts.length === 2 && validProjectIds.has(parts[1])) {
      return { raw: parts, rawPage: 'work', canonicalPage: 'work', chapter: -1, invalidChapter: false, aboutSection: null, projectId: parts[1], invalidProject: false };
    }
    return { raw: parts, rawPage: 'work', canonicalPage: 'work', chapter: -1, invalidChapter: false, aboutSection: null, projectId: parts[1], invalidProject: true };
  }

  if (first === 'about' || first === 'journey' || first === 'notes') {
    if (first === 'notes') {
      if (parts.length === 1) {
        return { raw: parts, rawPage: 'notes', canonicalPage: 'about', chapter: -1, invalidChapter: false, aboutSection: 'background', projectId: undefined, invalidProject: false };
      }
      return { raw: parts, rawPage: 'notes', canonicalPage: 'about', chapter: -1, invalidChapter: true, aboutSection: null, projectId: undefined, invalidProject: false };
    }
    if (parts.length === 1) {
      return { raw: parts, rawPage: first, canonicalPage: 'about', chapter: -1, invalidChapter: false, aboutSection: first === 'journey' ? 'desk' : null, projectId: undefined, invalidProject: false };
    }
    if (parts.length === 2 && validChapterKeys.has(parts[1])) {
      return { raw: parts, rawPage: first, canonicalPage: 'about', chapter: Number(parts[1]), invalidChapter: false, aboutSection: 'desk', projectId: undefined, invalidProject: false };
    }
    if (parts.length === 2 && first === 'about' && (parts[1] === 'desk' || parts[1] === 'background' || parts[1] === 'recognition')) {
      return { raw: parts, rawPage: 'about', canonicalPage: 'about', chapter: -1, invalidChapter: false, aboutSection: parts[1], projectId: undefined, invalidProject: false };
    }
    return { raw: parts, rawPage: first, canonicalPage: 'about', chapter: -1, invalidChapter: true, aboutSection: null, projectId: undefined, invalidProject: false };
  }

  if (first === 'contact' || first === 'hello') {
    if (parts.length === 1) {
      return { raw: parts, rawPage: 'contact', canonicalPage: 'contact', chapter: -1, invalidChapter: false, aboutSection: null, projectId: undefined, invalidProject: false };
    }
    return { raw: parts, rawPage: first, canonicalPage: 'lost', chapter: -1, invalidChapter: false, aboutSection: null, projectId: undefined, invalidProject: false };
  }

  return { raw: parts, rawPage: first, canonicalPage: 'lost', chapter: -1, invalidChapter: false, aboutSection: null, projectId: undefined, invalidProject: false };
}
