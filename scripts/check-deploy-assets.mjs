import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_STATIC_BYTES = 250 * 1024 * 1024;

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => file.startsWith('public/'));

let total = 0;
const oversized = [];
for (const file of files) {
  try {
    const size = statSync(path.resolve(file)).size;
    total += size;
    if (size > MAX_FILE_BYTES) oversized.push({ file, size });
  } catch {
    // Ignore files removed between git ls-files and stat.
  }
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
if (oversized.length || total > MAX_STATIC_BYTES) {
  console.error('Deploy asset budget exceeded. Keep large corpora in Supabase, not public/.');
  for (const item of oversized) console.error('Large file:', item.file, mb(item.size) + ' MB');
  console.error('public/ total:', mb(total) + ' MB; limit:', mb(MAX_STATIC_BYTES) + ' MB');
  process.exit(1);
}

console.log('Deploy asset budget OK:', mb(total) + ' MB in public/.');
