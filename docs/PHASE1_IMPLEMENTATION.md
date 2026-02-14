# Phase 1 — Renforcer l'existant

Plan d'implémentation du backend central, de la base de données, du cache météo et de l'export PDF.

---

## Objectifs Phase 1

| # | Objectif | Statut |
|---|----------|--------|
| 1 | **Backend central** : API unique sous `/api/v1/` (health, weather, diagnostics, report-pdf) | En cours |
| 2 | **Base de données** : Schéma défini (Users, Fields, Diagnostics, Orders, Products) ; persistance optionnelle (Supabase/PostgreSQL plus tard) | En cours |
| 3 | **Cache météo** : Proxy OpenWeather avec cache mémoire (TTL 10 min) ; Redis possible ensuite | En cours |
| 4 | **Export PDF** : Endpoint `/api/v1/report-pdf` + bouton dans l’app (partage/sauvegarde) | Fait |

---

## Structure API (Vercel Serverless)

```
api/
├── lib/
│   └── cors.ts          # CORS commun
├── types/
│   └── db.ts            # Types partagés (Diagnostic, Field, User, Order)
├── v1/
│   ├── health.ts         # GET  /api/v1/health
│   ├── weather.ts       # GET  /api/v1/weather?lat=&lng=  (proxy + cache)
│   ├── diagnostics.ts   # POST /api/v1/diagnostics  GET /api/v1/diagnostics?id=
│   └── report-pdf.ts    # POST /api/v1/report-pdf   (body: rapport JSON)
├── getSoilFromGEE.ts    # Existant
└── ...
```

---

## Configuration

### Vercel (backend)
- Variables d'environnement à définir dans le projet Vercel :
  - `OPENWEATHER_API_KEY` : clé OpenWeather (déjà utilisée en app)
  - Optionnel : `REDIS_URL` pour cache météo (sinon cache mémoire)

### App mobile
- Dans `.env` : `API_URL=https://ton-projet.vercel.app` (ou l’URL de l’API).
- L’app utilisera `API_URL` pour les appels à `/api/v1/*`.

---

## Base de données (référence)

Le fichier `docs/DB_SCHEMA.sql` décrit les tables **Users**, **Fields**, **Diagnostics**, **Orders**, **Products**. En Phase 1, les diagnostics peuvent être stockés en mémoire (store volatil) ; la persistance PostgreSQL/Supabase pourra être branchée ensuite.

---

## Prochaines étapes

1. [x] Plan + structure d’API
2. [ ] Brancher l’app sur `API_URL` pour météo (optionnel : garder appel direct OpenWeather tant que le proxy n’est pas déployé)
3. [x] Implémenter l’export PDF (pdfkit dans `api/v1/report-pdf.ts` + bouton « Exporter en PDF » sur Rapport de parcelle)
4. [ ] Connecter une base réelle (Supabase ou PostgreSQL) et remplacer le store mémoire des diagnostics
