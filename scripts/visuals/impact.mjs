import { profile } from '../../data/profile.mjs';
import { svg, mono, sans, sectionHeader, r } from '../lib.mjs';

const W = 840;
const H = 162;

// The Docker number gets a bar that collapses from 2.88 GB to 156 MB, on a loop.
function dockerBar(t, x, y, w, { from, to, ratio }) {
  const small = r(Math.max(w * ratio, 4));
  const dur = 7;
  const spline = '.6 0 .2 1';
  return `
  <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="${t.line}"/>
  <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="${t.faint}">
    <animate attributeName="width" values="${w};${w};${small};${small};${w}" keyTimes="0;.22;.42;.9;1" calcMode="spline" keySplines="0 0 1 1;${spline};0 0 1 1;${spline}" dur="${dur}s" repeatCount="indefinite"/>
    <animate attributeName="fill" values="${t.faint};${t.faint};${t.accent};${t.accent};${t.faint}" keyTimes="0;.22;.42;.9;1" dur="${dur}s" repeatCount="indefinite"/>
  </rect>
  <g>${mono(x + w, y + 22, from, { size: 10.5, fill: t.muted, anchor: 'end' })}
    <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.24;.3;.92;1" dur="${dur}s" repeatCount="indefinite"/></g>
  <g opacity="0">${mono(x, y + 22, `${to}  ▼ ${from}`, { size: 10.5, fill: t.accent })}
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.38;.44;.9;.94" dur="${dur}s" repeatCount="indefinite"/></g>`;
}

export function impact(t) {
  const col = W / profile.impact.length;
  const cols = profile.impact
    .map((item, i) => {
      const x = i * col;
      const delay = r(0.15 + i * 0.12);
      const sep = i > 0 ? `<line x1="${x - 0.5}" y1="44" x2="${x - 0.5}" y2="138" stroke="${t.line}"/>` : '';
      const pad = i > 0 ? 22 : 0;
      const valueColor = item.docker ? t.accent : t.fg;
      let block = sans(x + pad, 84, item.value, { size: 34, weight: 700, fill: valueColor, spacing: -1 });
      if (item.docker) {
        block += sans(x + pad, 108, 'docker image size', { size: 13, fill: t.muted });
        block += dockerBar(t, x + pad, 118, col - pad - 26, item.docker);
      } else {
        block += item.lines.map((l, j) => sans(x + pad, 108 + j * 18, l, { size: 13, fill: t.muted })).join('');
      }
      return `${sep}<g class="rise" style="animation-delay:${delay}s">${block}</g>`;
    })
    .join('');

  return svg({
    width: W,
    height: H,
    title: 'Impact in numbers',
    desc: profile.impact.map((i) => `${i.value}: ${i.lines.join(' ')}`).join('. '),
    body: sectionHeader(t, '01', 'impact', W) + cols,
  });
}
