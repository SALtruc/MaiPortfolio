type VisualStory={
 title:string;subtitle:string;category:string;summary:string;cover:string;coverAlt:string;
 steps:{label:string;caption:string;kind:'discover'|'document'|'connect';image:string;alt:string}[];
};
export const workVisuals:Record<string,VisualStory>={
 checkpoint:{title:'One idea. Three ways forward.',subtitle:'A career series built around doing.',category:'Experience design · RMIT',summary:'160 students. Three hands-on workshops.',cover:'/assets/checkpoint-workshop.webp',coverAlt:'Mai presenting the Career Checkpoint workshop series',steps:[
  {label:'Listen',caption:'Start with student needs',kind:'discover',image:'/assets/checkpoint-workshop.webp',alt:'Career Checkpoint series developed from a student focus group'},
  {label:'Design',caption:'Discover → Apply → Connect',kind:'document',image:'/assets/checkpoint-activity.webp',alt:'Three Career Checkpoint labs with hands-on activities'},
  {label:'Deliver',caption:'One focused week',kind:'connect',image:'/assets/checkpoint-team.webp',alt:'Career Checkpoint participant feedback and workshop photos'}
 ]},
 michelin:{title:'Many inputs. A clearer decision.',subtitle:'Helping a solar energy project move forward.',category:'Analysis & coordination · Michelin',summary:'15+ proposals brought into the decision process.',cover:'/assets/michelin-team.webp',coverAlt:'Mai and the Michelin project team visiting a dealership',steps:[
  {label:'Gather',caption:'12+ vendors · 4+ departments',kind:'connect',image:'/assets/michelin-team.webp',alt:'The Michelin project team at a dealership'},
  {label:'Evaluate',caption:'15+ proposals',kind:'document',image:'/assets/michelin-team.webp',alt:'People involved in the Michelin solar project'},
  {label:'Follow through',caption:'Support contract finalisation',kind:'discover',image:'/assets/michelin-team.webp',alt:'The dealership context of the solar installation project'}
 ]},
 council:{title:'A campus brought together.',subtitle:'Supporting the people behind Club Day.',category:'Community & operations · RMIT',summary:'43 clubs. More than 2,500 participants.',cover:'/assets/clubday-team.webp',coverAlt:'A bustling RMIT Club Day, with students gathered around the stage',steps:[
  {label:'Listen',caption:'Different clubs, different needs',kind:'connect',image:'/assets/council-meeting.webp',alt:'Student Council executives and club leaders meeting'},
  {label:'Coordinate',caption:'Budgets & sponsorships',kind:'document',image:'/assets/council-portrait.webp',alt:'Mai in her RMIT Student Council sash'},
  {label:'Support delivery',caption:'Beyond the R-CADE',kind:'discover',image:'/assets/clubday-team.webp',alt:'Clubs and students at Club Day Beyond the R-CADE'}
 ]},
 'careers-fair':{title:'A big event. A personal next step.',subtitle:'Making the Career Booth a place to start.',category:'Student experience · RMIT Careers',summary:'300+ student conversations at the Career Booth.',cover:'/assets/careers-fair.webp',coverAlt:'Mai and a colleague welcoming students at the Careers Fair booth',steps:[
  {label:'Guide',caption:'Answer the immediate question',kind:'discover',image:'/assets/careers-fair.webp',alt:'Mai supporting the RMIT Careers Fair booth'},
  {label:'Connect',caption:'Students meet employers',kind:'connect',image:'/assets/mai-networking.webp',alt:'Mai in a professional networking conversation'},
  {label:'Learn',caption:'Take the conversations forward',kind:'document',image:'/assets/career-launch.webp',alt:'A Career Ready session with students and industry speakers'}
 ]},
 ctm:{title:'Beyond the first click.',subtitle:'Connecting campaigns with customer conversations.',category:'Marketing & engagement · CTM',summary:'Four channels. Webinars. The follow-up between.',cover:'/assets/ctm-event.webp',coverAlt:'The CTM team at an education and consulting event',steps:[
  {label:'Reach',caption:'Four digital channels',kind:'discover',image:'/assets/ctm-event.webp',alt:'CTM education consulting team at an event'},
  {label:'Engage',caption:'5+ webinars per month',kind:'connect',image:'/assets/ctm-event.webp',alt:'Education consulting and customer engagement at CTM'},
  {label:'Follow up',caption:'Feedback informs the next step',kind:'document',image:'/assets/ctm-event.webp',alt:'The team behind CTM course promotion and customer follow-up'}
 ]}
};
