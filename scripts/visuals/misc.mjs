import { profile } from '../../data/profile.mjs';
import { svg, mono, sans, sectionHeader, monoWidth, pulseDot, r } from '../lib.mjs';

const W = 840;

/** A slim stand-alone section header, for sections whose content isn't one image. */
export const header = (index, label, note) => (t) =>
  svg({ width: W, height: 24, title: `${index}. ${label}`, body: sectionHeader(t, index, label, W, note) });

/** Career timeline: a line draws itself left to right and each milestone pops in as it passes. */
export function path(t) {
  const H = 150;
  const events = profile.path;
  const t0 = events[0].t - 0.15;
  const t1 = events.at(-1).t;
  const x0 = 8, x1 = W - 70;
  const X = (v) => x0 + ((v - t0) / (t1 - t0)) * (x1 - x0);
  const y = 84;
  const DRAW = 2.4;
  const len = x1 - x0;

  let body = sectionHeader(t, '05', 'path', W);
  body += `<line x1="${x0}" y1="${y}" x2="${W}" y2="${y}" stroke="${t.line}"/>`;
  body += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${t.accent}" stroke-width="1.5" stroke-dasharray="${r(len)}" style="animation: tl ${DRAW}s cubic-bezier(.5,0,.3,1) .2s both"/>`;
  // Dashed continuation: the future.
  body += `<line x1="${x1 + 8}" y1="${y}" x2="${W}" y2="${y}" stroke="${t.faint}" stroke-dasharray="2 4"/>`;

  events.forEach((e, i) => {
    const x = X(e.t);
    const above = i % 2 === 0;
    const delay = r(0.2 + ((x - x0) / len) * DRAW);
    const anchor = i === 0 ? 'start' : e.now ? 'end' : 'middle';
    const lx = i === 0 ? x - 4 : e.now ? x + 4 : x;
    const whenY = above ? y - 32 : y + 30;
    const whatY = above ? y - 14 : y + 48;
    const dot = e.now
      ? pulseDot(x, y, t.accent)
      : `<circle cx="${r(x)}" cy="${y}" r="4" fill="${t.accent}" stroke-width="3" stroke="${t.name === 'dark' ? '#0d1117' : '#ffffff'}"/>`;
    body += `<g class="rise" style="animation-delay:${delay}s">
      ${dot}
      ${mono(lx, whenY, e.when, { size: 10.5, fill: e.now ? t.accent : t.muted, anchor })}
      ${sans(lx, whatY, e.what, { size: 13, weight: e.now ? 600 : 500, fill: t.fg, anchor })}
    </g>`;
  });

  return svg({
    width: W,
    height: H,
    title: 'Career path',
    desc: events.map((e) => `${e.when}: ${e.what}`).join('. '),
    css: `@keyframes tl { from { stroke-dashoffset: ${r(len)}; } to { stroke-dashoffset: 0; } }`,
    body,
  });
}

/** Three tiers of tools, as chips that flow and wrap. JS/TS are highlighted. */
export function toolbox(t) {
  const size = 11.5;
  const chipH = 26, gapX = 8, gapY = 10;
  const left = 112;
  let y = 40;
  let body = sectionHeader(t, '06', 'toolbox', W);
  let k = 0;

  for (const tier of profile.toolbox) {
    body += mono(0, y + 17, tier.label, { size: 11, fill: t.muted });
    let x = left;
    for (const item of tier.items) {
      const w = monoWidth(item, size) + 22;
      if (x + w > W) {
        x = left;
        y += chipH + gapY;
      }
      const core = tier.core?.includes(item);
      body += `<g class="rise" style="animation-delay:${r(0.1 + k++ * 0.035)}s">
        <rect x="${r(x + 0.5)}" y="${y + 0.5}" width="${r(w - 1)}" height="${chipH - 1}" rx="${chipH / 2}" fill="${core ? t.accentSoft : 'none'}" stroke="${core ? t.accent : t.line}"/>
        ${mono(x + 11, y + 17.5, item, { size, fill: core ? t.accent : t.fg, weight: core ? 600 : undefined })}
      </g>`;
      x += w + gapX;
    }
    y += chipH + gapY + 6;
  }

  return svg({
    width: W,
    height: y,
    title: 'Toolbox',
    desc: profile.toolbox.map((tr) => `${tr.label}: ${tr.items.join(', ')}`).join('. '),
    body,
  });
}

/** Small pill-shaped link buttons ("portfolio ↗"). */
export const linkButton = (label) => (t) => {
  const text = `${label} ↗`;
  const w = Math.ceil(monoWidth(text, 12) + 30);
  return svg({
    width: w,
    height: 34,
    title: label,
    body: `<rect x=".5" y=".5" width="${w - 1}" height="33" rx="17" fill="none" stroke="${t.line}"/>
      ${mono(15, 21.5, label, { size: 12, fill: t.fg })}
      ${mono(15 + monoWidth(label + ' ', 12), 21.5, '↗', { size: 12, fill: t.accent })}`,
  });
};

/** Closing line. */
export function footer(t) {
  const line = '// thanks for scrolling. let’s build something.';
  return svg({
    width: W,
    height: 40,
    title: 'Thanks for scrolling',
    body: `<line x1="0" y1="8" x2="${W}" y2="8" stroke="${t.line}" class="rule"/>
      <g class="fade" style="animation-delay:.6s">${mono(W / 2, 32, line, { size: 11.5, fill: t.muted, anchor: 'middle' })}</g>`,
  });
}
