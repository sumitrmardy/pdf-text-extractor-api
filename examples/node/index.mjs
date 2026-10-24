import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const input = {
  urls: ['https://arxiv.org/pdf/1706.03762'],
  ocrMode: 'auto',
  chunkSize: 1000,
};

const run = await client.actor('sumitr_mardy/pdf-text-extractor').call(input);
const { items } = await client.dataset(run.defaultDatasetId).listItems();

for (const pdf of items) {
  console.log(`[${pdf.status}] ${pdf.fileName}: ${pdf.pageCount} pages, ${pdf.charCount} chars`);
  if (pdf.chunks?.length) {
    console.log(`  First chunk (pages ${pdf.chunks[0].pageStart}-${pdf.chunks[0].pageEnd}): ${pdf.chunks[0].text.slice(0, 120)}...`);
  }
}
