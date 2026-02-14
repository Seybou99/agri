/**
 * Google Earth Engine – récupération des données SoilGrids (pH, clay, sand, etc.)
 * Version adaptée pour Vercel (lit la clé depuis variable d'environnement JSON string).
 *
 * Assets : projects/soilgrids-isric/phh2o_mean, clay_mean, sand_mean, etc.
 * Bande 0 = profondeur 0-5cm. Facteurs de conversion : phh2o/10 → pH, clay etc. /10 → %.
 */

import * as ee from '@google/earthengine';

const SCALE_M = 250;

export interface GEESoilResult {
  ph: number;
  clay: number;
  sand: number;
  silt: number;
  organicCarbon: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  texture: string;
}

const DEFAULT: GEESoilResult = {
  ph: 6.5,
  clay: 20,
  sand: 40,
  silt: 40,
  organicCarbon: 1.0,
  nitrogen: 0.5,
  phosphorus: 10,
  potassium: 0.2,
  texture: 'limoneux',
};

let eeInitialized = false;

/**
 * Initialise GEE en lisant la clé depuis GEE_SERVICE_ACCOUNT_JSON (variable d'env).
 * Format attendu : JSON string complet du compte de service.
 */
function ensureEEInitialized(): Promise<void> {
  if (eeInitialized) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Support des deux noms de variables (ancien et nouveau)
    const keyJson = process.env.COMPTE_DE_SERVICE_GEE_JSON || process.env.GEE_SERVICE_ACCOUNT_JSON;
    if (!keyJson) {
      reject(new Error('COMPTE_DE_SERVICE_GEE_JSON ou GEE_SERVICE_ACCOUNT_JSON non défini dans les variables d\'environnement'));
      return;
    }

    let key: object;
    try {
      key = JSON.parse(keyJson) as object;
    } catch (e) {
      reject(new Error(`GEE: impossible de parser COMPTE_DE_SERVICE_GEE_JSON: ${e}`));
      return;
    }

    // Support des deux noms de variables (ancien et nouveau)
    const projectId = process.env.ID_PROJET_GEE || process.env.GEE_PROJECT_ID;

    ee.data.authenticateViaPrivateKey(
      key,
      () => {
        ee.initialize(
          { project: projectId || undefined },
          () => {
            eeInitialized = true;
            resolve();
          },
          (err: string) => reject(new Error(`GEE initialize: ${err}`))
        );
      },
      (err: string) => reject(new Error(`GEE authenticate: ${err}`))
    );
  });
}

function textureFromTriangle(sand: number, clay: number, silt: number): string {
  if (sand > 70 && clay < 20) return 'sableux';
  if (clay > 40) return 'argileux';
  if (sand > 50 && sand < 70 && clay < 20) return 'limono-sableux';
  if (silt > 50) return 'limoneux';
  return 'limoneux';
}

function num(val: unknown): number {
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Récupère les données de sol SoilGrids au point (lat, lng) via GEE.
 * Version Vercel : lit la clé depuis GEE_SERVICE_ACCOUNT_JSON (env var).
 */
export async function fetchSoilFromGEE(
  lat: number,
  lng: number
): Promise<GEESoilResult> {
  await ensureEEInitialized();

  const point = ee.Geometry.Point([lng, lat]);

  const ph = ee.Image('projects/soilgrids-isric/phh2o_mean').select(0).rename('ph');
  const clay = ee.Image('projects/soilgrids-isric/clay_mean').select(0).rename('clay');
  const sand = ee.Image('projects/soilgrids-isric/sand_mean').select(0).rename('sand');
  const silt = ee.Image('projects/soilgrids-isric/silt_mean').select(0).rename('silt');
  const soc = ee.Image('projects/soilgrids-isric/soc_mean').select(0).rename('soc');
  const nitrogen = ee.Image('projects/soilgrids-isric/nitrogen_mean').select(0).rename('nitrogen');

  const composite = ph
    .addBands(clay)
    .addBands(sand)
    .addBands(silt)
    .addBands(soc)
    .addBands(nitrogen);

  const reduced = composite.reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: point,
    scale: SCALE_M,
    maxPixels: 1e9,
  });

  return new Promise((resolve) => {
    reduced.evaluate(
      (result: Record<string, unknown> | null, err: string | null) => {
        if (err || !result) {
          console.warn('GEE SoilGrids evaluate error:', err || 'no result');
          resolve(DEFAULT);
          return;
        }
        const phRaw = num(result.ph);
        const clayRaw = num(result.clay);
        const sandRaw = num(result.sand);
        const siltRaw = num(result.silt);
        const socRaw = num(result.soc);
        const nRaw = num(result.nitrogen);

        const phVal = phRaw > 0 ? phRaw / 10 : DEFAULT.ph;
        const clayVal = clayRaw > 0 ? clayRaw / 10 : DEFAULT.clay;
        const sandVal = sandRaw > 0 ? sandRaw / 10 : DEFAULT.sand;
        let siltVal = siltRaw > 0 ? siltRaw / 10 : Math.max(0, Math.min(100, 100 - clayVal - sandVal));
        const socVal = socRaw > 0 ? socRaw / 10 : DEFAULT.organicCarbon;
        const nVal = nRaw > 0 ? nRaw / 100 : DEFAULT.nitrogen;

        resolve({
          ph: phVal,
          clay: clayVal,
          sand: sandVal,
          silt: siltVal,
          organicCarbon: socVal,
          nitrogen: nVal,
          phosphorus: DEFAULT.phosphorus,
          potassium: DEFAULT.potassium,
          texture: textureFromTriangle(sandVal, clayVal, siltVal),
        });
      }
    );
  });
}
