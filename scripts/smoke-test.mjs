import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = process.argv.includes('--record');
const TOKEN = process.env.APIFY_TOKEN;

const links = JSON.parse(readFileSync(join(ROOT, 'config/links.json'), 'utf8'));
const ENDPOINT = `https://api.apify.com/v2/acts/${links.actorId}/run-sync-get-dataset-items`;

if (!TOKEN) {
    console.error('Set APIFY_TOKEN. Get one at https://console.apify.com/settings/integrations');
    process.exit(1);
}

const testUrls = [
    'https://arxiv.org/pdf/1706.03762',
    'https://raw.githubusercontent.com/ocrmypdf/OCRmyPDF/main/tests/resources/skew.pdf'
];

console.log(`extracting ${testUrls.length} PDF(s) against the live Actor…`);

const startedAt = Date.now();
const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ urls: testUrls }),
});

if (!res.ok) {
    console.error(`HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
}

const items = await res.json();
console.log(`Actor finished in ${((Date.now() - startedAt) / 1000).toFixed(1)}s, returned ${items.length} item(s)`);

const outputSchema = JSON.parse(readFileSync(join(ROOT, 'schema/output.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(outputSchema);

let valid = 0;
for (const item of items) {
    if (validate(item)) {
        valid++;
        if (RECORD) {
            const safe = item.fileName ? item.fileName.replace(/[^a-zA-Z0-9_-]/g, '_') : `item_${item.inputIndex}`;
            const target = join(ROOT, 'test/fixtures/expected', `${safe}.json`);
            writeFileSync(target, `${JSON.stringify(item, null, 2)}\n`, 'utf8');
            console.log(`  recorded ${target}`);
        }
    } else {
        console.error(`  FAIL item ${item.url}: ${ajv.errorsText(validate.errors)}`);
    }
}

if (valid === items.length) {
    console.log(`\nsmoke: PASS (${valid}/${items.length} records matched output.schema.json)`);
} else {
    console.error(`\nsmoke: FAIL (${valid}/${items.length} matched)`);
    process.exit(1);
}
