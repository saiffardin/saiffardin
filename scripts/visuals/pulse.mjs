import { profile } from '../../data/profile.mjs';
import { svg, mono, sans, sectionHeader, monoWidth, r } from '../lib.mjs';

const W = 840;
const H = 230;

// ---------- data ----------

const UA = { 'User-Agent': 'profile-readme-builder' };

/** Daily contribution counts for the last year: [{ date, count }]. */
async function fetchCalendar(user, token) {
  if (token) {
    const query = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { ...UA, Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { login: user } }),
    });
    const json = await res.json();
    const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (weeks) return weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
    console.warn('GraphQL calendar unavailable, falling back to the public page:', JSON.stringify(json?.errors ?? json).slice(0, 200));
  }
  // No token: read the public contributions fragment that github.com itself renders.
  const html = await (await fetch(`https://github.com/users/${user}/contributions`, { headers: UA })).text();
  const ids = new Map(); // cell id -> date
  for (const m of html.matchAll(/data-date="([\d-]+)"\s+id="([^"]+)"/g)) ids.set(m[2], m[1]);
  const days = [];
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const date = ids.get(m[1]);
    if (!date) continue;
    const n = /^(\d[\d,]*) contribution/.exec(m[2].trim());
    days.push({ date, count: n ? Number(n[1].replace(/,/g, '')) : 0 });
  }
  if (!days.length) throw new Error('Could not read the contribution calendar.');
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

/** Language share across owned, non-fork repos (by primary language). */
async function fetchLanguages(user, token, privateToken) {
  const url = privateToken
    ? 'https://api.github.com/user/repos?per_page=100&affiliation=owner&visibility=all'
    : `https://api.github.com/users/${user}/repos?per_page=100&type=owner`;
  const auth = privateToken ?? token;
  const res = await fetch(url, { headers: { ...UA, Accept: 'application/vnd.github+json', ...(auth && { Authorization: `Bearer ${auth}` }) } });
  if (!res.ok) throw new Error(`repos: ${res.status}`);
  const repos = (await res.json()).filter((x) => !x.fork && x.language);
  const counts = {};
  for (const repo of repos) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
  const total = repos.length;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 4).map(([name, n]) => ({ name, share: n / total }));
  const rest = 1 - top.reduce((s, x) => s + x.share, 0);
  if (rest > 0.001) top.push({ name: 'other', share: rest });
  return { total, langs: top };
}

export async function fetchPulse() {
  const user = profile.username;
  const token = process.env.GITHUB_TOKEN;
  const privateToken = process.env.PROFILE_TOKEN; // optional PAT so private repos count too
  const [days, languages] = await Promise.all([fetchCalendar(user, privateToken ?? token), fetchLanguages(user, token, privateToken)]);

  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const weekly = weeks.map((w) => ({ start: w[0].date, count: w.reduce((s, d) => s + d.count, 0) }));
  const busiest = Math.max(...weekly.map((w) => w.count));
  return { total, active, longest, weekly, busiest, languages, updated: new Date().toISOString().slice(0, 10) };
}

// ---------- drawing ----------

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smooth(pts, floor = Infinity) {
  const c = (y) => Math.min(y, floor);
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, c(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, c(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

export function pulse(data) {
  return (t) => {
    const { total, active, longest, weekly, busiest, languages, updated } = data;

    // Chart area on the right.
    const cx = 300, cw = W - cx, cy = 52, ch = 110;
    const max = Math.max(busiest, 1);
    const pts = weekly.map((w, i) => [cx + (i / (weekly.length - 1)) * cw, cy + ch - (Math.sqrt(w.count) / Math.sqrt(max)) * (ch - 8)]);
    const line = smooth(pts, cy + ch);
    const area = `${line} L${cx + cw} ${cy + ch} L${cx} ${cy + ch} Z`;
    const peak = pts[weekly.findIndex((w) => w.count === busiest)];

    // Month ticks.
    let ticks = '';
    let lastMonth = '';
    weekly.forEach((w, i) => {
      const m = new Date(w.start + 'T00:00:00Z').toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toLowerCase();
      if (m !== lastMonth && i > 0 && i < weekly.length - 2) {
        ticks += mono(pts[i][0], cy + ch + 20, m, { size: 9.5, fill: t.faint, anchor: 'middle' });
      }
      lastMonth = m;
    });

    // Language bar.
    const palette = [t.accent, t.fg, t.muted, t.faint, t.line];
    const barW = 240;
    let bx = 0;
    const segs = languages.langs
      .map((l, i) => {
        const w = Math.max(l.share * barW - 2, 1);
        const el = `<rect x="${r(bx)}" y="178" width="${r(w)}" height="6" rx="2" fill="${palette[i]}"/>`;
        bx += l.share * barW;
        return el;
      })
      .join('');
    let lx = 0, ly = 202;
    const legend = languages.langs
      .slice(0, 4)
      .map((l, i) => {
        const label = `${l.name.toLowerCase()} ${Math.round(l.share * 100)}%`;
        const w = monoWidth(label, 10) + 18;
        if (lx + w > barW + 20) { lx = 0; ly += 16; }
        const el = `<circle cx="${lx + 3}" cy="${ly - 3.5}" r="3" fill="${palette[i]}"/>${mono(lx + 10, ly, label, { size: 10, fill: t.muted })}`;
        lx += w;
        return el;
      })
      .join('');

    const len = 2000;
    const body = `
      ${sectionHeader(t, '07', 'pulse', W, `live · rebuilt daily · ${updated}`)}
      <defs>
        <linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${t.accent}" stop-opacity="${t.name === 'dark' ? 0.28 : 0.2}"/>
          <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g class="rise" style="animation-delay:.1s">
        ${sans(-1, 96, total.toLocaleString('en'), { size: 46, weight: 700, fill: t.fg, spacing: -1.5 })}
        ${sans(0, 120, 'contributions in the last year', { size: 13, fill: t.muted })}
        ${mono(0, 146, `${active} active days · ${longest}-day best streak`, { size: 10.5, fill: t.muted })}
      </g>
      <g class="fade" style="animation-delay:.5s">${segs}${legend}</g>
      <line x1="${cx}" y1="${cy + ch}" x2="${W}" y2="${cy + ch}" stroke="${t.line}"/>
      <path d="${area}" fill="url(#pulse-fill)" class="fade" style="animation-delay:1.2s; animation-duration:1.4s"/>
      <path id="pulse-line" d="${line}" fill="none" stroke="${t.accent}" stroke-width="1.6" stroke-linejoin="round" stroke-dasharray="${len}" style="animation: trace 2.4s cubic-bezier(.4,0,.2,1) .2s both"/>
      <circle r="3.5" fill="${t.accent}" opacity="0">
        <animate attributeName="opacity" values="0;1" begin="2.6s" dur=".01s" fill="freeze"/>
        <animateMotion dur="9s" begin="2.6s" repeatCount="indefinite" rotate="0"><mpath href="#pulse-line"/></animateMotion>
      </circle>
      ${peak ? `<g class="fade" style="animation-delay:2.2s"><circle cx="${r(peak[0])}" cy="${r(peak[1])}" r="2.5" fill="none" stroke="${t.fg}"/>${mono(Math.min(peak[0], W - 70), peak[1] - 10, `${busiest} / wk`, { size: 9.5, fill: t.fg, anchor: 'middle' })}</g>` : ''}
      ${ticks}
      ${mono(W, H - 6, `by language · ${languages.total} repos`, { size: 9.5, fill: t.faint, anchor: 'end' })}`;

    return svg({
      width: W,
      height: H,
      title: 'Pulse: GitHub activity in the last year',
      desc: `${total} contributions in the last year across ${active} active days; best streak ${longest} days. Languages: ${languages.langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}. Updated ${updated}.`,
      css: `@keyframes trace { from { stroke-dashoffset: ${len}; } to { stroke-dashoffset: 0; } }`,
      body,
    });
  };
}
