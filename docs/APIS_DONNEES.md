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

`soilService.fetchSoilData(lat, lng)` : tant que le REST est suspendu, **aucun appel réseau** ; retour immédiat des valeurs par défaut. Réactiver (flag `SOILGRIDS_REST_AVAILABLE`) quand l'ISRIC rétablit le service, ou basculer sur GEE.

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
| **ISRIC SoilGrids** | Open data (CC BY 4.0) | Non | ✅ `soilService` (REST **suspendu** → fallback ; alternatives GEE / WCS) |
| **NASA POWER** | Gratuit | Non | ✅ `climateService` |
| **Google Earth Engine** | Inscription | Oui (compte GEE) | ❌ À intégrer |
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
