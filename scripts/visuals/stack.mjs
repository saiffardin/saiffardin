import { profile } from '../../data/profile.mjs';
import { svg, mono, sans, sectionHeader, monoWidth, r } from '../lib.mjs';

const W = 840;
const H = 280;

// A request relays left → right through the five layers, then the response
// travels back along the lower wire. One shared cycle keeps everything in sync.
export function stack(t) {
  const nodes = profile.stack;
  const n = nodes.length;
  const gap = 34;
  const bw = (W - gap * (n - 1)) / n;
  const top = 46;
  const bh = 150;
  const wireUp = top + 62;
  const wireDown = top + 88;
  const CYCLE = 6; // seconds
  const hops = n - 1;
  // Timeline (fractions of the cycle): request hops 0..hops-1, then response hops back.
  const hopLen = 0.075;
  const reqStart = (i) => 0.04 + i * hopLen;
  const resStart = (i) => 0.04 + hops * hopLen + 0.06 + (hops - 1 - i) * hopLen;

  let css = '';
  let body = sectionHeader(t, '02', 'full-stack', W, 'request lifecycle');

  nodes.forEach((node, i) => {
    const x = i * (bw + gap);
    // Node lights up when the request arrives (or, for the first node, when it leaves).
    const hit = i === 0 ? reqStart(0) : reqStart(i - 1) + hopLen;
    const p = (v) => `${r(v * 100)}%`;
    css += `@keyframes hit${i} { 0%, ${p(hit)} { stroke: ${t.line}; } ${p(hit + 0.01)} { stroke: ${t.accent}; } ${p(hit + 0.12)}, 100% { stroke: ${t.line}; } }\n`;
    body += `<g class="rise" style="animation-delay:${r(0.1 + i * 0.1)}s">
      <rect x="${r(x + 0.5)}" y="${top + 0.5}" width="${r(bw - 1)}" height="${bh}" rx="10" fill="none" stroke="${t.line}" style="animation: hit${i} ${CYCLE}s linear infinite"/>
      ${mono(x + 16, top + 26, `0${i + 1}`, { size: 10.5, fill: t.accent })}
      ${mono(x + 16 + monoWidth('01 ', 10.5), top + 26, node.id, { size: 10.5, fill: t.muted })}
      ${sans(x + 16, top + 50, node.title, { size: 15, weight: 600, fill: t.fg })}
      ${node.items.map((it, j) => mono(x + 16, top + 78 + j * 18, it, { size: 11, fill: t.muted })).join('')}
    </g>`;
  });

  // Wires and packets in each gap.
  for (let i = 0; i < hops; i++) {
    const x1 = (i + 1) * bw + i * gap;
    const x2 = x1 + gap;
    const p = (v) => `${r(v * 100)}%`;
    const a = reqStart(i), b = resStart(i);
    css += `@keyframes req${i} { 0%, ${p(a)} { transform: translateX(0); opacity: 0; } ${p(a + 0.005)} { opacity: 1; } ${p(a + hopLen)} { transform: translateX(${gap - 4}px); opacity: 1; } ${p(a + hopLen + 0.005)}, 100% { transform: translateX(${gap - 4}px); opacity: 0; } }\n`;
    css += `@keyframes res${i} { 0%, ${p(b)} { transform: translateX(0); opacity: 0; } ${p(b + 0.005)} { opacity: 1; } ${p(b + hopLen)} { transform: translateX(${-(gap - 4)}px); opacity: 1; } ${p(b + hopLen + 0.005)}, 100% { transform: translateX(${-(gap - 4)}px); opacity: 0; } }\n`;
    body += `
      <line x1="${r(x1)}" y1="${wireUp}" x2="${r(x2)}" y2="${wireUp}" stroke="${t.faint}" stroke-dasharray="2 3"/>
      <path d="M${r(x2 - 5)} ${wireUp - 3} L${r(x2)} ${wireUp} L${r(x2 - 5)} ${wireUp + 3}" fill="none" stroke="${t.faint}"/>
      <line x1="${r(x1)}" y1="${wireDown}" x2="${r(x2)}" y2="${wireDown}" stroke="${t.line}" stroke-dasharray="2 3"/>
      <circle cx="${r(x1 + 2)}" cy="${wireUp}" r="3" fill="${t.accent}" style="opacity:0; animation: req${i} ${CYCLE}s linear infinite"/>
      <circle cx="${r(x2 - 2)}" cy="${wireDown}" r="2.5" fill="${t.muted}" style="opacity:0; animation: res${i} ${CYCLE}s linear infinite"/>`;
  }

  // The "ship" rail underneath: everything above ends up in a container.
  const railY = top + bh + 40;
  const label = 'ship';
  body += `
    <g class="fade" style="animation-delay:.7s">
      ${mono(0, railY + 4, '06', { size: 10.5, fill: t.accent })}
      ${mono(monoWidth('06 ', 10.5), railY + 4, label, { size: 10.5, fill: t.muted })}
      <line x1="${r(monoWidth('06 ship ', 10.5) + 6)}" y1="${railY}" x2="${W}" y2="${railY}" stroke="${t.line}"/>
      <line x1="${r(monoWidth('06 ship ', 10.5) + 6)}" y1="${railY}" x2="${W}" y2="${railY}" stroke="${t.accent}" stroke-width="1.5" stroke-dasharray="40 900" style="animation: rail ${CYCLE}s linear infinite"/>
      ${(() => {
        let cx = monoWidth('06 ship ', 10.5) + 22;
        return profile.ship
          .map((s) => {
            const w = monoWidth(s, 11) + 16;
            const el = `<rect x="${r(cx)}" y="${railY - 11}" width="${r(w)}" height="22" rx="11" fill="${t.surface}" stroke="${t.line}"/>${mono(cx + 8, railY + 4, s, { size: 11, fill: t.fg })}`;
            cx += w + 10;
            return el;
          })
          .join('');
      })()}
    </g>`;
  css += `@keyframes rail { from { stroke-dashoffset: 40; } to { stroke-dashoffset: -900; } }`;

  return svg({
    width: W,
    height: H,
    title: 'Full-stack: how a request travels through my work',
    desc: nodes.map((nd) => `${nd.title}: ${nd.items.join(', ')}`).join('. ') + `. Ship: ${profile.ship.join(', ')}.`,
    css,
    body,
  });
}
