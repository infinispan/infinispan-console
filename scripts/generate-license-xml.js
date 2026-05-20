#!/usr/bin/env node

'use strict';

const { join, resolve } = require('path');
const fs = require('fs');
const js2xmlparser = require('js2xmlparser');

const args = process.argv.slice(2);
const xmlIndex = args.indexOf('--xml');
const outDirIndex = args.indexOf('--output-dir');
const xmlFile = xmlIndex !== -1 ? args[xmlIndex + 1] : null;
const outDir = outDirIndex !== -1 ? args[outDirIndex + 1] : 'licenses';

if (!xmlFile) {
  console.error('Usage: generate-license-xml.js --xml <filename> [--output-dir <dir>]');
  process.exit(1);
}

const resourcesDir = join(__dirname, 'resources');
const canonicalNames = JSON.parse(fs.readFileSync(join(resourcesDir, 'default-canonical-names.json'), 'utf8'));
const unifiedList = JSON.parse(fs.readFileSync(join(resourcesDir, 'default-unified-list.json'), 'utf8'));

const namesMap = new Map();
for (const key in canonicalNames) {
  canonicalNames[key].forEach((alias) => namesMap.set(alias, key));
}

function mapCanonicalName(name) {
  if (/(\bOR\b)|(\bor\b)|(\bAND\b)|(\band\b)/.test(name)) {
    return name;
  }
  if (name.indexOf(',') !== -1) {
    return name
      .split(',')
      .map((n) => namesMap.get(n.trim()) || 'UNKNOWN')
      .join(', ');
  }
  return namesMap.get(name) || 'UNKNOWN';
}

function urlForName(name) {
  if (name === 'UNKNOWN') return 'UNKNOWN';
  if (name.indexOf(',') !== -1) {
    return name
      .split(',')
      .map((n) => {
        const entry = unifiedList[n.trim()];
        return entry ? entry.url : 'UNKNOWN';
      })
      .join(', ');
  }
  const entry = unifiedList[name];
  return entry ? entry.url : 'UNKNOWN';
}

function buildLicenseMetadata(licenses) {
  if (/(\bOR\b)|(\bor\b)|(\bAND\b)|(\band\b)/.test(licenses)) {
    const clean = licenses.replace(/[()]/g, '');
    const first = clean.substring(0, clean.indexOf(' '));
    const last = clean.substring(clean.lastIndexOf(' ') + 1);
    const parts = [first, last];
    return {
      license: parts.map((part) => {
        const canonical = mapCanonicalName(part);
        return { name: canonical, url: urlForName(canonical) };
      })
    };
  }
  const canonical = mapCanonicalName(licenses);
  return { license: [{ name: canonical, url: urlForName(canonical) }] };
}

function extractLicense(pkg) {
  if (typeof pkg.license === 'string') return pkg.license;
  if (pkg.license && pkg.license.type) return pkg.license.type;
  if (Array.isArray(pkg.licenses)) {
    return pkg.licenses.map((l) => (typeof l === 'string' ? l : l.type || 'UNKNOWN')).join(' OR ');
  }
  return 'UNKNOWN';
}

function collectProductionDeps(projectDir) {
  const rootPkg = JSON.parse(fs.readFileSync(join(projectDir, 'package.json'), 'utf8'));
  const depNames = Object.keys(rootPkg.dependencies || {});
  const results = [];

  for (const name of depNames) {
    const pkgJsonPath = join(projectDir, 'node_modules', name, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      results.push({
        packageName: name,
        version: pkg.version || '0.0.0',
        licenses: buildLicenseMetadata(extractLicense(pkg))
      });
    } catch (_) {}
  }

  return results;
}

const projectDir = resolve('.');
const pkg = JSON.parse(fs.readFileSync(join(projectDir, 'package.json'), 'utf8'));
const dependencies = collectProductionDeps(projectDir);

const projectMetaData = {
  project: pkg.name,
  version: pkg.version,
  license: pkg.license,
  dependencies: { dependency: dependencies }
};

const xml = js2xmlparser.parse('licenseSummary', projectMetaData);
const resolvedOutDir = resolve(outDir);
fs.mkdirSync(resolvedOutDir, { recursive: true });
const outFile = join(resolvedOutDir, xmlFile.replace(/\.xml$/, '') + '.xml');
fs.writeFileSync(outFile, xml);
console.log(`License XML written to ${outFile} (${dependencies.length} dependencies)`);
