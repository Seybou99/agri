# Alternatives gratuites à Firebase Functions pour GEE

## Pourquoi un backend est nécessaire ?

**Google Earth Engine nécessite une authentification par compte de service** (clé privée JSON). Cette clé **ne peut jamais** être exposée dans l'app mobile (risque de sécurité majeur). Un backend est donc obligatoire pour GEE.

---

## Option 1 : Firebase Blaze (recommandé) ⭐

### Avantages
- **Free tier généreux** : 2M invocations/mois gratuites
- Intégration native avec Firebase
- Pas de changement de code nécessaire

### Free tier Firebase Functions
- **2M invocations/mois** gratuites
- **400K GB-sec** de calcul gratuit
- **200K CPU-sec** gratuit
- **5 GB** de stockage gratuit

**Pour SeneGundo** : Si tu fais ~100 diagnostics/jour = 3000/mois, tu restes largement dans le gratuit.

### Coût réel
- **0€** tant que tu restes dans le free tier
- Payant uniquement si tu dépasses (rare pour un MVP)

### Activer Blaze
1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Projet → **Upgrade to Blaze Plan**
3. C'est gratuit tant que tu restes dans les limites

---

## Option 2 : Vercel (100% gratuit) 🚀

### Avantages
- **100% gratuit** pour projets personnels
- Déploiement très simple (Git push)
- 100 GB-heures/mois, 1000 invocations/jour

### Limites
- 10 secondes max par fonction (suffisant pour GEE)
- Pas de variables d'environnement persistantes (utiliser Vercel Secrets)

### Setup Vercel

#### 1. Créer `api/getSoilFromGEE.ts` à la racine du projet

```typescript
// api/getSoilFromGEE.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchSoilFromGEE } from '../functions/src/geeSoil';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const lat = parseFloat((req.query.lat || req.body?.lat) as string);
  const lng = parseFloat((req.query.lng || req.body?.lng) as string);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'lat et lng requis' });
  }

  try {
    const soil = await fetchSoilFromGEE(lat, lng);
    res.status(200).json(soil);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
}
```

#### 2. Installer Vercel CLI

```bash
npm install -g vercel
```

#### 3. Déployer

```bash
vercel
```

#### 4. Configurer les secrets (clé GEE)

```bash
vercel env add GOOGLE_APPLICATION_CREDENTIALS
# Colle le contenu JSON de la clé (ou utilise un chemin Cloud Storage)

vercel env add GEE_PROJECT_ID
# my-project-agricol
```

**Note** : Pour la clé JSON, tu peux soit :
- Stocker le JSON complet dans une variable d'env (limité en taille)
- Utiliser Google Cloud Secret Manager et référencer le secret
- Stocker la clé dans Vercel Blob Storage et lire depuis la fonction

---

## Option 3 : Netlify Functions (gratuit)

### Avantages
- 125K invocations/mois gratuites
- Déploiement simple (Git)

### Setup

1. Créer `netlify/functions/getSoilFromGEE.ts`
2. Déployer via Git ou Netlify CLI
3. Configurer les variables d'environnement dans Netlify Dashboard

---

## Option 4 : Cloudflare Workers (gratuit, mais limité)

### Limites
- Pas d'accès au système de fichiers
- Nécessite de stocker la clé GEE dans Cloudflare KV ou Secrets
- 100K requêtes/jour gratuit

### Adaptations nécessaires
- Modifier `geeSoil.ts` pour lire la clé depuis Cloudflare Secrets au lieu de `fs.readFileSync`

---

## Comparaison rapide

| Solution | Gratuit | Limites | Difficulté |
|----------|---------|---------|------------|
| **Firebase Blaze** | ✅ Free tier | 2M invocations/mois | ⭐ Facile |
| **Vercel** | ✅ 100% gratuit | 1000 invocations/jour | ⭐⭐ Moyen |
| **Netlify** | ✅ Free tier | 125K invocations/mois | ⭐⭐ Moyen |
| **Cloudflare** | ✅ Free tier | 100K requêtes/jour | ⭐⭐⭐ Complexe |

---

## Recommandation

**Pour un MVP / développement** : **Firebase Blaze** (free tier suffisant, code déjà prêt)

**Si tu veux éviter Firebase** : **Vercel** (gratuit, simple, mais nécessite quelques adaptations)

---

## Code actuel

Le code dans `functions/src/` fonctionne avec Firebase Functions. Pour Vercel/Netlify, il faut :
1. Adapter le point d'entrée (handler HTTP)
2. Adapter la lecture de la clé (variables d'env au lieu de fichier)

Veux-tu que je crée la version Vercel ?
