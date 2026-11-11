import { profile } from '../../data/profile.mjs';
import { svg, mono, sans, monoWidth, pulseDot, r, MONO_ADVANCE } from '../lib.mjs';

const W = 840;
const H = 250;

// Typing line: one shared clip rect + caret, driven by discrete SMIL steps,
// while each phrase is only visible during its own slot of the cycle.
function typewriter(t, x, y, phrases, size) {
  const cw = size * MONO_ADVANCE;
  const TYPE = 0.06, DELETE = 0.022, HOLD = 2.0, GAP = 0.45;
  // Seeded jitter so typing has a human rhythm but the output is identical on every build.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const events = []; // [time, charsShown]
  const slots = [];
  let time = 0;
  for (const p of phrases) {
    const chars = [...p];
    const start = time;
    events.push([time, 0]);
    chars.forEach((ch, k) => {
      // Brief hesitation after a space, a little randomness on every key.
      time += TYPE * (0.6 + rand() * 0.8) + (chars[k - 1] === ' ' ? 0.05 : 0);
      events.push([time, k + 1]);
    });
    time += HOLD;
    for (let k = chars.length - 1; k >= 0; k--) {
      time += DELETE;
      events.push([time, k]);
    }
    time += GAP;
    slots.push([start, time]);
  }
  const T = time;
  // keyTimes need real precision: rounding them to 0.01 of a ~25s cycle
  // would bunch several keystrokes into one jump.
  const kt5 = (s) => (s / T).toFixed(5);
  const keyTimes = events.map(([s]) => kt5(s));
  const widths = events.map(([, k]) => r(k * cw));
  const carets = events.map(([, k]) => r(x + k * cw + 1));
  keyTimes.push('1'), widths.push(0), carets.push(r(x + 1));

  const kt = keyTimes.join(';');
  const textEls = phrases
    .map((p, i) => {
      const [a, b] = slots[i];
      const times = a === 0 ? `0;${kt5(b)}` : `0;${kt5(a)};${kt5(b)}`;
      const values = a === 0 ? '1;0' : '0;1;0';
      return `<g opacity="${a === 0 ? 1 : 0}"><animate attributeName="opacity" values="${values}" keyTimes="${times}" calcMode="discrete" dur="${r(T)}s" repeatCount="indefinite"/>${mono(x, y, p, { size, fill: t.fg })}</g>`;
    })
    .join('');

  return `
  <clipPath id="type-clip"><rect x="${x}" y="${y - size}" height="${size * 1.6}" width="0">
    <animate attributeName="width" values="${widths.join(';')}" keyTimes="${kt}" calcMode="discrete" dur="${r(T)}s" repeatCount="indefinite"/>
  </rect></clipPath>
  <g clip-path="url(#type-clip)">${textEls}</g>
  <rect x="${x + 1}" y="${y - size + 1}" width="2" height="${size + 4}" rx="1" fill="${t.accent}" style="animation: blink 1.05s steps(1) infinite">
    <animate attributeName="x" values="${carets.join(';')}" keyTimes="${kt}" calcMode="discrete" dur="${r(T)}s" repeatCount="indefinite"/>
  </rect>`;
}

// The quick_facts.ts card on the right, lines appearing one by one.
function codeCard(t, x, y, w) {
  const f = profile.quickFacts;
  const size = 12.5;
  const lh = 21;
  const k = (s) => ({ s, c: t.fg });
  const p = (s) => ({ s, c: t.muted });
  const v = (s) => ({ s, c: t.accent });
  const lines = [
    [{ s: '// quick_facts.ts', c: t.faint }],
    [v('const'), k(' saif '), p('= {')],
    [k('  base'), p(':  '), v(`"${f.base}"`), p(',')],
    [k('  years'), p(': '), v(String(f.years)), p(',')],
    [k('  core'), p(':  '), v(`"${f.core}"`), p(',')],
    [k('  stack'), p(': ['), ...f.stack.flatMap((s, i) => [v(`"${s}"`), p(i < f.stack.length - 1 ? ',' : '')]), p('],')],
    [k('  ships'), p(': '), v(`"${f.ships}"`), p(',')],
    [p('};')],
  ];
  const h = lines.length * lh + 30;
  let body = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="10" fill="${t.surface}" stroke="${t.line}"/>`;
  lines.forEach((segs, i) => {
    let cx = x + 20;
    const ly = y + 30 + i * lh;
    const parts = segs
      .map(({ s, c }) => {
        const el = mono(cx, ly, s, { size, fill: c });
        cx += monoWidth(s, size);
        return el;
      })
      .join('');
    body += `<g class="rise" style="animation-delay:${r(0.5 + i * 0.16)}s">${parts}</g>`;
  });
  // Resting cursor after the closing brace.
  const lastY = y + 30 + (lines.length - 1) * lh;
  body += `<rect x="${x + 20 + monoWidth('};', size) + 3}" y="${lastY - size + 2}" width="7" height="${size + 1}" fill="${t.accent}" opacity=".8" style="animation: blink 1.1s steps(1) infinite ${r(0.5 + lines.length * 0.16)}s; opacity:0"/>`;
  return body;
}

export function hero(t) {
  const name = profile.name;
  const body = `
  ${mono(0, 24, '~/saiffardin', { size: 12, fill: t.muted })}
  ${
    profile.available
      ? `<g class="fade" style="animation-delay:.2s">${pulseDot(monoWidth('~/saiffardin', 12) + 18, 20, t.accent)}${mono(monoWidth('~/saiffardin', 12) + 30, 24, 'open to opportunities', { size: 12, fill: t.accent })}</g>`
      : ''
  }
  <g class="rise" style="animation-delay:.05s">
    ${sans(-2, 98, name, { size: 50, weight: 700, fill: t.fg, spacing: -1.6 })}
  </g>
  <g class="rise" style="animation-delay:.18s">
    ${sans(0, 132, profile.role, { size: 16, fill: t.muted })}
  </g>
  <g class="fade" style="animation-delay:.35s">
    ${mono(0, 182, '❯', { size: 15, fill: t.accent })}
    ${typewriter(t, 22, 182, profile.typed, 15)}
  </g>
  <line x1="0" y1="226" x2="96" y2="226" stroke="${t.accent}" stroke-width="2" class="rule" style="animation-delay:.4s"/>
  ${codeCard(t, 492, 12, 348)}`;

  return svg({
    width: W,
    height: H,
    title: `${name}: ${profile.role}`,
    desc: `${name}. ${profile.typed.join('. ')}.`,
    body,
  });
}
