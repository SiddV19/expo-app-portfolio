import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projects = JSON.parse(readFileSync(path.join(root, 'projects.json')));
const errors = [];
const ids = new Set();
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['node_modules', 'dist', '.expo', '.git', 'bundles', 'logs'].includes(e.name)) return [];
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}
for (const p of projects) {
  if (ids.has(p.id)) errors.push('Duplicate ID: ' + p.id);
  ids.add(p.id);
  const dir = path.join(root, p.directory);
  for (const f of ['App.js', 'index.js', 'app.json', 'package.json', 'package-lock.json', 'README.md', 'SOURCE.md']) {
    if (!existsSync(path.join(dir, f))) errors.push(p.id + ': missing ' + f);
  }
  const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json')));
  if (!pkg.private) errors.push(p.id + ': package must remain private');
  for (const [name, value] of Object.entries(pkg.dependencies)) {
    if (value === '*') errors.push(p.id + ': unpinned dependency ' + name);
  }
  const config = JSON.parse(readFileSync(path.join(dir, 'app.json'))).expo;
  const icons = [config.icon, config.splash?.image, config.web?.favicon, ...Object.values(config.android?.adaptiveIcon || {}).filter(v => typeof v === 'string' && v.startsWith('./'))].filter(Boolean);
  for (const icon of icons) if (!existsSync(path.resolve(dir, icon))) errors.push(p.id + ': missing configured asset ' + icon);
  for (const file of walk(dir).filter(f => /\.(js|jsx|ts|tsx)$/.test(f))) {
    const text = readFileSync(file, 'utf8');
    const refs = [...text.matchAll(/(?:\bfrom\s*|\brequire\(\s*|\bimport\s*)["'](\.[^"']+)["']/g)].map(m => m[1]);
    for (const ref of refs) {
      const target = path.resolve(path.dirname(file), ref);
      if (![target, ...['.js', '.jsx', '.ts', '.tsx', '.json'].map(e => target + e), path.join(target, 'index.js')].some(existsSync)) {
        errors.push(p.id + ': unresolved file ' + ref);
      }
    }
    if (/\b(?:API_KEY|FINNHUB_KEY)\s*=\s*["'][a-z0-9_-]{20,}["']/i.test(text)) errors.push(p.id + ': embedded API key');
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const variants = projects.filter(p => !p.primary).length;
console.log('Validated ' + projects.filter(p => p.primary && p.status !== 'prototype').length + ' apps and ' + variants + (variants === 1 ? ' variant' : ' variants') + ', plus ' + projects.filter(p => p.status === 'prototype').length + ' prototype.');
