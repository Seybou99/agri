/**
 * Test local iSDAsoil (sans déployer sur Vercel).
 *
 * Prérequis dans .env ou .env.local à la racine AgriMaliApp :
 *   ISDA_USERNAME=votre_email
 *   ISDA_PASSWORD=votre_mot_de_passe
 *
 * Usage :
 *   npm run test:isda
 *   npm run test:isda -- 12.64 -8.00
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fetchSoilFromISDA } from '../functions/src/isdaSoilVercel';

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const lat = parseFloat(process.argv[2] ?? '12.6392');
const lng = parseFloat(process.argv[3] ?? '-8.0029');

async function main() {
  if (!process.env.ISDA_USERNAME || !process.env.ISDA_PASSWORD) {
    console.error(
      '❌ ISDA_USERNAME et ISDA_PASSWORD manquants.\n' +
        '   Ajoute-les dans AgriMaliApp/.env.local puis relance : npm run test:isda'
    );
    process.exit(1);
  }

  console.log(`Test iSDAsoil — lat=${lat}, lng=${lng} …\n`);
  const soil = await fetchSoilFromISDA(lat, lng);
  console.log(JSON.stringify(soil, null, 2));
  console.log('\n✅ OK — tu peux déployer sur Vercel avec les mêmes variables.');
}

main().catch((e) => {
  console.error('❌', e instanceof Error ? e.message : e);
  process.exit(1);
});
