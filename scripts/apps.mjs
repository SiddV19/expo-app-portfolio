import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projects = JSON.parse(readFileSync(path.join(root, 'projects.json')));
const [command, id, ...flags] = process.argv.slice(2);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const selected = id === '--all' ? projects : projects.filter(p => p.id === id);
if (!selected.length || !['setup', 'start', 'verify'].includes(command)) {
  console.log('Choose an app ID:\n');
  for (const p of projects) console.log('  ' + p.id.padEnd(25) + p.name);
  console.log('\nExamples:\n  npm run setup -- calculator\n  npm start -- calculator\n  npm start -- calculator --web\n  npm run verify:exports -- --all');
  process.exit(id ? 1 : 0);
}
if (command === 'start' && selected.length !== 1) {
  throw new Error('Start one app at a time.');
}
if (command === 'start' && selected[0].nativeOnly && flags.includes('--web')) {
  throw new Error(selected[0].name + ' needs native device features. Start it without --web and use a matching iOS/Android runtime.');
}
const reportPath = path.join(root, 'verification', 'results.json');
const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath)) : {};
let failed = false;
for (const p of selected) {
  const cwd = path.join(root, p.directory);
  if (command === 'setup') {
    const verb = existsSync(path.join(cwd, 'package-lock.json')) ? 'ci' : 'install';
    console.log('\nInstalling ' + p.name);
    const result = spawnSync(npm, [verb, '--no-audit', '--no-fund'], { cwd, stdio: 'inherit', shell: false });
    if (result.status !== 0) { failed = true; break; }
  } else if (command === 'start') {
    if (!existsSync(path.join(cwd, 'node_modules', 'expo'))) {
      throw new Error('Run npm run setup -- ' + p.id + ' first.');
    }
    const result = spawnSync(npm, ['run', 'start', '--', ...flags], { cwd, stdio: 'inherit', shell: false });
    process.exit(result.status ?? 1);
  } else {
    const platforms = flags.length ? flags : ['ios', 'android'];
    report[p.id] ??= {};
    for (const platform of platforms) {
      if (!['ios', 'android', 'web'].includes(platform)) throw new Error('Unknown platform: ' + platform);
      if (platform === 'web' && p.nativeOnly) continue;
      console.log('Exporting ' + p.id + ' for ' + platform);
      const result = spawnSync(process.execPath, [
        path.join(cwd, 'node_modules', 'expo', 'bin', 'cli'),
        'export', '--platform', platform, '--max-workers', '2',
        '--output-dir', path.join(root, 'verification', 'bundles', p.id, platform)
      ], {
        cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1', EXPO_NO_DOTENV: '1' },
      });
      const logDir = path.join(root, 'verification', 'logs');
      mkdirSync(logDir, { recursive: true });
      writeFileSync(path.join(logDir, p.id + '-' + platform + '.log'), (result.stdout || '') + (result.stderr || ''));
      const ok = result.status === 0;
      report[p.id][platform] = { passed: ok, checkedAt: new Date().toISOString(), kind: 'JavaScript and asset export' };
      mkdirSync(path.dirname(reportPath), { recursive: true });
      writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
      console.log((ok ? 'PASS ' : 'FAIL ') + p.id + ' / ' + platform);
      if (!ok) {
        failed = true;
        console.error(((result.stdout || '') + (result.stderr || '')).split('\n').slice(-24).join('\n'));
      }
    }
  }
}
process.exit(failed ? 1 : 0);
