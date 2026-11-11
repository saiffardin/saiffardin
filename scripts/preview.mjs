// Local preview: wraps README.md in a page that mimics GitHub's profile column,
// once per theme. Open .preview/dark.html or .preview/light.html in a browser.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const md = await readFile(join(ROOT, 'README.md'), 'utf8');

// Just enough markdown for this README: lists, bold, links, comments.
const html = md
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\.\/assets\//g, '../assets/')
  .replace(/((?:^- .*\n?)+)/gm, (block) =>
    `<ul>${block.trim().split('\n').map((l) => `<li>${l.slice(2)}</li>`).join('')}</ul>\n`,
  )
  .replace(/\[\*\*(.+?)\*\*\]\((.+?)\)/g, '<a href="$2"><strong>$1</strong></a>');

const page = (theme) => `<!doctype html><html><head><meta charset="utf-8"><title>profile preview · ${theme}</title>
<meta name="color-scheme" content="${theme}">
<style>
  :root { color-scheme: ${theme}; }
  body { margin: 0; background: ${theme === 'dark' ? '#0d1117' : '#ffffff'}; color: ${theme === 'dark' ? '#e6edf3' : '#1f2328'};
         font: 16px/1.5 -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; }
  article { max-width: 830px; margin: 32px auto; padding: 24px; border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}; border-radius: 6px; }
  a { color: ${theme === 'dark' ? '#4493f8' : '#0969da'}; text-decoration: none; }
  img { max-width: 100%; vertical-align: middle; }
  p { margin: 0 0 16px; }
</style></head><body><article>${html}</article></body></html>`;

const dir = join(ROOT, '.preview');
await mkdir(dir, { recursive: true });
for (const theme of ['dark', 'light']) {
  // GitHub picks the <source> by its own theme; force it here by rewriting the media query.
  const forced = page(theme).replace(/media="\(prefers-color-scheme: dark\)"/g, theme === 'dark' ? 'media="all"' : 'media="not all"');
  await writeFile(join(dir, `${theme}.html`), forced);
}
console.log(`open ${join(dir, 'dark.html')} or ${join(dir, 'light.html')}`);
