# Configuration Google Earth Engine – SeneGundo

Ce document décrit comment configurer **Google Earth Engine (GEE)** pour les Cloud Functions (diagnostics, SoilGrids, CHIRPS, etc.). L'app mobile **n'appelle pas GEE** directement ; seul le backend (Cloud Functions) l'utilise.

**Pourquoi GEE pour SeneGundo ?** L'API REST SoilGrids (rest.isric.org) est **temporairement suspendue** par l'ISRIC. GEE permet d'accéder aux données **SoilGrids** (sol) et au **climat** (pluie, températures) au même endroit, de façon stable. Voir `docs/APIS_DONNEES.md` pour les alternatives (GEE, WCS).

---

## 1. Prérequis

- Un **projet Google Cloud** (ex. `my-project-agricol`).
- Un **compte de service** avec une **clé JSON** (ex. `agri-73@my-project-agricol.iam.gserviceaccount.com`).
- **Earth Engine API** activée sur le projet.
- Projet **enregistré** pour Earth Engine : [Earth Engine](https://console.cloud.google.com/earth-engine) ou [earthengine.google.com](https://earthengine.google.com/signup/).

---

## 2. Obtenir la clé du compte de service

1. [Cloud Console](https://console.cloud.google.com) → ton projet → **IAM et administration** → **Comptes de service**.
2. Sélectionne le compte (ex. **agri**).
3. **Clés** → **Ajouter une clé** → **Créer une clé** → **JSON**.
4. Télécharge le fichier et place-le **hors du dépôt** (ex. `./keys/gee-sa.json` ou `functions/keys/gee-sa.json`).
5. **Ne jamais** commiter ce fichier. Il est ignoré via `.gitignore` (`*gserviceaccount*.json`, `functions/keys/*.json`, etc.).

### Donner l’accès GEE au compte de service

**Important :** le compte de service doit avoir le droit **« Earth Engine Resource Viewer »** pour interroger GEE.

1. Va dans les paramètres **Google Earth Engine** ( [earthengine.google.com](https://earthengine.google.com) → **Settings** / **User management** si disponible, ou via le [registre GEE](https://signup.earthengine.google.com/) pour les projets).
2. Ajoute l’**email du compte de service** (ex. `agri-73@my-project-agricol.iam.gserviceaccount.com`) avec le rôle **Earth Engine Resource Viewer** (ou équivalent pour les comptes de service).

Sans cette étape, les Cloud Functions qui utilisent GEE échoueront à l’authentification.

---

## 3. Variables d’environnement (backend / Cloud Functions)

Dans le dossier **`functions/`** (Cloud Functions) ou ton backend, configure :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Chemin **absolu** ou **relatif** vers le fichier JSON du compte de service. | `./keys/gee-sa.json` ou `functions/keys/gee-sa.json` |
| `GEE_PROJECT_ID` | ID du projet Google Cloud. | `my-project-agricol` |

Sans `GOOGLE_APPLICATION_CREDENTIALS`, le code utilise par défaut `functions/keys/gee-sa.json`. Tu peux copier ou symlink ta clé depuis `./keys/` vers `functions/keys/`.

Exemple **`.env`** (dans `functions/` ou à la racine) :

```bash
GOOGLE_APPLICATION_CREDENTIALS=./keys/gee-sa.json
GEE_PROJECT_ID=my-project-agricol
```

---

## 4. Installation et code (Cloud Functions)

### Installation

Dans le dossier **`functions/`** :

```bash
cd functions
npm install
```

Les dépendances incluent **`@google/earthengine`** (déjà dans `package.json`). Aucune clé API GEE côté client : on utilise le **compte de service** + **authentification par clé privée**.

### Exemple : récupérer le pH (et le sol) via GEE

La Cloud Function **`getSoilFromGEE`** interroge **SoilGrids** sur GEE pour un point `(lat, lng)` et renvoie pH, clay, sand, silt, carbone organique, azote, texture.

- **Fichiers** : `functions/src/geeSoil.ts` (logique GEE), `functions/src/index.ts` (HTTP).
- **Endpoint** : `GET` ou `POST` avec `?lat=12.63&lng=-7.92` (ou body `{ lat, lng }`).
- **Réponse** : `{ ph, clay, sand, silt, organicCarbon, nitrogen, texture, ... }`.

L’app mobile appelle cette **URL** (Cloud Function déployée) ; elle ne parle jamais directement à GEE.

### Build et déploiement

```bash
cd functions
npm run build
firebase deploy --only functions
```

Pour tester en local : `firebase emulators:start --only functions` (en ayant défini `GOOGLE_APPLICATION_CREDENTIALS` et `GEE_PROJECT_ID`).

---

## 5. Récapitulatif

| Étape | Où / Quoi |
|-------|------------|
| Projet GCP | [Cloud Console](https://console.cloud.google.com) |
| Activer l’API | APIs et services → **Earth Engine API** |
| Enregistrer pour GEE | [Earth Engine](https://console.cloud.google.com/earth-engine) |
| Compte de service + clé JSON | IAM → Comptes de service → **agri** → Clés → JSON |
| Variables d’env | `GOOGLE_APPLICATION_CREDENTIALS`, `GEE_PROJECT_ID` |
| Fichier JSON | Hors dépôt, jamais commité |

---

*Voir aussi : `docs/APIS_DONNEES.md`, `IMPLEMENTATION_PLAN.md`.*
