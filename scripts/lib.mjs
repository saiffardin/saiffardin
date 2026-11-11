// Shared helpers for every visual.
// Each visual is a function (theme) => svg string, rendered once per theme.
// GitHub shows README SVGs through <img>, so: no scripts, no web fonts, no links inside.
// Animations are CSS keyframes or SMIL, both of which run inside <img>.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ASSETS = join(ROOT, 'assets');

// Palette taken from the portfolio (saiffardin.netlify.app): warm stone + amber.
// Backgrounds stay transparent so the art sits directly on GitHub's own page colour.
export const THEMES = {
  dark: {
    name: 'dark',
    fg: '#faf5ef',
    muted: '#a8a29e',
    faint: '#57534e',
    line: '#2e2a27',
    surface: '#1a1714',
    accent: '#d4a054',
    accentSoft: 'rgba(212,160,84,0.14)',
  },
  light: {
    name: 'light',
    fg: '#1c1917',
    muted: '#57534e',
    faint: '#a8a29e',
    line: '#e7e2dc',
    surface: '#faf7f2',
    accent: '#a5691a',
    accentSoft: 'rgba(165,105,26,0.10)',
  },
};

export const SANS = "'Inter','Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";
export const MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

// Monospace glyph advance as a fraction of font size. Every mono string is laid out
// on this grid with an explicit x per character, so widths are identical whichever
// monospace font the viewer's machine falls back to.
export const MONO_ADVANCE = 0.6;

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const r = (n) => Math.round(n * 100) / 100;

/** Width of a mono string at a given font size. */
export const monoWidth = (str, size) => [...str].length * size * MONO_ADVANCE;

/** Monospace text pinned to a fixed character grid. */
export function mono(x, y, str, { size = 12, fill, anchor = 'start', weight, cls, style, opacity } = {}) {
  const chars = [...str];
  const cw = size * MONO_ADVANCE;
  const w = chars.length * cw;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const xs = chars.map((_, i) => r(x0 + i * cw)).join(' ');
  const attrs = [
    `x="${xs}"`,
    `y="${r(y)}"`,
    `font-family="${MONO}"`,
    `font-size="${size}"`,
    fill && `fill="${fill}"`,
    weight && `font-weight="${weight}"`,
    cls && `class="${cls}"`,
    style && `style="${style}"`,
    opacity != null && `opacity="${opacity}"`,
  ]
    .filter(Boolean)
    .join(' ');
  return `<text ${attrs} xml:space="preserve">${esc(str)}</text>`;
}

/** Proportional text (name, titles, descriptions). */
export function sans(x, y, str, { size = 14, fill, weight = 400, anchor = 'start', cls, style, spacing } = {}) {
  const attrs = [
    `x="${r(x)}"`,
    `y="${r(y)}"`,
    `font-family="${SANS}"`,
    `font-size="${size}"`,
    `font-weight="${weight}"`,
    fill && `fill="${fill}"`,
    anchor !== 'start' && `text-anchor="${anchor}"`,
    spacing != null && `letter-spacing="${spacing}"`,
    cls && `class="${cls}"`,
    style && `style="${style}"`,
  ]
    .filter(Boolean)
    .join(' ');
  return `<text ${attrs}>${esc(str)}</text>`;
}

/** Greedy word wrap by an approximate character budget. */
export function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Section label in the portfolio's "01. about" style, with a hairline rule after it. */
export function sectionHeader(t, index, label, width, note) {
  const idx = `${index}.`;
  const size = 12;
  const labelX = monoWidth(idx + ' ', size);
  const start = labelX + monoWidth(label, size) + 14;
  // An optional note sits at the right end; the rule stops short of it.
  const end = note ? width - monoWidth(note, 10.5) - 14 : width;
  return (
    mono(0, 14, idx, { size, fill: t.accent }) +
    mono(labelX, 14, label, { size, fill: t.fg }) +
    `<line x1="${r(start)}" y1="10" x2="${r(end)}" y2="10" stroke="${t.line}" stroke-width="1" class="rule"/>` +
    (note ? mono(width, 14, note, { size: 10.5, fill: t.muted, anchor: 'end' }) : '')
  );
}

/** Wraps body markup in an <svg> root with shared base CSS. */
export function svg({ width, height, title, desc, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc ?? title)}</desc>
<style>
  text { font-kerning: normal; }
  .rise { animation: rise .7s cubic-bezier(.2,.7,.2,1) both; }
  .fade { animation: fade .8s ease both; }
  .rule { animation: draw 1.2s cubic-bezier(.6,0,.2,1) both; stroke-dasharray: 1000; }
  @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
  @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  @keyframes ping { 0% { transform: scale(1); opacity: .55; } 80%, 100% { transform: scale(2.6); opacity: 0; } }
  ${css}
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } }
</style>
${body}
</svg>
`;
}

/** A pulsing status dot (solid core + expanding ring). */
export function pulseDot(cx, cy, color, delay = 0) {
  return `<g transform="translate(${r(cx)} ${r(cy)})"><circle r="3.5" fill="${color}"/><circle r="3.5" fill="${color}" style="transform-box: fill-box; transform-origin: center; animation: ping 2.4s ${delay}s cubic-bezier(0,0,.2,1) infinite"/></g>`;
}

/** Writes `<name>-dark.svg` and `<name>-light.svg`. */
export async function emit(name, render) {
  await mkdir(ASSETS, { recursive: true });
  const files = [];
  for (const t of Object.values(THEMES)) {
    const file = join(ASSETS, `${name}-${t.name}.svg`);
    await writeFile(file, render(t));
    files.push(file);
  }
  return files;
}
