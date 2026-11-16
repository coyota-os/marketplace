#!/usr/bin/env node
// Adds an app to the Marketplace, or a newer version of it: copies its .app into
// apps/<id>/<id>-<version>.app (a new name per version, so a cached catalog never
// points at a package that changed), takes its icon out of the package, writes its
// entry in catalog.json from the package's own manifest (so the catalog never disagrees
// with what installs) with the package's SHA-256, and lists the apps in README.md.
// Cassiel builds every link from the id and version on the main branch: what is merged
// there is what is approved, and it installs nothing else.
//   node scripts/publish.mjs path/to/app.app [more.app ...]
//   node scripts/publish.mjs --remove <id> [...]       takes apps out of the Marketplace
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, HOMEPAGE, ID, SCREENSHOTS_MAX, SCREENSHOT_FILE, SDK, SUPPORT, VERSION, isNewer, screenshotProblem, unzip } from './common.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG = join(ROOT, 'catalog.json');

const args = process.argv.slice(2);
const removing = args.includes('--remove');
const names = args.filter((a) => a !== '--remove');
if (!names.length) {
  console.error('usage: node scripts/publish.mjs <app.app> [...] | --remove <id> [...]');
  process.exit(1);
}
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));

if (removing) {
  for (const id of names) {
    if (!ID.test(id)) fail(`not an app id: ${id}`);
    catalog.apps = catalog.apps.filter((a) => a.id !== id);
    rmSync(join(ROOT, 'apps', id), { recursive: true, force: true });
    console.log(`removed ${id}`);
  }
} else {
  for (const pkg of names) {
    const manifest = JSON.parse(unzip(pkg, 'manifest.json'));
    const { id, name, version, description, author, category, icon, sdk, disc, homepage, support, screenshots } = manifest;
    if (!ID.test(id ?? '')) fail(`${pkg}: the manifest needs an id (lowercase letters, digits, dashes)`);
    if (!name) fail(`${pkg}: the manifest needs a name`);
    if (!VERSION.test(version ?? '')) fail(`${pkg}: the manifest needs a version like 1.0.0`);
    if (sdk !== undefined && !SDK.test(sdk)) fail(`${pkg}: "sdk" must be like "1.0"`);
    if (disc !== undefined && !(disc && typeof disc.label === 'string' && disc.label)) fail(`${pkg}: "disc" needs a label`);
    if (category !== undefined && !CATEGORIES.includes(category)) fail(`${pkg}: unknown category ${category}`);
    if (homepage !== undefined && !HOMEPAGE.test(homepage)) fail(`${pkg}: "homepage" must be an https:// address`);
    if (support !== undefined && !SUPPORT.test(support)) fail(`${pkg}: "support" must be an https:// or mailto: address`);
    if (screenshots !== undefined && (!Array.isArray(screenshots) || screenshots.length > SCREENSHOTS_MAX)) fail(`${pkg}: "screenshots" is a list of at most ${SCREENSHOTS_MAX}`);
    for (const shot of screenshots ?? []) {
      if (!SCREENSHOT_FILE.test(shot?.file ?? '')) fail(`${pkg}: screenshot ${shot?.file} must be screenshots/<name>.png|webp|jpg`);
      if (shot.caption !== undefined && typeof shot.caption !== 'string') fail(`${pkg}: screenshot ${shot.file}: "caption" must be text`);
    }
    const previous = catalog.apps.find((a) => a.id === id);
    if (previous && !isNewer(version, previous.version)) fail(`${pkg}: version ${version} is not newer than the published ${previous.version}`);

    const dir = join(ROOT, 'apps', id);
    mkdirSync(dir, { recursive: true });
    // Earlier versions stay: a catalog still cached somewhere may point at them.
    copyFileSync(pkg, join(dir, `${id}-${version}.app`));
    // Its screenshots, out of the package beside its icon, so the App Catalog shows them
    // before anything is downloaded (only the latest version's are kept).
    rmSync(join(dir, 'screenshots'), { recursive: true, force: true });
    const shots = [];
    for (const shot of screenshots ?? []) {
      const bytes = unzip(pkg, shot.file, 'buffer');
      const problem = screenshotProblem(bytes);
      if (problem) fail(`${pkg}: ${shot.file} ${problem}`);
      mkdirSync(join(dir, 'screenshots'), { recursive: true });
      writeFileSync(join(dir, shot.file), bytes);
      shots.push({ file: `apps/${id}/${shot.file}`, caption: shot.caption });
    }
    let iconUrl;
    if (icon && /\.(svg|png)$/i.test(icon)) {
      const file = `icon${extname(icon).toLowerCase()}`;
      writeFileSync(join(dir, file), unzip(pkg, icon, 'buffer'));
      iconUrl = `apps/${id}/${file}`;
    }

    const entry = {
      id,
      name,
      version,
      description,
      author,
      category,
      sdk,
      // The publisher's website and how to reach them (the App Catalog's App Tasks).
      homepage,
      support,
      screenshots: shots.length ? shots : undefined,
      // The original disc it plays from (the person brings an .iso of it): its label.
      disc: disc?.label,
      icon: iconUrl,
      // Relative to the catalog, so the repository's address is never written in it.
      package: `apps/${id}/${id}-${version}.app`,
      bytes: statSync(pkg).size,
      sha256: createHash('sha256').update(readFileSync(pkg)).digest('hex'),
    };
    if (previous) catalog.apps[catalog.apps.indexOf(previous)] = entry;
    else catalog.apps.push(entry);
    console.log(`${previous ? 'updated' : 'added'} ${id} ${version} (${basename(pkg)})`);
  }
}
catalog.apps.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`);

// The README's list of apps, between its markers.
const README = join(ROOT, 'README.md');
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|');
const rows = catalog.apps.map((a) => {
  const icon = a.icon ? `<img src="apps/${a.id}/${basename(a.icon)}" width="24" alt="">` : '';
  return `| ${icon} | **${cell(a.name)}** | ${cell(a.version)} | ${cell(a.author)} | ${cell(a.description)} |`;
});
const table = ['| | App | Version | By | |', '|---|---|---|---|---|', ...rows].join('\n');
const readme = readFileSync(README, 'utf8');
writeFileSync(README, readme.replace(/<!-- apps -->[\s\S]*<!-- \/apps -->/, `<!-- apps -->\n${table}\n<!-- /apps -->`));
