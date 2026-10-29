export type WorkshopActivity = { name: string; detail: string };
export type WorkshopChapter = {
  id: 'discover' | 'apply' | 'connect';
  phase: string;
  labTitle: string;
  activities: WorkshopActivity[];
  evidenceImage: string;
  evidenceAlt: string;
  evidenceCaption: string;
};
export type ScheduleModeId = 'weekly' | 'focused';

export const WORKSHOP_CHAPTERS: WorkshopChapter[] = [
  {
    id: 'discover',
    phase: 'Discover',
    labTitle: 'Find Your Fit',
    activities: [
      { name: 'LinkedIn', detail: 'How experience and interests are presented in a professional profile.' },
      { name: 'Networking', detail: 'Starting a useful conversation about career interests and possibilities.' },
      { name: 'Job-fit Evaluation', detail: 'Considering how an opportunity connects with personal strengths and priorities.' },
    ],
    evidenceImage: '/assets/checkpoint-workshop.webp',
    evidenceAlt: 'Mai presenting the Career Checkpoint series at RMIT',
    evidenceCaption: 'The series recap: one concept developed into three connected workshops.',
  },
  {
    id: 'apply',
    phase: 'Apply',
    labTitle: 'Ready – Set – Apply',
    activities: [
      { name: 'CV Detective', detail: 'Looking closely at how a CV communicates a candidate’s experience and value.' },
      { name: 'Interview Roleplay', detail: 'Practising the conversation, rather than only hearing interview advice.' },
      { name: 'Responsible AI Using', detail: 'Considering responsible use of AI during career preparation.' },
    ],
    evidenceImage: '/assets/checkpoint-activity.webp',
    evidenceAlt: 'Career Checkpoint recap documenting the three labs and their activities',
    evidenceCaption: 'The activity recap documents three labs and eight-plus practical activities.',
  },
  {
    id: 'connect',
    phase: 'Connect',
    labTitle: 'Connect with Confidence',
    activities: [
      { name: 'LinkedIn', detail: 'Connecting a professional profile with the conversations that follow.' },
      { name: 'Networking', detail: 'Building confidence in approaching people and exploring professional relationships.' },
      { name: 'Job-fit Evaluation', detail: 'Returning to the question of fit when considering the next career step.' },
    ],
    evidenceImage: '/assets/checkpoint-team.webp',
    evidenceAlt: 'Career Checkpoint participant moments and post-workshop survey results',
    evidenceCaption: 'The recap records student participation and feedback from survey respondents.',
  },
];

export const SCHEDULE_MODES: Record<ScheduleModeId, { label: string; title: string; summary: string; slots: string[] }> = {
  weekly: {
    label: 'Original weekly plan',
    title: 'A workshop each week.',
    summary: 'The original plan spaced the workshops across separate weeks.',
    slots: ['First week', 'Next week', 'Following week'],
  },
  focused: {
    label: 'Delivered in one week',
    title: 'One week. One connected journey.',
    summary: 'I adapted the weekly plan into a focused series within one week. In my reflection, the closer sequence made the journey feel more connected.',
    slots: ['Discover', 'Apply', 'Connect'],
  },
};

export const RESPONDENT_METRICS = [
  { value: '88%', label: 'confident using the workshop tools' },
  { value: '91%', label: 'understood well or could explain the ideas' },
  { value: '86%', label: 'ready to apply what they learned' },
  { value: '84%', label: 'gained something new and clearer' },
];
