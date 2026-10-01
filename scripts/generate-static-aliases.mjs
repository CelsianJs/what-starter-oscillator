import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const aliases = ['/studio', '/build', '/404'];

async function copyIndex(route) {
  const target = join('dist', route.replace(/^\//, ''), 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await copyFile('dist/index.html', target);
}

for (const route of aliases) {
  await copyIndex(route);
}

await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\n', 'utf8');
