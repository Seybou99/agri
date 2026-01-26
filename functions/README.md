# Cloud Functions SeneGundo

- **getSoilFromGEE** : données sol (SoilGrids) via Google Earth Engine pour un point `(lat, lng)`.

## Setup

```bash
npm install
cp ../.env.example .env   # ou définir GOOGLE_APPLICATION_CREDENTIALS, GEE_PROJECT_ID
# Placer la clé JSON dans keys/gee-sa.json (ou chemin dans .env)
npm run build
```

## Déploiement

```bash
firebase deploy --only functions
```

## Test local

```bash
firebase emulators:start --only functions
# Puis GET https://localhostée.../getSoilFromGEE?lat=12.63&lng=-7.92
```

Voir **`docs/EARTH_ENGINE_SETUP.md`** pour la config GEE (compte de service, Earth Engine Resource Viewer).
