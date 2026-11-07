import { writeFile } from 'node:fs/promises';

const input = process.argv[2];
let api;
try {
  api = new URL(input);
} catch {
  throw new Error('Informe a URL pública HTTPS da API Railway.');
}

if (api.protocol !== 'https:' || api.username || api.password || api.search || api.hash || api.pathname !== '/') {
  throw new Error('Informe somente a origem HTTPS da API, sem caminho, parâmetros ou credenciais.');
}

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'angular',
  installCommand: 'npm ci',
  buildCommand: 'npm run build',
  outputDirectory: 'dist/portal-patrocinador/browser',
  routes: [
    { src: '^/api(?:/(.*))?$', dest: api.origin + '/api/$1' },
    { handle: 'filesystem' },
    { src: '^/.*$', dest: '/index.html' },
  ],
};

await writeFile(new URL('../vercel.json', import.meta.url), JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('frontend/vercel.json criado. Revise a origem e inclua o arquivo no commit da demo.');
