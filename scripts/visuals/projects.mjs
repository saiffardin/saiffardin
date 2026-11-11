import { profile } from '../../data/profile.mjs';
import { svg, mono, sans, monoWidth, wrap, pulseDot, r } from '../lib.mjs';

export const CARD_W = 410;
const CARD_H = 196;

// Small looping illustrations, drawn in a ~110×40 box whose top-left is (x, y).
const MOTIFS = {
  // A multi-step form being completed.
  stepper(t, x, y) {
    const D = 4.8;
    let out = `<line x1="${x + 6}" y1="${y + 20}" x2="${x + 102}" y2="${y + 20}" stroke="${t.line}" stroke-width="2"/>`;
    out += `<line x1="${x + 6}" y1="${y + 20}" x2="${x + 102}" y2="${y + 20}" stroke="${t.accent}" stroke-width="2" stroke-dasharray="96" stroke-dashoffset="96">
      <animate attributeName="stroke-dashoffset" values="96;96;0;0;96" keyTimes="0;.1;.7;.92;1" dur="${D}s" repeatCount="indefinite"/></line>`;
    for (let i = 0; i < 4; i++) {
      const cx = x + 6 + i * 32;
      const on = r(0.1 + (i / 3) * 0.6);
      out += `<circle cx="${cx}" cy="${y + 20}" r="5" fill="${t.surface}" stroke="${t.faint}" stroke-width="1.5">
        <animate attributeName="fill" values="${t.surface};${t.surface};${t.accent};${t.accent};${t.surface}" keyTimes="0;${on};${r(on + 0.02)};.92;1" dur="${D}s" repeatCount="indefinite"/>
        <animate attributeName="stroke" values="${t.faint};${t.faint};${t.accent};${t.accent};${t.faint}" keyTimes="0;${on};${r(on + 0.02)};.92;1" dur="${D}s" repeatCount="indefinite"/></circle>`;
    }
    return out;
  },

  // A ballot sliding into a box.
  ballot(t, x, y) {
    const bx = x + 40;
    return `
      <clipPath id="ballot-clip"><rect x="${bx - 4}" y="${y - 4}" width="44" height="20"/></clipPath>
      <g clip-path="url(#ballot-clip)">
        <g><rect x="${bx + 8}" y="${y - 2}" width="20" height="16" rx="1.5" fill="${t.surface}" stroke="${t.accent}"/>
          <path d="M${bx + 12} ${y + 6} l3 3 l6 -6" fill="none" stroke="${t.accent}" stroke-width="1.5"/>
          <animateTransform attributeName="transform" type="translate" values="0 -12;0 -12;0 22;0 22" keyTimes="0;.3;.62;1" dur="3.6s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;.5 0 .7 1;0 0 1 1"/>
        </g>
      </g>
      <rect x="${bx - 4}" y="${y + 16}" width="44" height="22" rx="3" fill="${t.surface}" stroke="${t.faint}"/>
      <line x1="${bx + 6}" y1="${y + 16}" x2="${bx + 30}" y2="${y + 16}" stroke="${t.fg}" stroke-width="2"/>`;
  },

  // A dashboard bar chart growing in.
  bars(t, x, y) {
    const hs = [14, 24, 18, 32, 26, 38];
    return hs
      .map((h, i) => {
        const bx = x + 20 + i * 15;
        const base = y + 40;
        const delay = r(i * 0.12);
        return `<rect x="${bx}" y="${base - h}" width="9" height="${h}" rx="1.5" fill="${i === hs.length - 1 ? t.accent : t.faint}" style="transform-box: fill-box; transform-origin: bottom; animation: grow 3.8s ${delay}s cubic-bezier(.3,.7,.2,1) infinite"/>`;
      })
      .join('');
  },

  // An 8-stage pipeline with a candidate moving through it.
  pipeline(t, x, y) {
    let out = '';
    for (let i = 0; i < 8; i++) {
      out += `<rect x="${x + 4 + i * 13}" y="${y + 16}" width="9" height="9" rx="2" fill="none" stroke="${t.faint}"/>`;
    }
    const steps = Array.from({ length: 8 }, (_, i) => `${x + 4 + i * 13 + 4.5} ${y + 20.5}`);
    out += `<circle r="3.2" fill="${t.accent}" cx="0" cy="0">
      <animateTransform attributeName="transform" type="translate" values="${[...steps, steps[7]].join(';')}" dur="4.5s" repeatCount="indefinite" calcMode="discrete"/></circle>`;
    out += mono(x + 4, y + 40, 'stage', { size: 9.5, fill: t.muted });
    for (let i = 0; i < 8; i++) {
      const a = r(i / 9), b = r((i + 1) / 9);
      out += `<g opacity="0">${mono(x + 4 + monoWidth('stage ', 9.5), y + 40, `${i + 1}/8`, { size: 9.5, fill: t.accent })}
        <animate attributeName="opacity" values="0;1;0" keyTimes="0;${a};${b}" calcMode="discrete" dur="4.5s" repeatCount="indefinite"/></g>`;
    }
    return out;
  },

  // pages/ → app/
  migrate(t, x, y) {
    const D = 4;
    return `
      <g>${mono(x + 6, y + 25, 'pages/', { size: 12, fill: t.muted })}
        <animate attributeName="opacity" values="1;1;.25;.25;1" keyTimes="0;.3;.45;.9;1" dur="${D}s" repeatCount="indefinite"/></g>
      ${mono(x + 6 + monoWidth('pages/ ', 12), y + 25, '→', { size: 12, fill: t.faint })}
      <g opacity=".25">${mono(x + 6 + monoWidth('pages/ → ', 12), y + 25, 'app/', { size: 12, fill: t.accent, weight: 700 })}
        <animate attributeName="opacity" values=".25;.25;1;1;.25" keyTimes="0;.3;.45;.9;1" dur="${D}s" repeatCount="indefinite"/></g>`;
  },

  // Cascading filters narrowing a dataset.
  filters(t, x, y) {
    const rows = [100, 74, 46, 22];
    return rows
      .map((w, i) => {
        const delay = r(i * 0.35);
        return `<rect x="${x + 6 + (100 - w) / 2}" y="${y + 4 + i * 10}" width="${w}" height="5" rx="2.5" fill="${i === rows.length - 1 ? t.accent : t.faint}" style="transform-box: fill-box; transform-origin: center; animation: squeeze 3.6s ${delay}s cubic-bezier(.4,0,.2,1) infinite"/>`;
      })
      .join('');
  },
};

const STATUS_LABEL = { live: 'live', internal: 'internal', demo: 'live demo', shipped: 'shipped' };

export function projectCard(p) {
  return (t) => {
    const W = CARD_W, H = CARD_H, pad = 22;
    const live = p.status === 'live' || p.status === 'demo';
    const statusText = STATUS_LABEL[p.status] ?? p.status;
    const statusW = monoWidth(statusText, 10.5);
    const desc = wrap(p.desc, 56).slice(0, 3);

    let tagX = pad;
    const tags = p.tags
      .map((tag) => {
        const w = monoWidth(tag, 10.5) + 14;
        const el = `<rect x="${r(tagX)}" y="${H - 38}" width="${r(w)}" height="20" rx="10" fill="none" stroke="${t.line}"/>${mono(tagX + 7, H - 24, tag, { size: 10.5, fill: t.muted })}`;
        tagX += w + 6;
        return el;
      })
      .join('');

    const body = `
      <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${t.line}"/>
      <g class="rise">
        ${mono(pad, 34, p.kicker, { size: 10.5, fill: t.accent })}
        ${live ? pulseDot(W - pad - statusW - 10, 30.5, t.accent) : `<circle cx="${W - pad - statusW - 10}" cy="30.5" r="3.5" fill="none" stroke="${t.faint}"/>`}
        ${mono(W - pad, 34, statusText, { size: 10.5, fill: live ? t.fg : t.muted, anchor: 'end' })}
        ${sans(pad, 66, p.title, { size: 19, weight: 650, fill: t.fg, spacing: -0.3 })}
        ${desc.map((l, i) => sans(pad, 92 + i * 19, l, { size: 13, fill: t.muted })).join('')}
      </g>
      <g class="fade" style="animation-delay:.3s">${tags}</g>
      <g class="fade" style="animation-delay:.5s">${MOTIFS[p.motif]?.(t, W - pad - 108, H - 58) ?? ''}</g>`;

    return svg({
      width: W,
      height: H,
      title: p.title,
      desc: `${p.kicker}. ${p.desc} Built with ${p.tags.join(', ')}.`,
      css: `
        @keyframes grow { 0% { transform: scaleY(0); } 30%, 85% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
        @keyframes squeeze { 0% { transform: scaleX(1.25); opacity: .3; } 30%, 85% { transform: scaleX(1); opacity: 1; } 100% { transform: scaleX(1.25); opacity: .3; } }`,
      body,
    });
  };
}
