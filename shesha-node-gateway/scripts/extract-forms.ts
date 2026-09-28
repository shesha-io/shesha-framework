/* eslint-disable no-console */
/**
 * Mirrors shesha-core's `EmbeddedPackageSeeder`: the .NET backend seeds its built-in
 * configuration (login/header forms, reference lists, ...) by importing embedded
 * `package{yyyyMMddHHmm}.shaconfig` ZIP packages in date order at module startup
 * (see shesha-core/src/Shesha.Framework/ConfigurationItems/Distribution/EmbeddedPackageSeeder.cs
 * and Shesha.Application/ConfigMigrations/*.shaconfig).
 *
 * This script pulls form definitions out of those same packages and writes them to
 * `config/forms/` in the shape the gateway serves, so our seed data comes from the
 * canonical framework source instead of being hand-authored.
 *
 * Usage:
 *   npx tsx scripts/extract-forms.ts --all
 *   npx tsx scripts/extract-forms.ts --forms login,header
 *   npx tsx scripts/extract-forms.ts --forms login --dry-run
 *   npx tsx scripts/extract-forms.ts --all --packages /path/to/ConfigMigrations --out config/forms
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const hasFlag = (name: string): boolean => process.argv.includes(`--${name}`);

const packagesDir = path.resolve(process.cwd(), arg('packages', path.join(projectRoot, '..', 'shesha-core', 'src', 'Shesha.Application', 'ConfigMigrations')));
const outDir = path.resolve(process.cwd(), arg('out', path.join(projectRoot, 'config', 'forms')));
const formNames = arg('forms', '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const dryRun = hasFlag('dry-run');
const allFlag = hasFlag('all');

interface PackageFormDto {
  Id?: string;
  OriginId?: string;
  Name?: string;
  ModuleName?: string;
  Label?: string | null;
  Description?: string | null;
  Markup?: string | unknown;
  ModelType?: string | null;
  Access?: number | null;
  Permissions?: string[];
}

const listEntries = (pkg: string): string[] =>
  execFileSync('unzip', ['-Z1', pkg], { encoding: 'utf-8' })
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const isFormEntry = (entry: string, name: string): boolean => {
  const normalized = entry.replace(/\\/g, '/');
  const base = normalized.split('/').pop() ?? '';
  return normalized.includes('/form/') && base === `${name}.json`;
};

const readEntry = (pkg: string, entry: string): string =>
  // Some packages store entry names with literal backslashes (`Shesha\form\login.json`);
  // unzip treats `\` as an escape character in patterns, so double them to match literally.
  execFileSync('unzip', ['-p', pkg, entry.replace(/\\/g, '\\\\')], { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });

if (!allFlag && formNames.length === 0) {
  console.error('No forms requested. Example: npx tsx scripts/extract-forms.ts --all   (or --forms login,header)');
  process.exit(1);
}
if (!fs.existsSync(packagesDir)) {
  console.error(`Packages dir not found: ${packagesDir}`);
  process.exit(1);
}

// Date-ordered, exactly like the seeder: later packages override earlier ones.
const packages = fs
  .readdirSync(packagesDir)
  .filter((f) => /^package\d{8}_\d{4}\.shaconfig$/.test(f))
  .sort();

// --all expands to every form present in any package; each still resolves to its latest revision.
let names = formNames;
if (allFlag) {
  const discovered = new Set<string>();
  for (const pkgFile of packages) {
    for (const entry of listEntries(path.join(packagesDir, pkgFile))) {
      const normalized = entry.replace(/\\/g, '/');
      if (normalized.includes('/form/') && normalized.toLowerCase().endsWith('.json')) {
        discovered.add((normalized.split('/').pop() ?? '').replace(/\.json$/i, ''));
      }
    }
  }
  names = [...discovered].sort();
  console.error(`--all: ${names.length} form(s) discovered across ${packages.length} package(s)`);
}

for (const name of names) {
  let found: { pkg: string; dto: PackageFormDto } | undefined;
  for (const pkgFile of packages) {
    const pkg = path.join(packagesDir, pkgFile);
    const entry = listEntries(pkg).find((e) => isFormEntry(e, name));
    if (!entry) continue;
    try {
      found = { pkg: pkgFile, dto: JSON.parse(readEntry(pkg, entry)) as PackageFormDto };
    } catch (e) {
      console.warn(`  ! ${pkgFile}/${entry} failed to parse: ${(e as Error).message}`);
    }
  }

  if (!found) {
    console.log(`- ${name}: NOT FOUND in any package`);
    continue;
  }

  const { dto, pkg } = found;
  const configuration = {
    id: dto.Id ?? dto.OriginId ?? '',
    module: dto.ModuleName ?? 'Shesha',
    name: dto.Name ?? name,
    label: dto.Label ?? dto.Name ?? name,
    description: dto.Description ?? null,
    markup: typeof dto.Markup === 'string' ? dto.Markup : JSON.stringify(dto.Markup ?? null),
    modelType: dto.ModelType ?? null,
    access: dto.Access ?? null,
    permissions: dto.Permissions ?? [],
  };

  const target = path.join(outDir, `${name}.json`);
  if (dryRun) {
    console.log(`- ${name}: would write ${target} (from ${pkg}, markup ${configuration.markup.length} bytes)`);
  } else {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(target, JSON.stringify(configuration, null, 2));
    console.log(`- ${name}: wrote ${target} (from ${pkg}, markup ${configuration.markup.length} bytes)`);
  }
}
