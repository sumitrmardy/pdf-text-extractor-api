import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RELEASE = process.argv.includes('--release');
const LOCALES = ['en', 'zh-CN'];

const links = JSON.parse(readFileSync(join(ROOT, 'config/links.json'), 'utf8'));

function actorLink(base) {
    const param = links.affiliateParam ?? '';
    if (!param) return base;
    return base.includes('?') ? `${base}&${param.replace(/^[?&]/, '')}` : `${base}${param.startsWith('?') ? param : `?${param}`}`;
}

const linkValues = {
    actorUrl: actorLink(links.actorUrl),
    actorPricingUrl: actorLink(links.actorPricingUrl),
    actorApiUrl: actorLink(links.actorApiUrl),
    actorId: links.actorId,
    repoUrl: links.repoUrl,
    apifyConsoleUrl: links.apifyConsoleUrl,
    apifyTokenUrl: links.apifyTokenUrl,
    priceFromPer1k: links.priceFromPer1k,
};

function jsonEscape(value) {
    return JSON.stringify(value).slice(1, -1);
}

function resolve(text, strings, missing, unresolved) {
    const MAX_PASSES = 6;
    let current = text;

    for (let pass = 0; pass < MAX_PASSES; pass++) {
        const next = current
            .replace(/__i18n\.([a-zA-Z0-9_.]+)__/g, (whole, key) => {
                const value = key.split('.').reduce((acc, part) => acc?.[part], strings);
                if (typeof value !== 'string') {
                    missing.add(key);
                    return whole;
                }
                return jsonEscape(value);
            })
            .replace(/__link\.([a-zA-Z0-9_]+)__/g, (whole, key) => {
                if (!(key in linkValues)) {
                    unresolved.add(`link.${key}`);
                    return whole;
                }
                return jsonEscape(String(linkValues[key]));
            });

        if (next === current) return current;
        current = next;
    }

    unresolved.add('substitution did not settle — check for a string that references itself');
    return current;
}

const srcDir = join(ROOT, 'workflows/src');
const sources = readdirSync(srcDir).filter((f) => f.endsWith('.json')).sort();
if (sources.length === 0) {
    console.error('no workflow sources in workflows/src');
    process.exit(1);
}

let problems = 0;

for (const locale of LOCALES) {
    const strings = JSON.parse(readFileSync(join(ROOT, `config/i18n/${locale}.json`), 'utf8'));
    const outDir = join(ROOT, 'workflows', locale);
    mkdirSync(outDir, { recursive: true });

    for (const file of sources) {
        const missing = new Set();
        const unresolved = new Set();
        const raw = readFileSync(join(srcDir, file), 'utf8');
        const built = resolve(raw, strings, missing, unresolved);

        let parsed;
        try {
            parsed = JSON.parse(built);
        } catch (err) {
            console.error(`  FAIL  ${locale}/${file}: not valid JSON after substitution — ${err.message}`);
            problems++;
            continue;
        }

        writeFileSync(join(outDir, file), `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');

        for (const key of missing) {
            console.error(`  ${RELEASE ? 'FAIL' : 'warn'}  ${locale}/${file}: no string for i18n key "${key}"`);
            if (RELEASE) problems++;
        }
        for (const key of unresolved) {
            console.error(`  FAIL  ${locale}/${file}: unknown placeholder "${key}"`);
            problems++;
        }
        if (RELEASE && /REPLACE_ME/.test(built)) {
            console.error(`  FAIL  ${locale}/${file}: still contains REPLACE_ME`);
            problems++;
        }

        console.log(`  built workflows/${locale}/${file}  (${parsed.nodes.length} nodes)`);
    }
}

const PROSE = [
    'README.md',
    'README.zh-CN.md',
    'llms.txt',
    'LAUNCH.md',
    'docs/statuses.md',
    'docs/pricing.md',
    'agents/mcp/README.md',
    'agents/mcp/README.zh-CN.md',
    'agents/dify/README.zh-CN.md',
    'agents/coze/README.zh-CN.md',
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const actorLinkPattern = new RegExp(`${escapeRe(links.actorUrl)}(/[a-z-]+)?(\\?[^\\s)"'\\\\]*)?`, 'g');

let rewritten = 0;
for (const file of PROSE) {
    const path = join(ROOT, file);
    let text;
    try {
        text = readFileSync(path, 'utf8');
    } catch {
        continue;
    }
    const next = text.replace(actorLinkPattern, (_, suffix = '') => actorLink(`${links.actorUrl}${suffix ?? ''}`));
    if (next !== text) {
        writeFileSync(path, next, 'utf8');
        rewritten++;
    }
}
if (rewritten > 0) console.log(`  rewrote Actor links in ${rewritten} document(s)`);

if (problems > 0) {
    console.error(`\nbuild: ${problems} problem(s)`);
    process.exit(1);
}
console.log('\nbuild: OK');
