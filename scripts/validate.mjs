import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const failures = [];
const notes = [];

function fail(gate, message) {
    failures.push(`${gate}: ${message}`);
}

function walk(dir, skip = new Set(['.git', 'node_modules', 'docs/images', 'assets'])) {
    const out = [];
    const rel = relative(ROOT, dir).replace(/\\/g, '/');
    if (skip.has(rel)) return out;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...walk(full, skip));
        else out.push(full);
    }
    return out;
}

// --- 1. schemas and recorded responses -------------------------------------

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

let validateOutput;
try {
    const outputSchema = JSON.parse(readFileSync(join(ROOT, 'schema/output.schema.json'), 'utf8'));
    validateOutput = ajv.compile(outputSchema);
    ajv.compile(JSON.parse(readFileSync(join(ROOT, 'schema/input.schema.json'), 'utf8')));
} catch (err) {
    fail('schema', `could not compile: ${err.message}`);
}

const expectedDir = join(ROOT, 'test/fixtures/expected');
let recorded = 0;
const seenSubStatuses = new Set();

if (validateOutput && existsSync(expectedDir)) {
    for (const file of readdirSync(expectedDir).filter((f) => f.endsWith('.json'))) {
        const record = JSON.parse(readFileSync(join(expectedDir, file), 'utf8'));
        recorded++;
        seenSubStatuses.add(record.subStatus || record.sub_status);
        if (!validateOutput(record)) {
            fail('contract', `${file} does not match output.schema.json — ${ajv.errorsText(validateOutput.errors)}`);
        }
    }
}

if (recorded === 0) fail('contract', 'no recorded responses in test/fixtures/expected');
else notes.push(`${recorded} recorded response(s) match the schema, covering: ${[...seenSubStatuses].sort().join(', ')}`);

// --- 2. secrets -------------------------------------------------------------

const SECRET_PATTERNS = [
    [/apify_api_[A-Za-z0-9]{10,}/, 'an Apify API token'],
    [/\bBearer\s+[A-Za-z0-9_-]{24,}/, 'a bearer token'],
    [/"(token|apiKey|password|secret)"\s*:\s*"(?!REPLACE|YOUR_|<)[^"]{12,}"/i, 'a credential value'],
];

for (const file of walk(ROOT)) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    if (!['.json', '.md', '.yaml', '.yml', '.mjs', '.js', '.py', '.sh', '.txt'].includes(extname(file))) continue;
    const text = readFileSync(file, 'utf8');
    for (const [pattern, what] of SECRET_PATTERNS) {
        if (pattern.test(text)) fail('secrets', `${rel} looks like it contains ${what}`);
    }
}

// --- 3. single source for links and price -----------------------------------

const links = JSON.parse(readFileSync(join(ROOT, 'config/links.json'), 'utf8'));
const expectedParam = links.affiliateParam ?? '';
const LINK_EXEMPT = new Set(['config/links.json', 'scripts/validate.mjs', 'scripts/build-workflows.mjs', 'VERIFY.md']);

const anyActorLink = /https:\/\/apify\.com\/sumitr_mardy\/pdf-text-extractor(\/[a-z-]+)?(\?[^\s)"'`\\]*)?/g;

for (const file of walk(ROOT)) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    if (LINK_EXEMPT.has(rel)) continue;
    if (!['.md', '.yaml', '.yml', '.json', '.txt', '.mjs', '.py', '.sh'].includes(extname(file))) continue;
    if (rel.startsWith('workflows/src/') || rel.startsWith('config/i18n/')) continue;

    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(anyActorLink)) {
        const query = match[2] ?? '';
        if (query !== expectedParam) {
            fail(
                'links',
                `${rel} links to the Actor with "${query || 'no parameter'}" but config says "${expectedParam || 'no parameter'}" — run npm run build`,
            );
        }
    }
}

if (links.affiliateParam === '') {
    notes.push('affiliateParam is empty — links ship without a referral code until the owner registers');
} else if (/REPLACE_ME/.test(links.affiliateParam)) {
    fail('links', 'affiliateParam still says REPLACE_ME');
}

// --- 4. built workflows -----------------------------------------------------

for (const locale of ['en', 'zh-CN']) {
    const dir = join(ROOT, 'workflows', locale);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    if (files.length === 0) {
        fail('workflows', `workflows/${locale} is empty — run npm run build`);
        continue;
    }
    for (const file of files) {
        const wf = JSON.parse(readFileSync(join(dir, file), 'utf8'));
        const where = `workflows/${locale}/${file}`;
        if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) fail('workflows', `${where} has no nodes`);
        if (typeof wf.connections !== 'object') fail('workflows', `${where} has no connections object`);

        const names = new Set();
        for (const node of wf.nodes ?? []) {
            if (!node.name || !node.type) fail('workflows', `${where} has a node missing name or type`);
            if (names.has(node.name)) fail('workflows', `${where} has two nodes named "${node.name}"`);
            names.add(node.name);
            if (/^(HTTP Request|Code|Set|Switch|IF)\d*$/.test(node.name)) {
                notes.push(`naming: ${where} still has a default node name "${node.name}"`);
            }
        }
        for (const from of Object.keys(wf.connections ?? {})) {
            if (!names.has(from)) fail('workflows', `${where} connects from unknown node "${from}"`);
            for (const outputs of Object.values(wf.connections[from])) {
                for (const output of outputs ?? []) {
                    for (const target of output ?? []) {
                        if (!names.has(target.node)) {
                            fail('workflows', `${where} connects to unknown node "${target.node}"`);
                        }
                    }
                }
            }
        }
    }
}

// --- report -----------------------------------------------------------------

for (const note of notes) console.log(`  note  ${note}`);
if (failures.length === 0) {
    console.log(`\nvalidate: PASS`);
    process.exit(0);
}
console.error(`\n${failures.length} failure(s):`);
for (const f of failures) console.error(`  FAIL  ${f}`);
process.exit(1);
