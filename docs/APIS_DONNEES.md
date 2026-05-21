# APIs Données – SeneGundo

Référence des services de **données sols**, **environnement**, **météo** et **climat** utilisés ou prévus pour les diagnostics agricoles.

---

## 1. Données sols et environnement (gratuit / open data)

Ces services sont souvent **Open Access**. Pas de clé API obligatoire pour un usage modéré, mais **inscription conseillée** pour des volumes importants.

### ISRIC SoilGrids

| | |
|-|-|
| **Site / doc** | https://www.isric.org/explore/soilgrids/faq-soilgrids |
| **Usage dans l’app** | `src/services/agronomy/soilService.ts` |
| **Données** | pH, carbone organique, azote, phosphore, potassium, texture (argile, sable, limon), etc. |
| **Licence** | CC BY 4.0 (données environnementales en accès public). |

#### ⚠️ API REST : temporairement suspendue

L'ISRIC a **mis en pause le service REST** (rest.isric.org) pour une durée indéterminée (*"temporarily pause the service"*). **Fair Use** (quand rétabli) : 5 req/min, pas de clé. Ne pas perdre de temps à appeler l'URL tant que la suspension n'est pas levée. **Alternatives :** **Google Earth Engine** (recommandé – sol + climat, voir `docs/EARTH_ENGINE_SETUP.md`) ou **WCS** ([maps.isric.org](https://maps.isric.org)).

#### Usage dans l'app

`soilService.fetchSoilData(lat, lng)` : tant que le REST est suspendu, **aucun appel direct** à rest.isric.org. Réactiver (`SOILGRIDS_REST_AVAILABLE`) si l'ISRIC rétablit le service.

### iSDAsoil (recommandé — Afrique, 30 m)

| | |
|-|-|
| **Site / doc** | https://api.isda-africa.com — voir `cahier_de_api.md` |
| **Inscription** | Compte gratuit (email + mot de passe) → JWT via `POST /isdasoil/v2/login` |
| **Usage** | Proxy Vercel `GET /api/getSoilFromISDA?lat=&lng=` → `functions/src/isdaSoilVercel.ts` |
| **App** | `soilService.ts` appelle ce endpoint en **priorité**, puis GEE en secours |
| **Données** | pH, argile/sable/limon, C organique, N, P, K, etc. (profondeur `0-20`) |
| **Licence** | CC BY 4.0 |
| **Env Vercel** | `ISDA_USERNAME`, `ISDA_PASSWORD` (jamais dans l'app mobile) |

Mapping des propriétés API : `src/services/agronomy/isdasoil.ts` (`clay_content`, `phosphorous_extractable`, …).

**JWT** : cache 55 min + re-login automatique si `soilproperty` renvoie 401 (même logique sur Vercel et app).

**Unités conservées telles quelles** : `nitrogen_total` → `SoilData.nitrogen` en **g/kg** (pas de `/100` comme GEE SoilGrids). `carbon_organic` → `organicCarbon` en **g/kg**.

#### Tester en local (avant Vercel)

1. Créer un compte sur https://api.isda-africa.com et ajouter dans **`AgriMaliApp/.env.local`** (ne pas commiter) :
   ```
   ISDA_USERNAME=votre_email@example.com
   ISDA_PASSWORD=votre_mot_de_passe
   ```

2. **Test direct** (appelle l’API iSDA, sans serveur Vercel) :
   ```bash
   cd AgriMaliApp
   npm run test:isda
   # autre point : npm run test:isda -- 12.64 -8.00
   ```
   Réponse attendue : JSON avec `ph`, `clay`, `sand`, `texture`, etc.

3. **Test comme en production** (route `/api/getSoilFromISDA` en local) :
   ```bash
   cd AgriMaliApp
   npm run api:dev
   ```
   Puis dans un autre terminal :
   ```bash
   curl "http://localhost:3000/api/getSoilFromISDA?lat=12.64&lng=-8.00"
   ```

4. Pour l’app Expo en local, pointer vers l’API locale dans `.env.local` :
   ```
   API_URL=http://localhost:3000
   ```
   (sur simulateur iOS, parfois `http://127.0.0.1:3000` ; sur appareil physique, utiliser l’IP du Mac, ex. `http://192.168.1.x:3000`.)

### NASA POWER API

| | |
|-|-|
| **Site / doc** | [power.larc.nasa.gov/docs/services/api/](https://power.larc.nasa.gov/docs/services/api/) |
| **Usage dans l’app** | `src/services/agronomy/climateService.ts` |
| **Données** | Ensoleillement, humidité du sol, températures, précipitations, degrés-jours, etc. |
| **Accès** | Gratuit, **sans clé API**. Service officiel NASA (LARC). |

API REST « Analysis Ready Data » (ARD) : microservices **Temporal**, **Application**, **System**.

#### Types d’APIs

| Catégorie | Description |
|-----------|-------------|
| **Temporal** | Données par pas de temps : [Hourly](https://power.larc.nasa.gov/docs/services/api/temporal/hourly/), [Daily](https://power.larc.nasa.gov/docs/services/api/temporal/daily/), Climatology. |
| **Application** | Rapports et validations (s’appuient sur les APIs Temporal). |
| **System** | Configuration (paramètres, formats, etc.). |

#### API Daily (point) – utilisée par `climateService`

- **Endpoint** : `GET /api/temporal/daily/point`
- **Paramètres** : `parameters` (liste séparée par des virgules), `community`, `latitude`, `longitude`, `start`, `end`, `format`, etc.
- **`community`** : `AG` (agroclimatologie), `SB` (bâtiments durables), `RE` (énergie renouvelable). Pour SeneGundo utiliser **`AG`**.
- **`start` / `end`** : `YYYYMMDD` (ex. `20170101`, `20170201`). Données de 1981/01/01 à quasi temps réel.
- **Format** : `JSON`, `CSV`, `ASCII`, `NetCDF`. ICASA réservé à la communauté AG.
- **Limites** : max **20 paramètres** par requête point ; une requête par cellule de grille 0,5°×0,5° pour éviter blocage.

#### Réponses HTTP

| Code | Signification |
|------|----------------|
| **200** | Succès. |
| **422** | Erreur de validation (paramètres invalides). |
| **429** | Trop de requêtes (rate limiting). Réessayer plus tard. |
| **500** / **503** | Erreur serveur / service indisponible. |

En cas de **429**, contacter `larc-power-project@mail.nasa.gov` si le blocage persiste.

#### Exemple de requête (Daily, AG, JSON)

```
GET /api/temporal/daily/point?parameters=PRECTOTCORR,T2M,T2M_MAX,T2M_MIN&community=AG&latitude=12.64&longitude=-8&start=20200101&end=20241231&format=JSON
```

### Google Earth Engine

| | |
|-|-|
| **Inscription** | https://earthengine.google.com/signup/ |
| **Usage prévu** | Données massives (ex. **CHIRPS** pour pluviométrie historique, **SoilGrids**, imagerie satellite). |
| **Accès** | Compte de service GCP + clé JSON. **Backend / Cloud Functions uniquement.** |
| **Configuration** | Voir **`docs/EARTH_ENGINE_SETUP.md`** (projet, IAM, `GOOGLE_APPLICATION_CREDENTIALS`, `GEE_PROJECT_ID`). |

---

## 2. Météo et climat (modèle freemium)

Ces APIs nécessitent une **clé API** pour suivre la consommation.

### OpenWeatherMap

| | |
|-|-|
| **Inscription** | https://home.openweathermap.org/users/sign_up |
| **Usage dans l’app** | `src/services/weather/openWeatherService.ts` → `fetchCurrentWeather(lat, lng)` |
| **Données** | Météo actuelle : temp, humidité, pression, description, vent. Unité métrique (°C, m/s). |
| **Plans** | Gratuit suffisant pour tests. **One Call** le plus complet pour l’historique. |
| **Configuration** | Clé dans `.env` : `OPENWEATHER_API_KEY=ta_cle`. Optionnel ; si absente, le service retourne `null`. |

### Frogcast

| | |
|-|-|
| **Site** | https://frogcast.com/ |
| **Usage prévu** | Agri‑météo de précision (prévisions agricoles). |
| **Accès** | Modèle freemium, clé API selon offre. |

---

## 3. Récapitulatif

| Service | Type | Clé API | Utilisation actuelle |
|--------|------|---------|----------------------|
| **iSDAsoil** | Open data (CC BY 4.0) | Oui (compte gratuit) | ✅ `/api/getSoilFromISDA` (priorité sol) |
| **ISRIC SoilGrids** | Open data (CC BY 4.0) | Non | ⏸ REST suspendu ; secours GEE |
| **NASA POWER** | Gratuit | Non | ✅ `climateService` |
| **Google Earth Engine** | Inscription | Oui (compte GEE) | ✅ `/api/getSoilFromGEE` (secours sol) |
| **OpenWeatherMap** | Freemium | Oui | ✅ `openWeatherService` (météo actuelle, si clé définie) |
| **Frogcast** | Freemium | Oui | ❌ Optionnel |

---

## 4. Bonnes pratiques

- **Cloud Functions** : faire passer les appels SoilGrids, NASA POWER (et futurs Earth Engine / OpenWeatherMap) par des Cloud Functions pour :
  - protéger d’éventuelles clés ;
  - réduire la consommation données mobiles ;
  - centraliser la logique et le cache.
- **Limites** : respecter les quotas et bonnes pratiques de chaque API (voir docs officielles).
- **Données Mali** : SoilGrids et NASA POWER couvrent le Mali ; Earth Engine utile pour CHIRPS et séries longues.

---

*Voir aussi : `IMPLEMENTATION_PLAN.md` (§ Configuration des APIs externes).*
