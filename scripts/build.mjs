// Builds every SVG in /assets (light + dark).
//   node scripts/build.mjs           -> everything
//   node scripts/build.mjs --static  -> only the hand-designed visuals
//   node scripts/build.mjs --live    -> only the GitHub-data visual (run daily by CI)

import { profile } from '../data/profile.mjs';
import { emit } from './lib.mjs';
import { hero } from './visuals/hero.mjs';
import { impact } from './visuals/impact.mjs';
import { stack } from './visuals/stack.mjs';
import { projectCard } from './visuals/projects.mjs';
import { header, path, toolbox, linkButton, footer } from './visuals/misc.mjs';
import { fetchPulse, pulse } from './visuals/pulse.mjs';
import { writeReadme } from './readme.mjs';

const args = new Set(process.argv.slice(2));
const all = !args.has('--static') && !args.has('--live');
const done = [];
const out = async (name, render) => done.push(...(await emit(name, render)));

if (all || args.has('--static')) {
  await out('hero', hero);
  await out('impact', impact);
  await out('stack', stack);
  await out('header-work', header('03', 'work', 'click a card to open it'));
  for (const p of profile.projects) await out(`project-${p.slug}`, projectCard(p));
  await out('header-lab', header('04', 'lab', 'personal full-stack builds'));
  await out('path', path);
  await out('toolbox', toolbox);
  for (const l of profile.links) await out(`link-${l.slug}`, linkButton(l.label));
  await out('footer', footer);
  done.push(await writeReadme());
}

if (all || args.has('--live')) {
  const data = await fetchPulse();
  await out('pulse', pulse(data));
  console.log(`pulse: ${data.total} contributions, ${data.active} active days, best streak ${data.longest}`);
}

console.log(`wrote ${done.length} files`);
