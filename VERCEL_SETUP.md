# Déploiement Vercel – Google Earth Engine

Guide pour déployer la fonction `getSoilFromGEE` sur Vercel (100% gratuit).

---

## Prérequis

1. **Compte Vercel** : [vercel.com](https://vercel.com) (gratuit)
2. **Clé GEE** : `keys/gee-sa.json` (compte de service avec Earth Engine Resource Viewer)
3. **Node.js** : installé localement

---

## 1. Installer Vercel CLI

```bash
npm install -g vercel
```

Ou avec npm local :
```bash
npx vercel
```

---

## 2. Préparer la clé GEE pour Vercel

Vercel stocke les variables d'environnement comme des strings. Tu dois convertir ton fichier JSON en une seule ligne.

### Option A : Script Node.js (recommandé)

Crée `scripts/prepare-vercel-env.js` :

```javascript
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '..', 'keys', 'gee-sa.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

console.log('\n=== GEE_SERVICE_ACCOUNT_JSON ===');
console.log(JSON.stringify(key));
console.log('\nCopie cette ligne complète dans Vercel.\n');
```

Exécute :
```bash
node scripts/prepare-vercel-env.js
```

### Option B : Manuel

1. Ouvre `keys/gee-sa.json`
2. Copie tout le contenu (une seule ligne, sans retours à la ligne)
3. Colle-le dans Vercel comme variable `GEE_SERVICE_ACCOUNT_JSON`

---

## 3. Déployer sur Vercel

### Première fois (setup)

```bash
cd "/Users/doumbia/Desktop/Agri mali/AgriMaliApp"
vercel
```

Suis les instructions :
- **Set up and deploy?** → `Y`
- **Which scope?** → Ton compte
- **Link to existing project?** → `N` (nouveau projet)
- **Project name?** → `agrimali-app` (ou autre)
- **Directory?** → `.` (racine)
- **Override settings?** → `N`

### Configurer les variables d'environnement

Après le premier déploiement, configure les secrets :

```bash
# Option 1 : Via CLI
vercel env add GEE_SERVICE_ACCOUNT_JSON
# Colle le JSON complet (une ligne)
# Environment: Production, Preview, Development → sélectionne tous

vercel env add GEE_PROJECT_ID
# my-project-agricol
# Environment: Production, Preview, Development → sélectionne tous
```

**Option 2 : Via Dashboard Vercel**

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet
3. **Settings** → **Environment Variables**
4. Ajoute :
   - `GEE_SERVICE_ACCOUNT_JSON` = contenu JSON complet (une ligne)
   - `GEE_PROJECT_ID` = `my-project-agricol`
5. Coche **Production**, **Preview**, **Development**

### Redéployer

```bash
vercel --prod
```

---

## 4. Tester l'endpoint

Après le déploiement, Vercel te donne une URL comme :
```
https://agrimali-app.vercel.app/api/getSoilFromGEE
```

Teste avec :
```bash
curl "https://agrimali-app.vercel.app/api/getSoilFromGEE?lat=12.63&lng=-7.92"
```

Ou dans le navigateur :
```
https://agrimali-app.vercel.app/api/getSoilFromGEE?lat=12.63&lng=-7.92
```

Réponse attendue :
```json
{
  "ph": 6.5,
  "clay": 20,
  "sand": 40,
  "silt": 40,
  "organicCarbon": 1.0,
  "nitrogen": 0.5,
  "phosphorus": 10,
  "potassium": 0.2,
  "texture": "limoneux"
}
```

---

## 5. Utiliser dans l'app mobile

Dans `src/services/agronomy/soilService.ts`, remplace l'appel REST par :

```typescript
const VERCEL_API_URL = 'https://agrimali-app.vercel.app/api/getSoilFromGEE';

export async function fetchSoilData(lat: number, lng: number): Promise<SoilData> {
  try {
    const response = await fetch(`${VERCEL_API_URL}?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geeResult = await response.json();
    
    // Convertir GEESoilResult → SoilData
    return {
      ph: geeResult.ph,
      texture: geeResult.texture,
      organicCarbon: geeResult.organicCarbon,
      nitrogen: geeResult.nitrogen,
      phosphorus: geeResult.phosphorus,
      potassium: geeResult.potassium,
      clay: geeResult.clay,
      sand: geeResult.sand,
      silt: geeResult.silt,
    };
  } catch (e) {
    console.warn('GEE Vercel error:', e);
    return DEFAULT_SOIL;
  }
}
```

Ou crée une variable d'environnement `VERCEL_API_URL` dans `.env`.

---

## 6. Limites Vercel (gratuit)

- **100 GB-heures/mois** de calcul
- **1000 invocations/jour** (environ 30K/mois)
- **10 secondes max** par fonction (suffisant pour GEE)
- **100 MB** max par variable d'environnement (le JSON GEE fait ~2KB, OK)

**Pour SeneGundo** : ~100 diagnostics/jour = 3000/mois → largement dans le gratuit.

---

## 7. Déploiement automatique (Git)

Vercel peut déployer automatiquement à chaque push Git :

1. **Vercel Dashboard** → Projet → **Settings** → **Git**
2. Connecte ton repo GitHub/GitLab/Bitbucket
3. Chaque push sur `main` → déploiement automatique

---

## Troubleshooting

### Erreur "GEE_SERVICE_ACCOUNT_JSON non défini"
- Vérifie que la variable est définie dans Vercel Dashboard
- Redéploie : `vercel --prod`

### Erreur "GEE authenticate"
- Vérifie que le compte de service a le rôle **Earth Engine Resource Viewer**
- Vérifie que `GEE_PROJECT_ID` est correct

### Timeout (>10s)
- GEE peut être lent. Vercel limite à 10s (gratuit).
- Si besoin, upgrade vers Vercel Pro (20s max).

### CORS
- Déjà géré dans `api/getSoilFromGEE.ts` (Access-Control-Allow-Origin: *)

---

## Structure des fichiers

```
AgriMaliApp/
├── api/
│   └── getSoilFromGEE.ts          # Handler Vercel
├── functions/
│   └── src/
│       ├── geeSoilVercel.ts        # Logique GEE (version Vercel)
│       └── geeSoil.ts              # Version Firebase (originale)
├── vercel.json                     # Config Vercel
└── package.json                    # Dépendances (@google/earthengine, @vercel/node)
```

---

**Note** : Les deux versions (`geeSoil.ts` pour Firebase, `geeSoilVercel.ts` pour Vercel) coexistent. Vercel utilise `geeSoilVercel.ts` qui lit la clé depuis les variables d'environnement.
