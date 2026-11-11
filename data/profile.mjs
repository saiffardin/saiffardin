// Single source of truth for everything the profile shows.
// Edit text here, then run `npm run build` to regenerate every SVG in /assets.

export const profile = {
  username: 'saiffardin',
  name: 'Saif Chowdhury',
  role: 'Software Engineer · Full-stack Developer · Dhaka, BD',
  available: true,

  // Hero: typed one after another, then erased. Keep each under ~44 characters.
  typed: [
    'javascript is my first language',
    'ships government-grade React apps',
    'shrank a Docker image by 94.58%',
    'moved Next.js 14 pages/ → 15 app/',
    'builds full-stack SaaS on Supabase',
  ],

  // Hero: the code card on the right (mirrors quick_facts.ts on the portfolio).
  quickFacts: {
    base: 'Dhaka, BD',
    years: 5,
    core: 'JavaScript',
    stack: ['React', 'Next', 'Node'],
    ships: 'full-stack',
  },

  impact: [
    { value: '5 yrs', lines: ['shipping production', 'web applications'] },
    { value: '94.58%', lines: ['Docker image cut', 'from 2.88 GB to 156 MB'], docker: { from: '2.88 GB', to: '156 MB', ratio: 156 / 2880 } },
    { value: '3', lines: ['government platforms', 'elections & civil registry'] },
    { value: '14 → 15', lines: ['led the Next.js', 'App Router migration'] },
  ],

  // The full-stack request lifecycle diagram.
  stack: [
    { id: 'ui', title: 'Interface', items: ['React', 'Next.js 15', 'TypeScript', 'Tailwind · ShadCN'] },
    { id: 'state', title: 'State & forms', items: ['Redux · RTK Query', 'React Query', 'React Hook Form', 'Yup'] },
    { id: 'auth', title: 'Auth', items: ['Keycloak', 'NextAuth', 'Supabase RLS', 'RBAC'] },
    { id: 'server', title: 'Server', items: ['Node.js', 'Express', 'Server Actions', 'REST'] },
    { id: 'data', title: 'Data', items: ['PostgreSQL', 'MongoDB', 'Supabase', 'Firebase'] },
  ],
  ship: ['Docker', 'Git', 'CI/CD', 'Jest', 'Netlify', 'Vercel', 'Cloudflare R2'],

  // Project cards. `motif` picks the small animation in the corner of each card.
  projects: [
    {
      slug: 'ons',
      kicker: 'gov · elections',
      title: 'Online Nomination System',
      desc: 'Candidate-facing portal for filing election nominations online, used for national, city-corporation and upazila elections.',
      tags: ['React', 'Redux', 'Hook Form', 'Keycloak'],
      status: 'live',
      url: 'https://onss.ecs.gov.bd',
      motif: 'stepper',
    },
    {
      slug: 'ems',
      kicker: 'gov · elections',
      title: 'Election Management System',
      desc: 'Role-based election operations: admins, returning and presiding officers set up polling centers, manage candidates and finalize results.',
      tags: ['React', 'Redux', 'Yup', 'Docker'],
      status: 'internal',
      url: 'https://saiffardin.netlify.app/#experience',
      motif: 'ballot',
    },
    {
      slug: 'marriage',
      kicker: 'gov · civil registry',
      title: 'Marriage & Divorce Registry',
      desc: 'Registration, certificate issuance and verification, plus an analytics dashboard for the Ministry of Law.',
      tags: ['Next.js', 'React Query', 'ShadCN'],
      status: 'live',
      url: 'https://marriage.gov.bd',
      motif: 'bars',
    },
    {
      slug: 'itrade',
      kicker: 'saas · full-stack',
      title: 'i-Trade Recruitment SaaS',
      desc: 'Replaces an agency’s Excel workflow: an 8-stage candidate pipeline, role-based access, dynamic fields and a bilingual UI.',
      tags: ['Next.js 15', 'Supabase', 'Postgres'],
      status: 'demo',
      url: 'https://i-trade-sass-v1.netlify.app/',
      motif: 'pipeline',
    },
    {
      slug: 'billion',
      kicker: 'platform · admin',
      title: 'Billion API Admin',
      desc: 'Built the admin panel and led its migration from the Next.js 14 Pages Router to the Next.js 15 App Router.',
      tags: ['Next.js 15', 'NextAuth', 'Recharts'],
      status: 'shipped',
      url: 'https://saiffardin.netlify.app/#experience',
      motif: 'migrate',
    },
    {
      slug: 'yaana',
      kicker: 'enterprise · data',
      title: 'Yaana',
      desc: 'Data slicing, cascading filters and deal, contract and statement workflows for an enterprise data-exploration app.',
      tags: ['React', 'TypeScript', 'REST'],
      status: 'shipped',
      url: 'https://saiffardin.netlify.app/#experience',
      motif: 'filters',
    },
  ],

  // Personal full-stack repos, listed as text links under the cards.
  lab: [
    { name: 'Ride Booking API', repo: 'L2-Assignment-05-RideBookingAPI', note: 'Express · TypeScript · MongoDB · JWT roles' },
    { name: 'Tour Management API', repo: 'tour-ms-be', note: 'Express · Mongoose · Zod' },
    { name: 'Creative Agency', repo: 'creative-agency-client', note: 'MERN · Firebase Auth' },
    { name: 'RTK Query + JWT', repo: 'rtk-query-jwt', note: 'auth flow with token refresh' },
  ],

  // Timeline. `t` is a decimal year (2022.5 = mid-2022).
  path: [
    { t: 2017.3, when: '2017', what: 'B.Sc. CSE · AUST' },
    { t: 2020.55, when: 'Jul 2020', what: 'first JavaScript repo' },
    { t: 2022.1, when: 'Feb 2022', what: 'Jr. SE · Anwar Ent.' },
    { t: 2022.6, when: 'Aug 2022', what: 'freelance · Carniba' },
    { t: 2023.7, when: 'Sep 2023', what: 'SE · Penta Global' },
    { t: 2026.86, when: 'now', what: 'gov + full-stack SaaS', now: true },
  ],

  toolbox: [
    { label: 'think in', items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Redux', 'Git'], core: ['JavaScript', 'TypeScript'] },
    { label: 'ship with', items: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Supabase', 'Tailwind', 'Hook Form', 'Yup', 'Docker', 'Keycloak'] },
    { label: 'reach for', items: ['RTK Query', 'React Query', 'NextAuth', 'ShadCN', 'MUI', 'Ant Design', 'DaisyUI', 'Recharts', 'Jest', 'Firebase', 'Netlify'] },
  ],

  links: [
    { slug: 'portfolio', label: 'portfolio', url: 'https://saiffardin.netlify.app' },
    { slug: 'linkedin', label: 'linkedin', url: 'https://linkedin.com/in/saiffardin' },
    { slug: 'email', label: 'email', url: 'mailto:saiffardin@gmail.com' },
    { slug: 'resume', label: 'resume', url: 'https://drive.google.com/file/d/1iUWybTEHNVq4J_ZTKYRZqLGKoYzACJec/view?usp=sharing' },
  ],
};
