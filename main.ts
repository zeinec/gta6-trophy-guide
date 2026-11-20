// Leonida Trophy Guide — the entrypoint for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is the static site in app/: index.html, style.css, the three
// scripts, the trophy and roadmap data, the Leonida map and four hand-drawn
// cartoon character images. It fetches nothing from the network, so it runs
// offline from any plain file server. This file hands it in: it copies app/
// and screenshots/ next to this file into /output and writes /output/dossier.json,
// the summary the judge reads (screenshots, first-load files and bytes, source
// outline), using the vendored make.fun library. Leave vendor/makefun-frontend.ts
// alone: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the other limits refuse an entry the scorer would refuse (more than 4 screenshots
// or one over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app
// files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
